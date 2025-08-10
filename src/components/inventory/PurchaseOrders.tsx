"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Truck,
  Package,
  DollarSign,
  FileText,
  Send,
  Eye,
  Download,
  Printer,
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PurchaseOrder {
  id: string
  orderNumber: string
  vendorId: string
  vendorName: string
  status: 'draft' | 'pending_approval' | 'approved' | 'ordered' | 'partial_received' | 'received' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  orderDate: Date
  expectedDeliveryDate: Date
  actualDeliveryDate?: Date
  items: PurchaseOrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  currency: string
  notes?: string
  terms?: string
  approvedBy?: string
  approvedAt?: Date
  createdBy: string
  createdAt: Date
  updatedBy: string
  updatedAt: Date
  attachments?: string[]
}

interface PurchaseOrderItem {
  id: string
  productId: string
  productName: string
  sku?: string
  description?: string
  quantity: number
  receivedQuantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  taxRate: number
  taxAmount: number
  notes?: string
  expectedDeliveryDate?: Date
}

interface Vendor {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  country: string
  gstNumber?: string
  paymentTerms: string
  leadTime: number // in days
  isActive: boolean
  rating?: number
  totalOrders: number
  totalSpent: number
  lastOrderDate?: Date
}

interface PurchaseOrderTemplate {
  id: string
  name: string
  description: string
  vendorId: string
  items: TemplateItem[]
  isDefault: boolean
}

interface TemplateItem {
  productId: string
  productName: string
  quantity: number
  unit: string
  notes?: string
}

export default function PurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: '1',
      orderNumber: 'PO-2024-001',
      vendorId: '1',
      vendorName: 'Fresh Supplies Ltd',
      status: 'approved',
      priority: 'normal',
      orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      expectedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      items: [
        {
          id: '1',
          productId: '1',
          productName: 'Tomatoes',
          sku: 'TOM-001',
          quantity: 50,
          receivedQuantity: 0,
          unit: 'kg',
          unitPrice: 40,
          totalPrice: 2000,
          taxRate: 5,
          taxAmount: 100
        },
        {
          id: '2',
          productId: '2',
          productName: 'Onions',
          sku: 'ONI-001',
          quantity: 30,
          receivedQuantity: 0,
          unit: 'kg',
          unitPrice: 25,
          totalPrice: 750,
          taxRate: 5,
          taxAmount: 37.5
        }
      ],
      subtotal: 2750,
      tax: 137.5,
      shipping: 100,
      total: 2987.5,
      currency: 'INR',
      notes: 'Please ensure fresh quality',
      terms: 'Net 30 days',
      approvedBy: 'John Manager',
      approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdBy: 'Jane Staff',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedBy: 'John Manager',
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      orderNumber: 'PO-2024-002',
      vendorId: '2',
      vendorName: 'Quality Meats Co',
      status: 'ordered',
      priority: 'high',
      orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      expectedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      items: [
        {
          id: '3',
          productId: '3',
          productName: 'Chicken Breast',
          sku: 'CHK-001',
          quantity: 20,
          receivedQuantity: 0,
          unit: 'kg',
          unitPrice: 250,
          totalPrice: 5000,
          taxRate: 5,
          taxAmount: 250
        }
      ],
      subtotal: 5000,
      tax: 250,
      shipping: 150,
      total: 5400,
      currency: 'INR',
      notes: 'Premium quality required',
      terms: 'Net 15 days',
      createdBy: 'Jane Staff',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedBy: 'Jane Staff',
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      orderNumber: 'PO-2024-003',
      vendorId: '3',
      vendorName: 'Beverage Suppliers',
      status: 'partial_received',
      priority: 'normal',
      orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      expectedDeliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      actualDeliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      items: [
        {
          id: '4',
          productId: '4',
          productName: 'Soft Drinks',
          sku: 'SDR-001',
          quantity: 100,
          receivedQuantity: 80,
          unit: 'bottles',
          unitPrice: 25,
          totalPrice: 2500,
          taxRate: 12,
          taxAmount: 300
        }
      ],
      subtotal: 2500,
      tax: 300,
      shipping: 200,
      total: 3000,
      currency: 'INR',
      createdBy: 'Jane Staff',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedBy: 'Jane Staff',
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ])

  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: '1',
      name: 'Fresh Supplies Ltd',
      contactPerson: 'Raj Kumar',
      email: 'raj@freshsupplies.com',
      phone: '+91 22 1234 5678',
      address: '123 Market Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
      gstNumber: '27ABCDE1234F1Z5',
      paymentTerms: 'Net 30 days',
      leadTime: 3,
      isActive: true,
      rating: 4.5,
      totalOrders: 25,
      totalSpent: 125000,
      lastOrderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Quality Meats Co',
      contactPerson: 'Amit Singh',
      email: 'amit@qualitymeats.com',
      phone: '+91 22 2345 6789',
      address: '456 Industrial Area',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400002',
      country: 'India',
      gstNumber: '27FGHIJ5678K1Z5',
      paymentTerms: 'Net 15 days',
      leadTime: 2,
      isActive: true,
      rating: 4.2,
      totalOrders: 15,
      totalSpent: 95000,
      lastOrderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      name: 'Beverage Suppliers',
      contactPerson: 'Priya Patel',
      email: 'priya@beverages.com',
      phone: '+91 22 3456 7890',
      address: '789 Warehouse Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400003',
      country: 'India',
      gstNumber: '27KLMNO9012P1Z5',
      paymentTerms: 'Net 30 days',
      leadTime: 5,
      isActive: true,
      rating: 4.0,
      totalOrders: 30,
      totalSpent: 180000,
      lastOrderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    }
  ])

  const [templates, setTemplates] = useState<PurchaseOrderTemplate[]>([
    {
      id: '1',
      name: 'Weekly Fresh Produce',
      description: 'Standard weekly order for fresh vegetables and fruits',
      vendorId: '1',
      items: [
        {
          productId: '1',
          productName: 'Tomatoes',
          quantity: 50,
          unit: 'kg',
          notes: 'Ripe and fresh'
        },
        {
          productId: '2',
          productName: 'Onions',
          quantity: 30,
          unit: 'kg'
        }
      ],
      isDefault: true
    }
  ])

  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [editingOrder, setEditingOrder] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedVendor, setSelectedVendor] = useState<string>('all')
  const [newOrder, setNewOrder] = useState<Partial<PurchaseOrder>>({
    status: 'draft',
    priority: 'normal',
    orderDate: new Date(),
    expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    items: [],
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    currency: 'INR'
  })
  const { toast } = useToast()

  const filteredOrders = purchaseOrders.filter(order => {
    const statusMatch = selectedStatus === 'all' || order.status === selectedStatus
    const vendorMatch = selectedVendor === 'all' || order.vendorId === selectedVendor
    return statusMatch && vendorMatch
  })

  const handleCreateOrder = () => {
    if (!newOrder.vendorId || !newOrder.items || newOrder.items.length === 0) {
      toast({
        title: "Validation Error",
        description: "Vendor and at least one item are required.",
        variant: "destructive"
      })
      return
    }

    const vendor = vendors.find(v => v.id === newOrder.vendorId)
    const order: PurchaseOrder = {
      id: Date.now().toString(),
      orderNumber: `PO-2024-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      vendorId: newOrder.vendorId!,
      vendorName: vendor?.name || '',
      status: newOrder.status!,
      priority: newOrder.priority!,
      orderDate: newOrder.orderDate!,
      expectedDeliveryDate: newOrder.expectedDeliveryDate!,
      items: newOrder.items!,
      subtotal: newOrder.subtotal!,
      tax: newOrder.tax!,
      shipping: newOrder.shipping!,
      total: newOrder.total!,
      currency: newOrder.currency!,
      notes: newOrder.notes,
      terms: newOrder.terms,
      createdBy: 'Current User',
      createdAt: new Date(),
      updatedBy: 'Current User',
      updatedAt: new Date()
    }

    setPurchaseOrders(prev => [...prev, order])
    setIsCreatingOrder(false)
    setNewOrder({
      status: 'draft',
      priority: 'normal',
      orderDate: new Date(),
      expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      currency: 'INR'
    })

    toast({
      title: "Purchase Order Created",
      description: "New purchase order has been created successfully."
    })
  }

  const handleUpdateOrderStatus = (orderId: string, status: PurchaseOrder['status']) => {
    setPurchaseOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status,
            updatedAt: new Date(),
            updatedBy: 'Current User',
            ...(status === 'approved' && {
              approvedBy: 'Current User',
              approvedAt: new Date()
            })
          } 
        : order
    ))

    toast({
      title: "Order Status Updated",
      description: `Purchase order status has been updated to ${status}.`
    })
  }

  const handleDeleteOrder = (orderId: string) => {
    setPurchaseOrders(prev => prev.filter(order => order.id !== orderId))
    toast({
      title: "Order Deleted",
      description: "Purchase order has been deleted successfully."
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500'
      case 'pending_approval': return 'bg-yellow-500'
      case 'approved': return 'bg-blue-500'
      case 'ordered': return 'bg-purple-500'
      case 'partial_received': return 'bg-orange-500'
      case 'received': return 'bg-green-500'
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

  const getStatusStats = () => {
    const stats = {
      draft: 0,
      pending_approval: 0,
      approved: 0,
      ordered: 0,
      partial_received: 0,
      received: 0,
      cancelled: 0,
      total: 0,
      totalValue: 0
    }

    purchaseOrders.forEach(order => {
      stats[order.status]++
      stats.total++
      stats.totalValue += order.total
    })

    return stats
  }

  const statusStats = getStatusStats()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Purchase Orders</h2>
          <p className="text-gray-600">Manage purchase orders and vendor relationships</p>
        </div>
        <Button onClick={() => setIsCreatingOrder(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Purchase Order
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('draft')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.draft}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('pending_approval')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.pending_approval}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('approved')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.approved}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('ordered')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ordered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.ordered}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('partial_received')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Partial Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.partial_received}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('received')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.received}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('cancelled')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.cancelled}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('all')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.total}</div>
            <div className="text-sm text-gray-500">₹{statusStats.totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label>Status:</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="partial_received">Partial Received</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label>Vendor:</Label>
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map(vendor => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders List */}
      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(order.priority)}>
                      {order.priority}
                    </Badge>
                  </div>
                  <CardDescription>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {order.vendorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {order.orderDate.toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Truck className="h-4 w-4" />
                        Expected: {order.expectedDeliveryDate.toLocaleDateString()}
                      </span>
                      {order.actualDeliveryDate && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Delivered: {order.actualDeliveryDate.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-2xl font-bold">₹{order.total.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{order.items.length} items</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {order.status === 'draft' && (
                      <Button size="sm" onClick={() => handleUpdateOrderStatus(order.id, 'pending_approval')}>
                        Send for Approval
                      </Button>
                    )}
                    {order.status === 'pending_approval' && (
                      <Button size="sm" onClick={() => handleUpdateOrderStatus(order.id, 'approved')}>
                        Approve
                      </Button>
                    )}
                    {order.status === 'approved' && (
                      <Button size="sm" onClick={() => handleUpdateOrderStatus(order.id, 'ordered')}>
                        Place Order
                      </Button>
                    )}
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteOrder(order.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Items Summary */}
                <div className="grid gap-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Package className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-gray-500">
                            {item.quantity} {item.unit} × ₹{item.unitPrice} = ₹{item.totalPrice}
                          </div>
                          {item.receivedQuantity > 0 && (
                            <div className="text-sm text-green-600">
                              Received: {item.receivedQuantity} {item.unit}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{item.totalPrice + item.taxAmount}</div>
                        <div className="text-sm text-gray-500">
                          Tax: ₹{item.taxAmount}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Financial Summary</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{order.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>₹{order.tax}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>₹{order.shipping}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Total:</span>
                        <span>₹{order.total}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Order Information</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Created by:</span>
                        <span>{order.createdBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created at:</span>
                        <span>{order.createdAt.toLocaleDateString()}</span>
                      </div>
                      {order.approvedBy && (
                        <div className="flex justify-between">
                          <span>Approved by:</span>
                          <span>{order.approvedBy}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Terms:</span>
                        <span>{order.terms}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Progress</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Items Received</span>
                        <span>
                          {order.items.reduce((sum, item) => sum + item.receivedQuantity, 0)} / {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                      </div>
                      <Progress 
                        value={(order.items.reduce((sum, item) => sum + item.receivedQuantity, 0) / order.items.reduce((sum, item) => sum + item.quantity, 0)) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 mb-1">Notes</div>
                    <p className="text-sm text-blue-700">{order.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No purchase orders found</h3>
              <p className="text-gray-500">No purchase orders match the current filters.</p>
              <Button className="mt-4" onClick={() => setIsCreatingOrder(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Purchase Order
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Purchase Order Form */}
      {isCreatingOrder && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardHeader>
            <CardTitle>Create New Purchase Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Select
                  value={newOrder.vendorId}
                  onValueChange={(value) => setNewOrder(prev => ({ ...prev, vendorId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.filter(v => v.isActive).map(vendor => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newOrder.priority}
                  onValueChange={(value) => setNewOrder(prev => ({ ...prev, priority: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-date">Order Date</Label>
                <Input
                  id="order-date"
                  type="date"
                  value={newOrder.orderDate?.toISOString().split('T')[0]}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, orderDate: new Date(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expected-delivery">Expected Delivery Date</Label>
                <Input
                  id="expected-delivery"
                  type="date"
                  value={newOrder.expectedDeliveryDate?.toISOString().split('T')[0]}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, expectedDeliveryDate: new Date(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter order notes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms">Terms</Label>
                <Select
                  value={newOrder.terms}
                  onValueChange={(value) => setNewOrder(prev => ({ ...prev, terms: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 15 days">Net 15 days</SelectItem>
                    <SelectItem value="Net 30 days">Net 30 days</SelectItem>
                    <SelectItem value="Net 45 days">Net 45 days</SelectItem>
                    <SelectItem value="Net 60 days">Net 60 days</SelectItem>
                    <SelectItem value="Immediate">Immediate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateOrder}>
                <Save className="mr-2 h-4 w-4" />
                Create Order
              </Button>
              <Button variant="outline" onClick={() => setIsCreatingOrder(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}