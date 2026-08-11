import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FishAudioSpeechAdapter } from "./FishAudioSpeechAdapter";

describe("FishAudioSpeechAdapter", () => {
  let adapter: FishAudioSpeechAdapter;
  let fetchMock: ReturnType<typeof vi.fn>;
  let createObjectURLMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    createObjectURLMock = vi.fn().mockReturnValue("blob:mock-url");
    globalThis.URL.createObjectURL = createObjectURLMock as unknown as typeof URL.createObjectURL;
    globalThis.URL.revokeObjectURL = vi.fn();

    adapter = new FishAudioSpeechAdapter("https://test-api/tts");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("speak() returns utterance with running status", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(new Blob(["audio"])),
    });

    const utterance = adapter.speak("Hello world");
    expect(utterance.status).toEqual({ type: "running" });
  });

  it("speak() calls fetch with text", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(new Blob(["audio"])),
    });

    adapter.speak("Hello world");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://test-api/tts",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Hello world" }),
      })
    );
  });

  it("cancel() sets status to cancelled", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(new Blob(["audio"])),
    });

    const utterance = adapter.speak("Hello");
    const callback = vi.fn();
    utterance.subscribe(callback);

    utterance.cancel();

    expect(utterance.status).toEqual({ type: "ended", reason: "cancelled" });
    expect(callback).toHaveBeenCalled();
  });

  it("subscribe returns unsubscribe function", () => {
    fetchMock.mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(new Blob(["audio"])),
    });

    const utterance = adapter.speak("Hello");
    const callback = vi.fn();
    const unsubscribe = utterance.subscribe(callback);

    expect(typeof unsubscribe).toBe("function");
  });
});
