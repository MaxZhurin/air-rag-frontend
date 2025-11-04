import { defineStore } from 'pinia'

interface User {
  id: string
  username: string
  email: string
  name: string
  picture?: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    isAuthenticated: false,
  }),

  actions: {
    setAuth(token: string, user: User) {
      // Validate inputs
      if (!token || !user) {
        console.error('Invalid auth data:', { token: !!token, user: !!user })
        return
      }
      
      console.log('Setting auth:', { token: token.substring(0, 10) + '...', user })
      
      this.token = token
      this.user = user
      this.isAuthenticated = true
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))
          console.log('Auth data saved to localStorage')
        } catch (error) {
          console.error('Error saving auth data to localStorage:', error)
        }
      }
    },

    logout() {
      this.token = null
      this.user = null
      this.isAuthenticated = false
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    },

    clearInvalidData() {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        this.token = null
        this.user = null
        this.isAuthenticated = false
      }
    },

    loadFromStorage() {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        
        console.log('Loading from storage:', { 
          hasToken: !!token, 
          hasUser: !!userStr,
          tokenPreview: token ? token.substring(0, 10) + '...' : 'none',
          userStr: userStr
        })
        
        if (token && userStr && userStr !== 'undefined' && userStr !== 'null') {
          try {
            this.token = token
            this.user = JSON.parse(userStr)
            this.isAuthenticated = true
            console.log('Auth loaded from storage successfully')
          } catch (error) {
            console.error('Error parsing user data from localStorage:', error)
            // Clear invalid data
            this.clearInvalidData()
          }
        } else {
          console.log('No valid auth data found in storage')
        }
      }
    },
  },

  getters: {
    getUser: (state) => state.user,
    getToken: (state) => state.token,
  },
})


