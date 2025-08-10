'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subscriptionApi } from '@/services/api'

export const useSubscription = (restaurantId: string) => {
  const queryClient = useQueryClient()

  const {
    data: subscription,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['subscription', restaurantId],
    queryFn: () => subscriptionApi.getSubscription(restaurantId),
    enabled: !!restaurantId
  })

  const createSubscription = useMutation({
    mutationFn: (data: { restaurantId: string; plan: string; paymentMethod: string }) =>
      subscriptionApi.createSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', restaurantId] })
    }
  })

  const updateSubscription = useMutation({
    mutationFn: (data: { restaurantId: string; plan?: string; status?: string }) =>
      subscriptionApi.updateSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', restaurantId] })
    }
  })

  const cancelSubscription = useMutation({
    mutationFn: (restaurantId: string) =>
      subscriptionApi.cancelSubscription(restaurantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', restaurantId] })
    }
  })

  return {
    subscription,
    isLoading,
    error,
    refetch,
    createSubscription,
    updateSubscription,
    cancelSubscription
  }
}