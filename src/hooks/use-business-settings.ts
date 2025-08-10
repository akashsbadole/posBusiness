import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { businessSettingsApi } from '@/services/api'

export const useBusinessSettings = (restaurantId: string) => {
  return useQuery({
    queryKey: ['business-settings', restaurantId],
    queryFn: async () => {
      const response = await businessSettingsApi.getByRestaurant(restaurantId)
      return response.data
    },
    enabled: !!restaurantId,
  })
}

export const useUpdateBusinessSettings = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: businessSettingsApi.update,
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['business-settings', variables.restaurantId] 
      })
    },
  })
}