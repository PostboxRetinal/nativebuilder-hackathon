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
    label: "Budget",
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
    label: "Latest",
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

// Combined flat lookup list. IDs are unique across categories, so a plain
// `.find` is safe.
export const RESEARCH_MODELS = MODEL_CATEGORIES.flatMap((c) => c.models);

// The model the `Default` option resolves to (must match the EF's DEFAULT_MODEL).
export const DEFAULT_MODEL_ID = "openai/gpt-5.6-luna";

// Resolve the active model (the Default fallback) so callers can render the
// price caption without duplicating the lookup.
export function getActiveModel(value: string | null) {
  return RESEARCH_MODELS.find((m) => m.id === (value ?? DEFAULT_MODEL_ID)) ?? null;
}

interface ModelSelectorProps {
  value: string | null;
  onChange: (model: string | null) => void;
}

function ModelSelector({ value, onChange }: ModelSelectorProps): React.ReactNode {
  return (
    <label className="flex items-center">
      <span className="sr-only">Model</span>
      <select
        aria-label="Research model"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
        className="h-11 max-w-[9.5rem] rounded-lg border border-border bg-muted px-3 text-xs font-medium text-foreground transition-colors focus:border-accent/60 cursor-pointer"
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
  );
}

export default ModelSelector;
