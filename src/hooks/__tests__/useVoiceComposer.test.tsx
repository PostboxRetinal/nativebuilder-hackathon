import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVoiceComposer } from "../useVoiceComposer";

const mockStart = vi.fn();
const mockStop = vi.fn();
const mockReset = vi.fn();

vi.mock("../useSpeechmatics", () => ({
  useSpeechmatics: vi.fn(),
}));

import { useSpeechmatics } from "../useSpeechmatics";
const mockUseSpeechmatics = useSpeechmatics as ReturnType<typeof vi.fn>;

describe("useVoiceComposer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSpeechmatics.mockReturnValue({
      state: "idle",
      partialText: "",
      finalText: "",
      error: "",
      startRecording: mockStart,
      stopRecording: mockStop,
      reset: mockReset,
    });
  });

  it("initializes in idle state", () => {
    const submit = vi.fn();
    const { result } = renderHook(() => useVoiceComposer(submit));
    expect(result.current.state).toBe("idle");
  });

  it("transitions to recording on startRecording", () => {
    const submit = vi.fn();
    const { result } = renderHook(() => useVoiceComposer(submit));
    act(() => result.current.startRecording());
    expect(mockStart).toHaveBeenCalled();
  });

  it("returns done state when speechmatics finalizes and populates editedText", () => {
    const submit = vi.fn();
    mockUseSpeechmatics.mockReturnValue({
      state: "done",
      partialText: "",
      finalText: "hello world",
      error: "",
      startRecording: mockStart,
      stopRecording: mockStop,
      reset: mockReset,
    });
    const { result } = renderHook(() => useVoiceComposer(submit));
    expect(result.current.state).toBe("done");
    expect(result.current.editedText).toBe("hello world");
  });

  it("reset returns to idle and cleans up", () => {
    const submit = vi.fn();
    const { result } = renderHook(() => useVoiceComposer(submit));
    act(() => result.current.reset());
    expect(mockReset).toHaveBeenCalled();
  });

  it("submitEdit calls the submit callback with trimmed text", async () => {
    const submit = vi.fn();
    mockUseSpeechmatics.mockReturnValue({
      state: "done",
      partialText: "",
      finalText: "hello",
      error: "",
      startRecording: mockStart,
      stopRecording: mockStop,
      reset: mockReset,
    });
    const { result } = renderHook(() => useVoiceComposer(submit));
    act(() => result.current.setEditedText("hello edited"));
    await act(async () => {
      await result.current.submitEdit();
    });
    expect(submit).toHaveBeenCalledWith("hello edited");
    expect(mockReset).toHaveBeenCalled();
  });

  it("reRecord resets edited text", () => {
    const submit = vi.fn();
    const { result } = renderHook(() => useVoiceComposer(submit));
    act(() => result.current.setEditedText("some text"));
    act(() => result.current.reRecord());
    expect(mockReset).toHaveBeenCalled();
  });
});
