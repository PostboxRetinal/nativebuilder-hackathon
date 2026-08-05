import { useCallback, useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthScreen from "./components/AuthScreen";
import { useConversations } from "./hooks/useConversations";
import ConversationSidebar from "./components/ConversationSidebar";
import ConversationView from "./components/ConversationView";

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const { createConversation } = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleCreateNew = useCallback(async () => {
    const id = await createConversation();
    if (id != null) {
      setSelectedId(id);
    }
  }, [createConversation]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (user == null) {
    return <AuthScreen />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      <ConversationSidebar
        selectedConversationId={selectedId}
        onSelectConversation={setSelectedId}
        onCreateNew={handleCreateNew}
      />
      <div className="flex flex-1 flex-col">
        {selectedId != null ? (
          <ConversationView conversationId={selectedId} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-zinc-500">
            Select a conversation or start a new one
          </div>
        )}
      </div>
    </div>
  );
}
