import { NextRequest, NextResponse } from 'next/server'
import { paymentGatewayManager } from '@/lib/payment-gateways'

export async function GET() {
  try {
    const enabledGateways = paymentGatewayManager.getEnabledGateways()
    
    const gatewayInfo = enabledGateways.map(gateway => ({
      id: gateway.id,
      name: gateway.name,
      enabled: gateway.enabled,
      config: {
        environment: gateway.config.environment
      }
    }))

    return NextResponse.json({
      success: true,
      gateways: gatewayInfo
    })
  } catch (error) {
    console.error('Error fetching payment gateways:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment gateways' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gatewayId, paymentData } = body

    if (!gatewayId || !paymentData) {
      return NextResponse.json(
        { error: 'Gateway ID and payment data are required' },
        { status: 400 }
      )
    }

    const result = await paymentGatewayManager.processPayment(gatewayId, paymentData)

    return NextResponse.json({
      success: result.success,
      ...result
    })
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}