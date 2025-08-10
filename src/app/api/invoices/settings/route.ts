import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    // Get business settings
    const businessSettings = await db.businessSettings.findUnique({
      where: { restaurantId }
    })

    return NextResponse.json({
      invoiceSettings: businessSettings?.invoiceSettings || {},
      logo: businessSettings?.logo || null
    })
  } catch (error) {
    console.error('Error fetching invoice settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantId, invoiceSettings } = body

    if (!restaurantId || !invoiceSettings) {
      return NextResponse.json(
        { error: 'Restaurant ID and invoice settings are required' },
        { status: 400 }
      )
    }

    // Update or create business settings
    const businessSettings = await db.businessSettings.upsert({
      where: { restaurantId },
      update: { invoiceSettings },
      create: {
        restaurantId,
        invoiceSettings
      }
    })

    return NextResponse.json(businessSettings)
  } catch (error) {
    console.error('Error updating invoice settings:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice settings' },
      { status: 500 }
    )
  }
}