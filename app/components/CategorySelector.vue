<template>
  <USelectMenu
    v-model="selectedCategoryId"
    :options="categoryOptions"
    value-attribute="value"
    :placeholder="placeholder"
    :ui="{
      trigger: 'w-full',
      option: { padding: 'px-3 py-2' }
    }"
    @change="handleCategoryChange"
  >
    <template #option="{ option }">
      <div class="flex items-center justify-between w-full">
        <span>{{ option.label }}</span>
        <span v-if="option.count !== undefined" class="text-xs text-gray-500 dark:text-gray-400">
          ({{ option.count }})
        </span>
      </div>
    </template>
  </USelectMenu>
</template>

<script setup lang="ts">
import { useCategoriesStore, type Category } from '~/stores/categories'

interface CategoryOption {
  label: string
  value: string | null
  count?: number
}

const props = defineProps<{
  modelValue?: string | null
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const categoriesStore = useCategoriesStore()

const selectedCategoryId = ref<string | null | undefined>(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  selectedCategoryId.value = newValue
})

const categoryOptions = computed<CategoryOption[]>(() => {
  const options: CategoryOption[] = [
    {
      label: 'Without category',
      value: null,
    },
  ]

  // Add all categories
  categoriesStore.categories.forEach((category: Category) => {
    options.push({
      label: category.name,
      value: category.id,
      count: category.documentCount,
    })
  })

  return options
})

const handleCategoryChange = (value: string | null | undefined) => {
  selectedCategoryId.value = value === undefined ? null : value
  emit('update:modelValue', value === undefined ? null : value)
}
</script>

