import { useDocumentsStore } from '~/stores/documents'
import { useApi } from './useApi'

export const useDocuments = () => {
  const documentsStore = useDocumentsStore()
  const { api } = useApi()

  const fetchDocuments = async (page: number = 1, limit: number = 10) => {
    try {
      const { data } = await api.get('/documents', {
        params: { page, limit },
      })
      documentsStore.setDocuments(data.documents, data.total)
    } catch (error) {
      console.error('Error loading documents:', error)
    }
  }

  const uploadDocument = async (file: File) => {
    try {
      documentsStore.setUploading(true)
      
      const formData = new FormData()
      formData.append('file', file)

      const { data } = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      documentsStore.addDocument(data)
      
      // Poll for status updates
      pollDocumentStatus(data.id)
      
      return data
    } catch (error: any) {
      console.error('Error uploading document:', error)
    } finally {
      documentsStore.setUploading(false)
    }
  }

  const pollDocumentStatus = async (documentId: string) => {
    const maxAttempts = 60
    let attempts = 0

    const poll = async () => {
      try {
        const { data } = await api.get(`/documents/${documentId}/status`)
        
        documentsStore.updateDocument(documentId, { status: data.status })

        if (data.status === 'ready') {
          return
        }

        if (data.status === 'error') {
          return
        }

        if (attempts < maxAttempts) {
          attempts++
          setTimeout(poll, 2000)
        }
      } catch (error) {
        console.error('Error polling document status:', error)
      }
    }

    poll()
  }

  const deleteDocument = async (documentId: string) => {
    try {
      await api.delete(`/documents/${documentId}`)
      documentsStore.removeDocument(documentId)
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  const reprocessDocument = async (documentId: string) => {
    try {
      const { data } = await api.post(`/documents/${documentId}/reprocess`)
      documentsStore.updateDocument(documentId, data)
      
      pollDocumentStatus(documentId)
    } catch (error) {
      console.error('Error reprocessing document:', error)
    }
  }

  const getDocumentContent = async (documentId: string) => {
    try {
      const { data } = await api.get(`/documents/${documentId}/content`)
      return data
    } catch (error) {
      console.error('Error fetching document content:', error)
      throw error
    }
  }

  const getDocumentOriginalUrl = async (documentId: string) => {
    try {
      const { data } = await api.get(`/documents/${documentId}/download`)
      return data.url
    } catch (error) {
      console.error('Error fetching document download URL:', error)
      throw error
    }
  }

  const downloadDocument = async (documentId: string, filename: string) => {
    try {
      // Получаем URL для скачивания
      const { data } = await api.get(`/documents/${documentId}/download`)
      const url = data.url
      
      // Получаем токен авторизации
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      // Скачиваем файл с авторизацией
      const fileResponse = await fetch(`${window.location.origin}${url}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!fileResponse.ok) {
        throw new Error(`Failed to download file: ${fileResponse.statusText}`)
      }
      
      const blob = await fileResponse.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      
      // Создаем ссылку для скачивания
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      // Освобождаем память
      window.URL.revokeObjectURL(downloadUrl)
      
      return true
    } catch (error) {
      console.error('Error downloading document:', error)
      throw error
    }
  }

  return {
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    reprocessDocument,
    getDocumentContent,
    getDocumentOriginalUrl,
    downloadDocument,
  }
}