import { useCallback, useRef, useState } from "react";
import { useMessages } from "../hooks/useMessages";
import { useConversations } from "../contexts/ConversationsContext";
import { useResearch } from "../hooks/useResearch";
import { useVoiceComposer } from "../hooks/useVoiceComposer";
import MessageList from "./MessageList";
import VoiceInput from "./VoiceInput";
import ModelSelector, { getActiveModel } from "./ModelSelector";
import ChatComposer from "./chat/ChatComposer";
import TranscriptionPreview from "./chat/TranscriptionPreview";
import VoiceTranscriptEditor from "./chat/VoiceTranscriptEditor";
import ConversationModeView from "./ConversationModeView";
import { createAdapters } from "../adapters/createAdapters";

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
  const { messages, loading, addMessage } = useMessages(conversationId);
  const { conversations, updateTitle } = useConversations();
  const { researching, runResearch } = useResearch();
  const [textInput, setTextInput] = useState("");
  const [model, setModel] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const isFirstMessage = useRef(true);
  const [inConversationMode, setInConversationMode] = useState(false);

  const voice = useVoiceComposer((text) => void sendMessage(text));

  const conversation = conversations.find((c) => c.id === conversationId);
  const currentTitle = conversation?.title ?? "New Conversation";
  const activeModel = getActiveModel(model);
  const activeModelLabel = activeModel
    ? `${activeModel.label} · $${activeModel.priceIn} in / $${activeModel.priceOut} out (per 1M tokens)`
    : "";

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

  const showPreview =
    voice.state === "recording" || !!voice.partialText || !!voice.finalText;

  const handleResearch = useCallback(
    async (text: string, modelOverride?: string) => {
      const trimmed = text.trim();
      if (trimmed.length < 3) {
        return "I didn't catch that. Could you please repeat?";
      }
      const activeModel = modelOverride ?? model;
      const result = await runResearch(trimmed, undefined, activeModel ?? undefined);
      return result?.answer ?? "Sorry, I could not process that.";
    },
    [runResearch, model],
  );

  if (inConversationMode) {
    return (
      <ConversationModeView
        onExit={() => setInConversationMode(false)}
        onResearch={handleResearch}
        sttAdapter={createAdapters().stt}
        ttsAdapter={createAdapters().tts}
      />
    );
  }

  return (
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

      {/* Messages */}
      <main className="flex min-h-0 flex-1 overflow-hidden bg-background">
        <MessageList
          researching={researching}
          messages={messages}
          loading={loading}
        />
      </main>

      {/* Input */}
      <footer className="bg-surface px-4 py-3">
        <div className="w-full space-y-2">
          {/* STT blocks above the composer row so they never stretch it */}
          {voice.state === "done" ? (
            <VoiceTranscriptEditor
              value={voice.editedText}
              onChange={voice.setEditedText}
              onSubmit={voice.submitEdit}
              onReRecord={voice.reRecord}
              onClose={voice.reset}
            />
          ) : (
            showPreview && (
              <TranscriptionPreview
                partialText={voice.partialText}
                finalText={voice.finalText}
                isRecording={voice.state === "recording"}
              />
            )
          )}

          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2">
            <ModelSelector value={model} onChange={setModel} />
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <ChatComposer
                value={textInput}
                onChange={setTextInput}
                onSubmit={handleSubmit}
                disabled={researching}
              />
              <VoiceInput
                state={voice.state}
                error={voice.error}
                language={voice.language}
                onLanguageChange={voice.setLanguage}
                onStart={voice.startRecording}
                onStop={voice.stopRecording}
                onRetry={voice.startRecording}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-1 pt-0.5">
            <span className="truncate pr-3 text-[11px] font-mono text-muted-foreground/70">
              {activeModelLabel}
            </span>
            <span className="shrink-0 text-[11px] text-muted-foreground/50">
              Enter to send · Shift+Enter for newline
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ConversationView;
