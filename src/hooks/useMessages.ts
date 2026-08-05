import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

type Message = Pick<MessageRow, "id" | "role" | "content" | "created_at">;

type UseMessagesReturn = {
  messages: Message[];
  loading: boolean;
  addMessage: (role: MessageRow["role"], content: string) => Promise<void>;
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
      .select("id, role, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error != null) throw error;
    return data;
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
      .channel(`messages-${conversationId}`)
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
    async (role: MessageRow["role"], content: string): Promise<void> => {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        role,
        content,
      });
      if (error != null) {
        console.error("[useMessages] insert error:", error);
      }
    },
    [conversationId],
  );

  return {
    messages,
    loading,
    addMessage,
  };
}
