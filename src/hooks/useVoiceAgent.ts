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
  isConnecting: boolean;
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
  const [isConnecting, setIsConnecting] = useState(false);

  const handlers = useRef<Map<RTVIEventType, Set<Handler<any>>>>(new Map());
  const isSpeakingRef = useRef(false);
  const isConnectingRef = useRef(false);

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
            status: "streaming",
          },
        ];
      });
    };

    const handleTranscriptFinal = (data: RTVIEventMap["user-transcript-final"]) => {
      setMessages((prev) => {
        const existing = prev.find((m) => m.id === data.messageId);
        if (existing) {
          // Update existing message to sent
          return prev.map((m) => (m.id === data.messageId ? { ...m, status: "sent" } : m));
        }
        // Create new sent message if no streaming existed
        return [
          ...prev,
          {
            id: data.messageId,
            role: "user",
            text: data.text,
            timestamp: Date.now(),
            status: "sent",
          },
        ];
      });
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
    if (isConnectingRef.current) return;
    setError(null);
    setIsConnecting(true);
    isConnectingRef.current = true;
    try {
      setStateAndEmit("listening");
      await sttAdapter.start(language);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "STT failed";
      setError(msg);
      setStateAndEmit("idle");
    } finally {
      isConnectingRef.current = false;
      setIsConnecting(false);
    }
  }, [sttAdapter, language, setStateAndEmit]);

  const stopListening = useCallback(() => {
    sttAdapter.stop();
    // Also stop TTS if playing
    ttsAdapter.stop();
    isSpeakingRef.current = false;
    isConnectingRef.current = false;
    setIsConnecting(false);
    setStateAndEmit("idle");
  }, [sttAdapter, setStateAndEmit]);

  const speak = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      if (isSpeakingRef.current) return;

      isSpeakingRef.current = true;
      setError(null);
      setStateAndEmit("speaking");

      const agentMsgId = crypto.randomUUID();
      const agentMsg: ChatMessage = {
        id: agentMsgId,
        role: "agent",
        text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, agentMsg]);

      try {
        // Add 30s timeout to prevent hanging
        await Promise.race([
          ttsAdapter.speak(text),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("TTS timeout after 30s")), 30000),
          ),
        ]);
        // Update message status to 'sent' on success
        setMessages((prev) =>
          prev.map((m) => (m.id === agentMsgId ? { ...m, status: "sent" } : m)),
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "TTS failed";
        setError(msg);
        // Update message status to 'error' on failure
        setMessages((prev) =>
          prev.map((m) => (m.id === agentMsgId ? { ...m, status: "error" } : m)),
        );
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
    isConnectingRef.current = false;
    setIsConnecting(false);
    setStateAndEmit("idle");
  }, [ttsAdapter, setStateAndEmit]);

  const resetMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    state,
    messages,
    isListening: state === "listening",
    isSpeaking: state === "speaking",
    isConnecting,
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
