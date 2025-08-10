import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryApi } from '@/services/api'
import { usePOSStore } from '@/store'

export const useCategories = (restaurantId: string) => {
  const setCategories = usePOSStore((state) => state.setCategories)
  
  return useQuery({
    queryKey: ['categories', restaurantId],
    queryFn: async () => {
      const response = await categoryApi.getAll(restaurantId)
      setCategories(response.data)
      return response.data
    },
    enabled: !!restaurantId,
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  const addCategory = usePOSStore((state) => state.addCategory)
  
  return useMutation({
    mutationFn: categoryApi.create,
    onSuccess: (response) => {
      addCategory(response.data)
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()
  const updateCategory = usePOSStore((state) => state.updateCategory)
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      categoryApi.update(id, data),
    onSuccess: (response, { id }) => {
      updateCategory(id, response.data)
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  const deleteCategory = usePOSStore((state) => state.deleteCategory)
  
  return useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: (_, id) => {
      deleteCategory(id)
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}