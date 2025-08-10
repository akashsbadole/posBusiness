import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const restaurants = await db.restaurant.findMany({
      where: {
        isActive: true
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        subscription: true,
        _count: {
          select: {
            outlets: true,
            staff: true,
            menuItems: true,
            orders: true
          }
        }
      }
    })

    return NextResponse.json(restaurants)
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, address, phone, email, gstNumber, description, ownerId } = body

    if (!name || !address || !phone || !email || !ownerId) {
      return NextResponse.json(
        { error: 'Name, address, phone, email, and owner ID are required' },
        { status: 400 }
      )
    }

    const restaurant = await db.restaurant.create({
      data: {
        name,
        address,
        phone,
        email,
        gstNumber,
        description,
        ownerId,
        isActive: true
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(restaurant, { status: 201 })
  } catch (error) {
    console.error('Error creating restaurant:', error)
    return NextResponse.json(
      { error: 'Failed to create restaurant' },
      { status: 500 }
    )
  }
}