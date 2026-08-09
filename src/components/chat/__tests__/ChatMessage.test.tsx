import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ChatMessage from "../ChatMessage";
import type { Source } from "../../../types/models";

const sources: Source[] = [
  { title: "Alpha", url: "https://alpha.example.com" },
  { title: "Beta", url: "https://beta.example.com" },
];

describe("ChatMessage", () => {
  it("renders source citations for assistant messages with sources", () => {
    render(<ChatMessage role="assistant" content="body" sources={sources} />);
    expect(screen.getAllByTestId("source-citation")).toHaveLength(2);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("renders no citations for user messages", () => {
    render(<ChatMessage role="user" content="hello" sources={sources} />);
    expect(screen.queryAllByTestId("source-citation")).toHaveLength(0);
  });

  it("renders no citations when sources is undefined", () => {
    render(<ChatMessage role="assistant" content="body" />);
    expect(screen.queryAllByTestId("source-citation")).toHaveLength(0);
  });

  it("ignores malformed sources", () => {
    render(<ChatMessage role="assistant" content="body" sources={[sources[0], null as unknown as Source]} />);
    expect(screen.getAllByTestId("source-citation")).toHaveLength(1);
  });

  describe("group meta", () => {
    it("shows a user label when first in group", () => {
      render(
        <ChatMessage
          role="user"
          content="hello"
          isFirstInGroup
          createdAt="2026-08-09T00:00:00Z"
        />,
      );
      expect(screen.getByText("You")).toBeInTheDocument();
    });

    it("shows a DevVoice label when assistant is first in group", () => {
      render(
        <ChatMessage
          role="assistant"
          content="answer"
          isFirstInGroup
          createdAt="2026-08-09T00:00:00Z"
        />,
      );
      expect(screen.getByText("DevVoice")).toBeInTheDocument();
    });

    it("omits the meta when not first in group", () => {
      const { container } = render(
        <ChatMessage
          role="user"
          content="hi"
          isFirstInGroup={false}
          createdAt="2026-08-09T00:00:00Z"
        />,
      );
      expect(container.querySelector("[data-testid='msg-meta']")).toBeNull();
    });
  });

  describe("numbered source pills", () => {
    it("renders a numbered pill per assistant source", () => {
      render(
        <ChatMessage
          role="assistant"
          content="body"
          sources={sources}
          isFirstInGroup
          createdAt="2026-08-09T00:00:00Z"
        />,
      );
      expect(screen.getAllByTestId("source-citation")).toHaveLength(2);
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });
});
