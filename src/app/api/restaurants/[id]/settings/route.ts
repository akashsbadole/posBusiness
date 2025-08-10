import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const restaurantId = params.id

    // Get restaurant settings
    const restaurant = await db.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        gstNumber: true,
        // Add settings field if it exists in the schema
      }
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // For now, return basic restaurant info as settings
    // In a real implementation, you would have a settings table or JSON field
    const settings = {
      restaurantName: restaurant.name,
      restaurantAddress: restaurant.address,
      restaurantPhone: restaurant.phone,
      restaurantEmail: restaurant.email,
      gstNumber: restaurant.gstNumber,
      // Default settings
      invoiceTemplate: 'default',
      headerColor: '#000000',
      accentColor: '#4f46e5',
      showGST: true,
      showDiscount: true,
      customFooter: '',
      customHeader: '',
      theme: 'light',
      language: 'en',
      currency: 'INR',
      dateFormat: 'dd/mm/yyyy',
      timeFormat: '24h',
      enableInventory: true,
      enableLoyalty: true,
      enableOnlineOrders: false,
      enableDelivery: false,
      enableTableReservation: true,
      emailNotifications: true,
      smsNotifications: false,
      orderNotifications: true,
      paymentNotifications: true,
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching restaurant settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const restaurantId = params.id
    const body = await request.json()

    // Update restaurant basic info
    const updatedRestaurant = await db.restaurant.update({
      where: { id: restaurantId },
      data: {
        name: body.restaurantName,
        address: body.restaurantAddress,
        phone: body.restaurantPhone,
        email: body.restaurantEmail,
        gstNumber: body.gstNumber,
      },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        gstNumber: true,
      }
    })

    // In a real implementation, you would save additional settings to a settings table
    // For now, we'll just return the updated restaurant info along with the settings
    
    const settings = {
      ...body,
      restaurantName: updatedRestaurant.name,
      restaurantAddress: updatedRestaurant.address,
      restaurantPhone: updatedRestaurant.phone,
      restaurantEmail: updatedRestaurant.email,
      gstNumber: updatedRestaurant.gstNumber,
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating restaurant settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}