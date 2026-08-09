import { useState, useEffect, useCallback } from "react";
import { useSpeechmatics, type SpeechLanguage } from "./useSpeechmatics";

/**
 * Owns all voice-to-text UI state for the composer so the presentation can
 * live in ConversationView (above the 44px composer row) instead of inside it.
 * A flex-row cannot grow to fit a flex-col textarea/editor without breaking
 * the bottom bar, so the transcription preview and the done-editor are
 * rendered by the parent, keyed off the state returned here.
 */
export function useVoiceComposer(onTranscriptFinal: (text: string) => void) {
  const [language, setLanguage] = useState<SpeechLanguage>("en");
  const {
    state,
    partialText,
    finalText,
    error,
    startRecording,
    stopRecording,
    reset,
  } = useSpeechmatics(language);

  const [editedText, setEditedText] = useState("");

  // Populate edit area when transcription finishes.
  useEffect(() => {
    if (state === "done" && finalText) {
      setEditedText(finalText);
    }
  }, [state, finalText]);

  const submitEdit = useCallback(() => {
    const trimmed = editedText.trim();
    if (!trimmed) return;
    onTranscriptFinal(trimmed);
    setEditedText("");
    reset();
  }, [editedText, onTranscriptFinal, reset]);

  const reRecord = useCallback(() => {
    setEditedText("");
    reset();
  }, [reset]);

  return {
    state,
    partialText,
    finalText,
    error,
    language,
    setLanguage,
    editedText,
    setEditedText,
    startRecording,
    stopRecording,
    reset,
    submitEdit,
    reRecord,
  };
}
