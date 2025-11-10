<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 left-0 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-md w-full relative">
      <UCard
        :ui="{
          body: { padding: 'p-8' },
          rounded: 'rounded-2xl',
          shadow: 'shadow-2xl',
          ring: 'ring-1 ring-gray-200 dark:ring-gray-700'
        }"
      >
        <!-- Logo and Title -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-blue-600 mb-4">
            <UIcon name="i-heroicons-sparkles" class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent mb-2">
            AIR RAG AI
          </h1>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            AI Chat with Document Search
          </p>
        </div>

        <!-- Tabs -->
        <UTabs
          v-model="activeTab"
          :items="tabs"
          class="mb-6"
          :ui="{ list: { rounded: 'rounded-xl', background: 'bg-gray-100 dark:bg-gray-800' } }"
        />

        <!-- Login Form -->
        <div v-if="activeTab === 0" class="space-y-4">
          <UFormGroup label="Email" name="username">
            <UInput
              v-model="loginForm.username"
              type="text"
              placeholder="Enter your email"
              icon="i-heroicons-user"
              size="lg"
              :ui="{ rounded: 'rounded-lg' }"
              @keydown.enter="handleLogin"
            />
          </UFormGroup>

          <UFormGroup label="Password" name="password">
            <UInput
              v-model="loginForm.password"
              type="password"
              placeholder="Enter your password"
              icon="i-heroicons-lock-closed"
              size="lg"
              :ui="{ rounded: 'rounded-lg' }"
              @keydown.enter="handleLogin"
            />
          </UFormGroup>

          <UButton
            block
            size="lg"
            @click="handleLogin"
            :loading="isLoading"
            :disabled="!loginForm.username || !loginForm.password"
            icon="i-heroicons-arrow-right-on-rectangle"
            :ui="{ rounded: 'rounded-lg' }"
          >
            Sign In
          </UButton>
        </div>

        <!-- Register Form -->
        <div v-else class="space-y-4">
          <UFormGroup label="Username" name="username">
            <UInput
              v-model="registerForm.username"
              type="text"
              placeholder="Choose a username"
              icon="i-heroicons-user"
              size="lg"
              :ui="{ rounded: 'rounded-lg' }"
            />
          </UFormGroup>

          <UFormGroup label="Email" name="email">
            <UInput
              v-model="registerForm.email"
              type="email"
              placeholder="Enter your email"
              icon="i-heroicons-envelope"
              size="lg"
              :ui="{ rounded: 'rounded-lg' }"
            />
          </UFormGroup>

          <UFormGroup label="Full Name" name="name">
            <UInput
              v-model="registerForm.name"
              type="text"
              placeholder="Enter your full name"
              icon="i-heroicons-identification"
              size="lg"
              :ui="{ rounded: 'rounded-lg' }"
            />
          </UFormGroup>

          <UFormGroup label="Password" name="password">
            <UInput
              v-model="registerForm.password"
              type="password"
              placeholder="Choose a password"
              icon="i-heroicons-lock-closed"
              size="lg"
              :ui="{ rounded: 'rounded-lg' }"
            />
          </UFormGroup>

          <UButton
            block
            size="lg"
            color="green"
            @click="handleRegister"
            :loading="isLoading"
            :disabled="!registerForm.username || !registerForm.email || !registerForm.password"
            icon="i-heroicons-user-plus"
            :ui="{ rounded: 'rounded-lg' }"
          >
            Create Account
          </UButton>
        </div>

        <!-- Error/Success Message -->
        <Transition name="fade">
          <UAlert
            v-if="error"
            :color="error.includes('successfully') ? 'green' : 'red'"
            :icon="error.includes('successfully') ? 'i-heroicons-check-circle' : 'i-heroicons-exclamation-circle'"
            :title="error.includes('successfully') ? 'Success' : 'Error'"
            :description="error"
            class="mt-4"
            :close-button="{ icon: 'i-heroicons-x-mark', color: 'gray', variant: 'link' }"
            @close="error = ''"
          />
        </Transition>
      </UCard>

      <!-- Footer -->
      <div class="text-center mt-6">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Powered by AI • Secure • Fast
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'

const authStore = useAuthStore()
const { api } = useApi()

const isLoading = ref(false)
const error = ref('')
const activeTab = ref(0)

const tabs = [
  {
    label: 'Sign In',
    icon: 'i-heroicons-arrow-right-on-rectangle'
  },
  {
    label: 'Sign Up',
    icon: 'i-heroicons-user-plus'
  }
]

const loginForm = ref({
  username: '',
  password: ''
})

const registerForm = ref({
  username: '',
  email: '',
  name: '',
  password: ''
})

const handleLogin = async () => {
  try {
    isLoading.value = true
    error.value = ''

    const response = await api.post('/auth/login', loginForm.value)
    
    console.log('Login response:', response.data)
    
    // Check if response has the expected structure
    if (!response.data.data || !response.data.data.accessToken || !response.data.data.user) {
      throw new Error('Invalid login response structure')
    }
    
    // Save auth data - token is in data.data.accessToken
    authStore.setAuth(response.data.data.accessToken, response.data.data.user)
    
    console.log('Auth store after setAuth:', {
      isAuthenticated: authStore.isAuthenticated,
      hasToken: !!authStore.token,
      tokenPreview: authStore.token ? authStore.token.substring(0, 10) + '...' : 'none'
    })
    
    // Wait a bit to ensure the store is updated
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Redirect to chat
    await navigateTo('/chat')
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  try {
    isLoading.value = true
    error.value = ''

    const response = await api.post('/auth/register', registerForm.value)
    
    // Show success message and switch to login
    error.value = 'Account created successfully! Please sign in.'
    activeTab.value = 0
    
    // Clear register form
    registerForm.value = {
      username: '',
      email: '',
      name: '',
      password: ''
    }
  } catch (err: any) {
    console.error('Register error:', err)
    error.value = err.response?.data?.message || 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// Debug info
console.log('Index page loaded')
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
