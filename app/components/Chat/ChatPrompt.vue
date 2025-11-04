<template>
  <div class="bg-white dark:bg-gray-800">
    <div class="max-w-4xl mx-auto p-4">
      <form @submit.prevent="handleSubmit" class="relative">
        <!-- Main Input Area -->
        <div class="flex items-end gap-3">
          <!-- Textarea -->
          <div class="flex-1 relative">
            <UTextarea
              v-model="inputValue"
              :rows="1"
              autoresize
              :maxrows="6"
              :placeholder="placeholder"
              :disabled="disabled || isLoading"
              class="pr-12"
              :ui="{
                wrapper: 'relative',
                base: 'rounded-2xl resize-none',
                padding: { sm: 'px-4 py-3' }
              }"
              @keydown.enter.exact="handleEnterKey"
            />
            
            <!-- Character count or file attachment button (optional) -->
            <div class="absolute right-3 bottom-3 flex items-center gap-2">
              <UButton
                v-if="showAttachment"
                icon="i-heroicons-paper-clip"
                size="xs"
                color="gray"
                variant="ghost"
                :disabled="disabled || isLoading"
                @click="$emit('attachment-click')"
              />
            </div>
          </div>

          <!-- Send Button -->
          <UButton
            type="submit"
            icon="i-heroicons-paper-airplane"
            size="lg"
            color="primary"
            :disabled="!canSend"
            :loading="isLoading"
            class="rounded-full w-12 h-12 flex items-center justify-center"
            :ui="{ padding: { lg: 'p-0' } }"
          />
        </div>

        <!-- Custom Content Slot or Helper Text -->
        <div class="mt-2 px-2">
          <slot name="footer">
            <div class="flex items-center justify-between">
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Press <kbd class="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">Enter</kbd> to send, 
                <kbd class="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">Shift + Enter</kbd> for new line
              </p>
              
              <div v-if="maxLength" class="text-xs text-gray-500 dark:text-gray-400">
                {{ inputValue.length }} / {{ maxLength }}
              </div>
            </div>
          </slot>
        </div>
      </form>

      <!-- Quick Actions (Optional) -->
      <div v-if="showQuickActions && quickActions.length > 0" class="flex flex-wrap gap-2 mt-3">
        <UButton
          v-for="action in quickActions"
          :key="action.label"
          :icon="action.icon"
          size="xs"
          color="gray"
          variant="soft"
          :disabled="disabled || isLoading"
          @click="handleQuickAction(action)"
        >
          {{ action.label }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface QuickAction {
  label: string
  icon?: string
  value: string
}

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  isLoading?: boolean
  maxLength?: number
  showAttachment?: boolean
  showQuickActions?: boolean
  quickActions?: QuickAction[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Type your message...',
  disabled: false,
  isLoading: false,
  showAttachment: false,
  showQuickActions: false,
  quickActions: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'submit': [value: string]
  'attachment-click': []
  'quick-action': [action: QuickAction]
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const canSend = computed(() => {
  const trimmed = inputValue.value.trim()
  return trimmed.length > 0 && !props.disabled && !props.isLoading
})

const handleSubmit = () => {
  if (canSend.value) {
    emit('submit', inputValue.value.trim())
    inputValue.value = ''
  }
}

const handleEnterKey = (event: KeyboardEvent) => {
  if (!event.shiftKey && canSend.value) {
    event.preventDefault()
    handleSubmit()
  }
}

const handleQuickAction = (action: QuickAction) => {
  emit('quick-action', action)
  inputValue.value = action.value
}
</script>

