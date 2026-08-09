import type { Message } from "../types/models";
import ChatList from "./chat/ChatList";

interface MessageListProps {
  researching?: boolean;
  messages: Message[];
  loading: boolean;
}

// Thin pass-through to the shared chat-list primitive. Kept for backwards
// compatibility with existing imports and tests; bubble/source/scroll/typing
// rendering now lives in src/components/chat/.
function MessageList(props: MessageListProps) {
  return <ChatList {...props} />;
}

export default MessageList;
