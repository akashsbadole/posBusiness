import { NextRequest, NextResponse } from 'next/server'
import { paymentGatewayManager } from '@/lib/payment-gateways'

export async function POST(
  request: NextRequest,
  { params }: { params: { gatewayId: string } }
) {
  try {
    const { gatewayId } = params
    const refundData = await request.json()

    if (!gatewayId || !refundData) {
      return NextResponse.json(
        { error: 'Gateway ID and refund data are required' },
        { status: 400 }
      )
    }

    if (!refundData.transactionId || !refundData.amount) {
      return NextResponse.json(
        { error: 'Transaction ID and amount are required' },
        { status: 400 }
      )
    }

    const result = await paymentGatewayManager.refundPayment(gatewayId, refundData)

    return NextResponse.json({
      success: result.success,
      ...result
    })
  } catch (error) {
    console.error('Error processing refund:', error)
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    )
  }
}