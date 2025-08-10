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
  Receipt, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Mail,
  Phone,
  Calendar,
  DollarSign,
  ShoppingCart,
  CreditCard,
  Banknote,
  Printer,
  FileText,
  RefreshCw,
  Smartphone
} from 'lucide-react'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'

interface ReceiptItem {
  id: string
  productId: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  totalPrice: number
  discount?: number
  tax?: number
  category: string
}

interface Receipt {
  id: string
  receiptNumber: string
  orderId: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  items: ReceiptItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: 'cash' | 'card' | 'credit' | 'digital' | 'mixed'
  paymentStatus: 'paid' | 'partial' | 'pending' | 'refunded'
  staffName: string
  location: string
  registerNumber: string
  createdAt: Date
  updatedAt: Date
  notes?: string
  refundedAmount?: number
  refundReason?: string
}

interface ReceiptStats {
  totalReceipts: number
  totalRevenue: number
  averageReceiptValue: number
  refundedReceipts: number
  totalRefunded: number
  topPaymentMethod: string
}

export default function ReceiptsHistory() {
  const [activeTab, setActiveTab] = useState('receipts')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState('today')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [stats, setStats] = useState<ReceiptStats>({
    totalReceipts: 0,
    totalRevenue: 0,
    averageReceiptValue: 0,
    refundedReceipts: 0,
    totalRefunded: 0,
    topPaymentMethod: ''
  })

  // Initialize mock data
  useEffect(() => {
    const mockReceipts: Receipt[] = [
      {
        id: '1',
        receiptNumber: 'RCP-2024-0001',
        orderId: 'ORD-001',
        customerName: 'John Smith',
        customerEmail: 'john.smith@email.com',
        customerPhone: '+1 555-0123',
        items: [
          {
            id: '1',
            productId: 'P001',
            productName: 'Wireless Bluetooth Headphones',
            sku: 'WBH-001',
            quantity: 1,
            unitPrice: 79.99,
            totalPrice: 79.99,
            tax: 6.40,
            category: 'Electronics'
          },
          {
            id: '2',
            productId: 'P002',
            productName: 'Phone Case',
            sku: 'PC-001',
            quantity: 2,
            unitPrice: 15.99,
            totalPrice: 31.98,
            tax: 2.56,
            category: 'Accessories'
          }
        ],
        subtotal: 111.97,
        tax: 8.96,
        discount: 5.00,
        total: 115.93,
        paymentMethod: 'card',
        paymentStatus: 'paid',
        staffName: 'Sarah Johnson',
        location: 'Main Store',
        registerNumber: 'REG-001',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        notes: 'Customer requested gift receipt'
      },
      {
        id: '2',
        receiptNumber: 'RCP-2024-0002',
        orderId: 'ORD-002',
        customerName: 'Emily Brown',
        customerEmail: 'emily.brown@email.com',
        items: [
          {
            id: '3',
            productId: 'P003',
            productName: 'Organic Green Tea',
            sku: 'OGT-002',
            quantity: 3,
            unitPrice: 12.99,
            totalPrice: 38.97,
            tax: 3.12,
            category: 'Food & Beverage'
          }
        ],
        subtotal: 38.97,
        tax: 3.12,
        discount: 0,
        total: 42.09,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        staffName: 'Mike Davis',
        location: 'Main Store',
        registerNumber: 'REG-001',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: '3',
        receiptNumber: 'RCP-2024-0003',
        orderId: 'ORD-003',
        items: [
          {
            id: '4',
            productId: 'P004',
            productName: 'Cotton T-Shirt',
            sku: 'CTS-003',
            quantity: 2,
            unitPrice: 24.99,
            totalPrice: 49.98,
            tax: 4.00,
            category: 'Clothing'
          },
          {
            id: '5',
            productId: 'P005',
            productName: 'Jeans',
            sku: 'JN-001',
            quantity: 1,
            unitPrice: 49.99,
            totalPrice: 49.99,
            tax: 4.00,
            category: 'Clothing'
          }
        ],
        subtotal: 99.97,
        tax: 8.00,
        discount: 10.00,
        total: 97.97,
        paymentMethod: 'digital',
        paymentStatus: 'refunded',
        staffName: 'Sarah Johnson',
        location: 'Main Store',
        registerNumber: 'REG-002',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        refundedAmount: 97.97,
        refundReason: 'Customer return - wrong size'
      }
    ]

    setReceipts(mockReceipts)
    calculateStats(mockReceipts)
  }, [])

  const calculateStats = (receiptList: Receipt[]) => {
    const totalReceipts = receiptList.length
    const totalRevenue = receiptList.reduce((sum, receipt) => sum + receipt.total, 0)
    const averageReceiptValue = totalReceipts > 0 ? totalRevenue / totalReceipts : 0
    const refundedReceipts = receiptList.filter(r => r.paymentStatus === 'refunded').length
    const totalRefunded = receiptList.reduce((sum, receipt) => sum + (receipt.refundedAmount || 0), 0)
    
    // Find most common payment method
    const paymentMethodCounts = receiptList.reduce((acc, receipt) => {
      acc[receipt.paymentMethod] = (acc[receipt.paymentMethod] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topPaymentMethod = Object.entries(paymentMethodCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || ''

    setStats({
      totalReceipts,
      totalRevenue,
      averageReceiptValue,
      refundedReceipts,
      totalRefunded,
      topPaymentMethod
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

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = 
      receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.staffName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDateRange = dateRange === 'all' || 
      isWithinInterval(receipt.createdAt, getDateRange(dateRange))
    
    const matchesPaymentMethod = !paymentMethod || receipt.paymentMethod === paymentMethod
    const matchesPaymentStatus = !paymentStatus || receipt.paymentStatus === paymentStatus
    
    return matchesSearch && matchesDateRange && matchesPaymentMethod && matchesPaymentStatus
  })

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="h-4 w-4" />
      case 'card': return <CreditCard className="h-4 w-4" />
      case 'credit': return <CreditCard className="h-4 w-4" />
      case 'digital': return <Smartphone className="h-4 w-4" />
      case 'mixed': return <DollarSign className="h-4 w-4" />
      default: return <DollarSign className="h-4 w-4" />
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500'
      case 'partial': return 'bg-yellow-500'
      case 'pending': return 'bg-orange-500'
      case 'refunded': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Paid'
      case 'partial': return 'Partial'
      case 'pending': return 'Pending'
      case 'refunded': return 'Refunded'
      default: return 'Unknown'
    }
  }

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt)
    setIsViewOpen(true)
  }

  const handleExportReceipts = () => {
    // Export functionality would be implemented here
    console.log('Exporting receipts...')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receipts History</h1>
          <p className="text-muted-foreground">View and manage all transaction receipts</p>
        </div>
        <Button onClick={handleExportReceipts}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReceipts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Receipt</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${stats.averageReceiptValue.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunds</CardTitle>
            <RefreshCw className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.refundedReceipts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunded Amt</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${stats.totalRefunded.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Payment</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-600 capitalize">
              {stats.topPaymentMethod || 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="receipts">All Receipts</TabsTrigger>
          <TabsTrigger value="refunds">Refunds Only</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="receipts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receipts</CardTitle>
              <CardDescription>View all transaction receipts and their details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by receipt number, customer, or order..."
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
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Methods</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceipts.map(receipt => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium">{receipt.receiptNumber}</TableCell>
                      <TableCell>{format(receipt.createdAt, 'MMM dd, HH:mm')}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{receipt.customerName || 'Guest'}</div>
                          {receipt.customerEmail && (
                            <div className="text-sm text-muted-foreground">{receipt.customerEmail}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{receipt.items.length}</TableCell>
                      <TableCell className="font-medium">${receipt.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getPaymentMethodIcon(receipt.paymentMethod)}
                          <span className="capitalize">{receipt.paymentMethod}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <div className={`w-2 h-2 rounded-full mr-2 ${getPaymentStatusColor(receipt.paymentStatus)}`} />
                          {getPaymentStatusText(receipt.paymentStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell>{receipt.staffName}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewReceipt(receipt)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredReceipts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="mx-auto h-12 w-12 mb-4" />
                  <p>No receipts found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Refunded Receipts</CardTitle>
              <CardDescription>View all refunded transactions and details</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Original Total</TableHead>
                    <TableHead>Refunded</TableHead>
                    <TableHead>Refund Reason</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts
                    .filter(r => r.paymentStatus === 'refunded')
                    .map(receipt => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium">{receipt.receiptNumber}</TableCell>
                      <TableCell>{format(receipt.createdAt, 'MMM dd, HH:mm')}</TableCell>
                      <TableCell>{receipt.customerName || 'Guest'}</TableCell>
                      <TableCell>${receipt.total.toFixed(2)}</TableCell>
                      <TableCell className="text-red-600 font-medium">
                        ${(receipt.refundedAmount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>{receipt.refundReason || 'No reason provided'}</TableCell>
                      <TableCell>{receipt.staffName}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewReceipt(receipt)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {receipts.filter(r => r.paymentStatus === 'refunded').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <RefreshCw className="mx-auto h-12 w-12 mb-4" />
                  <p>No refunded receipts found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['cash', 'card', 'credit', 'digital', 'mixed'].map(method => {
                    const count = receipts.filter(r => r.paymentMethod === method).length
                    const total = receipts.filter(r => r.paymentMethod === method).reduce((sum, r) => sum + r.total, 0)
                    const percentage = receipts.length > 0 ? (count / receipts.length) * 100 : 0
                    
                    return count > 0 ? (
                      <div key={method} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getPaymentMethodIcon(method)}
                          <span className="capitalize">{method}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{count} receipts ({percentage.toFixed(1)}%)</div>
                          <div className="text-sm text-muted-foreground">${total.toFixed(2)}</div>
                        </div>
                      </div>
                    ) : null
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['paid', 'partial', 'pending', 'refunded'].map(status => {
                    const count = receipts.filter(r => r.paymentStatus === status).length
                    const total = receipts.filter(r => r.paymentStatus === status).reduce((sum, r) => sum + r.total, 0)
                    const percentage = receipts.length > 0 ? (count / receipts.length) * 100 : 0
                    
                    return count > 0 ? (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getPaymentStatusColor(status)}`} />
                          <span>{getPaymentStatusText(status)}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{count} receipts ({percentage.toFixed(1)}%)</div>
                          <div className="text-sm text-muted-foreground">${total.toFixed(2)}</div>
                        </div>
                      </div>
                    ) : null
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Receipt View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Receipt Details</DialogTitle>
            <DialogDescription>
              Full receipt information and transaction details
            </DialogDescription>
          </DialogHeader>
          
          {selectedReceipt && (
            <div className="space-y-6">
              {/* Receipt Header */}
              <div className="border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedReceipt.receiptNumber}</h3>
                    <p className="text-sm text-muted-foreground">Order: {selectedReceipt.orderId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {format(selectedReceipt.createdAt, 'MMM dd, yyyy HH:mm')}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      <div className={`w-2 h-2 rounded-full mr-2 ${getPaymentStatusColor(selectedReceipt.paymentStatus)}`} />
                      {getPaymentStatusText(selectedReceipt.paymentStatus)}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Location:</p>
                    <p>{selectedReceipt.location}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Register:</p>
                    <p>{selectedReceipt.registerNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Staff:</p>
                    <p>{selectedReceipt.staffName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment:</p>
                    <div className="flex items-center space-x-2">
                      {getPaymentMethodIcon(selectedReceipt.paymentMethod)}
                      <span className="capitalize">{selectedReceipt.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              {selectedReceipt.customerName && (
                <div>
                  <h4 className="font-medium mb-2">Customer Information</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{selectedReceipt.customerName}</span>
                    </div>
                    {selectedReceipt.customerEmail && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedReceipt.customerEmail}</span>
                      </div>
                    )}
                    {selectedReceipt.customerPhone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedReceipt.customerPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <h4 className="font-medium mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedReceipt.items.map(item => (
                    <div key={item.id} className="flex justify-between items-start p-2 border rounded">
                      <div className="flex-1">
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.sku} • {item.category}
                        </div>
                        <div className="text-sm">
                          {item.quantity} × ${item.unitPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${item.totalPrice.toFixed(2)}</div>
                        {item.discount && (
                          <div className="text-sm text-green-600">
                            -${item.discount.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${selectedReceipt.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${selectedReceipt.tax.toFixed(2)}</span>
                  </div>
                  {selectedReceipt.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-${selectedReceipt.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${selectedReceipt.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Refund Information */}
              {selectedReceipt.refundedAmount && (
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h4 className="font-medium text-red-800 mb-2">Refund Information</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Refunded Amount:</span>
                      <span className="font-medium text-red-600">
                        ${selectedReceipt.refundedAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reason:</span>
                      <span>{selectedReceipt.refundReason || 'No reason provided'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedReceipt.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedReceipt.notes}</p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button onClick={() => setIsViewOpen(false)}>
                  Close
                </Button>
                <Button variant="outline">
                  <Printer className="mr-2 h-4 w-4" />
                  Print Receipt
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}