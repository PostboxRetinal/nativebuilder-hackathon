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

  it("ChatMessage.status is optional and accepts streaming/sent/error", () => {
    const msg: ChatMessage = {
      id: "test-2",
      role: "agent",
      text: "response",
      timestamp: Date.now(),
      status: "streaming",
    };
    expect(msg.status).toBe("streaming");

    const msg2: ChatMessage = {
      id: "test-3",
      role: "user",
      text: "hello",
      timestamp: Date.now(),
      status: "sent",
    };
    expect(msg2.status).toBe("sent");

    const msg3: ChatMessage = {
      id: "test-4",
      role: "agent",
      text: "",
      timestamp: Date.now(),
      status: "error",
    };
    expect(msg3.status).toBe("error");
  });
});
