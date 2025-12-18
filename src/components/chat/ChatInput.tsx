/**
 * Input de mensagem do chat
 */

import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Digite sua mensagem...',
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border p-4 bg-background">
      <div className="flex items-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          disabled={disabled}
          title="Anexar arquivo"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              'min-h-[44px] max-h-[120px] resize-none pr-12',
              'focus-visible:ring-2 focus-visible:ring-primary'
            )}
          />
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            Enter para enviar, Shift+Enter para nova linha
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          size="icon"
          className="h-9 w-9"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

