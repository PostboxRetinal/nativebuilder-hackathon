import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ChatList from "../ChatList";
import type { Message } from "../../../types/models";

const messages: Message[] = [
  {
    id: "1",
    role: "user",
    content: "hi",
    created_at: "2026-01-01T00:00:00Z",
    order_index: 0,
    sources: null,
  },
  {
    id: "2",
    role: "assistant",
    content: "hello",
    created_at: "2026-01-01T00:00:01Z",
    order_index: 1,
    sources: [],
  },
];

describe("ChatList", () => {
  it("renders all messages", () => {
    render(<ChatList messages={messages} loading={false} />);
    expect(screen.getByText("hi")).toBeInTheDocument();
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("shows the researching indicator when researching", () => {
    render(<ChatList messages={[]} loading={false} researching />);
    expect(screen.getByText(/Researching/)).toBeInTheDocument();
  });

  it("hides the researching indicator when not researching", () => {
    render(<ChatList messages={[]} loading={false} researching={false} />);
    expect(screen.queryByText(/Researching/)).not.toBeInTheDocument();
  });

  it("shows the empty state when there are no messages", () => {
    render(<ChatList messages={[]} loading={false} researching={false} />);
    expect(screen.getByText(/No messages yet/)).toBeInTheDocument();
  });

  it("shows the loading state while loading", () => {
    render(<ChatList messages={[]} loading />);
    expect(screen.getByText(/Loading messages/)).toBeInTheDocument();
  });
});
