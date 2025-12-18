/**
 * Interface principal do chat
 */

import { useEffect, useRef } from 'react';
import { useChat } from '@/hooks/use-chat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { AgentSelector } from './AgentSelector';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatInterface() {
  const {
    activeConversation,
    selectedAgentId,
    isConnected,
    isTyping,
    sendMessage,
    setSelectedAgent,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, isTyping]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Chat com Agentes de IA</h2>
          <Badge
            variant={isConnected ? 'default' : 'destructive'}
            className="gap-1"
          >
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3" />
                Conectado
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Desconectado
              </>
            )}
          </Badge>
        </div>
        <AgentSelector
          selectedAgentId={selectedAgentId}
          onSelectAgent={setSelectedAgent}
        />
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {activeConversation?.messages.length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">
              <p className="text-sm">
                Comece uma conversa enviando uma mensagem abaixo.
              </p>
              <p className="text-xs mt-2">
                Você pode selecionar um agente específico ou deixar o sistema
                escolher automaticamente.
              </p>
            </Card>
          )}

          {activeConversation?.messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isTyping && (
            <div className="flex gap-3 p-4">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
              <div className="flex items-center gap-1 pt-2">
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                <div
                  className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
                <div
                  className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        disabled={!isConnected}
        placeholder={
          isConnected
            ? 'Digite sua mensagem...'
            : 'Aguardando conexão...'
        }
      />
    </div>
  );
}

