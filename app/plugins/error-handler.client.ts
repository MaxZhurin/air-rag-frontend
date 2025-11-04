export default defineNuxtPlugin(() => {
  // Global error handler for client-side errors
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    
    // Handle EPIPE errors specifically
    if (event.reason?.message?.includes('EPIPE')) {
      console.warn('EPIPE error detected, this might be a network issue')
      // Optionally show user notification
    }
  })

  // Handle fetch errors
  const originalFetch = window.fetch
  window.fetch = async (...args) => {
    try {
      return await originalFetch(...args)
    } catch (error: any) {
      if (error.message?.includes('EPIPE')) {
        console.warn('Fetch EPIPE error:', args[0])
      }
      throw error
    }
  }
})
