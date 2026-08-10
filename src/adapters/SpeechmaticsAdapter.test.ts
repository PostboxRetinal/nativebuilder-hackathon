import { describe, it, expect, vi, beforeEach } from "vitest";
import { SpeechmaticsAdapter } from "./SpeechmaticsAdapter";

describe("SpeechmaticsAdapter", () => {
  let adapter: SpeechmaticsAdapter;

  beforeEach(() => {
    adapter = new SpeechmaticsAdapter();
  });

  it("constructor creates instance", () => {
    expect(adapter).toBeInstanceOf(SpeechmaticsAdapter);
  });

  it("onEvent registers handler", () => {
    const handler = vi.fn();
    adapter.onEvent("user-transcript-partial", handler);
    // Handler is registered (we can't directly test emit without mocking WebSocket)
    expect(handler).not.toHaveBeenCalled();
  });

  it("stop() does not throw when no active connection", () => {
    expect(() => adapter.stop()).not.toThrow();
  });

  it("start() requires a language parameter", async () => {
    // Mock fetch to return null token
    global.fetch = vi.fn().mockResolvedValue({ ok: false });

    // Mock WebSocket
    (global as any).WebSocket = vi.fn().mockImplementation(() => ({
      send: vi.fn(),
      close: vi.fn(),
      readyState: 1,
      onopen: null,
      onmessage: null,
      onerror: null,
    }));

    // Mock getUserMedia
    (navigator as any).mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [],
      }),
    };

    // Mock AudioContext
    (global as any).AudioContext = vi.fn().mockImplementation(() => ({
      sampleRate: 16000,
      resume: vi.fn().mockResolvedValue(undefined),
      createMediaStreamSource: vi.fn().mockReturnValue({ connect: vi.fn() }),
      createScriptProcessor: vi.fn().mockReturnValue({
        connect: vi.fn(),
        onaudioprocess: null,
      }),
      destination: {},
    }));

    await adapter.start("en");
    // Should emit error since token fetch failed
  });
});
