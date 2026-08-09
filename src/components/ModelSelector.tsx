// Candidate AI/ML models selectable for answer generation. These IDs are the
// exact identifiers accepted by the AI/ML API (aimlapi.com), validated against
// the live /v1/models catalog. Keeping the OpenAI-compatible prefix form that
// the `research` Edge Function uses (e.g. "openai/gpt-5-2-chat-latest").
export const RESEARCH_MODELS = [
  { id: "openai/gpt-5-2-chat-latest", label: "GPT-5.2" },
  { id: "openai/gpt-4o-mini", label: "GPT-4o mini" },
  { id: "deepseek/deepseek-r1", label: "DeepSeek R1" },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
] as const;

interface ModelSelectorProps {
  value: string | null;
  onChange: (model: string | null) => void;
}

function ModelSelector({
  value,
  onChange,
}: ModelSelectorProps): React.ReactNode {
  return (
    <label className="flex items-center gap-2 text-xs text-zinc-400">
      <span className="whitespace-nowrap">Model</span>
      <select
        aria-label="Research model"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
        className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-200 transition-colors focus:border-zinc-600 cursor-pointer"
      >
        <option value="">Default</option>
        {RESEARCH_MODELS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default ModelSelector;
