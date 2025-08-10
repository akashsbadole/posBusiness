import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const restaurantId = searchParams.get('restaurantId')

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get order with all related data
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        table: true,
        staff: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        orderItems: {
          include: {
            menuItem: true
          }
        },
        payments: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
            gstNumber: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Security check - ensure user can access this order
    if (restaurantId && order.restaurantId !== restaurantId) {
      return NextResponse.json(
        { error: 'Unauthorized access to order' },
        { status: 403 }
      )
    }

    // Format order items for invoice
    const formattedOrderItems = order.orderItems.map(item => ({
      id: item.id,
      name: item.menuItem.name,
      price: item.price,
      quantity: item.quantity,
      notes: item.notes
    }))

    // Format customer data
    const customer = order.customer ? {
      name: order.customer.name,
      phone: order.customer.phone,
      address: order.customer.address
    } : undefined

    // Format table data
    const table = order.table ? {
      number: order.table.number,
      capacity: order.table.capacity
    } : undefined

    // Format staff data
    const staff = {
      name: order.staff.name,
      role: order.staff.role
    }

    // Format restaurant data
    const restaurant = {
      name: order.restaurant.name,
      address: order.restaurant.address,
      phone: order.restaurant.phone,
      email: order.restaurant.email,
      gstNumber: order.restaurant.gstNumber
    }

    const invoiceData = {
      id: order.id,
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      status: order.status,
      customer,
      table,
      staff,
      subtotal: order.subtotal,
      gstAmount: order.gstAmount,
      totalAmount: order.totalAmount,
      discount: order.discount,
      notes: order.notes,
      createdAt: order.createdAt,
      orderItems: formattedOrderItems,
      restaurant
    }

    return NextResponse.json(invoiceData)
  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, template, customizations } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get order data
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        table: true,
        staff: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        orderItems: {
          include: {
            menuItem: true
          }
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
            gstNumber: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Generate invoice HTML based on template
    const invoiceHtml = generateInvoiceHTML(order, template, customizations)

    // Return the HTML content
    return NextResponse.json({
      html: invoiceHtml,
      orderNumber: order.orderNumber,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error generating invoice HTML:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}

function generateInvoiceHTML(order: any, template: string = 'default', customizations: any = {}) {
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

  // Apply customizations
  const {
    logo = '',
    headerColor = '#000000',
    accentColor = '#4f46e5',
    showGST = true,
    showDiscount = true,
    customFooter = '',
    customHeader = ''
  } = customizations

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return '#10b981'
      case 'READY': return '#3b82f6'
      case 'PREPARING': return '#f59e0b'
      case 'CONFIRMED': return '#8b5cf6'
      case 'PENDING': return '#6b7280'
      case 'CANCELLED': return '#ef4444'
      default: return '#6b7280'
    }
  }

  return `
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
            color: #333;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ddd;
            padding: 20px;
            background: white;
          }
          .invoice-header { 
            text-align: center; 
            margin-bottom: 20px; 
            border-bottom: 2px solid ${headerColor};
            padding-bottom: 10px;
          }
          .invoice-logo {
            max-width: 150px;
            max-height: 80px;
            margin-bottom: 10px;
          }
          .invoice-title { 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 5px;
            color: ${headerColor};
          }
          .invoice-subtitle { 
            font-size: 14px; 
            margin-bottom: 10px;
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
            color: ${accentColor};
          }
          .invoice-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 15px;
          }
          .invoice-table th, 
          .invoice-table td { 
            border: 1px solid #ccc; 
            padding: 8px; 
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
          .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            color: white;
            background-color: ${getStatusColor(order.status)};
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          @media print {
            body { margin: 0; padding: 10px; }
            .invoice-container {
              border: none;
              padding: 10px;
            }
            .no-print { display: none; }
          }
          @media (max-width: 600px) {
            .grid {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Custom Header -->
          ${customHeader ? `<div class="custom-header">${customHeader}</div>` : ''}
          
          <!-- Invoice Header -->
          <div class="invoice-header">
            ${logo ? `<img src="${logo}" alt="Logo" class="invoice-logo">` : ''}
            <div class="invoice-title">${order.restaurant.name}</div>
            <div class="invoice-subtitle">${order.restaurant.address}</div>
            <div class="invoice-subtitle">
              Phone: ${order.restaurant.phone} | Email: ${order.restaurant.email}
            </div>
            ${order.restaurant.gstNumber && showGST ? `
              <div class="invoice-subtitle">GSTIN: ${order.restaurant.gstNumber}</div>
            ` : ''}
            <div class="invoice-title" style="margin-top: 10px;">
              TAX INVOICE
            </div>
          </div>

          <!-- Invoice Details -->
          <div class="invoice-details">
            <div class="grid">
              <div>
                <div class="invoice-section-title">Invoice Details</div>
                <div><strong>Invoice #:</strong> ${order.orderNumber}</div>
                <div><strong>Date:</strong> ${formatDate(order.createdAt)}</div>
                <div><strong>Type:</strong> ${order.orderType.replace('_', ' ')}</div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span class="status-badge">${order.status}</span>
                </div>
              </div>
              <div>
                <div class="invoice-section-title">Staff Details</div>
                <div><strong>Name:</strong> ${order.staff.name}</div>
                <div><strong>Role:</strong> ${order.staff.role}</div>
              </div>
            </div>

            ${order.customer ? `
              <div class="invoice-section">
                <div class="invoice-section-title">Customer Details</div>
                <div class="grid">
                  <div>
                    <div><strong>Name:</strong> ${order.customer.name}</div>
                    <div><strong>Phone:</strong> ${order.customer.phone}</div>
                  </div>
                  ${order.customer.address ? `
                    <div>
                      <div><strong>Address:</strong> ${order.customer.address}</div>
                    </div>
                  ` : ''}
                </div>
              </div>
            ` : ''}

            ${order.table ? `
              <div class="invoice-section">
                <div class="invoice-section-title">Table Details</div>
                <div><strong>Table:</strong> ${order.table.number} (Capacity: ${order.table.capacity})</div>
              </div>
            ` : ''}

            ${order.notes ? `
              <div class="invoice-section">
                <div class="invoice-section-title">Notes</div>
                <div>${order.notes}</div>
              </div>
            ` : ''}
          </div>

          <!-- Order Items -->
          <div class="invoice-section">
            <div class="invoice-section-title">Order Items</div>
            <table class="invoice-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${order.orderItems.map((item: any) => `
                  <tr>
                    <td>
                      <div>${item.menuItem.name}</div>
                      ${item.notes ? `
                        <div style="font-size: 10px; color: #666;">
                          Note: ${item.notes}
                        </div>
                      ` : ''}
                    </td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.price)}</td>
                    <td>${formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Payment Summary -->
          <div class="invoice-section">
            <div class="invoice-section-title">Payment Summary</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Subtotal:</span>
              <span>${formatCurrency(order.subtotal)}</span>
            </div>
            ${order.discount > 0 && showDiscount ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Discount:</span>
                <span>-${formatCurrency(order.discount)}</span>
              </div>
            ` : ''}
            ${showGST ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>GST (5%):</span>
                <span>${formatCurrency(order.gstAmount)}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; border-top: 1px solid #ccc; padding-top: 5px;">
              <span>Total Amount:</span>
              <span>${formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          <!-- Custom Footer -->
          ${customFooter ? `<div class="custom-footer">${customFooter}</div>` : ''}
          
          <!-- Invoice Footer -->
          <div class="invoice-footer">
            <div>Thank you for your business!</div>
            <div>For any queries, please contact: ${order.restaurant.phone}</div>
            <div>This is a computer generated invoice.</div>
            <div>Generated on: ${formatDate(new Date().toISOString())}</div>
          </div>
        </div>
      </body>
    </html>
  `
}