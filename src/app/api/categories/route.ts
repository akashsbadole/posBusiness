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

    const categories = await db.category.findMany({
      where: {
        restaurantId,
        isActive: true
      },
      orderBy: {
        displayOrder: 'asc'
      },
      include: {
        menuItems: {
          where: {
            isActive: true,
            isAvailable: true
          },
          orderBy: {
            name: 'asc'
          }
        }
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, displayOrder, restaurantId } = body

    if (!name || !restaurantId) {
      return NextResponse.json(
        { error: 'Name and restaurant ID are required' },
        { status: 400 }
      )
    }

    const category = await db.category.create({
      data: {
        name,
        description,
        displayOrder: displayOrder || 0,
        restaurantId
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}