import { useRef, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

type RecordingState = "idle" | "recording" | "processing" | "done" | "error";

const EDGE_FUNCTION_URL =
  "https://vpditxpomxixcijriyzg.supabase.co/functions/v1/speechmatics-token";
const WS_BASE = "wss://eu.rt.speechmatics.com/v2";
const TARGET_SAMPLE_RATE = 16000;

export interface UseSpeechmaticsReturn {
  state: RecordingState;
  partialText: string;
  finalText: string;
  error: string;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  reset: () => void;
}

export function useSpeechmatics(): UseSpeechmaticsReturn {
  const [state, setState] = useState<RecordingState>("idle");
  const [partialText, setPartialText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [error, setError] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const stateRef = useRef<RecordingState>("idle");

  // Accumulate final transcript fragments as they come in
  const transcriptAccRef = useRef("");
  useEffect(() => { stateRef.current = state; }, [state]);

  const cleanup = useCallback(() => {
    // Close WebSocket
    if (wsRef.current) {
      const ws = wsRef.current;
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        try {
          ws.close();
        } catch {
          // ignore close errors
        }
      }
      wsRef.current = null;
    }

    // Disconnect audio processing
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

    // Stop microphone
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Close AudioContext
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    setState("idle");
    setPartialText("");
    setFinalText("");
    setError("");
    transcriptAccRef.current = "";

    try {
      // 1. Get token from Edge Function
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

      // 2. Open WebSocket
      const ws = new WebSocket(`${WS_BASE}?jwt=${token}`);
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;

      // Wait for the socket to open before sending the mic stream
      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => resolve();
        ws.onerror = () => reject(new Error("WebSocket connection failed"));
      });

      // 3. Capture microphone
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
        ws.close();
        wsRef.current = null;
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

      // If actual sample rate differs, we still send at whatever rate the context
      // is running. Speechmatics accepts this as long as StartRecognition matches.
      const actualSampleRate = audioContext.sampleRate;

      const source = audioContext.createMediaStreamSource(mediaStream);
      sourceRef.current = source;

      // ScriptProcessorNode for PCM conversion
      const bufferSize = 4096;
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0); // Float32Array
        const pcm16 = float32ToPcm16(inputData);

        try {
          wsRef.current!.send(pcm16.buffer);
        } catch {
          // ignore send errors (socket may be closing)
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      // 4. Send StartRecognition
      const startMsg = {
        message: "StartRecognition",
        audio_format: {
          type: "raw",
          encoding: "pcm_s16le",
          sample_rate: actualSampleRate,
        },
        transcription_config: {
          language: "en",
          max_delay: 2,
          enable_partials: true,
        },
      };
      ws.send(JSON.stringify(startMsg));

      // 5. Handle incoming messages
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string);

          if (msg.message === "AddPartialTranscript") {
            const text = msg.metadata?.transcript ?? "";
            setPartialText(text);
          } else if (msg.message === "AddTranscript") {
            const text = msg.metadata?.transcript ?? "";
            if (text) {
              transcriptAccRef.current +=
                (transcriptAccRef.current ? " " : "") + text;
              setFinalText(transcriptAccRef.current);
              setPartialText("");
            }
          } else if (msg.message === "EndOfTranscript") {
            setState("done");
          }
        } catch {
          // ignore non-JSON messages (binary acks, etc.)
        }
      };

      ws.onerror = () => {
        if (stateRef.current !== "done") {
          setError("Connection lost. Tap to retry.");
          setState("error");
          cleanup();
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        // If we didn't end normally, transition to done (or error already set)
      };

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

    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ message: "EndOfStream" }));
      } catch {
        // ignore
      }
    }
    // Don't close the socket yet — we need to wait for EndOfTranscript
    // Speechmatics will close it after sending EndOfTranscript.
    // But we set a safety timeout:
    setTimeout(() => {
      if (wsRef.current) {
        cleanup();
        if (transcriptAccRef.current) {
          setState("done");
        } else {
          setError("Transcription timed out. Please try again.");
          setState("error");
        }
      }
    }, 8000);

    // Stop the mic track so the user sees it's done
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

/** Convert Float32Array samples to Int16 PCM little-endian */
function float32ToPcm16(float32: Float32Array): Int16Array {
  const len = float32.length;
  const pcm16 = new Int16Array(len);
  for (let i = 0; i < len; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return pcm16;
}
