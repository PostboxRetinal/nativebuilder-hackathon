import type { TTSAdapter, RTVIEventMap, RTVIEventType } from "../types/rtvi";

type Handler<T extends RTVIEventType> = (data: RTVIEventMap[T]) => void;

export class FishAudioTTSAdapter implements TTSAdapter {
  private handlers: Map<RTVIEventType, Set<Handler<any>>> = new Map();
  private apiKey: string;
  private referenceId?: string;
  private ws: WebSocket | null = null;
  private audioQueue: ArrayBuffer[] = [];
  private isPlaying = false;
  private resolveSession: (() => void) | null = null;
  private rejectSession: ((err: Error) => void) | null = null;
  private audioCtx: AudioContext | null = null;
  private isStopped = false;

  constructor(apiKey: string, referenceId?: string) {
    this.apiKey = apiKey;
    this.referenceId = referenceId;
  }

  onEvent<T extends RTVIEventType>(type: T, handler: Handler<T>) {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
  }

  private emit<T extends RTVIEventType>(type: T, data: RTVIEventMap[T]) {
    this.handlers.get(type)?.forEach((h) => h(data));
  }

  async speak(text: string): Promise<void> {
    if (!this.apiKey) {
      this.emit("error", { message: "Fish Audio API key not configured", code: "TTS_CONFIG" });
      return;
    }

    if (this.ws) {
      this.cleanup();
    }

    this.emit("bot-tts-text", { text });
    this.isStopped = false;
    const chunks = this.chunkText(text);

    return new Promise((resolve, reject) => {
      this.resolveSession = resolve;
      this.rejectSession = reject;
      this.connectWebSocket(chunks);
    });
  }

  private connectWebSocket(chunks: string[]) {
    const wsUrl = "wss://api.fish.audio/v1/tts/live";
    this.ws = new WebSocket(wsUrl);
    this.ws.binaryType = "arraybuffer";

    this.ws.onopen = () => {
      this.ws?.send(JSON.stringify({
        event: "start",
        request: {
          text: "",
          format: "mp3",
          chunk_length: 300,
          reference_id: this.referenceId,
          latency: "balanced",
        },
        Authorization: `Bearer ${this.apiKey}`,
      }));

      for (const chunk of chunks) {
        this.ws?.send(JSON.stringify({ event: "text", text: chunk }));
      }

      this.ws?.send(JSON.stringify({ event: "flush" }));
      this.ws?.send(JSON.stringify({ event: "stop" }));
    };

    this.ws.onmessage = async (e: MessageEvent) => {
      if (this.isStopped) return;

      if (e.data instanceof ArrayBuffer) {
        this.audioQueue.push(e.data);
        if (this.audioQueue.length >= 2 && !this.isPlaying) {
          this.isPlaying = true;
          await this.drainQueue();
        }
      } else {
        try {
          const msg = JSON.parse(e.data);
          if (msg.event === "finish") {
            if (this.audioQueue.length > 0 && !this.isPlaying) {
              this.isPlaying = true;
              await this.drainQueue();
            }
            this.cleanup();
            this.resolveSession?.();
          }
        } catch {
          // ignore non-JSON text frames
        }
      }
    };

    this.ws.onerror = () => {
      if (this.isStopped) return;
      this.cleanup();
      const err = new Error("Fish Audio WebSocket error");
      this.emit("error", { message: err.message, code: "TTS_ERROR" });
      this.rejectSession?.(err);
    };
  }

  private async drainQueue(): Promise<void> {
    while (this.audioQueue.length > 0 && !this.isStopped) {
      const chunk = this.audioQueue.shift()!;
      await this.decodeAndPlay(chunk);
    }
    this.isPlaying = false;
  }

  private async decodeAndPlay(arrayBuffer: ArrayBuffer): Promise<void> {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
      await this.audioCtx.resume();
    }

    try {
      const decoded = await this.audioCtx.decodeAudioData(arrayBuffer.slice(0));
      const source = this.audioCtx.createBufferSource();
      source.buffer = decoded;
      source.connect(this.audioCtx.destination);

      return new Promise((resolve) => {
        source.onended = () => {
          source.disconnect();
          resolve();
        };
        source.start();
      });
    } catch {
      // Skip undecodable chunks
    }
  }

  private cleanup() {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this.audioQueue = [];
    this.isPlaying = false;
  }

  stop() {
    this.isStopped = true;
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event: "stop" }));
    }
    this.cleanup();
  }

  private chunkText(text: string, maxChunkLength = 150): string[] {
    const sentences = text.match(/[^.!?]+[.!?]*\s*/g) || [text];
    const chunks: string[] = [];
    let current = '';

    for (const sentence of sentences) {
      if (current.length + sentence.length > maxChunkLength && current.length > 0) {
        chunks.push(current.trim());
        current = sentence;
      } else {
        current += sentence;
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks.length > 0 ? chunks : [text];
  }
}
