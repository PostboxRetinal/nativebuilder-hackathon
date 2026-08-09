interface VoiceTranscriptEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onReRecord: () => void;
  onClose: () => void;
}

// Transcript edit screen shown after STT finalizes. Rendered by
// ConversationView above the composer row (never inside it), so it cannot
// stretch the 44px input bar.
function VoiceTranscriptEditor({
  value,
  onChange,
  onSubmit,
  onReRecord,
  onClose,
}: VoiceTranscriptEditorProps) {
  return (
    <div className="w-full mx-auto flex flex-col gap-3 rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Transcript</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close transcript"
          title="Close transcript"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <label htmlFor="voice-edit" className="sr-only">
        Edit your transcription
      </label>
      <textarea
        id="voice-edit"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring transition-colors text-sm resize-none"
        placeholder="Your transcription will appear here…"
      />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim()}
          className="flex-1 py-2.5 px-4 rounded-lg bg-accent text-background font-semibold text-sm transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring cursor-pointer"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={onReRecord}
          className="flex-1 py-2.5 px-4 rounded-lg bg-muted border border-border text-foreground text-sm font-medium transition-all duration-150 hover:bg-border active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring cursor-pointer"
        >
          Re-record
        </button>
      </div>
    </div>
  );
}

export default VoiceTranscriptEditor;
