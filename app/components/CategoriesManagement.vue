<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Categories</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage document categories
        </p>
      </div>
      <UButton
        icon="i-heroicons-plus-circle"
        @click="openCreateModal"
        :ui="{ rounded: 'rounded-lg' }"
      >
        Create Category
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="categoriesStore.isLoading" class="text-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 mx-auto mb-3 text-primary-500 animate-spin" />
      <p class="text-sm text-gray-500 dark:text-gray-400">Loading categories...</p>
    </div>

    <!-- Error State -->
    <UAlert
      v-if="categoriesStore.error"
      color="red"
      variant="soft"
      :description="categoriesStore.error"
      :ui="{ rounded: 'rounded-lg' }"
      class="mb-4"
    />

    <!-- Categories List -->
    <div v-else-if="categoriesStore.categories.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard
        v-for="category in categoriesStore.categories"
        :key="category.id"
        class="relative group hover:shadow-lg transition-shadow duration-200"
        :ui="{
          body: { padding: 'p-5' },
          rounded: 'rounded-xl',
          ring: 'ring-1 ring-gray-200 dark:ring-gray-700'
        }"
      >
        <template #header>
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {{ category.name }}
              </h4>
              <p v-if="category.description" class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {{ category.description }}
              </p>
            </div>
            
            <UDropdown :items="getCategoryMenuItems(category.id)">
              <UButton
                icon="i-heroicons-ellipsis-vertical"
                size="sm"
                color="gray"
                variant="ghost"
                class="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </UDropdown>
          </div>
        </template>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400">Documents</span>
            <UBadge
              color="primary"
              variant="soft"
              size="sm"
            >
              {{ category.documentCount }}
            </UBadge>
          </div>

          <div v-if="!category.deletable" class="mt-3">
            <UAlert
              color="yellow"
              variant="soft"
              description="This category is in use and cannot be deleted"
              :ui="{ rounded: 'rounded-lg' }"
            />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <UIcon name="i-heroicons-folder" class="w-12 h-12 mx-auto mb-3 text-gray-400" />
      <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No categories yet</h4>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Create your first category to organize documents
      </p>
      <UButton
        icon="i-heroicons-plus-circle"
        @click="openCreateModal"
        :ui="{ rounded: 'rounded-lg' }"
      >
        Create Category
      </UButton>
    </div>

    <!-- Create/Edit Category Modal -->
    <UModal v-model="isCategoryModalOpen">
      <UCard :ui="{ body: { padding: 'p-6' }, rounded: 'rounded-2xl' }">
        <template #header>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <UIcon 
                :name="editingCategory ? 'i-heroicons-pencil' : 'i-heroicons-plus-circle'"
                class="w-5 h-5 text-primary-600 dark:text-primary-400" 
              />
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">
              {{ editingCategory ? 'Edit Category' : 'Create Category' }}
            </h3>
          </div>
        </template>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name <span class="text-red-500">*</span>
            </label>
            <UInput
              v-model="categoryForm.name"
              placeholder="Category name"
              :ui="{ rounded: 'rounded-lg' }"
            />
            <p v-if="nameError" class="mt-1 text-sm text-red-500">{{ nameError }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <UTextarea
              v-model="categoryForm.description"
              placeholder="Category description (optional)"
              :rows="3"
              :ui="{ rounded: 'rounded-lg' }"
            />
          </div>

          <UAlert
            v-if="categoryError"
            color="red"
            variant="soft"
            :description="categoryError"
            :ui="{ rounded: 'rounded-lg' }"
          />
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="gray"
              variant="ghost"
              size="lg"
              @click="closeCategoryModal"
              :ui="{ rounded: 'rounded-lg' }"
            >
              Cancel
            </UButton>
            <UButton
              size="lg"
              :icon="editingCategory ? 'i-heroicons-pencil' : 'i-heroicons-plus-circle'"
              @click="handleSaveCategory"
              :loading="isSaving"
              :disabled="!categoryForm.name.trim()"
              :ui="{ rounded: 'rounded-lg' }"
            >
              {{ editingCategory ? 'Update' : 'Create' }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useCategoriesStore, type Category } from '~/stores/categories'
import { useCategories } from '~/composables/useCategories'

const categoriesStore = useCategoriesStore()
const { createCategory, updateCategory, deleteCategory } = useCategories()

const isCategoryModalOpen = ref(false)
const editingCategory = ref<Category | null>(null)
const isSaving = ref(false)
const categoryError = ref('')
const nameError = ref('')

const categoryForm = ref({
  name: '',
  description: '',
})

const openCreateModal = () => {
  editingCategory.value = null
  categoryForm.value = { name: '', description: '' }
  categoryError.value = ''
  nameError.value = ''
  isCategoryModalOpen.value = true
}

const openEditModal = (category: Category) => {
  editingCategory.value = category
  categoryForm.value = {
    name: category.name,
    description: category.description || '',
  }
  categoryError.value = ''
  nameError.value = ''
  isCategoryModalOpen.value = true
}

const closeCategoryModal = () => {
  isCategoryModalOpen.value = false
  editingCategory.value = null
  categoryForm.value = { name: '', description: '' }
  categoryError.value = ''
  nameError.value = ''
}

const validateForm = (): boolean => {
  nameError.value = ''
  categoryError.value = ''

  if (!categoryForm.value.name.trim()) {
    nameError.value = 'Name is required'
    return false
  }

  // Check for duplicate names (excluding current category if editing)
  const existingCategory = categoriesStore.categories.find(
    c => c.name.toLowerCase() === categoryForm.value.name.trim().toLowerCase() &&
         c.id !== editingCategory.value?.id
  )

  if (existingCategory) {
    nameError.value = 'Category with this name already exists'
    return false
  }

  return true
}

const handleSaveCategory = async () => {
  if (!validateForm()) {
    return
  }

  isSaving.value = true
  categoryError.value = ''

  try {
    const toast = useToast()

    if (editingCategory.value) {
      await updateCategory(editingCategory.value.id, {
        name: categoryForm.value.name.trim(),
        description: categoryForm.value.description.trim() || undefined,
      })
      
      toast.add({
        title: 'Category Updated',
        description: 'Category has been successfully updated',
        color: 'green',
        icon: 'i-heroicons-check-circle'
      })
    } else {
      await createCategory(
        categoryForm.value.name.trim(),
        categoryForm.value.description.trim() || undefined
      )
      
      toast.add({
        title: 'Category Created',
        description: 'Category has been successfully created',
        color: 'green',
        icon: 'i-heroicons-check-circle'
      })
    }

    closeCategoryModal()
  } catch (error: any) {
    console.error('Error saving category:', error)
    
    const errorMessage = error.response?.data?.message || 'Failed to save category'
    
    if (error.response?.status === 409) {
      nameError.value = errorMessage
    } else {
      categoryError.value = errorMessage
    }
  } finally {
    isSaving.value = false
  }
}

const handleDeleteCategory = async (categoryId: string) => {
  const category = categoriesStore.categories.find(c => c.id === categoryId)
  if (!category) return

  // Confirmation
  const confirmed = confirm(
    `Are you sure you want to delete "${category.name}"? This action cannot be undone.`
  )
  if (!confirmed) return

  try {
    await deleteCategory(categoryId)
    
    const toast = useToast()
    toast.add({
      title: 'Category Deleted',
      description: 'Category has been successfully deleted',
      color: 'green',
      icon: 'i-heroicons-check-circle'
    })
  } catch (error: any) {
    console.error('Error deleting category:', error)
    
    const toast = useToast()
    const errorMessage = error.response?.data?.message || 'Failed to delete category'
    
    toast.add({
      title: 'Delete Failed',
      description: errorMessage,
      color: 'red',
      icon: 'i-heroicons-exclamation-triangle'
    })
  }
}

const getCategoryMenuItems = (categoryId: string) => [
  [
    {
      label: 'Edit',
      icon: 'i-heroicons-pencil',
      click: () => {
        const category = categoriesStore.categories.find(c => c.id === categoryId)
        if (category) {
          openEditModal(category)
        }
      },
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-heroicons-trash',
      click: () => handleDeleteCategory(categoryId),
      disabled: !categoriesStore.categories.find(c => c.id === categoryId)?.deletable,
    },
  ],
]

onMounted(async () => {
  // Load categories if not already loaded
  if (categoriesStore.categories.length === 0 && !categoriesStore.isLoading) {
    const { fetchCategories } = useCategories()
    try {
      await fetchCategories()
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }
})
</script>

