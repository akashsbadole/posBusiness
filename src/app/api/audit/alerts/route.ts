import { NextRequest, NextResponse } from 'next/server'
import { AuditService } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const days = parseInt(searchParams.get('days') || '7')

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    const alerts = await AuditService.getSecurityAlerts(restaurantId, days)

    return NextResponse.json({
      alerts,
      total: alerts.length,
      days
    })
  } catch (error) {
    console.error('Error fetching security alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch security alerts' },
      { status: 500 }
    )
  }
}