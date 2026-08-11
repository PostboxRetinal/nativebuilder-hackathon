import { useCallback, useState } from "react";
import { useConversations } from "../contexts/ConversationsContext";
import { useResearch } from "../hooks/useResearch";
import ConversationModeView from "./ConversationModeView";
import { createAdapters } from "../adapters/createAdapters";
import { AssistantThread } from "./assistant/AssistantThread";
import { ChatErrorBoundary } from "./assistant/ErrorBoundary";

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

interface ConversationViewProps {
  conversationId: string;
}

function ConversationView({ conversationId }: ConversationViewProps): React.ReactNode {
  const { conversations, updateTitle } = useConversations();
  const { researching, runResearch } = useResearch();
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [model] = useState<string | null>(null);
  const [inConversationMode, setInConversationMode] = useState(false);

  const conversation = conversations.find((c) => c.id === conversationId);
  const currentTitle = conversation?.title ?? "New Conversation";

  const handleResearch = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (trimmed.length < 3) {
        return "I didn't catch that. Could you please repeat?";
      }
      const result = await runResearch(trimmed, undefined, model ?? undefined);
      return result?.answer ?? "Sorry, I could not process that.";
    },
    [runResearch, model],
  );

  if (inConversationMode) {
    return (
      <ConversationModeView
        conversationId={conversationId}
        onExit={() => setInConversationMode(false)}
        onResearch={handleResearch}
        sttAdapter={createAdapters().stt}
        ttsAdapter={createAdapters().tts}
      />
    );
  }

  return (
    <ChatErrorBoundary>
      <div data-testid="chat-column" className="flex h-full flex-col mx-auto w-full max-w-3xl bg-background text-foreground">
        {/* Top bar */}
        <header className="bg-surface flex items-center justify-between gap-4 p-4">
          <div className="min-w-0 flex-1">
            {editingTitle ? (
              <input
                type="text"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateTitle(conversationId, draftTitle.trim() || currentTitle);
                    setEditingTitle(false);
                  }
                  if (e.key === "Escape") setEditingTitle(false);
                }}
                onBlur={() => {
                  updateTitle(conversationId, draftTitle.trim() || currentTitle);
                  setEditingTitle(false);
                }}
                autoFocus
                className="w-full rounded bg-transparent text-base font-semibold tracking-tight outline-none ring-1 ring-border focus:ring-accent"
                aria-label="Conversation title"
              />
            ) : (
              <h1
                className="min-w-0 truncate text-base font-semibold tracking-tight cursor-pointer hover:text-accent transition-colors inline-flex items-center gap-1.5"
                title="Click to edit title"
                onClick={() => {
                  setDraftTitle(currentTitle);
                  setEditingTitle(true);
                }}
              >
                {currentTitle}
                <PencilIcon className="opacity-40 hover:opacity-70 shrink-0" />
              </h1>
            )}
          </div>
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
          </div>
        </header>

        {/* Messages + Composer via assistant-ui */}
        <main className="flex min-h-0 flex-1 overflow-hidden">
          <AssistantThread onResearch={handleResearch} />
        </main>
      </div>
    </ChatErrorBoundary>
  );
}

export default ConversationView;
