import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConversationModeView from "./ConversationModeView";
import type { STTAdapter, TTSAdapter } from "../types/rtvi";

function createMockAdapters(): { stt: STTAdapter; tts: TTSAdapter } {
  return {
    stt: {
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn(),
      onEvent: vi.fn(),
      offEvent: vi.fn(),
    },
    tts: {
      speak: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn(),
      onEvent: vi.fn(),
      offEvent: vi.fn(),
    },
  };
}

const mockResearch = vi.fn().mockResolvedValue("agent reply");

describe("ConversationModeView", () => {
  it("renders the header with title", () => {
    const adapters = createMockAdapters();
    render(
      <ConversationModeView onExit={() => {}} onResearch={mockResearch} sttAdapter={adapters.stt} ttsAdapter={adapters.tts} />,
    );
    expect(screen.getByText("Conversation Mode")).toBeInTheDocument();
  });

  it("renders the back button", () => {
    const adapters = createMockAdapters();
    render(
      <ConversationModeView onExit={() => {}} onResearch={mockResearch} sttAdapter={adapters.stt} ttsAdapter={adapters.tts} />,
    );
    expect(
      screen.getByRole("button", { name: /exit conversation mode/i }),
    ).toBeInTheDocument();
  });

  it("renders the mic button to start recording", () => {
    const adapters = createMockAdapters();
    render(
      <ConversationModeView onExit={() => {}} onResearch={mockResearch} sttAdapter={adapters.stt} ttsAdapter={adapters.tts} />,
    );
    expect(
      screen.getByRole("button", { name: /start recording/i }),
    ).toBeInTheDocument();
  });

  it("calls onExit when back button is clicked", async () => {
    const adapters = createMockAdapters();
    const onExit = vi.fn();
    const user = userEvent.setup();
    render(
      <ConversationModeView onExit={onExit} onResearch={mockResearch} sttAdapter={adapters.stt} ttsAdapter={adapters.tts} />,
    );
    await user.click(
      screen.getByRole("button", { name: /exit conversation mode/i }),
    );
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it("shows stop button when recording (toggle)", async () => {
    const adapters = createMockAdapters();
    const user = userEvent.setup();
    render(
      <ConversationModeView onExit={() => {}} onResearch={mockResearch} sttAdapter={adapters.stt} ttsAdapter={adapters.tts} />,
    );
    // Click mic to start
    await user.click(
      screen.getByRole("button", { name: /start recording/i }),
    );
    // Now should show stop
    expect(
      screen.getByRole("button", { name: /stop recording/i }),
    ).toBeInTheDocument();
  });

  it("renders ConversationBubbles component", () => {
    const adapters = createMockAdapters();
    render(
      <ConversationModeView onExit={() => {}} onResearch={mockResearch} sttAdapter={adapters.stt} ttsAdapter={adapters.tts} />,
    );
    // ConversationBubbles renders "No messages yet" when empty
    expect(screen.getByText("No messages yet")).toBeInTheDocument();
  });
});
