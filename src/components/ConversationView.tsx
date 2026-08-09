import { useCallback, useRef, useState } from "react";
import { useMessages } from "../hooks/useMessages";
import { useConversations } from "../contexts/ConversationsContext";
import { useResearch } from "../hooks/useResearch";
import MessageList from "./MessageList";
import VoiceInput from "./VoiceInput";
import ModelSelector, { DEFAULT_MODEL_ID, RESEARCH_MODELS } from "./ModelSelector";
import ChatComposer from "./chat/ChatComposer";

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
  const activeModel = RESEARCH_MODELS.find((m) => m.id === (model ?? DEFAULT_MODEL_ID));

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
    (text: string) => {
      sendMessage(text);
      setTextInput("");
    },
    [sendMessage],
  );

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 border-b border-border p-4">
        <h1 className="min-w-0 truncate text-base font-semibold tracking-tight">{currentTitle}</h1>
        <div className="flex shrink-0 items-center gap-2">
          {researching && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="waveform waveform-sm" role="status" aria-label="Researching">
                <span className="waveform-bar" /><span className="waveform-bar" />
                <span className="waveform-bar" /><span className="waveform-bar" />
                <span className="waveform-bar" />
              </span>
              <span>Researching</span>
            </span>
          )}
          {activeModel && (
            <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-mono text-muted-foreground">
              {activeModel.label}
            </span>
          )}
        </div>
      </header>

      {/* Messages */}
      <main className="flex min-h-0 flex-1 overflow-hidden bg-background">
        <MessageList
          researching={researching}
          messages={messages}
          loading={loading}
        />
      </main>

      {/* Input */}
      <footer className="border-t border-border p-4">
        <div className="mx-auto flex max-w-4xl flex-col gap-2">
          <div className="flex items-center gap-4">
            <ChatComposer
              value={textInput}
              onChange={setTextInput}
              onSubmit={handleSubmit}
              disabled={researching}
            />
            <VoiceInput onTranscriptFinal={sendMessage} />
          </div>
          <div className="flex justify-center">
            <ModelSelector value={model} onChange={setModel} />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ConversationView;
