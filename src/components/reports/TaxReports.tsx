'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Download, FileText, Calculator, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Filter, Eye } from 'lucide-react'
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'

interface TaxReport {
  id: string
  reportType: 'GST' | 'VAT' | 'Sales Tax' | 'Income Tax'
  period: string
  totalRevenue: number
  totalTax: number
  taxableAmount: number
  exemptAmount: number
  igst: number
  cgst: number
  sgst: number
  cess: number
  status: 'DRAFT' | 'FILED' | 'PAID' | 'OVERDUE'
  dueDate: string
  filedDate?: string
  paidDate?: string
  createdAt: string
}

interface TaxTransaction {
  id: string
  invoiceNumber: string
  date: string
  customerName: string
  amount: number
  taxAmount: number
  taxRate: number
  taxType: 'CGST' | 'SGST' | 'IGST' | 'CESS'
  hsnCode?: string
  sacCode?: string
  isReverseCharge: boolean
  isExport: boolean
  isExempt: boolean
}

export default function TaxReports() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<TaxReport | null>(null)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [reportType, setReportType] = useState<'GST' | 'VAT' | 'Sales Tax' | 'Income Tax'>('GST')
  const [taxTransactions, setTaxTransactions] = useState<TaxTransaction[]>([])
  const [reports, setReports] = useState<TaxReport[]>([])
  const [filters, setFilters] = useState({
    taxType: '',
    hsnCode: '',
    customerName: '',
    minAmount: '',
    maxAmount: ''
  })

  // Mock data for demonstration
  useEffect(() => {
    const mockReports: TaxReport[] = [
      {
        id: '1',
        reportType: 'GST',
        period: 'Oct 2024',
        totalRevenue: 1250000,
        totalTax: 225000,
        taxableAmount: 1000000,
        exemptAmount: 250000,
        igst: 0,
        cgst: 90000,
        sgst: 90000,
        cess: 45000,
        status: 'DRAFT',
        dueDate: '2024-11-20',
        createdAt: '2024-10-01'
      },
      {
        id: '2',
        reportType: 'GST',
        period: 'Sep 2024',
        totalRevenue: 1180000,
        totalTax: 212400,
        taxableAmount: 950000,
        exemptAmount: 230000,
        igst: 0,
        cgst: 85500,
        sgst: 85500,
        cess: 41400,
        status: 'FILED',
        dueDate: '2024-10-20',
        filedDate: '2024-10-18',
        createdAt: '2024-09-01'
      },
      {
        id: '3',
        reportType: 'GST',
        period: 'Aug 2024',
        totalRevenue: 1320000,
        totalTax: 237600,
        taxableAmount: 1080000,
        exemptAmount: 240000,
        igst: 0,
        cgst: 97200,
        sgst: 97200,
        cess: 43200,
        status: 'PAID',
        dueDate: '2024-09-20',
        filedDate: '2024-09-19',
        paidDate: '2024-09-25',
        createdAt: '2024-08-01'
      }
    ]

    const mockTransactions: TaxTransaction[] = [
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        date: '2024-10-15',
        customerName: 'ABC Corporation',
        amount: 50000,
        taxAmount: 9000,
        taxRate: 18,
        taxType: 'CGST',
        hsnCode: '8471',
        isReverseCharge: false,
        isExport: false,
        isExempt: false
      },
      {
        id: '2',
        invoiceNumber: 'INV-2024-002',
        date: '2024-10-14',
        customerName: 'XYZ Industries',
        amount: 75000,
        taxAmount: 13500,
        taxRate: 18,
        taxType: 'SGST',
        hsnCode: '8471',
        isReverseCharge: false,
        isExport: false,
        isExempt: false
      },
      {
        id: '3',
        invoiceNumber: 'INV-2024-003',
        date: '2024-10-13',
        customerName: 'Global Exports Ltd',
        amount: 100000,
        taxAmount: 0,
        taxRate: 0,
        taxType: 'IGST',
        hsnCode: '8471',
        isReverseCharge: false,
        isExport: true,
        isExempt: true
      }
    ]

    setReports(mockReports)
    setTaxTransactions(mockTransactions)
    setSelectedReport(mockReports[0])
    setIsLoading(false)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'FILED': return 'bg-blue-100 text-blue-800'
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'OVERDUE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <FileText className="h-4 w-4" />
      case 'FILED': return <CheckCircle className="h-4 w-4" />
      case 'PAID': return <CheckCircle className="h-4 w-4" />
      case 'OVERDUE': return <AlertTriangle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const filteredTransactions = taxTransactions.filter(transaction => {
    if (filters.taxType && transaction.taxType !== filters.taxType) return false
    if (filters.hsnCode && transaction.hsnCode !== filters.hsnCode) return false
    if (filters.customerName && !transaction.customerName.toLowerCase().includes(filters.customerName.toLowerCase())) return false
    if (filters.minAmount && transaction.amount < parseFloat(filters.minAmount)) return false
    if (filters.maxAmount && transaction.amount > parseFloat(filters.maxAmount)) return false
    return true
  })

  const generateTaxReport = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newReport: TaxReport = {
        id: Date.now().toString(),
        reportType,
        period: format(new Date(), 'MMM yyyy'),
        totalRevenue: filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
        totalTax: filteredTransactions.reduce((sum, t) => sum + t.taxAmount, 0),
        taxableAmount: filteredTransactions.filter(t => !t.isExempt).reduce((sum, t) => sum + t.amount, 0),
        exemptAmount: filteredTransactions.filter(t => t.isExempt).reduce((sum, t) => sum + t.amount, 0),
        igst: filteredTransactions.filter(t => t.taxType === 'IGST').reduce((sum, t) => sum + t.taxAmount, 0),
        cgst: filteredTransactions.filter(t => t.taxType === 'CGST').reduce((sum, t) => sum + t.taxAmount, 0),
        sgst: filteredTransactions.filter(t => t.taxType === 'SGST').reduce((sum, t) => sum + t.taxAmount, 0),
        cess: filteredTransactions.filter(t => t.taxType === 'CESS').reduce((sum, t) => sum + t.taxAmount, 0),
        status: 'DRAFT',
        dueDate: format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 20), 'yyyy-MM-dd'),
        createdAt: new Date().toISOString()
      }
      
      setReports([newReport, ...reports])
      setSelectedReport(newReport)
    } catch (error) {
      console.error('Error generating tax report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = (format: 'PDF' | 'Excel' | 'CSV') => {
    if (!selectedReport) return
    
    // Simulate export functionality
    const data = {
      report: selectedReport,
      transactions: filteredTransactions,
      exportFormat: format
    }
    
    console.log('Exporting report:', data)
    // In a real app, this would generate and download the file
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Tax Reports</h1>
          <p className="text-gray-600">Generate and manage tax compliance reports</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generateTaxReport} disabled={isLoading}>
            <Calculator className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="filing">Filing Status</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Report Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Select Report Period
              </CardTitle>
              <CardDescription>Choose a tax report period to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map((report) => (
                  <Card 
                    key={report.id} 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedReport?.id === report.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{report.period}</h3>
                          <p className="text-sm text-gray-600">{report.reportType}</p>
                        </div>
                        <Badge className={getStatusColor(report.status)}>
                          {getStatusIcon(report.status)}
                          <span className="ml-1">{report.status}</span>
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total Revenue:</span>
                          <span className="font-medium">{formatCurrency(report.totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total Tax:</span>
                          <span className="font-medium">{formatCurrency(report.totalTax)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Due Date:</span>
                          <span className="font-medium">{format(new Date(report.dueDate), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Report Details */}
          {selectedReport && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tax Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Tax Summary - {selectedReport.period}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Total Revenue</Label>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(selectedReport.totalRevenue)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Total Tax</Label>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(selectedReport.totalTax)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Taxable Amount:</span>
                      <span className="font-medium">{formatCurrency(selectedReport.taxableAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Exempt Amount:</span>
                      <span className="font-medium">{formatCurrency(selectedReport.exemptAmount)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm">CGST:</span>
                        <span className="font-medium">{formatCurrency(selectedReport.cgst)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">SGST:</span>
                        <span className="font-medium">{formatCurrency(selectedReport.sgst)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">IGST:</span>
                        <span className="font-medium">{formatCurrency(selectedReport.igst)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">CESS:</span>
                        <span className="font-medium">{formatCurrency(selectedReport.cess)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportReport('PDF')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportReport('Excel')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportReport('CSV')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Filing Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Filing Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Status:</span>
                    <Badge className={getStatusColor(selectedReport.status)}>
                      {getStatusIcon(selectedReport.status)}
                      <span className="ml-1">{selectedReport.status}</span>
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Due Date:</span>
                      <span className="font-medium">{format(new Date(selectedReport.dueDate), 'MMM dd, yyyy')}</span>
                    </div>
                    
                    {selectedReport.filedDate && (
                      <div className="flex justify-between">
                        <span className="text-sm">Filed Date:</span>
                        <span className="font-medium">{format(new Date(selectedReport.filedDate), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                    
                    {selectedReport.paidDate && (
                      <div className="flex justify-between">
                        <span className="text-sm">Paid Date:</span>
                        <span className="font-medium">{format(new Date(selectedReport.paidDate), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                  </div>

                  {selectedReport.status === 'DRAFT' && (
                    <div className="pt-4 space-y-2">
                      <Button className="w-full">
                        File Return
                      </Button>
                      <Button variant="outline" className="w-full">
                        Save as Draft
                      </Button>
                    </div>
                  )}

                  {selectedReport.status === 'FILED' && (
                    <div className="pt-4">
                      <Button className="w-full">
                        Mark as Paid
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Transaction Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="taxType">Tax Type</Label>
                  <Select value={filters.taxType} onValueChange={(value) => setFilters({...filters, taxType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tax type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="CGST">CGST</SelectItem>
                      <SelectItem value="SGST">SGST</SelectItem>
                      <SelectItem value="IGST">IGST</SelectItem>
                      <SelectItem value="CESS">CESS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="hsnCode">HSN/SAC Code</Label>
                  <Input
                    id="hsnCode"
                    placeholder="Enter HSN/SAC code"
                    value={filters.hsnCode}
                    onChange={(e) => setFilters({...filters, hsnCode: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    value={filters.customerName}
                    onChange={(e) => setFilters({...filters, customerName: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="minAmount">Min Amount</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    placeholder="0"
                    value={filters.minAmount}
                    onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="maxAmount">Max Amount</Label>
                  <Input
                    id="maxAmount"
                    type="number"
                    placeholder="100000"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                  />
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({
                      taxType: '',
                      hsnCode: '',
                      customerName: '',
                      minAmount: '',
                      maxAmount: ''
                    })}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Transactions</CardTitle>
              <CardDescription>
                Showing {filteredTransactions.length} transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Invoice</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Customer</th>
                      <th className="text-right p-2">Amount</th>
                      <th className="text-right p-2">Tax</th>
                      <th className="text-center p-2">Type</th>
                      <th className="text-center p-2">HSN</th>
                      <th className="text-center p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{transaction.invoiceNumber}</td>
                        <td className="p-2">{format(new Date(transaction.date), 'MMM dd, yyyy')}</td>
                        <td className="p-2">{transaction.customerName}</td>
                        <td className="p-2 text-right">{formatCurrency(transaction.amount)}</td>
                        <td className="p-2 text-right">{formatCurrency(transaction.taxAmount)}</td>
                        <td className="p-2 text-center">
                          <Badge variant="outline">{transaction.taxType}</Badge>
                        </td>
                        <td className="p-2 text-center">{transaction.hsnCode}</td>
                        <td className="p-2 text-center">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{report.period}</span>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{report.reportType} Return</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Revenue:</span>
                      <span>{formatCurrency(report.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax Payable:</span>
                      <span>{formatCurrency(report.totalTax)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Due Date:</span>
                      <span>{format(new Date(report.dueDate), 'MMM dd')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {report.status === 'DRAFT' && (
                      <Button size="sm" className="flex-1">
                        File Now
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}