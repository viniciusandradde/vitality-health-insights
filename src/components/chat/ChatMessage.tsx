/**
 * Componente de mensagem individual do chat
 */

import { cn } from '@/lib/utils';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/formatters';
import { getAgentIcon, getAgentColor } from '@/config/agents';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const AgentIcon = message.agentId ? getAgentIcon(message.agentId) : Bot;
  const agentColor = message.agentId ? getAgentColor(message.agentId) : undefined;

  return (
    <div
      className={cn(
        'flex gap-3 p-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <Avatar className="h-8 w-8">
        <AvatarFallback
          className={cn(
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <AgentIcon className="h-4 w-4" style={{ color: agentColor }} />
          )}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          'flex flex-col gap-1 max-w-[80%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div className="flex items-center gap-2">
          {!isUser && message.agentName && (
            <Badge variant="outline" className="text-xs">
              {message.agentName}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDateTime(message.timestamp)}
          </span>
        </div>

        <div
          className={cn(
            'rounded-lg px-4 py-2 text-sm',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          )}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            {message.toolCalls.length} ferramenta(s) utilizada(s)
          </div>
        )}
      </div>
    </div>
  );
}

