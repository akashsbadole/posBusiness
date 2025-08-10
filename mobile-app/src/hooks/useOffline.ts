import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { offlineService } from '@/services/offlineService';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [queueStatus, setQueueStatus] = useState({
    isOnline: true,
    queueLength: 0,
    isSyncing: false,
  });

  useEffect(() => {
    // Initialize offline service
    const initializeOffline = async () => {
      const status = offlineService.getSyncStatus();
      setQueueStatus(status);
    };

    initializeOffline();

    // Setup network listener
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected === true;
      setIsOnline(online);
      
      // Update queue status
      const status = offlineService.getSyncStatus();
      setQueueStatus(status);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const addToQueue = async (item: any) => {
    try {
      await offlineService.addToQueue(item);
      const status = offlineService.getSyncStatus();
      setQueueStatus(status);
    } catch (error) {
      console.error('Error adding to queue:', error);
    }
  };

  const forceSync = async () => {
    try {
      await offlineService.forceSync();
      const status = offlineService.getSyncStatus();
      setQueueStatus(status);
    } catch (error) {
      console.error('Error forcing sync:', error);
    }
  };

  const getOfflineOrders = async () => {
    try {
      return await offlineService.getOfflineOrders();
    } catch (error) {
      console.error('Error getting offline orders:', error);
      return [];
    }
  };

  const getOfflineCustomers = async () => {
    try {
      return await offlineService.getOfflineCustomers();
    } catch (error) {
      console.error('Error getting offline customers:', error);
      return [];
    }
  };

  const getOfflineMenuItems = async () => {
    try {
      return await offlineService.getOfflineMenuItems();
    } catch (error) {
      console.error('Error getting offline menu items:', error);
      return [];
    }
  };

  const clearCache = async () => {
    try {
      await offlineService.clearCache();
      const status = offlineService.getSyncStatus();
      setQueueStatus(status);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  return {
    isOnline,
    queueStatus,
    addToQueue,
    forceSync,
    getOfflineOrders,
    getOfflineCustomers,
    getOfflineMenuItems,
    clearCache,
  };
};