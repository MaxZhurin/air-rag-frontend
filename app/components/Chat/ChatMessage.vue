<template>
  <div
    class="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500"
    :class="isUser ? 'flex-row-reverse' : 'flex-row'"
  >
    <!-- Avatar -->
    <UAvatar
      :alt="isUser ? 'User' : 'AI Assistant'"
      :icon="isUser ? 'i-heroicons-user' : 'i-heroicons-sparkles'"
      :ui="{
        background: isUser ? 'bg-primary-500' : 'bg-gray-500 dark:bg-gray-600'
      }"
      size="sm"
    />

    <!-- Message Content -->
    <div class="flex-1 max-w-[75%]">
      <UCard
        :ui="{
          body: { padding: 'p-4' },
          background: isUser 
            ? 'bg-primary-50 dark:bg-primary-950/30' 
            : 'bg-white dark:bg-gray-800',
          ring: isUser ? 'ring-1 ring-primary-200 dark:ring-primary-800' : '',
          rounded: 'rounded-2xl',
          shadow: 'shadow-sm hover:shadow-md transition-shadow duration-200'
        }"
      >
        <!-- Message Header -->
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold" :class="isUser ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'">
            {{ isUser ? 'You' : 'AI Assistant' }}
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ formattedTime }}
          </span>
        </div>

        <!-- Message Text -->
        <div 
          class="prose prose-sm dark:prose-invert max-w-none"
          :class="isUser ? 'text-gray-900 dark:text-gray-100' : 'text-gray-800 dark:text-gray-200'"
        >
          <div 
            v-if="!isUser && formatResponse" 
            class="whitespace-pre-wrap break-words m-0"
            v-html="formatText(content)"
          ></div>
          <p v-else class="whitespace-pre-wrap break-words m-0">{{ content }}</p>
        </div>

        <!-- AI Model Info -->
        <div v-if="!isUser && modelUsed" class="mt-3 flex items-center gap-2">
          <UIcon name="i-heroicons-cpu-chip" class="w-3 h-3 text-gray-500" />
          <span class="text-xs text-gray-500 dark:text-gray-400">
            Model: <span class="font-medium">{{ modelUsed }}</span>
          </span>
        </div>

        <!-- Search Results from RAG Search -->
        <div v-if="!isUser && searchResults && searchResults.length > 0" class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-2">
            <p class="text-xs font-semibold text-gray-600 dark:text-gray-400">
              🔍 Search Results
            </p>
            <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span v-if="indexUsed">Index: {{ indexUsed }}</span>
              <span v-if="metadata?.resultsCount">({{ metadata.resultsCount }} results)</span>
            </div>
          </div>
          
          <!-- Unique Documents -->
          <div v-if="uniqueDocuments.length > 0" class="mb-3">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Found in documents:</p>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="doc in uniqueDocuments"
                :key="doc.id"
                color="primary"
                variant="soft"
                size="sm"
                class="cursor-pointer hover:scale-105 transition-transform"
                @click="emit('document-click', { id: doc.id, name: doc.name, similarity: doc.score })"
              >
                <template #leading>
                  <UIcon name="i-heroicons-document-text" class="w-3 h-3" />
                </template>
                {{ doc.name }}
                <span class="ml-1 text-xs opacity-75">
                  ({{ (doc.score * 100).toFixed(0) }}%)
                </span>
              </UBadge>
            </div>
          </div>
          
          <!-- Search Results Details -->
          <div class="space-y-2 max-h-50 overflow-y-auto">
            <div
              v-for="(result, index) in searchResults.slice(0, 3)"
              :key="result._id"
              class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ result.fields.metadata.fileName || 'Document' }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    Chunk {{ result.fields.metadata.chunkIndex || 'N/A' }}
                  </span>
                </div>
                <UBadge color="green" variant="soft" size="xs">
                  {{ (result._score * 100).toFixed(0) }}%
                </UBadge>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-300 line-clamp-3">
                {{ result.fields.text }}
              </p>
            </div>
          </div>
        </div>

        <!-- Citations from RAG Assistant -->
        <div v-if="!isUser && citations && citations.length > 0" class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
            📚 Sources & Citations
          </p>
          <div class="space-y-2">
            <div
              v-for="(citation, index) in citations"
              :key="index"
              class="flex flex-col gap-1"
            >
              <div
                v-for="(ref, refIndex) in citation.references"
                :key="refIndex"
                class="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                @click="emit('citation-click', { ...ref, _citation: citation })"
              >
                <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-primary-500 flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {{ ref.file.metadata.originalName }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Position: {{ citation.position }}
                  </p>
                </div>
                <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>

        <!-- Document References (RAG Search) -->
        <div v-if="documentReferences && documentReferences.length > 0" class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
            📎 Referenced Documents
          </p>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="doc in documentReferences"
              :key="doc.id"
              color="primary"
              variant="soft"
              size="sm"
              class="cursor-pointer hover:scale-105 transition-transform"
              @click="emit('document-click', doc)"
            >
              <template #leading>
                <UIcon name="i-heroicons-document-text" class="w-3 h-3" />
              </template>
              {{ doc.name }}
              <span class="ml-1 text-xs opacity-75">
                ({{ (doc.similarity * 100).toFixed(0) }}%)
              </span>
            </UBadge>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DocumentReference {
  id: string
  name: string
  similarity: number
}

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

interface Props {
  content: string
  role: 'user' | 'assistant'
  createdAt?: string
  documentReferences?: DocumentReference[]
  modelUsed?: string
  citations?: Citation[]
  searchResults?: SearchResult[]
  indexUsed?: string
  metadata?: {
    indexUsed?: string
    formatResponse?: boolean
    resultsCount?: number
  }
  formatResponse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  formatResponse: true
})

const emit = defineEmits<{
  'document-click': [doc: DocumentReference]
  'citation-click': [citation: any]
}>()

const isUser = computed(() => props.role === 'user')

const formattedTime = computed(() => {
  if (!props.createdAt) return ''
  const date = new Date(props.createdAt)
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
})

// Уникальные документы из результатов поиска
const uniqueDocuments = computed(() => {
  if (!props.searchResults) return []
  
  const documentMap = new Map()
  
  props.searchResults.forEach(result => {
    const docId = result.fields.metadata.documentId
    const fileName = result.fields.metadata.fileName || 'Unknown Document'
    const score = result._score
    
    if (!documentMap.has(docId) || documentMap.get(docId).score < score) {
      documentMap.set(docId, {
        id: docId,
        name: fileName,
        score: score,
        metadata: result.fields.metadata
      })
    }
  })
  
  return Array.from(documentMap.values())
})

const formatText = (text: string) => {
  if (!text) return ''
  
  // Format code blocks
  let formatted = text.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto"><code class="text-sm">$2</code></pre>')
  
  // Format inline code
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
  
  // Format bold text
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  
  // Format italic text
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')
  
  // Format links
  formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-primary-600 hover:text-primary-800 underline">$1</a>')
  
  // Format line breaks
  formatted = formatted.replace(/\n/g, '<br>')
  
  return formatted
}
</script>

