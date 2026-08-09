// Candidate AI/ML models selectable for answer generation. These IDs are the
// exact identifiers accepted by the AI/ML API (aimlapi.com), validated against
// the live catalog on 2026-08-09 via the AIML MCP. Prices are USD per 1M tokens
// (chat-completions, AIML margin applied). Each model appears in exactly one
// category. Recency is prioritized: the `latest` group holds the newest 2026
// flagship per lineage.
interface ModelOption {
  id: string;
  label: string;
  priceIn: number;
  priceOut: number;
}

interface ModelCategory {
  key: string;
  label: string;
  models: ModelOption[];
}

export const MODEL_CATEGORIES: ModelCategory[] = [
  {
    key: "budget",
    label: "Económicos",
    models: [
      { id: "openai/gpt-4o-mini", label: "GPT-4o mini", priceIn: 0.195, priceOut: 0.78 },
      { id: "deepseek/deepseek-v4-flash", label: "DeepSeek V4 Flash", priceIn: 0.182, priceOut: 0.364 },
      { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", priceIn: 0.39, priceOut: 3.25 },
      { id: "z-ai/glm-4.7-flash", label: "GLM 4.7 Flash", priceIn: 0.1625, priceOut: 0.65 },
      { id: "alibaba/qwen3-next-80b-a3b-instruct", label: "Qwen3 Next 80B Instruct", priceIn: 0.195, priceOut: 1.56 },
    ],
  },
  {
    key: "latest",
    label: "Más recientes",
    models: [
      { id: "openai/gpt-5.6-luna", label: "GPT-5.6 Luna", priceIn: 1.3, priceOut: 7.8 },
      { id: "openai/gpt-5.6-sol", label: "GPT-5.6 Sol", priceIn: 6.5, priceOut: 39 },
      { id: "anthropic/claude-opus-4-8", label: "Claude 4.8 Opus", priceIn: 7.15, priceOut: 35.75 },
      { id: "alibaba/qwen3.8-max", label: "Qwen3.8 Max", priceIn: 2.6, priceOut: 7.8 },
      { id: "alibaba/glm-5.2", label: "GLM 5.2", priceIn: 1.82, priceOut: 5.72 },
    ],
  },
  {
    key: "reasoning",
    label: "Reasoning",
    models: [
      { id: "deepseek/deepseek-v4-pro", label: "DeepSeek V4 Pro", priceIn: 0.566, priceOut: 1.131 },
      { id: "alibaba/qwen3-next-80b-a3b-thinking", label: "Qwen3 Next 80B Thinking", priceIn: 0.195, priceOut: 1.56 },
      { id: "z-ai/glm-5-turbo", label: "GLM 5 Turbo", priceIn: 1.56, priceOut: 5.2 },
      { id: "openai/gpt-5.6-terra", label: "GPT-5.6 Terra", priceIn: 3.25, priceOut: 19.5 },
      { id: "google/gemini-3.5-flash", label: "Gemini 3.5 Flash", priceIn: 0.65, priceOut: 3.9 },
    ],
  },
] ;

// Flat lookup list used for the price caption and default resolution. IDs are
// unique across categories, so a plain `.find` is safe.
export const RESEARCH_MODELS = MODEL_CATEGORIES.flatMap((c) => c.models);

// The model the `Default` option resolves to (must match the EF's DEFAULT_MODEL).
const DEFAULT_MODEL_ID = "openai/gpt-5.6-luna";

interface ModelSelectorProps {
  value: string | null;
  onChange: (model: string | null) => void;
}

function ModelSelector({
  value,
  onChange,
}: ModelSelectorProps): React.ReactNode {
  const active = RESEARCH_MODELS.find((m) => m.id === (value ?? DEFAULT_MODEL_ID));
  return (
    <div className="flex flex-col">
      <label className="flex items-center gap-2 text-xs text-zinc-400">
        <span className="whitespace-nowrap">Model</span>
        <select
          aria-label="Research model"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-200 transition-colors focus:border-zinc-600 cursor-pointer"
        >
          <option value="">Default</option>
          {MODEL_CATEGORIES.map((cat) => (
            <optgroup key={cat.key} label={cat.label}>
              {cat.models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      {active && (
        <span className="mt-0.5 text-[10px] text-zinc-500">
          ${active.priceIn} in / ${active.priceOut} out (per 1M tokens)
        </span>
      )}
    </div>
  );
}

export default ModelSelector;
