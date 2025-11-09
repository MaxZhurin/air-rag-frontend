import { useCategoriesStore } from '~/stores/categories'
import { useApi } from './useApi'

export const useCategories = () => {
  const categoriesStore = useCategoriesStore()
  const { api } = useApi()

  const fetchCategories = async () => {
    try {
      categoriesStore.setLoading(true)
      categoriesStore.setError(null)
      
      const { data } = await api.get('/categories')
      categoriesStore.setCategories(data)
      
      return data
    } catch (error: any) {
      console.error('Error fetching categories:', error)
      const errorMessage = error.response?.data?.message || 'Failed to load categories'
      categoriesStore.setError(errorMessage)
      throw error
    } finally {
      categoriesStore.setLoading(false)
    }
  }

  const getCategory = async (categoryId: string) => {
    try {
      const { data } = await api.get(`/categories/${categoryId}`)
      return data
    } catch (error: any) {
      console.error('Error fetching category:', error)
      throw error
    }
  }

  const createCategory = async (name: string, description?: string) => {
    try {
      categoriesStore.setError(null)
      
      const { data } = await api.post('/categories', {
        name,
        description,
      })
      
      categoriesStore.addCategory(data)
      
      return data
    } catch (error: any) {
      console.error('Error creating category:', error)
      const errorMessage = error.response?.data?.message || 'Failed to create category'
      categoriesStore.setError(errorMessage)
      throw error
    }
  }

  const updateCategory = async (categoryId: string, updates: { name?: string; description?: string }) => {
    try {
      categoriesStore.setError(null)
      
      const { data } = await api.put(`/categories/${categoryId}`, updates)
      
      categoriesStore.updateCategory(categoryId, data)
      
      return data
    } catch (error: any) {
      console.error('Error updating category:', error)
      const errorMessage = error.response?.data?.message || 'Failed to update category'
      categoriesStore.setError(errorMessage)
      throw error
    }
  }

  const deleteCategory = async (categoryId: string) => {
    try {
      categoriesStore.setError(null)
      
      await api.delete(`/categories/${categoryId}`)
      
      categoriesStore.removeCategory(categoryId)
    } catch (error: any) {
      console.error('Error deleting category:', error)
      const errorMessage = error.response?.data?.message || 'Failed to delete category'
      categoriesStore.setError(errorMessage)
      throw error
    }
  }

  return {
    fetchCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}


