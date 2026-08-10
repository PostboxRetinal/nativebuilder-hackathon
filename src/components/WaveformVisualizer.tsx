import { useRef, useEffect } from "react";

interface WaveformVisualizerProps {
  stream: MediaStream | null;
  isRecording: boolean;
}

export default function WaveformVisualizer({
  stream,
  isRecording,
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!isRecording || !stream || !canvasRef.current) return;

    let cancelled = false;

    const setup = async () => {
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;

      const ctx = canvas.getContext("2d");
      if (!ctx || cancelled) return;

      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      try {
        await audioContext.resume();
      } catch {
        // Already running — safe to ignore
      }
      if (cancelled) {
        audioContext.close().catch(() => {});
        return;
      }

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (cancelled) return;
        animFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);

        ctx.fillStyle = "rgba(11, 17, 32, 0.3)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = "#22d3ee";
        ctx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      };

      draw();
    };

    setup();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrameRef.current);
      audioContextRef.current?.close().catch(() => {});
      audioContextRef.current = null;
    };
  }, [stream, isRecording]);

  if (!isRecording || !stream) return null;

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={60}
      className="w-full h-[60px] rounded-lg bg-[#0B1120]/30"
      aria-label="Audio waveform visualization"
      role="img"
    />
  );
}
