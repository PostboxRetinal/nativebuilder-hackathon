interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (text: string) => void;
}

function ChatComposer({ value, onChange, onSubmit }: ChatComposerProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length === 0) return;
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 gap-2">
      <input
        key="message-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 outline-none transition-colors focus:border-zinc-600"
      />
      <button
        type="submit"
        className="rounded-lg bg-white px-4 py-2 font-medium text-black transition-colors hover:bg-zinc-200"
      >
        Send
      </button>
    </form>
  );
}

export default ChatComposer;
