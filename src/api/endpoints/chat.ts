/**
 * Endpoints para conversação com agentes de IA
 */

import { apiClient } from '../client';
import { ChatMessage, Conversation, SendMessageRequest, SendMessageResponse } from '@/types/chat';

export const chatApi = {
  /**
   * Envia uma mensagem para o hub de seleção de agentes
   */
  async sendMessage(
    request: SendMessageRequest
  ): Promise<SendMessageResponse> {
    return apiClient.post<SendMessageResponse>('/api/v1/chat/message', request);
  },

  /**
   * Busca conversas do usuário
   */
  async getConversations(): Promise<Conversation[]> {
    return apiClient.get<Conversation[]>('/api/v1/chat/conversations');
  },

  /**
   * Busca uma conversa específica
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    return apiClient.get<Conversation>(`/api/v1/chat/conversations/${conversationId}`);
  },

  /**
   * Cria uma nova conversa
   */
  async createConversation(title?: string): Promise<Conversation> {
    return apiClient.post<Conversation>('/api/v1/chat/conversations', { title });
  },

  /**
   * Deleta uma conversa
   */
  async deleteConversation(conversationId: string): Promise<void> {
    return apiClient.delete(`/api/v1/chat/conversations/${conversationId}`);
  },
};

