import { NextRequest, NextResponse } from 'next/server'
import { RazorpayGateway } from '@/lib/payment-gateways/razorpay'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('x-razorpay-signature') || ''

    // Initialize Razorpay gateway
    const razorpayGateway = new RazorpayGateway({
      keyId: process.env.RAZORPAY_KEY_ID || '',
      keySecret: process.env.RAZORPAY_KEY_SECRET || '',
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
      environment: (process.env.NODE_ENV === 'production' ? 'production' : 'test') as 'test' | 'production'
    })

    // Verify webhook signature
    const isValid = razorpayGateway.verifyWebhookSignature(payload, signature)
    if (!isValid) {
      console.error('Invalid Razorpay webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const webhookData = JSON.parse(payload)
    const parsedWebhook = razorpayGateway.parseWebhookPayload(webhookData)

    console.log('Razorpay webhook received:', parsedWebhook)

    // Handle different webhook events
    switch (parsedWebhook.event) {
      case 'payment.authorized':
        await handlePaymentAuthorized(webhookData.payload.payment.entity)
        break
      case 'payment.captured':
        await handlePaymentCaptured(webhookData.payload.payment.entity)
        break
      case 'payment.failed':
        await handlePaymentFailed(webhookData.payload.payment.entity)
        break
      case 'refund.processed':
        await handleRefundProcessed(webhookData.payload.refund.entity)
        break
      default:
        console.log('Unhandled Razorpay webhook event:', parsedWebhook.event)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing Razorpay webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

async function handlePaymentAuthorized(payment: any) {
  try {
    // Update payment status to authorized
    await db.payment.updateMany({
      where: { transactionId: payment.order_id },
      data: { 
        status: 'COMPLETED',
        transactionId: payment.id,
        gatewayResponse: JSON.stringify(payment)
      }
    })

    console.log('Payment authorized:', payment.id)
  } catch (error) {
    console.error('Error handling payment authorized:', error)
  }
}

async function handlePaymentCaptured(payment: any) {
  try {
    // Update payment status to completed
    await db.payment.updateMany({
      where: { transactionId: payment.order_id },
      data: { 
        status: 'COMPLETED',
        transactionId: payment.id,
        gatewayResponse: JSON.stringify(payment)
      }
    })

    // Update order status
    const payments = await db.payment.findMany({
      where: { transactionId: payment.order_id }
    })

    if (payments.length > 0) {
      await db.order.update({
        where: { id: payments[0].orderId },
        data: { status: 'DELIVERED' }
      })
    }

    console.log('Payment captured:', payment.id)
  } catch (error) {
    console.error('Error handling payment captured:', error)
  }
}

async function handlePaymentFailed(payment: any) {
  try {
    // Update payment status to failed
    await db.payment.updateMany({
      where: { transactionId: payment.order_id },
      data: { 
        status: 'FAILED',
        transactionId: payment.id,
        gatewayResponse: JSON.stringify(payment)
      }
    })

    console.log('Payment failed:', payment.id)
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

async function handleRefundProcessed(refund: any) {
  try {
    // Create refund record or update payment status
    console.log('Refund processed:', refund.id)
    
    // Here you would typically create a refund record in your database
    // For now, we'll just log the refund
  } catch (error) {
    console.error('Error handling refund processed:', error)
  }
}