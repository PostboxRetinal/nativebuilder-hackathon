interface ConversationOrbProps {
  state: "idle" | "listening" | "processing" | "speaking";
}

export default function ConversationOrb({ state }: ConversationOrbProps) {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="relative flex items-center justify-center">
        {state !== "idle" && (
          <>
            <span className="absolute w-24 h-24 rounded-full bg-cyan-400/20 animate-ping" />
            <span
              className="absolute w-20 h-20 rounded-full bg-cyan-400/30 animate-ping"
              style={{ animationDelay: "0.2s" }}
            />
          </>
        )}
        <div
          className={`
            relative w-16 h-16 rounded-full
            bg-gradient-to-br from-cyan-400 to-cyan-600
            shadow-[0_0_40px_rgba(34,211,238,0.5)]
            ${state === "listening" ? "animate-pulse" : ""}
            ${state === "speaking" ? "animate-bounce" : ""}
            ${state === "idle" ? "animate-breathe" : ""}
            ${state === "processing" ? "animate-spin" : ""}
          `}
        >
          <div className="absolute inset-2 rounded-full bg-cyan-300/40 blur-sm" />
        </div>
      </div>
    </div>
  );
}
