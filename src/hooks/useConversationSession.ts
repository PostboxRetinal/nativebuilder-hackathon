import { useState, useCallback, useEffect, useRef } from "react";
import { useSpeechmatics } from "./useSpeechmatics";
import type { SpeechLanguage } from "./useSpeechmatics";

export type ConversationState =
  | "idle"
  | "listening"
  | "processing"
  | "speaking";

export interface UseConversationSessionReturn {
  state: ConversationState;
  userText: string;
  agentText: string;
  error: string;
  stream: MediaStream | null;
  startListening: () => void;
  stopListening: () => void;
  onPartial: (text: string) => void;
  onFinal: (text: string) => void;
  onAgentResponse: (text: string) => void;
  onEndOfUtterance: (text: string) => void;
  reset: () => void;
}

export function useConversationSession(
  language: SpeechLanguage = "en",
  onResearch: (text: string) => Promise<string>,
): UseConversationSessionReturn {
  const [state, setState] = useState<ConversationState>("idle");
  const [userText, setUserText] = useState("");
  const [agentText, setAgentText] = useState("");
  const [error, setError] = useState("");

  const researchRef = useRef(onResearch);
  researchRef.current = onResearch;

  const handleEndOfUtterance = useCallback(
    async (text: string) => {
      if (state === "processing") return;
      setState("processing");
      try {
        const answer = await researchRef.current(text);
        setAgentText(answer);
        setState("speaking");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Research failed");
        setState("listening");
      }
    },
    [state],
  );

  const speechmatics = useSpeechmatics(language, {
    conversationMode: true,
    onEndOfUtterance: (text: string) => {
      handleEndOfUtterance(text);
    },
  });

  useEffect(() => {
    if (speechmatics.partialText) {
      setUserText(speechmatics.partialText);
    }
  }, [speechmatics.partialText]);

  useEffect(() => {
    if (speechmatics.finalText) {
      setUserText(speechmatics.finalText);
    }
  }, [speechmatics.finalText]);

  const startListening = useCallback(() => {
    speechmatics.startRecording();
    setState("listening");
    setUserText("");
    setAgentText("");
    setError("");
  }, [speechmatics]);

  const stopListening = useCallback(() => {
    speechmatics.stopRecording();
    setState("idle");
  }, [speechmatics]);

  const onPartial = useCallback((text: string) => {
    setUserText(text);
  }, []);

  const onFinal = useCallback((text: string) => {
    setUserText(text);
    setState("processing");
  }, []);

  const onAgentResponse = useCallback((text: string) => {
    setAgentText(text);
    setState("speaking");
  }, []);

  const reset = useCallback(() => {
    speechmatics.reset();
    setState("idle");
    setUserText("");
    setAgentText("");
    setError("");
  }, [speechmatics]);

  return {
    state,
    userText,
    agentText,
    error,
    stream: speechmatics.stream,
    startListening,
    stopListening,
    onPartial,
    onFinal,
    onAgentResponse,
    onEndOfUtterance: handleEndOfUtterance,
    reset,
  };
}
