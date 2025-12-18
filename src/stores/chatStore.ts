/**
 * Store Zustand para gerenciamento de estado do chat
 */

import { create } from 'zustand';
import { ChatState, Conversation, ChatMessage } from '@/types/chat';

interface ChatStore extends ChatState {
  // Actions
  setActiveConversation: (conversationId: string | null) => void;
  setSelectedAgent: (agentId: string | null) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  setConnected: (connected: boolean) => void;
  setTyping: (typing: boolean) => void;
  setError: (error: string | null) => void;
  deleteConversation: (conversationId: string) => void;
  reset: () => void;
}

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  selectedAgentId: null,
  isConnected: false,
  isTyping: false,
  error: null,
};

export const useChatStore = create<ChatStore>((set, get) => ({
  ...initialState,

  setActiveConversation: (conversationId) => {
    set({ activeConversationId: conversationId });
  },

  setSelectedAgent: (agentId) => {
    set({ selectedAgentId: agentId });
  },

  addConversation: (conversation) => {
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    }));
  },

  updateConversation: (conversationId, updates) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, ...updates } : conv
      ),
    }));
  },

  addMessage: (conversationId, message) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, message],
              updatedAt: new Date().toISOString(),
            }
          : conv
      ),
    }));
  },

  setMessages: (conversationId, messages) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages,
              updatedAt: new Date().toISOString(),
            }
          : conv
      ),
    }));
  },

  setConnected: (connected) => {
    set({ isConnected: connected });
  },

  setTyping: (typing) => {
    set({ isTyping: typing });
  },

  setError: (error) => {
    set({ error });
  },

  deleteConversation: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.filter((conv) => conv.id !== conversationId),
      activeConversationId:
        state.activeConversationId === conversationId ? null : state.activeConversationId,
    }));
  },

  reset: () => {
    set(initialState);
  },
}));

