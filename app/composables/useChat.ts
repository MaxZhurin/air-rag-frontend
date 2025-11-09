import { useChatStore } from '~/stores/chat'
import { useApi } from './useApi'

export const useChat = () => {
  const chatStore = useChatStore()
  const { api } = useApi()

  const fetchChats = async () => {
    try {
      const { data } = await api.get('/chats')
      chatStore.setChats(data)
    } catch (error) {
      console.error('Error loading chats:', error)
    }
  }

  const refreshChatsList = async () => {
    try {
      const { data } = await api.get('/chats')
      chatStore.setChats(data)
    } catch (error) {
      console.error('Error refreshing chats:', error)
    }
  }

  const createChat = async (title?: string) => {
    try {
      const { data } = await api.post('/chats', { title })
      chatStore.addChat(data)
      return data
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  const loadChat = async (chatId: string, chatMode?: string) => {
    try {
      chatStore.setLoading(true)
      
      // Подготавливаем параметры для запроса сообщений
      const messagesParams = chatMode ? { chatMode } : {}
      
      const [chatResponse, messagesResponse] = await Promise.all([
        api.get(`/chats/${chatId}`),
        api.get(`/chats/${chatId}/messages`, { params: messagesParams }),
      ])
      
      chatStore.setCurrentChat(chatResponse.data)
      
      const processedMessages = messagesResponse.data.map((message: any) => {
        if (message.role === 'assistant') {
          return {
            ...message,
            content: message.response || message.content,
            modelUsed: message.modelUsed,
            citations: message.pineconeResponse?.citations || message.citations,
            // Обработка результатов поиска для RAG Search
            searchResults: message.results || null,
            indexUsed: message.indexUsed || null,
            metadata: message.metadata || null
          }
        }
        return message
      })
      
      chatStore.setMessages(processedMessages)
    } catch (error) {
      console.error('Error loading chat:', error)
    } finally {
      chatStore.setLoading(false)
    }
  }

  // Функция для фонового обновления чата без показа индикатора загрузки
  const refreshChat = async (chatId: string, chatMode?: string) => {
    try {
      // Подготавливаем параметры для запроса сообщений
      const messagesParams = chatMode ? { chatMode } : {}
      
      const [chatResponse, messagesResponse] = await Promise.all([
        api.get(`/chats/${chatId}`),
        api.get(`/chats/${chatId}/messages`, { params: messagesParams }),
      ])
      
      chatStore.setCurrentChat(chatResponse.data)
      
      // Обрабатываем сообщения для правильного отображения
      const processedMessages = messagesResponse.data.map((message: any) => {
        if (message.role === 'assistant') {
          return {
            ...message,
            content: message.response || message.content,
            modelUsed: message.modelUsed,
            citations: message.pineconeResponse?.citations || message.citations,
            // Обработка результатов поиска для RAG Search
            searchResults: message.results || null,
            indexUsed: message.indexUsed || null,
            metadata: message.metadata || null
          }
        }
        return message
      })
      
      chatStore.setMessages(processedMessages)
    } catch (error) {
      console.error('Error refreshing chat:', error)
    }
  }

  const sendMessage = async (chatId: string, content: string, options?: { chatMode?: string; indexName?: string; modelId?: string; formatResponse?: boolean }) => {
    try {
      chatStore.setLoading(true)
      const payload = { 
        content,
        ...(options?.chatMode && { chatMode: options.chatMode }),
        ...(options?.indexName && { indexName: options.indexName }),
        ...(options?.modelId && { modelId: options.modelId }),
        ...(options?.formatResponse !== undefined && { formatResponse: options.formatResponse })
      }
      
      // Use retry for critical message sending
      const { retryRequest } = useApi()
      const { data } = await retryRequest({
        method: 'post',
        url: `/chats/${chatId}/messages`,
        data: payload
      })
      
      // Добавляем сообщение пользователя
      chatStore.addMessage(data.userMessage)
      
      // Обрабатываем ответ AI
      const aiMessage = {
        ...data.aiMessage,
        content: data.aiMessage.response || data.aiMessage.content,
        modelUsed: data.aiMessage.modelUsed,
        citations: data.aiMessage.pineconeResponse?.citations || data.aiMessage.citations,
        // Обработка результатов поиска для RAG Search
        searchResults: data.aiMessage.results || null,
        indexUsed: data.aiMessage.indexUsed || null,
        metadata: data.aiMessage.metadata || null
      }
      
      chatStore.addMessage(aiMessage)
      
      // Обновляем список чатов после первого ответа (если это первое сообщение)
      const currentChat = chatStore.currentChat
      if (currentChat && chatStore.messages.length <= 2) { // userMessage + aiMessage = 2
        await refreshChatsList()
      }
      
      // Если сервер вернул обновленный чат, обновляем его локально
      if (data.chat && data.chat.id === currentChat?.id) {
        chatStore.setCurrentChat(data.chat)
        chatStore.updateChatTitle(data.chat.id, data.chat.title)
      }
      
      return data
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      chatStore.setLoading(false)
    }
  }

  const deleteChat = async (chatId: string) => {
    try {
      await api.delete(`/chats/${chatId}`)
      chatStore.removeChat(chatId)
    } catch (error) {
      console.error('Error deleting chat:', error)
      throw error // Пробрасываем ошибку для обработки в компоненте
    }
  }

  const updateChatTitle = async (chatId: string, title: string) => {
    try {
      await api.put(`/chats/${chatId}`, { title })
      chatStore.updateChatTitle(chatId, title)
    } catch (error) {
      console.error('Error updating chat title:', error)
    }
  }

  return {
    fetchChats,
    refreshChatsList,
    createChat,
    loadChat,
    refreshChat,
    sendMessage,
    deleteChat,
    updateChatTitle,
  }
}