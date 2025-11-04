<template>
  <div class="flex flex-1 overflow-hidden">
    <!-- Left Sidebar - Chat List -->
    <div class="w-72 border-r border-gray-200 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <!-- New Chat Button -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <UButton
          block
          icon="i-heroicons-plus-circle"
          size="lg"
          color="primary"
          variant="solid"
          @click="handleNewChat"
          :loading="isCreating"
          :ui="{ rounded: 'rounded-xl', padding: { lg: 'px-4 py-3' } }"
        >
          <span class="font-semibold">New Chat</span>
        </UButton>
      </div>

      <!-- Chat List -->
      <div class="flex-1 overflow-y-auto px-3 py-2">
        <TransitionGroup name="chat-list" tag="div" class="space-y-1">
        <div
          v-for="chat in chatStore.chats"
          :key="chat.id"
        >
          <UButton
              :variant="chatStore.currentChat?.id === chat.id ? 'solid' : 'ghost'"
              :color="chatStore.currentChat?.id === chat.id ? 'primary' : 'gray'"
            block
              class="justify-start group hover:scale-[1.02] transition-transform"
              :ui="{ 
                rounded: 'rounded-xl',
                padding: { sm: 'px-3 py-2.5' }
              }"
            @click="handleChatSelect(chat.id)"
          >
            <template #leading>
                <UIcon 
                  name="i-heroicons-chat-bubble-left-ellipsis" 
                  class="w-5 h-5"
                  :class="chatStore.currentChat?.id === chat.id ? 'text-white' : 'text-gray-500'"
                />
            </template>
            
              <span class="truncate flex-1 text-left text-sm font-medium">
                {{ chat.title || 'New Conversation' }}
              </span>

            <template #trailing>
              <div class="relative">
                <UButton
                  icon="i-heroicons-ellipsis-vertical"
                  size="xs"
                  color="gray"
                  variant="ghost"
                  class="opacity-100 transition-opacity"
                  @click.stop="() => toggleChatMenu(chat.id)"
                />
                <div 
                  v-if="openChatMenu === chat.id"
                  class="absolute right-0 top-8 z-50 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-gray-200 dark:ring-gray-700"
                >
                  <button
                    class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    @click="() => handleDeleteChat(chat.id)"
                  >
                    <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </template>
          </UButton>
          </div>
        </TransitionGroup>

        <!-- Empty state for chat list -->
        <div v-if="chatStore.chats.length === 0" class="text-center py-8 px-4">
          <UIcon name="i-heroicons-inbox" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p class="text-sm text-gray-500 dark:text-gray-400">No chats yet</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Start a new conversation</p>
        </div>
      </div>
    </div>

    <!-- Center - Chat Window -->
    <div class="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <!-- Welcome Screen -->
      <div v-if="!chatStore.currentChat" class="flex-1 flex items-center justify-center p-8">
        <div class="text-center max-w-2xl">
          <div class="mb-6 relative">
            <div class="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full"></div>
            <UIcon 
              name="i-heroicons-sparkles" 
              class="w-24 h-24 mx-auto text-primary-500 relative animate-pulse" 
            />
          </div>
          <h2 class="text-4xl font-bold mb-3 bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
            Welcome to RAG-AI-Chat
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Your intelligent assistant powered by AI
          </p>
          <UButton
            size="lg"
            icon="i-heroicons-plus-circle"
            @click="handleNewChat"
            :loading="isCreating"
            :ui="{ rounded: 'rounded-full', padding: { lg: 'px-6 py-3' } }"
          >
            Start Your Chat
          </UButton>
        </div>
      </div>

      <!-- Active Chat -->
      <div v-else class="flex-1 flex flex-col h-full min-h-0">
        <!-- Chat Header -->
        <div class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4 flex-shrink-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center">
                <UIcon name="i-heroicons-sparkles" class="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-gray-100">
                  {{ chatStore.currentChat.title || 'New Conversation' }}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  AI Assistant
                </p>
              </div>
                </div>

            <div class="flex items-center gap-4">
              <!-- Chat Mode Tabs - Centered -->
              <div class="flex-1 flex justify-center">
                <nav class="flex items-center gap-1">
                  <UButton
                    :variant="chatMode === 0 ? 'solid' : 'ghost'"
                    :color="chatMode === 0 ? 'green' : 'gray'"
                    @click="chatMode = 0"
                    icon="i-heroicons-magnifying-glass"
                    :ui="{ rounded: 'rounded-lg' }"
                  >
                    RAG Search
                  </UButton>
                    <UButton
                    :variant="chatMode === 1 ? 'solid' : 'ghost'"
                    :color="chatMode === 1 ? 'green' : 'gray'"
                    @click="chatMode = 1"
                    icon="i-heroicons-sparkles"
                    :ui="{ rounded: 'rounded-lg' }"
                  >
                    RAG Assistant
                    </UButton>
                </nav>
                  </div>
                </div>
              <div class="flex items-center gap-4">
              <UButton
                icon="i-heroicons-arrow-path"
                color="gray"
                variant="ghost"
                size="sm"
                @click="handleRefresh"
                title="Refresh chat"
              />
            </div>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="flex-1 relative min-h-0">
          <ChatMessages
            ref="chatMessagesRef"
            class="h-full"
            :messages="chatStore.messages"
            :is-loading="chatStore.isLoading && !isModeSwitching"
            :format-response="formatResponse"
            @document-click="handleDocumentClick"
            @citation-click="handleCitationClick"
            @scroll="handleMessagesScroll"
          />
          
          <!-- Floating scroll to bottom button -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            leave-active-class="transition-all duration-300 ease-in"
            enter-from-class="opacity-0 scale-75 translate-y-2"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-75 translate-y-2"
          >
            <UButton
              v-if="showScrollToBottom"
              icon="i-heroicons-arrow-down"
              color="primary"
              variant="solid"
              size="sm"
              class="absolute bottom-4 right-4 z-10 shadow-lg hover:shadow-xl transition-all duration-200"
              @click="scrollToBottom"
            >
              Scroll to bottom
            </UButton>
          </Transition>
        </div>

        <!-- Input Area - Fixed at bottom -->
        <div class="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <!-- Chat Input -->
          <ChatPrompt
            v-model="messageInput"
            :is-loading="chatStore.isLoading && !isModeSwitching"
            :disabled="!chatStore.currentChat"
            :placeholder="getPlaceholderText()"
            @submit="handleSendMessage"
          >
            <template #footer>
              <div class="flex items-center gap-4 h-12">
                <!-- Index Selector for RAG Search - Only in RAG Search mode -->
                <div v-if="chatMode === 0" class="flex items-center gap-2">
                  <UIcon name="i-heroicons-server" class="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span class="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Search Index:</span>
                  <USelectMenu
                    v-model="selectedIndex"
                    :options="indexOptions"
                    placeholder="Select index..."
                    class="w-[180px]"
                    :ui="{
                      trigger: 'w-full',
                      option: { padding: 'px-3 py-2' }
                    }"
                    @change="handleIndexChange"
                  />
                </div>
                
                <!-- Model Selector for RAG Assistant - Only in RAG Assistant mode -->
                <div v-if="chatMode === 1" class="flex items-center gap-2">
                  <UIcon name="i-heroicons-cpu-chip" class="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span class="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">AI Model:</span>
                  <USelectMenu
                    v-model="selectedModel"
                    :options="modelOptions"
                    placeholder="Select model..."
                    class="w-[180px]"
                    :ui="{
                      trigger: 'w-full',
                      option: { padding: 'px-3 py-2' }
                    }"
                    @change="handleModelChange"
                  />
                </div>
                
                
                <!-- Format Toggle - Only in RAG Search mode -->
                <div v-if="chatMode === 0" class="flex items-center gap-2">
                  <UIcon name="i-heroicons-code-bracket" class="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span class="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Format Assistant Response</span>
                  <UToggle
                    v-model="formatResponse"
                    color="primary"
                    size="md"
                  />
                </div>
              </div>
            </template>
          </ChatPrompt>
        </div>
      </div>
    </div>

    <!-- Document Viewer Modal -->
    <UModal v-model="isDocumentViewerOpen" :ui="{ width: 'w-full sm:max-w-4xl' }">
      <UCard :ui="{ body: { padding: 'p-0' }, rounded: 'rounded-2xl' }">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Document Content</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ selectedDocumentPreview?.name }}
                </p>
              </div>
            </div>
        <UButton
          icon="i-heroicons-x-mark"
          color="gray"
          variant="ghost"
              size="sm"
              @click="closeDocumentViewer"
            />
          </div>
        </template>

        <div class="max-h-96 overflow-y-auto" ref="documentContentContainer">
          <div v-if="isLoadingDocumentContent" class="flex items-center justify-center py-12">
            <div class="text-center">
              <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 mx-auto mb-3 text-primary-500 animate-spin" />
              <p class="text-sm text-gray-500 dark:text-gray-400">Loading content...</p>
            </div>
          </div>
          
          <div v-else-if="documentContentError" class="p-6">
            <UAlert
              color="red"
              variant="soft"
              :description="documentContentError"
              :ui="{ rounded: 'rounded-lg' }"
        />
      </div>
      
          <div v-else class="p-6">
            <div class="prose prose-sm dark:prose-invert max-w-none">
              <pre 
                ref="documentContentElement"
                class="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto"
                v-html="highlightedDocumentContent"
              ></pre>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-between items-center">
            <div v-if="citationPosition !== null" class="text-sm text-gray-500 dark:text-gray-400">
              Citation position: {{ citationPosition }}
            </div>
            <div class="flex gap-3">
              <UButton
                v-if="selectedDocumentPreview?.file?.signedUrl"
                icon="i-heroicons-arrow-down-tray"
                variant="outline"
                @click="downloadCurrentDocument"
              >
                Download
              </UButton>
              <UButton
                color="gray"
                variant="ghost"
                @click="closeDocumentViewer"
              >
                Close
              </UButton>
      </div>
    </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat'
import { useAuthStore } from '~/stores/auth'
import { useChat } from '~/composables/useChat'
import { useDocuments } from '~/composables/useDocuments'

const chatStore = useChatStore()
const authStore = useAuthStore()
const { fetchChats, refreshChatsList, createChat, loadChat, refreshChat, sendMessage, deleteChat } = useChat()
const { getDocumentContent, downloadDocument } = useDocuments()

const messageInput = ref('')
const isCreating = ref(false)
const chatMessagesRef = ref()
const selectedDocumentPreview = ref<any>(null)
const formatResponse = ref(true)
const chatMode = ref(0)

// Document viewer modal
const isDocumentViewerOpen = ref(false)
const isLoadingDocumentContent = ref(false)
const documentContentError = ref('')
const documentContent = ref('')
const citationPosition = ref<number | null>(null)
const documentContentContainer = ref<HTMLElement>()
const documentContentElement = ref<HTMLElement>()

// Флаг для предотвращения показа загрузки при переключении режимов
const isModeSwitching = ref(false)

// Управление открытием меню чатов
const openChatMenu = ref<string | null>(null)

// Управление кнопкой скролла вниз
const showScrollToBottom = ref(false)
const isNearBottom = ref(true)
interface Index {
  name: string
  dimension: number
  metric: string
  status: {
    ready: boolean
    state: string
  }
}

interface IndexOption {
  label: string
  value: string
  description: string
}

interface Model {
  id: string
  name: string
  provider: string
  description: string
}

interface ModelOption {
  label: string
  value: string
  description: string
}

const selectedIndex = ref('')
const indexes = ref<Index[]>([])
const indexOptions = ref<IndexOption[]>([])

const selectedModel = ref('')
const models = ref<Model[]>([])
const modelOptions = ref<ModelOption[]>([])

const chatModeTabs = [
  {
    label: 'RAG Search',
    icon: 'i-heroicons-magnifying-glass'
  },
  {
    label: 'RAG Assistant',
    icon: 'i-heroicons-sparkles'
  }
]

// Save format preference to localStorage
watch(formatResponse, (newValue) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('formatResponse', newValue.toString())
  }
})

// Save chat mode preference to localStorage
watch(chatMode, (newValue) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('chatMode', newValue.toString())
  }
})

const handleNewChat = async () => {
  isCreating.value = true
  const chat = await createChat()
  if (chat) {
    chatStore.setCurrentChat(chat)
    chatStore.setMessages([])
  }
  isCreating.value = false
}

const handleChatSelect = async (chatId: string) => {
  const currentMode = chatModeTabs[chatMode.value]?.label || 'RAG Assistant'
  const modeParam = currentMode === 'RAG Search' ? 'search' : 'assistant'
  await loadChat(chatId, modeParam)
  nextTick(() => {
    chatMessagesRef.value?.scrollToBottom()
  })
}

const handleSendMessage = async (content: string) => {
  if (!content.trim() || !chatStore.currentChat) return

  // Отправляем сообщение с информацией о режиме чата и индексе
  const currentMode = chatModeTabs[chatMode.value]?.label || 'RAG Assistant'
  const payload: any = { 
    chatMode: currentMode === 'RAG Search' ? 'search' : 'assistant',
    formatResponse: formatResponse.value
  }
  console.log(currentMode,'selectedIndex', selectedIndex.value)
  // Добавляем индекс только для режима RAG Search
  if (currentMode === 'RAG Search' && selectedIndex.value) {
    payload.indexName = typeof selectedIndex.value === 'string' ? selectedIndex.value : (selectedIndex.value as any).value
  }
  
  // Добавляем модель только для режима RAG Assistant
  if (currentMode === 'RAG Assistant' && selectedModel.value) {
    payload.modelId = typeof selectedModel.value === 'string' ? selectedModel.value : (selectedModel.value as any).value
  }
  
  console.log('Sending message with:', payload)
  
  await sendMessage(chatStore.currentChat.id, content, payload)
  nextTick(() => {
    chatMessagesRef.value?.scrollToBottom()
    // Скрываем кнопку скролла после отправки сообщения
    showScrollToBottom.value = false
    isNearBottom.value = true
  })
}

const handleDocumentClick = async (doc: any) => {
  // Для RAG Search документы (без цитат)
  const document = {
    id: doc.id,
    name: doc.name,
    file: null
  }
  
  selectedDocumentPreview.value = document
  citationPosition.value = null // Нет конкретной позиции
  
  // Открываем модальное окно и загружаем содержимое
  await openDocumentViewer(doc.id)
}

const handleCitationClick = async (citationRef: any) => {
  // Получаем информацию о документе и цитате
  const document = {
    id: citationRef.file.metadata.documentId,
    name: citationRef.file.metadata.originalName,
    file: citationRef.file
  }
  
  // Находим позицию цитаты (она приходит в родительском объекте citation)
  const citation = citationRef._citation // Передадим это из ChatMessage
  const position = citation?.position || null
  
  selectedDocumentPreview.value = document
  citationPosition.value = position
  
  // Открываем модальное окно и загружаем содержимое
  await openDocumentViewer(document.id)
}


const openDocumentViewer = async (documentId: string) => {
  isDocumentViewerOpen.value = true
  isLoadingDocumentContent.value = true
  documentContentError.value = ''
  
  try {
    const content = await getDocumentContent(documentId)
    documentContent.value = content.text || content.content || 'No content available'
    
    // Прокручиваем к позиции цитаты после загрузки
    if (citationPosition.value !== null) {
      nextTick(() => {
        scrollToCitation()
      })
    }
  } catch (error) {
    console.error('Error loading document content:', error)
    documentContentError.value = 'Failed to load document content'
  } finally {
    isLoadingDocumentContent.value = false
  }
}

const scrollToCitation = () => {
  // Ждем следующего тика для рендера подсвеченного текста
  nextTick(() => {
    const highlightElement = document.getElementById('citation-highlight')
    if (highlightElement && documentContentContainer.value) {
      // Прокручиваем к подсвеченному элементу
      highlightElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
    }
  })
}

const closeDocumentViewer = () => {
  isDocumentViewerOpen.value = false
  documentContent.value = ''
  documentContentError.value = ''
  citationPosition.value = null
  selectedDocumentPreview.value = null
}

const downloadCurrentDocument = async () => {
  if (!selectedDocumentPreview.value) return
  
  try {
    await downloadDocument(
      selectedDocumentPreview.value.id,
      selectedDocumentPreview.value.name
    )
    
    const toast = useToast()
    toast.add({
      title: 'Download Started',
      description: `${selectedDocumentPreview.value.name} is being downloaded`,
      color: 'green',
      icon: 'i-heroicons-arrow-down-tray'
    })
  } catch (error) {
    console.error('Error downloading document:', error)
    
    const toast = useToast()
    toast.add({
      title: 'Download Failed',
      description: 'Failed to download document',
      color: 'red',
      icon: 'i-heroicons-exclamation-triangle'
    })
  }
}

const handleRefresh = async () => {
  if (chatStore.currentChat) {
    const currentMode = chatModeTabs[chatMode.value]?.label || 'RAG Assistant'
    const modeParam = currentMode === 'RAG Search' ? 'search' : 'assistant'
    await refreshChat(chatStore.currentChat.id, modeParam)
  }
}

// Watch for chat mode changes
watch(chatMode, (newMode) => {
  console.log('Chat mode changed to:', chatModeTabs[newMode]?.label || 'Unknown')
  
  // Просто сохраняем режим в localStorage, не перезагружаем сообщения
  // Режим будет использоваться при отправке новых сообщений
  // Это предотвращает мигание загрузки при переключении вкладок
})

const getPlaceholderText = () => {
  const currentMode = chatModeTabs[chatMode.value]?.label || 'RAG Assistant'
  if (currentMode === 'RAG Search') {
    return 'Search through your documents...'
  } else {
    return 'Ask me anything...'
  }
}

// Подсветка текста с позицией цитаты
const highlightedDocumentContent = computed(() => {
  if (!documentContent.value || citationPosition.value === null) {
    return documentContent.value
  }

  const position = citationPosition.value
  const highlightLength = 50
  
  // Экранируем HTML в тексте
  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  const beforeText = escapeHtml(documentContent.value.substring(0, position))
  const highlightedText = escapeHtml(documentContent.value.substring(position, position + highlightLength))
  const afterText = escapeHtml(documentContent.value.substring(position + highlightLength))

  return `${beforeText}<mark class="bg-yellow-300 dark:bg-yellow-600 text-gray-900 dark:text-gray-100 font-semibold" id="citation-highlight">${highlightedText}</mark>${afterText}`
})

const fetchIndexes = async () => {
  try {
    const { api } = useApi()
    const response = await api.get('/documents/indexes')
    indexes.value = response.data.indexes || []
    
    // Преобразуем индексы в формат для USelectMenu
    indexOptions.value = indexes.value.map(index => ({
      label: index.name,
      value: index.name,
      description: `${index.dimension}D • ${index.metric} • ${index.status.state}`
    }))
    
    // Устанавливаем первый индекс по умолчанию
    if (indexOptions.value.length > 0 && indexOptions.value[0]) {
      selectedIndex.value = indexOptions.value[0].value
    }
  } catch (error) {
    console.error('Error fetching indexes:', error)
  }
}

const fetchModels = async () => {
  try {
    const { api } = useApi()
    const response = await api.get('/documents/models')
    
    console.log('Models API response:', response.data)
    
    // Проверяем, что response.data является массивом
    const modelsData = Array.isArray(response.data) ? response.data : []
    console.log('Processed models data:', modelsData)
    
    models.value = modelsData
    
    // Преобразуем модели в формат для USelectMenu
    modelOptions.value = models.value.map(model => ({
      label: model.name,
      value: model.id,
      description: `${model.provider} • ${model.description}`
    }))
    
    console.log('Model options:', modelOptions.value)
    
    // Устанавливаем первую модель по умолчанию
    if (modelOptions.value.length > 0 && modelOptions.value[0]) {
      selectedModel.value = modelOptions.value[0].value
    }
  } catch (error) {
    console.error('Error fetching models:', error)
    // Устанавливаем пустые массивы в случае ошибки
    models.value = []
    modelOptions.value = []
  }
}

const handleIndexChange = (indexName: string | undefined) => {
  console.log('Selected index:', indexName)
  // Здесь можно добавить логику для отправки выбранного индекса на бэкенд
}

const handleModelChange = (modelId: string | undefined) => {
  console.log('Selected model:', modelId)
  // Здесь можно добавить логику для отправки выбранной модели на бэкенд
}

const toggleChatMenu = (chatId: string) => {
  console.log('Toggling menu for chat:', chatId)
  openChatMenu.value = openChatMenu.value === chatId ? null : chatId
}

// Обработка скролла сообщений
const handleMessagesScroll = (event: Event) => {
  const target = event.target as HTMLElement
  const scrollTop = target.scrollTop
  const scrollHeight = target.scrollHeight
  const clientHeight = target.clientHeight
  
  // Проверяем, находимся ли мы близко к низу (в пределах 100px)
  const threshold = 100
  isNearBottom.value = scrollHeight - scrollTop - clientHeight < threshold
  
  // Показываем кнопку, если не находимся внизу
  showScrollToBottom.value = !isNearBottom.value
}

// Скролл вниз
const scrollToBottom = () => {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollToBottom()
    showScrollToBottom.value = false
    isNearBottom.value = true
  }
}

const handleDeleteChat = async (chatId: string) => {
  // Закрываем меню
  openChatMenu.value = null
  
  // Подтверждение удаления
  const confirmed = confirm('Are you sure you want to delete this chat? This action cannot be undone.')
  if (!confirmed) return
  
  try {
    await deleteChat(chatId)
    
    // Показываем уведомление об успешном удалении
    const toast = useToast()
    toast.add({
      title: 'Chat Deleted',
      description: 'Chat has been successfully deleted',
      color: 'green',
      icon: 'i-heroicons-check-circle'
    })
    
    // Если удаленный чат был активным, очищаем текущий чат
    if (chatStore.currentChat?.id === chatId) {
      chatStore.setCurrentChat(null)
      chatStore.setMessages([])
    }
  } catch (error) {
    console.error('Error deleting chat:', error)
    
    const toast = useToast()
    toast.add({
      title: 'Delete Failed',
      description: 'Failed to delete chat. Please try again.',
      color: 'red',
      icon: 'i-heroicons-exclamation-triangle'
    })
  }
}

// Закрытие меню при клике вне его
const closeMenuOnClickOutside = (event: Event) => {
  if (openChatMenu.value && !(event.target as Element).closest('.relative')) {
    openChatMenu.value = null
  }
}

onMounted(async () => {
  // Ensure auth store is loaded before making API calls
  if (typeof window !== 'undefined') {
    authStore.loadFromStorage()
    
    // Добавляем обработчик клика вне меню
    document.addEventListener('click', closeMenuOnClickOutside)
    
    // Load format preference from localStorage
    const savedFormat = localStorage.getItem('formatResponse')
    if (savedFormat !== null) {
      formatResponse.value = savedFormat === 'true'
    }
    
    // Load chat mode preference from localStorage
    const savedMode = localStorage.getItem('chatMode')
    if (savedMode !== null) {
      chatMode.value = parseInt(savedMode)
    }
  }
  
  // Only fetch chats if user is authenticated
  if (authStore.isAuthenticated) {
    await fetchChats()
    await fetchIndexes()
    await fetchModels()
  }
})

onUnmounted(() => {
  // Удаляем обработчик клика при размонтировании
  if (typeof window !== 'undefined') {
    document.removeEventListener('click', closeMenuOnClickOutside)
  }
})

// Экспортируем функции для внешнего использования
defineExpose({
  scrollToBottom: () => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollToBottom()
    }
  }
})
</script>

<style scoped>
.chat-list-enter-active,
.chat-list-leave-active {
  transition: all 0.3s ease;
}

.chat-list-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.chat-list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(100%);
}
</style>


