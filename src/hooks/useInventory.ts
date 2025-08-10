'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface InventoryItem {
  id: string
  name: string
  description?: string
  quantity: number
  unit: string
  minStock: number
  maxStock: number
  cost: number
  restaurantId: string
  outletId?: string
  locationId?: string
  menuItemId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  inventoryAlerts?: any[]
}

interface CreateInventoryItemData {
  name: string
  description?: string
  quantity: number
  unit: string
  minStock: number
  maxStock: number
  cost: number
  restaurantId: string
  outletId?: string
  locationId?: string
  menuItemId?: string
}

interface UpdateInventoryItemData {
  name?: string
  description?: string
  quantity?: number
  unit?: string
  minStock?: number
  maxStock?: number
  cost?: number
  isActive?: boolean
}

export function useInventory(restaurantId?: string) {
  const queryClient = useQueryClient()

  // Fetch inventory items
  const { data: inventoryItems = [], isLoading, error } = useQuery({
    queryKey: ['inventory', restaurantId],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (restaurantId) params.append('restaurantId', restaurantId)
      
      const response = await fetch(`/api/inventory?${params}`)
      if (!response.ok) throw new Error('Failed to fetch inventory items')
      return response.json() as Promise<InventoryItem[]>
    },
    enabled: !!restaurantId
  })

  // Create inventory item
  const createItem = useMutation({
    mutationFn: async (data: CreateInventoryItemData) => {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to create inventory item')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Inventory item created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create inventory item')
      console.error('Error creating inventory item:', error)
    }
  })

  // Update inventory item
  const updateItem = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateInventoryItemData }) => {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to update inventory item')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Inventory item updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update inventory item')
      console.error('Error updating inventory item:', error)
    }
  })

  // Delete inventory item
  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete inventory item')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Inventory item deleted successfully')
    },
    onError: (error) => {
      toast.error('Failed to delete inventory item')
      console.error('Error deleting inventory item:', error)
    }
  })

  // Get low stock items
  const lowStockItems = inventoryItems.filter(item => item.quantity <= item.minStock)

  // Get overstock items
  const overstockItems = inventoryItems.filter(item => item.quantity >= item.maxStock)

  // Get total inventory value
  const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.cost), 0)

  return {
    inventoryItems,
    isLoading,
    error,
    createItem,
    updateItem,
    deleteItem,
    lowStockItems,
    overstockItems,
    totalValue
  }
}

export function useInventoryAlerts(restaurantId?: string) {
  // Fetch inventory alerts
  const { data: alerts = [], isLoading, error } = useQuery({
    queryKey: ['inventory-alerts', restaurantId],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (restaurantId) params.append('restaurantId', restaurantId)
      
      const response = await fetch(`/api/inventory/alerts?${params}`)
      if (!response.ok) throw new Error('Failed to fetch inventory alerts')
      return response.json()
    },
    enabled: !!restaurantId
  })

  return {
    alerts,
    isLoading,
    error
  }
}