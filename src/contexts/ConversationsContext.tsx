import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import type { Database } from "../lib/database.types";

type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];

type Conversation = Pick<ConversationRow, "id" | "title" | "created_at">;

interface ConversationsContextValue {
  conversations: Conversation[];
  loading: boolean;
  createConversation: () => Promise<string | null>;
  deleteConversation: (id: string) => Promise<void>;
  updateTitle: (id: string, title: string) => Promise<void>;
}

const DEFAULT_TITLE = "New conversation";

const ConversationsContext = createContext<ConversationsContextValue | null>(null);

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

export function ConversationsProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactNode {
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

    // Prevent re-subscribing if this effect re-runs while already connected.
    if (channelRef.current?.state === "joined") return;

    const channel = supabase
      .channel(`conversations-changes-${crypto.randomUUID()}`)
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
      .subscribe((status, err) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("[useConversations] realtime error:", status, err);
        }
      });

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
      .select("id, title, created_at")
      .single();

    if (error != null) {
      console.error("[useConversations] create error:", error);
      return null;
    }

    // Optimistic update: surface the new conversation in the sidebar
    // immediately, without waiting for the realtime feed. The realtime
    // subscriber later refetches and reconciles ordering.
    if (data != null) {
      setConversations((prev) => [data, ...prev]);
      return data.id;
    }

    return null;
  }, [user]);

  const deleteConversation = useCallback(
    async (id: string): Promise<void> => {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", id);

      if (error != null) {
        console.error("[useConversations] delete conversation error:", error);
        return;
      }

      setConversations((prev) => prev.filter((c) => c.id !== id));
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

  return (
    <ConversationsContext.Provider
      value={{
        conversations,
        loading,
        createConversation,
        deleteConversation,
        updateTitle,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversations(): ConversationsContextValue {
  const ctx = useContext(ConversationsContext);
  if (ctx == null) {
    throw new Error("useConversations must be used within a ConversationsProvider");
  }
  return ctx;
}
