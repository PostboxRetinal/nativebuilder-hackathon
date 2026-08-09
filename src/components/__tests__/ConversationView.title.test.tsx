import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConversationView from "../ConversationView";
import { useConversations } from "../../contexts/ConversationsContext";
import { useMessages } from "../../hooks/useMessages";
import { useResearch } from "../../hooks/useResearch";
import { useVoiceComposer } from "../../hooks/useVoiceComposer";

vi.mock("../../hooks/useMessages", () => ({ useMessages: vi.fn() }));
vi.mock("../../contexts/ConversationsContext", () => ({
  useConversations: vi.fn(),
}));
vi.mock("../../hooks/useResearch", () => ({ useResearch: vi.fn() }));
vi.mock("../../hooks/useVoiceComposer", () => ({ useVoiceComposer: vi.fn() }));

const useMessagesMock = useMessages as ReturnType<typeof vi.fn>;
const useConversationsMock = useConversations as ReturnType<typeof vi.fn>;
const useResearchMock = useResearch as ReturnType<typeof vi.fn>;
const useVoiceComposerMock = useVoiceComposer as ReturnType<typeof vi.fn>;

function renderView(title = "My Chat") {
  const updateTitle = vi.fn();
  useMessagesMock.mockReturnValue({
    messages: [],
    loading: false,
    addMessage: vi.fn(),
  });
  useConversationsMock.mockReturnValue({
    conversations: [{ id: "conv-1", title, created_at: "2026-01-01" }],
    loading: false,
    createConversation: vi.fn(),
    deleteConversation: vi.fn(),
    updateTitle,
  });
  useResearchMock.mockReturnValue({ researching: false, runResearch: vi.fn() });
  useVoiceComposerMock.mockReturnValue({
    state: "idle",
    partialText: "",
    finalText: "",
    error: "",
    language: "en",
    setLanguage: vi.fn(),
    editedText: "",
    setEditedText: vi.fn(),
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    reset: vi.fn(),
    submitEdit: vi.fn(),
    reRecord: vi.fn(),
  });
  render(<ConversationView conversationId="conv-1" />);
  return { updateTitle };
}

describe("ConversationView title editing", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows title as h1 initially", () => {
    renderView("My Chat");
    expect(screen.getByText("My Chat")).toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: /conversation title/i }),
    ).not.toBeInTheDocument();
  });

  it("switches to input on click", async () => {
    const user = userEvent.setup();
    renderView("My Chat");
    await user.click(screen.getByText("My Chat"));
    expect(
      screen.getByRole("textbox", { name: /conversation title/i }),
    ).toBeInTheDocument();
  });

  it("saves on Enter", async () => {
    const user = userEvent.setup();
    const { updateTitle } = renderView("My Chat");
    await user.click(screen.getByText("My Chat"));
    const input = screen.getByRole("textbox", {
      name: /conversation title/i,
    });
    await user.clear(input);
    await user.type(input, "Renamed");
    await user.keyboard("{Enter}");
    await waitFor(() =>
      expect(updateTitle).toHaveBeenCalledWith("conv-1", "Renamed"),
    );
  });

  it("cancels on Escape without saving", async () => {
    const user = userEvent.setup();
    const { updateTitle } = renderView("My Chat");
    await user.click(screen.getByText("My Chat"));
    const input = screen.getByRole("textbox", {
      name: /conversation title/i,
    });
    await user.type(input, "Draft");
    await user.keyboard("{Escape}");
    expect(updateTitle).not.toHaveBeenCalled();
    expect(screen.getByText("My Chat")).toBeInTheDocument();
  });

  it("saves trimmed value on blur", async () => {
    const user = userEvent.setup();
    const { updateTitle } = renderView("Old");
    await user.click(screen.getByText("Old"));
    const input = screen.getByRole("textbox", {
      name: /conversation title/i,
    });
    await user.clear(input);
    await user.type(input, "  New Title  ");
    fireEvent.blur(input);
    await waitFor(() =>
      expect(updateTitle).toHaveBeenCalledWith("conv-1", "New Title"),
    );
  });

  it("falls back to currentTitle when blurred empty", async () => {
    const user = userEvent.setup();
    const { updateTitle } = renderView("Keep");
    await user.click(screen.getByText("Keep"));
    const input = screen.getByRole("textbox", {
      name: /conversation title/i,
    });
    await user.clear(input);
    fireEvent.blur(input);
    await waitFor(() =>
      expect(updateTitle).toHaveBeenCalledWith("conv-1", "Keep"),
    );
  });
});
