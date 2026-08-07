import { useRef, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { RealtimeClient } from "@speechmatics/real-time-client";

type RecordingState = "idle" | "recording" | "processing" | "done" | "error";

const EDGE_FUNCTION_URL =
  "https://vpditxpomxixcijriyzg.supabase.co/functions/v1/speechmatics-token";
const TARGET_SAMPLE_RATE = 16000;

export type SpeechLanguage =
  | "en"
  | "es"
  | "es-bilingual"
  | "pt"
  | "fr"
  | "de"
  | "it"
  | "ja"
  | "cmn";

/**
 * Maps a UI selector value to the Speechmatics transcription config.
 * The Spanish-English bilingual pack requires `domain: "bilingual-en"`.
 * Validated against https://docs.speechmatics.com/speech-to-text/languages
 */
const LANGUAGE_CONFIG: Record<
  SpeechLanguage,
  { language: string; domain?: string }
> = {
  en: { language: "en" },
  es: { language: "es" },
  "es-bilingual": { language: "es", domain: "bilingual-en" },
  pt: { language: "pt" },
  fr: { language: "fr" },
  de: { language: "de" },
  it: { language: "it" },
  ja: { language: "ja" },
  cmn: { language: "cmn" },
};

export interface UseSpeechmaticsReturn {
  state: RecordingState;
  partialText: string;
  finalText: string;
  error: string;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  reset: () => void;
}

export function useSpeechmatics(
  language: SpeechLanguage = "en",
): UseSpeechmaticsReturn {
  const [state, setState] = useState<RecordingState>("idle");
  const [partialText, setPartialText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [error, setError] = useState("");

  const clientRef = useRef<RealtimeClient | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<AudioWorkletNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const stateRef = useRef<RecordingState>("idle");
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const transcriptAccRef = useRef("");
  useEffect(() => { stateRef.current = state; }, [state]);

  const cleanup = useCallback(() => {
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }

    if (clientRef.current) {
      const wsState = clientRef.current.socketState;
      if (wsState !== "closing" && wsState !== "closed") {
        try {
          clientRef.current.stopRecognition();
        } catch {
          // ignore close errors
        }
      }
      clientRef.current = null;
    }

    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {
        // ignore
      }
      processorRef.current = null;
    }
    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch {
        // ignore
      }
      sourceRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }

    setState("idle");
    setPartialText("");
    setFinalText("");
    setError("");
    transcriptAccRef.current = "";

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("You must be signed in to record.");
        setState("error");
        return;
      }

      const tokenRes = await fetch(EDGE_FUNCTION_URL, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!tokenRes.ok) {
        const msg = await tokenRes.text();
        setError(`Could not start recording: ${msg || "token request failed"}`);
        setState("error");
        return;
      }

      const { token } = await tokenRes.json();
      if (!token) {
        setError("Could not start recording: no token returned");
        setState("error");
        return;
      }

      const client = new RealtimeClient();
      clientRef.current = client;

      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: { ideal: TARGET_SAMPLE_RATE },
            channelCount: { ideal: 1 },
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
      } catch (micErr) {
        client.stopRecognition();
        clientRef.current = null;
        if (
          micErr instanceof DOMException &&
          micErr.name === "NotAllowedError"
        ) {
          setError(
            "Microphone access denied. Please allow mic access in your browser settings and try again.",
          );
        } else {
          setError(
            "Could not access your microphone. Please check your device and try again.",
          );
        }
        setState("error");
        return;
      }

      streamRef.current = mediaStream;

      const audioContext = new AudioContext({ sampleRate: TARGET_SAMPLE_RATE });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(mediaStream);
      sourceRef.current = source;

      await audioContext.audioWorklet.addModule("/audio-processor.js");

      const workletNode = new AudioWorkletNode(audioContext, "pcm-capture-processor", {
        numberOfInputs: 1,
        numberOfOutputs: 0,
        channelCount: 1,
      });
      processorRef.current = workletNode;

      workletNode.port.onmessage = (e) => {
        const inputData = e.data as Float32Array;
        const pcm16 = float32ToPcm16(inputData);
        try {
          client.sendAudio(pcm16.buffer as ArrayBuffer);
        } catch {
          // ignore send errors
        }
      };

      source.connect(workletNode);

      client.start(token, {
        audio_format: {
          type: "raw",
          encoding: "pcm_s16le",
          sample_rate: TARGET_SAMPLE_RATE,
        },
        transcription_config: {
          ...LANGUAGE_CONFIG[language],
          model: "enhanced",
          enable_partials: true,
        },
      });

      client.addEventListener("receiveMessage", ({ data }) => {
        if (data.message === "AddPartialTranscript") {
          const text = data.results
            .map((r: any) => r.alternatives?.[0]?.content ?? "")
            .join(" ");
          setPartialText(text);
        } else if (data.message === "AddTranscript") {
          const text = data.results
            .map((r: any) => r.alternatives?.[0]?.content ?? "")
            .join(" ");
          if (text) {
            transcriptAccRef.current +=
              (transcriptAccRef.current ? " " : "") + text;
            setFinalText(transcriptAccRef.current);
            setPartialText("");
          }
        } else if (data.message === "EndOfTranscript") {
          setState("done");
        } else if (data.message === "Error") {
          if (stateRef.current !== "done") {
            setError(`Connection error: ${data.reason || "Unknown error"}`);
            setState("error");
            cleanup();
          }
        }
      });

      setState("recording");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      setState("error");
      cleanup();
    }
  }, [cleanup]);

  const stopRecording = useCallback(() => {
    setState("processing");
    setPartialText("");

    if (clientRef.current) {
      try {
        clientRef.current.stopRecognition();
      } catch {
        // ignore
      }
    }

    stopTimeoutRef.current = setTimeout(() => {
      if (clientRef.current) {
        cleanup();
        if (stateRef.current === "processing") {
          if (transcriptAccRef.current) {
            setState("done");
          } else {
            setError("Transcription timed out. Please try again.");
            setState("error");
          }
        }
      }
    }, 8000);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch {
        // ignore
      }
      sourceRef.current = null;
    }
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {
        // ignore
      }
      processorRef.current = null;
    }
  }, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    setState("idle");
    setPartialText("");
    setFinalText("");
    setError("");
    transcriptAccRef.current = "";
  }, [cleanup]);

  return {
    state,
    partialText,
    finalText,
    error,
    startRecording,
    stopRecording,
    reset,
  };
}

function float32ToPcm16(float32: Float32Array): Int16Array {
  const len = float32.length;
  const pcm16 = new Int16Array(len);
  for (let i = 0; i < len; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return pcm16;
}
