import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerApi } from '@/services/api'
import { usePOSStore } from '@/store'

export const useCustomers = (restaurantId: string) => {
  const setCustomers = usePOSStore((state) => state.setCustomers)
  
  return useQuery({
    queryKey: ['customers', restaurantId],
    queryFn: async () => {
      const response = await customerApi.getAll(restaurantId)
      setCustomers(response.data)
      return response.data
    },
    enabled: !!restaurantId,
  })
}

export const useCreateCustomer = () => {
  const queryClient = useQueryClient()
  const addCustomer = usePOSStore((state) => state.addCustomer)
  
  return useMutation({
    mutationFn: customerApi.create,
    onSuccess: (response) => {
      addCustomer(response.data)
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient()
  const updateCustomer = usePOSStore((state) => state.updateCustomer)
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      customerApi.update(id, data),
    onSuccess: (response, { id }) => {
      updateCustomer(id, response.data)
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient()
  const deleteCustomer = usePOSStore((state) => state.deleteCustomer)
  
  return useMutation({
    mutationFn: customerApi.delete,
    onSuccess: (_, id) => {
      deleteCustomer(id)
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}