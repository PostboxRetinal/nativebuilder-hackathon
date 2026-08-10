import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConversationOrb from "./ConversationOrb";

describe("ConversationOrb", () => {
  it("renders with conversation mode label", () => {
    render(<ConversationOrb onClick={() => {}} />);
    expect(screen.getByRole("button", { name: /conversation mode/i })).toBeInTheDocument();
  });

  it("calls onClick when tapped", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ConversationOrb onClick={onClick} />);
    await user.click(screen.getByRole("button", { name: /conversation mode/i }));
    expect(onClick).toHaveBeenCalled();
  });

  it("has pulsing animation class", () => {
    render(<ConversationOrb onClick={() => {}} />);
    const btn = screen.getByRole("button", { name: /conversation mode/i });
    const pulseEl = btn.querySelector(".animate-pulse");
    expect(pulseEl).not.toBeNull();
  });

  it("does not look like a mic (no mic-specific aria-labels)", () => {
    render(<ConversationOrb onClick={() => {}} />);
    expect(screen.queryByLabelText(/record/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/tap to record/i)).not.toBeInTheDocument();
  });
});
