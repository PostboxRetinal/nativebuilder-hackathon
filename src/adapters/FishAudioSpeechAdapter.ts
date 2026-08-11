import type { SpeechSynthesisAdapter } from "@assistant-ui/react";

export class FishAudioSpeechAdapter implements SpeechSynthesisAdapter {
  constructor(private apiUrl: string = "/api/fish-tts") {}

  speak(text: string): SpeechSynthesisAdapter.Utterance {
    const subscribers = new Set<() => void>();
    const audio = new Audio();

    const utterance: SpeechSynthesisAdapter.Utterance = {
      status: { type: "running" },
      cancel: () => {
        audio.pause();
        utterance.status = { type: "ended", reason: "cancelled" };
        subscribers.forEach((s) => s());
      },
      subscribe: (cb) => {
        subscribers.add(cb);
        return () => subscribers.delete(cb);
      },
    };

    fetch(this.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("TTS request failed");
        return res.blob();
      })
      .then((blob) => {
        audio.src = URL.createObjectURL(blob);
        return audio.play();
      })
      .catch(() => {
        utterance.status = { type: "ended", reason: "error" };
        subscribers.forEach((s) => s());
      });

    audio.onended = () => {
      utterance.status = { type: "ended", reason: "finished" };
      subscribers.forEach((s) => s());
    };

    audio.onerror = () => {
      utterance.status = { type: "ended", reason: "error" };
      subscribers.forEach((s) => s());
    };

    return utterance;
  }
}
