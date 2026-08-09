import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ChatBubble from "../ChatBubble";

describe("ChatBubble", () => {
  it("renders user bubble with accent-surface class", () => {
    render(<ChatBubble role="user" content="hello" />);
    const el = screen.getByTestId("message-user");
    expect(el.className).toContain("accent-surface");
  });

  it("does not use legacy blue", () => {
    render(<ChatBubble role="user" content="hi" />);
    expect(screen.getByTestId("message-user").className).not.toContain("blue-600");
  });

  it("renders assistant bubble with assistant-markdown surface", () => {
    render(<ChatBubble role="assistant" content="resp" />);
    const el = screen.getByTestId("message-assistant");
    expect(el.className).toContain("assistant-markdown");
  });

  it("renders markdown code fences in the user bubble", () => {
    const { container } = render(<ChatBubble role="user" content={"```js\nconst a = 1;\n```"} />);
    expect(container.querySelector("code")).not.toBeNull();
    expect(screen.getByText("const a = 1;")).toBeInTheDocument();
  });

  it("renders inline markdown in the user bubble instead of raw markers", () => {
    const { container } = render(<ChatBubble role="user" content={"**bold** and `code`"} />);
    expect(container.querySelector("strong")).toHaveTextContent("bold");
    expect(container.querySelector("code")).toHaveTextContent("code");
    expect(screen.queryByText("**bold**")).not.toBeInTheDocument();
  });
});
