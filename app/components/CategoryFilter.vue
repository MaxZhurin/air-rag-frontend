<template>
  <div class="flex items-center gap-3">
    <UIcon name="i-heroicons-funnel" class="w-5 h-5 text-gray-500 flex-shrink-0" />
    <span class="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Category:</span>
    <USelectMenu
      v-model="selectedCategoryId"
      :options="categoryOptions"
      value-attribute="value"
      placeholder="All documents"
      class="w-[200px]"
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
  </div>
</template>

<script setup lang="ts">
import { useCategoriesStore, type Category } from '~/stores/categories'

interface CategoryOption {
  label: string
  value: string | null | '__all__'
  count?: number
}

const props = defineProps<{
  modelValue?: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null | undefined]
}>()

const categoriesStore = useCategoriesStore()

// Use '__all__' as a special marker for "all documents"
const ALL_DOCUMENTS_VALUE = '__all__'

const selectedCategoryId = ref<string | null | typeof ALL_DOCUMENTS_VALUE>(
  props.modelValue === undefined ? ALL_DOCUMENTS_VALUE : props.modelValue
)

watch(() => props.modelValue, (newValue) => {
  selectedCategoryId.value = newValue === undefined ? ALL_DOCUMENTS_VALUE : newValue
})

const categoryOptions = computed<CategoryOption[]>(() => {
  const options: CategoryOption[] = [
    {
      label: 'All documents',
      value: ALL_DOCUMENTS_VALUE,
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

const handleCategoryChange = (value: string | null | typeof ALL_DOCUMENTS_VALUE | undefined) => {
  const actualValue = value === undefined ? ALL_DOCUMENTS_VALUE : value
  selectedCategoryId.value = actualValue;
  emit('update:modelValue', actualValue === ALL_DOCUMENTS_VALUE ? undefined : actualValue)
}
</script>

