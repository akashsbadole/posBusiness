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
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  AlertTriangle,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Calculator,
  Filter,
  Calendar,
  Warehouse,
  Truck,
  ShoppingCart
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from 'date-fns'

interface InventoryItem {
  id: string
  name: string
  sku: string
  category: string
  currentStock: number
  unitCost: number
  currentUnitValue: number
  totalValue: number
  reorderLevel: number
  maxStock: number
  supplier: string
  lastReceived: Date
  lastSold: Date
  turnoverRate: number
  daysOfStock: number
  status: 'normal' | 'low' | 'overstock' | 'critical'
}

interface ValuationSummary {
  totalInventoryValue: number
  totalItems: number
  totalCategories: number
  lowStockItems: number
  overstockItems: number
  criticalItems: number
  averageTurnoverRate: number
  inventoryAccuracy: number
  totalCostValue: number
  totalCurrentValue: number
  valueChange: number
  valueChangePercentage: number
}

interface CategoryValuation {
  category: string
  itemCount: number
  totalValue: number
  percentage: number
  averageTurnover: number
  lowStockCount: number
  trend: 'up' | 'down' | 'stable'
}

interface ValuationMethod {
  id: string
  name: string
  description: string
  isActive: boolean
  lastCalculated: Date
}

export default function InventoryValuation() {
  const [activeTab, setActiveTab] = useState('overview')
  const [valuationMethod, setValuationMethod] = useState('fifo')
  const [dateRange, setDateRange] = useState('current')
  const [category, setCategory] = useState('')
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [summary, setSummary] = useState<ValuationSummary>({
    totalInventoryValue: 0,
    totalItems: 0,
    totalCategories: 0,
    lowStockItems: 0,
    overstockItems: 0,
    criticalItems: 0,
    averageTurnoverRate: 0,
    inventoryAccuracy: 98.5,
    totalCostValue: 0,
    totalCurrentValue: 0,
    valueChange: 0,
    valueChangePercentage: 0
  })
  const [categoryValuations, setCategoryValuations] = useState<CategoryValuation[]>([])
  const [valuationMethods, setValuationMethods] = useState<ValuationMethod[]>([])

  // Initialize mock data
  useEffect(() => {
    const mockItems: InventoryItem[] = [
      {
        id: '1',
        name: 'Wireless Bluetooth Headphones',
        sku: 'WBH-001',
        category: 'Electronics',
        currentStock: 25,
        unitCost: 45.00,
        currentUnitValue: 79.99,
        totalValue: 1999.75,
        reorderLevel: 10,
        maxStock: 50,
        supplier: 'TechSupplier Inc',
        lastReceived: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        lastSold: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        turnoverRate: 8.5,
        daysOfStock: 45,
        status: 'normal'
      },
      {
        id: '2',
        name: 'Organic Green Tea',
        sku: 'OGT-002',
        category: 'Food & Beverage',
        currentStock: 8,
        unitCost: 8.50,
        currentUnitValue: 12.99,
        totalValue: 103.92,
        reorderLevel: 15,
        maxStock: 100,
        supplier: 'Organic Foods Co',
        lastReceived: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        lastSold: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        turnoverRate: 12.3,
        daysOfStock: 12,
        status: 'low'
      },
      {
        id: '3',
        name: 'Cotton T-Shirt',
        sku: 'CTS-003',
        category: 'Clothing',
        currentStock: 150,
        unitCost: 12.00,
        currentUnitValue: 24.99,
        totalValue: 3748.50,
        reorderLevel: 20,
        maxStock: 80,
        supplier: 'Fashion Wholesale',
        lastReceived: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        lastSold: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        turnoverRate: 4.2,
        daysOfStock: 120,
        status: 'overstock'
      },
      {
        id: '4',
        name: 'Stainless Steel Water Bottle',
        sku: 'SSB-004',
        category: 'Home & Garden',
        currentStock: 35,
        unitCost: 15.00,
        currentUnitValue: 19.99,
        totalValue: 699.65,
        reorderLevel: 20,
        maxStock: 60,
        supplier: 'HomeGoods Supplier',
        lastReceived: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastSold: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        turnoverRate: 6.8,
        daysOfStock: 52,
        status: 'normal'
      },
      {
        id: '5',
        name: 'Phone Case',
        sku: 'PC-001',
        category: 'Accessories',
        currentStock: 3,
        unitCost: 8.00,
        currentUnitValue: 15.99,
        totalValue: 47.97,
        reorderLevel: 25,
        maxStock: 100,
        supplier: 'Accessory World',
        lastReceived: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        lastSold: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        turnoverRate: 15.2,
        daysOfStock: 5,
        status: 'critical'
      },
      {
        id: '6',
        name: 'Yoga Mat',
        sku: 'YM-001',
        category: 'Sports & Fitness',
        currentStock: 18,
        unitCost: 20.00,
        currentUnitValue: 34.99,
        totalValue: 629.82,
        reorderLevel: 15,
        maxStock: 40,
        supplier: 'Fitness Equipment Co',
        lastReceived: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        lastSold: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        turnoverRate: 5.5,
        daysOfStock: 30,
        status: 'normal'
      },
      {
        id: '7',
        name: 'Coffee Beans',
        sku: 'CB-001',
        category: 'Food & Beverage',
        currentStock: 42,
        unitCost: 12.00,
        currentUnitValue: 18.99,
        totalValue: 797.58,
        reorderLevel: 20,
        maxStock: 80,
        supplier: 'Coffee Roasters Ltd',
        lastReceived: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        lastSold: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        turnoverRate: 18.7,
        daysOfStock: 25,
        status: 'normal'
      },
      {
        id: '8',
        name: 'Bluetooth Speaker',
        sku: 'BS-001',
        category: 'Electronics',
        currentStock: 12,
        unitCost: 35.00,
        currentUnitValue: 59.99,
        totalValue: 719.88,
        reorderLevel: 15,
        maxStock: 40,
        supplier: 'AudioTech Solutions',
        lastReceived: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        lastSold: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        turnoverRate: 7.9,
        daysOfStock: 18,
        status: 'low'
      }
    ]

    const mockMethods: ValuationMethod[] = [
      {
        id: 'fifo',
        name: 'FIFO (First In, First Out)',
        description: 'Values inventory using the cost of oldest items first',
        isActive: true,
        lastCalculated: new Date()
      },
      {
        id: 'lifo',
        name: 'LIFO (Last In, First Out)',
        description: 'Values inventory using the cost of most recent items first',
        isActive: false,
        lastCalculated: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: 'weighted',
        name: 'Weighted Average',
        description: 'Values inventory using average cost of all items',
        isActive: false,
        lastCalculated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ]

    setItems(mockItems)
    setValuationMethods(mockMethods)
    calculateSummary(mockItems)
    calculateCategoryValuations(mockItems)
  }, [])

  const calculateSummary = (itemList: InventoryItem[]) => {
    const totalInventoryValue = itemList.reduce((sum, item) => sum + item.totalValue, 0)
    const totalItems = itemList.length
    const categories = Array.from(new Set(itemList.map(item => item.category)))
    const totalCategories = categories.length
    const lowStockItems = itemList.filter(item => item.status === 'low').length
    const overstockItems = itemList.filter(item => item.status === 'overstock').length
    const criticalItems = itemList.filter(item => item.status === 'critical').length
    const averageTurnoverRate = itemList.reduce((sum, item) => sum + item.turnoverRate, 0) / totalItems
    const totalCostValue = itemList.reduce((sum, item) => sum + (item.unitCost * item.currentStock), 0)
    const totalCurrentValue = totalInventoryValue
    const valueChange = totalCurrentValue - totalCostValue
    const valueChangePercentage = totalCostValue > 0 ? (valueChange / totalCostValue) * 100 : 0

    setSummary({
      totalInventoryValue,
      totalItems,
      totalCategories,
      lowStockItems,
      overstockItems,
      criticalItems,
      averageTurnoverRate,
      inventoryAccuracy: 98.5,
      totalCostValue,
      totalCurrentValue,
      valueChange,
      valueChangePercentage
    })
  }

  const calculateCategoryValuations = (itemList: InventoryItem[]) => {
    const categoryMap = new Map<string, InventoryItem[]>()
    
    itemList.forEach(item => {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, [])
      }
      categoryMap.get(item.category)!.push(item)
    })

    const valuations: CategoryValuation[] = Array.from(categoryMap.entries()).map(([category, items]) => {
      const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0)
      const itemCount = items.length
      const averageTurnover = items.reduce((sum, item) => sum + item.turnoverRate, 0) / itemCount
      const lowStockCount = items.filter(item => item.status === 'low' || item.status === 'critical').length
      
      // Simple trend calculation (in real app, this would be based on historical data)
      const trend: 'up' | 'down' | 'stable' = averageTurnover > 8 ? 'up' : averageTurnover < 4 ? 'down' : 'stable'
      
      return {
        category,
        itemCount,
        totalValue,
        percentage: 0, // Will be calculated after
        averageTurnover,
        lowStockCount,
        trend
      }
    })

    // Calculate percentages
    const totalValue = valuations.reduce((sum, val) => sum + val.totalValue, 0)
    valuations.forEach(val => {
      val.percentage = totalValue > 0 ? (val.totalValue / totalValue) * 100 : 0
    })

    setCategoryValuations(valuations)
  }

  const filteredItems = items.filter(item => {
    const matchesCategory = !category || item.category === category
    return matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-500'
      case 'low': return 'bg-yellow-500'
      case 'overstock': return 'bg-blue-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal': return 'Normal'
      case 'low': return 'Low Stock'
      case 'overstock': return 'Overstock'
      case 'critical': return 'Critical'
      default: return 'Unknown'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'stable': return <BarChart3 className="h-4 w-4 text-blue-600" />
      default: return <BarChart3 className="h-4 w-4" />
    }
  }

  const handleViewItem = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsViewOpen(true)
  }

  const handleExportReport = () => {
    // Export functionality would be implemented here
    console.log('Exporting inventory valuation report...')
  }

  const categories = Array.from(new Set(items.map(item => item.category)))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Valuation</h1>
          <p className="text-muted-foreground">Analyze inventory value and optimize stock levels</p>
        </div>
        <div className="flex space-x-2">
          <Select value={valuationMethod} onValueChange={setValuationMethod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {valuationMethods.map(method => (
                <SelectItem key={method.id} value={method.id}>
                  {method.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="flex items-center space-x-1 text-sm">
              {summary.valueChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={summary.valueChange > 0 ? 'text-green-600' : 'text-red-600'}>
                {summary.valueChange > 0 ? '+' : ''}{summary.valueChangePercentage.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalItems}</div>
            <div className="text-sm text-muted-foreground">
              {summary.totalCategories} categories
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {summary.lowStockItems + summary.criticalItems}
            </div>
            <div className="text-sm text-muted-foreground">
              {summary.criticalItems} critical, {summary.lowStockItems} low
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Turnover Rate</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {summary.averageTurnoverRate.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">
              {summary.inventoryAccuracy}% accuracy
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Item Details</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Valuation Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {valuationMethods.map(method => (
                    <div key={method.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-muted-foreground">{method.description}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={method.isActive ? "default" : "secondary"}>
                          {method.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {method.isActive && (
                          <Button variant="outline" size="sm">
                            <Calculator className="mr-2 h-4 w-4" />
                            Recalculate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Cost Value</span>
                    <span className="font-medium">${summary.totalCostValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Value</span>
                    <span className="font-medium">${summary.totalCurrentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Value Change</span>
                    <span className={`font-medium ${summary.valueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {summary.valueChange > 0 ? '+' : ''}${summary.valueChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Overstock Items</span>
                    <span className="font-medium text-blue-600">{summary.overstockItems}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items Valuation</CardTitle>
              <CardDescription>Detailed valuation of all inventory items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-4">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Unit Value</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Turnover</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">{item.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{item.currentStock}</div>
                            <div className="text-muted-foreground">
                              Min: {item.reorderLevel}, Max: {item.maxStock}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>${item.unitCost.toFixed(2)}</TableCell>
                        <TableCell>${item.currentUnitValue.toFixed(2)}</TableCell>
                        <TableCell className="font-medium">
                          ${item.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(item.status)}`} />
                            {getStatusText(item.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.turnoverRate.toFixed(1)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewItem(item)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Valuation</CardTitle>
              <CardDescription>Inventory value breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryValuations.map(category => (
                  <div key={category.category} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{category.category}</div>
                        <div className="text-sm text-muted-foreground">
                          {category.itemCount} items • {category.lowStockCount} need attention
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${category.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {category.percentage.toFixed(1)}% of total
                      </div>
                      <div className="flex items-center justify-end space-x-2 mt-1">
                        {getTrendIcon(category.trend)}
                        <span className="text-sm">Avg turnover: {category.averageTurnover.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Stock Level Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span>Normal Stock</span>
                    </div>
                    <div className="font-medium">
                      {items.filter(i => i.status === 'normal').length} items
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span>Low Stock</span>
                    </div>
                    <div className="font-medium">
                      {items.filter(i => i.status === 'low').length} items
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span>Overstock</span>
                    </div>
                    <div className="font-medium">
                      {items.filter(i => i.status === 'overstock').length} items
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span>Critical</span>
                    </div>
                    <div className="font-medium">
                      {items.filter(i => i.status === 'critical').length} items
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Turnover Rate Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>High Turnover (&gt;12)</span>
                    <div className="font-medium text-green-600">
                      {items.filter(i => i.turnoverRate > 12).length} items
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Good Turnover (6-12)</span>
                    <div className="font-medium text-blue-600">
                      {items.filter(i => i.turnoverRate >= 6 && i.turnoverRate <= 12).length} items
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Low Turnover (3-6)</span>
                    <div className="font-medium text-yellow-600">
                      {items.filter(i => i.turnoverRate >= 3 && i.turnoverRate < 6).length} items
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Poor Turnover (&lt;3)</span>
                    <div className="font-medium text-red-600">
                      {items.filter(i => i.turnoverRate < 3).length} items
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summary.criticalItems > 0 && (
                  <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-800">Critical Stock Alert</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      {summary.criticalItems} items are critically low and need immediate reordering
                    </p>
                  </div>
                )}
                
                {summary.overstockItems > 0 && (
                  <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Overstock Optimization</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      {summary.overstockItems} items are overstocked. Consider promotions or returns to suppliers
                    </p>
                  </div>
                )}
                
                {summary.averageTurnoverRate < 6 && (
                  <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Low Turnover Rate</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      Average turnover rate is {summary.averageTurnoverRate.toFixed(1)}. Review slow-moving items
                    </p>
                  </div>
                )}
                
                <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Positive Value Growth</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Inventory value has increased by {summary.valueChangePercentage.toFixed(1)}% since cost basis
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Item View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inventory Item Details</DialogTitle>
            <DialogDescription>
              Complete valuation and analysis for this item
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-6">
              {/* Item Header */}
              <div className="border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedItem.name}</h3>
                    <p className="text-sm text-muted-foreground">SKU: {selectedItem.sku}</p>
                  </div>
                  <Badge variant="outline" className={`${getStatusColor(selectedItem.status)} text-white`}>
                    {getStatusText(selectedItem.status)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Category:</p>
                    <p>{selectedItem.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Supplier:</p>
                    <p>{selectedItem.supplier}</p>
                  </div>
                </div>
              </div>

              {/* Stock Information */}
              <div>
                <h4 className="font-medium mb-3">Stock Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-sm text-muted-foreground">Current Stock</div>
                    <div className="text-lg font-semibold">{selectedItem.currentStock}</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-sm text-muted-foreground">Days of Stock</div>
                    <div className="text-lg font-semibold">{selectedItem.daysOfStock}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-sm text-muted-foreground">Reorder Level</div>
                    <div className="text-lg font-semibold">{selectedItem.reorderLevel}</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-sm text-muted-foreground">Max Stock</div>
                    <div className="text-lg font-semibold">{selectedItem.maxStock}</div>
                  </div>
                </div>
              </div>

              {/* Valuation Information */}
              <div>
                <h4 className="font-medium mb-3">Valuation Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded">
                    <div className="text-sm text-muted-foreground">Unit Cost</div>
                    <div className="font-semibold">${selectedItem.unitCost.toFixed(2)}</div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="text-sm text-muted-foreground">Unit Value</div>
                    <div className="font-semibold">${selectedItem.currentUnitValue.toFixed(2)}</div>
                  </div>
                </div>
                <div className="mt-4 p-3 border rounded bg-blue-50">
                  <div className="text-sm text-muted-foreground">Total Value</div>
                  <div className="text-xl font-bold text-blue-600">
                    ${selectedItem.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h4 className="font-medium mb-3">Performance Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded">
                    <div className="text-sm text-muted-foreground">Turnover Rate</div>
                    <div className="font-semibold">{selectedItem.turnoverRate.toFixed(1)}</div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="text-sm text-muted-foreground">Last Received</div>
                    <div className="font-semibold">{format(selectedItem.lastReceived, 'MMM dd, yyyy')}</div>
                  </div>
                </div>
                <div className="mt-4 p-3 border rounded">
                  <div className="text-sm text-muted-foreground">Last Sold</div>
                  <div className="font-semibold">{format(selectedItem.lastSold, 'MMM dd, yyyy')}</div>
                </div>
              </div>

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