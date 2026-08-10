import type { TTSAdapter, RTVIEventMap, RTVIEventType } from "../types/rtvi";
import { supabase } from "../lib/supabase";

type Handler<T extends RTVIEventType> = (data: RTVIEventMap[T]) => void;

export class FishAudioTTSAdapter implements TTSAdapter {
  private handlers: Map<RTVIEventType, Set<Handler<any>>> = new Map();
  private referenceId?: string;
  private audioCtx: AudioContext | null = null;
  private isStopped = false;

  constructor(_apiKey: string, referenceId?: string) {
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
    if (!text.trim()) return;
    this.isStopped = false;

    this.emit("bot-tts-text", { text });

    const { data, error } = await supabase.functions.invoke("fish-tts", {
      body: { text, reference_id: this.referenceId },
    });

    if (error) {
      this.emit("error", { message: `Fish Audio: ${error.message}`, code: "TTS_ERROR" });
      return;
    }

    const audio = (data as { audio?: string })?.audio;
    if (!audio) {
      this.emit("error", { message: "Fish Audio: empty response", code: "TTS_ERROR" });
      return;
    }

    if (this.isStopped) return;
    await this.playBase64(audio);
  }

  private async playBase64(base64: string): Promise<void> {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
      await this.audioCtx.resume();
    }

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    try {
      const decoded = await this.audioCtx.decodeAudioData(bytes.buffer);
      if (this.isStopped) return;

      const source = this.audioCtx.createBufferSource();
      source.buffer = decoded;
      source.connect(this.audioCtx.destination);

      await new Promise<void>((resolve) => {
        source.onended = () => {
          source.disconnect();
          resolve();
        };
        source.start();
      });
    } catch {
      // Skip undecodable audio
    }
  }

  stop() {
    this.isStopped = true;
  }
}
