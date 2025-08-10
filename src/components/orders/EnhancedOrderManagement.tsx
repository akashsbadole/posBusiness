"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Truck,
  ChefHat,
  Phone,
  MapPin,
  User,
  Package,
  Calendar,
  Scissors,
  Heart,
  Pill,
  Dumbbell,
  Stethoscope,
  Building,
  Wine,
  Store,
  Coffee,
  ShoppingBag,
  Users,
  Star
} from 'lucide-react'
import { useOrders } from '@/hooks/index'

interface Order {
  id: string
  orderNumber: string
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | 'IN_STORE' | 'ONLINE' | 'APPOINTMENT' | 'SERVICE' | 'SUBSCRIPTION' | 'ROOM_SERVICE' | 'TAB' | 'PRESCRIPTION'
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED' | 'COMPLETED' | 'IN_PROGRESS'
  customer?: {
    id: string
    name: string
    phone: string
    address?: string
  }
  table?: {
    id: string
    number: number
    capacity: number
  }
  staff: {
    id: string
    name: string
  }
  subtotal: number
  gstAmount: number
  totalAmount: number
  discount: number
  notes?: string
  isPaid: boolean
  appointmentDate?: string
  serviceType?: string
  customFields?: string
  createdAt: string
  updatedAt: string
  orderItems: OrderItem[]
  payments: Payment[]
}

interface OrderItem {
  id: string
  menuItem: {
    id: string
    name: string
    price: number
  }
  quantity: number
  price: number
  notes?: string
}

interface Payment {
  id: string
  amount: number
  method: 'CASH' | 'CARD' | 'UPI' | 'WALLET' | 'INSURANCE' | 'MEMBERSHIP'
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  transactionId?: string
  createdAt: string
}

interface OrderTimeline {
  id: string
  orderId: string
  status: string
  notes?: string
  timestamp: string
  staff: {
    name: string
  }
}

export default function EnhancedOrderManagement({ restaurantId }: { restaurantId: string }) {
  const [activeTab, setActiveTab] = useState('active')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  const { data: orders = [], isLoading, refetch } = useOrders(restaurantId)

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.staff.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    const matchesType = filterType === 'all' || order.orderType === filterType
    const matchesTab = activeTab === 'active' ? !['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status) : 
                      activeTab === 'completed' ? ['DELIVERED', 'COMPLETED'].includes(order.status) :
                      activeTab === 'cancelled' ? order.status === 'CANCELLED' : true

    return matchesSearch && matchesStatus && matchesType && matchesTab
  })

  // Get order status with icon and color
  const getOrderStatus = (status: string) => {
    const statusMap = {
      'PENDING': { label: 'Pending', icon: Clock, color: 'secondary' },
      'CONFIRMED': { label: 'Confirmed', icon: CheckCircle, color: 'default' },
      'PREPARING': { label: 'Preparing', icon: ChefHat, color: 'default' },
      'READY': { label: 'Ready', icon: Package, color: 'default' },
      'DELIVERED': { label: 'Delivered', icon: Truck, color: 'default' },
      'COMPLETED': { label: 'Completed', icon: CheckCircle, color: 'default' },
      'IN_PROGRESS': { label: 'In Progress', icon: Clock, color: 'default' },
      'CANCELLED': { label: 'Cancelled', icon: XCircle, color: 'destructive' }
    }
    return statusMap[status as keyof typeof statusMap] || { label: status, icon: Clock, color: 'secondary' }
  }

  // Get order type icon and label
  const getOrderTypeInfo = (type: string) => {
    const typeMap = {
      'DINE_IN': { label: 'Dine In', icon: User, color: 'text-blue-600' },
      'TAKEAWAY': { label: 'Takeaway', icon: Package, color: 'text-green-600' },
      'DELIVERY': { label: 'Delivery', icon: Truck, color: 'text-purple-600' },
      'IN_STORE': { label: 'In Store', icon: Store, color: 'text-orange-600' },
      'ONLINE': { label: 'Online', icon: ShoppingBag, color: 'text-indigo-600' },
      'APPOINTMENT': { label: 'Appointment', icon: Calendar, color: 'text-pink-600' },
      'SERVICE': { label: 'Service', icon: Scissors, color: 'text-teal-600' },
      'SUBSCRIPTION': { label: 'Subscription', icon: Star, color: 'text-yellow-600' },
      'ROOM_SERVICE': { label: 'Room Service', icon: Building, color: 'text-cyan-600' },
      'TAB': { label: 'Tab', icon: Wine, color: 'text-red-600' },
      'PRESCRIPTION': { label: 'Prescription', icon: Pill, color: 'text-emerald-600' }
    }
    return typeMap[type as keyof typeof typeMap] || { label: type, icon: ShoppingCart, color: 'text-gray-600' }
  }

  // Update order status
  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return

    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setIsUpdateDialogOpen(false)
        setNewStatus('')
        setSelectedOrder(null)
        refetch()
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  // Cancel order
  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancelReason) return

    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'CANCELLED',
          cancellationReason: cancelReason 
        }),
      })

      if (response.ok) {
        setIsCancelDialogOpen(false)
        setCancelReason('')
        setSelectedOrder(null)
        refetch()
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
    }
  }

  // Get order timeline
  const getOrderTimeline = (order: Order): OrderTimeline[] => {
    const timeline = [
      {
        id: '1',
        orderId: order.id,
        status: 'ORDER_PLACED',
        timestamp: order.createdAt,
        staff: { name: order.staff.name }
      }
    ]

    if (order.status !== 'PENDING') {
      timeline.push({
        id: '2',
        orderId: order.id,
        status: 'CONFIRMED',
        timestamp: order.updatedAt,
        staff: { name: order.staff.name }
      })
    }

    if (['PREPARING', 'READY', 'DELIVERED', 'COMPLETED', 'IN_PROGRESS'].includes(order.status)) {
      timeline.push({
        id: '3',
        orderId: order.id,
        status: 'PREPARING',
        timestamp: order.updatedAt,
        staff: { name: order.staff.name }
      })
    }

    if (['READY', 'DELIVERED', 'COMPLETED'].includes(order.status)) {
      timeline.push({
        id: '4',
        orderId: order.id,
        status: 'READY',
        timestamp: order.updatedAt,
        staff: { name: order.staff.name }
      })
    }

    if (['DELIVERED', 'COMPLETED'].includes(order.status)) {
      timeline.push({
        id: '5',
        orderId: order.id,
        status: order.status,
        timestamp: order.updatedAt,
        staff: { name: order.staff.name }
      })
    }

    if (order.status === 'CANCELLED') {
      timeline.push({
        id: '6',
        orderId: order.id,
        status: 'CANCELLED',
        timestamp: order.updatedAt,
        staff: { name: order.staff.name },
        notes: cancelReason
      })
    }

    return timeline
  }

  // Calculate order progress
  const getOrderProgress = (status: string) => {
    const progressMap = {
      'PENDING': 20,
      'CONFIRMED': 40,
      'PREPARING': 60,
      'READY': 80,
      'DELIVERED': 100,
      'COMPLETED': 100,
      'IN_PROGRESS': 70,
      'CANCELLED': 0
    }
    return progressMap[status as keyof typeof progressMap] || 0
  }

  // Get status options based on order type
  const getStatusOptions = (orderType: string) => {
    const baseOptions = ['PENDING', 'CONFIRMED', 'CANCELLED']
    
    switch (orderType) {
      case 'DINE_IN':
      case 'TAKEAWAY':
      case 'DELIVERY':
      case 'IN_STORE':
      case 'ONLINE':
      case 'ROOM_SERVICE':
      case 'TAB':
        return [...baseOptions, 'PREPARING', 'READY', 'DELIVERED']
      case 'APPOINTMENT':
      case 'SERVICE':
        return [...baseOptions, 'IN_PROGRESS', 'COMPLETED']
      case 'SUBSCRIPTION':
        return [...baseOptions, 'IN_PROGRESS', 'COMPLETED']
      case 'PRESCRIPTION':
        return [...baseOptions, 'IN_PROGRESS', 'COMPLETED']
      default:
        return baseOptions
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Order Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Track and manage customer orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} className="border-slate-200 dark:border-slate-700">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => !['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(o.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently processing</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => ['DELIVERED', 'COMPLETED'].includes(o.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled Orders</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {orders.filter(o => o.status === 'CANCELLED').length}
            </div>
            <p className="text-xs text-muted-foreground">Cancelled requests</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{orders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">Today's earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="PREPARING">Preparing</SelectItem>
            <SelectItem value="READY">Ready</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="DINE_IN">Dine In</SelectItem>
            <SelectItem value="TAKEAWAY">Takeaway</SelectItem>
            <SelectItem value="DELIVERY">Delivery</SelectItem>
            <SelectItem value="IN_STORE">In Store</SelectItem>
            <SelectItem value="ONLINE">Online</SelectItem>
            <SelectItem value="APPOINTMENT">Appointment</SelectItem>
            <SelectItem value="SERVICE">Service</SelectItem>
            <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
            <SelectItem value="ROOM_SERVICE">Room Service</SelectItem>
            <SelectItem value="TAB">Tab</SelectItem>
            <SelectItem value="PRESCRIPTION">Prescription</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active Orders</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="timeline">Order Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Active Orders</CardTitle>
              <CardDescription>Orders currently being processed</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const statusInfo = getOrderStatus(order.status)
                    const typeInfo = getOrderTypeInfo(order.orderType)
                    const StatusIcon = statusInfo.icon
                    const TypeIcon = typeInfo.icon
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.customer?.name || 'Walk-in'}</div>
                            <div className="text-sm text-gray-500">{order.customer?.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TypeIcon className={`h-4 w-4 ${typeInfo.color}`} />
                            <span className="capitalize">{typeInfo.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.color as any}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{order.totalAmount.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{order.staff.name}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Progress value={getOrderProgress(order.status)} className="h-2" />
                            <div className="text-xs text-gray-500">{getOrderProgress(order.status)}%</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order)
                                setIsUpdateDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Completed Orders</CardTitle>
              <CardDescription>Successfully completed orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Completed At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const statusInfo = getOrderStatus(order.status)
                    const typeInfo = getOrderTypeInfo(order.orderType)
                    const StatusIcon = statusInfo.icon
                    const TypeIcon = typeInfo.icon
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.customer?.name || 'Walk-in'}</div>
                            <div className="text-sm text-gray-500">{order.customer?.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TypeIcon className={`h-4 w-4 ${typeInfo.color}`} />
                            <span className="capitalize">{typeInfo.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.color as any}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{order.totalAmount.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{new Date(order.updatedAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Cancelled Orders</CardTitle>
              <CardDescription>Cancelled orders and reasons</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Cancelled At</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const statusInfo = getOrderStatus(order.status)
                    const typeInfo = getOrderTypeInfo(order.orderType)
                    const StatusIcon = statusInfo.icon
                    const TypeIcon = typeInfo.icon
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.customer?.name || 'Walk-in'}</div>
                            <div className="text-sm text-gray-500">{order.customer?.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TypeIcon className={`h-4 w-4 ${typeInfo.color}`} />
                            <span className="capitalize">{typeInfo.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.color as any}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{order.totalAmount.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{new Date(order.updatedAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={order.notes}>
                            {order.notes || 'No reason provided'}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
              <CardDescription>Track order progress and history</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedOrder ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Order Details</h3>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Order #:</span> {selectedOrder.orderNumber}</div>
                        <div><span className="font-medium">Customer:</span> {selectedOrder.customer?.name || 'Walk-in'}</div>
                        <div><span className="font-medium">Type:</span> {getOrderTypeInfo(selectedOrder.orderType).label}</div>
                        <div><span className="font-medium">Amount:</span> ₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</div>
                        <div><span className="font-medium">Staff:</span> {selectedOrder.staff.name}</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Progress</h3>
                      <div className="space-y-2">
                        <Progress value={getOrderProgress(selectedOrder.status)} className="h-3" />
                        <div className="text-sm text-gray-500">{getOrderProgress(selectedOrder.status)}% Complete</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4">Timeline</h3>
                    <div className="space-y-4">
                      {getOrderTimeline(selectedOrder).map((event, index) => (
                        <div key={event.id} className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{event.status.replace('_', ' ')}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(event.timestamp).toLocaleString()} by {event.staff.name}
                            </div>
                            {event.notes && (
                              <div className="text-sm text-gray-600 mt-1">{event.notes}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Select an order to view timeline</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Update the status for order #{selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {selectedOrder && getStatusOptions(selectedOrder.orderType).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={!newStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel order #{selectedOrder?.orderNumber}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for cancellation</Label>
              <Textarea
                id="reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Keep Order
            </Button>
            <Button onClick={handleCancelOrder} disabled={!cancelReason} variant="destructive">
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}