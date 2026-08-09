import { useState } from "react";
import { toast } from "sonner";
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

// Inline copy icon (avoids pulling in an icon library).
function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
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
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        // Fallback for insecure contexts: deprecated execCommand via temp textarea.
        const ta = document.createElement("textarea");
        ta.value = content;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className={`flex flex-col gap-1 ${isFirstInGroup ? "mt-3 first:mt-0" : ""}`}
    >
      {isFirstInGroup && createdAt != null && (
        <div
          data-testid="msg-meta"
          className={`mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground ${
            role === "user" ? "justify-end" : ""
          }`}
        >
          <span className="font-medium">{role === "user" ? "You" : "DevVoice"}</span>
          <span aria-hidden="true">·</span>
          <span>{formatRelativeTime(createdAt)}</span>
        </div>
      )}
      <div className={`flex items-end gap-2 ${role === "user" ? "flex-row-reverse" : ""}`}>
        <ChatBubble role={role} content={content} />
        {role === "assistant" && (
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "Copied" : "Copy response"}
            title="Copy response"
            className="mb-0.5 flex shrink-0 items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
          >
            {copied ? (
              <span className="text-[10px] font-medium">Copied</span>
            ) : (
              <>
                <CopyIcon className="h-4 w-4" />
                <span className="text-[10px] font-medium"></span>
              </>
            )}
          </button>
        )}
      </div>
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
