'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Building2
} from 'lucide-react'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
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
  }
}

interface InvoicePrintProps {
  order: Order
  onClose?: () => void
}

export default function InvoicePrint({ order, onClose }: InvoicePrintProps) {
  const [isPrinting, setIsPrinting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

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

  const handlePrint = () => {
    setIsPrinting(true)
    const printContent = document.getElementById('invoice-content')
    if (printContent) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoice - ${order.orderNumber}</title>
              <style>
                body { 
                  font-family: 'Courier New', monospace; 
                  margin: 0; 
                  padding: 20px; 
                  font-size: 12px;
                  line-height: 1.4;
                }
                .invoice-header { 
                  text-align: center; 
                  margin-bottom: 20px; 
                  border-bottom: 2px solid #000;
                  padding-bottom: 10px;
                }
                .invoice-title { 
                  font-size: 18px; 
                  font-weight: bold; 
                  margin-bottom: 5px;
                }
                .invoice-subtitle { 
                  font-size: 12px; 
                  margin-bottom: 5px;
                }
                .invoice-details { 
                  margin-bottom: 20px; 
                }
                .invoice-section { 
                  margin-bottom: 15px; 
                }
                .invoice-section-title { 
                  font-weight: bold; 
                  margin-bottom: 5px;
                  border-bottom: 1px solid #ccc;
                  padding-bottom: 2px;
                }
                .invoice-table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin-bottom: 15px;
                }
                .invoice-table th, 
                .invoice-table td { 
                  border: 1px solid #ccc; 
                  padding: 5px; 
                  text-align: left;
                }
                .invoice-table th { 
                  background-color: #f5f5f5; 
                  font-weight: bold;
                }
                .invoice-total { 
                  text-align: right; 
                  font-weight: bold; 
                  margin-top: 10px;
                }
                .invoice-footer { 
                  text-align: center; 
                  margin-top: 20px; 
                  border-top: 1px solid #ccc;
                  padding-top: 10px;
                  font-size: 10px;
                }
                .company-logo {
                  max-width: 64px;
                  max-height: 64px;
                  object-fit: contain;
                }
                @media print {
                  body { margin: 0; padding: 10px; }
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
                  .text-sm { font-size: 12px !important; }
                  .text-xs { font-size: 10px !important; }
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
    const file = new Blob([document.getElementById('invoice-content')?.innerHTML || ''], { type: 'text/html' })
    element.href = URL.createObjectURL(file)
    element.download = `invoice-${order.orderNumber}.html`
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

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2 no-print">
        <Button onClick={handlePrint} disabled={isPrinting}>
          <Printer className="mr-2 h-4 w-4" />
          {isPrinting ? 'Printing...' : 'Print Invoice'}
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
              Invoice Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div id="invoice-content" className="bg-white p-6 border rounded-lg">
              {/* Invoice Header */}
              <div className="invoice-header">
                <div className="flex items-center justify-between mb-4">
                  {/* Company Logo */}
                  <div className="flex items-center gap-4">
                    {order.restaurant.logo ? (
                      <img 
                        src={order.restaurant.logo} 
                        alt={order.restaurant.name}
                        className="w-16 h-16 object-contain"
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
                    <div className="invoice-title">TAX INVOICE</div>
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
                      {order.restaurant.fssaiNumber && (
                        <div><strong>FSSAI License:</strong> {order.restaurant.fssaiNumber}</div>
                      )}
                      <div><strong>Invoice #:</strong> {order.orderNumber}</div>
                      <div><strong>Date:</strong> {formatDate(order.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </div>

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
                      </div>
                      {order.customer.address && (
                        <div>
                          <div><strong>Address:</strong> {order.customer.address}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Always show customer section if customerId exists but customer object is missing */}
                {order.customerId && !order.customer && (
                  <div className="invoice-section">
                    <div className="invoice-section-title">Customer Details</div>
                    <div className="text-yellow-600">
                      Customer information available (ID: {order.customerId}) but not loaded in invoice.
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

              {/* Order Items */}
              <div className="invoice-section">
                <div className="invoice-section-title">Order Items</div>
                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderItems.map((item, index) => (
                      <tr key={item.id}>
                        <td>
                          <div>{item.name}</div>
                          {item.notes && (
                            <div style={{ fontSize: '10px', color: '#666' }}>
                              Note: {item.notes}
                            </div>
                          )}
                        </td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Payment Summary */}
              <div className="invoice-section">
                <div className="invoice-section-title">Payment Summary</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>GST (5%):</span>
                    <span>{formatCurrency(order.gstAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Footer */}
              <div className="invoice-footer">
                <div className="text-center mb-2">
                  <div className="font-semibold">Thank you for your business!</div>
                  <div>For any queries, please contact: {order.restaurant.phone}</div>
                  {order.restaurant.email && (
                    <div>Email: {order.restaurant.email}</div>
                  )}
                </div>
                
                {/* Additional Company Information */}
                <div className="border-t pt-2 mt-2 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <div className="font-semibold">Company Information:</div>
                      <div>Trade Name: {order.restaurant.tradeName || order.restaurant.name}</div>
                      {order.restaurant.gstNumber && (
                        <div>GSTIN: {order.restaurant.gstNumber}</div>
                      )}
                      {order.restaurant.fssaiNumber && (
                        <div>FSSAI: {order.restaurant.fssaiNumber}</div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">Terms & Conditions:</div>
                      <div>• All prices are inclusive of applicable taxes</div>
                      <div>• Goods once sold will not be taken back</div>
                      <div>• Subject to {order.restaurant.name} jurisdiction</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 text-center text-xs">
                  <div>This is a computer generated invoice.</div>
                  <div>Generated on {new Date().toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Summary */}
      {!showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Invoice Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  {formatDate(order.createdAt)}
                </div>
                <div className="mt-2">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(order.totalAmount)}
                </div>
                <div className="text-sm text-gray-600">
                  {order.orderItems.length} items
                </div>
              </div>
            </div>
            
            {order.customer && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  {order.customer.name || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {order.customer.phone || 'N/A'}
                </div>
                {order.customer.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {order.customer.address}
                  </div>
                )}
              </div>
            )}

            {/* Show warning if customer exists but not loaded */}
            {order.customerId && !order.customer && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-yellow-600">
                  <User className="h-4 w-4" />
                  Customer data not fully loaded (ID: {order.customerId})
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4" />
                {order.restaurant.name}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}