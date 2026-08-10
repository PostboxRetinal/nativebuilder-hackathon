import type { TTSAdapter, RTVIEventMap, RTVIEventType } from "../types/rtvi";

type Handler<T extends RTVIEventType> = (data: RTVIEventMap[T]) => void;

export class FishAudioTTSAdapter implements TTSAdapter {
  private handlers: Map<RTVIEventType, Set<Handler<any>>> = new Map();
  private apiKey: string;
  private referenceId?: string;
  private abortController: AbortController | null = null;

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

    this.emit("bot-tts-text", { text });
    this.abortController = new AbortController();

    try {
      const response = await fetch("https://api.fish.audio/v1/tts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "model": "s2.1-pro-free",
        },
        body: JSON.stringify({
          text,
          format: "mp3",
          latency: "balanced",
          reference_id: this.referenceId,
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        this.emit("error", { message: `Fish Audio error: ${response.status}`, code: "TTS_ERROR" });
        return;
      }

      const audioData = await response.arrayBuffer();
      await this.playAudio(audioData);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        this.emit("error", { message: err.message, code: "TTS_ERROR" });
      }
    }
  }

  private async playAudio(arrayBuffer: ArrayBuffer) {
    const audioContext = new AudioContext();
    await audioContext.resume();
    const buffer = await audioContext.decodeAudioData(arrayBuffer);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
    return new Promise<void>((resolve) => {
      source.onended = () => {
        audioContext.close();
        resolve();
      };
    });
  }

  stop() {
    this.abortController?.abort();
    this.abortController = null;
  }
}
