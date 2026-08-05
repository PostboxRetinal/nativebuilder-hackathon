import { useCallback, useState } from "react";
import { useMessages } from "../hooks/useMessages";
import { useConversations } from "../hooks/useConversations";
import MessageList from "./MessageList";
import VoiceInput from "./VoiceInput";

interface ConversationViewProps {
  conversationId: string;
  onBack: () => void;
}

function ConversationView({
  conversationId,
  onBack,
}: ConversationViewProps): React.ReactNode {
  const { messages, addMessage } = useMessages(conversationId);
  const { conversations, updateTitle } = useConversations();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  const conversation = conversations.find((c) => c.id === conversationId);
  const currentTitle = conversation?.title ?? "New Conversation";

  const handleSendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const isFirstMessage = messages.length === 0;

      await addMessage("user", trimmed);

      console.log("[Edge Function] Triggering research for:", trimmed);

      if (isFirstMessage) {
        await updateTitle(conversationId, trimmed.slice(0, 30));
      }
    },
    [conversationId, messages.length, addMessage, updateTitle],
  );

  const handleTitleBlur = useCallback(async () => {
    setIsEditingTitle(false);
    if (editTitle && editTitle !== currentTitle) {
      await updateTitle(conversationId, editTitle);
    }
  }, [conversationId, editTitle, currentTitle, updateTitle]);

  const handleTitleDoubleClick = useCallback(() => {
    setEditTitle(currentTitle);
    setIsEditingTitle(true);
  }, [currentTitle]);

  return (
    <div className="flex h-full w-full flex-col bg-black text-white">
      <header className="flex items-center gap-4 border-b border-zinc-800 p-4">
        <button
          onClick={onBack}
          className="p-2 transition-colors hover:bg-zinc-900 rounded-full"
          aria-label="Go back"
        >
          <span className="text-lg">&larr;</span>
        </button>
        {isEditingTitle ? (
          <input
            autoFocus
            className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 outline-none"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
          />
        ) : (
          <h1
            onDoubleClick={handleTitleDoubleClick}
            className="cursor-pointer text-lg font-medium transition-colors hover:text-zinc-400"
          >
            {currentTitle}
          </h1>
        )}
      </header>

      <main className="flex-1 overflow-hidden">
        <MessageList conversationId={conversationId} />
      </main>

      <footer className="border-t border-zinc-800 bg-black p-4">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          <VoiceInput onTranscriptFinal={handleSendMessage} />
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const input = form.elements.namedItem(
                "message",
              ) as HTMLInputElement;
              handleSendMessage(input.value);
              input.value = "";
            }}
          >
            <input
              name="message"
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 outline-none transition-colors focus:border-zinc-600"
            />
            <button
              type="submit"
              className="rounded-lg bg-white px-4 py-2 font-medium text-black transition-colors hover:bg-zinc-200"
            >
              Send
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}

export default ConversationView;
