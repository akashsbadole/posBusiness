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

    // Get business settings for tax configuration
    const businessSettings = await db.businessSettings.findUnique({
      where: { restaurantId }
    })

    // Get tax rates and configurations
    const taxConfig = businessSettings?.taxSettings || {}

    return NextResponse.json({
      taxConfig,
      businessSettings: {
        enableGST: businessSettings?.enableGST || false,
        gstRate: businessSettings?.gstRate || 0.05
      }
    })
  } catch (error) {
    console.error('Error fetching tax configuration:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tax configuration' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantId, taxConfig } = body

    if (!restaurantId || !taxConfig) {
      return NextResponse.json(
        { error: 'Restaurant ID and tax configuration are required' },
        { status: 400 }
      )
    }

    // Update business settings with tax configuration
    const businessSettings = await db.businessSettings.upsert({
      where: { restaurantId },
      update: { 
        taxSettings: taxConfig,
        enableGST: taxConfig.enableGST !== false,
        gstRate: taxConfig.gstRate || 0.05
      },
      create: {
        restaurantId,
        taxSettings: taxConfig,
        enableGST: taxConfig.enableGST !== false,
        gstRate: taxConfig.gstRate || 0.05
      }
    })

    return NextResponse.json(businessSettings)
  } catch (error) {
    console.error('Error updating tax configuration:', error)
    return NextResponse.json(
      { error: 'Failed to update tax configuration' },
      { status: 500 }
    )
  }
}