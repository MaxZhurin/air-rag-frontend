import { defineStore } from 'pinia'

export interface Category {
  id: string
  name: string
  description?: string
}

export interface Document {
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
  categoryId?: string | null
  category?: Category | null
  uploadedBy?: {
    email: string
    name: string
  }
}

export const useDocumentsStore = defineStore('documents', {
  state: () => ({
    documents: [] as Document[],
    selectedDocument: null as Document | null,
    isUploading: false,
    total: 0,
    deletingDocuments: new Set<string>(),
  }),

  getters: {
    isDeleting: (state) => (documentId: string) => {
      return state.deletingDocuments.has(documentId)
    },
  },

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
      this.deletingDocuments.delete(documentId)
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

    setDeleting(documentId: string, deleting: boolean) {
      if (deleting) {
        this.deletingDocuments.add(documentId)
      } else {
        this.deletingDocuments.delete(documentId)
      }
    },
  },
})


