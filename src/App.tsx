import { useCallback, useState } from "react";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ConversationsProvider, useConversations } from "./contexts/ConversationsContext";
import AuthScreen, { SetNewPassword } from "./components/AuthScreen";
import ConversationSidebar from "./components/ConversationSidebar";
import ConversationView from "./components/ConversationView";
import { getSidebarCollapsed, setSidebarCollapsed } from "./lib/uiPrefs";

export default function App() {
  return (
    <AuthProvider>
      <ConversationsProvider>
        <AppContent />
      </ConversationsProvider>
      {/* Mounted once at the app root so toasts survive the signOut that
          follows account deletion (the sidebar that triggers it unmounts). */}
      <Toaster theme="dark" position="top-center" richColors />
    </AuthProvider>
  );
}

function AppContent(): React.ReactNode {
  const { user, loading, isRecovering } = useAuth();
  const { createConversation } = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(() =>
    getSidebarCollapsed(),
  );

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsedState((c) => {
      const next = !c;
      setSidebarCollapsed(next);
      return next;
    });
  }, []);

  const handleCreateNew = useCallback(async () => {
    const id = await createConversation();
    if (id != null) {
      setSelectedId(id);
    }
  }, [createConversation]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-accent"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (isRecovering) {
    return <SetNewPassword />;
  }

  if (user == null) {
    return <AuthScreen />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ConversationSidebar
        selectedConversationId={selectedId}
        onSelectConversation={setSelectedId}
        onCreateNew={handleCreateNew}
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
      />
      <div className="flex flex-1 flex-col">
        {selectedId != null ? (
          <ConversationView conversationId={selectedId} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-background px-6 text-center">
            <span className="waveform" aria-hidden="true">
              <span className="waveform-bar" /><span className="waveform-bar" />
              <span className="waveform-bar" /><span className="waveform-bar" />
              <span className="waveform-bar" />
            </span>
            <div>
              <p className="font-medium text-foreground">Start researching by voice or text</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick a conversation on the left or start a new one.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
