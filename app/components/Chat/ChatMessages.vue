<template>
  <div ref="scrollContainer" class="h-full overflow-y-auto px-4 py-6 space-y-4 scroll-smooth" @scroll="emit('scroll', $event)">
    <!-- Empty State -->
    <div v-if="messages.length === 0 && !isLoading" class="h-full flex flex-col items-center justify-center text-center px-4">
      <div class="max-w-4xl">
        <!-- Main Icon and Title -->
        <div class="mb-8">
          <div class="relative mb-6">
            <div class="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-blue-500/20 blur-3xl rounded-full"></div>
            <UIcon name="i-heroicons-sparkles" class="w-24 h-24 text-primary-500 mx-auto relative animate-pulse" />
          </div>
          <h3 class="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Welcome to AIR RAG AI
          </h3>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Your intelligent assistant powered by AI. Choose from two powerful modes to get the most out of your uploaded documents.
          </p>
        </div>

        <!-- Two Modes Description -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          <!-- RAG Search Mode -->
          <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                <UIcon name="i-heroicons-magnifying-glass" class="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 class="text-xl font-bold text-gray-800 dark:text-gray-200">RAG Search</h4>
                <p class="text-sm text-green-600 dark:text-green-400 font-medium">Document Search Mode</p>
              </div>
            </div>
            <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Search through your uploaded documents to find specific information. Perfect for finding exact matches, quotes, or specific data points from your knowledge base.
            </p>
            <div class="mt-4 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
              <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
              <span>Returns exact matches with citations</span>
            </div>
          </div>

          <!-- RAG Assistant Mode -->
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                <UIcon name="i-heroicons-sparkles" class="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 class="text-xl font-bold text-gray-800 dark:text-gray-200">RAG Assistant</h4>
                <p class="text-sm text-blue-600 dark:text-blue-400 font-medium">AI Assistant Mode</p>
              </div>
            </div>
            <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Get intelligent answers and insights based on your documents. The AI will analyze your content and provide comprehensive, contextual responses.
            </p>
            <div class="mt-4 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
              <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
              <span>Provides intelligent analysis and insights</span>
            </div>
          </div>
        </div>

        <!-- Getting Started -->
        <div class="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 inline mr-2" />
            <strong>Getting Started:</strong> Switch between modes using the tabs above, then start typing your question in the input field below.
          </p>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <TransitionGroup name="message" tag="div" class="space-y-4">
      <ChatMessage
        v-for="message in messages"
        :key="message.id"
        :content="message.content"
        :role="message.role"
        :created-at="message.createdAt"
        :document-references="message.documentReferences"
        :model-used="message.modelUsed"
        :citations="message.citations"
        :search-results="message.searchResults"
        :index-used="message.indexUsed"
        :metadata="message.metadata"
        :format-response="props.formatResponse"
        @document-click="$emit('document-click', $event)"
        @citation-click="$emit('citation-click', $event)"
      />
    </TransitionGroup>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="flex gap-3">
      <UAvatar
        icon="i-heroicons-sparkles"
        :ui="{ background: 'bg-gray-500 dark:bg-gray-600' }"
        size="sm"
      />
      <UCard
        class="max-w-[75%]"
        :ui="{
          body: { padding: 'p-4' },
          background: 'bg-white dark:bg-gray-800',
          rounded: 'rounded-2xl',
        }"
      >
        <div class="flex items-center gap-2">
          <div class="flex gap-1">
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
          </div>
          <span class="text-sm text-gray-600 dark:text-gray-400">AI is thinking...</span>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
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
  createdAt?: string
  documentReferences?: Array<{
    id: string
    name: string
    similarity: number
  }>
  modelUsed?: string
  citations?: Array<{
    position: number
    references: Array<any>
  }>
  searchResults?: SearchResult[]
  indexUsed?: string
  metadata?: {
    indexUsed?: string
    formatResponse?: boolean
    resultsCount?: number
  }
}

interface Props {
  messages: Message[]
  isLoading?: boolean
  formatResponse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  formatResponse: true
})

const emit = defineEmits<{
  'document-click': [doc: any]
  'citation-click': [citation: any]
  'scroll': [event: Event]
}>()

const scrollContainer = ref<HTMLElement>()


const scrollToBottom = () => {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  })
}

// Watch for new messages and scroll
watch(() => props.messages.length, () => {
  scrollToBottom()
})

watch(() => props.isLoading, (newVal) => {
  if (newVal) {
    scrollToBottom()
  }
})

defineExpose({
  scrollToBottom
})
</script>

<style scoped>
.message-enter-active {
  transition: all 0.3s ease-out;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
</style>


