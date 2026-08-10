import { describe, it, expect } from "vitest";
import type { AgentState, ChatMessage } from "./rtvi";

describe("rtvi types", () => {
  it("AgentState accepts all 4 valid states", () => {
    const states: AgentState[] = ["idle", "listening", "processing", "speaking"];
    expect(states).toHaveLength(4);
  });

  it("ChatMessage requires id, role, text, timestamp", () => {
    const msg: ChatMessage = {
      id: "test-1",
      role: "user",
      text: "hello",
      timestamp: Date.now(),
    };
    expect(msg.id).toBe("test-1");
    expect(msg.role).toBe("user");
  });

  it("ChatMessage.isStreaming is optional", () => {
    const msg: ChatMessage = {
      id: "test-2",
      role: "agent",
      text: "response",
      timestamp: Date.now(),
      isStreaming: true,
    };
    expect(msg.isStreaming).toBe(true);
  });
});
