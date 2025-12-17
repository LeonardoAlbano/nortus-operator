import { ChatScreen } from '@/features/chat/ui/chat-screen';
import { getSessionUser } from '@/lib/nortus-session';

export default async function ChatPage() {
  const me = await getSessionUser();
  return <ChatScreen me={me} />;
}
