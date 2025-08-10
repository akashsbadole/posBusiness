'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Package,
  Plus,
  Minus,
  Edit,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, subDays } from 'date-fns'

interface InventoryLog {
  id: string
  productId: string
  productName: string
  sku: string
  category: string
  actionType: 'adjustment' | 'purchase' | 'sale' | 'return' | 'transfer_in' | 'transfer_out' | 'count' | 'waste' | 'damage'
  quantityBefore: number
  quantityAfter: number
  quantityChange: number
  unitCost?: number
  totalValue?: number
  reason: string
  staffName: string
  location: string
  referenceNumber?: string
  notes?: string
  createdAt: Date
}

interface InventoryStats {
  totalTransactions: number
  totalValueChange: number
  topProduct: string
  mostActiveStaff: string
  lowStockAlerts: number
  recentAdjustments: number
}

export default function InventoryHistory() {
  const [activeTab, setActiveTab] = useState('history')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState('week')
  const [actionType, setActionType] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [selectedLog, setSelectedLog] = useState<InventoryLog | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [logs, setLogs] = useState<InventoryLog[]>([])
  const [stats, setStats] = useState<InventoryStats>({
    totalTransactions: 0,
    totalValueChange: 0,
    topProduct: '',
    mostActiveStaff: '',
    lowStockAlerts: 0,
    recentAdjustments: 0
  })

  // Initialize mock data
  useEffect(() => {
    const mockLogs: InventoryLog[] = [
      {
        id: '1',
        productId: 'P001',
        productName: 'Wireless Bluetooth Headphones',
        sku: 'WBH-001',
        category: 'Electronics',
        actionType: 'purchase',
        quantityBefore: 15,
        quantityAfter: 40,
        quantityChange: 25,
        unitCost: 45.00,
        totalValue: 1125.00,
        reason: 'Stock replenishment order #PO-001',
        staffName: 'Sarah Johnson',
        location: 'Main Store',
        referenceNumber: 'PO-001',
        notes: 'Bulk purchase from supplier',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '2',
        productId: 'P002',
        productName: 'Organic Green Tea',
        sku: 'OGT-002',
        category: 'Food & Beverage',
        actionType: 'sale',
        quantityBefore: 50,
        quantityAfter: 47,
        quantityChange: -3,
        unitCost: 8.50,
        totalValue: 25.50,
        reason: 'Customer purchase - Order #1234',
        staffName: 'Mike Davis',
        location: 'Main Store',
        referenceNumber: 'ORD-1234',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: '3',
        productId: 'P003',
        productName: 'Cotton T-Shirt',
        sku: 'CTS-003',
        category: 'Clothing',
        actionType: 'adjustment',
        quantityBefore: 100,
        quantityAfter: 95,
        quantityChange: -5,
        unitCost: 12.00,
        totalValue: 60.00,
        reason: 'Inventory count adjustment',
        staffName: 'Emily Brown',
        location: 'Main Store',
        notes: 'Found damaged items during inventory count',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      },
      {
        id: '4',
        productId: 'P004',
        productName: 'Stainless Steel Water Bottle',
        sku: 'SSB-004',
        category: 'Home & Garden',
        actionType: 'transfer_in',
        quantityBefore: 30,
        quantityAfter: 50,
        quantityChange: 20,
        unitCost: 15.00,
        totalValue: 300.00,
        reason: 'Transfer from warehouse',
        staffName: 'John Smith',
        location: 'Main Store',
        referenceNumber: 'TRF-001',
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
      },
      {
        id: '5',
        productId: 'P005',
        productName: 'Phone Case',
        sku: 'PC-001',
        category: 'Accessories',
        actionType: 'return',
        quantityBefore: 25,
        quantityAfter: 27,
        quantityChange: 2,
        unitCost: 8.00,
        totalValue: 16.00,
        reason: 'Customer return - defective item',
        staffName: 'Sarah Johnson',
        location: 'Main Store',
        referenceNumber: 'RET-001',
        notes: 'Customer returned defective phone case',
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000)
      },
      {
        id: '6',
        productId: 'P006',
        productName: 'Yoga Mat',
        sku: 'YM-001',
        category: 'Sports & Fitness',
        actionType: 'waste',
        quantityBefore: 12,
        quantityAfter: 10,
        quantityChange: -2,
        unitCost: 20.00,
        totalValue: 40.00,
        reason: 'Damaged during shipping',
        staffName: 'Mike Davis',
        location: 'Main Store',
        notes: 'Water damage from leak in storage area',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      },
      {
        id: '7',
        productId: 'P007',
        productName: 'Coffee Beans',
        sku: 'CB-001',
        category: 'Food & Beverage',
        actionType: 'count',
        quantityBefore: 45,
        quantityAfter: 42,
        quantityChange: -3,
        unitCost: 12.00,
        totalValue: 36.00,
        reason: 'Weekly inventory count',
        staffName: 'Emily Brown',
        location: 'Main Store',
        notes: 'Discrepancy found during weekly count',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: '8',
        productId: 'P008',
        productName: 'Bluetooth Speaker',
        sku: 'BS-001',
        category: 'Electronics',
        actionType: 'transfer_out',
        quantityBefore: 20,
        quantityAfter: 15,
        quantityChange: -5,
        unitCost: 35.00,
        totalValue: 175.00,
        reason: 'Transfer to downtown store',
        staffName: 'John Smith',
        location: 'Main Store',
        referenceNumber: 'TRF-002',
        createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000)
      }
    ]

    setLogs(mockLogs)
    calculateStats(mockLogs)
  }, [])

  const calculateStats = (logList: InventoryLog[]) => {
    const totalTransactions = logList.length
    const totalValueChange = logList.reduce((sum, log) => sum + (log.totalValue || 0), 0)
    
    // Find most active product
    const productCounts = logList.reduce((acc, log) => {
      acc[log.productName] = (acc[log.productName] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topProduct = Object.entries(productCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || ''

    // Find most active staff
    const staffCounts = logList.reduce((acc, log) => {
      acc[log.staffName] = (acc[log.staffName] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const mostActiveStaff = Object.entries(staffCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || ''

    const lowStockAlerts = logList.filter(log => log.quantityAfter < 10).length
    const recentAdjustments = logList.filter(log => 
      log.actionType === 'adjustment' && 
      isWithinInterval(log.createdAt, { start: subDays(new Date(), 7), end: new Date() })
    ).length

    setStats({
      totalTransactions,
      totalValueChange,
      topProduct,
      mostActiveStaff,
      lowStockAlerts,
      recentAdjustments
    })
  }

  const getDateRange = (range: string) => {
    const now = new Date()
    switch (range) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) }
      case 'week':
        return { start: startOfWeek(now), end: endOfWeek(now) }
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) }
      default:
        return { start: new Date(0), end: now }
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDateRange = dateRange === 'all' || 
      isWithinInterval(log.createdAt, getDateRange(dateRange))
    
    const matchesActionType = !actionType || log.actionType === actionType
    const matchesCategory = !category || log.category === category
    const matchesLocation = !location || log.location === location
    
    return matchesSearch && matchesDateRange && matchesActionType && matchesCategory && matchesLocation
  })

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case 'purchase': return <Plus className="h-4 w-4 text-green-600" />
      case 'sale': return <Minus className="h-4 w-4 text-red-600" />
      case 'return': return <RefreshCw className="h-4 w-4 text-blue-600" />
      case 'adjustment': return <Edit className="h-4 w-4 text-yellow-600" />
      case 'transfer_in': return <Package className="h-4 w-4 text-green-600" />
      case 'transfer_out': return <Package className="h-4 w-4 text-red-600" />
      case 'count': return <CheckCircle className="h-4 w-4 text-purple-600" />
      case 'waste': return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'damage': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <Edit className="h-4 w-4" />
    }
  }

  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case 'purchase': return 'text-green-600 bg-green-50 border-green-200'
      case 'sale': return 'text-red-600 bg-red-50 border-red-200'
      case 'return': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'adjustment': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'transfer_in': return 'text-green-600 bg-green-50 border-green-200'
      case 'transfer_out': return 'text-red-600 bg-red-50 border-red-200'
      case 'count': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'waste': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'damage': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getActionTypeText = (actionType: string) => {
    switch (actionType) {
      case 'purchase': return 'Purchase'
      case 'sale': return 'Sale'
      case 'return': return 'Return'
      case 'adjustment': return 'Adjustment'
      case 'transfer_in': return 'Transfer In'
      case 'transfer_out': return 'Transfer Out'
      case 'count': return 'Count'
      case 'waste': return 'Waste'
      case 'damage': return 'Damage'
      default: return 'Unknown'
    }
  }

  const handleViewLog = (log: InventoryLog) => {
    setSelectedLog(log)
    setIsViewOpen(true)
  }

  const handleExportLogs = () => {
    // Export functionality would be implemented here
    console.log('Exporting inventory logs...')
  }

  const categories = Array.from(new Set(logs.map(log => log.category)))
  const locations = Array.from(new Set(logs.map(log => log.location)))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory History</h1>
          <p className="text-muted-foreground">Track all inventory movements and transactions</p>
        </div>
        <Button onClick={handleExportLogs}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Value Change</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalValueChange.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Product</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-600 truncate">
              {stats.topProduct || 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Active Staff</CardTitle>
            <User className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-600">
              {stats.mostActiveStaff || 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStockAlerts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Adjustments</CardTitle>
            <Edit className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.recentAdjustments}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Transactions</CardTitle>
              <CardDescription>View all inventory movements and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1 min-w-64">
                  <Input
                    placeholder="Search by product, SKU, staff, or reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={actionType} onValueChange={setActionType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Action Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="sale">Sale</SelectItem>
                    <SelectItem value="return">Return</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                    <SelectItem value="transfer_in">Transfer In</SelectItem>
                    <SelectItem value="transfer_out">Transfer Out</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="waste">Waste</SelectItem>
                    <SelectItem value="damage">Damage</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Locations</SelectItem>
                    {locations.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Quantity Change</TableHead>
                      <TableHead>Before/After</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="text-sm">
                            <div>{format(log.createdAt, 'MMM dd, yyyy')}</div>
                            <div className="text-muted-foreground">{format(log.createdAt, 'HH:mm')}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.productName}</div>
                            <div className="text-sm text-muted-foreground">{log.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getActionTypeColor(log.actionType)}>
                            {getActionTypeIcon(log.actionType)}
                            <span className="ml-2">{getActionTypeText(log.actionType)}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className={`font-medium ${log.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {log.quantityChange > 0 ? '+' : ''}{log.quantityChange}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Before: {log.quantityBefore}</div>
                            <div>After: {log.quantityAfter}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.totalValue && (
                            <div className="font-medium">
                              ${log.totalValue.toFixed(2)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{log.staffName}</TableCell>
                        <TableCell>{log.location}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewLog(log)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredLogs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="mx-auto h-12 w-12 mb-4" />
                  <p>No inventory transactions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Action Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['purchase', 'sale', 'return', 'adjustment', 'transfer_in', 'transfer_out', 'count', 'waste', 'damage'].map(action => {
                    const count = logs.filter(l => l.actionType === action).length
                    const totalValue = logs.filter(l => l.actionType === action).reduce((sum, l) => sum + (l.totalValue || 0), 0)
                    const percentage = logs.length > 0 ? (count / logs.length) * 100 : 0
                    
                    return count > 0 ? (
                      <div key={action} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getActionTypeIcon(action)}
                          <span>{getActionTypeText(action)}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{count} transactions ({percentage.toFixed(1)}%)</div>
                          <div className="text-sm text-muted-foreground">${totalValue.toFixed(2)}</div>
                        </div>
                      </div>
                    ) : null
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map(cat => {
                    const categoryLogs = logs.filter(l => l.category === cat)
                    const count = categoryLogs.length
                    const totalValue = categoryLogs.reduce((sum, l) => sum + (l.totalValue || 0), 0)
                    const percentage = logs.length > 0 ? (count / logs.length) * 100 : 0
                    
                    return (
                      <div key={cat} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{cat}</div>
                          <div className="text-sm text-muted-foreground">{count} transactions</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${totalValue.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800">Low Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {logs
                    .filter(log => log.quantityAfter < 10)
                    .slice(0, 5)
                    .map(log => (
                    <div key={log.id} className="flex items-center justify-between p-2 bg-orange-100 rounded">
                      <div>
                        <div className="font-medium text-sm">{log.productName}</div>
                        <div className="text-xs text-orange-600">Stock: {log.quantityAfter}</div>
                      </div>
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">Recent Waste/Damage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {logs
                    .filter(log => log.actionType === 'waste' || log.actionType === 'damage')
                    .slice(0, 5)
                    .map(log => (
                    <div key={log.id} className="flex items-center justify-between p-2 bg-red-100 rounded">
                      <div>
                        <div className="font-medium text-sm">{log.productName}</div>
                        <div className="text-xs text-red-600">{getActionTypeText(log.actionType)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">${(log.totalValue || 0).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800">Recent Adjustments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {logs
                    .filter(log => log.actionType === 'adjustment')
                    .slice(0, 5)
                    .map(log => (
                    <div key={log.id} className="flex items-center justify-between p-2 bg-yellow-100 rounded">
                      <div>
                        <div className="font-medium text-sm">{log.productName}</div>
                        <div className="text-xs text-yellow-600">{log.quantityChange > 0 ? '+' : ''}{log.quantityChange}</div>
                      </div>
                      <Edit className="h-4 w-4 text-yellow-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Log View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inventory Transaction Details</DialogTitle>
            <DialogDescription>
              Complete information about this inventory movement
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6">
              {/* Transaction Header */}
              <div className="border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedLog.productName}</h3>
                    <p className="text-sm text-muted-foreground">SKU: {selectedLog.sku}</p>
                  </div>
                  <Badge variant="outline" className={getActionTypeColor(selectedLog.actionType)}>
                    {getActionTypeIcon(selectedLog.actionType)}
                    <span className="ml-2">{getActionTypeText(selectedLog.actionType)}</span>
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Date & Time:</p>
                    <p>{format(selectedLog.createdAt, 'MMM dd, yyyy HH:mm:ss')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Reference:</p>
                    <p>{selectedLog.referenceNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Staff:</p>
                    <p>{selectedLog.staffName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location:</p>
                    <p>{selectedLog.location}</p>
                  </div>
                </div>
              </div>

              {/* Quantity Information */}
              <div>
                <h4 className="font-medium mb-3">Quantity Information</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-sm text-muted-foreground">Before</div>
                    <div className="text-lg font-semibold">{selectedLog.quantityBefore}</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-sm text-muted-foreground">Change</div>
                    <div className={`text-lg font-semibold ${selectedLog.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedLog.quantityChange > 0 ? '+' : ''}{selectedLog.quantityChange}
                    </div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-sm text-muted-foreground">After</div>
                    <div className="text-lg font-semibold">{selectedLog.quantityAfter}</div>
                  </div>
                </div>
              </div>

              {/* Value Information */}
              {selectedLog.unitCost && (
                <div>
                  <h4 className="font-medium mb-3">Value Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded">
                      <div className="text-sm text-muted-foreground">Unit Cost</div>
                      <div className="font-semibold">${selectedLog.unitCost.toFixed(2)}</div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="text-sm text-muted-foreground">Total Value</div>
                      <div className="font-semibold">${(selectedLog.totalValue || 0).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reason and Notes */}
              <div>
                <h4 className="font-medium mb-2">Reason</h4>
                <p className="text-sm">{selectedLog.reason}</p>
              </div>

              {selectedLog.notes && (
                <div>
                  <h4 className="font-medium mb-2">Additional Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedLog.notes}</p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button onClick={() => setIsViewOpen(false)}>
                  Close
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}