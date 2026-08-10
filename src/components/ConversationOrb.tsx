interface ConversationOrbProps {
  state: "idle" | "listening" | "processing" | "speaking";
  onClick?: () => void;
  isConnecting?: boolean;
}

export default function ConversationOrb({ state, onClick, isConnecting }: ConversationOrbProps) {
  return (
    <div className="flex items-center justify-center py-4">
      <button
        type="button"
        onClick={onClick}
        disabled={state === "processing" || isConnecting}
        className={`relative flex items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 ${state === "processing" || isConnecting ? "cursor-wait" : "cursor-pointer"}`}
        aria-label={state === "listening" ? "Conversation in progress" : state === "speaking" ? "Agent speaking" : state === "processing" ? "Processing" : "Start conversation"}
      >
        {state !== "idle" && (
          <>
            <span className="pointer-events-none absolute w-24 h-24 rounded-full bg-cyan-400/20 animate-ping" />
            <span
              className="pointer-events-none absolute w-20 h-20 rounded-full bg-cyan-400/30 animate-ping"
              style={{ animationDelay: "0.2s" }}
            />
          </>
        )}
        <div
          className={`
            pointer-events-none
            relative w-16 h-16 rounded-full
            bg-gradient-to-br from-cyan-400 to-cyan-600
            shadow-[0_0_40px_rgba(34,211,238,0.5)]
            ${state === "listening" ? "animate-pulse" : ""}
            ${state === "speaking" ? "animate-bounce" : ""}
            ${state === "idle" ? "animate-breathe" : ""}
            ${(state === "processing" || isConnecting) ? "animate-spin" : ""}
          `}
        >
          <div className="absolute inset-2 rounded-full bg-cyan-300/40 blur-sm" />
        </div>
      </button>
    </div>
  );
}
