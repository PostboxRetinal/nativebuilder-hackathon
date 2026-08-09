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
      <div className="flex flex-1 items-center justify-center bg-background text-muted-foreground">
        Loading messages...
      </div>
    );
  }

  if (messages.length === 0 && !researching) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <span className="waveform" aria-hidden="true">
          <span className="waveform-bar" /><span className="waveform-bar" />
          <span className="waveform-bar" /><span className="waveform-bar" />
          <span className="waveform-bar" />
        </span>
        <p className="text-sm text-muted-foreground">No messages yet. Ask your first research question.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto bg-background p-4">
      {messages.map((message, i) => {
        const prev = messages[i - 1];
        const isFirstInGroup = !prev || prev.role !== message.role;
        return (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            sources={message.sources}
            isFirstInGroup={isFirstInGroup}
            createdAt={message.created_at}
          />
        );
      })}
      {researching && (
        <div className="mr-auto flex items-center gap-2 rounded-lg bg-muted border border-border px-4 py-2 text-sm text-muted-foreground">
          <span className="waveform" role="status" aria-label="Researching">
            <span className="waveform-bar" /><span className="waveform-bar" />
            <span className="waveform-bar" /><span className="waveform-bar" />
            <span className="waveform-bar" />
          </span>
          <span>Researching</span>
        </div>
      )}
      <div ref={scrollRef} />
    </div>
  );
}

export default ChatList;
