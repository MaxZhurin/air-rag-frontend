import axios from 'axios'
import { useAuthStore } from '~/stores/auth'

export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const api = axios.create({
    baseURL: config.public.apiBase as string,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Add auth token to requests
  api.interceptors.request.use((config) => {
    // Ensure auth store is loaded from storage
    if (typeof window !== 'undefined') {
      authStore.loadFromStorage()
    }
    
    const token = authStore.getToken
    console.log('API Request:', {
      url: config.url,
      hasToken: !!token,
      isAuthenticated: authStore.isAuthenticated,
      tokenPreview: token ? `${token.substring(0, 10)}...` : 'none',
      authState: {
        token: authStore.token,
        user: authStore.user,
        isAuthenticated: authStore.isAuthenticated
      }
    })
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Authorization header added:', `Bearer ${token.substring(0, 10)}...`)
    } else {
      console.warn('No auth token found for API request:', config.url)
    }
    return config
  })

  // Handle responses and errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
        isNetworkError: !error.response,
        isTimeout: error.code === 'ECONNABORTED',
        isEPIPE: error.message?.includes('EPIPE')
      })

      // Handle specific error types
      if (error.code === 'ECONNABORTED') {
        console.error('Request timeout:', error.config?.url)
      }
      
      if (error.message?.includes('EPIPE')) {
        console.error('Connection broken (EPIPE):', error.config?.url)
      }

      if (error.response?.status === 401) {
        authStore.logout()
        navigateTo('/')
      }
      
      return Promise.reject(error)
    }
  )

  // Retry function for failed requests
  const retryRequest = async (config: any, retries = 3): Promise<any> => {
    try {
      return await api(config)
    } catch (error: any) {
      if (retries > 0 && (error.message?.includes('EPIPE') || error.code === 'ECONNABORTED')) {
        console.log(`Retrying request (${4 - retries}/3):`, config.url)
        await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries))) // Exponential backoff
        return retryRequest(config, retries - 1)
      }
      throw error
    }
  }

  return { api, retryRequest }
}