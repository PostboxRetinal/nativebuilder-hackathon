export type AgentState = "idle" | "listening" | "processing" | "speaking";

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  timestamp: number;
  status?: "streaming" | "sent" | "error";
}

export interface RTVIEventMap {
  "user-transcript-partial": { text: string; messageId: string };
  "user-transcript-final": { text: string; messageId: string };
  "bot-llm-text": { text: string; spoken: string };
  "bot-tts-text": { text: string };
  "agent-state": { state: AgentState };
  error: { message: string; code?: string };
}

export type RTVIEventType = keyof RTVIEventMap;

export interface STTAdapter {
  start(language: string): Promise<void>;
  stop(): void;
  onEvent: <T extends RTVIEventType>(type: T, handler: (data: RTVIEventMap[T]) => void) => void;
  offEvent: <T extends RTVIEventType>(type: T, handler: (data: RTVIEventMap[T]) => void) => void;
}

export interface TTSAdapter {
  speak(text: string): Promise<void>;
  stop(): void;
  onEvent: <T extends RTVIEventType>(type: T, handler: (data: RTVIEventMap[T]) => void) => void;
  offEvent: <T extends RTVIEventType>(type: T, handler: (data: RTVIEventMap[T]) => void) => void;
}
