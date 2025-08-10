'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Printer, 
  Download, 
  Share2, 
  Eye,
  IndianRupee,
  Clock,
  User,
  Phone,
  MapPin,
  Building2,
  FileText,
  Calculator
} from 'lucide-react'

interface GSTBreakdown {
  cgst: number
  sgst: number
  igst: number
  cess: number
  rate: number
}

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  hsnCode?: string
  gstRate?: number
  notes?: string
}

interface Order {
  id: string
  orderNumber: string
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'
  status: string
  customer?: {
    name: string
    phone: string
    address?: string
    gstNumber?: string
    state?: string
  }
  table?: {
    number: number
    capacity: number
  }
  staff: {
    name: string
    role: string
  }
  subtotal: number
  gstAmount: number
  totalAmount: number
  discount: number
  notes?: string
  createdAt: string
  orderItems: OrderItem[]
  restaurant: {
    id: string
    name: string
    address: string
    phone: string
    email: string
    gstNumber?: string
    description?: string
    logo?: string
    website?: string
    fssaiNumber?: string
    tradeName?: string
    state?: string
    stateCode?: string
  }
}

interface GSTInvoicePrintProps {
  order: Order
  onClose?: () => void
}

export default function GSTInvoicePrint({ order, onClose }: GSTInvoicePrintProps) {
  const [isPrinting, setIsPrinting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [invoiceType, setInvoiceType] = useState<'tax' | 'bill_of_supply'>('tax')
  const [reverseCharge, setReverseCharge] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateGSTBreakdown = (item: OrderItem): GSTBreakdown => {
    const rate = item.gstRate || 5 // Default 5% GST
    const taxableValue = item.price * item.quantity
    const cgst = rate / 2
    const sgst = rate / 2
    const igst = rate // For inter-state supplies
    const cess = 0 // No cess by default

    return {
      cgst: (taxableValue * cgst) / 100,
      sgst: (taxableValue * sgst) / 100,
      igst: (taxableValue * igst) / 100,
      cess: (taxableValue * cess) / 100,
      rate
    }
  }

  const isInterStateSupply = () => {
    if (!order.customer?.state || !order.restaurant.stateCode) return false
    return order.customer.state !== order.restaurant.stateCode
  }

  const getPlaceOfSupply = () => {
    if (order.customer?.state) {
      return order.customer.state
    }
    return order.restaurant.state || 'Maharashtra'
  }

  const handlePrint = () => {
    setIsPrinting(true)
    const printContent = document.getElementById('gst-invoice-content')
    if (printContent) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>TAX INVOICE - ${order.orderNumber}</title>
              <style>
                body { 
                  font-family: 'Courier New', monospace; 
                  margin: 0; 
                  padding: 20px; 
                  font-size: 11px;
                  line-height: 1.3;
                  background: white;
                }
                .invoice-header { 
                  text-align: center; 
                  margin-bottom: 20px; 
                  border-bottom: 2px solid #000;
                  padding-bottom: 10px;
                }
                .invoice-title { 
                  font-size: 16px; 
                  font-weight: bold; 
                  margin-bottom: 5px;
                }
                .invoice-subtitle { 
                  font-size: 10px; 
                  margin-bottom: 5px;
                }
                .invoice-details { 
                  margin-bottom: 15px; 
                }
                .invoice-section { 
                  margin-bottom: 12px; 
                }
                .invoice-section-title { 
                  font-weight: bold; 
                  margin-bottom: 3px;
                  border-bottom: 1px solid #ccc;
                  padding-bottom: 1px;
                  font-size: 12px;
                }
                .invoice-table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin-bottom: 12px;
                  font-size: 10px;
                }
                .invoice-table th, 
                .invoice-table td { 
                  border: 1px solid #ccc; 
                  padding: 3px; 
                  text-align: left;
                }
                .invoice-table th { 
                  background-color: #f5f5f5; 
                  font-weight: bold;
                  font-size: 9px;
                }
                .invoice-total { 
                  text-align: right; 
                  font-weight: bold; 
                  margin-top: 8px;
                }
                .invoice-footer { 
                  text-align: center; 
                  margin-top: 15px; 
                  border-top: 1px solid #ccc;
                  padding-top: 8px;
                  font-size: 9px;
                }
                .company-logo {
                  max-width: 60px;
                  max-height: 60px;
                  object-fit: contain;
                }
                .gst-compliance {
                  background-color: #f9f9f9;
                  padding: 8px;
                  border: 1px solid #ddd;
                  margin-bottom: 10px;
                }
                .amount-in-words {
                  font-style: italic;
                  font-size: 10px;
                  margin-bottom: 8px;
                }
                .signature-section {
                  display: flex;
                  justify-content: space-between;
                  margin-top: 20px;
                }
                .signature-box {
                  border-top: 1px solid #ccc;
                  padding-top: 5px;
                  width: 45%;
                  text-align: center;
                  font-size: 9px;
                }
                @media print {
                  body { margin: 0; padding: 8px; }
                  .no-print { display: none; }
                  .invoice-header { text-align: left; }
                  .invoice-header .flex { display: flex !important; }
                  .invoice-header .text-right { text-align: right !important; }
                  .grid { display: grid !important; }
                  .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
                  .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
                  .gap-2 { gap: 0.5rem !important; }
                  .gap-4 { gap: 1rem !important; }
                  .border { border: 1px solid #ccc !important; }
                  .border-t { border-top: 1px solid #ccc !important; }
                  .border-b { border-bottom: 1px solid #ccc !important; }
                  .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
                  .py-3 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
                  .my-2 { margin-top: 0.5rem !important; margin-bottom: 0.5rem !important; }
                  .my-3 { margin-top: 0.75rem !important; margin-bottom: 0.75rem !important; }
                  .mb-2 { margin-bottom: 0.5rem !important; }
                  .mb-4 { margin-bottom: 1rem !important; }
                  .mt-2 { margin-top: 0.5rem !important; }
                  .text-sm { font-size: 11px !important; }
                  .text-xs { font-size: 9px !important; }
                  .font-semibold { font-weight: 600 !important; }
                  .text-left { text-align: left !important; }
                  .text-center { text-align: center !important; }
                  .text-right { text-align: right !important; }
                  .italic { font-style: italic !important; }
                  .items-center { align-items: center !important; }
                  .justify-between { justify-content: space-between !important; }
                  .flex { display: flex !important; }
                  .gap-4 { gap: 1rem !important; }
                  .w-16 { width: 4rem !important; }
                  .h-16 { height: 4rem !important; }
                  .rounded-lg { border-radius: 0.5rem !important; }
                  .bg-gray-200 { background-color: #e5e7eb !important; }
                  .object-contain { object-fit: contain !important; }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
        printWindow.close()
      }
    }
    setIsPrinting(false)
  }

  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([document.getElementById('gst-invoice-content')?.innerHTML || ''], { type: 'text/html' })
    element.href = URL.createObjectURL(file)
    element.download = `gst-invoice-${order.orderNumber}.html`
    element.click()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-500'
      case 'READY': return 'bg-blue-500'
      case 'PREPARING': return 'bg-yellow-500'
      case 'CONFIRMED': return 'bg-purple-500'
      case 'PENDING': return 'bg-gray-500'
      case 'CANCELLED': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
    
    if (num === 0) return 'Zero'
    
    const convert = (n: number): string => {
      if (n < 10) return ones[n]
      if (n < 20) return teens[n - 10]
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '')
      if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '')
      if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '')
      return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '')
    }
    
    return convert(Math.floor(num)) + ' Rupees Only'
  }

  const isInterState = isInterStateSupply()

  return (
    <div className="space-y-4">
      {/* Configuration */}
      <Card className="no-print">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            GST Invoice Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceType">Invoice Type</Label>
              <Select value={invoiceType} onValueChange={(value: 'tax' | 'bill_of_supply') => setInvoiceType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tax">Tax Invoice</SelectItem>
                  <SelectItem value="bill_of_supply">Bill of Supply</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reverseCharge">Reverse Charge</Label>
              <Select value={reverseCharge ? 'yes' : 'no'} onValueChange={(value) => setReverseCharge(value === 'yes')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 no-print">
        <Button onClick={handlePrint} disabled={isPrinting}>
          <Printer className="mr-2 h-4 w-4" />
          {isPrinting ? 'Printing...' : 'Print GST Invoice'}
        </Button>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
          <Eye className="mr-2 h-4 w-4" />
          {showPreview ? 'Hide' : 'Show'} Preview
        </Button>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Invoice Preview */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              GST Invoice Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div id="gst-invoice-content" className="bg-white p-6 border rounded-lg">
              {/* Invoice Header */}
              <div className="invoice-header">
                <div className="flex items-center justify-between mb-4">
                  {/* Company Logo */}
                  <div className="flex items-center gap-4">
                    {order.restaurant.logo ? (
                      <img 
                        src={order.restaurant.logo} 
                        alt={order.restaurant.name}
                        className="w-16 h-16 object-contain company-logo"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <div className="invoice-title text-left">{order.restaurant.tradeName || order.restaurant.name}</div>
                      {order.restaurant.description && (
                        <div className="invoice-subtitle text-left italic">{order.restaurant.description}</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Invoice Title */}
                  <div className="text-right">
                    <div className="invoice-title">
                      {invoiceType === 'tax' ? 'TAX INVOICE' : 'BILL OF SUPPLY'}
                    </div>
                    <div className="invoice-subtitle">Original for Recipient</div>
                  </div>
                </div>
                
                {/* Company Details */}
                <div className="border-t border-b py-3 my-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <div><strong>Address:</strong> {order.restaurant.address}</div>
                      <div><strong>Phone:</strong> {order.restaurant.phone}</div>
                      {order.restaurant.email && (
                        <div><strong>Email:</strong> {order.restaurant.email}</div>
                      )}
                      {order.restaurant.website && (
                        <div><strong>Website:</strong> {order.restaurant.website}</div>
                      )}
                    </div>
                    <div>
                      {order.restaurant.gstNumber && (
                        <div><strong>GSTIN:</strong> {order.restaurant.gstNumber}</div>
                      )}
                      {order.restaurant.stateCode && (
                        <div><strong>State Code:</strong> {order.restaurant.stateCode}</div>
                      )}
                      {order.restaurant.fssaiNumber && (
                        <div><strong>FSSAI License:</strong> {order.restaurant.fssaiNumber}</div>
                      )}
                      <div><strong>Invoice #:</strong> {order.orderNumber}</div>
                      <div><strong>Date:</strong> {formatDate(order.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* GST Compliance Section */}
              {invoiceType === 'tax' && (
                <div className="gst-compliance">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div><strong>Place of Supply:</strong> {getPlaceOfSupply()}</div>
                      <div><strong>Reverse Charge:</strong> {reverseCharge ? 'Yes' : 'No'}</div>
                    </div>
                    <div>
                      <div><strong>Supply Type:</strong> {isInterState ? 'Inter-State' : 'Intra-State'}</div>
                      <div><strong>Invoice Type:</strong> Regular</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Invoice Details */}
              <div className="invoice-details">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="invoice-section-title">Order Information</div>
                    <div><strong>Order Type:</strong> {order.orderType.replace('_', ' ')}</div>
                    <div>
                      <strong>Status:</strong>{' '}
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="invoice-section-title">Staff Details</div>
                    <div><strong>Name:</strong> {order.staff.name}</div>
                    <div><strong>Role:</strong> {order.staff.role}</div>
                  </div>
                </div>

                {order.customer && (
                  <div className="invoice-section">
                    <div className="invoice-section-title">Customer Details</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div><strong>Name:</strong> {order.customer.name || 'N/A'}</div>
                        <div><strong>Phone:</strong> {order.customer.phone || 'N/A'}</div>
                        {order.customer.gstNumber && (
                          <div><strong>Customer GSTIN:</strong> {order.customer.gstNumber}</div>
                        )}
                      </div>
                      {order.customer.address && (
                        <div>
                          <div><strong>Address:</strong> {order.customer.address}</div>
                          {order.customer.state && (
                            <div><strong>State:</strong> {order.customer.state}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {order.table && (
                  <div className="invoice-section">
                    <div className="invoice-section-title">Table Details</div>
                    <div><strong>Table:</strong> {order.table.number} (Capacity: {order.table.capacity})</div>
                  </div>
                )}

                {order.notes && (
                  <div className="invoice-section">
                    <div className="invoice-section-title">Notes</div>
                    <div>{order.notes}</div>
                  </div>
                )}
              </div>

              {/* Order Items with GST Breakdown */}
              <div className="invoice-section">
                <div className="invoice-section-title">Order Items</div>
                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th>HSN Code</th>
                      <th>Item Description</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      {invoiceType === 'tax' && <th>GST Rate</th>}
                      {invoiceType === 'tax' && <th>Taxable Value</th>}
                      {invoiceType === 'tax' && isInterState && <th>IGST</th>}
                      {invoiceType === 'tax' && !isInterState && (
                        <>
                          <th>CGST</th>
                          <th>SGST</th>
                        </>
                      )}
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderItems.map((item, index) => {
                      const gst = calculateGSTBreakdown(item)
                      const taxableValue = item.price * item.quantity
                      
                      return (
                        <tr key={item.id}>
                          <td>{item.hsnCode || 'N/A'}</td>
                          <td>
                            <div>{item.name}</div>
                            {item.notes && (
                              <div style={{ fontSize: '9px', color: '#666' }}>
                                Note: {item.notes}
                              </div>
                            )}
                          </td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.price)}</td>
                          {invoiceType === 'tax' && <td>{gst.rate}%</td>}
                          {invoiceType === 'tax' && <td>{formatCurrency(taxableValue)}</td>}
                          {invoiceType === 'tax' && isInterState && (
                            <td>{formatCurrency(gst.igst)}</td>
                          )}
                          {invoiceType === 'tax' && !isInterState && (
                            <>
                              <td>{formatCurrency(gst.cgst)}</td>
                              <td>{formatCurrency(gst.sgst)}</td>
                            </>
                          )}
                          <td>{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="invoice-section">
                <div className="invoice-section-title">Summary</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="amount-in-words">
                      <strong>Amount in Words:</strong> {numberToWords(order.totalAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="invoice-total">
                      <div>Subtotal: {formatCurrency(order.subtotal)}</div>
                      {invoiceType === 'tax' && (
                        <div>GST Amount: {formatCurrency(order.gstAmount)}</div>
                      )}
                      {order.discount > 0 && (
                        <div>Discount: {formatCurrency(order.discount)}</div>
                      )}
                      <div><strong>Total: {formatCurrency(order.totalAmount)}</strong></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature Section */}
              <div className="signature-section">
                <div className="signature-box">
                  <div>Customer Signature</div>
                </div>
                <div className="signature-box">
                  <div>Authorized Signatory</div>
                  <div>{order.restaurant.tradeName || order.restaurant.name}</div>
                </div>
              </div>

              {/* Footer */}
              <div className="invoice-footer">
                <div>This is a computer generated invoice and does not require a signature.</div>
                <div>GST Compliant Invoice | Subject to Mumbai Jurisdiction</div>
                <div>{order.restaurant.name} | {order.restaurant.phone}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}