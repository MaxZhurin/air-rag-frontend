import { defineStore } from 'pinia'

export interface Category {
  id: string
  name: string
  description?: string
  deletable: boolean
  documentCount: number
  createdAt: string
  updatedAt: string
}

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [] as Category[],
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    getCategoryById: (state) => (id: string | null) => {
      if (!id) return null
      return state.categories.find(c => c.id === id) || null
    },
  },

  actions: {
    setCategories(categories: Category[]) {
      this.categories = categories
    },

    addCategory(category: Category) {
      this.categories.push(category)
    },

    updateCategory(categoryId: string, updates: Partial<Category>) {
      const category = this.categories.find(c => c.id === categoryId)
      if (category) {
        Object.assign(category, updates)
      }
    },

    removeCategory(categoryId: string) {
      this.categories = this.categories.filter(c => c.id !== categoryId)
    },

    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setError(error: string | null) {
      this.error = error
    },
  },
})


