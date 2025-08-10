"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Download,
  Upload,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

interface InventoryItem {
  id: string
  name: string
  sku: string
  barcode: string
  category: string
  currentStock: number
  unit: string
  minStockLevel: number
  maxStockLevel: number
  costPrice: number
  sellingPrice: number
  location: string
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK'
  lastUpdated: string
}

interface StockAdjustment {
  id: string
  itemId: string
  itemName: string
  adjustmentType: 'INCREASE' | 'DECREASE' | 'SET'
  previousStock: number
  newStock: number
  adjustmentAmount: number
  reason: string
  notes: string
  adjustedBy: string
  adjustedAt: string
  costImpact: number
}

interface AdjustmentSummary {
  totalAdjustments: number
  increases: number
  decreases: number
  totalValueImpact: number
  lowStockItems: number
  outOfStockItems: number
}

export default function StockAdjustments() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([])
  const [summary, setSummary] = useState<AdjustmentSummary>({
    totalAdjustments: 0,
    increases: 0,
    decreases: 0,
    totalValueImpact: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedAdjustment, setSelectedAdjustment] = useState<StockAdjustment | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Form states
  const [formData, setFormData] = useState({
    itemId: '',
    adjustmentType: '',
    newStock: '',
    reason: '',
    notes: ''
  })

  // Mock data for demonstration
  useEffect(() => {
    const mockInventory: InventoryItem[] = [
      {
        id: '1',
        name: 'Rice Basmati',
        sku: 'RICE001',
        barcode: '8901234567890',
        category: 'Grains',
        currentStock: 45,
        unit: 'kg',
        minStockLevel: 10,
        maxStockLevel: 100,
        costPrice: 80,
        sellingPrice: 120,
        location: 'Warehouse A',
        status: 'IN_STOCK',
        lastUpdated: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        name: 'Wheat Flour',
        sku: 'FLOUR001',
        barcode: '8901234567891',
        category: 'Grains',
        currentStock: 8,
        unit: 'kg',
        minStockLevel: 15,
        maxStockLevel: 80,
        costPrice: 40,
        sellingPrice: 60,
        location: 'Warehouse A',
        status: 'LOW_STOCK',
        lastUpdated: '2024-01-15T09:15:00Z'
      },
      {
        id: '3',
        name: 'Sugar',
        sku: 'SUGAR001',
        barcode: '8901234567892',
        category: 'Sweeteners',
        currentStock: 0,
        unit: 'kg',
        minStockLevel: 5,
        maxStockLevel: 50,
        costPrice: 45,
        sellingPrice: 65,
        location: 'Warehouse B',
        status: 'OUT_OF_STOCK',
        lastUpdated: '2024-01-14T16:45:00Z'
      },
      {
        id: '4',
        name: 'Cooking Oil',
        sku: 'OIL001',
        barcode: '8901234567893',
        category: 'Oils',
        currentStock: 120,
        unit: 'L',
        minStockLevel: 20,
        maxStockLevel: 60,
        costPrice: 150,
        sellingPrice: 200,
        location: 'Warehouse B',
        status: 'OVERSTOCK',
        lastUpdated: '2024-01-15T11:20:00Z'
      }
    ]

    const mockAdjustments: StockAdjustment[] = [
      {
        id: '1',
        itemId: '1',
        itemName: 'Rice Basmati',
        adjustmentType: 'INCREASE',
        previousStock: 40,
        newStock: 45,
        adjustmentAmount: 5,
        reason: 'Purchase Order Received',
        notes: 'Received from supplier XYZ',
        adjustedBy: 'John Smith',
        adjustedAt: '2024-01-15T10:30:00Z',
        costImpact: 400
      },
      {
        id: '2',
        itemId: '2',
        itemName: 'Wheat Flour',
        adjustmentType: 'DECREASE',
        previousStock: 12,
        newStock: 8,
        adjustmentAmount: 4,
        reason: 'Damage/Wastage',
        notes: 'Water damage in storage',
        adjustedBy: 'Jane Doe',
        adjustedAt: '2024-01-15T09:15:00Z',
        costImpact: -160
      },
      {
        id: '3',
        itemId: '3',
        itemName: 'Sugar',
        adjustmentType: 'SET',
        previousStock: 2,
        newStock: 0,
        adjustmentAmount: -2,
        reason: 'Stock Count Correction',
        notes: 'Physical count revealed discrepancy',
        adjustedBy: 'Mike Johnson',
        adjustedAt: '2024-01-14T16:45:00Z',
        costImpact: -90
      }
    ]

    const mockSummary: AdjustmentSummary = {
      totalAdjustments: mockAdjustments.length,
      increases: mockAdjustments.filter(a => a.adjustmentType === 'INCREASE').length,
      decreases: mockAdjustments.filter(a => a.adjustmentType === 'DECREASE' || a.adjustmentType === 'SET').length,
      totalValueImpact: mockAdjustments.reduce((sum, a) => sum + a.costImpact, 0),
      lowStockItems: mockInventory.filter(i => i.status === 'LOW_STOCK').length,
      outOfStockItems: mockInventory.filter(i => i.status === 'OUT_OF_STOCK').length
    }

    setInventory(mockInventory)
    setAdjustments(mockAdjustments)
    setSummary(mockSummary)
    setIsLoading(false)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_STOCK': return 'bg-green-500'
      case 'LOW_STOCK': return 'bg-yellow-500'
      case 'OUT_OF_STOCK': return 'bg-red-500'
      case 'OVERSTOCK': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getAdjustmentTypeColor = (type: string) => {
    switch (type) {
      case 'INCREASE': return 'text-green-600'
      case 'DECREASE': return 'text-red-600'
      case 'SET': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getAdjustmentTypeIcon = (type: string) => {
    switch (type) {
      case 'INCREASE': return <ArrowUp className="h-4 w-4" />
      case 'DECREASE': return <ArrowDown className="h-4 w-4" />
      case 'SET': return <Minus className="h-4 w-4" />
      default: return <Minus className="h-4 w-4" />
    }
  }

  const handleCreateAdjustment = async () => {
    try {
      const item = inventory.find(i => i.id === formData.itemId)
      if (!item) return

      const previousStock = item.currentStock
      const newStock = parseInt(formData.newStock)
      let adjustmentAmount = 0
      let adjustmentType = formData.adjustmentType as 'INCREASE' | 'DECREASE' | 'SET'

      if (adjustmentType === 'SET') {
        adjustmentAmount = newStock - previousStock
      } else if (adjustmentType === 'INCREASE') {
        adjustmentAmount = newStock - previousStock
      } else {
        adjustmentAmount = previousStock - newStock
      }

      const costImpact = adjustmentAmount * item.costPrice

      const newAdjustment: StockAdjustment = {
        id: Date.now().toString(),
        itemId: formData.itemId,
        itemName: item.name,
        adjustmentType,
        previousStock,
        newStock,
        adjustmentAmount,
        reason: formData.reason,
        notes: formData.notes,
        adjustedBy: 'Current User',
        adjustedAt: new Date().toISOString(),
        costImpact
      }

      setAdjustments([newAdjustment, ...adjustments])
      
      // Update inventory
      setInventory(inventory.map(i => 
        i.id === formData.itemId 
          ? { 
              ...i, 
              currentStock: newStock,
              status: getStockStatus(newStock, i.minStockLevel, i.maxStockLevel),
              lastUpdated: new Date().toISOString()
            }
          : i
      ))

      setIsCreateDialogOpen(false)
      resetForm()
      
      // Update summary
      setSummary(prev => ({
        ...prev,
        totalAdjustments: prev.totalAdjustments + 1,
        increases: adjustmentType === 'INCREASE' ? prev.increases + 1 : prev.increases,
        decreases: (adjustmentType === 'DECREASE' || adjustmentType === 'SET') ? prev.decreases + 1 : prev.decreases,
        totalValueImpact: prev.totalValueImpact + costImpact
      }))
    } catch (error) {
      console.error('Error creating adjustment:', error)
    }
  }

  const getStockStatus = (currentStock: number, minStock: number, maxStock: number): 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK' => {
    if (currentStock === 0) return 'OUT_OF_STOCK'
    if (currentStock <= minStock) return 'LOW_STOCK'
    if (currentStock >= maxStock) return 'OVERSTOCK'
    return 'IN_STOCK'
  }

  const resetForm = () => {
    setFormData({
      itemId: '',
      adjustmentType: '',
      newStock: '',
      reason: '',
      notes: ''
    })
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatDateTime = (dateString: string) => {
    return format(parseISO(dateString), 'MMM dd, yyyy HH:mm')
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.barcode.includes(searchTerm)
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const categories = ['all', ...new Set(inventory.map(item => item.category))]
  const statuses = ['all', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'OVERSTOCK']

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Adjustments</h1>
          <p className="text-gray-600">Manage inventory stock levels and adjustments</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              New Adjustment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Stock Adjustment</DialogTitle>
              <DialogDescription>
                Adjust stock levels for inventory items
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="item">Inventory Item</Label>
                <Select value={formData.itemId} onValueChange={(value) => setFormData({...formData, itemId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select inventory item" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventory.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} - {item.sku} (Current: {item.currentStock} {item.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="adjustmentType">Adjustment Type</Label>
                <Select value={formData.adjustmentType} onValueChange={(value) => setFormData({...formData, adjustmentType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select adjustment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCREASE">Increase Stock</SelectItem>
                    <SelectItem value="DECREASE">Decrease Stock</SelectItem>
                    <SelectItem value="SET">Set Exact Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="newStock">New Stock Quantity</Label>
                <Input
                  id="newStock"
                  type="number"
                  placeholder="0"
                  value={formData.newStock}
                  onChange={(e) => setFormData({...formData, newStock: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Select value={formData.reason} onValueChange={(value) => setFormData({...formData, reason: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Purchase Order Received">Purchase Order Received</SelectItem>
                    <SelectItem value="Damage/Wastage">Damage/Wastage</SelectItem>
                    <SelectItem value="Stock Count Correction">Stock Count Correction</SelectItem>
                    <SelectItem value="Transfer In">Transfer In</SelectItem>
                    <SelectItem value="Transfer Out">Transfer Out</SelectItem>
                    <SelectItem value="Theft/Loss">Theft/Loss</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateAdjustment} className="flex-1">
                  Create Adjustment
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Adjustments</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalAdjustments}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Value Impact</p>
                <p className={`text-2xl font-bold ${summary.totalValueImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.totalValueImpact)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.lowStockItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{summary.outOfStockItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="adjustments">Adjustment History</TabsTrigger>
          <TabsTrigger value="alerts">Stock Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Adjustments</CardTitle>
                <CardDescription>Latest stock adjustments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adjustments.slice(0, 5).map((adjustment) => (
                    <div key={adjustment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{adjustment.itemName}</p>
                        <p className="text-sm text-gray-600">
                          {adjustment.adjustmentType} by {Math.abs(adjustment.adjustmentAmount)} units
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(adjustment.adjustedAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center gap-1 ${getAdjustmentTypeColor(adjustment.adjustmentType)}`}>
                          {getAdjustmentTypeIcon(adjustment.adjustmentType)}
                          <span className="text-sm font-medium">
                            {adjustment.adjustmentType === 'INCREASE' ? '+' : ''}
                            {adjustment.adjustmentAmount}
                          </span>
                        </div>
                        <p className={`text-sm ${adjustment.costImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {adjustment.costImpact >= 0 ? '+' : ''}{formatCurrency(adjustment.costImpact)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {adjustments.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No adjustments yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stock Status Summary</CardTitle>
                <CardDescription>Current inventory status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.category}</p>
                        <p className="text-xs text-gray-500">
                          Min: {item.minStockLevel} | Max: {item.maxStockLevel}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(item.status)} text-white`}>
                            {item.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm font-medium">
                            {item.currentStock} {item.unit}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(item.currentStock * item.costPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>View and manage inventory items</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === 'all' ? 'All Status' : status.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{item.name}</div>
                            <div className="text-sm text-gray-500">
                              SKU: {item.sku} | Barcode: {item.barcode}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">{item.currentStock}</span>
                            <span className="text-gray-500"> {item.unit}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Min: {item.minStockLevel} | Max: {item.maxStockLevel}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(item.status)} text-white`}>
                            {item.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{formatCurrency(item.currentStock * item.costPrice)}</div>
                            <div className="text-sm text-gray-500">
                              ₹{item.costPrice}/{item.unit}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setFormData({
                                  itemId: item.id,
                                  adjustmentType: '',
                                  newStock: item.currentStock.toString(),
                                  reason: '',
                                  notes: ''
                                })
                                setIsCreateDialogOpen(true)
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adjustments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adjustment History</CardTitle>
              <CardDescription>Complete history of stock adjustments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Adjustment</TableHead>
                      <TableHead>Previous → New</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Value Impact</TableHead>
                      <TableHead>Adjusted By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adjustments.map((adjustment) => (
                      <TableRow key={adjustment.id}>
                        <TableCell>{formatDateTime(adjustment.adjustedAt)}</TableCell>
                        <TableCell className="font-medium">{adjustment.itemName}</TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 ${getAdjustmentTypeColor(adjustment.adjustmentType)}`}>
                            {getAdjustmentTypeIcon(adjustment.adjustmentType)}
                            <span className="text-sm font-medium">
                              {adjustment.adjustmentType}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${getAdjustmentTypeColor(adjustment.adjustmentType)}`}>
                            {adjustment.adjustmentType === 'INCREASE' ? '+' : ''}
                            {adjustment.adjustmentAmount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="line-through text-gray-500">{adjustment.previousStock}</span>
                            <span className="mx-2">→</span>
                            <span className="font-medium">{adjustment.newStock}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{adjustment.reason}</div>
                            {adjustment.notes && (
                              <div className="text-sm text-gray-500">{adjustment.notes}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${adjustment.costImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {adjustment.costImpact >= 0 ? '+' : ''}{formatCurrency(adjustment.costImpact)}
                          </span>
                        </TableCell>
                        <TableCell>{adjustment.adjustedBy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Low Stock Alerts
                </CardTitle>
                <CardDescription>Items that need restocking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventory.filter(i => i.status === 'LOW_STOCK').map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div>
                        <p className="font-medium text-yellow-900">{item.name}</p>
                        <p className="text-sm text-yellow-700">
                          Current: {item.currentStock} {item.unit} | Minimum: {item.minStockLevel} {item.unit}
                        </p>
                        <p className="text-sm text-yellow-600">
                          Need to order: {item.minStockLevel - item.currentStock} {item.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-yellow-900">
                          {formatCurrency((item.minStockLevel - item.currentStock) * item.costPrice)}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => {
                            setFormData({
                              itemId: item.id,
                              adjustmentType: 'INCREASE',
                              newStock: item.minStockLevel.toString(),
                              reason: 'Restocking',
                              notes: ''
                            })
                            setIsCreateDialogOpen(true)
                          }}
                          className="mt-2"
                        >
                          Restock
                        </Button>
                      </div>
                    </div>
                  ))}
                  {inventory.filter(i => i.status === 'LOW_STOCK').length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-gray-500">No low stock items</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Out of Stock Alerts
                </CardTitle>
                <CardDescription>Items that are completely out of stock</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventory.filter(i => i.status === 'OUT_OF_STOCK').map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div>
                        <p className="font-medium text-red-900">{item.name}</p>
                        <p className="text-sm text-red-700">
                          Category: {item.category} | Location: {item.location}
                        </p>
                        <p className="text-sm text-red-600">
                          Minimum required: {item.minStockLevel} {item.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-900">
                          Urgent: {formatCurrency(item.minStockLevel * item.costPrice)}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => {
                            setFormData({
                              itemId: item.id,
                              adjustmentType: 'INCREASE',
                              newStock: item.minStockLevel.toString(),
                              reason: 'Urgent Restocking',
                              notes: ''
                            })
                            setIsCreateDialogOpen(true)
                          }}
                          className="mt-2 bg-red-600 hover:bg-red-700"
                        >
                          Order Now
                        </Button>
                      </div>
                    </div>
                  ))}
                  {inventory.filter(i => i.status === 'OUT_OF_STOCK').length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-gray-500">No out of stock items</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}