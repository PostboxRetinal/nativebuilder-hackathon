import { useLocalRuntime } from "@assistant-ui/react";
import type { ChatModelAdapter } from "@assistant-ui/react";
import { FishAudioSpeechAdapter } from "../adapters/FishAudioSpeechAdapter";
import { SpeechmaticsDictationAdapter } from "../adapters/SpeechmaticsDictationAdapter";

function extractUserText(messages: readonly any[]): string {
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== "user") return "";
  const parts = lastMessage.content as readonly any[];
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join(" ");
}

export function useDevVoiceRuntime(onResearch: (text: string) => Promise<string>) {
  const adapter: ChatModelAdapter = {
    async *run({ messages, abortSignal }) {
      const text = extractUserText(messages);
      if (!text) return;
      try {
        const response = await onResearch(text);
        if (abortSignal?.aborted) return;
        yield { content: [{ type: "text" as const, text: response }] };
      } catch {
        yield {
          content: [{ type: "text" as const, text: "Sorry, I encountered an error. Please try again." }],
        };
      }
    },
  };

  return useLocalRuntime(adapter, {
    adapters: {
      speech: new FishAudioSpeechAdapter(),
      dictation: new SpeechmaticsDictationAdapter(),
    },
  });
}
