import React, { useState, useCallback } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useConversations } from './hooks/useConversations';
import AuthScreen from './components/AuthScreen';
import ConversationSidebar from './components/ConversationSidebar';
import ConversationView from './components/ConversationView';

const App: React.FC = (): JSX.Element => {
  const { isAuthenticated } = useAuth();
  const { createConversation } = useConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const handleSelectConversation = useCallback((id: string): void => {
    setSelectedConversationId(id);
  }, []);

  const handleCreateNew = useCallback(async (): Promise<void> => {
    try {
      const newId = await createConversation();
      setSelectedConversationId(newId);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  }, [createConversation]);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden">
      <ConversationSidebar
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        onCreateNew={handleCreateNew}
      />
      <main className="flex-1 relative flex items-center justify-center">
        {selectedConversationId ? (
          <ConversationView
            conversationId={selectedConversationId}
            onBack={() => setSelectedConversationId(null)}
          />
        ) : (
          <div className="text-zinc-500 text-center">
            <p>Select a conversation or create a new one</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
