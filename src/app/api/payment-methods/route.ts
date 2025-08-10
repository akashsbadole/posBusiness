import { NextRequest, NextResponse } from 'next/server'

interface PaymentMethod {
  id: string
  name: string
  type: 'UPI' | 'CARD' | 'CASH' | 'NET_BANKING' | 'WALLET'
  enabled: boolean
  config?: any
}

// Mock payment methods configuration
const paymentMethods: PaymentMethod[] = [
  {
    id: 'cash',
    name: 'Cash',
    type: 'CASH',
    enabled: true
  },
  {
    id: 'upi',
    name: 'UPI',
    type: 'UPI',
    enabled: true,
    config: {
      supportedApps: ['gpay', 'phonepe', 'paytm', 'bhim'],
      maxAmount: 100000
    }
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    type: 'CARD',
    enabled: true,
    config: {
      supportedCards: ['visa', 'mastercard', 'rupay'],
      maxAmount: 500000
    }
  },
  {
    id: 'net_banking',
    name: 'Net Banking',
    type: 'NET_BANKING',
    enabled: true,
    config: {
      supportedBanks: ['sbi', 'hdfc', 'icici', 'axis', 'pnb']
    }
  },
  {
    id: 'wallet',
    name: 'Digital Wallet',
    type: 'WALLET',
    enabled: false,
    config: {
      supportedWallets: ['paytm', 'phonepe', 'amazonpay']
    }
  }
]

export async function GET() {
  try {
    const enabledMethods = paymentMethods.filter(method => method.enabled)
    return NextResponse.json(enabledMethods)
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { method, amount, paymentDetails } = body

    if (!method || !amount) {
      return NextResponse.json(
        { error: 'Payment method and amount are required' },
        { status: 400 }
      )
    }

    const paymentMethod = paymentMethods.find(m => m.id === method && m.enabled)
    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Invalid or disabled payment method' },
        { status: 400 }
      )
    }

    // Process payment based on method type
    let paymentResult: any

    switch (paymentMethod.type) {
      case 'CASH':
        paymentResult = processCashPayment(amount, paymentDetails)
        break
      case 'UPI':
        paymentResult = await processUPIPayment(amount, paymentDetails)
        break
      case 'CARD':
        paymentResult = await processCardPayment(amount, paymentDetails)
        break
      case 'NET_BANKING':
        paymentResult = await processNetBankingPayment(amount, paymentDetails)
        break
      case 'WALLET':
        paymentResult = await processWalletPayment(amount, paymentDetails)
        break
      default:
        return NextResponse.json(
          { error: 'Unsupported payment method' },
          { status: 400 }
        )
    }

    return NextResponse.json(paymentResult)
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}

function processCashPayment(amount: number, details: any) {
  return {
    success: true,
    method: 'CASH',
    amount,
    transactionId: `CASH${Date.now()}`,
    status: 'COMPLETED',
    timestamp: new Date().toISOString(),
    note: details?.note || 'Cash payment received'
  }
}

async function processUPIPayment(amount: number, details: any) {
  // Simulate UPI payment processing
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  return {
    success: true,
    method: 'UPI',
    amount,
    upiId: details.upiId,
    app: details.app,
    transactionId: `UPI${Date.now()}`,
    status: 'COMPLETED',
    timestamp: new Date().toISOString(),
    utr: `${Math.random().toString(36).substr(2, 12).toUpperCase()}`
  }
}

async function processCardPayment(amount: number, details: any) {
  // Simulate card payment processing
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  return {
    success: true,
    method: 'CARD',
    amount,
    cardType: details.cardType,
    lastFourDigits: details.cardNumber.slice(-4),
    transactionId: `CARD${Date.now()}`,
    status: 'COMPLETED',
    timestamp: new Date().toISOString(),
    authorizationCode: `${Math.random().toString(36).substr(2, 8).toUpperCase()}`
  }
}

async function processNetBankingPayment(amount: number, details: any) {
  // Simulate net banking payment processing
  await new Promise(resolve => setTimeout(resolve, 4000))
  
  return {
    success: true,
    method: 'NET_BANKING',
    amount,
    bank: details.bank,
    transactionId: `NB${Date.now()}`,
    status: 'COMPLETED',
    timestamp: new Date().toISOString(),
    referenceNumber: `${Math.random().toString(36).substr(2, 10).toUpperCase()}`
  }
}

async function processWalletPayment(amount: number, details: any) {
  // Simulate wallet payment processing
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  return {
    success: true,
    method: 'WALLET',
    amount,
    wallet: details.wallet,
    transactionId: `WLT${Date.now()}`,
    status: 'COMPLETED',
    timestamp: new Date().toISOString()
  }
}