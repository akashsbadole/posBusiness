import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Order, Customer, MenuItem, Category } from '@/types';

interface OfflineQueueItem {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  data: any;
  timestamp: Date;
  retryCount: number;
}

class OfflineService {
  private isOnline: boolean = true;
  private syncQueue: OfflineQueueItem[] = [];
  private isSyncing: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Load offline queue
    await this.loadQueue();
    
    // Setup network listener
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected === true;
      if (this.isOnline) {
        this.processQueue();
      }
    });

    // Initial network check
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected === true;
  }

  private async loadQueue() {
    try {
      const queueData = await AsyncStorage.getItem('offline_queue');
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
    }
  }

  private async saveQueue() {
    try {
      await AsyncStorage.setItem('offline_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  private async processQueue() {
    if (this.isSyncing || !this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;
    console.log('Processing offline queue...');

    while (this.syncQueue.length > 0 && this.isOnline) {
      const item = this.syncQueue[0];
      
      try {
        await this.processQueueItem(item);
        this.syncQueue.shift();
        await this.saveQueue();
      } catch (error) {
        console.error('Error processing queue item:', error);
        item.retryCount++;
        
        if (item.retryCount >= 3) {
          // Max retries reached, remove from queue
          this.syncQueue.shift();
          await this.saveQueue();
          console.error('Max retries reached for queue item:', item);
        } else {
          // Break and retry later
          break;
        }
      }
    }

    this.isSyncing = false;
    
    if (this.syncQueue.length === 0) {
      console.log('Offline queue processed successfully');
    }
  }

  private async processQueueItem(item: OfflineQueueItem) {
    // This would integrate with your API service
    // For now, we'll simulate the processing
    console.log('Processing queue item:', item);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, you would:
    // switch (item.type) {
    //   case 'CREATE':
    //     await apiService.post(item.endpoint, item.data);
    //     break;
    //   case 'UPDATE':
    //     await apiService.put(item.endpoint, item.data);
    //     break;
    //   case 'DELETE':
    //     await apiService.delete(item.endpoint);
    //     break;
    // }
  }

  // Offline data storage methods
  async storeOfflineData(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(`offline_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error storing offline data:', error);
    }
  }

  async getOfflineData<T = any>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(`offline_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting offline data:', error);
      return null;
    }
  }

  async removeOfflineData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`offline_${key}`);
    } catch (error) {
      console.error('Error removing offline data:', error);
    }
  }

  // Queue management methods
  async addToQueue(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const queueItem: OfflineQueueItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: new Date(),
      retryCount: 0,
    };

    this.syncQueue.push(queueItem);
    await this.saveQueue();

    if (this.isOnline && !this.isSyncing) {
      this.processQueue();
    }
  }

  async removeFromQueue(id: string): Promise<void> {
    this.syncQueue = this.syncQueue.filter(item => item.id !== id);
    await this.saveQueue();
  }

  getQueueStatus(): { isOnline: boolean; queueLength: number; isSyncing: boolean } {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      isSyncing: this.isSyncing,
    };
  }

  // Offline order management
  async storeOfflineOrder(order: Order): Promise<void> {
    const orders = await this.getOfflineOrders();
    orders.push(order);
    await this.storeOfflineData('orders', orders);
  }

  async getOfflineOrders(): Promise<Order[]> {
    return await this.getOfflineData<Order[]>('orders') || [];
  }

  async removeOfflineOrder(orderId: string): Promise<void> {
    const orders = await this.getOfflineOrders();
    const filteredOrders = orders.filter(order => order.id !== orderId);
    await this.storeOfflineData('orders', filteredOrders);
  }

  async createOfflineOrder(orderData: any): Promise<Order> {
    const offlineOrder: Order = {
      ...orderData,
      id: `offline_${Date.now()}`,
      orderNumber: `OFFLINE_${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Order;

    await this.storeOfflineOrder(offlineOrder);
    
    // Add to sync queue
    await this.addToQueue({
      type: 'CREATE',
      endpoint: '/orders',
      data: orderData,
    });

    return offlineOrder;
  }

  // Offline customer management
  async storeOfflineCustomer(customer: Customer): Promise<void> {
    const customers = await this.getOfflineCustomers();
    customers.push(customer);
    await this.storeOfflineData('customers', customers);
  }

  async getOfflineCustomers(): Promise<Customer[]> {
    return await this.getOfflineData<Customer[]>('customers') || [];
  }

  async createOfflineCustomer(customerData: any): Promise<Customer> {
    const offlineCustomer: Customer = {
      ...customerData,
      id: `offline_${Date.now()}`,
      loyaltyPoints: 0,
    } as Customer;

    await this.storeOfflineCustomer(offlineCustomer);
    
    // Add to sync queue
    await this.addToQueue({
      type: 'CREATE',
      endpoint: '/customers',
      data: customerData,
    });

    return offlineCustomer;
  }

  // Offline menu management
  async storeOfflineMenuItems(items: MenuItem[]): Promise<void> {
    await this.storeOfflineData('menu_items', items);
  }

  async getOfflineMenuItems(): Promise<MenuItem[]> {
    return await this.getOfflineData<MenuItem[]>('menu_items') || [];
  }

  async storeOfflineCategories(categories: Category[]): Promise<void> {
    await this.storeOfflineData('categories', categories);
  }

  async getOfflineCategories(): Promise<Category[]> {
    return await this.getOfflineData<Category[]>('categories') || [];
  }

  // Cache management
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const offlineKeys = keys.filter(key => key.startsWith('offline_'));
      await AsyncStorage.multiRemove(offlineKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async getCacheSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const offlineKeys = keys.filter(key => key.startsWith('offline_'));
      let totalSize = 0;
      
      for (const key of offlineKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalSize += data.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  }

  // Sync status
  getSyncStatus(): {
    isOnline: boolean;
    queueLength: number;
    isSyncing: boolean;
    lastSync: Date | null;
  } {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      isSyncing: this.isSyncing,
      lastSync: this.syncQueue.length > 0 ? this.syncQueue[this.syncQueue.length - 1].timestamp : null,
    };
  }

  // Force sync
  async forceSync(): Promise<void> {
    if (this.isOnline && !this.isSyncing) {
      await this.processQueue();
    }
  }
}

export const offlineService = new OfflineService();