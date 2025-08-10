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

    // Get all discount rules for the restaurant
    const discountRules = await db.discountRule.findMany({
      where: { 
        restaurantId,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(discountRules)
  } catch (error) {
    console.error('Error fetching discount rules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch discount rules' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      restaurantId,
      name,
      description,
      type,
      value,
      conditions,
      targetCustomers,
      minPurchaseAmount,
      maxDiscountAmount,
      usageLimit,
      startDate,
      endDate
    } = body

    if (!restaurantId || !name || !type || value === undefined) {
      return NextResponse.json(
        { error: 'Restaurant ID, name, type, and value are required' },
        { status: 400 }
      )
    }

    // Validate discount type and value
    if (type === 'PERCENTAGE' && (value < 0 || value > 100)) {
      return NextResponse.json(
        { error: 'Percentage discount must be between 0 and 100' },
        { status: 400 }
      )
    }

    if (type === 'FIXED' && value < 0) {
      return NextResponse.json(
        { error: 'Fixed discount amount must be positive' },
        { status: 400 }
      )
    }

    // Create new discount rule
    const newDiscountRule = await db.discountRule.create({
      data: {
        restaurantId,
        name,
        description,
        type,
        value,
        conditions: conditions ? JSON.stringify(conditions) : null,
        targetCustomers: targetCustomers ? JSON.stringify(targetCustomers) : null,
        minPurchaseAmount,
        maxDiscountAmount,
        usageLimit,
        startDate,
        endDate
      }
    })

    return NextResponse.json(newDiscountRule)
  } catch (error) {
    console.error('Error creating discount rule:', error)
    return NextResponse.json(
      { error: 'Failed to create discount rule' },
      { status: 500 }
    )
  }
}