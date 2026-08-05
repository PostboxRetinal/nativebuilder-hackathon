import { useEffect, useRef } from "react";
import { useMessages } from "../hooks/useMessages";

interface MessageListProps {
  conversationId: string;
}

function MessageList({ conversationId }: MessageListProps): React.ReactNode {
  const { messages, loading } = useMessages(conversationId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-400">
        Loading messages...
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-500">
        No messages yet
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-black p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-4 py-2 ${
            message.role === "user"
              ? "ml-auto bg-blue-600 text-white rounded-br-sm"
              : "mr-auto bg-zinc-800 text-zinc-100 rounded-bl-sm"
          }`}
        >
          {message.content}
        </div>
      ))}
      <div ref={scrollRef} />
    </div>
  );
}

export default MessageList;
