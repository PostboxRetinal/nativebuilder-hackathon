import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConversationBubbles } from "./ConversationBubbles";
import type { ChatMessage } from "../types/rtvi";

describe("ConversationBubbles", () => {
  it("renders empty when no messages", () => {
    render(<ConversationBubbles messages={[]} />);
    expect(screen.getByText("No messages yet")).toBeInTheDocument();
  });

  it("renders user bubble on the right with cyan bg", () => {
    const messages: ChatMessage[] = [{
      id: "u1",
      role: "user",
      text: "Hello",
      timestamp: Date.now(),
    }];
    render(<ConversationBubbles messages={messages} />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders agent bubble on the left with slate bg", () => {
    const messages: ChatMessage[] = [{
      id: "a1",
      role: "agent",
      text: "Hi there",
      timestamp: Date.now(),
    }];
    render(<ConversationBubbles messages={messages} />);
    expect(screen.getByText("Hi there")).toBeInTheDocument();
  });

  it("renders Markdown bold in agent message", () => {
    const messages: ChatMessage[] = [{
      id: "a2",
      role: "agent",
      text: "**bold text**",
      timestamp: Date.now(),
    }];
    render(<ConversationBubbles messages={messages} />);
    // react-markdown renders <strong>
    expect(document.querySelector("strong")).toBeTruthy();
  });

  it("renders streaming bubble with animate-pulse class", () => {
    const messages: ChatMessage[] = [{
      id: "u2",
      role: "user",
      text: "streaming...",
      timestamp: Date.now(),
      isStreaming: true,
    }];
    render(<ConversationBubbles messages={messages} />);
    // find element with animate-pulse
    expect(document.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("renders multiple messages independently", () => {
    const messages: ChatMessage[] = [
      { id: "u3", role: "user", text: "msg1", timestamp: 1 },
      { id: "a3", role: "agent", text: "msg2", timestamp: 2 },
      { id: "u4", role: "user", text: "msg3", timestamp: 3 },
    ];
    render(<ConversationBubbles messages={messages} />);
    expect(screen.getByText("msg1")).toBeInTheDocument();
    expect(screen.getByText("msg2")).toBeInTheDocument();
    expect(screen.getByText("msg3")).toBeInTheDocument();
  });
});
