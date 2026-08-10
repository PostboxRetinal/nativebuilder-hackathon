import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConversationModeView from "./ConversationModeView";

const mockResearch = vi.fn().mockResolvedValue("agent reply");

describe("ConversationModeView", () => {
  it("renders the header with title", () => {
    render(
      <ConversationModeView onExit={() => {}} onResearch={mockResearch} />,
    );
    expect(screen.getByText("Conversation Mode")).toBeInTheDocument();
  });

  it("renders the back button", () => {
    render(
      <ConversationModeView onExit={() => {}} onResearch={mockResearch} />,
    );
    expect(
      screen.getByRole("button", { name: /exit conversation mode/i }),
    ).toBeInTheDocument();
  });

  it("renders both transcription panels", () => {
    render(
      <ConversationModeView onExit={() => {}} onResearch={mockResearch} />,
    );
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("Agent")).toBeInTheDocument();
  });

  it("renders initial placeholder text", () => {
    render(
      <ConversationModeView onExit={() => {}} onResearch={mockResearch} />,
    );
    expect(
      screen.getByText(/tap the microphone to start speaking/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Waiting...")).toBeInTheDocument();
  });

  it("renders the mic button to start recording", () => {
    render(
      <ConversationModeView onExit={() => {}} onResearch={mockResearch} />,
    );
    expect(
      screen.getByRole("button", { name: /start recording/i }),
    ).toBeInTheDocument();
  });

  it("calls onExit when back button is clicked", async () => {
    const onExit = vi.fn();
    const user = userEvent.setup();
    render(
      <ConversationModeView onExit={onExit} onResearch={mockResearch} />,
    );
    await user.click(
      screen.getByRole("button", { name: /exit conversation mode/i }),
    );
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it("shows stop button when recording", async () => {
    const user = userEvent.setup();
    render(
      <ConversationModeView onExit={() => {}} onResearch={mockResearch} />,
    );
    await user.click(
      screen.getByRole("button", { name: /start recording/i }),
    );
    expect(
      screen.getByRole("button", { name: /stop recording/i }),
    ).toBeInTheDocument();
  });

  it("displays user text after speaking", async () => {
    const user = userEvent.setup();
    render(
      <ConversationModeView onExit={() => {}} onResearch={mockResearch} />,
    );
    await user.click(
      screen.getByRole("button", { name: /start recording/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /stop recording/i }),
    );
    expect(screen.getByText("Tap the mic to start")).toBeInTheDocument();
  });
});
