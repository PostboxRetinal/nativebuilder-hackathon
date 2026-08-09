import type { Source } from "../types/models";

function SourceCitation({ source }: { source: Source }) {
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
      className="mt-2 flex items-start gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm transition-colors hover:border-zinc-600"
    >
      <img
        src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(
          host,
        )}&sz=16`}
        alt=""
        className="mt-0.5 h-4 w-4"
      />
      <span className="min-w-0">
        <span className="block truncate font-medium text-zinc-100">
          {source.title || host}
        </span>
        <span className="block truncate text-xs text-zinc-400">{host}</span>
      </span>
    </a>
  );
}

export default SourceCitation;
