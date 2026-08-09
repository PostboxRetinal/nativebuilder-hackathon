import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import TranscriptionPreview from "../chat/TranscriptionPreview";

describe("TranscriptionPreview", () => {
  it("returns null when idle with no text", () => {
    const { container } = render(
      <TranscriptionPreview partialText="" finalText="" isRecording={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders only final text", () => {
    render(
      <TranscriptionPreview partialText="" finalText="hello" isRecording={false} />,
    );
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("renders only partial text in italic", () => {
    render(
      <TranscriptionPreview partialText="hi" finalText="" isRecording={true} />,
    );
    expect(screen.getByText("hi")).toBeInTheDocument();
  });

  it("renders both final and partial", () => {
    render(
      <TranscriptionPreview partialText="world" finalText="hello" isRecording={true} />,
    );
    expect(screen.getByText(/hello/)).toBeInTheDocument();
    expect(screen.getByText(/world/)).toBeInTheDocument();
  });

  it("renders listening placeholder when recording with no text", () => {
    render(
      <TranscriptionPreview partialText="" finalText="" isRecording={true} />,
    );
    expect(screen.getByText("Listening…")).toBeInTheDocument();
  });
});
