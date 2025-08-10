import { offlineStorage, OfflineOrder, OfflineCustomer } from './offline-storage'
import { orderApi, customerApi } from '@/services/api'

export interface SyncResult {
  success: boolean
  syncedItems: number
  failedItems: number
  errors: string[]
}

class SyncService {
  async syncOrders(restaurantId: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      syncedItems: 0,
      failedItems: 0,
      errors: []
    }

    try {
      const unsyncedOrders = await offlineStorage.getUnsyncedOrders(restaurantId)
      
      for (const order of unsyncedOrders) {
        try {
          // Prepare order data for API
          const orderData = {
            orderType: order.orderType,
            customerId: order.customerId,
            tableId: order.tableId,
            staffId: order.staffId,
            restaurantId: order.restaurantId,
            outletId: order.outletId,
            orderItems: order.orderItems.map(item => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: item.price,
              notes: item.notes
            })),
            notes: order.notes
          }

          // Try to sync with server
          const response = await orderApi.create(orderData)
          
          if (response.data) {
            // Update local order with server ID and sync status
            await offlineStorage.updateOrderSyncStatus(order.id!, true)
            result.syncedItems++
            
            // If there's a customer in the order and it's not synced, sync it too
            if (order.customer && !order.customer.synced) {
              await this.syncCustomer(order.customer)
            }
          }
        } catch (error) {
          console.error('Failed to sync order:', order.id, error)
          result.failedItems++
          result.errors.push(`Failed to sync order ${order.orderNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          
          // Mark as attempted but failed
          await offlineStorage.updateOrderSyncStatus(order.id!, false)
        }
      }
    } catch (error) {
      console.error('Error syncing orders:', error)
      result.success = false
      result.errors.push(`Error syncing orders: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
  }

  async syncCustomer(customer: OfflineCustomer): Promise<void> {
    try {
      const customerData = {
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone,
        address: customer.address || '',
        restaurantId: customer.restaurantId
      }

      const response = await customerApi.create(customerData)
      
      if (response.data) {
        await offlineStorage.updateCustomerSyncStatus(customer.id!, true)
      }
    } catch (error) {
      console.error('Failed to sync customer:', customer.id, error)
      throw error
    }
  }

  async syncCustomers(restaurantId: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      syncedItems: 0,
      failedItems: 0,
      errors: []
    }

    try {
      const unsyncedCustomers = await offlineStorage.getUnsyncedCustomers(restaurantId)
      
      for (const customer of unsyncedCustomers) {
        try {
          await this.syncCustomer(customer)
          result.syncedItems++
        } catch (error) {
          console.error('Failed to sync customer:', customer.id, error)
          result.failedItems++
          result.errors.push(`Failed to sync customer ${customer.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error('Error syncing customers:', error)
      result.success = false
      result.errors.push(`Error syncing customers: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
  }

  async syncAll(restaurantId: string): Promise<SyncResult> {
    const orderResult = await this.syncOrders(restaurantId)
    const customerResult = await this.syncCustomers(restaurantId)
    
    return {
      success: orderResult.success && customerResult.success,
      syncedItems: orderResult.syncedItems + customerResult.syncedItems,
      failedItems: orderResult.failedItems + customerResult.failedItems,
      errors: [...orderResult.errors, ...customerResult.errors]
    }
  }

  async cacheDataForOffline(restaurantId: string): Promise<void> {
    try {
      // Cache menu items
      const menuItemsResponse = await fetch(`/api/menu-items?restaurantId=${restaurantId}`)
      if (menuItemsResponse.ok) {
        const menuItems = await menuItemsResponse.json()
        await offlineStorage.cacheMenuItems(menuItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          categoryId: item.categoryId,
          restaurantId: item.restaurantId,
          isActive: item.isActive,
          isAvailable: item.isAvailable,
          imageUrl: item.imageUrl
        })))
      }

      // Cache categories
      const categoriesResponse = await fetch(`/api/categories?restaurantId=${restaurantId}`)
      if (categoriesResponse.ok) {
        const categories = await categoriesResponse.json()
        // Cache categories if needed
      }

      // Cache tables
      const tablesResponse = await fetch(`/api/tables?restaurantId=${restaurantId}`)
      if (tablesResponse.ok) {
        const tables = await tablesResponse.json()
        // Cache tables if needed
      }

      console.log('Data cached for offline use')
    } catch (error) {
      console.error('Error caching data for offline:', error)
    }
  }

  async getOfflineStats(restaurantId: string): Promise<{
    orders: { total: number; unsynced: number }
    customers: { total: number; unsynced: number }
    menuItems: { total: number }
  }> {
    try {
      const [orders, customers, menuItems] = await Promise.all([
        offlineStorage.getOrders(restaurantId),
        offlineStorage.getCustomers(restaurantId),
        offlineStorage.getCachedMenuItems(restaurantId)
      ])

      return {
        orders: {
          total: orders.length,
          unsynced: orders.filter(o => !o.synced).length
        },
        customers: {
          total: customers.length,
          unsynced: customers.filter(c => !c.synced).length
        },
        menuItems: {
          total: menuItems.length
        }
      }
    } catch (error) {
      console.error('Error getting offline stats:', error)
      return {
        orders: { total: 0, unsynced: 0 },
        customers: { total: 0, unsynced: 0 },
        menuItems: { total: 0 }
      }
    }
  }

  async clearOfflineData(restaurantId: string): Promise<void> {
    try {
      // Clear only data for the specific restaurant
      const orders = await offlineStorage.getOrders(restaurantId)
      const customers = await offlineStorage.getCustomers(restaurantId)
      
      // Delete orders
      for (const order of orders) {
        await offlineStorage.deleteOrder(order.id!)
      }
      
      // Delete customers (only those not synced)
      for (const customer of customers) {
        if (customer.synced) {
          await offlineStorage.updateCustomerSyncStatus(customer.id!, false)
        }
      }
      
      console.log('Offline data cleared for restaurant:', restaurantId)
    } catch (error) {
      console.error('Error clearing offline data:', error)
      throw error
    }
  }
}

export const syncService = new SyncService()