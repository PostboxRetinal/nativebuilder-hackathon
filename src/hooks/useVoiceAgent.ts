import { useState, useCallback, useRef, useEffect } from "react";
import type {
  AgentState,
  ChatMessage,
  RTVIEventMap,
  RTVIEventType,
  STTAdapter,
  TTSAdapter,
} from "../types/rtvi";

export interface UseVoiceAgentOptions {
  sttAdapter: STTAdapter;
  ttsAdapter: TTSAdapter;
  language?: string;
  onUserTranscriptFinal: (text: string) => void;
}

export interface UseVoiceAgentReturn {
  state: AgentState;
  messages: ChatMessage[];
  isListening: boolean;
  isSpeaking: boolean;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  resetMessages: () => void;
  on: <T extends RTVIEventType>(
    type: T,
    handler: (data: RTVIEventMap[T]) => void,
  ) => void;
  off: <T extends RTVIEventType>(
    type: T,
    handler: (data: RTVIEventMap[T]) => void,
  ) => void;
}

type Handler<T extends RTVIEventType> = (data: RTVIEventMap[T]) => void;

export function useVoiceAgent(
  options: UseVoiceAgentOptions,
): UseVoiceAgentReturn {
  const { sttAdapter, ttsAdapter, language = "en", onUserTranscriptFinal } =
    options;

  const [state, setState] = useState<AgentState>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handlers = useRef<Map<RTVIEventType, Set<Handler<any>>>>(new Map());
  const currentMessageId = useRef<string | null>(null);
  const isSpeakingRef = useRef(false);

  const emit = useCallback(
    <T extends RTVIEventType>(type: T, data: RTVIEventMap[T]) => {
      handlers.current.get(type)?.forEach((h) => h(data));
    },
    [],
  );

  const on: UseVoiceAgentReturn["on"] = useCallback(
    (type, handler) => {
      if (!handlers.current.has(type)) {
        handlers.current.set(type, new Set());
      }
      handlers.current.get(type)!.add(handler);
    },
    [],
  );

  const off: UseVoiceAgentReturn["off"] = useCallback(
    (type, handler) => {
      handlers.current.get(type)?.delete(handler);
    },
    [],
  );

  const setStateAndEmit = useCallback(
    (newState: AgentState) => {
      setState(newState);
      emit("agent-state", { state: newState });
    },
    [emit],
  );

  // Register STT/TTS event handlers ONCE via useEffect
  useEffect(() => {
    const handleTranscriptPartial = (data: RTVIEventMap["user-transcript-partial"]) => {
      const msgId = data.messageId;
      setMessages((prev) => {
        const existing = prev.find((m) => m.id === msgId);
        if (existing) {
          return prev.map((m) => (m.id === msgId ? { ...m, text: data.text } : m));
        }
        return [
          ...prev,
          {
            id: msgId,
            role: "user",
            text: data.text,
            timestamp: Date.now(),
            isStreaming: true,
          },
        ];
      });
    };

    const handleTranscriptFinal = (data: RTVIEventMap["user-transcript-final"]) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId ? { ...m, isStreaming: false } : m,
        ),
      );
      currentMessageId.current = null;
      onUserTranscriptFinal(data.text);
    };

    const handleSTTError = (data: RTVIEventMap["error"]) => {
      setError(data.message);
    };

    const handleTTSError = (data: RTVIEventMap["error"]) => {
      setError(data.message);
    };

    sttAdapter.onEvent("user-transcript-partial", handleTranscriptPartial);
    sttAdapter.onEvent("user-transcript-final", handleTranscriptFinal);
    sttAdapter.onEvent("error", handleSTTError);
    ttsAdapter.onEvent("error", handleTTSError);

    return () => {
      sttAdapter.offEvent?.("user-transcript-partial", handleTranscriptPartial);
      sttAdapter.offEvent?.("user-transcript-final", handleTranscriptFinal);
      sttAdapter.offEvent?.("error", handleSTTError);
      ttsAdapter.offEvent?.("error", handleTTSError);
    };
  }, [sttAdapter, ttsAdapter, onUserTranscriptFinal]);

  const startListening = useCallback(async () => {
    if (state === "listening") {
      stopListening();
      return;
    }
    setError(null);
    currentMessageId.current = crypto.randomUUID();
    setStateAndEmit("listening");
    await sttAdapter.start(language);
  }, [state, sttAdapter, language, setStateAndEmit]);

  const stopListening = useCallback(() => {
    sttAdapter.stop();
    setStateAndEmit("idle");
  }, [sttAdapter, setStateAndEmit]);

  const speak = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      if (isSpeakingRef.current) return;

      isSpeakingRef.current = true;
      setError(null);
      setStateAndEmit("speaking");

      const agentMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "agent",
        text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, agentMsg]);

      try {
        await ttsAdapter.speak(text);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "TTS failed";
        setError(msg);
      } finally {
        isSpeakingRef.current = false;
        setStateAndEmit("idle");
      }
    },
    [ttsAdapter, setStateAndEmit],
  );

  const stopSpeaking = useCallback(() => {
    ttsAdapter.stop();
    isSpeakingRef.current = false;
    setStateAndEmit("idle");
  }, [ttsAdapter, setStateAndEmit]);

  const resetMessages = useCallback(() => {
    setMessages([]);
    currentMessageId.current = null;
  }, []);

  return {
    state,
    messages,
    isListening: state === "listening",
    isSpeaking: state === "speaking",
    error,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    resetMessages,
    on,
    off,
  };
}
