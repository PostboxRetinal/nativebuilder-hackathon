import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";
import type { Message, Source } from "../types/models";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

// Serializes addMessage read-then-insert across all hook instances so two
// concurrent calls can never compute the same next order_index. Each insert
// awaits the previous one's read+write to complete before reading again.
let addQueue: Promise<unknown> = Promise.resolve();

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

    // Prevent re-subscribing if this effect re-runs while already connected.
    if (channelRef.current?.state === "joined") return;

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
      .subscribe((status, err) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("[useMessages] realtime error:", status, err);
        }
      });

    channelRef.current = channel;

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [conversationId]);

  const addMessage = useCallback(
    (
      role: MessageRow["role"],
      content: string,
      sources?: Source[],
    ): Promise<void> => {
      // Chain onto the shared queue so concurrent calls (e.g. a fast follow-up
      // or user+assistant inserts) serialize their read-then-insert and never
      // reuse the same order_index.
      const run = addQueue.then(async () => {
        const { data: lastMessage, error: lastError } = await supabase
          .from("messages")
          .select("order_index")
          .eq("conversation_id", conversationId)
          .order("order_index", { ascending: false })
          .limit(1)
          .maybeSingle();

        // On absence of rows (.maybeSingle → null) or read error, fall back to
        // current local count so the first insert still gets a sequential index.
        if (lastError != null) {
          console.error("[useMessages] last-message read error:", lastError);
          return;
        }

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
      });

      addQueue = run.catch(() => {});
      return run;
    },
    [conversationId, messages],
  );

  return {
    messages,
    loading,
    addMessage,
  };
}
