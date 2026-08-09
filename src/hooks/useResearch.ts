import { useCallback, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Source } from "../types/models";

interface ResearchResult {
  answer: string;
  sources: Source[];
  iterations: number;
}

type UseResearchReturn = {
  researching: boolean;
  error: string | null;
  runResearch: (query: string, context?: string) => Promise<ResearchResult | null>;
};

export function useResearch(): UseResearchReturn {
  const [researching, setResearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runResearch = useCallback(
    async (query: string, context?: string): Promise<ResearchResult | null> => {
      setResearching(true);
      setError(null);
      try {
        const { data, error } = await supabase.functions.invoke<ResearchResult>(
          "research",
          { body: { query, context } },
        );
        if (error != null) {
          setError(`Research failed: ${error.message}`);
          return null;
        }
        return data ?? null;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Research failed.");
        return null;
      } finally {
        setResearching(false);
      }
    },
    [],
  );

  return { researching, error, runResearch };
}
