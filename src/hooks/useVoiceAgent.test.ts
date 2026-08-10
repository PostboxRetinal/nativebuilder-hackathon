import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVoiceAgent } from "./useVoiceAgent";
import type { STTAdapter, TTSAdapter } from "../types/rtvi";

function createMockSTTAdapter(): STTAdapter & { emit: (type: string, data: any) => void } {
  const handlers = new Map<string, Set<Function>>();
  return {
    start: vi.fn(),
    stop: vi.fn(),
    onEvent: (type: string, handler: Function) => {
      if (!handlers.has(type)) handlers.set(type, new Set());
      handlers.get(type)!.add(handler);
    },
    offEvent: (type: string, handler: Function) => {
      handlers.get(type)?.delete(handler);
    },
    emit: (type: string, data: any) => {
      handlers.get(type)?.forEach((h) => h(data));
    },
  };
}

function createMockTTSAdapter(): TTSAdapter {
  const handlers = new Map<string, Set<Function>>();
  return {
    speak: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
    onEvent: (type: string, handler: Function) => {
      if (!handlers.has(type)) handlers.set(type, new Set());
      handlers.get(type)!.add(handler);
    },
    offEvent: (type: string, handler: Function) => {
      handlers.get(type)?.delete(handler);
    },
  };
}

describe("useVoiceAgent", () => {
  let sttAdapter: STTAdapter;
  let ttsAdapter: TTSAdapter;

  beforeEach(() => {
    sttAdapter = createMockSTTAdapter();
    ttsAdapter = createMockTTSAdapter();
  });

  it("initializes with empty messages and idle state", () => {
    const { result } = renderHook(() =>
      useVoiceAgent({
        sttAdapter,
        ttsAdapter,
        onUserTranscriptFinal: () => {},
      }),
    );

    expect(result.current.state).toBe("idle");
    expect(result.current.messages).toEqual([]);
    expect(result.current.isListening).toBe(false);
    expect(result.current.isSpeaking).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("startListening sets state to listening and calls sttAdapter.start", async () => {
    const { result } = renderHook(() =>
      useVoiceAgent({
        sttAdapter,
        ttsAdapter,
        onUserTranscriptFinal: () => {},
      }),
    );

    await act(async () => {
      await result.current.startListening();
    });

    expect(result.current.state).toBe("listening");
    expect(result.current.isListening).toBe(true);
    expect(sttAdapter.start).toHaveBeenCalledWith("en");
  });

  it("stopListening sets state to idle and calls sttAdapter.stop", async () => {
    const { result } = renderHook(() =>
      useVoiceAgent({
        sttAdapter,
        ttsAdapter,
        onUserTranscriptFinal: () => {},
      }),
    );

    await act(async () => {
      await result.current.startListening();
    });

    act(() => {
      result.current.stopListening();
    });

    expect(result.current.state).toBe("idle");
    expect(result.current.isListening).toBe(false);
    expect(sttAdapter.stop).toHaveBeenCalled();
  });

  it("toggle: calling startListening twice stops the mic", async () => {
    const { result } = renderHook(() =>
      useVoiceAgent({
        sttAdapter,
        ttsAdapter,
        onUserTranscriptFinal: () => {},
      }),
    );

    await act(async () => {
      await result.current.startListening();
    });
    expect(result.current.isListening).toBe(true);

    await act(async () => {
      await result.current.startListening();
    });
    expect(result.current.isListening).toBe(false);
  });

  it("speak() calls ttsAdapter.speak and sets state to speaking", async () => {
    const { result } = renderHook(() =>
      useVoiceAgent({
        sttAdapter,
        ttsAdapter,
        onUserTranscriptFinal: () => {},
      }),
    );

    await act(async () => {
      await result.current.speak("Hello world");
    });

    expect(ttsAdapter.speak).toHaveBeenCalledWith("Hello world");
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe("agent");
    expect(result.current.messages[0].text).toBe("Hello world");
  });

  it("resetMessages clears all messages", async () => {
    const { result } = renderHook(() =>
      useVoiceAgent({
        sttAdapter,
        ttsAdapter,
        onUserTranscriptFinal: () => {},
      }),
    );

    await act(async () => {
      await result.current.speak("Test");
    });
    expect(result.current.messages).toHaveLength(1);

    act(() => {
      result.current.resetMessages();
    });

    expect(result.current.messages).toEqual([]);
  });

  it("on() registers handler and off() removes it", async () => {
    const { result } = renderHook(() =>
      useVoiceAgent({
        sttAdapter,
        ttsAdapter,
        onUserTranscriptFinal: () => {},
      }),
    );

    const handler = vi.fn();
    act(() => {
      result.current.on("agent-state", handler);
    });

    // Trigger a state change which emits "agent-state"
    await act(async () => {
      await result.current.startListening();
    });

    expect(handler).toHaveBeenCalledWith({ state: "listening" });

    // Now off() should remove it
    act(() => {
      result.current.off("agent-state", handler);
    });

    await act(async () => {
      await result.current.startListening(); // toggle off
    });

    // Handler should not have been called again (it was removed)
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
