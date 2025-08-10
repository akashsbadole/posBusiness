"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Monitor, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ChefHat,
  Utensils,
  Timer,
  Bell,
  Filter,
  RefreshCw,
  Eye,
  MessageSquare
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface KitchenOrder {
  id: string
  orderNumber: string
  tableNumber?: string
  customerName?: string
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  items: KitchenOrderItem[]
  totalItems: number
  completedItems: number
  estimatedTime: number // in minutes
  actualTime?: number
  createdAt: Date
  updatedAt: Date
  notes?: string
  station: string
}

interface KitchenOrderItem {
  id: string
  name: string
  quantity: number
  notes?: string
  modifiers?: string[]
  status: 'pending' | 'preparing' | 'ready' | 'cancelled'
  station: string
  estimatedTime: number
  actualTime?: number
}

interface KitchenStation {
  id: string
  name: string
  color: string
  isActive: boolean
  currentOrders: number
  capacity: number
}

export default function KitchenDisplaySystem() {
  const [orders, setOrders] = useState<KitchenOrder[]>([
    {
      id: '1',
      orderNumber: 'ORD-001',
      tableNumber: 'Table 5',
      customerName: 'John Doe',
      status: 'preparing',
      priority: 'normal',
      items: [
        {
          id: '1',
          name: 'Grilled Salmon',
          quantity: 2,
          notes: 'Medium rare, no sauce',
          status: 'preparing',
          station: 'main_kitchen',
          estimatedTime: 15
        },
        {
          id: '2',
          name: 'Caesar Salad',
          quantity: 1,
          modifiers: ['Extra cheese', 'No croutons'],
          status: 'ready',
          station: 'salad_station',
          estimatedTime: 5
        }
      ],
      totalItems: 3,
      completedItems: 1,
      estimatedTime: 20,
      actualTime: 12,
      createdAt: new Date(Date.now() - 12 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 1000),
      notes: 'Customer allergic to nuts',
      station: 'main_kitchen'
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      tableNumber: 'Table 3',
      customerName: 'Jane Smith',
      status: 'pending',
      priority: 'high',
      items: [
        {
          id: '3',
          name: 'Beef Steak',
          quantity: 1,
          notes: 'Well done',
          status: 'pending',
          station: 'main_kitchen',
          estimatedTime: 20
        },
        {
          id: '4',
          name: 'French Fries',
          quantity: 2,
          status: 'pending',
          station: 'fry_station',
          estimatedTime: 8
        }
      ],
      totalItems: 3,
      completedItems: 0,
      estimatedTime: 25,
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 60 * 1000),
      station: 'main_kitchen'
    },
    {
      id: '3',
      orderNumber: 'ORD-003',
      tableNumber: 'Takeaway',
      customerName: 'Bob Johnson',
      status: 'ready',
      priority: 'normal',
      items: [
        {
          id: '5',
          name: 'Margherita Pizza',
          quantity: 1,
          status: 'ready',
          station: 'pizza_station',
          estimatedTime: 15
        }
      ],
      totalItems: 1,
      completedItems: 1,
      estimatedTime: 15,
      actualTime: 18,
      createdAt: new Date(Date.now() - 18 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 60 * 1000),
      station: 'pizza_station'
    }
  ])

  const [stations, setStations] = useState<KitchenStation[]>([
    {
      id: 'main_kitchen',
      name: 'Main Kitchen',
      color: 'bg-blue-500',
      isActive: true,
      currentOrders: 2,
      capacity: 5
    },
    {
      id: 'salad_station',
      name: 'Salad Station',
      color: 'bg-green-500',
      isActive: true,
      currentOrders: 1,
      capacity: 3
    },
    {
      id: 'pizza_station',
      name: 'Pizza Station',
      color: 'bg-red-500',
      isActive: true,
      currentOrders: 1,
      capacity: 2
    },
    {
      id: 'fry_station',
      name: 'Fry Station',
      color: 'bg-yellow-500',
      isActive: true,
      currentOrders: 1,
      capacity: 2
    },
    {
      id: 'bar',
      name: 'Bar',
      color: 'bg-purple-500',
      isActive: false,
      currentOrders: 0,
      capacity: 3
    }
  ])

  const [selectedStation, setSelectedStation] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [soundAlerts, setSoundAlerts] = useState(true)
  const { toast } = useToast()

  // Auto-refresh orders
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // Simulate order updates
      setOrders(prev => prev.map(order => {
        if (order.status === 'preparing' && Math.random() > 0.7) {
          const updatedItems = order.items.map(item => 
            item.status === 'preparing' && Math.random() > 0.8 
              ? { ...item, status: 'ready' as const, actualTime: Math.floor(Math.random() * 10) + 5 }
              : item
          )
          
          const completedItems = updatedItems.filter(item => item.status === 'ready').length
          const newStatus = completedItems === order.totalItems ? 'ready' : 'preparing'
          
          return {
            ...order,
            items: updatedItems,
            completedItems,
            status: newStatus,
            updatedAt: new Date()
          }
        }
        return order
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  // Sound alerts for new orders
  useEffect(() => {
    if (!soundAlerts) return

    const checkNewOrders = setInterval(() => {
      // In a real app, this would check for new orders from the server
      // For demo, we'll simulate it
    }, 10000)

    return () => clearInterval(checkNewOrders)
  }, [soundAlerts])

  const filteredOrders = orders.filter(order => {
    const stationMatch = selectedStation === 'all' || order.station === selectedStation
    const statusMatch = selectedStatus === 'all' || order.status === selectedStatus
    return stationMatch && statusMatch
  })

  const handleUpdateItemStatus = (orderId: string, itemId: string, status: KitchenOrderItem['status']) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updatedItems = order.items.map(item =>
          item.id === itemId ? { ...item, status, actualTime: status === 'ready' ? Math.floor(Math.random() * 10) + 5 : item.actualTime } : item
        )
        
        const completedItems = updatedItems.filter(item => item.status === 'ready').length
        const newStatus = completedItems === order.totalItems ? 'ready' : 
                         completedItems > 0 ? 'preparing' : order.status
        
        return {
          ...order,
          items: updatedItems,
          completedItems,
          status: newStatus,
          updatedAt: new Date()
        }
      }
      return order
    }))

    toast({
      title: "Item Status Updated",
      description: `Item status has been updated to ${status}.`
    })
  }

  const handleUpdateOrderStatus = (orderId: string, status: KitchenOrder['status']) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status, updatedAt: new Date() } : order
    ))

    toast({
      title: "Order Status Updated",
      description: `Order status has been updated to ${status}.`
    })
  }

  const handlePrioritizeOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const priorities: KitchenOrder['priority'][] = ['low', 'normal', 'high', 'urgent']
        const currentIndex = priorities.indexOf(order.priority)
        const nextPriority = priorities[(currentIndex + 1) % priorities.length]
        
        return { ...order, priority: nextPriority, updatedAt: new Date() }
      }
      return order
    }))

    const order = orders.find(o => o.id === orderId)
    toast({
      title: "Order Priority Updated",
      description: `Order priority has been updated.`
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-500'
      case 'preparing': return 'bg-yellow-500'
      case 'ready': return 'bg-green-500'
      case 'delivered': return 'bg-blue-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'normal': return <Clock className="h-4 w-4 text-blue-500" />
      case 'low': return <Clock className="h-4 w-4 text-gray-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getTimeElapsed = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60)
    return diff < 1 ? 'Just now' : `${diff}m ago`
  }

  const getStationStats = () => {
    return stations.map(station => {
      const stationOrders = orders.filter(order => order.station === station.id)
      const pendingOrders = stationOrders.filter(order => order.status === 'pending').length
      const preparingOrders = stationOrders.filter(order => order.status === 'preparing').length
      const readyOrders = stationOrders.filter(order => order.status === 'ready').length
      
      return {
        ...station,
        pendingOrders,
        preparingOrders,
        readyOrders
      }
    })
  }

  const stationStats = getStationStats()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Kitchen Display System</h2>
          <p className="text-gray-600">Real-time order management for kitchen stations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button
            variant={soundAlerts ? "default" : "outline"}
            size="sm"
            onClick={() => setSoundAlerts(!soundAlerts)}
          >
            <Bell className="mr-2 h-4 w-4" />
            Sound Alerts
          </Button>
        </div>
      </div>

      {/* Station Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stationStats.map((station) => (
          <Card key={station.id} className={`${station.isActive ? 'border-l-4' : 'opacity-50'} ${station.isActive ? `border-l-${station.color.split('-')[1]}-500` : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{station.name}</CardTitle>
                <div className={`w-3 h-3 rounded-full ${station.isActive ? station.color : 'bg-gray-400'}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Capacity</span>
                  <span>{station.currentOrders}/{station.capacity}</span>
                </div>
                <Progress value={(station.currentOrders / station.capacity) * 100} className="h-2" />
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <div className="text-center">
                    <div className="font-medium text-gray-500">{station.pendingOrders}</div>
                    <div className="text-gray-400">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-yellow-600">{station.preparingOrders}</div>
                    <div className="text-gray-400">Preparing</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-green-600">{station.readyOrders}</div>
                    <div className="text-gray-400">Ready</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedStation === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStation('all')}
              >
                All Stations
              </Button>
              {stations.filter(s => s.isActive).map(station => (
                <Button
                  key={station.id}
                  variant={selectedStation === station.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStation(station.id)}
                >
                  {station.name}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('all')}
              >
                All Status
              </Button>
              <Button
                variant={selectedStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('pending')}
              >
                Pending
              </Button>
              <Button
                variant={selectedStatus === 'preparing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('preparing')}
              >
                Preparing
              </Button>
              <Button
                variant={selectedStatus === 'ready' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('ready')}
              >
                Ready
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className={`border-l-4 ${order.priority === 'urgent' ? 'border-l-red-500' : order.priority === 'high' ? 'border-l-orange-500' : 'border-l-blue-500'}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <Badge className={getPriorityColor(order.priority)}>
                      {order.priority}
                    </Badge>
                    {getPriorityIcon(order.priority)}
                  </div>
                  <CardDescription>
                    {order.tableNumber} • {order.customerName} • {getTimeElapsed(order.createdAt)}
                  </CardDescription>
                  {order.notes && (
                    <div className="flex items-center gap-2 text-sm">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-yellow-600">{order.notes}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Progress</div>
                    <div className="text-lg font-semibold">{order.completedItems}/{order.totalItems}</div>
                  </div>
                  <Progress value={(order.completedItems / order.totalItems) * 100} className="w-24" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrioritizeOrder(order.id)}
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <ChefHat className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          Qty: {item.quantity} • Est: {item.estimatedTime}m
                          {item.actualTime && ` • Actual: ${item.actualTime}m`}
                        </div>
                        {item.notes && (
                          <div className="text-sm text-yellow-600">Note: {item.notes}</div>
                        )}
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="text-sm text-blue-600">
                            Mods: {item.modifiers.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateItemStatus(order.id, item.id, 'preparing')}
                        >
                          Start
                        </Button>
                      )}
                      {item.status === 'preparing' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateItemStatus(order.id, item.id, 'ready')}
                        >
                          Ready
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateItemStatus(order.id, item.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Timer className="h-4 w-4" />
                    <span>Est: {formatTime(order.estimatedTime)}</span>
                  </div>
                  {order.actualTime && (
                    <div className="flex items-center gap-1">
                      <Timer className="h-4 w-4" />
                      <span>Actual: {formatTime(order.actualTime)}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {order.status === 'ready' && (
                    <Button
                      onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark Delivered
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Order
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">No orders match the current filters.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}