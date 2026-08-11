import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("./SpeechmaticsAdapter", () => {
  return {
    SpeechmaticsAdapter: class {
      onEvent = vi.fn();
      start = vi.fn();
      stop = vi.fn();
    },
  };
});

import { SpeechmaticsDictationAdapter } from "./SpeechmaticsDictationAdapter";

describe("SpeechmaticsDictationAdapter", () => {
  let adapter: SpeechmaticsDictationAdapter;

  beforeEach(() => {
    adapter = new SpeechmaticsDictationAdapter();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("listen() returns session", () => {
    const session = adapter.listen();
    expect(session).toBeDefined();
    expect(session.status).toEqual({ type: "running" });
  });

  it("session has stop and cancel methods", () => {
    const session = adapter.listen();
    expect(typeof session.stop).toBe("function");
    expect(typeof session.cancel).toBe("function");
  });

  it("session has onSpeechStart/End/Speech callbacks", () => {
    const session = adapter.listen();
    expect(typeof session.onSpeechStart).toBe("function");
    expect(typeof session.onSpeechEnd).toBe("function");
    expect(typeof session.onSpeech).toBe("function");
  });

  it("onSpeechStart callback fires asynchronously", async () => {
    const session = adapter.listen();
    const callback = vi.fn();
    session.onSpeechStart(callback);
    await new Promise((r) => setTimeout(r, 0));
    expect(callback).toHaveBeenCalled();
  });

  it("disableInputDuringDictation is true", () => {
    expect(adapter.disableInputDuringDictation).toBe(true);
  });

  it("stop() sets status to ended with stopped reason", async () => {
    const session = adapter.listen();
    await session.stop();
    expect(session.status).toEqual({ type: "ended", reason: "stopped" });
  });

  it("cancel() sets status to ended with cancelled reason", () => {
    const session = adapter.listen();
    session.cancel();
    expect(session.status).toEqual({ type: "ended", reason: "cancelled" });
  });

  it("onSpeechStart returns unsubscribe function", () => {
    const session = adapter.listen();
    const callback = vi.fn();
    const unsubscribe = session.onSpeechStart(callback);
    expect(typeof unsubscribe).toBe("function");
  });

  it("unsubscribe removes callback", async () => {
    const session = adapter.listen();
    const callback = vi.fn();
    const unsubscribe = session.onSpeechStart(callback);
    unsubscribe();
    await new Promise((r) => setTimeout(r, 0));
    expect(callback).not.toHaveBeenCalled();
  });
});
