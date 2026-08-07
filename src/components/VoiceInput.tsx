import { useState, useEffect } from "react";
import { useSpeechmatics } from "../hooks/useSpeechmatics";
import type { UseSpeechmaticsReturn } from "../hooks/useSpeechmatics";
import type { SpeechLanguage } from "../hooks/useSpeechmatics";

// ── Inline SVG icons (avoids pulling in all of lucide-react → OOM in sandbox) ──

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

function SquareIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      className={`animate-spin ${className ?? ""}`}
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export interface VoiceInputProps {
  onTranscriptFinal: (transcript: string) => void;
}

export default function VoiceInput({ onTranscriptFinal }: VoiceInputProps) {
  const [language, setLanguage] = useState<SpeechLanguage>("en");
  const {
    state,
    partialText,
    finalText,
    error,
    startRecording,
    stopRecording,
    reset,
  } = useSpeechmatics(language);

  const [editedText, setEditedText] = useState("");

  // Populate edit area when transcription finishes
  useEffect(() => {
    if (state === "done" && finalText) {
      setEditedText(finalText);
    }
  }, [state, finalText]);

  const handleSubmit = () => {
    const trimmed = editedText.trim();
    if (!trimmed) return;
    onTranscriptFinal(trimmed);
    setEditedText("");
    reset();
  };

  const handleReRecord = () => {
    setEditedText("");
    reset();
  };

  // ---- Edit Area (shown after recording completes) ----
  if (state === "done") {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-3">
        <label htmlFor="voice-edit" className="sr-only">
          Edit your transcription
        </label>
        <textarea
          id="voice-edit"
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring transition-colors text-sm resize-none"
          placeholder="Your transcription will appear here…"
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!editedText.trim()}
            className="flex-1 py-2.5 px-4 rounded-lg bg-accent text-background font-semibold text-sm transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring cursor-pointer"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={handleReRecord}
            className="flex-1 py-2.5 px-4 rounded-lg bg-muted border border-border text-foreground text-sm font-medium transition-all duration-150 hover:bg-border active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring cursor-pointer"
          >
            Re-record
          </button>
        </div>
      </div>
    );
  }

  // ---- Main recording UI ----
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4">
      {/* Transcription Preview */}
      <TranscriptionPreview
        partialText={partialText}
        finalText={finalText}
        isRecording={state === "recording"}
      />

      {/* Record Button */}
      <RecordButton
        state={state}
        error={error}
        onStart={startRecording}
        onStop={stopRecording}
        onRetry={startRecording}
      />

      {/* Language Selector */}
      <LanguageToggle language={language} onChange={setLanguage} />
    </div>
  );
}

function LanguageToggle({
  language,
  onChange,
}: {
  language: SpeechLanguage;
  onChange: (l: SpeechLanguage) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="whitespace-nowrap">Language</span>
      <select
        aria-label="Transcription language"
        value={language}
        onChange={(e) => onChange(e.target.value as SpeechLanguage)}
        className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring cursor-pointer"
      >
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="es-bilingual">Español + English</option>
        <option value="pt">Português</option>
        <option value="fr">Français</option>
        <option value="de">Deutsch</option>
        <option value="it">Italiano</option>
        <option value="ja">日本語</option>
        <option value="cmn">普通话</option>
      </select>
    </label>
  );
}

// ──────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────

function TranscriptionPreview({
  partialText,
  finalText,
  isRecording,
}: {
  partialText: string;
  finalText: string;
  isRecording: boolean;
}) {
  if (!isRecording && !partialText && !finalText) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="w-full min-h-[3rem] max-h-32 overflow-y-auto px-4 py-3 rounded-lg bg-muted/50 border border-border/50 text-sm text-foreground/80"
    >
      {finalText && (
        <span className="text-foreground">{finalText}</span>
      )}
      {partialText && (
        <span className="italic text-foreground/50">
          {finalText ? " " : ""}
          {partialText}
        </span>
      )}
      {!finalText && !partialText && isRecording && (
        <span className="text-muted-foreground italic">Listening…</span>
      )}
    </div>
  );
}

function RecordButton({
  state,
  error,
  onStart,
  onStop,
  onRetry,
}: {
  state: UseSpeechmaticsReturn["state"];
  error: string;
  onStart: () => void;
  onStop: () => void;
  onRetry: () => void;
}) {
  const isRecording = state === "recording";
  const isProcessing = state === "processing";
  const isError = state === "error";

  let label = "";
  let icon: "mic" | "square" | "spinner" = "mic";
  let onClick: (() => void) | undefined;
  let disabled = false;
  let buttonClass = "";

  if (isRecording) {
    label = "Stop recording";
    icon = "square";
    onClick = onStop;
    buttonClass =
      "bg-destructive text-white shadow-[0_0_24px_rgba(239,68,68,0.4)] animate-pulse-recording";
  } else if (isProcessing) {
    label = "Finalizing…";
    icon = "spinner";
    disabled = true;
    buttonClass = "bg-muted text-muted-foreground/60 cursor-not-allowed";
  } else if (isError) {
    label = error || "Tap to retry";
    icon = "mic";
    onClick = onRetry;
    buttonClass =
      "bg-destructive/20 text-destructive border border-destructive/40 hover:bg-destructive/30";
  } else {
    label = "Tap to record";
    icon = "mic";
    onClick = onStart;
    buttonClass =
      "bg-muted text-foreground/70 border border-border hover:border-foreground/30 hover:text-foreground";
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        aria-pressed={isRecording}
        className={`w-[4.5rem] h-[4.5rem] rounded-full flex items-center justify-center transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring cursor-pointer ${buttonClass}`}
      >
        {icon === "spinner" ? (
          <SpinnerIcon className="w-7 h-7" />
        ) : icon === "square" ? (
          <SquareIcon className="w-7 h-7" />
        ) : (
          <MicIcon className="w-7 h-7" />
        )}
      </button>
      <span
        className={`text-xs font-medium transition-colors duration-200 ${
          isError ? "text-destructive" : "text-muted-foreground"
        }`}
      >
        {isError ? error : isProcessing ? "Finalizing…" : isRecording ? "Listening…" : "Tap to record"}
      </span>
    </div>
  );
}
