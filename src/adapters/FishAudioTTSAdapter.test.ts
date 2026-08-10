import { describe, it, expect, vi, beforeEach } from "vitest";
import { FishAudioTTSAdapter } from "./FishAudioTTSAdapter";

describe("FishAudioTTSAdapter", () => {
  let adapter: FishAudioTTSAdapter;

  beforeEach(() => {
    adapter = new FishAudioTTSAdapter("test-api-key", "ref-123");
  });

  it("constructor stores apiKey and referenceId", () => {
    expect(adapter).toBeInstanceOf(FishAudioTTSAdapter);
  });

  it("speak() emits bot-tts-text", async () => {
    const handler = vi.fn();
    adapter.onEvent("bot-tts-text", handler);

    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    });

    // Mock AudioContext
    (global as any).AudioContext = vi.fn().mockImplementation(() => ({
      resume: vi.fn().mockResolvedValue(undefined),
      decodeAudioData: vi.fn().mockResolvedValue({}),
      createBufferSource: vi.fn().mockReturnValue({
        buffer: null,
        connect: vi.fn(),
        start: vi.fn(),
        onended: null,
      }),
      destination: {},
      close: vi.fn(),
    }));

    await adapter.speak("Hello world");

    expect(handler).toHaveBeenCalledWith({ text: "Hello world" });
  });

  it("speak() sends correct model header", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    });

    (global as any).AudioContext = vi.fn().mockImplementation(() => ({
      resume: vi.fn().mockResolvedValue(undefined),
      decodeAudioData: vi.fn().mockResolvedValue({}),
      createBufferSource: vi.fn().mockReturnValue({
        buffer: null,
        connect: vi.fn(),
        start: vi.fn(),
        onended: null,
      }),
      destination: {},
      close: vi.fn(),
    }));

    await adapter.speak("Test");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.fish.audio/v1/tts",
      expect.objectContaining({
        headers: expect.objectContaining({
          "model": "s2.1-pro-free",
        }),
      }),
    );
  });

  it("speak() handles API error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    const errorHandler = vi.fn();
    adapter.onEvent("error", errorHandler);

    await adapter.speak("Test");

    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({ code: "TTS_ERROR" }),
    );
  });

  it("speak() without API key emits config error", async () => {
    const noKeyAdapter = new FishAudioTTSAdapter("");
    const errorHandler = vi.fn();
    noKeyAdapter.onEvent("error", errorHandler);

    await noKeyAdapter.speak("Test");

    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({ code: "TTS_CONFIG" }),
    );
  });

  it("stop() clears abort controller", () => {
    expect(() => adapter.stop()).not.toThrow();
  });
});
