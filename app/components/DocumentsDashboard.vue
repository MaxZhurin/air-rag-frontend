<template>
  <div class="max-w-7xl mx-auto p-6 sm:p-8">
    <!-- Header -->
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Documents
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Upload and manage your documents for AI-powered search
        </p>
      </div>

      <UButton
        icon="i-heroicons-arrow-up-tray"
        size="lg"
        @click="openUploadModal"
        :loading="documentsStore.isUploading"
        :ui="{ rounded: 'rounded-xl' }"
      >
        Upload Document
      </UButton>
    </div>

    <!-- Empty State -->
    <div
      v-if="documentsStore.documents.length === 0"
      class="text-center py-16"
    >
      <div class="mb-6 relative inline-block">
        <div class="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full"></div>
        <UIcon name="i-heroicons-document-text" class="w-20 h-20 mx-auto text-primary-500 relative" />
      </div>
      <h3 class="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">No documents yet</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Upload documents to start searching through them in chats. We support PDF, DOCX, and TXT files.
      </p>
      <UButton
        size="lg"
        icon="i-heroicons-plus-circle"
        @click="openUploadModal"
        :ui="{ rounded: 'rounded-xl' }"
      >
        Upload Your First Document
      </UButton>
    </div>

    <!-- Documents Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard
        v-for="doc in documentsStore.documents"
        :key="doc.id"
        class="relative group hover:shadow-lg transition-shadow duration-200"
        :ui="{
          body: { padding: 'p-5' },
          rounded: 'rounded-xl',
          ring: 'ring-1 ring-gray-200 dark:ring-gray-700'
        }"
      >
        <template #header>
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-start gap-3 flex-1 min-w-0">
              <div class="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                <UIcon
                  :name="getFileIcon(doc.type)"
                  class="w-6 h-6 text-primary-600 dark:text-primary-400"
                />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {{ doc.name }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatFileSize(doc.size) }}
                </p>
              </div>
            </div>
            
            <UDropdown :items="getDocumentMenuItems(doc.id)">
              <UButton
                icon="i-heroicons-ellipsis-vertical"
                size="sm"
                color="gray"
                variant="ghost"
                class="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </UDropdown>
          </div>
        </template>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">Status</span>
            <UBadge
              :color="getStatusColor(doc.status)"
              variant="soft"
              size="sm"
            >
              {{ doc.status }}
            </UBadge>
          </div>

          <UDivider />

          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">Uploaded</span>
            <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
              {{ formatDate(doc.createdAt) }}
            </span>
          </div>

          <div v-if="doc.status === 'error' && doc.errorMessage" class="mt-3">
            <UAlert
              color="red"
              variant="soft"
              :description="doc.errorMessage"
              :ui="{ rounded: 'rounded-lg' }"
            />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Pagination -->
    <div v-if="documentsStore.total > 10" class="mt-6 flex justify-center">
      <UPagination
        v-model="currentPage"
        :total="documentsStore.total"
        :page-count="10"
        @update:model-value="handlePageChange"
      />
    </div>

    <!-- Upload Modal -->
    <UModal v-model="isUploadModalOpen">
      <UCard :ui="{ body: { padding: 'p-6' }, rounded: 'rounded-2xl' }">
        <template #header>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <UIcon name="i-heroicons-arrow-up-tray" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Upload Document</h3>
          </div>
        </template>

        <div class="space-y-5">
          <UCard
            :ui="{
              body: { padding: 'p-4' },
              background: 'bg-primary-50 dark:bg-primary-950/30',
              ring: 'ring-1 ring-primary-200 dark:ring-primary-800',
              rounded: 'rounded-xl'
            }"
          >
            <div class="flex items-start gap-3">
              <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
              <div class="text-sm text-primary-900 dark:text-primary-100">
                <p class="font-medium mb-1">Supported formats</p>
                <p class="text-primary-700 dark:text-primary-300">PDF, DOCX, TXT • Maximum size: 10MB</p>
              </div>
            </div>
          </UCard>

          <div class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-primary-500 dark:hover:border-primary-400 transition-colors cursor-pointer"
               @click="fileInput?.click()">
            <UIcon name="i-heroicons-cloud-arrow-up" class="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Click to upload or drag and drop
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Your document will be processed for AI search
            </p>
          </div>

          <input
            ref="fileInput"
            type="file"
            accept=".pdf,.docx,.txt"
            @change="handleFileSelect"
            class="hidden"
          />

          <div v-if="selectedFile" class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {{ selectedFile.name }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatFileSize(selectedFile.size) }}
              </p>
            </div>
            <UButton
              icon="i-heroicons-x-mark"
              size="sm"
              color="gray"
              variant="ghost"
              @click="selectedFile = null"
            />
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="gray"
              variant="ghost"
              size="lg"
              @click="isUploadModalOpen = false"
              :ui="{ rounded: 'rounded-lg' }"
            >
              Cancel
            </UButton>
            <UButton
              size="lg"
              icon="i-heroicons-arrow-up-tray"
              @click="handleUpload"
              :disabled="!selectedFile"
              :loading="documentsStore.isUploading"
              :ui="{ rounded: 'rounded-lg' }"
            >
              Upload
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Document Viewer Modal -->
    <UModal v-model="isDocumentViewerOpen" :ui="{ width: 'w-full sm:max-w-4xl' }">
      <UCard :ui="{ body: { padding: 'p-0' }, rounded: 'rounded-2xl' }">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <UIcon 
                  :name="documentViewerType === 'content' ? 'i-heroicons-eye' : 'i-heroicons-arrow-down-tray'" 
                  class="w-5 h-5 text-primary-600 dark:text-primary-400" 
                />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {{ documentViewerType === 'content' ? 'Document Content' : 'Download Document' }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ selectedDocumentForView?.name }}
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

        <div v-if="documentViewerType === 'content'" class="max-h-96 overflow-y-auto">
          <div v-if="isLoadingContent" class="flex items-center justify-center py-12">
            <div class="text-center">
              <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 mx-auto mb-3 text-primary-500 animate-spin" />
              <p class="text-sm text-gray-500 dark:text-gray-400">Loading content...</p>
            </div>
          </div>
          
          <div v-else class="p-6">
            <div class="prose prose-sm dark:prose-invert max-w-none">
              <pre class="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">{{ documentContent }}</pre>
            </div>
          </div>
        </div>

        <div v-else class="p-6">
          <div v-if="isLoadingContent" class="flex items-center justify-center py-12">
            <div class="text-center">
              <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 mx-auto mb-3 text-primary-500 animate-spin" />
              <p class="text-sm text-gray-500 dark:text-gray-400">Preparing download...</p>
            </div>
          </div>
          
          <div v-else class="text-center py-8">
            <div class="mb-6">
              <UIcon name="i-heroicons-arrow-down-tray" class="w-16 h-16 mx-auto text-primary-500 mb-4" />
              <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Download Document
              </h4>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                Choose how you want to download the document
              </p>
            </div>
            
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <UButton
                size="lg"
                icon="i-heroicons-arrow-down-tray"
                @click="handleDirectDownload"
                :loading="isLoadingContent"
                :ui="{ rounded: 'rounded-xl' }"
              >
                Download {{ selectedDocumentForView?.name }}
              </UButton>
              
              <UButton
                v-if="documentDownloadUrl"
                size="lg"
                icon="i-heroicons-arrow-top-right-on-square"
                :to="documentDownloadUrl"
                target="_blank"
                variant="outline"
                :ui="{ rounded: 'rounded-xl' }"
              >
                Open in New Tab
              </UButton>
            </div>
            
            <UAlert
              v-if="!documentDownloadUrl && !isLoadingContent"
              color="red"
              variant="soft"
              description="Unable to generate download link"
              :ui="{ rounded: 'rounded-lg' }"
              class="mt-4"
            />
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useDocumentsStore } from '~/stores/documents'
import { useAuthStore } from '~/stores/auth'
import { useDocuments } from '~/composables/useDocuments'

const documentsStore = useDocumentsStore()
const authStore = useAuthStore()
const { fetchDocuments, uploadDocument, deleteDocument, reprocessDocument, getDocumentContent, getDocumentOriginalUrl, downloadDocument } = useDocuments()

const isUploadModalOpen = ref(false)
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement>()
const currentPage = ref(1)

// Document viewer modal
const isDocumentViewerOpen = ref(false)
const documentViewerType = ref<'content' | 'download'>('content')
const documentContent = ref('')
const documentDownloadUrl = ref('')
const isLoadingContent = ref(false)
const selectedDocumentForView = ref<any>(null)

const openUploadModal = () => {
  isUploadModalOpen.value = true
  selectedFile.value = null
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}

const handleUpload = async () => {
  if (!selectedFile.value) return

  await uploadDocument(selectedFile.value)
  isUploadModalOpen.value = false
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handlePageChange = (page: number) => {
  fetchDocuments(page, 10)
}

const openDocumentViewer = async (documentId: string, type: 'content' | 'download') => {
  const document = documentsStore.documents.find(d => d.id === documentId)
  if (!document) return

  selectedDocumentForView.value = document
  documentViewerType.value = type
  isDocumentViewerOpen.value = true
  isLoadingContent.value = true

  try {
    if (type === 'content') {
      const content = await getDocumentContent(documentId)
      documentContent.value = content.text || content.content || 'No content available'
    } else {
      // Для скачивания получаем URL и показываем интерфейс
      const url = await getDocumentOriginalUrl(documentId)
      documentDownloadUrl.value = url
    }
  } catch (error) {
    console.error('Error loading document:', error)
    if (type === 'content') {
      documentContent.value = 'Error loading document content'
    } else {
      documentContent.value = 'Error loading download link'
    }
  } finally {
    isLoadingContent.value = false
  }
}

const closeDocumentViewer = () => {
  isDocumentViewerOpen.value = false
  documentContent.value = ''
  documentDownloadUrl.value = ''
  selectedDocumentForView.value = null
}

const handleDirectDownload = async () => {
  if (!selectedDocumentForView.value) return
  
  isLoadingContent.value = true
  
  try {
    await downloadDocument(selectedDocumentForView.value.id, selectedDocumentForView.value.name)
    
    const toast = useToast()
    toast.add({
      title: 'Download Started',
      description: `${selectedDocumentForView.value.name} is being downloaded`,
      color: 'green',
      icon: 'i-heroicons-arrow-down-tray'
    })
    
    closeDocumentViewer()
  } catch (error) {
    console.error('Error downloading document:', error)
    
    const toast = useToast()
    toast.add({
      title: 'Download Failed',
      description: 'Failed to download document',
      color: 'red',
      icon: 'i-heroicons-exclamation-triangle'
    })
  } finally {
    isLoadingContent.value = false
  }
}

const getDocumentMenuItems = (documentId: string) => [
  [
    {
      label: 'View Content',
      icon: 'i-heroicons-eye',
      click: () => openDocumentViewer(documentId, 'content'),
    },
    {
      label: 'Download Original',
      icon: 'i-heroicons-arrow-down-tray',
      click: () => openDocumentViewer(documentId, 'download'),
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-heroicons-trash',
      click: () => deleteDocument(documentId),
    },
  ],
]

const getFileIcon = (type: string) => {
  if (type.includes('pdf')) return 'i-heroicons-document-text'
  if (type.includes('word')) return 'i-heroicons-document'
  return 'i-heroicons-document-text'
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ready': return 'green'
    case 'processing': return 'yellow'
    case 'error': return 'red'
    default: return 'gray'
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

onMounted(async () => {
  // Ensure auth store is loaded before making API calls
  if (typeof window !== 'undefined') {
    authStore.loadFromStorage()
  }
  
  // Only fetch documents if user is authenticated
  if (authStore.isAuthenticated) {
    await fetchDocuments()
  }
})
</script>


