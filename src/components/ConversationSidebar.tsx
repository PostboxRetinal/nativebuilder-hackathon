import { useCallback, useState } from "react";
import { useConversations } from "../contexts/ConversationsContext";
import { useAuth } from "../contexts/AuthContext";

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
  const { user, signOut, deleteAccount } = useAuth();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const closeDeleteConfirm = useCallback(() => {
    if (deleting) return;
    setShowDeleteConfirm(false);
    setDeleteError(null);
  }, [deleting]);

  const handleDeleteAccount = useCallback(async () => {
    setDeleting(true);
    setDeleteError(null);
    const { error } = await deleteAccount();
    if (error != null) {
      setDeleteError(error);
      setDeleting(false);
      return;
    }
    // On success AuthContext signs out; the app renders the auth screen.
  }, [deleteAccount]);

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
      if (selectedConversationId === id) {
        onCreateNew();
      }
    },
    [deleteConversation, selectedConversationId, onCreateNew],
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
                <span className="mt-1 block text-[10px] text-zinc-400">
                  {formatRelativeTime(conv.created_at)}
                </span>
              </div>
            );
          })}
          {conversations.length === 0 && (
            <div className="mt-4 text-center text-xs text-zinc-400">
              No conversations found
            </div>
          )}
        </div>
      </div>

      {/* Account footer */}
      <div className="border-t border-zinc-800 p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-200">
            {user?.email?.slice(0, 2).toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-zinc-200">
              {user?.email ?? "Account"}
            </div>
            <div className="truncate text-[10px] text-zinc-500">
              {user?.email ?? "Signed in"}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            data-testid="sign-out"
            className="rounded-md border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200 transition-colors hover:border-red-500/60 hover:text-red-400"
          >
            Sign out
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-500">
          <span>v{__APP_VERSION__}</span>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            data-testid="delete-account"
            className="text-zinc-600 transition-colors hover:text-red-400"
          >
            Delete account
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        >
          <div className="w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-950 p-5">
            <h2
              id="delete-account-title"
              className="text-base font-semibold text-white"
            >
              Delete account?
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              This permanently deletes your account and all conversations. This
              action cannot be undone.
            </p>
            {deleteError != null && (
              <p
                data-testid="delete-account-error"
                className="mt-2 text-xs text-red-400"
              >
                {deleteError}
              </p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={closeDeleteConfirm}
                disabled={deleting}
                className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:border-zinc-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                data-testid="confirm-delete-account"
                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConversationSidebar;
