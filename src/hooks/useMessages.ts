import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

export type Source = { title: string; url: string };

export type Message = Pick<MessageRow, "id" | "role" | "content" | "created_at" | "sources"> & {
  order_index: number;
};

type UseMessagesReturn = {
  messages: Message[];
  loading: boolean;
  addMessage: (role: MessageRow["role"], content: string, sources?: Source[]) => Promise<void>;
};

export function useMessages(
  conversationId: string,
): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  async function fetchMessages(): Promise<Message[] | null> {
    const { data, error } = await supabase
      .from("messages")
      .select("id, role, content, created_at, order_index, sources")
      .eq("conversation_id", conversationId)
      .order("order_index", { ascending: true });

    if (error != null) throw error;
    return data as Message[] | null;
  }

  useEffect(() => {
    if (conversationId == null) {
      setMessages([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const init = async () => {
      setLoading(true);
      try {
        const data = await fetchMessages();
        if (!cancelled && data != null) {
          setMessages(data);
        }
      } catch (err) {
        console.error("[useMessages] fetch error:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    init();

    const channel = supabase
      .channel(`messages-${conversationId}-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async () => {
          const data = await fetchMessages();
          if (!cancelled && data != null) {
            setMessages(data);
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
  }, [conversationId]);

  const addMessage = useCallback(
    async (
      role: MessageRow["role"],
      content: string,
      sources?: Source[],
    ): Promise<void> => {
      // Calculate next order_index
      const { data: lastMessage, error: lastError } = await supabase
        .from("messages")
        .select("order_index")
        .eq("conversation_id", conversationId)
        .order("order_index", { ascending: false })
        .limit(1)
        .maybeSingle();

      // On absence of rows (.maybeSingle → null) or read error, fall back to
      // current local count so the first insert still gets a sequential index.
      if (lastError == null) {
        const nextIndex = (lastMessage?.order_index ?? messages.length) + 1;

        const { data: inserted, error } = await supabase
          .from("messages")
          .insert({
            conversation_id: conversationId,
            role,
            content,
            order_index: nextIndex,
            sources: sources ?? [],
          })
          .select()
          .single();

        if (error != null) {
          console.error("[useMessages] insert error:", error);
        } else if (inserted != null) {
          // Reflect the insert immediately, independent of the realtime feed.
          setMessages((prev) => [...prev, inserted as Message]);
        }
      } else {
        console.error("[useMessages] last-message read error:", lastError);
      }
    },
    [conversationId, messages],
  );

  return {
    messages,
    loading,
    addMessage,
  };
}
