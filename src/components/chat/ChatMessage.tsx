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

interface ChatMessageProps {
  role: Message["role"];
  content: string;
  sources?: unknown;
}

function ChatMessage({ role, content, sources }: ChatMessageProps) {
  const citations = role === "assistant" ? normalizeSources(sources) : [];
  return (
    <div className="flex flex-col gap-1">
      <ChatBubble role={role} content={content} />
      {citations.length > 0 && (
        <div className="mr-auto flex flex-col">
          {citations.map((s, i) => (
            <SourceCitation
              key={s.url ? `${s.url}-${i}` : `source-${i}`}
              source={s}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ChatMessage;
