interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

function ChatComposer({ value, onChange, onSubmit, disabled = false }: ChatComposerProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed.length === 0 || disabled) return;
      onSubmit(trimmed);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length === 0 || disabled) return;
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-2">
      <textarea
        key="message-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Type a message..."
        rows={1}
        className="min-h-11 min-w-0 flex-1 resize-y rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/40 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled}
        className="h-11 shrink-0 rounded-lg bg-accent px-4 text-sm font-semibold text-on-accent transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}

export default ChatComposer;
