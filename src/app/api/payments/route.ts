import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      orderId,
      amount,
      method,
      transactionId,
      notes
    } = body

    if (!orderId || !amount || !method) {
      return NextResponse.json(
        { error: 'Order ID, amount, and payment method are required' },
        { status: 400 }
      )
    }

    // Check if order exists
    const order = await db.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Create payment
    const payment = await db.payment.create({
      data: {
        orderId,
        amount: parseFloat(amount),
        method,
        status: 'COMPLETED',
        transactionId: transactionId || null,
        notes: notes || null
      }
    })

    // Update order status to DELIVERED if payment is completed
    await db.order.update({
      where: { id: orderId },
      data: { status: 'DELIVERED' }
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}