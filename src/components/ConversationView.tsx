import { useCallback, useRef, useState } from "react";
import { useMessages } from "../hooks/useMessages";
import { useConversations } from "../contexts/ConversationsContext";
import { useResearch } from "../hooks/useResearch";
import MessageList from "./MessageList";
import VoiceInput from "./VoiceInput";
import ModelSelector from "./ModelSelector";

interface ConversationViewProps {
  conversationId: string;
}

function ConversationView({ conversationId }: ConversationViewProps): React.ReactNode {
  const { messages, loading, addMessage } = useMessages(conversationId);
  const { conversations, updateTitle } = useConversations();
  const { researching, runResearch } = useResearch();
  const [textInput, setTextInput] = useState("");
  const [model, setModel] = useState<string | null>(null);
  const isFirstMessage = useRef(true);

  const conversation = conversations.find((c) => c.id === conversationId);
  const currentTitle = conversation?.title ?? "New Conversation";

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (trimmed.length === 0) return;

      await addMessage("user", trimmed);

      // Auto-title on first user message.
      if (isFirstMessage.current) {
        isFirstMessage.current = false;
        await updateTitle(conversationId, trimmed.slice(0, 30));
      }

      const result = await runResearch(trimmed, undefined, model ?? undefined);
      if (result != null) {
        await addMessage("assistant", result.answer, result.sources);
      }
    },
    [conversationId, addMessage, updateTitle, runResearch, model],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (textInput.trim().length === 0) return;
      sendMessage(textInput);
      setTextInput("");
    },
    [textInput, sendMessage],
  );

  return (
    <div className="flex h-full flex-col bg-black text-white">
      {/* Top bar */}
      <header className="flex items-center gap-4 border-b border-zinc-800 p-4">
        <h1 className="text-lg font-medium">{currentTitle}</h1>
        <div className="ml-auto">
          <ModelSelector value={model} onChange={setModel} />
        </div>
      </header>

      {/* Messages */}
      <main className="flex min-h-0 flex-1 overflow-hidden bg-black">
        <MessageList
          researching={researching}
          messages={messages}
          loading={loading}
        />
      </main>

      {/* Input */}
      <footer className="border-t border-zinc-800 p-4">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <form onSubmit={handleSubmit} className="flex flex-1 gap-2">
            <input
              key="message-input"
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
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
          <VoiceInput onTranscriptFinal={sendMessage} />
        </div>
      </footer>
    </div>
  );
}

export default ConversationView;
