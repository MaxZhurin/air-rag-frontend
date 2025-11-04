import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  // Only apply to protected routes
  if (to.path === '/' || to.path === '/auth/callback') {
    return
  }

  if (typeof window !== 'undefined') {
    const authStore = useAuthStore()
    
    // Load auth data from storage
    authStore.loadFromStorage()

    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
      return navigateTo('/')
    }
  }
})

