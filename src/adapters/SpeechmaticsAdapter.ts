import { supabase } from "../lib/supabase";
import type { STTAdapter, RTVIEventMap, RTVIEventType } from "../types/rtvi";

type Handler<T extends RTVIEventType> = (data: RTVIEventMap[T]) => void;

export class SpeechmaticsAdapter implements STTAdapter {
  private handlers: Map<RTVIEventType, Set<Handler<any>>> = new Map();
  private ws: WebSocket | null = null;
  private currentMessageId: string | null = null;

  onEvent<T extends RTVIEventType>(type: T, handler: Handler<T>) {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
  }

  private emit<T extends RTVIEventType>(type: T, data: RTVIEventMap[T]) {
    this.handlers.get(type)?.forEach((h) => h(data));
  }

  async start(language: string) {
    this.currentMessageId = crypto.randomUUID();

    const token = await this.getToken();
    if (!token) {
      this.emit("error", { message: "Failed to get Speechmatics token", code: "AUTH" });
      return;
    }

    const wsUrl = `wss://eu2.rt.speechmatics.com/v2/${language}?jwt=${encodeURIComponent(token)}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.ws?.send(JSON.stringify({
        message: "StartRecognition",
        audio_format: { type: "raw", encoding: "pcm_s16le", sample_rate: 16000 },
        transcription_config: {
          language,
          enable_partials: true,
          max_delay: 0.7,
        },
      }));
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.message === "AddPartialTranscript") {
        const text = this.joinTranscript(data);
        this.emit("user-transcript-partial", { text, messageId: this.currentMessageId! });
      } else if (data.message === "AddTranscript") {
        const text = this.joinTranscript(data);
        this.emit("user-transcript-final", { text, messageId: this.currentMessageId! });
      } else if (data.message === "EndOfTranscript") {
        this.stop();
      } else if (data.message === "Error") {
        this.emit("error", { message: data.reason || "Speechmatics error", code: "STT" });
      }
    };

    this.ws.onerror = () => {
      this.emit("error", { message: "WebSocket connection error", code: "WS_ERROR" });
    };

    await this.startAudioCapture();
  }

  private async getToken(): Promise<string | null> {
    try {
      const edgeFunctionUrl = "https://vpditxpomxixcijriyzg.supabase.co/functions/v1/speechmatics-token";
      const response = await fetch(edgeFunctionUrl, {
        headers: { Authorization: `Bearer ${await this.getSupabaseToken()}` },
      });
      if (!response.ok) return null;
      const { token } = await response.json();
      return token;
    } catch {
      return null;
    }
  }

  private async getSupabaseToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? "";
  }

  private async startAudioCapture() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: { ideal: 16000 },
          channelCount: { ideal: 1 },
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      const audioContext = new AudioContext({ sampleRate: 16000 });
      await audioContext.resume();
      const source = audioContext.createMediaStreamSource(stream);

      await audioContext.audioWorklet.addModule('/pcm-capture-worklet.js');

      const workletNode = new AudioWorkletNode(audioContext, 'pcm-capture-processor', {
        numberOfInputs: 1,
        numberOfOutputs: 0,
        channelCount: 1,
      });

      workletNode.port.onmessage = (e: MessageEvent) => {
        const pcm16 = e.data as Int16Array;
        if (this.ws?.readyState === WebSocket.OPEN) {
          try {
            this.ws.send(pcm16.buffer as ArrayBuffer);
          } catch {
            // ignore send errors
          }
        }
      };

      source.connect(workletNode);
    } catch {
      this.emit('error', { message: 'Microphone access denied', code: 'MIC' });
    }
  }

  private joinTranscript(data: any): string {
    const parts: string[] = [];
    for (const result of data.results || []) {
      const content = result.alternatives?.[0]?.content ?? "";
      if (content) parts.push(content);
    }
    return parts.join(" ");
  }

  stop() {
    if (this.ws) {
      try {
        this.ws.send(JSON.stringify({ message: "EndOfTranscript" }));
        this.ws.close();
      } catch {
        // ignore
      }
      this.ws = null;
    }
    this.currentMessageId = null;
  }
}
