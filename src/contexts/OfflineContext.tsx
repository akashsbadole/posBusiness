'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface OfflineContextType {
  isOnline: boolean
  isOffline: boolean
  connectionType: string | null
  offlineRequests: number
  lastSyncTime: Date | null
  syncOfflineRequests: () => Promise<void>
  clearOfflineRequests: () => Promise<void>
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined)

interface OfflineProviderProps {
  children: ReactNode
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [isOffline, setIsOffline] = useState(false)
  const [connectionType, setConnectionType] = useState<string | null>(null)
  const [offlineRequests, setOfflineRequests] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  // Monitor connection status
  useEffect(() => {
    const updateConnectionStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)
      setIsOffline(!online)
      
      // Get connection type if available
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        setConnectionType(connection?.effectiveType || null)
      }
    }

    // Initial status
    updateConnectionStatus()

    // Listen for online/offline events
    window.addEventListener('online', updateConnectionStatus)
    window.addEventListener('offline', updateConnectionStatus)

    // Listen for connection type changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection.addEventListener('change', updateConnectionStatus)
    }

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_SUCCESS') {
          setOfflineRequests(prev => Math.max(0, prev - 1))
          setLastSyncTime(new Date())
        }
      })
    }

    // Count offline requests
    const countOfflineRequests = async () => {
      try {
        // Use the same database name as offline-storage.ts
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open('OfflinePOSDB', 1)
          request.onerror = () => reject(request.error)
          request.onsuccess = () => resolve(request.result)
        })
        
        // Count unsynced orders and customers
        const [ordersCount, customersCount] = await Promise.all([
          new Promise<number>((resolve, reject) => {
            const transaction = db.transaction(['orders'], 'readonly')
            const store = transaction.objectStore('orders')
            const index = store.index('synced')
            const request = index.getAll(false)
            request.onsuccess = () => resolve(request.result.length)
            request.onerror = () => reject(request.error)
          }),
          new Promise<number>((resolve, reject) => {
            const transaction = db.transaction(['customers'], 'readonly')
            const store = transaction.objectStore('customers')
            const index = store.index('synced')
            const request = index.getAll(false)
            request.onsuccess = () => resolve(request.result.length)
            request.onerror = () => reject(request.error)
          })
        ])
        
        setOfflineRequests(ordersCount + customersCount)
      } catch (error) {
        console.error('Error counting offline requests:', error)
        setOfflineRequests(0)
      }
    }

    // Count requests periodically
    const interval = setInterval(countOfflineRequests, 5000)
    countOfflineRequests()

    return () => {
      window.removeEventListener('online', updateConnectionStatus)
      window.removeEventListener('offline', updateConnectionStatus)
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        connection.removeEventListener('change', updateConnectionStatus)
      }
      
      clearInterval(interval)
    }
  }, [])

  // Sync offline requests when coming online
  useEffect(() => {
    if (isOnline && offlineRequests > 0) {
      const timer = setTimeout(() => {
        syncOfflineRequests()
      }, 2000) // Wait 2 seconds after coming online
      
      return () => clearTimeout(timer)
    }
  }, [isOnline, offlineRequests])

  const syncOfflineRequests = async () => {
    if (!('serviceWorker' in navigator)) {
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register('sync-offline-requests')
      
      // Show notification to user
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Restaurant POS', {
          body: `Syncing ${offlineRequests} offline requests...`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge.png'
        })
      }
    } catch (error) {
      console.error('Error registering sync:', error)
    }
  }

  const clearOfflineRequests = async () => {
    try {
      // Use the same database name as offline-storage.ts
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('OfflinePOSDB', 1)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)
      })
      
      // Clear orders and customers
      await Promise.all([
        new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(['orders'], 'readwrite')
          const store = transaction.objectStore('orders')
          const request = store.clear()
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        }),
        new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(['customers'], 'readwrite')
          const store = transaction.objectStore('customers')
          const request = store.clear()
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })
      ])
      
      setOfflineRequests(0)
    } catch (error) {
      console.error('Error clearing offline requests:', error)
    }
  }

  const value: OfflineContextType = {
    isOnline,
    isOffline,
    connectionType,
    offlineRequests,
    lastSyncTime,
    syncOfflineRequests,
    clearOfflineRequests
  }

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  )
}

export function useOffline() {
  const context = useContext(OfflineContext)
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider')
  }
  return context
}