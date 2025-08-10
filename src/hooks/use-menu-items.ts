import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { menuItemApi } from '@/services/api'
import { usePOSStore } from '@/store'

export const useMenuItems = (restaurantId: string, categoryId?: string) => {
  const setMenuItems = usePOSStore((state) => state.setMenuItems)
  
  return useQuery({
    queryKey: ['menu-items', restaurantId, categoryId],
    queryFn: async () => {
      const response = await menuItemApi.getAll(restaurantId, categoryId)
      setMenuItems(response.data)
      return response.data
    },
    enabled: !!restaurantId,
  })
}

export const useCreateMenuItem = () => {
  const queryClient = useQueryClient()
  const addMenuItem = usePOSStore((state) => state.addMenuItem)
  
  return useMutation({
    mutationFn: menuItemApi.create,
    onSuccess: (response) => {
      addMenuItem(response.data)
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
    },
  })
}

export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient()
  const updateMenuItem = usePOSStore((state) => state.updateMenuItem)
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      menuItemApi.update(id, data),
    onSuccess: (response, { id }) => {
      updateMenuItem(id, response.data)
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
    },
  })
}

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient()
  const deleteMenuItem = usePOSStore((state) => state.deleteMenuItem)
  
  return useMutation({
    mutationFn: menuItemApi.delete,
    onSuccess: (_, id) => {
      deleteMenuItem(id)
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
    },
  })
}