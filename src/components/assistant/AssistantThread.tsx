import { ThreadPrimitive, ComposerPrimitive, MessagePrimitive } from "@assistant-ui/react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useDevVoiceRuntime } from "../../runtime/devvoice-runtime";

interface AssistantThreadProps {
  onResearch: (text: string) => Promise<string>;
}

function Message() {
  return (
    <MessagePrimitive.Root>
      <MessagePrimitive.Parts />
    </MessagePrimitive.Root>
  );
}

export function AssistantThread({ onResearch }: AssistantThreadProps) {
  const runtime = useDevVoiceRuntime(onResearch);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ThreadPrimitive.Root className="flex h-full flex-col bg-background text-foreground">
        <ThreadPrimitive.Viewport
          className="flex-1 overflow-y-auto p-4"
          role="log"
          aria-label="Chat messages"
          aria-live="polite"
        >
          <ThreadPrimitive.Messages components={{ Message }} />
          <ThreadPrimitive.ScrollToBottom className="hidden" />
        </ThreadPrimitive.Viewport>
        <ComposerPrimitive.Root
          className="border-t border-border bg-surface p-3"
          aria-label="Message composer"
        >
          <ComposerPrimitive.Input
            placeholder="Type a message..."
            className="min-h-11 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <div className="mt-2 flex items-center justify-between">
            <ComposerPrimitive.Dictate
              className="rounded-lg bg-accent p-2 text-on-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Start voice dictation"
            />
            <ComposerPrimitive.Send
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-on-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Send message"
            />
          </div>
        </ComposerPrimitive.Root>
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  );
}
