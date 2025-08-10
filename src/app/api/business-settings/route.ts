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

    const settings = await db.businessSettings.findUnique({
      where: { restaurantId }
    })

    if (!settings) {
      // Create default settings for the restaurant
      const restaurant = await db.restaurant.findUnique({
        where: { id: restaurantId }
      })

      if (!restaurant) {
        return NextResponse.json(
          { error: 'Restaurant not found' },
          { status: 404 }
        )
      }

      const defaultSettings = await db.businessSettings.create({
        data: {
          restaurantId,
          businessType: restaurant.businessType,
          enableGST: true,
          gstRate: 0.05,
          enableInventory: true,
          enableTables: restaurant.businessType === 'RESTAURANT',
          enableAppointments: false,
          enableServices: false,
          enableSubscriptions: false,
          enableLoyalty: true,
          enableDelivery: true,
          currency: 'INR',
          timezone: 'Asia/Kolkata'
        }
      })

      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching business settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantId, ...settingsData } = body

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    // Check if settings exist for the restaurant
    const existingSettings = await db.businessSettings.findUnique({
      where: { restaurantId }
    })

    let settings
    if (existingSettings) {
      // Update existing settings
      settings = await db.businessSettings.update({
        where: { restaurantId },
        data: settingsData
      })
    } else {
      // Create new settings
      settings = await db.businessSettings.create({
        data: {
          restaurantId,
          ...settingsData
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating business settings:', error)
    return NextResponse.json(
      { error: 'Failed to update business settings' },
      { status: 500 }
    )
  }
}