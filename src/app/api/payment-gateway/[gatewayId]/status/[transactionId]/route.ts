import { NextRequest, NextResponse } from 'next/server'
import { paymentGatewayManager } from '@/lib/payment-gateways'

export async function GET(
  request: NextRequest,
  { params }: { params: { gatewayId: string; transactionId: string } }
) {
  try {
    const { gatewayId, transactionId } = params

    if (!gatewayId || !transactionId) {
      return NextResponse.json(
        { error: 'Gateway ID and transaction ID are required' },
        { status: 400 }
      )
    }

    const status = await paymentGatewayManager.getPaymentStatus(gatewayId, transactionId)

    return NextResponse.json({
      success: true,
      ...status
    })
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    )
  }
}