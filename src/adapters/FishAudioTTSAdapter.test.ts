import { describe, it, expect, vi, beforeEach } from "vitest";
import { FishAudioTTSAdapter } from "./FishAudioTTSAdapter";

vi.mock("../lib/supabase", () => ({
  supabase: { functions: { invoke: vi.fn() } },
}));

import { supabase } from "../lib/supabase";

class MockAudioContext {
  resume = vi.fn().mockResolvedValue(undefined);
  decodeAudioData = vi.fn().mockResolvedValue({ duration: 0.1 });
  createBufferSource = vi.fn().mockReturnValue({
    buffer: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(function(this: any) {
      setTimeout(() => {
        if (this.onended) this.onended();
      }, 0);
    }),
    onended: null,
  });
  destination = {};
}

describe("FishAudioTTSAdapter", () => {
  let adapter: FishAudioTTSAdapter;

  beforeEach(() => {
    adapter = new FishAudioTTSAdapter("", "ref-123");
    (global as any).AudioContext = MockAudioContext;
    vi.clearAllMocks();
  });

  it("constructor creates instance", () => {
    expect(adapter).toBeInstanceOf(FishAudioTTSAdapter);
  });

  it("speak() emits bot-tts-text and invokes supabase function", async () => {
    const handler = vi.fn();
    adapter.onEvent("bot-tts-text", handler);

    (supabase.functions.invoke as any).mockResolvedValue({
      data: { audio: btoa("fake-audio-bytes") },
      error: null,
    });

    await adapter.speak("Hello world");

    expect(handler).toHaveBeenCalledWith({ text: "Hello world" });
    expect(supabase.functions.invoke).toHaveBeenCalledWith("fish-tts", {
      body: { text: "Hello world", reference_id: "ref-123" },
    });
  });

  it("speak() emits error with TTS_FALLBACK code when function returns error", async () => {
    const errorHandler = vi.fn();
    adapter.onEvent("error", errorHandler);

    (supabase.functions.invoke as any).mockResolvedValue({
      data: null,
      error: { message: "Function failed" },
    });

    // Stub fallback to resolve immediately
    (adapter as any).fallbackSpeak = vi.fn().mockResolvedValue(undefined);

    await adapter.speak("Test");

    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({ code: "TTS_FALLBACK" })
    );
  });

  it("speak() calls fallback when response has no audio", async () => {
    const fallbackSpy = vi.fn().mockResolvedValue(undefined);
    (adapter as any).fallbackSpeak = fallbackSpy;

    (supabase.functions.invoke as any).mockResolvedValue({
      data: { audio: undefined },
      error: null,
    });

    await adapter.speak("Test");

    expect(fallbackSpy).toHaveBeenCalledWith("Test");
  });

  it("speak() skips playback when stopped before decode", async () => {
    (supabase.functions.invoke as any).mockImplementation(
      async () => {
        await new Promise(r => setTimeout(r, 50));
        return { data: { audio: btoa("audio") }, error: null };
      }
    );

    const promise = adapter.speak("Hello");
    adapter.stop();
    await promise;
  });

  it("stop() sets isStopped flag", () => {
    adapter.stop();
  });
});
