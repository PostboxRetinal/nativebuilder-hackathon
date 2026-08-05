import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { Database } from "../lib/database.types";

type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];

type Conversation = Pick<ConversationRow, "id" | "title" | "created_at">;

type UseConversationsReturn = {
  conversations: Conversation[];
  loading: boolean;
  createConversation: () => Promise<string | null>;
  deleteConversation: (id: string) => Promise<void>;
  updateTitle: (id: string, title: string) => Promise<void>;
};

const DEFAULT_TITLE = "New conversation";

async function fetchConversations(
  userId: string,
): Promise<Conversation[] | null> {
  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error != null) throw error;
  return data;
}

export function useConversations(): UseConversationsReturn {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (user == null) {
      setConversations([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchAndSet = async () => {
      setLoading(true);
      try {
        const data = await fetchConversations(user.id);
        if (!cancelled && data != null) {
          setConversations(data);
        }
      } catch (err) {
        console.error("[useConversations] fetch error:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAndSet();

    const channel = supabase
      .channel("conversations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          const data = await fetchConversations(user.id);
          if (!cancelled && data != null) {
            setConversations(data);
          }
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [user?.id]);

  const createConversation = useCallback(async (): Promise<string | null> => {
    if (user == null) return null;

    const { data, error } = await supabase
      .from("conversations")
      .insert({ title: DEFAULT_TITLE, user_id: user.id })
      .select("id")
      .single();

    if (error != null) {
      console.error("[useConversations] create error:", error);
      return null;
    }

    return data.id;
  }, [user]);

  const deleteConversation = useCallback(
    async (id: string): Promise<void> => {
      const { error: msgErr } = await supabase
        .from("messages")
        .delete()
        .eq("conversation_id", id);
      if (msgErr != null) {
        console.error("[useConversations] delete messages error:", msgErr);
        return;
      }

      const { error: convErr } = await supabase
        .from("conversations")
        .delete()
        .eq("id", id);
      if (convErr != null) {
        console.error("[useConversations] delete conversation error:", convErr);
      }
    },
    [],
  );

  const updateTitle = useCallback(
    async (id: string, title: string): Promise<void> => {
      const { error } = await supabase
        .from("conversations")
        .update({ title })
        .eq("id", id);
      if (error != null) {
        console.error("[useConversations] update title error:", error);
      }
    },
    [],
  );

  return {
    conversations,
    loading,
    createConversation,
    deleteConversation,
    updateTitle,
  };
}
