import { defineStore } from 'pinia'

interface Citation {
  position: number
  references: Array<{
    file: {
      id: string
      name: string
      metadata: {
        originalName: string
        documentId: string
      }
      signedUrl?: string
    }
  }>
}

interface SearchResult {
  _id: string
  _score: number
  fields: {
    category: string
    text: string
    metadata: {
      documentId: string
      userId?: string
      fileName?: string
      fileType?: string
      chunkIndex?: number
      totalChunks?: number
      createdAt?: string
    }
  }
}

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  documentReferences?: Array<{
    id: string
    name: string
    similarity: number
  }>
  modelUsed?: string
  citations?: Citation[]
  searchResults?: SearchResult[]
  indexUsed?: string
  metadata?: {
    indexUsed?: string
    formatResponse?: boolean
    resultsCount?: number
  }
  createdAt: string
}

interface Chat {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    chats: [] as Chat[],
    currentChat: null as Chat | null,
    messages: [] as Message[],
    isLoading: false,
  }),

  actions: {
    setChats(chats: Chat[]) {
      this.chats = chats
    },

    setCurrentChat(chat: Chat | null) {
      this.currentChat = chat
    },

    setMessages(messages: Message[]) {
      this.messages = messages
    },

    addMessage(message: Message) {
      this.messages.push(message)
    },

    addChat(chat: Chat) {
      this.chats.unshift(chat)
    },

    removeChat(chatId: string) {
      this.chats = this.chats.filter(c => c.id !== chatId)
    },

    updateChatTitle(chatId: string, title: string) {
      const chat = this.chats.find(c => c.id === chatId)
      if (chat) {
        chat.title = title
      }
      if (this.currentChat?.id === chatId) {
        this.currentChat.title = title
      }
    },

    setLoading(loading: boolean) {
      this.isLoading = loading
    },
  },
})


