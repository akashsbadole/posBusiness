import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderApi } from '@/services/api'
import { usePOSStore } from '@/store'

export const useOrders = (restaurantId: string, filters?: any) => {
  const setOrders = usePOSStore((state) => state.setOrders)
  
  return useQuery({
    queryKey: ['orders', restaurantId, filters],
    queryFn: async () => {
      const response = await orderApi.getAll(restaurantId, filters)
      setOrders(response.data)
      return response.data
    },
    enabled: !!restaurantId,
  })
}

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const response = await orderApi.getById(id)
      return response.data
    },
    enabled: !!id,
  })
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  const addOrder = usePOSStore((state) => state.addOrder)
  
  return useMutation({
    mutationFn: orderApi.create,
    onSuccess: (response) => {
      addOrder(response.data)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export const useUpdateOrder = () => {
  const queryClient = useQueryClient()
  const updateOrder = usePOSStore((state) => state.updateOrder)
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      orderApi.update(id, data),
    onSuccess: (response, { id }) => {
      updateOrder(id, response.data)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['orders', id] })
    },
  })
}

export const useDeleteOrder = () => {
  const queryClient = useQueryClient()
  const deleteOrder = usePOSStore((state) => state.deleteOrder)
  
  return useMutation({
    mutationFn: orderApi.delete,
    onSuccess: (_, id) => {
      deleteOrder(id)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}