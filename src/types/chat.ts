/**
 * Tipos para o sistema de chat com agentes de IA
 */

import { LucideIcon } from 'lucide-react';

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  agentId?: string;
  agentName?: string;
  toolCalls?: ToolCall[];
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}

export interface Conversation {
  id: string;
  title?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon?: LucideIcon;
  color?: string;
  capabilities: string[];
}

export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  selectedAgentId: string | null;
  isConnected: boolean;
  isTyping: boolean;
  error: string | null;
}

export interface SendMessageRequest {
  conversationId?: string;
  message: string;
  agentId?: string;
  context?: Record<string, unknown>;
}

export interface StreamMessageChunk {
  type: 'content' | 'tool_call' | 'agent_change' | 'done' | 'error';
  data: unknown;
  messageId?: string;
  agentId?: string;
}

