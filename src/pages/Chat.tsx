/**
 * Página principal do chat
 */

import { AppLayout } from '@/components/layout/AppLayout';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function Chat() {
  return (
    <AppLayout
      title="Chat com Agentes de IA"
      subtitle="Converse com agentes especializados para análises e insights"
    >
      <div className="h-[calc(100vh-8rem)]">
        <ChatInterface />
      </div>
    </AppLayout>
  );
}

