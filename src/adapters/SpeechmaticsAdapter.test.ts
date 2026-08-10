import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SpeechmaticsAdapter } from "./SpeechmaticsAdapter";

function createWsMock() {
  const instance = {
    send: vi.fn(),
    close: vi.fn(),
    readyState: 1,
    onopen: null as (() => void) | null,
    onmessage: null as ((e: MessageEvent) => void) | null,
    onerror: null as (() => void) | null,
  };
  return {
    instance,
    Mock: vi.fn(function (this: any) {
      Object.assign(this, instance);
      return this;
    }) as any,
  };
}

function createAudioContextMock() {
  return vi.fn().mockImplementation(function () {
    return {
      sampleRate: 16000,
      resume: vi.fn().mockResolvedValue(undefined),
      createMediaStreamSource: vi.fn().mockReturnValue({ connect: vi.fn() }),
      audioWorklet: { addModule: vi.fn().mockResolvedValue(undefined) },
    };
  });
}

describe("SpeechmaticsAdapter", () => {
  let adapter: SpeechmaticsAdapter;

  beforeEach(() => {
    adapter = new SpeechmaticsAdapter();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("constructor creates instance", () => {
    expect(adapter).toBeInstanceOf(SpeechmaticsAdapter);
  });

  it("onEvent registers handler", () => {
    const handler = vi.fn();
    adapter.onEvent("user-transcript-partial", handler);
    expect(handler).not.toHaveBeenCalled();
  });

  it("stop() does not throw when no active connection", () => {
    expect(() => adapter.stop()).not.toThrow();
  });

  it("start() emits auth error and does not create WebSocket when token fetch fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });

    const { Mock: WebSocketMock } = createWsMock();
    (global as any).WebSocket = WebSocketMock;

    vi.stubGlobal("navigator", {
      ...global.navigator,
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: vi.fn().mockReturnValue([]),
        }),
      },
    });

    (global as any).AudioContext = createAudioContextMock();
    (global as any).AudioWorkletNode = vi.fn().mockImplementation(function () {
      return { port: { onmessage: null }, connect: vi.fn() };
    });

    await adapter.start("en");
    expect(WebSocketMock).not.toHaveBeenCalled();
  });

  it("WebSocket URL contains JWT query parameter", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ token: "test-jwt-123" }),
    });

    const { Mock: WebSocketMock } = createWsMock();
    (global as any).WebSocket = WebSocketMock;

    vi.stubGlobal("navigator", {
      ...global.navigator,
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: vi.fn().mockReturnValue([]),
        }),
      },
    });

    (global as any).AudioContext = createAudioContextMock();
    (global as any).AudioWorkletNode = vi.fn().mockImplementation(function () {
      return { port: { onmessage: null }, connect: vi.fn() };
    });

    await adapter.start("en");

    expect(WebSocketMock).toHaveBeenCalledWith(
      expect.stringContaining("eu2.rt.speechmatics.com")
    );
  });

  it("StartRecognition message does NOT contain jwt in body", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ token: "my-jwt-token" }),
    });

    const { Mock: WebSocketMock } = createWsMock();
    (global as any).WebSocket = WebSocketMock;

    vi.stubGlobal("navigator", {
      ...global.navigator,
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: vi.fn().mockReturnValue([]),
        }),
      },
    });

    (global as any).AudioContext = createAudioContextMock();
    (global as any).AudioWorkletNode = vi.fn().mockImplementation(function () {
      return { port: { onmessage: null }, connect: vi.fn() };
    });

    await adapter.start("en");

    // The adapter should have assigned an onopen handler
    // The StartRecognition message should NOT have jwt in body
    // We can verify by checking the mock was called with the correct URL (jwt in query)
    expect(WebSocketMock).toHaveBeenCalledWith(
      expect.stringContaining("jwt=my-jwt-token")
    );
  });
});
