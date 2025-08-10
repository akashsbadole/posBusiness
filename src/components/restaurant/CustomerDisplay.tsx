"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Monitor, 
  Settings, 
  Eye, 
  EyeOff, 
  Play, 
  Pause, 
  RefreshCw, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Utensils,
  Timer,
  Users,
  CreditCard,
  Receipt,
  Star,
  MessageSquare,
  Bell,
  Volume2,
  VolumeX
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DisplayOrder {
  id: string
  orderNumber: string
  tableNumber?: string
  customerName?: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  items: DisplayOrderItem[]
  totalAmount: number
  orderType: 'dine_in' | 'takeaway' | 'delivery'
  estimatedTime: number
  actualTime?: number
  progress: number
  createdAt: Date
  updatedAt: Date
  specialInstructions?: string
  paymentStatus: 'pending' | 'paid' | 'refunded'
  rating?: number
  feedback?: string
}

interface DisplayOrderItem {
  id: string
  name: string
  quantity: number
  price: number
  status: 'pending' | 'preparing' | 'ready' | 'served'
  notes?: string
  modifiers?: string[]
  estimatedTime: number
  actualTime?: number
}

interface DisplaySettings {
  showOrderNumber: boolean
  showCustomerName: boolean
  showTableNumber: boolean
  showEstimatedTime: boolean
  showProgress: boolean
  showSpecialInstructions: boolean
  showPaymentStatus: boolean
  showRating: boolean
  autoRefresh: boolean
  refreshInterval: number // in seconds
  soundEnabled: boolean
  volume: number
  theme: 'light' | 'dark' | 'auto'
  fontSize: 'small' | 'medium' | 'large'
  animationSpeed: 'slow' | 'normal' | 'fast'
  showAdvertisements: boolean
  advertisementInterval: number // in seconds
}

interface Advertisement {
  id: string
  title: string
  description: string
  imageUrl?: string
  duration: number // in seconds
  isActive: boolean
}

interface QueuePosition {
  orderNumber: string
  position: number
  estimatedWaitTime: number
  status: 'waiting' | 'preparing' | 'ready'
}

export default function CustomerDisplay() {
  const [orders, setOrders] = useState<DisplayOrder[]>([
    {
      id: '1',
      orderNumber: 'ORD-001',
      tableNumber: 'Table 5',
      customerName: 'John Doe',
      status: 'preparing',
      items: [
        {
          id: '1',
          name: 'Grilled Salmon',
          quantity: 2,
          price: 450,
          status: 'preparing',
          notes: 'Medium rare, no sauce',
          estimatedTime: 15
        },
        {
          id: '2',
          name: 'Caesar Salad',
          quantity: 1,
          price: 250,
          status: 'ready',
          modifiers: ['Extra cheese', 'No croutons'],
          estimatedTime: 5
        }
      ],
      totalAmount: 1150,
      orderType: 'dine_in',
      estimatedTime: 20,
      actualTime: 12,
      progress: 60,
      createdAt: new Date(Date.now() - 12 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 1000),
      specialInstructions: 'Customer allergic to nuts',
      paymentStatus: 'pending'
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      tableNumber: 'Table 3',
      customerName: 'Jane Smith',
      status: 'confirmed',
      items: [
        {
          id: '3',
          name: 'Beef Steak',
          quantity: 1,
          price: 650,
          status: 'pending',
          notes: 'Well done',
          estimatedTime: 20
        },
        {
          id: '4',
          name: 'French Fries',
          quantity: 2,
          price: 150,
          status: 'pending',
          estimatedTime: 8
        }
      ],
      totalAmount: 950,
      orderType: 'dine_in',
      estimatedTime: 25,
      progress: 0,
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 60 * 1000),
      paymentStatus: 'paid'
    },
    {
      id: '3',
      orderNumber: 'ORD-003',
      customerName: 'Bob Johnson',
      status: 'ready',
      items: [
        {
          id: '5',
          name: 'Margherita Pizza',
          quantity: 1,
          price: 350,
          status: 'ready',
          estimatedTime: 15
        }
      ],
      totalAmount: 350,
      orderType: 'takeaway',
      estimatedTime: 15,
      actualTime: 18,
      progress: 100,
      createdAt: new Date(Date.now() - 18 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 60 * 1000),
      paymentStatus: 'paid',
      rating: 5,
      feedback: 'Excellent service and food quality!'
    }
  ])

  const [settings, setSettings] = useState<DisplaySettings>({
    showOrderNumber: true,
    showCustomerName: true,
    showTableNumber: true,
    showEstimatedTime: true,
    showProgress: true,
    showSpecialInstructions: true,
    showPaymentStatus: true,
    showRating: true,
    autoRefresh: true,
    refreshInterval: 10,
    soundEnabled: true,
    volume: 70,
    theme: 'light',
    fontSize: 'medium',
    animationSpeed: 'normal',
    showAdvertisements: true,
    advertisementInterval: 30
  })

  const [advertisements, setAdvertisements] = useState<Advertisement[]>([
    {
      id: '1',
      title: 'Weekend Special',
      description: 'Get 20% off on all weekend orders!',
      duration: 10,
      isActive: true
    },
    {
      id: '2',
      title: 'Loyalty Program',
      description: 'Join our loyalty program and earn points on every order!',
      duration: 15,
      isActive: true
    },
    {
      id: '3',
      title: 'Birthday Special',
      description: 'Celebrate your birthday with us! Get a free dessert.',
      duration: 12,
      isActive: false
    }
  ])

  const [queuePositions, setQueuePositions] = useState<QueuePosition[]>([
    { orderNumber: 'ORD-004', position: 1, estimatedWaitTime: 15, status: 'waiting' },
    { orderNumber: 'ORD-005', position: 2, estimatedWaitTime: 25, status: 'waiting' },
    { orderNumber: 'ORD-006', position: 3, estimatedWaitTime: 35, status: 'preparing' }
  ])

  const [isDisplayActive, setIsDisplayActive] = useState(true)
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const { toast } = useToast()

  // Auto-refresh orders
  useEffect(() => {
    if (!settings.autoRefresh || !isDisplayActive) return

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
          const totalItems = updatedItems.length
          const progress = Math.round((completedItems / totalItems) * 100)
          const newStatus = completedItems === totalItems ? 'ready' : 'preparing'
          
          return {
            ...order,
            items: updatedItems,
            progress,
            status: newStatus,
            updatedAt: new Date()
          }
        }
        return order
      }))
    }, settings.refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [settings.autoRefresh, settings.refreshInterval, isDisplayActive])

  // Advertisement rotation
  useEffect(() => {
    if (!settings.showAdvertisements || !isDisplayActive) return

    const activeAds = advertisements.filter(ad => ad.isActive)
    if (activeAds.length === 0) return

    const interval = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % activeAds.length)
    }, settings.advertisementInterval * 1000)

    return () => clearInterval(interval)
  }, [settings.showAdvertisements, settings.advertisementInterval, advertisements, isDisplayActive])

  const handleToggleDisplay = () => {
    setIsDisplayActive(!isDisplayActive)
    toast({
      title: isDisplayActive ? "Display Stopped" : "Display Started",
      description: `Customer display has been ${isDisplayActive ? 'stopped' : 'started'}.`
    })
  }

  const handleUpdateSettings = (newSettings: Partial<DisplaySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
    toast({
      title: "Settings Updated",
      description: "Display settings have been updated successfully."
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-500'
      case 'confirmed': return 'bg-blue-500'
      case 'preparing': return 'bg-yellow-500'
      case 'ready': return 'bg-green-500'
      case 'delivered': return 'bg-purple-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Order Received'
      case 'confirmed': return 'Order Confirmed'
      case 'preparing': return 'Preparing'
      case 'ready': return 'Ready for Pickup'
      case 'delivered': return 'Delivered'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'refunded': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getFontSizeClass = (size: string) => {
    switch (size) {
      case 'small': return 'text-sm'
      case 'medium': return 'text-base'
      case 'large': return 'text-lg'
      default: return 'text-base'
    }
  }

  const activeAdvertisements = advertisements.filter(ad => ad.isActive)
  const currentAdvertisement = activeAdvertisements[currentAdIndex]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Customer Display</h2>
          <p className="text-gray-600">Manage customer-facing order display system</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isPreviewMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <Eye className="mr-2 h-4 w-4" />
            {isPreviewMode ? "Exit Preview" : "Preview Mode"}
          </Button>
          <Button
            variant={isDisplayActive ? "default" : "outline"}
            onClick={handleToggleDisplay}
          >
            {isDisplayActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isDisplayActive ? "Stop Display" : "Start Display"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="display" className="space-y-4">
        <TabsList>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="advertisements">Advertisements</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="display" className="space-y-4">
          {/* Display Preview */}
          <Card className={`${isPreviewMode ? 'border-2 border-blue-500' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Order Display</CardTitle>
                  <CardDescription>
                    {isDisplayActive ? "Display is active and showing orders" : "Display is stopped"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    <span className="text-sm">{settings.volume}%</span>
                  </div>
                  <Badge className={isDisplayActive ? 'bg-green-500' : 'bg-gray-500'}>
                    {isDisplayActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`space-y-4 ${getFontSizeClass(settings.fontSize)}`}>
                {/* Advertisement Banner */}
                {settings.showAdvertisements && currentAdvertisement && (
                  <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-xl font-bold mb-2">{currentAdvertisement.title}</h3>
                        <p className="text-blue-100">{currentAdvertisement.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Orders Display */}
                <div className="grid gap-4">
                  {orders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled').map((order) => (
                    <Card key={order.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-2">
                            {settings.showOrderNumber && (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xl">{order.orderNumber}</span>
                                <Badge className={getStatusColor(order.status)}>
                                  {getStatusText(order.status)}
                                </Badge>
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {settings.showTableNumber && order.tableNumber && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {order.tableNumber}
                                </span>
                              )}
                              {settings.showCustomerName && order.customerName && (
                                <span>{order.customerName}</span>
                              )}
                              <span className="flex items-center gap-1">
                                <Utensils className="h-4 w-4" />
                                {order.orderType.replace('_', ' ')}
                              </span>
                              {settings.showPaymentStatus && (
                                <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                                  {order.paymentStatus}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">₹{order.totalAmount}</div>
                            {settings.showEstimatedTime && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Timer className="h-4 w-4" />
                                {order.actualTime ? `${order.actualTime}m` : `~${order.estimatedTime}m`}
                              </div>
                            )}
                          </div>
                        </div>

                        {settings.showProgress && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{order.progress}%</span>
                            </div>
                            <Progress value={order.progress} className="h-2" />
                          </div>
                        )}

                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                              <div className="flex items-center gap-3">
                                <Badge className={getStatusColor(item.status)} variant="secondary">
                                  {item.status}
                                </Badge>
                                <div>
                                  <span className="font-medium">{item.name}</span>
                                  <span className="text-gray-500 ml-2">x{item.quantity}</span>
                                </div>
                                {item.notes && (
                                  <span className="text-sm text-yellow-600">({item.notes})</span>
                                )}
                                {item.modifiers && item.modifiers.length > 0 && (
                                  <span className="text-sm text-blue-600">
                                    [{item.modifiers.join(', ')}]
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-medium">₹{item.price * item.quantity}</div>
                                <div className="text-sm text-gray-500">
                                  {item.actualTime ? `${item.actualTime}m` : `~${item.estimatedTime}m`}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {settings.showSpecialInstructions && order.specialInstructions && (
                          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <MessageSquare className="h-4 w-4 text-yellow-600" />
                              <span className="font-medium text-yellow-800">Special Instructions</span>
                            </div>
                            <p className="text-sm text-yellow-700">{order.specialInstructions}</p>
                          </div>
                        )}

                        {settings.showRating && order.rating && (
                          <div className="mt-4 flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{order.rating}/5</span>
                            {order.feedback && (
                              <span className="text-sm text-gray-600">- {order.feedback}</span>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {orders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled').length === 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">All Orders Complete</h3>
                        <p className="text-gray-500">No active orders to display.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Queue</CardTitle>
              <CardDescription>Current order queue and wait times</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queuePositions.map((queue) => (
                  <div key={queue.orderNumber} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-blue-600">#{queue.position}</div>
                      <div>
                        <div className="font-medium">{queue.orderNumber}</div>
                        <div className="text-sm text-gray-500">
                          Estimated wait: {queue.estimatedWaitTime} minutes
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={queue.status === 'waiting' ? 'bg-yellow-500' : 'bg-green-500'}>
                        {queue.status}
                      </Badge>
                      {queue.status === 'ready' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advertisements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advertisement Management</CardTitle>
              <CardDescription>Manage promotional content for customer display</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {advertisements.map((ad) => (
                  <div key={ad.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{ad.title}</span>
                        <Badge className={ad.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                          {ad.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{ad.description}</p>
                      <div className="text-sm text-gray-500">Duration: {ad.duration} seconds</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={ad.isActive}
                        onCheckedChange={(checked) => {
                          setAdvertisements(prev => prev.map(a => 
                            a.id === ad.id ? { ...a, isActive: checked } : a
                          ))
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>Configure customer display appearance and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Content Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Show Order Number</span>
                      <Switch
                        checked={settings.showOrderNumber}
                        onCheckedChange={(checked) => handleUpdateSettings({ showOrderNumber: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Show Customer Name</span>
                      <Switch
                        checked={settings.showCustomerName}
                        onCheckedChange={(checked) => handleUpdateSettings({ showCustomerName: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Show Table Number</span>
                      <Switch
                        checked={settings.showTableNumber}
                        onCheckedChange={(checked) => handleUpdateSettings({ showTableNumber: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Show Estimated Time</span>
                      <Switch
                        checked={settings.showEstimatedTime}
                        onCheckedChange={(checked) => handleUpdateSettings({ showEstimatedTime: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Show Progress</span>
                      <Switch
                        checked={settings.showProgress}
                        onCheckedChange={(checked) => handleUpdateSettings({ showProgress: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Show Special Instructions</span>
                      <Switch
                        checked={settings.showSpecialInstructions}
                        onCheckedChange={(checked) => handleUpdateSettings({ showSpecialInstructions: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Show Payment Status</span>
                      <Switch
                        checked={settings.showPaymentStatus}
                        onCheckedChange={(checked) => handleUpdateSettings({ showPaymentStatus: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Show Rating</span>
                      <Switch
                        checked={settings.showRating}
                        onCheckedChange={(checked) => handleUpdateSettings({ showRating: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Display Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Auto Refresh</span>
                      <Switch
                        checked={settings.autoRefresh}
                        onCheckedChange={(checked) => handleUpdateSettings({ autoRefresh: checked })}
                      />
                    </div>
                    <div className="space-y-2">
                      <span>Refresh Interval</span>
                      <select
                        value={settings.refreshInterval}
                        onChange={(e) => handleUpdateSettings({ refreshInterval: parseInt(e.target.value) })}
                        className="w-full p-2 border rounded"
                      >
                        <option value={5}>5 seconds</option>
                        <option value={10}>10 seconds</option>
                        <option value={15}>15 seconds</option>
                        <option value={30}>30 seconds</option>
                        <option value={60}>60 seconds</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Sound Enabled</span>
                      <Switch
                        checked={settings.soundEnabled}
                        onCheckedChange={(checked) => handleUpdateSettings({ soundEnabled: checked })}
                      />
                    </div>
                    <div className="space-y-2">
                      <span>Volume</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.volume}
                        onChange={(e) => handleUpdateSettings({ volume: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <span>Font Size</span>
                      <select
                        value={settings.fontSize}
                        onChange={(e) => handleUpdateSettings({ fontSize: e.target.value as any })}
                        className="w-full p-2 border rounded"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <span>Theme</span>
                      <select
                        value={settings.theme}
                        onChange={(e) => handleUpdateSettings({ theme: e.target.value as any })}
                        className="w-full p-2 border rounded"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Advertisement Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Show Advertisements</span>
                    <Switch
                      checked={settings.showAdvertisements}
                      onCheckedChange={(checked) => handleUpdateSettings({ showAdvertisements: checked })}
                    />
                  </div>
                  <div className="space-y-2">
                    <span>Advertisement Interval</span>
                    <select
                      value={settings.advertisementInterval}
                      onChange={(e) => handleUpdateSettings({ advertisementInterval: parseInt(e.target.value) })}
                      className="w-full p-2 border rounded"
                    >
                      <option value={15}>15 seconds</option>
                      <option value={30}>30 seconds</option>
                      <option value={45}>45 seconds</option>
                      <option value={60}>60 seconds</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}