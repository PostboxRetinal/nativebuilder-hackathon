import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "../../types/models";

type Role = Message["role"];

// Anchor override: open rendered markdown links in a new tab. rel
// noopener+noreferrer prevents tab-nabbing. Matches SourceCitation behavior.
const markdownComponents = {
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props} target="_blank" rel="noopener noreferrer" />
  ),
};

interface ChatBubbleProps {
  role: Role;
  content: string;
}

function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === "user";
  return (
    <div
      data-testid={`message-${role}`}
      className={`max-w-[80%] rounded-lg px-4 py-2 ${
        isUser
          ? "ml-auto bg-blue-600 text-white rounded-br-sm whitespace-pre-wrap"
          : "mr-auto bg-zinc-800 text-zinc-100 rounded-bl-sm assistant-markdown"
      }`}
    >
      {isUser ? (
        content
      ) : (
        <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {content}
        </Markdown>
      )}
    </div>
  );
}

export default ChatBubble;
