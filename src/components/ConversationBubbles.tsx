import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "../types/rtvi";

interface ConversationBubblesProps {
  messages: ChatMessage[];
}

export function ConversationBubbles({ messages }: ConversationBubblesProps) {
  if (messages.length === 0) {
    return <div className="text-center text-slate-500 py-8">No messages yet</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((msg) => {
        const isUser = msg.role === "user";
        return (
          <div
            key={msg.id}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`
                max-w-[80%] px-4 py-2 rounded-2xl
                ${isUser
                  ? "bg-cyan-600 text-white rounded-br-sm"
                  : "bg-slate-800 text-slate-100 rounded-bl-sm border border-slate-700"
                }
                ${msg.isStreaming ? "animate-pulse" : ""}
              `}
            >
              {isUser ? (
                <p className="text-sm">{msg.text}</p>
              ) : (
                <div className="text-sm prose prose-invert prose-sm prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:my-2 prose-code:text-cyan-300 prose-code:bg-slate-900 prose-code:px-1 prose-code:rounded">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )}
              {msg.isStreaming && (
                <span className="inline-block w-1 h-4 bg-white/70 ml-1 animate-pulse align-middle" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
