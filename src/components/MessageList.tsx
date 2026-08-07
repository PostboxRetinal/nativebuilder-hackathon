import { useEffect, useRef } from "react";
import type { Message, Source } from "../hooks/useMessages";
import SourceCitation from "./SourceCitation";

interface MessageListProps {
  researching?: boolean;
  messages: Message[];
  loading: boolean;
}

function normalizeSources(sources: unknown): Source[] {
  if (!Array.isArray(sources)) return [];
  return sources.filter(
    (s): s is Source =>
      typeof s === "object" &&
      s != null &&
      typeof (s as Source).url === "string",
  );
}

function MessageList({
  researching = false,
  messages,
  loading,
}: MessageListProps): React.ReactNode {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, researching]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-black text-zinc-400">
        Loading messages...
      </div>
    );
  }

  if (messages.length === 0 && !researching) {
    return (
      <div className="flex flex-1 items-center justify-center bg-black text-zinc-500">
        No messages yet
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-black p-4">
      {messages.map((message) => (
        <div key={message.id} className="flex flex-col gap-1">
          <div
            data-testid={`message-${message.role}`}
            className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-4 py-2 ${
              message.role === "user"
                ? "ml-auto bg-blue-600 text-white rounded-br-sm"
                : "mr-auto bg-zinc-800 text-zinc-100 rounded-bl-sm"
            }`}
          >
            {message.content}
          </div>
          {message.role === "assistant" && (
            <div className="mr-auto flex flex-col">
              {normalizeSources(message.sources).map((s, i) => (
                <SourceCitation key={i} source={s} />
              ))}
            </div>
          )}
        </div>
      ))}
      {researching && (
        <div className="mr-auto max-w-[80%] rounded-lg bg-zinc-800 px-4 py-2 text-zinc-400">
          <span className="inline-flex items-center gap-2">
            Researching
            <span className="animate-pulse">…</span>
          </span>
        </div>
      )}
      <div ref={scrollRef} />
    </div>
  );
}

export default MessageList;
