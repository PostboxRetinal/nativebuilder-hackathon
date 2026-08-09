interface TranscriptionPreviewProps {
  partialText: string;
  finalText: string;
  isRecording: boolean;
}

// Live STT transcription preview. Rendered by ConversationView above the
// composer row, never inside the 44px flex row (which would break the bottom
// bar).
function TranscriptionPreview({
  partialText,
  finalText,
  isRecording,
}: TranscriptionPreviewProps) {
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

export default TranscriptionPreview;
