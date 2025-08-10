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
  Camera,
  Scan,
  Clipboard,
  FileText,
  Calendar,
  Users,
  RefreshCw
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
  costPrice: number
  sellingPrice: number
  location: string
  lastUpdated: string
}

interface CountItem {
  id: string
  inventoryItemId: string
  itemName: string
  expectedQuantity: number
  actualQuantity: number
  discrepancy: number
  discrepancyValue: number
  status: 'PENDING' | 'COUNTED' | 'VERIFIED'
  countedBy: string
  countedAt: string
  notes: string
}

interface InventoryCount {
  id: string
  name: string
  description: string
  location: string
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED'
  startDate: string
  endDate: string | null
  createdBy: string
  verifiedBy: string | null
  items: CountItem[]
  totalItems: number
  completedItems: number
  totalDiscrepancies: number
  totalDiscrepancyValue: number
}

interface CountSummary {
  activeCounts: number
  completedCounts: number
  totalDiscrepancies: number
  pendingVerification: number
}

export default function InventoryCounts() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [counts, setCounts] = useState<InventoryCount[]>([])
  const [summary, setSummary] = useState<CountSummary>({
    activeCounts: 0,
    completedCounts: 0,
    totalDiscrepancies: 0,
    pendingVerification: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedCount, setSelectedCount] = useState<InventoryCount | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isScanning, setIsScanning] = useState(false)
  const [scannedBarcode, setScannedBarcode] = useState('')

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    items: [] as string[]
  })

  // Count item form
  const [countItemForm, setCountItemForm] = useState({
    inventoryItemId: '',
    actualQuantity: '',
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
        costPrice: 80,
        sellingPrice: 120,
        location: 'Warehouse A',
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
        costPrice: 40,
        sellingPrice: 60,
        location: 'Warehouse A',
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
        costPrice: 45,
        sellingPrice: 65,
        location: 'Warehouse B',
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
        costPrice: 150,
        sellingPrice: 200,
        location: 'Warehouse B',
        lastUpdated: '2024-01-15T11:20:00Z'
      }
    ]

    const mockCountItems: CountItem[] = [
      {
        id: '1',
        inventoryItemId: '1',
        itemName: 'Rice Basmati',
        expectedQuantity: 45,
        actualQuantity: 42,
        discrepancy: -3,
        discrepancyValue: -240,
        status: 'COUNTED',
        countedBy: 'John Smith',
        countedAt: '2024-01-15T14:30:00Z',
        notes: 'Found some damaged packages'
      },
      {
        id: '2',
        inventoryItemId: '2',
        itemName: 'Wheat Flour',
        expectedQuantity: 8,
        actualQuantity: 8,
        discrepancy: 0,
        discrepancyValue: 0,
        status: 'COUNTED',
        countedBy: 'Jane Doe',
        countedAt: '2024-01-15T14:45:00Z',
        notes: ''
      },
      {
        id: '3',
        inventoryItemId: '3',
        itemName: 'Sugar',
        expectedQuantity: 0,
        actualQuantity: 0,
        discrepancy: 0,
        discrepancyValue: 0,
        status: 'PENDING',
        countedBy: '',
        countedAt: '',
        notes: ''
      }
    ]

    const mockCounts: InventoryCount[] = [
      {
        id: '1',
        name: 'Monthly Stock Count - January 2024',
        description: 'Regular monthly inventory count for all locations',
        location: 'All Warehouses',
        status: 'IN_PROGRESS',
        startDate: '2024-01-15T09:00:00Z',
        endDate: null,
        createdBy: 'Mike Johnson',
        verifiedBy: null,
        items: mockCountItems,
        totalItems: mockCountItems.length,
        completedItems: mockCountItems.filter(i => i.status === 'COUNTED').length,
        totalDiscrepancies: mockCountItems.reduce((sum, i) => sum + Math.abs(i.discrepancy), 0),
        totalDiscrepancyValue: mockCountItems.reduce((sum, i) => sum + Math.abs(i.discrepancyValue), 0)
      },
      {
        id: '2',
        name: 'Year End Inventory Count 2023',
        description: 'Comprehensive year-end inventory audit',
        location: 'All Locations',
        status: 'COMPLETED',
        startDate: '2023-12-28T09:00:00Z',
        endDate: '2023-12-30T17:00:00Z',
        createdBy: 'Sarah Wilson',
        verifiedBy: 'John Smith',
        items: [],
        totalItems: 150,
        completedItems: 150,
        totalDiscrepancies: 12,
        totalDiscrepancyValue: 2850
      }
    ]

    const mockSummary: CountSummary = {
      activeCounts: mockCounts.filter(c => c.status === 'IN_PROGRESS').length,
      completedCounts: mockCounts.filter(c => c.status === 'COMPLETED').length,
      totalDiscrepancies: mockCounts.reduce((sum, c) => sum + c.totalDiscrepancies, 0),
      pendingVerification: mockCounts.filter(c => c.status === 'IN_PROGRESS').length
    }

    setInventory(mockInventory)
    setCounts(mockCounts)
    setSummary(mockSummary)
    setIsLoading(false)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-500'
      case 'IN_PROGRESS': return 'bg-yellow-500'
      case 'COMPLETED': return 'bg-blue-500'
      case 'VERIFIED': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-gray-500'
      case 'COUNTED': return 'bg-blue-500'
      case 'VERIFIED': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const handleCreateCount = async () => {
    try {
      const newCount: InventoryCount = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        location: formData.location,
        status: 'DRAFT',
        startDate: new Date().toISOString(),
        endDate: null,
        createdBy: 'Current User',
        verifiedBy: null,
        items: [],
        totalItems: 0,
        completedItems: 0,
        totalDiscrepancies: 0,
        totalDiscrepancyValue: 0
      }

      setCounts([newCount, ...counts])
      setIsCreateDialogOpen(false)
      resetForm()
      
      // Update summary
      setSummary(prev => ({
        ...prev,
        activeCounts: prev.activeCounts + 1
      }))
    } catch (error) {
      console.error('Error creating count:', error)
    }
  }

  const handleAddCountItem = async (countId: string) => {
    try {
      const item = inventory.find(i => i.id === countItemForm.inventoryItemId)
      if (!item) return

      const count = counts.find(c => c.id === countId)
      if (!count) return

      const actualQuantity = parseInt(countItemForm.actualQuantity)
      const discrepancy = actualQuantity - item.currentStock
      const discrepancyValue = discrepancy * item.costPrice

      const newCountItem: CountItem = {
        id: Date.now().toString(),
        inventoryItemId: item.id,
        itemName: item.name,
        expectedQuantity: item.currentStock,
        actualQuantity,
        discrepancy,
        discrepancyValue,
        status: 'COUNTED',
        countedBy: 'Current User',
        countedAt: new Date().toISOString(),
        notes: countItemForm.notes
      }

      const updatedCounts = counts.map(c => 
        c.id === countId 
          ? {
              ...c,
              items: [...c.items, newCountItem],
              totalItems: c.totalItems + 1,
              completedItems: c.completedItems + 1,
              totalDiscrepancies: c.totalDiscrepancies + Math.abs(discrepancy),
              totalDiscrepancyValue: c.totalDiscrepancyValue + Math.abs(discrepancyValue)
            }
          : c
      )

      setCounts(updatedCounts)
      resetCountItemForm()
    } catch (error) {
      console.error('Error adding count item:', error)
    }
  }

  const handleBarcodeScan = async (barcode: string) => {
    try {
      const item = inventory.find(i => i.barcode === barcode)
      if (item) {
        setCountItemForm({
          inventoryItemId: item.id,
          actualQuantity: '',
          notes: ''
        })
        setScannedBarcode(barcode)
        setIsScanning(false)
      }
    } catch (error) {
      console.error('Error scanning barcode:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      location: '',
      items: []
    })
  }

  const resetCountItemForm = () => {
    setCountItemForm({
      inventoryItemId: '',
      actualQuantity: '',
      notes: ''
    })
    setScannedBarcode('')
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatDateTime = (dateString: string) => {
    return format(parseISO(dateString), 'MMM dd, yyyy HH:mm')
  }

  const filteredCounts = counts.filter(count => {
    const matchesSearch = count.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         count.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || count.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const statuses = ['all', 'DRAFT', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED']

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
          <h1 className="text-2xl font-bold text-gray-900">Inventory Counts</h1>
          <p className="text-gray-600">Manage physical inventory counts and audits</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              New Count
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Inventory Count</DialogTitle>
              <DialogDescription>
                Start a new inventory count process
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Count Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Monthly Stock Count - January 2024"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose and scope of this count..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Warehouse A, All Locations"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateCount} className="flex-1">
                  Create Count
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
                <p className="text-sm font-medium text-gray-600">Active Counts</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.activeCounts}</p>
              </div>
              <Clipboard className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Counts</p>
                <p className="text-2xl font-bold text-green-600">{summary.completedCounts}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Discrepancies</p>
                <p className="text-2xl font-bold text-red-600">{summary.totalDiscrepancies}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Verification</p>
                <p className="text-2xl font-bold text-orange-600">{summary.pendingVerification}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="counts">Active Counts</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="scanner">Barcode Scanner</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Counts</CardTitle>
                <CardDescription>Currently in-progress inventory counts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {counts.filter(c => c.status === 'IN_PROGRESS').map((count) => (
                    <div key={count.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div>
                        <p className="font-medium text-yellow-900">{count.name}</p>
                        <p className="text-sm text-yellow-700">{count.location}</p>
                        <p className="text-xs text-yellow-600">
                          Started: {formatDateTime(count.startDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getStatusColor(count.status)} text-white`}>
                            {count.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-yellow-700">
                          {count.completedItems}/{count.totalItems} items
                        </p>
                        <Button
                          size="sm"
                          onClick={() => setSelectedCount(count)}
                          className="mt-2"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                  {counts.filter(c => c.status === 'IN_PROGRESS').length === 0 && (
                    <div className="text-center py-8">
                      <Clipboard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No active counts</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest count activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {counts.slice(0, 5).map((count) => (
                    <div key={count.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{count.name}</p>
                        <p className="text-sm text-gray-600">{count.location}</p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(count.startDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(count.status)} text-white`}>
                          {count.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {count.completedItems}/{count.totalItems} items
                        </p>
                      </div>
                    </div>
                  ))}
                  {counts.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No counts yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="counts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Counts</CardTitle>
              <CardDescription>Manage all inventory counts</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search counts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
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
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Discrepancies</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCounts.map((count) => (
                      <TableRow key={count.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{count.name}</div>
                            <div className="text-sm text-gray-500">{count.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>{count.location}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(count.status)} text-white`}>
                            {count.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${(count.completedItems / count.totalItems) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">
                                {count.completedItems}/{count.totalItems}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{count.totalDiscrepancies}</div>
                            <div className="text-sm text-gray-500">
                              {formatCurrency(count.totalDiscrepancyValue)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDateTime(count.startDate)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => setSelectedCount(count)}
                            >
                              <Eye className="h-3 w-3" />
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

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Count History</CardTitle>
              <CardDescription>Completed inventory counts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {counts.filter(c => c.status === 'COMPLETED' || c.status === 'VERIFIED').map((count) => (
                  <Card key={count.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{count.name}</h3>
                          <p className="text-sm text-gray-600">{count.description}</p>
                          <p className="text-sm text-gray-500">
                            {formatDateTime(count.startDate)} - {count.endDate ? formatDateTime(count.endDate) : 'In Progress'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${getStatusColor(count.status)} text-white`}>
                              {count.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              Items: {count.completedItems}/{count.totalItems}
                            </p>
                            <p className="text-sm text-gray-600">
                              Discrepancies: {count.totalDiscrepancies}
                            </p>
                            <p className="text-sm text-gray-600">
                              Value: {formatCurrency(count.totalDiscrepancyValue)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {counts.filter(c => c.status === 'COMPLETED' || c.status === 'VERIFIED').length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No completed counts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scanner" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Barcode Scanner</CardTitle>
              <CardDescription>Scan barcodes to quickly count inventory items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Scanner Interface */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {isScanning ? (
                    <div className="space-y-4">
                      <Camera className="h-16 w-16 text-blue-600 mx-auto" />
                      <p className="text-lg font-medium">Scanning for barcodes...</p>
                      <p className="text-gray-600">Point your camera at a barcode</p>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsScanning(false)}
                      >
                        Cancel Scan
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Scan className="h-16 w-16 text-gray-400 mx-auto" />
                      <p className="text-lg font-medium">Ready to Scan</p>
                      <p className="text-gray-600">Click the button below to start scanning</p>
                      <Button 
                        onClick={() => setIsScanning(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Start Scanning
                      </Button>
                    </div>
                  )}
                </div>

                {/* Manual Barcode Entry */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Manual Entry</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter barcode manually"
                      value={scannedBarcode}
                      onChange={(e) => setScannedBarcode(e.target.value)}
                    />
                    <Button 
                      onClick={() => handleBarcodeScan(scannedBarcode)}
                      disabled={!scannedBarcode}
                    >
                      Search
                    </Button>
                  </div>
                </div>

                {/* Count Item Form */}
                {scannedBarcode && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="text-lg font-medium mb-4">Count Item</h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Item</Label>
                        <Select value={countItemForm.inventoryItemId} onValueChange={(value) => setCountItemForm({...countItemForm, inventoryItemId: value})}>
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
                        <Label htmlFor="actualQuantity">Actual Quantity</Label>
                        <Input
                          id="actualQuantity"
                          type="number"
                          placeholder="0"
                          value={countItemForm.actualQuantity}
                          onChange={(e) => setCountItemForm({...countItemForm, actualQuantity: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          placeholder="Any observations or notes..."
                          value={countItemForm.notes}
                          onChange={(e) => setCountItemForm({...countItemForm, notes: e.target.value})}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => {
                            const activeCount = counts.find(c => c.status === 'IN_PROGRESS')
                            if (activeCount) {
                              handleAddCountItem(activeCount.id)
                            }
                          }}
                          disabled={!countItemForm.inventoryItemId || !countItemForm.actualQuantity}
                          className="flex-1"
                        >
                          Add to Count
                        </Button>
                        <Button variant="outline" onClick={resetCountItemForm}>
                          Clear
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Count Details Dialog */}
      {selectedCount && (
        <Dialog open={!!selectedCount} onOpenChange={() => setSelectedCount(null)}>
          <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedCount.name}</DialogTitle>
              <DialogDescription>
                {selectedCount.description}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Count Information */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={`${getStatusColor(selectedCount.status)} text-white`}>
                    {selectedCount.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Location</Label>
                  <p className="font-semibold">{selectedCount.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Started</Label>
                  <p className="font-semibold">{formatDateTime(selectedCount.startDate)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created By</Label>
                  <p className="font-semibold">{selectedCount.createdBy}</p>
                </div>
              </div>

              {/* Progress Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedCount.completedItems}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">{selectedCount.totalItems}</p>
                  <p className="text-sm text-gray-600">Total Items</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{selectedCount.totalDiscrepancies}</p>
                  <p className="text-sm text-gray-600">Discrepancies</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(selectedCount.totalDiscrepancyValue)}</p>
                  <p className="text-sm text-gray-600">Value Impact</p>
                </div>
              </div>

              {/* Count Items */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Count Items</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Expected</TableHead>
                        <TableHead>Actual</TableHead>
                        <TableHead>Discrepancy</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Counted By</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCount.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.itemName}</TableCell>
                          <TableCell>{item.expectedQuantity}</TableCell>
                          <TableCell className="font-medium">{item.actualQuantity}</TableCell>
                          <TableCell>
                            <span className={`font-medium ${item.discrepancy > 0 ? 'text-red-600' : item.discrepancy < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                              {item.discrepancy > 0 ? '+' : ''}{item.discrepancy}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getItemStatusColor(item.status)} text-white`}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.countedBy}</TableCell>
                          <TableCell className="max-w-xs truncate">{item.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedCount(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}