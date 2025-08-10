import { useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { offlineStorage } from '@/lib/offline-storage'
import { syncService } from '@/lib/sync-service'
import { useOffline } from '@/contexts/OfflineContext'
import { toast } from 'sonner'

interface OfflineOrderHookProps {
  restaurantId: string
}

export function useOfflineOrders({ restaurantId }: OfflineOrderHookProps) {
  const { isOnline } = useOffline()
  const queryClient = useQueryClient()
  const [isCreatingOffline, setIsCreatingOffline] = useState(false)

  // Get offline orders
  const { data: offlineOrders, isLoading: isLoadingOffline } = useQuery({
    queryKey: ['offlineOrders', restaurantId],
    queryFn: async () => {
      return offlineStorage.getOrders(restaurantId)
    },
    enabled: !!restaurantId,
  })

  // Get offline stats
  const { data: offlineStats, refetch: refetchStats } = useQuery({
    queryKey: ['offlineStats', restaurantId],
    queryFn: async () => {
      return syncService.getOfflineStats(restaurantId)
    },
    enabled: !!restaurantId,
  })

  // Create order (works both online and offline)
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      if (!isOnline) {
        // Create offline order
        setIsCreatingOffline(true)
        try {
          const offlineOrder = {
            ...orderData,
            id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          
          const orderId = await offlineStorage.saveOrder(offlineOrder)
          
          // Show success message for offline creation
          toast.success('Order created offline - will sync when online', {
            description: `Order #${offlineOrder.orderNumber}`,
            duration: 4000,
          })
          
          return { ...offlineOrder, id: orderId, offline: true }
        } catch (error) {
          console.error('Error creating offline order:', error)
          throw new Error('Failed to create offline order')
        } finally {
          setIsCreatingOffline(false)
        }
      } else {
        // Create online order
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        })

        if (!response.ok) {
          throw new Error('Failed to create order')
        }

        return response.json()
      }
    },
    onSuccess: (data) => {
      if (!data.offline) {
        // Only invalidate queries for online orders
        queryClient.invalidateQueries({ queryKey: ['orders'] })
      }
      
      // Refetch offline stats
      refetchStats()
      
      toast.success('Order created successfully')
    },
    onError: (error: any) => {
      console.error('Error creating order:', error)
      toast.error(error.message || 'Failed to create order')
    },
  })

  // Sync offline orders
  const syncOrdersMutation = useMutation({
    mutationFn: async () => {
      return syncService.syncOrders(restaurantId)
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Synced ${result.syncedItems} orders successfully`)
        if (result.failedItems > 0) {
          toast.error(`${result.failedItems} orders failed to sync`)
        }
      } else {
        toast.error('Failed to sync orders')
      }
      
      // Refetch data
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['offlineOrders'] })
      refetchStats()
    },
    onError: (error: any) => {
      console.error('Error syncing orders:', error)
      toast.error('Failed to sync orders')
    },
  })

  // Create customer (works both online and offline)
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      if (!isOnline) {
        // Create offline customer
        try {
          const offlineCustomer = {
            ...customerData,
            id: `offline-customer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            loyaltyPoints: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          
          const customerId = await offlineStorage.saveCustomer(offlineCustomer)
          
          toast.success('Customer created offline - will sync when online', {
            description: `Customer: ${offlineCustomer.name}`,
            duration: 4000,
          })
          
          return { ...offlineCustomer, id: customerId, offline: true }
        } catch (error) {
          console.error('Error creating offline customer:', error)
          throw new Error('Failed to create offline customer')
        }
      } else {
        // Create online customer
        const response = await fetch('/api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerData),
        })

        if (!response.ok) {
          throw new Error('Failed to create customer')
        }

        return response.json()
      }
    },
    onSuccess: (data) => {
      if (!data.offline) {
        queryClient.invalidateQueries({ queryKey: ['customers'] })
      }
      
      refetchStats()
      toast.success('Customer created successfully')
    },
    onError: (error: any) => {
      console.error('Error creating customer:', error)
      toast.error(error.message || 'Failed to create customer')
    },
  })

  // Cache data for offline use
  const cacheDataMutation = useMutation({
    mutationFn: async () => {
      return syncService.cacheDataForOffline(restaurantId)
    },
    onSuccess: () => {
      toast.success('Data cached for offline use')
      refetchStats()
    },
    onError: (error: any) => {
      console.error('Error caching data:', error)
      toast.error('Failed to cache data for offline use')
    },
  })

  // Clear offline data
  const clearOfflineDataMutation = useMutation({
    mutationFn: async () => {
      return syncService.clearOfflineData(restaurantId)
    },
    onSuccess: () => {
      toast.success('Offline data cleared')
      queryClient.invalidateQueries({ queryKey: ['offlineOrders'] })
      refetchStats()
    },
    onError: (error: any) => {
      console.error('Error clearing offline data:', error)
      toast.error('Failed to clear offline data')
    },
  })

  const createOrder = useCallback(
    (orderData: any) => {
      return createOrderMutation.mutateAsync(orderData)
    },
    [createOrderMutation]
  )

  const createCustomer = useCallback(
    (customerData: any) => {
      return createCustomerMutation.mutateAsync(customerData)
    },
    [createCustomerMutation]
  )

  const syncOrders = useCallback(() => {
    return syncOrdersMutation.mutateAsync()
  }, [syncOrdersMutation])

  const cacheData = useCallback(() => {
    return cacheDataMutation.mutateAsync()
  }, [cacheDataMutation])

  const clearOfflineData = useCallback(() => {
    return clearOfflineDataMutation.mutateAsync()
  }, [clearOfflineDataMutation])

  return {
    // Data
    offlineOrders: offlineOrders || [],
    offlineStats: offlineStats || {
      orders: { total: 0, unsynced: 0 },
      customers: { total: 0, unsynced: 0 },
      menuItems: { total: 0 }
    },
    
    // Loading states
    isLoadingOffline,
    isCreatingOffline,
    isSyncingOrders: syncOrdersMutation.isPending,
    isCachingData: cacheDataMutation.isPending,
    isClearingData: clearOfflineDataMutation.isPending,
    
    // Actions
    createOrder,
    createCustomer,
    syncOrders,
    cacheData,
    clearOfflineData,
    refetchStats,
  }
}