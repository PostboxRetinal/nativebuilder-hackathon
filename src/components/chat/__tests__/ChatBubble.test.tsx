import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ChatBubble from "../ChatBubble";

describe("ChatBubble", () => {
  it("renders assistant content as markdown", () => {
    render(<ChatBubble role="assistant" content="**bold text**" />);
    const target = screen.getByText("bold text");
    expect(target.tagName).toBe("STRONG");
    expect(target.closest('[data-testid="message-assistant"]')).not.toBeNull();
  });

  it("renders user content as plain text, not markdown", () => {
    render(<ChatBubble role="user" content="**not bold**" />);
    const text = screen.getByText("**not bold**");
    expect(text.tagName).toBe("DIV");
    expect(text.closest('[data-testid="message-user"]')).not.toBeNull();
  });

  it("opens rendered links in a new tab with noopener", () => {
    render(
      <ChatBubble
        role="assistant"
        content="[link](https://example.com)"
      />,
    );
    const anchor = screen.getByRole("link", { name: "link" });
    expect(anchor).toHaveAttribute("target", "_blank");
    expect(anchor).toHaveAttribute("rel", "noopener noreferrer");
  });
});
