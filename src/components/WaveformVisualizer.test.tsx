import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import WaveformVisualizer from "./WaveformVisualizer";

describe("WaveformVisualizer", () => {
  it("renders nothing when not recording", () => {
    const { container } = render(
      <WaveformVisualizer stream={null} isRecording={false} />,
    );
    expect(container.querySelector("canvas")).toBeNull();
  });

  it("renders nothing when stream is null", () => {
    const { container } = render(
      <WaveformVisualizer stream={null} isRecording={true} />,
    );
    expect(container.querySelector("canvas")).toBeNull();
  });

  it("renders canvas when recording with stream", () => {
    const mockStream = {} as MediaStream;
    const { container } = render(
      <WaveformVisualizer stream={mockStream} isRecording={true} />,
    );
    expect(container.querySelector("canvas")).toBeTruthy();
  });
});
