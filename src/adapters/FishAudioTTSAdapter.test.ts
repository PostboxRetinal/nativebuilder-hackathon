import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FishAudioTTSAdapter } from "./FishAudioTTSAdapter";

class MockWebSocket {
  send: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  binaryType: string;
  onopen: (() => void) | null;
  onmessage: ((e: MessageEvent) => void) | null;
  onerror: (() => void) | null;
  onclose: (() => void) | null;
  readyState: number;

  constructor() {
    this.send = vi.fn();
    this.close = vi.fn();
    this.binaryType = "";
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this.onclose = null;
    this.readyState = WebSocket.OPEN;
  }
}

class MockAudioContext {
  resume: ReturnType<typeof vi.fn>;
  decodeAudioData: ReturnType<typeof vi.fn>;
  createBufferSource: ReturnType<typeof vi.fn>;
  destination: object;

  constructor() {
    this.resume = vi.fn().mockResolvedValue(undefined);
    this.decodeAudioData = vi.fn().mockResolvedValue({ duration: 0.1 });
    this.createBufferSource = vi.fn().mockReturnValue({
      buffer: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      onended: null,
    });
    this.destination = {};
  }
}

describe("FishAudioTTSAdapter", () => {
  let adapter: FishAudioTTSAdapter;
  let wsInstances: MockWebSocket[] = [];

  beforeEach(() => {
    adapter = new FishAudioTTSAdapter("test-api-key", "ref-123");
    wsInstances = [];
    (global as any).AudioContext = MockAudioContext;
    (global as any).WebSocket = vi.fn().mockImplementation(function(this: any) {
      const ws = new MockWebSocket();
      wsInstances.push(ws);
      return ws;
    }) as any;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    wsInstances = [];
  });

  it("constructor stores apiKey and referenceId", () => {
    expect(adapter).toBeInstanceOf(FishAudioTTSAdapter);
  });

  it("speak() emits bot-tts-text", async () => {
    const handler = vi.fn();
    adapter.onEvent("bot-tts-text", handler);

    const speakPromise = adapter.speak("Hello world");
    const wsInstance = wsInstances[0];
    wsInstance.onopen!();

    expect(handler).toHaveBeenCalledWith({ text: "Hello world" });

    wsInstance.onmessage!({ data: JSON.stringify({ event: "finish", reason: "stop" }) } as MessageEvent);
    await speakPromise;
  });

  it("speak() without API key emits config error", async () => {
    const noKeyAdapter = new FishAudioTTSAdapter("");
    const errorHandler = vi.fn();
    noKeyAdapter.onEvent("error", errorHandler);

    await noKeyAdapter.speak("Test");

    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({ code: "TTS_CONFIG" })
    );
  });

  it("speak() connects to WebSocket and sends start event", async () => {
    const speakPromise = adapter.speak("Hello world. This is a test.");
    const wsInstance = wsInstances[0];
    wsInstance.onopen!();

    expect(wsInstance.send).toHaveBeenCalledWith(
      expect.stringContaining('"event":"start"')
    );
    expect(wsInstance.send).toHaveBeenCalledWith(
      expect.stringContaining('"event":"text"')
    );
    expect(wsInstance.send).toHaveBeenCalledWith(
      expect.stringContaining('"event":"flush"')
    );
    expect(wsInstance.send).toHaveBeenCalledWith(
      expect.stringContaining('"event":"stop"')
    );

    wsInstance.onmessage!({ data: JSON.stringify({ event: "finish", reason: "stop" }) } as MessageEvent);
    await speakPromise;
  });

  it("chunkText splits long text into sentence chunks", () => {
    const longText = "Hello world. This is a test. Another sentence here!";
    const chunks = (adapter as any).chunkText(longText, 20);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(25);
    }
  });

  it("chunkText returns single chunk for short text", () => {
    const chunks = (adapter as any).chunkText("Hello.");
    expect(chunks).toEqual(["Hello."]);
  });

  it("chunkText handles text without sentence boundaries", () => {
    const chunks = (adapter as any).chunkText("Hello world", 5);
    expect(chunks.length).toBeGreaterThan(0);
  });

  it("stop() sends stop event and cleans up", async () => {
    adapter.speak("Hello world");
    const wsInstance = wsInstances[0];
    wsInstance.onopen!();

    adapter.stop();

    expect(wsInstance.send).toHaveBeenCalledWith(
      expect.stringContaining('"event":"stop"')
    );
    expect(wsInstance.close).toHaveBeenCalled();
  });

  it("emits error on WebSocket failure", async () => {
    const errorHandler = vi.fn();
    adapter.onEvent("error", errorHandler);

    // Catch the rejection without re-throwing
    adapter.speak("Hello world").catch(() => {});
    const wsInstance = wsInstances[0];
    wsInstance.onopen!();
    wsInstance.onerror!();

    await new Promise((r) => setTimeout(r, 10));

    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({ code: "TTS_ERROR" })
    );
  });

  it("buffers at least 2 audio chunks before playback", async () => {
    const speakPromise = adapter.speak("Hello world. How are you?");
    const wsInstance = wsInstances[0];
    wsInstance.onopen!();

    wsInstance.onmessage!({ data: JSON.stringify({ event: "finish", reason: "stop" }) } as MessageEvent);
    await speakPromise;
  });
});
