import { useCallback } from "react";
import { useConversations } from "../hooks/useConversations";

interface ConversationSidebarProps {
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onCreateNew: () => void;
}

function formatRelativeTime(dateString: string | null): string {
  if (dateString == null) return "";

  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;

  return new Date(dateString).toLocaleDateString();
}

function truncate(str: string, max: number): string {
  return str.length > max ? `${str.substring(0, max - 3)}...` : str;
}

function ConversationSidebar({
  selectedConversationId,
  onSelectConversation,
  onCreateNew,
}: ConversationSidebarProps): React.ReactNode {
  const { conversations, loading, deleteConversation } = useConversations();

  const handleSelect = useCallback(
    (id: string) => {
      onSelectConversation(id);
    },
    [onSelectConversation],
  );

  const handleDelete = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      await deleteConversation(id);
      onCreateNew();
    },
    [deleteConversation, onCreateNew],
  );

  if (loading) {
    return (
      <div className="flex h-full w-72 flex-col border-r border-zinc-800 bg-zinc-950">
        <div className="p-4">
          <div className="h-10 w-full animate-pulse rounded-md bg-zinc-900" />
        </div>
        <div className="space-y-2 px-2 pb-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded-md bg-zinc-900" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-72 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="p-4">
        <button
          onClick={onCreateNew}
          className="w-full rounded-md bg-white px-4 py-2 text-black transition-colors hover:bg-zinc-200 font-bold"
        >
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="space-y-1">
          {conversations.map((conv) => {
            const isSelected = selectedConversationId === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => handleSelect(conv.id)}
                className={`group relative cursor-pointer rounded-md px-3 py-2 transition-colors ${
                  isSelected ? "bg-zinc-800" : "hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate font-medium text-sm text-white">
                    {truncate(conv.title, 40)}
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    className="opacity-0 transition-opacity group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400"
                    aria-label="Delete conversation"
                  >
                    <span className="text-xs font-bold">X</span>
                  </button>
                </div>
                <span className="mt-1 block text-[10px] text-zinc-500">
                  {formatRelativeTime(conv.created_at)}
                </span>
              </div>
            );
          })}
          {conversations.length === 0 && (
            <div className="mt-4 text-center text-xs text-zinc-600">
              No conversations found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConversationSidebar;
