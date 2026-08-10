interface ConversationOrbProps {
  onClick: () => void;
}

export default function ConversationOrb({ onClick }: ConversationOrbProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Conversation mode"
      className="relative flex h-11 w-11 items-center justify-center rounded-full"
    >
      {/* Pulsing ring behind */}
      <span className="absolute inset-0 animate-ping rounded-full bg-cyan-400/30" />
      <span className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-cyan-400 via-violet-400 to-fuchsia-500 opacity-60" />

      {/* Solid core */}
      <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 shadow-[0_0_24px_rgba(34,211,238,0.6)]">
        {/* Speech bubble icon — distinct from mic */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </span>
    </button>
  );
}
