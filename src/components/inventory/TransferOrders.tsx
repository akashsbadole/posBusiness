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
  Truck, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Package,
  MapPin,
  Calendar,
  User,
  FileText,
  Eye,
  Download,
  Printer,
  BarChart3,
  Filter,
  Search,
  ArrowRightLeft,
  Warehouse,
  Store
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TransferOrder {
  id: string
  transferNumber: string
  fromLocationId: string
  fromLocationName: string
  toLocationId: string
  toLocationName: string
  status: 'draft' | 'pending_approval' | 'approved' | 'in_transit' | 'partial_received' | 'received' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  transferDate: Date
  expectedDeliveryDate: Date
  actualDeliveryDate?: Date
  items: TransferOrderItem[]
  totalItems: number
  totalValue: number
  currency: string
  shippingMethod: 'internal' | 'external' | 'pickup'
  trackingNumber?: string
  carrier?: string
  notes?: string
  reason: string
  approvedBy?: string
  approvedAt?: Date
  createdBy: string
  createdAt: Date
  updatedBy: string
  updatedAt: Date
  attachments?: string[]
}

interface TransferOrderItem {
  id: string
  productId: string
  productName: string
  sku?: string
  description?: string
  quantity: number
  transferredQuantity: number
  receivedQuantity: number
  unit: string
  unitValue: number
  totalValue: number
  notes?: string
  condition: 'good' | 'damaged' | 'expired'
}

interface Location {
  id: string
  name: string
  type: 'warehouse' | 'store' | 'kitchen' | 'office'
  address: string
  city: string
  state: string
  pincode: string
  phone: string
  email: string
  manager: string
  isActive: boolean
  capacity: number
  currentStock: number
}

interface TransferTemplate {
  id: string
  name: string
  description: string
  fromLocationId: string
  toLocationId: string
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

export default function TransferOrders() {
  const [transferOrders, setTransferOrders] = useState<TransferOrder[]>([
    {
      id: '1',
      transferNumber: 'TO-2024-001',
      fromLocationId: '1',
      fromLocationName: 'Main Warehouse',
      toLocationId: '2',
      toLocationName: 'Downtown Store',
      status: 'approved',
      priority: 'normal',
      transferDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      expectedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      items: [
        {
          id: '1',
          productId: '1',
          productName: 'Rice Bags',
          sku: 'RICE-001',
          quantity: 50,
          transferredQuantity: 50,
          receivedQuantity: 0,
          unit: 'bags',
          unitValue: 500,
          totalValue: 25000,
          condition: 'good'
        },
        {
          id: '2',
          productId: '2',
          productName: 'Cooking Oil',
          sku: 'OIL-001',
          quantity: 20,
          transferredQuantity: 20,
          receivedQuantity: 0,
          unit: 'liters',
          unitValue: 150,
          totalValue: 3000,
          condition: 'good'
        }
      ],
      totalItems: 70,
      totalValue: 28000,
      currency: 'INR',
      shippingMethod: 'internal',
      notes: 'Urgent restocking required',
      reason: 'Stock replenishment',
      approvedBy: 'Warehouse Manager',
      approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdBy: 'Inventory Staff',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedBy: 'Warehouse Manager',
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      transferNumber: 'TO-2024-002',
      fromLocationId: '2',
      toLocationId: '3',
      fromLocationName: 'Downtown Store',
      toLocationName: 'Mall Branch',
      status: 'in_transit',
      priority: 'high',
      transferDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      expectedDeliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      items: [
        {
          id: '3',
          productName: 'Snack Boxes',
          sku: 'SNK-001',
          quantity: 100,
          transferredQuantity: 100,
          receivedQuantity: 0,
          unit: 'boxes',
          unitValue: 50,
          totalValue: 5000,
          condition: 'good'
        }
      ],
      totalItems: 100,
      totalValue: 5000,
      currency: 'INR',
      shippingMethod: 'external',
      trackingNumber: 'TRK123456789',
      carrier: 'Fast Delivery Co',
      reason: 'Seasonal demand',
      createdBy: 'Store Manager',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedBy: 'Store Manager',
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      transferNumber: 'TO-2024-003',
      fromLocationId: '1',
      toLocationId: '4',
      fromLocationName: 'Main Warehouse',
      toLocationName: 'Airport Location',
      status: 'partial_received',
      priority: 'urgent',
      transferDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      expectedDeliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      actualDeliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      items: [
        {
          id: '4',
          productName: 'Beverage Cases',
          sku: 'BEV-001',
          quantity: 50,
          transferredQuantity: 50,
          receivedQuantity: 35,
          unit: 'cases',
          unitValue: 800,
          totalValue: 40000,
          condition: 'good'
        }
      ],
      totalItems: 50,
      totalValue: 40000,
      currency: 'INR',
      shippingMethod: 'external',
      trackingNumber: 'TRK987654321',
      carrier: 'Express Logistics',
      notes: 'Some items damaged during transit',
      reason: 'Emergency supply',
      createdBy: 'Warehouse Manager',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedBy: 'Airport Manager',
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ])

  const [locations, setLocations] = useState<Location[]>([
    {
      id: '1',
      name: 'Main Warehouse',
      type: 'warehouse',
      address: '123 Industrial Area',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '+91 22 1234 5678',
      email: 'warehouse@company.com',
      manager: 'Raj Kumar',
      isActive: true,
      capacity: 10000,
      currentStock: 7500
    },
    {
      id: '2',
      name: 'Downtown Store',
      type: 'store',
      address: '456 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400002',
      phone: '+91 22 2345 6789',
      email: 'downtown@company.com',
      manager: 'Amit Singh',
      isActive: true,
      capacity: 2000,
      currentStock: 1200
    },
    {
      id: '3',
      name: 'Mall Branch',
      type: 'store',
      address: '789 Shopping Mall',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400003',
      phone: '+91 22 3456 7890',
      email: 'mall@company.com',
      manager: 'Priya Patel',
      isActive: true,
      capacity: 1500,
      currentStock: 800
    },
    {
      id: '4',
      name: 'Airport Location',
      type: 'store',
      address: 'Terminal 2, International Airport',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400004',
      phone: '+91 22 4567 8901',
      email: 'airport@company.com',
      manager: 'Vikram Mehta',
      isActive: true,
      capacity: 1000,
      currentStock: 600
    }
  ])

  const [templates, setTemplates] = useState<TransferTemplate[]>([
    {
      id: '1',
      name: 'Weekly Store Restock',
      description: 'Standard weekly transfer from warehouse to stores',
      fromLocationId: '1',
      toLocationId: '2',
      items: [
        {
          productId: '1',
          productName: 'Rice Bags',
          quantity: 25,
          unit: 'bags'
        },
        {
          productId: '2',
          productName: 'Cooking Oil',
          quantity: 10,
          unit: 'liters'
        }
      ],
      isDefault: true
    }
  ])

  const [isCreatingTransfer, setIsCreatingTransfer] = useState(false)
  const [editingTransfer, setEditingTransfer] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedFromLocation, setSelectedFromLocation] = useState<string>('all')
  const [selectedToLocation, setSelectedToLocation] = useState<string>('all')
  const [newTransfer, setNewTransfer] = useState<Partial<TransferOrder>>({
    status: 'draft',
    priority: 'normal',
    transferDate: new Date(),
    expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    items: [],
    totalItems: 0,
    totalValue: 0,
    currency: 'INR',
    shippingMethod: 'internal'
  })
  const { toast } = useToast()

  const filteredTransfers = transferOrders.filter(transfer => {
    const statusMatch = selectedStatus === 'all' || transfer.status === selectedStatus
    const fromLocationMatch = selectedFromLocation === 'all' || transfer.fromLocationId === selectedFromLocation
    const toLocationMatch = selectedToLocation === 'all' || transfer.toLocationId === selectedToLocation
    return statusMatch && fromLocationMatch && toLocationMatch
  })

  const handleCreateTransfer = () => {
    if (!newTransfer.fromLocationId || !newTransfer.toLocationId || !newTransfer.items || newTransfer.items.length === 0) {
      toast({
        title: "Validation Error",
        description: "From location, to location, and at least one item are required.",
        variant: "destructive"
      })
      return
    }

    if (newTransfer.fromLocationId === newTransfer.toLocationId) {
      toast({
        title: "Validation Error",
        description: "From and to locations must be different.",
        variant: "destructive"
      })
      return
    }

    const fromLocation = locations.find(l => l.id === newTransfer.fromLocationId)
    const toLocation = locations.find(l => l.id === newTransfer.toLocationId)

    const transfer: TransferOrder = {
      id: Date.now().toString(),
      transferNumber: `TO-2024-${String(transferOrders.length + 1).padStart(3, '0')}`,
      fromLocationId: newTransfer.fromLocationId!,
      fromLocationName: fromLocation?.name || '',
      toLocationId: newTransfer.toLocationId!,
      toLocationName: toLocation?.name || '',
      status: newTransfer.status!,
      priority: newTransfer.priority!,
      transferDate: newTransfer.transferDate!,
      expectedDeliveryDate: newTransfer.expectedDeliveryDate!,
      items: newTransfer.items!,
      totalItems: newTransfer.totalItems!,
      totalValue: newTransfer.totalValue!,
      currency: newTransfer.currency!,
      shippingMethod: newTransfer.shippingMethod!,
      trackingNumber: newTransfer.trackingNumber,
      carrier: newTransfer.carrier,
      notes: newTransfer.notes,
      reason: newTransfer.reason!,
      createdBy: 'Current User',
      createdAt: new Date(),
      updatedBy: 'Current User',
      updatedAt: new Date()
    }

    setTransferOrders(prev => [...prev, transfer])
    setIsCreatingTransfer(false)
    setNewTransfer({
      status: 'draft',
      priority: 'normal',
      transferDate: new Date(),
      expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      items: [],
      totalItems: 0,
      totalValue: 0,
      currency: 'INR',
      shippingMethod: 'internal'
    })

    toast({
      title: "Transfer Order Created",
      description: "New transfer order has been created successfully."
    })
  }

  const handleUpdateTransferStatus = (transferId: string, status: TransferOrder['status']) => {
    setTransferOrders(prev => prev.map(transfer => 
      transfer.id === transferId 
        ? { 
            ...transfer, 
            status,
            updatedAt: new Date(),
            updatedBy: 'Current User',
            ...(status === 'approved' && {
              approvedBy: 'Current User',
              approvedAt: new Date()
            }),
            ...(status === 'received' && {
              actualDeliveryDate: new Date()
            })
          } 
        : transfer
    ))

    toast({
      title: "Transfer Status Updated",
      description: `Transfer order status has been updated to ${status}.`
    })
  }

  const handleDeleteTransfer = (transferId: string) => {
    setTransferOrders(prev => prev.filter(transfer => transfer.id !== transferId))
    toast({
      title: "Transfer Deleted",
      description: "Transfer order has been deleted successfully."
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500'
      case 'pending_approval': return 'bg-yellow-500'
      case 'approved': return 'bg-blue-500'
      case 'in_transit': return 'bg-purple-500'
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

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'warehouse': return <Warehouse className="h-4 w-4" />
      case 'store': return <Store className="h-4 w-4" />
      case 'kitchen': return <Package className="h-4 w-4" />
      case 'office': return <FileText className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const getStatusStats = () => {
    const stats = {
      draft: 0,
      pending_approval: 0,
      approved: 0,
      in_transit: 0,
      partial_received: 0,
      received: 0,
      cancelled: 0,
      total: 0,
      totalValue: 0,
      totalItems: 0
    }

    transferOrders.forEach(transfer => {
      stats[transfer.status]++
      stats.total++
      stats.totalValue += transfer.totalValue
      stats.totalItems += transfer.totalItems
    })

    return stats
  }

  const statusStats = getStatusStats()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Transfer Orders</h2>
          <p className="text-gray-600">Manage stock transfers between locations</p>
        </div>
        <Button onClick={() => setIsCreatingTransfer(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Transfer Order
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
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('in_transit')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.in_transit}</div>
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
            <div className="text-xs text-gray-400">{statusStats.totalItems} items</div>
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
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="partial_received">Partial Received</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label>From:</Label>
              <Select value={selectedFromLocation} onValueChange={setSelectedFromLocation}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label>To:</Label>
              <Select value={selectedToLocation} onValueChange={setSelectedToLocation}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Orders List */}
      <div className="grid gap-4">
        {filteredTransfers.map((transfer) => (
          <Card key={transfer.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{transfer.transferNumber}</CardTitle>
                    <Badge className={getStatusColor(transfer.status)}>
                      {transfer.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(transfer.priority)}>
                      {transfer.priority}
                    </Badge>
                  </div>
                  <CardDescription>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {getLocationIcon(locations.find(l => l.id === transfer.fromLocationId)?.type || 'store')}
                          <span>{transfer.fromLocationName}</span>
                        </div>
                        <ArrowRightLeft className="h-4 w-4" />
                        <div className="flex items-center gap-1">
                          {getLocationIcon(locations.find(l => l.id === transfer.toLocationId)?.type || 'store')}
                          <span>{transfer.toLocationName}</span>
                        </div>
                      </div>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {transfer.transferDate.toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Truck className="h-4 w-4" />
                        Expected: {transfer.expectedDeliveryDate.toLocaleDateString()}
                      </span>
                      {transfer.actualDeliveryDate && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Delivered: {transfer.actualDeliveryDate.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-2xl font-bold">₹{transfer.totalValue.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{transfer.totalItems} items</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {transfer.status === 'draft' && (
                      <Button size="sm" onClick={() => handleUpdateTransferStatus(transfer.id, 'pending_approval')}>
                        Send for Approval
                      </Button>
                    )}
                    {transfer.status === 'pending_approval' && (
                      <Button size="sm" onClick={() => handleUpdateTransferStatus(transfer.id, 'approved')}>
                        Approve
                      </Button>
                    )}
                    {transfer.status === 'approved' && (
                      <Button size="sm" onClick={() => handleUpdateTransferStatus(transfer.id, 'in_transit')}>
                        Start Transfer
                      </Button>
                    )}
                    {transfer.status === 'in_transit' && (
                      <Button size="sm" onClick={() => handleUpdateTransferStatus(transfer.id, 'received')}>
                        Mark Received
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
                      <Button variant="outline" size="sm" onClick={() => handleDeleteTransfer(transfer.id)}>
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
                  {transfer.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Package className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-gray-500">
                            {item.quantity} {item.unit} × ₹{item.unitValue} = ₹{item.totalValue}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span>Transferred: {item.transferredQuantity} {item.unit}</span>
                            <span>Received: {item.receivedQuantity} {item.unit}</span>
                            <span>Condition: {item.condition}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{item.totalValue}</div>
                        <div className="text-sm text-gray-500">
                          {item.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Transfer Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Transfer Information</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Reason:</span>
                        <span>{transfer.reason}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping Method:</span>
                        <span className="capitalize">{transfer.shippingMethod.replace('_', ' ')}</span>
                      </div>
                      {transfer.trackingNumber && (
                        <div className="flex justify-between">
                          <span>Tracking #:</span>
                          <span>{transfer.trackingNumber}</span>
                        </div>
                      )}
                      {transfer.carrier && (
                        <div className="flex justify-between">
                          <span>Carrier:</span>
                          <span>{transfer.carrier}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Order Information</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Created by:</span>
                        <span>{transfer.createdBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created at:</span>
                        <span>{transfer.createdAt.toLocaleDateString()}</span>
                      </div>
                      {transfer.approvedBy && (
                        <div className="flex justify-between">
                          <span>Approved by:</span>
                          <span>{transfer.approvedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Progress</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Items Received</span>
                        <span>
                          {transfer.items.reduce((sum, item) => sum + item.receivedQuantity, 0)} / {transfer.items.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                      </div>
                      <Progress 
                        value={(transfer.items.reduce((sum, item) => sum + item.receivedQuantity, 0) / transfer.items.reduce((sum, item) => sum + item.quantity, 0)) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </div>

                {transfer.notes && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 mb-1">Notes</div>
                    <p className="text-sm text-blue-700">{transfer.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTransfers.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transfer orders found</h3>
              <p className="text-gray-500">No transfer orders match the current filters.</p>
              <Button className="mt-4" onClick={() => setIsCreatingTransfer(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Transfer Order
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Transfer Order Form */}
      {isCreatingTransfer && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardHeader>
            <CardTitle>Create New Transfer Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from-location">From Location</Label>
                <Select
                  value={newTransfer.fromLocationId}
                  onValueChange={(value) => setNewTransfer(prev => ({ ...prev, fromLocationId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select from location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.filter(l => l.isActive).map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        <div className="flex items-center gap-2">
                          {getLocationIcon(location.type)}
                          {location.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="to-location">To Location</Label>
                <Select
                  value={newTransfer.toLocationId}
                  onValueChange={(value) => setNewTransfer(prev => ({ ...prev, toLocationId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select to location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.filter(l => l.isActive).map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        <div className="flex items-center gap-2">
                          {getLocationIcon(location.type)}
                          {location.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newTransfer.priority}
                  onValueChange={(value) => setNewTransfer(prev => ({ ...prev, priority: value as any }))}
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
                <Label htmlFor="shipping-method">Shipping Method</Label>
                <Select
                  value={newTransfer.shippingMethod}
                  onValueChange={(value) => setNewTransfer(prev => ({ ...prev, shippingMethod: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer-date">Transfer Date</Label>
                <Input
                  id="transfer-date"
                  type="date"
                  value={newTransfer.transferDate?.toISOString().split('T')[0]}
                  onChange={(e) => setNewTransfer(prev => ({ ...prev, transferDate: new Date(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expected-delivery">Expected Delivery Date</Label>
                <Input
                  id="expected-delivery"
                  type="date"
                  value={newTransfer.expectedDeliveryDate?.toISOString().split('T')[0]}
                  onChange={(e) => setNewTransfer(prev => ({ ...prev, expectedDeliveryDate: new Date(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Transfer</Label>
                <Select
                  value={newTransfer.reason}
                  onValueChange={(value) => setNewTransfer(prev => ({ ...prev, reason: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Stock replenishment">Stock replenishment</SelectItem>
                    <SelectItem value="Seasonal demand">Seasonal demand</SelectItem>
                    <SelectItem value="Emergency supply">Emergency supply</SelectItem>
                    <SelectItem value="Excess stock">Excess stock</SelectItem>
                    <SelectItem value="Product recall">Product recall</SelectItem>
                    <SelectItem value="Store closure">Store closure</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tracking-number">Tracking Number (Optional)</Label>
                <Input
                  id="tracking-number"
                  value={newTransfer.trackingNumber}
                  onChange={(e) => setNewTransfer(prev => ({ ...prev, trackingNumber: e.target.value }))}
                  placeholder="Enter tracking number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newTransfer.notes}
                onChange={(e) => setNewTransfer(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Enter transfer notes"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateTransfer}>
                <Save className="mr-2 h-4 w-4" />
                Create Transfer
              </Button>
              <Button variant="outline" onClick={() => setIsCreatingTransfer(false)}>
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