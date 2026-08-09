import { useEffect, useRef } from "react";
import type { Message } from "../../types/models";
import ChatMessage from "./ChatMessage";

interface ChatListProps {
  researching?: boolean;
  messages: Message[];
  loading: boolean;
}

function ChatList({
  researching = false,
  messages,
  loading,
}: ChatListProps) {
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
        <ChatMessage
          key={message.id}
          role={message.role}
          content={message.content}
          sources={message.sources}
        />
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

export default ChatList;
