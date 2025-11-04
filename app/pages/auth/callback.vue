<template>
  <div class="h-screen flex items-center justify-center">
    <UCard>
      <div class="text-center">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>Logging you in...</p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'

const route = useRoute()
const authStore = useAuthStore()
const { api } = useApi()

onMounted(async () => {
  const token = route.query.token as string

  if (!token) {
    navigateTo('/')
    return
  }

  try {
    // Verify token by fetching user profile
    const { data } = await api.get('/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    authStore.setAuth(token, data)
    navigateTo('/chat')
  } catch (error) {
    console.error('Auth error:', error)
    navigateTo('/')
  }
})
</script>

