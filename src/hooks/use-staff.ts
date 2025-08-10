import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { staffApi } from '@/services/api'
import { usePOSStore } from '@/store'

export const useStaff = (restaurantId: string) => {
  const setStaff = usePOSStore((state) => state.setCurrentStaff)
  
  return useQuery({
    queryKey: ['staff', restaurantId],
    queryFn: async () => {
      const response = await staffApi.getAll(restaurantId)
      // Set the first staff member as current staff for demo
      if (response.data && response.data.length > 0) {
        setStaff(response.data[0])
      }
      return response.data
    },
    enabled: !!restaurantId,
  })
}

export const useCreateStaff = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: staffApi.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
  })
}

export const useUpdateStaff = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      staffApi.update(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
      queryClient.invalidateQueries({ queryKey: ['staff', id] })
    },
  })
}

export const useDeleteStaff = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: staffApi.delete,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
  })
}