import type { Source } from "../types/models";

interface SourceCitationProps {
  source: Source;
  index?: number;
}

function SourceCitation({ source, index }: SourceCitationProps) {
  let host = source.url;
  try {
    host = new URL(source.url).hostname;
  } catch {
    // keep raw url as fallback host
  }

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="source-citation"
      className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
    >
      {index != null && (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-medium text-muted-foreground">
          {index}
        </span>
      )}
      <img
        src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(
          host,
        )}&sz=16`}
        alt=""
        className="h-3.5 w-3.5"
      />
      <span className="max-w-[12rem] truncate">{source.title || host}</span>
    </a>
  );
}

export default SourceCitation;
