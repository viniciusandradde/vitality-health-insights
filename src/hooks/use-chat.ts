/**
 * Hook principal para gerenciamento de chat
 */

import { useCallback, useEffect, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { ChatMessage, SendMessageRequest, Conversation } from '@/types/chat';
import { env } from '@/config/env';
import { chatApi } from '@/api/endpoints/chat';

export function useChat() {
  const {
    conversations,
    activeConversationId,
    selectedAgentId,
    isConnected,
    isTyping,
    error,
    setActiveConversation,
    setSelectedAgent,
    addConversation,
    updateConversation,
    addMessage,
    setMessages,
    setConnected,
    setTyping,
    setError,
  } = useChatStore();

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Conectar WebSocket
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(env.wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setError(null);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Erro na conexão WebSocket');
        setConnected(false);
      };

      ws.onclose = () => {
        setConnected(false);
        // Tentar reconectar após 5 segundos
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };
    } catch (err) {
      console.error('Error connecting WebSocket:', err);
      setError('Erro ao conectar WebSocket');
      setConnected(false);
    }
  }, [setConnected, setError]);

  // Desconectar WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setConnected(false);
  }, [setConnected]);

  // Processar mensagens do WebSocket
  const handleWebSocketMessage = useCallback(
    (data: unknown) => {
      // TODO: Implementar processamento de mensagens do WebSocket
      // Isso dependerá do formato das mensagens do backend
      console.log('WebSocket message received:', data);
    },
    []
  );

  // Enviar mensagem
  const sendMessage = useCallback(
    async (message: string, agentId?: string) => {
      if (!message.trim()) return;

      const request: SendMessageRequest = {
        message,
        agentId: agentId || selectedAgentId || undefined,
        conversationId: activeConversationId || undefined,
      };

      // Criar mensagem do usuário
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };

      // Adicionar mensagem do usuário imediatamente
      if (activeConversationId) {
        addMessage(activeConversationId, userMessage);
      } else {
        // Criar nova conversa se não houver uma ativa
        const newConversation: Conversation = {
          id: `temp-${Date.now()}`,
          messages: [userMessage],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addConversation(newConversation);
        setActiveConversation(newConversation.id);
      }

      setTyping(true);

      try {
        const response = await chatApi.sendMessage(request);
        
        // Atualizar ou criar conversa
        if (response.conversationId) {
          if (!activeConversationId) {
            setActiveConversation(response.conversationId);
          }
          
          // Adicionar mensagem do assistente
          const assistantMessage: ChatMessage = {
            id: response.message.id,
            role: response.message.role,
            content: response.message.content,
            agentId: response.agentId,
            agentName: response.message.agentName,
            toolCalls: response.message.toolCalls,
            timestamp: response.message.timestamp,
            metadata: response.message.metadata,
          };

          addMessage(response.conversationId, assistantMessage);
        }
        
        setTyping(false);
      } catch (err) {
        console.error('Error sending message:', err);
        setError('Erro ao enviar mensagem');
        setTyping(false);
      }
    },
    [
      activeConversationId,
      selectedAgentId,
      addMessage,
      addConversation,
      setActiveConversation,
      setTyping,
      setError,
    ]
  );

  // Carregar conversas
  const loadConversations = useCallback(async () => {
    try {
      const conversations = await chatApi.getConversations();
      const { conversations: existingConversations, addConversation } = useChatStore.getState();
      conversations.forEach((conv) => {
        const existing = existingConversations.find((c) => c.id === conv.id);
        if (!existing) {
          addConversation(conv);
        }
      });
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Erro ao carregar conversas');
    }
  }, [setError]);

  // Carregar conversa específica
  const loadConversation = useCallback(
    async (conversationId: string) => {
      try {
        const conversation = await chatApi.getConversation(conversationId);
        updateConversation(conversationId, conversation);
        setActiveConversation(conversationId);
      } catch (err) {
        console.error('Error loading conversation:', err);
        setError('Erro ao carregar conversa');
      }
    },
    [updateConversation, setActiveConversation, setError]
  );

  // Criar nova conversa
  const createConversation = useCallback(
    async (title?: string) => {
      try {
        const conversation = await chatApi.createConversation(title);
        addConversation(conversation);
        setActiveConversation(conversation.id);
      } catch (err) {
        console.error('Error creating conversation:', err);
        setError('Erro ao criar conversa');
      }
    },
    [addConversation, setActiveConversation, setError]
  );

  // Efeito para conectar WebSocket quando o componente montar
  useEffect(() => {
    connectWebSocket();
    return () => {
      disconnectWebSocket();
    };
  }, [connectWebSocket, disconnectWebSocket]);

  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId
  );

  return {
    conversations,
    activeConversation,
    activeConversationId,
    selectedAgentId,
    isConnected,
    isTyping,
    error,
    sendMessage,
    loadConversations,
    loadConversation,
    createConversation,
    setActiveConversation,
    setSelectedAgent,
    connectWebSocket,
    disconnectWebSocket,
  };
}

