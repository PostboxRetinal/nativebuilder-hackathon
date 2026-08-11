import type { DictationAdapter } from "@assistant-ui/react";
import { SpeechmaticsAdapter } from "./SpeechmaticsAdapter";

export class SpeechmaticsDictationAdapter implements DictationAdapter {
  private adapter: SpeechmaticsAdapter;

  constructor() {
    this.adapter = new SpeechmaticsAdapter();
  }

  listen(): DictationAdapter.Session {
    const speechStart = new Set<() => void>();
    const speechEnd = new Set<(r: DictationAdapter.Result) => void>();
    const speech = new Set<(r: DictationAdapter.Result) => void>();

    const session: DictationAdapter.Session = {
      status: { type: "starting" },
      stop: async () => {
        this.adapter.stop();
        session.status = { type: "ended", reason: "stopped" };
      },
      cancel: () => {
        this.adapter.stop();
        session.status = { type: "ended", reason: "cancelled" };
      },
      onSpeechStart: (cb) => {
        speechStart.add(cb);
        return () => speechStart.delete(cb);
      },
      onSpeechEnd: (cb) => {
        speechEnd.add(cb);
        return () => speechEnd.delete(cb);
      },
      onSpeech: (cb) => {
        speech.add(cb);
        return () => speech.delete(cb);
      },
    };

    this.adapter.onEvent("user-transcript-partial", (data) => {
      speech.forEach((s) => s({ transcript: data.text, isFinal: false }));
    });

    this.adapter.onEvent("user-transcript-final", (data) => {
      const result: DictationAdapter.Result = { transcript: data.text, isFinal: true };
      speech.forEach((s) => s(result));
      speechEnd.forEach((s) => s(result));
    });

    this.adapter.onEvent("error", (data) => {
      speech.forEach((s) => s({ transcript: `Error: ${data.message}`, isFinal: true }));
    });

    this.adapter.start("en");
    session.status = { type: "running" };
    queueMicrotask(() => speechStart.forEach((s) => s()));

    return session;
  }

  disableInputDuringDictation = true;
}
