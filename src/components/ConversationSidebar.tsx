import { useCallback, useId, useState } from "react";
import { useConversations } from "../contexts/ConversationsContext";
import { useAuth } from "../contexts/AuthContext";

interface ConversationSidebarProps {
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onCreateNew: () => void;
  collapsed: boolean;
  onToggle: () => void;
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
  collapsed,
  onToggle,
}: ConversationSidebarProps): React.ReactNode {
  const { conversations, loading, deleteConversation } = useConversations();
  const { user, signOut, deleteAccount } = useAuth();
  const sidebarId = useId();

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
      <div
      className={`flex h-full flex-col border-r border-border bg-surface transition-[width] duration-200 overflow-hidden ${
        collapsed ? "w-[3.25rem]" : "w-72"
      }`}
    >
        <div className="p-4">
          <div className="h-10 w-full animate-pulse rounded-md bg-secondary" />
        </div>
        <div className="space-y-2 px-2 pb-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded-md bg-secondary" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      id={sidebarId}
      className={`flex h-full flex-col border-r border-border bg-surface transition-[width] duration-200 overflow-hidden ${
        collapsed ? "w-[3.25rem]" : "w-72"
      }`}
    >
      {/* Logo */}
      <div className={`${collapsed ? "flex flex-col items-center p-4 pb-3" : "px-4 py-4"}`}>
        {collapsed ? (
          <span
            className="waveform"
            role="img"
            aria-label="DevVoice"
            title="DevVoice"
          >
            <span className="waveform-bar" /><span className="waveform-bar" />
            <span className="waveform-bar" /><span className="waveform-bar" />
            <span className="waveform-bar" />
          </span>
        ) : (
          <div className="flex items-center gap-2 px-1">
            <span className="waveform" aria-hidden="true">
              <span className="waveform-bar" /><span className="waveform-bar" />
              <span className="waveform-bar" /><span className="waveform-bar" />
              <span className="waveform-bar" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-foreground">DevVoice</span>
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="mx-3 border-t border-border" />

      {/* Collapse + New chat */}
      <div className={`${collapsed ? "flex flex-col items-center gap-2 p-3" : "flex flex-col gap-2 p-4"}`}>
        {collapsed ? (
          <>
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={!collapsed}
              aria-controls={sidebarId}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted p-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 3v18" />
                <path d="M14 9l3 3-3 3" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onCreateNew}
              aria-label="New chat"
              title="New chat"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent p-1.5 text-on-accent transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5v14" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={!collapsed}
              aria-controls={sidebarId}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 3v18" />
                <path d="m16 15-3-3 3-3" />
              </svg>
              Collapse
            </button>
            <button
              onClick={onCreateNew}
              className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-all hover:opacity-90 active:scale-[0.98]"
            >
              New Chat
            </button>
          </>
        )}
      </div>

      {/* Separator */}
      <div className="mx-3 border-t border-border" />

      {/* Conversations */}
      <div className="my-3 flex-1 overflow-y-auto overflow-x-hidden px-2 pb-4">
        <div className="space-y-1">
          {conversations.map((conv) => {
            const isSelected = selectedConversationId === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => handleSelect(conv.id)}
                className={`group relative cursor-pointer rounded-md transition-colors ${
                  isSelected ? "bg-secondary" : "hover:bg-secondary"
                } ${collapsed ? "flex h-9 w-9 items-center justify-center p-0 mx-auto" : "px-3 py-2"} ${
                  isSelected && collapsed ? "ring-1 ring-inset ring-accent/60" : ""
                }`}
              >
                {collapsed ? (
                  <span
                    title={conv.title}
                    className="max-w-full truncate px-0.5 text-xs font-semibold text-foreground"
                  >
                    {(conv.title.trim().charAt(0) || "?").toUpperCase()}
                  </span>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="truncate font-medium text-sm text-foreground">
                      {truncate(conv.title, 40)}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, conv.id)}
                      className="opacity-0 transition-opacity group-hover:opacity-100 p-1.5 rounded text-muted-foreground hover:text-destructive"
                      aria-label="Delete conversation"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                           fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                           strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z" />
                      </svg>
                    </button>
                  </div>
                )}
                {!collapsed && (
                  <span className="mt-1 block text-[10px] text-muted-foreground">
                    {formatRelativeTime(conv.created_at)}
                  </span>
                )}
              </div>
            );
          })}
          {conversations.length === 0 && (
            <div className="mt-4 text-center text-xs text-muted-foreground">
              No conversations found
            </div>
          )}
        </div>
      </div>

      {/* Account footer */}
      <div className={`border-t border-border ${collapsed ? "p-2" : "p-3"}`}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleSignOut}
              data-testid="sign-out"
              title="Sign out"
              aria-label="Sign out"
              className="group relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground transition-colors hover:text-destructive"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </button>
            <span className="text-[9px] text-muted-foreground/70">v{__APP_VERSION__}</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                {user?.email?.slice(0, 2).toUpperCase() ?? "U"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-foreground">
                  {user?.email ?? "Account"}
                </div>
                <div className="truncate text-[10px] text-muted-foreground">
                  {user?.email ?? "Signed in"}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                data-testid="sign-out"
                className="rounded-md border border-border px-2.5 py-1.5 text-xs text-foreground transition-colors hover:border-destructive/60 hover:text-destructive"
              >
                Sign out
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>v{__APP_VERSION__}</span>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                data-testid="delete-account"
                className="transition-colors hover:text-destructive"
              >
                Delete account
              </button>
            </div>
          </>
        )}
      </div>

      {showDeleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        >
          <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-5">
            <h2
              id="delete-account-title"
              className="text-base font-semibold text-foreground"
            >
              Delete account?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This permanently deletes your account and all conversations. This
              action cannot be undone.
            </p>
            {deleteError != null && (
              <p
                data-testid="delete-account-error"
                className="mt-2 text-xs text-destructive"
              >
                {deleteError}
              </p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={closeDeleteConfirm}
                disabled={deleting}
                className="rounded-md border border-border px-3 py-1.5 text-xs text-foreground transition-colors hover:border-accent/50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                data-testid="confirm-delete-account"
                className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
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
