import { useState, useRef, useCallback } from "react";
import type { STTAdapter, TTSAdapter } from "../types/rtvi";
import { useVoiceAgent } from "../hooks/useVoiceAgent";
import { useMessages } from "../hooks/useMessages";
import { ConversationBubbles } from "./ConversationBubbles";
import ConversationOrb from "./ConversationOrb";
import ModelSelector from "./ModelSelector";
import type { ChatMessage } from "../types/rtvi";

interface ConversationModeViewProps {
  conversationId: string;
  onExit: () => void;
  onResearch: (text: string, model?: string) => Promise<string>;
  sttAdapter: STTAdapter;
  ttsAdapter: TTSAdapter;
}

export default function ConversationModeView({
  conversationId,
  onExit,
  onResearch,
  sttAdapter,
  ttsAdapter,
}: ConversationModeViewProps) {
  const [model, setModel] = useState<string | null>(null);
  const lastSpokenRef = useRef<string>("");
  const lastResponseRef = useRef<string>("");
  const { addMessage } = useMessages(conversationId);

  const initialMessages: ChatMessage[] = [];

  const {
    state,
    messages,
    isListening,
    isSpeaking,
    isConnecting,
    error,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useVoiceAgent({
    sttAdapter,
    ttsAdapter,
    language: "en",
    initialMessages,
    onUserTranscriptFinal: async (text) => {
      await addMessage("user", text);
      const response = await onResearch(text, model ?? undefined);
      if (!response) return;
      if (
        response === lastResponseRef.current ||
        (response === "Sorry, I could not process that." &&
          lastResponseRef.current === "Sorry, I could not process that.")
      ) {
        return;
      }
      lastResponseRef.current = response;
      lastSpokenRef.current = response;
      await addMessage("assistant", response);
      await speak(response);
    },
  });

  const isProcessing = state === "processing";

  const toggleConversation = useCallback(() => {
    if (state === "speaking") { stopSpeaking(); }
    else if (state === "listening") { stopListening(); }
    else if (state === "processing") { /* noop */ }
    else { startListening(); }
  }, [state, startListening, stopListening, stopSpeaking]);

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-3">
        <button
          type="button"
          onClick={onExit}
          aria-label="Exit conversation mode"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
          Back
        </button>
        <h1 className="text-sm font-semibold tracking-tight">Conversation Mode</h1>
        <div className="flex items-center gap-2">
          <ModelSelector value={model} onChange={setModel} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <ConversationBubbles messages={messages} />
      </main>

      <footer className="border-t border-border bg-surface px-4 py-3">
        <div className="flex flex-col items-center gap-2">
          <ConversationOrb
            state={isSpeaking ? "speaking" : isListening ? "listening" : isProcessing ? "processing" : "idle"}
            onClick={toggleConversation}
            isConnecting={isConnecting}
          />
          <p className="text-center text-[11px] text-muted-foreground">
            {isSpeaking ? "Tap orb to interrupt" : isListening ? "Tap orb to stop" : isProcessing ? "Processing..." : "Tap the orb to start"}
          </p>
          {error && <p className="text-[11px] text-destructive">{error}</p>}
        </div>
      </footer>
    </div>
  );
}
