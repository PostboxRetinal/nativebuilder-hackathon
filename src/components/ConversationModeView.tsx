import { useState, useRef } from "react";
import type { STTAdapter, TTSAdapter } from "../types/rtvi";
import { useVoiceAgent } from "../hooks/useVoiceAgent";
import { ConversationBubbles } from "./ConversationBubbles";
import WaveformVisualizer from "./WaveformVisualizer";
import ModelSelector from "./ModelSelector";

interface ConversationModeViewProps {
  onExit: () => void;
  onResearch: (text: string, model?: string) => Promise<string>;
  sttAdapter: STTAdapter;
  ttsAdapter: TTSAdapter;
}

export default function ConversationModeView({
  onExit,
  onResearch,
  sttAdapter,
  ttsAdapter,
}: ConversationModeViewProps) {
  const [model, setModel] = useState<string | null>(null);
  const lastSpokenRef = useRef<string>("");

  const {
    state,
    messages,
    isListening,
    isSpeaking,
    error,
    startListening,
    stopListening,
    speak,
  } = useVoiceAgent({
    sttAdapter,
    ttsAdapter,
    language: "en",
    onUserTranscriptFinal: async (text) => {
      const response = await onResearch(text, model ?? undefined);
      if (response && response !== lastSpokenRef.current) {
        lastSpokenRef.current = response;
        await speak(response);
      }
    },
  });

  const isProcessing = state === "processing";

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
          {isListening && <WaveformVisualizer stream={null} isRecording={true} />}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing || isSpeaking}
              aria-label={isListening ? "Stop recording" : "Start recording"}
              className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 ${
                isListening ? "bg-destructive text-white" : "bg-cyan-500 text-white"
              }`}
            >
              {isListening ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="23" /><line x1="8" x2="16" y1="23" y2="23" /></svg>
              )}
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            {isListening ? "Tap to stop" : isProcessing ? "Processing..." : isSpeaking ? "Agent speaking..." : "Tap the mic to start"}
          </p>
          {error && <p className="text-[11px] text-destructive">{error}</p>}
        </div>
      </footer>
    </div>
  );
}
