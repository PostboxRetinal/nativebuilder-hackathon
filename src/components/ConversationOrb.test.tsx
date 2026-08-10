import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import ConversationOrb from "./ConversationOrb";

describe("ConversationOrb", () => {
  it("renders with idle state", () => {
    render(<ConversationOrb state="idle" />);
    expect(document.body).toBeTruthy();
  });

  it("renders with listening state", () => {
    render(<ConversationOrb state="listening" />);
    expect(document.body).toBeTruthy();
  });

  it("renders with processing state", () => {
    render(<ConversationOrb state="processing" />);
    expect(document.body).toBeTruthy();
  });

  it("renders with speaking state", () => {
    render(<ConversationOrb state="speaking" />);
    expect(document.body).toBeTruthy();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    const { container } = render(<ConversationOrb state="idle" onClick={onClick} />);
    const button = container.querySelector("button");
    expect(button).toBeTruthy();
    fireEvent.click(button!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled (processing)", () => {
    const onClick = vi.fn();
    const { container } = render(<ConversationOrb state="processing" onClick={onClick} />);
    const button = container.querySelector("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("decorative spans have pointer-events-none so clicks pass through", () => {
    const { container } = render(<ConversationOrb state="listening" />);
    const spans = container.querySelectorAll("span.absolute");
    spans.forEach((span) => {
      expect(span.classList.contains("pointer-events-none")).toBe(true);
    });
  });
});
