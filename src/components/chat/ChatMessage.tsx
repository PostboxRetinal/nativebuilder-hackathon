import type { Message, Source } from "../../types/models";
import ChatBubble from "./ChatBubble";
import SourceCitation from "../SourceCitation";

function normalizeSources(sources: unknown): Source[] {
  if (!Array.isArray(sources)) return [];
  return sources.filter(
    (s): s is Source =>
      typeof s === "object" &&
      s != null &&
      typeof (s as Source).url === "string",
  );
}

// Compact relative time used in the chat group meta (keeps bubbles tight).
function formatRelativeTime(dateString: string): string {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diff < 60) return "Just now";
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return new Date(dateString).toLocaleDateString();
}

interface ChatMessageProps {
  role: Message["role"];
  content: string;
  sources?: unknown;
  isFirstInGroup?: boolean;
  createdAt?: string | null;
}

function ChatMessage({ role, content, sources, isFirstInGroup = false, createdAt }: ChatMessageProps) {
  const citations = role === "assistant" ? normalizeSources(sources) : [];
  return (
    <div
      className={`flex flex-col gap-1 ${isFirstInGroup ? "mt-3 first:mt-0" : ""}`}
    >
      {isFirstInGroup && createdAt != null && (
        <div
          data-testid="msg-meta"
          className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground"
        >
          <span className="font-medium">{role === "user" ? "You" : "DevVoice"}</span>
          <span aria-hidden="true">·</span>
          <span>{formatRelativeTime(createdAt)}</span>
        </div>
      )}
      <ChatBubble role={role} content={content} />
      {citations.length > 0 && (
        <div className="mr-auto flex flex-wrap items-center gap-1.5 pt-1">
          {citations.map((s, i) => (
            <SourceCitation
              key={s.url ? `${s.url}-${i}` : `source-${i}`}
              source={s}
              index={i + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ChatMessage;
