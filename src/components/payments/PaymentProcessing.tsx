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
import { Checkbox } from '@/components/ui/checkbox'
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Banknote, 
  QrCode,
  Shield,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Settings,
  BarChart3,
  Download,
  Upload
} from 'lucide-react'

interface PaymentMethod {
  id: string
  name: string
  type: 'CARD' | 'UPI' | 'WALLET' | 'CASH' | 'BANK_TRANSFER'
  isActive: boolean
  gateway?: string
  config?: string
  createdAt: string
  updatedAt: string
}

interface Payment {
  id: string
  orderId: string
  amount: number
  method: 'CASH' | 'CARD' | 'UPI' | 'WALLET' | 'BANK_TRANSFER'
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  transactionId?: string
  referenceId?: string
  gatewayResponse?: string
  notes?: string
  customerToken?: string
  maskedCardNumber?: string
  createdAt: string
  updatedAt: string
  order: {
    id: string
    orderNumber: string
    customer?: {
      name: string
      phone: string
    }
  }
}

interface PaymentGateway {
  id: string
  name: string
  type: 'RAZORPAY' | 'STRIPE' | 'PAYPAL' | 'PHONEPE' | 'GPAY'
  isActive: boolean
  config: string
  supportedMethods: string[]
  createdAt: string
  updatedAt: string
}

interface PaymentToken {
  id: string
  customerId: string
  token: string
  maskedCardNumber: string
  cardType: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function PaymentProcessing() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMethod, setFilterMethod] = useState('all')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isProcessPaymentOpen, setIsProcessPaymentOpen] = useState(false)
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)
  const [refundAmount, setRefundAmount] = useState(0)
  const [refundReason, setRefundReason] = useState('')
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    method: 'CASH',
    transactionId: '',
    notes: ''
  })

  // Mock data - in real app, this would come from API
  const [payments] = useState<Payment[]>([
    {
      id: '1',
      orderId: 'order1',
      amount: 1250,
      method: 'CARD',
      status: 'COMPLETED',
      transactionId: 'txn_123456789',
      maskedCardNumber: '**** **** **** 1234',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      order: {
        id: 'order1',
        orderNumber: 'ORD-2024-001',
        customer: {
          name: 'John Doe',
          phone: '+91 9876543210'
        }
      }
    },
    {
      id: '2',
      orderId: 'order2',
      amount: 850,
      method: 'UPI',
      status: 'COMPLETED',
      transactionId: 'upi_987654321',
      createdAt: '2024-01-15T11:45:00Z',
      updatedAt: '2024-01-15T11:45:00Z',
      order: {
        id: 'order2',
        orderNumber: 'ORD-2024-002',
        customer: {
          name: 'Jane Smith',
          phone: '+91 8765432109'
        }
      }
    }
  ])

  const [paymentMethods] = useState<PaymentMethod[]>([
    { id: '1', name: 'Credit/Debit Card', type: 'CARD', isActive: true, gateway: 'razorpay', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: '2', name: 'UPI', type: 'UPI', isActive: true, gateway: 'phonepe', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: '3', name: 'Cash', type: 'CASH', isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: '4', name: 'Digital Wallet', type: 'WALLET', isActive: true, gateway: 'razorpay', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' }
  ])

  const [paymentGateways] = useState<PaymentGateway[]>([
    { id: '1', name: 'Razorpay', type: 'RAZORPAY', isActive: true, config: '{}', supportedMethods: ['CARD', 'UPI', 'WALLET'], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: '2', name: 'PhonePe', type: 'PHONEPE', isActive: true, config: '{}', supportedMethods: ['UPI'], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' }
  ])

  const [paymentTokens] = useState<PaymentToken[]>([
    { id: '1', customerId: 'cust1', token: 'tok_123456', maskedCardNumber: '**** **** **** 1234', cardType: 'VISA', expiryMonth: 12, expiryYear: 2025, isDefault: true, isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' }
  ])

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.order.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus
    const matchesMethod = filterMethod === 'all' || payment.method === filterMethod

    return matchesSearch && matchesStatus && matchesMethod
  })

  // Get payment method icon
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CARD': return <CreditCard className="h-4 w-4" />
      case 'UPI': return <QrCode className="h-4 w-4" />
      case 'WALLET': return <Smartphone className="h-4 w-4" />
      case 'CASH': return <Banknote className="h-4 w-4" />
      case 'BANK_TRANSFER': return <Wallet className="h-4 w-4" />
      default: return <CreditCard className="h-4 w-4" />
    }
  }

  // Get payment status with color
  const getPaymentStatus = (status: string) => {
    const statusMap = {
      'PENDING': { label: 'Pending', color: 'secondary', icon: Clock },
      'COMPLETED': { label: 'Completed', color: 'default', icon: CheckCircle },
      'FAILED': { label: 'Failed', color: 'destructive', icon: XCircle },
      'REFUNDED': { label: 'Refunded', color: 'outline', icon: AlertTriangle }
    }
    return statusMap[status as keyof typeof statusMap] || { label: status, color: 'secondary', icon: Clock }
  }

  // Process payment
  const handleProcessPayment = async () => {
    try {
      // In real app, this would call payment gateway API
      console.log('Processing payment:', newPayment)
      setIsProcessPaymentOpen(false)
      setNewPayment({
        amount: 0,
        method: 'CASH',
        transactionId: '',
        notes: ''
      })
    } catch (error) {
      console.error('Error processing payment:', error)
    }
  }

  // Process refund
  const handleProcessRefund = async () => {
    if (!selectedPayment) return

    try {
      // In real app, this would call payment gateway API
      console.log('Processing refund:', { paymentId: selectedPayment.id, amount: refundAmount, reason: refundReason })
      setIsRefundDialogOpen(false)
      setRefundAmount(0)
      setRefundReason('')
      setSelectedPayment(null)
    } catch (error) {
      console.error('Error processing refund:', error)
    }
  }

  // Calculate payment statistics
  const totalRevenue = payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0)
  const totalRefunds = payments.filter(p => p.status === 'REFUNDED').reduce((sum, p) => sum + p.amount, 0)
  const pendingPayments = payments.filter(p => p.status === 'PENDING').length
  const failedPayments = payments.filter(p => p.status === 'FAILED').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Processing</h1>
          <p className="text-gray-600">Manage payments, gateways, and transactions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsProcessPaymentOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Process Payment
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">₹{totalRefunds.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">Refunded amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedPayments}</div>
            <p className="text-xs text-muted-foreground">Payment failures</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="gateways">Payment Gateways</TabsTrigger>
          <TabsTrigger value="tokens">Saved Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Available payment options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getPaymentMethodIcon(method.type)}
                        <div>
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-gray-500">{method.gateway || 'Direct'}</div>
                        </div>
                      </div>
                      <Badge variant={method.isActive ? 'default' : 'secondary'}>
                        {method.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest payment activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payments.slice(0, 5).map((payment) => {
                    const statusInfo = getPaymentStatus(payment.status)
                    const StatusIcon = statusInfo.icon
                    return (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getPaymentMethodIcon(payment.method)}
                          <div>
                            <div className="font-medium">₹{payment.amount.toLocaleString('en-IN')}</div>
                            <div className="text-sm text-gray-500">{payment.order.orderNumber}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={statusInfo.color as any}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
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
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="WALLET">Wallet</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
              <CardDescription>All payment transactions and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => {
                    const statusInfo = getPaymentStatus(payment.status)
                    const StatusIcon = statusInfo.icon
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.transactionId || 'N/A'}</TableCell>
                        <TableCell>{payment.order.orderNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.order.customer?.name || 'Walk-in'}</div>
                            <div className="text-sm text-gray-500">{payment.order.customer?.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(payment.method)}
                            <span className="capitalize">{payment.method.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>₹{payment.amount.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.color as any}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPayment(payment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {payment.status === 'COMPLETED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPayment(payment)
                                  setIsRefundDialogOpen(true)
                                  setRefundAmount(payment.amount)
                                }}
                              >
                                Refund
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

        <TabsContent value="methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Configure available payment options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getPaymentMethodIcon(method.type)}
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-gray-500">
                          Gateway: {method.gateway || 'Direct Processing'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={method.isActive ? 'default' : 'secondary'}>
                        {method.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gateways" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateways</CardTitle>
              <CardDescription>Manage payment gateway integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentGateways.map((gateway) => (
                  <div key={gateway.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{gateway.name}</div>
                      <div className="text-sm text-gray-500">
                        Type: {gateway.type} | Methods: {gateway.supportedMethods.join(', ')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={gateway.isActive ? 'default' : 'secondary'}>
                        {gateway.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Shield className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Payment Methods</CardTitle>
              <CardDescription>Customer tokenized payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentTokens.map((token) => (
                  <div key={token.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-6 w-6" />
                      <div>
                        <div className="font-medium">{token.maskedCardNumber}</div>
                        <div className="text-sm text-gray-500">
                          {token.cardType} • Expires {token.expiryMonth}/{token.expiryYear}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {token.isDefault && <Badge variant="default">Default</Badge>}
                      <Badge variant={token.isActive ? 'default' : 'secondary'}>
                        {token.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                {paymentTokens.length === 0 && (
                  <p className="text-center text-gray-500">No saved payment methods</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Process Payment Dialog */}
      <Dialog open={isProcessPaymentOpen} onOpenChange={setIsProcessPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>Enter payment details to process a new transaction</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({...newPayment, amount: parseFloat(e.target.value)})}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="method">Payment Method</Label>
              <Select value={newPayment.method} onValueChange={(value) => setNewPayment({...newPayment, method: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CARD">Credit/Debit Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="WALLET">Digital Wallet</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
              <Input
                id="transactionId"
                value={newPayment.transactionId}
                onChange={(e) => setNewPayment({...newPayment, transactionId: e.target.value})}
                placeholder="Enter transaction ID"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={newPayment.notes}
                onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProcessPaymentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProcessPayment}>Process Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>Process refund for payment {selectedPayment?.transactionId}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="refundAmount">Refund Amount (₹)</Label>
              <Input
                id="refundAmount"
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(parseFloat(e.target.value))}
                max={selectedPayment?.amount}
                placeholder="0.00"
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum refundable amount: ₹{selectedPayment?.amount.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <Label htmlFor="refundReason">Refund Reason</Label>
              <Textarea
                id="refundReason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Please provide a reason for the refund..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleProcessRefund}>
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}