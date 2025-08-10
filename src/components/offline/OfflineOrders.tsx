'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database, 
  Users, 
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2
} from 'lucide-react'
import { useOffline } from '@/contexts/OfflineContext'
import { offlineStorage } from '@/lib/offline-storage'
import { syncService } from '@/lib/sync-service'
import { toast } from 'sonner'

interface OfflineOrdersProps {
  restaurantId: string
}

export default function OfflineOrders({ restaurantId }: OfflineOrdersProps) {
  const { isOnline, isOffline, offlineRequests, syncOfflineRequests, lastSyncTime } = useOffline()
  const [offlineStats, setOfflineStats] = useState({
    orders: { total: 0, unsynced: 0 },
    customers: { total: 0, unsynced: 0 },
    menuItems: { total: 0 }
  })
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)

  useEffect(() => {
    loadOfflineStats()
  }, [restaurantId])

  const loadOfflineStats = async () => {
    try {
      const stats = await syncService.getOfflineStats(restaurantId)
      setOfflineStats(stats)
    } catch (error) {
      console.error('Error loading offline stats:', error)
    }
  }

  const handleSync = async () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline')
      return
    }

    setIsSyncing(true)
    try {
      const result = await syncService.syncAll(restaurantId)
      setSyncResult(result)
      
      if (result.success) {
        toast.success(`Synced ${result.syncedItems} items successfully`)
        if (result.failedItems > 0) {
          toast.error(`${result.failedItems} items failed to sync`)
        }
      } else {
        toast.error('Sync failed')
      }
      
      await loadOfflineStats()
    } catch (error) {
      console.error('Error syncing:', error)
      toast.error('Failed to sync data')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleCacheData = async () => {
    try {
      await syncService.cacheDataForOffline(restaurantId)
      toast.success('Data cached for offline use')
      await loadOfflineStats()
    } catch (error) {
      console.error('Error caching data:', error)
      toast.error('Failed to cache data')
    }
  }

  const handleClearOfflineData = async () => {
    if (!confirm('Are you sure you want to clear all offline data? This cannot be undone.')) {
      return
    }

    try {
      await syncService.clearOfflineData(restaurantId)
      toast.success('Offline data cleared')
      await loadOfflineStats()
    } catch (error) {
      console.error('Error clearing offline data:', error)
      toast.error('Failed to clear offline data')
    }
  }

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="h-5 w-5 text-green-600" />
                Online Mode
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-orange-600" />
                Offline Mode
              </>
            )}
          </CardTitle>
          <CardDescription>
            {isOnline 
              ? 'All features are available. Data will sync automatically.' 
              : 'You are offline. Changes will be stored locally and synced when online.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {offlineStats.orders.total}
              </div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {offlineStats.orders.unsynced}
              </div>
              <div className="text-sm text-gray-600">Unsynced Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {offlineStats.customers.total}
              </div>
              <div className="text-sm text-gray-600">Total Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {offlineStats.menuItems.total}
              </div>
              <div className="text-sm text-gray-600">Cached Items</div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {lastSyncTime && (
                <span>Last sync: {formatTime(lastSyncTime)}</span>
              )}
            </div>
            <div className="flex gap-2">
              {isOnline && offlineStats.orders.unsynced > 0 && (
                <Button onClick={handleSync} disabled={isSyncing}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : `Sync (${offlineStats.orders.unsynced})`}
                </Button>
              )}
              <Button variant="outline" onClick={handleCacheData}>
                <Database className="mr-2 h-4 w-4" />
                Cache Data
              </Button>
              <Button variant="outline" onClick={handleClearOfflineData}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Results */}
      {syncResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Sync Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {syncResult.syncedItems}
                </div>
                <div className="text-sm text-gray-600">Synced Successfully</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {syncResult.failedItems}
                </div>
                <div className="text-sm text-gray-600">Failed to Sync</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {syncResult.syncedItems + syncResult.failedItems}
                </div>
                <div className="text-sm text-gray-600">Total Processed</div>
              </div>
            </div>
            
            {syncResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-red-600 mb-2">Errors:</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {syncResult.errors.map((error: string, index: number) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Offline Features */}
      <Card>
        <CardHeader>
          <CardTitle>Offline Features</CardTitle>
          <CardDescription>
            Features available when you're offline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>
            </TabsList>
            
            <TabsContent value="orders" className="space-y-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-medium">Offline Orders</span>
                <Badge variant={offlineStats.orders.unsynced > 0 ? "destructive" : "secondary"}>
                  {offlineStats.orders.unsynced} pending sync
                </Badge>
              </div>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Create new orders while offline</li>
                <li>• View order history</li>
                <li>• Modify existing orders</li>
                <li>• Automatic sync when online</li>
              </ul>
            </TabsContent>
            
            <TabsContent value="customers" className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="font-medium">Offline Customers</span>
                <Badge variant={offlineStats.customers.unsynced > 0 ? "destructive" : "secondary"}>
                  {offlineStats.customers.unsynced} pending sync
                </Badge>
              </div>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Add new customers while offline</li>
                <li>• Search customer database</li>
                <li>• View customer history</li>
                <li>• Automatic sync when online</li>
              </ul>
            </TabsContent>
            
            <TabsContent value="menu" className="space-y-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                <span className="font-medium">Cached Menu</span>
                <Badge variant="secondary">
                  {offlineStats.menuItems.total} items
                </Badge>
              </div>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Access menu items offline</li>
                <li>• View prices and descriptions</li>
                <li>• Search menu items</li>
                <li>• Automatic updates when online</li>
              </ul>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Offline Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <WifiOff className="h-4 w-4" />
                When Offline
              </h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Continue taking orders as normal</li>
                <li>• Add new customers to database</li>
                <li>• Access cached menu items</li>
                <li>• All changes saved locally</li>
                <li>• Orange indicator shows offline status</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                When Back Online
              </h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Automatic sync begins</li>
                <li>• Green indicator shows online status</li>
                <li>• Manual sync option available</li>
                <li>• View sync results and errors</li>
                <li>• Data cached for next offline session</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}