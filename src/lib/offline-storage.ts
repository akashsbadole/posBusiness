// Offline storage service using IndexedDB

export interface OfflineOrder {
  id?: string
  orderNumber: string
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'
  customerId?: string
  tableId?: string
  staffId: string
  restaurantId: string
  outletId?: string
  subtotal: number
  gstAmount: number
  totalAmount: number
  discount: number
  notes?: string
  orderItems: OfflineOrderItem[]
  customer?: OfflineCustomer
  table?: OfflineTable
  staff: OfflineStaff
  createdAt: string
  updatedAt: string
  synced: boolean
  syncAttempted: boolean
}

export interface OfflineOrderItem {
  id?: string
  orderId: string
  menuItemId: string
  quantity: number
  price: number
  notes?: string
  menuItem?: OfflineMenuItem
}

export interface OfflineCustomer {
  id?: string
  name: string
  email?: string
  phone: string
  address?: string
  loyaltyPoints: number
  restaurantId: string
  synced: boolean
}

export interface OfflineMenuItem {
  id: string
  name: string
  description?: string
  price: number
  categoryId: string
  restaurantId: string
  isActive: boolean
  isAvailable: boolean
  imageUrl?: string
}

export interface OfflineTable {
  id: string
  number: number
  capacity: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE'
  restaurantId: string
  outletId?: string
}

export interface OfflineStaff {
  id: string
  name: string
  email: string
  phone: string
  role: string
  isActive: boolean
  restaurantId: string
  outletId?: string
}

class OfflineStorage {
  private dbName = 'OfflinePOSDB'
  private version = 1

  async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create object stores
        if (!db.objectStoreNames.contains('orders')) {
          const ordersStore = db.createObjectStore('orders', { keyPath: 'id' })
          ordersStore.createIndex('restaurantId', 'restaurantId', { unique: false })
          ordersStore.createIndex('synced', 'synced', { unique: false })
          ordersStore.createIndex('createdAt', 'createdAt', { unique: false })
        }
        
        if (!db.objectStoreNames.contains('customers')) {
          const customersStore = db.createObjectStore('customers', { keyPath: 'id' })
          customersStore.createIndex('restaurantId', 'restaurantId', { unique: false })
          customersStore.createIndex('phone', 'phone', { unique: false })
          customersStore.createIndex('synced', 'synced', { unique: false })
        }
        
        if (!db.objectStoreNames.contains('menuItems')) {
          const menuItemsStore = db.createObjectStore('menuItems', { keyPath: 'id' })
          menuItemsStore.createIndex('restaurantId', 'restaurantId', { unique: false })
          menuItemsStore.createIndex('categoryId', 'categoryId', { unique: false })
        }
        
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncQueueStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true })
          syncQueueStore.createIndex('type', 'type', { unique: false })
          syncQueueStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  async getDB(): Promise<IDBDatabase> {
    return this.initDB()
  }

  // Order operations
  async saveOrder(order: Omit<OfflineOrder, 'synced' | 'syncAttempted'>): Promise<string> {
    const db = await this.getDB()
    const orderToSave: OfflineOrder = {
      ...order,
      synced: false,
      syncAttempted: false
    }
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['orders'], 'readwrite')
      const store = transaction.objectStore('orders')
      const request = store.add(orderToSave)
      
      request.onsuccess = () => resolve(request.result as string)
      request.onerror = () => reject(request.error)
    })
  }

  async getOrders(restaurantId: string): Promise<OfflineOrder[]> {
    const db = await this.getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['orders'], 'readonly')
      const store = transaction.objectStore('orders')
      const index = store.index('restaurantId')
      const request = index.getAll(restaurantId)
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getUnsyncedOrders(restaurantId: string): Promise<OfflineOrder[]> {
    const db = await this.getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['orders'], 'readonly')
      const store = transaction.objectStore('orders')
      
      // Get all orders for the restaurant
      const restaurantIndex = store.index('restaurantId')
      const restaurantRequest = restaurantIndex.getAll(restaurantId)
      
      restaurantRequest.onsuccess = () => {
        const orders = restaurantRequest.result
        const unsyncedOrders = orders.filter(order => !order.synced)
        resolve(unsyncedOrders)
      }
      
      restaurantRequest.onerror = () => reject(restaurantRequest.error)
    })
  }

  async updateOrderSyncStatus(orderId: string, synced: boolean): Promise<void> {
    const db = await this.getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['orders'], 'readwrite')
      const store = transaction.objectStore('orders')
      const request = store.get(orderId)
      
      request.onsuccess = () => {
        const order = request.result
        if (order) {
          order.synced = synced
          order.syncAttempted = true
          const updateRequest = store.put(order)
          updateRequest.onsuccess = () => resolve()
          updateRequest.onerror = () => reject(updateRequest.error)
        } else {
          reject(new Error('Order not found'))
        }
      }
      
      request.onerror = () => reject(request.error)
    })
  }

  async deleteOrder(orderId: string): Promise<void> {
    const db = await this.getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['orders'], 'readwrite')
      const store = transaction.objectStore('orders')
      const request = store.delete(orderId)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Customer operations
  async saveCustomer(customer: Omit<OfflineCustomer, 'synced'>): Promise<string> {
    const db = await this.getDB()
    const customerToSave: OfflineCustomer = {
      ...customer,
      synced: false
    }
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['customers'], 'readwrite')
      const store = transaction.objectStore('customers')
      const request = store.add(customerToSave)
      
      request.onsuccess = () => resolve(request.result as string)
      request.onerror = () => reject(request.error)
    })
  }

  async getCustomers(restaurantId: string): Promise<OfflineCustomer[]> {
    const db = await this.getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['customers'], 'readonly')
      const store = transaction.objectStore('customers')
      const index = store.index('restaurantId')
      const request = index.getAll(restaurantId)
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getUnsyncedCustomers(restaurantId: string): Promise<OfflineCustomer[]> {
    const db = await this.getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['customers'], 'readonly')
      const store = transaction.objectStore('customers')
      
      const restaurantIndex = store.index('restaurantId')
      const restaurantRequest = restaurantIndex.getAll(restaurantId)
      
      restaurantRequest.onsuccess = () => {
        const customers = restaurantRequest.result
        const unsyncedCustomers = customers.filter(customer => !customer.synced)
        resolve(unsyncedCustomers)
      }
      
      restaurantRequest.onerror = () => reject(restaurantRequest.error)
    })
  }

  async updateCustomerSyncStatus(customerId: string, synced: boolean): Promise<void> {
    const db = await this.getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['customers'], 'readwrite')
      const store = transaction.objectStore('customers')
      const request = store.get(customerId)
      
      request.onsuccess = () => {
        const customer = request.result
        if (customer) {
          customer.synced = synced
          const updateRequest = store.put(customer)
          updateRequest.onsuccess = () => resolve()
          updateRequest.onerror = () => reject(updateRequest.error)
        } else {
          reject(new Error('Customer not found'))
        }
      }
      
      request.onerror = () => reject(request.error)
    })
  }

  // Menu items operations (for caching)
  async cacheMenuItems(menuItems: OfflineMenuItem[]): Promise<void> {
    const db = await this.getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['menuItems'], 'readwrite')
      const store = transaction.objectStore('menuItems')
      
      // Clear existing items for the restaurant
      const restaurantId = menuItems[0]?.restaurantId
      if (restaurantId) {
        const clearRequest = store.index('restaurantId').openCursor(IDBKeyRange.only(restaurantId))
        
        clearRequest.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result
          if (cursor) {
            cursor.delete()
            cursor.continue()
          } else {
            // Add new items
            let itemsAdded = 0
            menuItems.forEach(item => {
              const addRequest = store.add(item)
              addRequest.onsuccess = () => {
                itemsAdded++
                if (itemsAdded === menuItems.length) {
                  resolve()
                }
              }
              addRequest.onerror = () => reject(addRequest.error)
            })
          }
        }
        
        clearRequest.onerror = () => reject(clearRequest.error)
      } else {
        resolve()
      }
    })
  }

  async getCachedMenuItems(restaurantId: string): Promise<OfflineMenuItem[]> {
    const db = await this.getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['menuItems'], 'readonly')
      const store = transaction.objectStore('menuItems')
      const index = store.index('restaurantId')
      const request = index.getAll(restaurantId)
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Sync queue operations
  async addToSyncQueue(type: string, data: any): Promise<number> {
    const db = await this.getDB()
    const syncItem = {
      type,
      data,
      timestamp: Date.now()
    }
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      const request = store.add(syncItem)
      
      request.onsuccess = () => resolve(request.result as number)
      request.onerror = () => reject(request.error)
    })
  }

  async getSyncQueueItems(): Promise<Array<{ id: number; type: string; data: any; timestamp: number }>> {
    const db = await this.getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['syncQueue'], 'readonly')
      const store = transaction.objectStore('syncQueue')
      const request = store.getAll()
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async removeFromSyncQueue(id: number): Promise<void> {
    const db = await this.getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      const request = store.delete(id)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    const db = await this.getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['orders', 'customers', 'menuItems', 'syncQueue'], 'readwrite')
      
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      
      ['orders', 'customers', 'menuItems', 'syncQueue'].forEach(storeName => {
        const store = transaction.objectStore(storeName)
        store.clear()
      })
    })
  }
}

export const offlineStorage = new OfflineStorage()