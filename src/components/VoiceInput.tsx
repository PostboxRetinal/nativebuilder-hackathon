import type { UseSpeechmaticsReturn } from "../hooks/useSpeechmatics";
import type { SpeechLanguage } from "../hooks/useSpeechmatics";
import ConversationOrb from "./ConversationOrb";

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
  state: UseSpeechmaticsReturn["state"];
  error: string;
  language: SpeechLanguage;
  onLanguageChange: (l: SpeechLanguage) => void;
  onStart: () => void;
  onStop: () => void;
  onRetry: () => void;
  onEnterConversationMode?: () => void;
}

// Compact inline mic control that lives inside the 44px composer row. It no
// longer renders the transcription preview or the done-editor, which are
// full-width blocks owned by ConversationView (rendered above the row).
export default function VoiceInput({
  state,
  error,
  language,
  onLanguageChange,
  onStart,
  onStop,
  onRetry,
  onEnterConversationMode,
}: VoiceInputProps) {
  const isRecording = state === "recording";
  const isProcessing = state === "processing";
  const isError = state === "error";

  let label: string;
  let icon: "mic" | "square" | "spinner";
  let onClick: (() => void) | undefined;
  let disabled = false;
  let buttonClass: string;

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
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        aria-pressed={isRecording}
        className={`h-11 w-11 shrink-0 flex items-center justify-center rounded-lg transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring cursor-pointer ${buttonClass}`}
      >
        {icon === "spinner" ? (
          <SpinnerIcon className="w-5 h-5" />
        ) : icon === "square" ? (
          <SquareIcon className="w-5 h-5" />
        ) : (
          <MicIcon className="w-5 h-5" />
        )}
      </button>
      <ConversationOrb state="idle" onClick={onEnterConversationMode} />
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="whitespace-nowrap">STT</span>
        <select
          aria-label="Transcription language"
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as SpeechLanguage)}
          className="max-w-[6rem] rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring cursor-pointer"
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
    </div>
  );
}
