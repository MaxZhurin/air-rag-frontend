<template>
  <div class="h-screen flex flex-col">
    <!-- Modern Header -->
    <header class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div class="flex items-center justify-between px-6 py-4">
        <!-- Left: Logo & Navigation -->
        <div class="flex items-center gap-6">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center">
              <UIcon name="i-heroicons-sparkles" class="w-6 h-6 text-white" />
            </div>
            <h1 class="text-xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              AIR RAG AI
            </h1>
          </div>
          
          <!-- Navigation Tabs -->
          <nav class="flex items-center gap-1">
            <UButton
              :variant="activeTab === 0 ? 'solid' : 'ghost'"
              :color="activeTab === 0 ? 'primary' : 'gray'"
              @click="activeTab = 0"
              icon="i-heroicons-chat-bubble-left-ellipsis"
              :ui="{ rounded: 'rounded-lg' }"
            >
              Chat
            </UButton>
            <UButton
              :variant="activeTab === 1 ? 'solid' : 'ghost'"
              :color="activeTab === 1 ? 'primary' : 'gray'"
              @click="activeTab = 1"
              icon="i-heroicons-document-text"
              :ui="{ rounded: 'rounded-lg' }"
            >
              Documents
            </UButton>
          </nav>
        </div>

        <!-- Right: Actions & User Menu -->
        <div class="flex items-center gap-3">
          <!-- Color Mode Toggle -->
          <UButton
            icon="i-heroicons-moon"
            color="gray"
            variant="ghost"
            size="lg"
            @click="toggleColorMode"
            title="Toggle dark mode"
            :ui="{ rounded: 'rounded-lg' }"
          />
        
          
          <!-- Divider -->
          <UDivider orientation="vertical" class="h-8" />
          
          <!-- User Menu -->
          <UDropdown :items="userMenuItems" :popper="{ placement: 'bottom-end' }">
            <div class="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <UAvatar
                :src="authStore.user?.picture"
                :alt="authStore.user?.name"
                size="sm"
                :ui="{ rounded: 'rounded-lg' }"
              />
              <div class="hidden md:block text-left">
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {{ authStore.user?.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ authStore.user?.email }}
                </p>
              </div>
              <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 text-gray-500" />
            </div>
          </UDropdown>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div v-if="activeTab === 0" class="flex-1 flex overflow-hidden">
      <ChatInterface ref="chatInterfaceRef" />
    </div>

    <div v-else-if="activeTab === 1" class="flex-1 overflow-auto">
      <DocumentsDashboard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useColorMode } from '@vueuse/core'

definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()
const activeTab = ref(0)
const colorMode = useColorMode()
const chatInterfaceRef = ref()

const toggleColorMode = () => {
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
}

const logout = () => {
  authStore.logout()
  navigateTo('/')
}

const debugAuth = () => {
  console.log('=== AUTH DEBUG ===')
  console.log('Auth Store State:', {
    isAuthenticated: authStore.isAuthenticated,
    hasToken: !!authStore.token,
    tokenPreview: authStore.token ? authStore.token.substring(0, 10) + '...' : 'none',
    user: authStore.user
  })
  
  if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
  }
}

const userMenuItems = [
  [{
    label: authStore.user?.name || 'User',
    slot: 'header',
    disabled: true
  }],
  [{
    label: 'Sign Out',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: logout
  }]
]

// Функция для прокрутки чата вниз
const scrollChatToBottom = () => {
  nextTick(() => {
    if (chatInterfaceRef.value && chatInterfaceRef.value.scrollToBottom) {
      chatInterfaceRef.value.scrollToBottom()
    }
  })
}

// Отслеживание переключения вкладок
watch(activeTab, (newTab) => {
  if (newTab === 0) {
    // Переключились на вкладку "Чат" - прокручиваем вниз
    scrollChatToBottom()
  }
})

onMounted(async () => {
  // Ensure auth store is loaded
  if (typeof window !== 'undefined') {
    authStore.loadFromStorage()
  }
})
</script>