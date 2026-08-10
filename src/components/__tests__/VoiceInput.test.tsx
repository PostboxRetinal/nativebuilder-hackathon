import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VoiceInput from "../VoiceInput";

const baseProps = {
  error: "",
  language: "en" as const,
  onLanguageChange: vi.fn(),
  onStart: vi.fn(),
  onStop: vi.fn(),
  onRetry: vi.fn(),
};

describe("VoiceInput", () => {
  it("renders mic button and STT language select in idle", () => {
    render(<VoiceInput {...baseProps} state="idle" />);
    expect(screen.getByRole("button", { name: /tap to record/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/transcription language/i)).toBeInTheDocument();
  });

  it("calls onStart when mic clicked in idle", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<VoiceInput {...baseProps} state="idle" onStart={onStart} />);
    await user.click(screen.getByRole("button", { name: /tap to record/i }));
    expect(onStart).toHaveBeenCalled();
  });

  it("calls onStop when mic clicked while recording", async () => {
    const user = userEvent.setup();
    const onStop = vi.fn();
    render(<VoiceInput {...baseProps} state="recording" onStop={onStop} />);
    await user.click(screen.getByRole("button", { name: /stop recording/i }));
    expect(onStop).toHaveBeenCalled();
  });

  it("renders disabled finalizing state while processing", () => {
    render(<VoiceInput {...baseProps} state="processing" />);
    const btn = screen.getByRole("button", { name: /finalizing/i });
    expect(btn).toBeDisabled();
  });

  it("renders error text and calls onRetry when clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <VoiceInput
        {...baseProps}
        state="error"
        error="Mic access denied"
        onRetry={onRetry}
      />,
    );
    const btn = screen.getByRole("button", { name: /mic access denied/i });
    expect(btn).toBeInTheDocument();
    await user.click(btn);
    expect(onRetry).toHaveBeenCalled();
  });

  it("falls back to 'Tap to retry' when error is empty", () => {
    render(<VoiceInput {...baseProps} state="error" error="" />);
    expect(screen.getByRole("button", { name: /tap to retry/i })).toBeInTheDocument();
  });
});
