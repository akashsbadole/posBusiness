import { NextRequest, NextResponse } from 'next/server'

// GST rates for different food categories in India
const GST_RATES = {
  'AC_RESTAURANT': 0.18,  // 18% for AC restaurants
  'NON_AC_RESTAURANT': 0.05, // 5% for non-AC restaurants
  'OUTDOOR_CATERING': 0.18, // 18% for outdoor catering
  'DEFAULT': 0.05 // Default 5%
}

interface BillItem {
  name: string
  price: number
  quantity: number
  category?: string
}

interface BillCalculation {
  subtotal: number
  cgst: number
  sgst: number
  igst: number
  totalGST: number
  totalAmount: number
  breakup: {
    items: Array<{
      name: string
      price: number
      quantity: number
      total: number
      gstRate: number
      gstAmount: number
    }>
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, restaurantType = 'NON_AC_RESTAURANT', state = 'Same State', discount = 0 } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      )
    }

    // Calculate bill with GST
    const calculation = calculateBill(items, restaurantType, state, discount)

    return NextResponse.json(calculation)
  } catch (error) {
    console.error('Error calculating bill:', error)
    return NextResponse.json(
      { error: 'Failed to calculate bill' },
      { status: 500 }
    )
  }
}

function calculateBill(items: BillItem[], restaurantType: string, state: string, discount: number): BillCalculation {
  const gstRate = GST_RATES[restaurantType as keyof typeof GST_RATES] || GST_RATES.DEFAULT
  const isSameState = state === 'Same State'
  
  let subtotal = 0
  const breakup = items.map(item => {
    const itemTotal = item.price * item.quantity
    const itemGST = itemTotal * gstRate
    subtotal += itemTotal
    
    return {
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      total: itemTotal,
      gstRate: gstRate * 100,
      gstAmount: itemGST
    }
  })

  // Apply discount
  const discountedSubtotal = Math.max(0, subtotal - discount)
  
  // Calculate GST
  const totalGST = discountedSubtotal * gstRate
  
  // Split GST into CGST/SGST or IGST
  let cgst = 0
  let sgst = 0
  let igst = 0
  
  if (isSameState) {
    cgst = totalGST / 2
    sgst = totalGST / 2
  } else {
    igst = totalGST
  }

  const totalAmount = discountedSubtotal + totalGST

  return {
    subtotal: discountedSubtotal,
    cgst,
    sgst,
    igst,
    totalGST,
    totalAmount,
    breakup
  }
}

// UPI Payment integration (simulated)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { upiId, amount, transactionNote = 'Restaurant Payment' } = body

    if (!upiId || !amount) {
      return NextResponse.json(
        { error: 'UPI ID and amount are required' },
        { status: 400 }
      )
    }

    // Simulate UPI payment processing
    // In a real implementation, you would integrate with actual UPI payment gateways
    const transactionId = `UPI${Date.now()}${Math.random().toString(36).substr(2, 9)}`
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const paymentResult = {
      success: true,
      transactionId,
      upiId,
      amount: parseFloat(amount),
      status: 'COMPLETED',
      timestamp: new Date().toISOString(),
      note: transactionNote,
      utr: `${Math.random().toString(36).substr(2, 12).toUpperCase()}`
    }

    return NextResponse.json(paymentResult)
  } catch (error) {
    console.error('Error processing UPI payment:', error)
    return NextResponse.json(
      { error: 'Failed to process UPI payment' },
      { status: 500 }
    )
  }
}