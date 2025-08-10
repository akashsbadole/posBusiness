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
  Package
} from 'lucide-react'
import { useOrders } from '@/hooks/useOrders'

interface Order {
  id: string
  orderNumber: string
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'
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
  method: 'CASH' | 'CARD' | 'UPI' | 'WALLET'
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

export default function OrderManagement() {
  const [activeTab, setActiveTab] = useState('active')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  const { data: orders = [], isLoading, refetch } = useOrders()

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.staff.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    const matchesType = filterType === 'all' || order.orderType === filterType
    const matchesTab = activeTab === 'active' ? !['DELIVERED', 'CANCELLED'].includes(order.status) : 
                      activeTab === 'completed' ? order.status === 'DELIVERED' :
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
      'CANCELLED': { label: 'Cancelled', icon: XCircle, color: 'destructive' }
    }
    return statusMap[status as keyof typeof statusMap] || { label: status, icon: Clock, color: 'secondary' }
  }

  // Get order type icon
  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case 'DINE_IN': return <User className="h-4 w-4" />
      case 'TAKEAWAY': return <Package className="h-4 w-4" />
      case 'DELIVERY': return <Truck className="h-4 w-4" />
      default: return <ShoppingCart className="h-4 w-4" />
    }
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

    if (['PREPARING', 'READY', 'DELIVERED'].includes(order.status)) {
      timeline.push({
        id: '3',
        orderId: order.id,
        status: 'PREPARING',
        timestamp: order.updatedAt,
        staff: { name: order.staff.name }
      })
    }

    if (['READY', 'DELIVERED'].includes(order.status)) {
      timeline.push({
        id: '4',
        orderId: order.id,
        status: 'READY',
        timestamp: order.updatedAt,
        staff: { name: order.staff.name }
      })
    }

    if (order.status === 'DELIVERED') {
      timeline.push({
        id: '5',
        orderId: order.id,
        status: 'DELIVERED',
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
      'CANCELLED': 0
    }
    return progressMap[status as keyof typeof progressMap] || 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-gray-600">Track and manage customer orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === 'DELIVERED').length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
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

        <Card>
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
          <Card>
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
                    const StatusIcon = statusInfo.icon
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
                            {getOrderTypeIcon(order.orderType)}
                            <span className="capitalize">{order.orderType.replace('_', ' ')}</span>
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
                            {order.status !== 'CANCELLED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setIsCancelDialogOpen(true)
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
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
          <Card>
            <CardHeader>
              <CardTitle>Completed Orders</CardTitle>
              <CardDescription>Successfully delivered orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Completed At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
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
                          {getOrderTypeIcon(order.orderType)}
                          <span className="capitalize">{order.orderType.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>₹{order.totalAmount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>{order.staff.name}</TableCell>
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cancelled Orders</CardTitle>
              <CardDescription>Cancelled order requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Cancelled At</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
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
                          {getOrderTypeIcon(order.orderType)}
                          <span className="capitalize">{order.orderType.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>₹{order.totalAmount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>{order.staff.name}</TableCell>
                      <TableCell>{new Date(order.updatedAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={order.notes}>
                          {order.notes || 'No reason provided'}
                        </div>
                      </TableCell>
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          {selectedOrder && (
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline - {selectedOrder.orderNumber}</CardTitle>
                <CardDescription>Track the progress of this order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Order Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Customer</Label>
                      <div className="mt-1">
                        <div className="font-medium">{selectedOrder.customer?.name || 'Walk-in'}</div>
                        <div className="text-sm text-gray-500">{selectedOrder.customer?.phone}</div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Order Type</Label>
                      <div className="mt-1 flex items-center gap-2">
                        {getOrderTypeIcon(selectedOrder.orderType)}
                        <span className="capitalize">{selectedOrder.orderType.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Total Amount</Label>
                      <div className="mt-1 font-medium">₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <Label className="text-sm font-medium">Order Progress</Label>
                    <div className="mt-2">
                      <Progress value={getOrderProgress(selectedOrder.status)} className="h-3" />
                      <div className="text-sm text-gray-500 mt-1">
                        {getOrderProgress(selectedOrder.status)}% Complete
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <Label className="text-sm font-medium">Order Timeline</Label>
                    <div className="mt-4 space-y-4">
                      {getOrderTimeline(selectedOrder).map((event, index) => (
                        <div key={event.id} className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{event.status.replace('_', ' ')}</span>
                              <span className="text-sm text-gray-500">
                                {new Date(event.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              By {event.staff.name}
                            </div>
                            {event.notes && (
                              <div className="text-sm text-gray-500 mt-1">
                                Note: {event.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <Label className="text-sm font-medium">Order Items</Label>
                    <div className="mt-2 space-y-2">
                      {selectedOrder.orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">{item.menuItem.name}</div>
                            <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                            <div className="text-sm text-gray-500">₹{item.price} each</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>Update the status of order {selectedOrder?.orderNumber}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="PREPARING">Preparing</SelectItem>
                  <SelectItem value="READY">Ready</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>Are you sure you want to cancel order {selectedOrder?.orderNumber}?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Cancellation Reason</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              No, Keep Order
            </Button>
            <Button variant="destructive" onClick={handleCancelOrder}>
              Yes, Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}