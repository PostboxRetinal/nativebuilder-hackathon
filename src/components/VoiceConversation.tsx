import { useLocalRuntime, AssistantRuntimeProvider, ThreadPrimitive } from "@assistant-ui/react";
import { FishAudioSpeechAdapter } from "../adapters/FishAudioSpeechAdapter";
import { SpeechmaticsDictationAdapter } from "../adapters/SpeechmaticsDictationAdapter";

interface VoiceConversationProps {
  onResearch: (text: string) => Promise<string>;
  onExit: () => void;
}

export function VoiceConversation({ onResearch, onExit }: VoiceConversationProps) {
  const runtime = useLocalRuntime(
    {
      async run({ messages }) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === "user") {
          const text = (lastMessage.content as any[])
            .filter((p) => p.type === "text")
            .map((p) => p.text)
            .join(" ");
          const response = await onResearch(text);
          return { content: [{ type: "text", text: response }] };
        }
        return {};
      },
    },
    {
      adapters: {
        speech: new FishAudioSpeechAdapter(),
        dictation: new SpeechmaticsDictationAdapter(),
      },
    }
  );

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ThreadPrimitive.Root className="flex h-full flex-col bg-background text-foreground">
        <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-3">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Back
          </button>
          <h1 className="text-sm font-semibold tracking-tight">Conversation Mode</h1>
          <div className="w-20" />
        </header>
        <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto p-4">
          <ThreadPrimitive.ViewportFooter className="border-t border-border bg-surface px-4 py-3">
            <div className="text-center text-[11px] text-muted-foreground">
              Dictation and speech enabled
            </div>
          </ThreadPrimitive.ViewportFooter>
        </ThreadPrimitive.Viewport>
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  );
}
