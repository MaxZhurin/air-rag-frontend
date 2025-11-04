import { defineStore } from 'pinia'

interface Document {
  id: string
  name: string
  type: string
  size: number
  status: 'uploading' | 'processing' | 'ready' | 'error'
  errorMessage?: string
  createdAt: string
  updatedAt: string
  originalUrl?: string
  textContent?: string
}

export const useDocumentsStore = defineStore('documents', {
  state: () => ({
    documents: [] as Document[],
    selectedDocument: null as Document | null,
    isUploading: false,
    total: 0,
  }),

  actions: {
    setDocuments(documents: Document[], total: number) {
      this.documents = documents
      this.total = total
    },

    addDocument(document: Document) {
      this.documents.unshift(document)
      this.total++
    },

    removeDocument(documentId: string) {
      this.documents = this.documents.filter(d => d.id !== documentId)
      this.total--
    },

    updateDocument(documentId: string, updates: Partial<Document>) {
      const doc = this.documents.find(d => d.id === documentId)
      if (doc) {
        Object.assign(doc, updates)
      }
    },

    setSelectedDocument(document: Document | null) {
      this.selectedDocument = document
    },

    setUploading(uploading: boolean) {
      this.isUploading = uploading
    },
  },
})


