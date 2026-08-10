import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConversationSession } from "./useConversationSession";

describe("useConversationSession", () => {
  const mockResearch = vi.fn().mockResolvedValue("agent reply");

  it("starts in idle state", () => {
    const { result } = renderHook(() =>
      useConversationSession("en", mockResearch),
    );
    expect(result.current.state).toBe("idle");
    expect(result.current.userText).toBe("");
    expect(result.current.agentText).toBe("");
  });

  it("transitions to listening on startListening", () => {
    const { result } = renderHook(() =>
      useConversationSession("en", mockResearch),
    );
    act(() => result.current.startListening());
    expect(result.current.state).toBe("listening");
  });

  it("updates userText on onPartial", () => {
    const { result } = renderHook(() =>
      useConversationSession("en", mockResearch),
    );
    act(() => result.current.onPartial("hello world"));
    expect(result.current.userText).toBe("hello world");
  });

  it("transitions to processing on onFinal", () => {
    const { result } = renderHook(() =>
      useConversationSession("en", mockResearch),
    );
    act(() => result.current.onFinal("final text"));
    expect(result.current.state).toBe("processing");
    expect(result.current.userText).toBe("final text");
  });

  it("transitions to speaking on onAgentResponse", () => {
    const { result } = renderHook(() =>
      useConversationSession("en", mockResearch),
    );
    act(() => result.current.onAgentResponse("agent reply"));
    expect(result.current.state).toBe("speaking");
    expect(result.current.agentText).toBe("agent reply");
  });

  it("calls onResearch when EndOfUtterance fires", async () => {
    const { result } = renderHook(() =>
      useConversationSession("en", mockResearch),
    );
    await act(async () => {
      result.current.onEndOfUtterance("hello");
    });
    expect(mockResearch).toHaveBeenCalledWith("hello");
  });

  it("clears all state on reset", () => {
    const { result } = renderHook(() =>
      useConversationSession("en", mockResearch),
    );
    act(() => result.current.startListening());
    act(() => result.current.onPartial("text"));
    act(() => result.current.reset());
    expect(result.current.state).toBe("idle");
    expect(result.current.userText).toBe("");
    expect(result.current.agentText).toBe("");
  });
});
