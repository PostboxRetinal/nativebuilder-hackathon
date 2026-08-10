import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
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
});
