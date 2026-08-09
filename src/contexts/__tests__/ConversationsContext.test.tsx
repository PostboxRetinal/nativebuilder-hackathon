import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { ConversationsProvider, useConversations } from "../ConversationsContext";

const [mockFrom, mockChannel, mockRemoveChannel, mockGetSession, mockOnAuthStateChange] = vi.hoisted(() => [
  vi.fn(),
  vi.fn(() => ({ on: vi.fn(() => ({ subscribe: vi.fn() })) })),
  vi.fn(),
  vi.fn(),
  vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
]);

vi.mock("../../lib/supabase", () => ({
  supabase: {
    from: mockFrom,
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
}));

vi.mock("../AuthContext", () => ({
  useAuth: vi.fn(() => ({ user: { id: "u1" } })),
}));

function TestConsumer() {
  const { conversations, loading, createConversation, deleteConversation, updateTitle } = useConversations();
  return (
    <div>
      <span>{loading ? "loading" : "ready"}</span>
      <span>count:{conversations.length}</span>
      <button onClick={() => createConversation()}>create</button>
      <button onClick={() => deleteConversation("c1")}>delete</button>
      <button onClick={() => updateTitle("c1", "new title")}>update</button>
    </div>
  );
}

describe("ConversationsContext", () => {
  it("provides initial empty state after fetch", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    });

    render(
      <ConversationsProvider>
        <TestConsumer />
      </ConversationsProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("ready")).toBeInTheDocument();
    });
    expect(screen.getByText("count:0")).toBeInTheDocument();
  });

  it("createConversation adds a conversation optimistically", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "conversations") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({
                  data: { id: "c1", title: "New conversation", created_at: "2026-01-01" },
                  error: null,
                }),
              ),
            })),
          })),
        };
      }
      return {};
    });

    render(
      <ConversationsProvider>
        <TestConsumer />
      </ConversationsProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("ready")).toBeInTheDocument();
    });

    await act(async () => {
      screen.getByText("create").click();
    });

    await waitFor(() => {
      expect(screen.getByText("count:1")).toBeInTheDocument();
    });
  });

  it("deleteConversation removes from state", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "conversations") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() =>
                Promise.resolve({
                  data: [
                    { id: "c1", title: "A", created_at: "2026-01-01" },
                    { id: "c2", title: "B", created_at: "2026-01-02" },
                  ],
                  error: null,
                }),
              ),
            })),
          })),
          delete: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null })),
          })),
        };
      }
      return {};
    });

    render(
      <ConversationsProvider>
        <TestConsumer />
      </ConversationsProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("count:2")).toBeInTheDocument();
    });

    await act(async () => {
      screen.getByText("delete").click();
    });

    await waitFor(() => {
      expect(screen.getByText("count:1")).toBeInTheDocument();
    });
  });

  it("updateTitle calls supabase update", async () => {
    const mockUpdateEq = vi.fn(() => Promise.resolve({ error: null }));
    mockFrom.mockImplementation((table: string) => {
      if (table === "conversations") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
          update: vi.fn(() => ({
            eq: mockUpdateEq,
          })),
        };
      }
      return {};
    });

    render(
      <ConversationsProvider>
        <TestConsumer />
      </ConversationsProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("ready")).toBeInTheDocument();
    });

    await act(async () => {
      screen.getByText("update").click();
    });

    expect(mockUpdateEq).toHaveBeenCalled();
  });
});
