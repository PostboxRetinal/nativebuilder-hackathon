import { useConversationSession } from "../hooks/useConversationSession";
import WaveformVisualizer from "./WaveformVisualizer";

interface ConversationModeViewProps {
  onExit: () => void;
  onResearch: (text: string) => Promise<string>;
}

export default function ConversationModeView({
  onExit,
  onResearch,
}: ConversationModeViewProps) {
  const {
    state,
    userText,
    agentText,
    stream,
    startListening,
    stopListening,
  } = useConversationSession("en", onResearch);

  const isListening = state === "listening";
  const isProcessing = state === "processing";
  const isSpeaking = state === "speaking";

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
        <div className="w-16" />
      </header>

      <main className="flex min-h-0 flex-1 gap-4 p-4">
        <section aria-label="Your transcription" className="flex flex-1 flex-col rounded-xl border border-border bg-surface/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full ${isListening ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-500/10 text-cyan-400/60"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="23" /><line x1="8" x2="16" y1="23" y2="23" /></svg>
            </div>
            <span className="text-xs font-medium text-muted-foreground">You</span>
            {isListening && <span className="ml-auto flex items-center gap-1 text-[10px] text-cyan-400"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />Listening</span>}
          </div>
          <div className="flex-1 overflow-y-auto">
            <p className={`text-sm ${userText ? "text-foreground" : "text-muted-foreground"}`}>{userText || "Tap the microphone to start speaking"}</p>
          </div>
        </section>

        <section aria-label="Agent response" className="flex flex-1 flex-col rounded-xl border border-border bg-surface/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full ${isSpeaking ? "bg-violet-500/20 text-violet-400" : "bg-violet-500/10 text-violet-400/60"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
            </div>
            <span className="text-xs font-medium text-muted-foreground">Agent</span>
            {isProcessing && <span className="ml-auto text-[10px] text-violet-400">Thinking...</span>}
            {isSpeaking && <span className="ml-auto flex items-center gap-1 text-[10px] text-violet-400"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />Speaking</span>}
          </div>
          <div className="flex-1 overflow-y-auto">
            <p className={`text-sm ${agentText ? "text-foreground" : "text-muted-foreground"}`}>{agentText || "Waiting..."}</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface px-4 py-3">
        <div className="flex flex-col items-center gap-2">
          {isListening && <WaveformVisualizer stream={stream} isRecording={true} />}
          <div className="flex items-center justify-center gap-3">
            {isListening ? (
              <button type="button" onClick={stopListening} aria-label="Stop recording" className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive text-white shadow-lg transition-transform hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2" /></svg>
              </button>
            ) : (
              <button type="button" onClick={startListening} disabled={isProcessing || isSpeaking} aria-label="Start recording" className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-white shadow-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="23" /><line x1="8" x2="16" y1="23" y2="23" /></svg>
              </button>
            )}
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            {isListening ? "Tap stop when finished" : isProcessing ? "Processing your request..." : isSpeaking ? "Agent is responding..." : "Tap the mic to start"}
          </p>
        </div>
      </footer>
    </div>
  );
}
