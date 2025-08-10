import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const type = searchParams.get('type')
    const severity = searchParams.get('severity')
    const resolved = searchParams.get('resolved') === 'true'

    const whereClause: any = {}
    
    if (restaurantId) {
      whereClause.restaurantId = restaurantId
    }
    
    if (type) {
      whereClause.type = type
    }
    
    if (severity) {
      whereClause.severity = severity
    }
    
    if (resolved !== undefined) {
      whereClause.isResolved = resolved
    }

    const alerts = await db.inventoryAlert.findMany({
      where: whereClause,
      include: {
        inventoryItem: true,
        restaurant: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching inventory alerts:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      inventoryItemId,
      type,
      severity,
      message,
      currentQuantity,
      threshold,
      predictedDays,
      recommendation
    } = body

    // Get inventory item to get restaurant ID
    const inventoryItem = await db.inventoryItem.findUnique({
      where: { id: inventoryItemId }
    })

    if (!inventoryItem) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    const alert = await db.inventoryAlert.create({
      data: {
        restaurantId: inventoryItem.restaurantId,
        inventoryItemId,
        type,
        severity,
        message,
        currentQuantity,
        threshold,
        predictedDays,
        recommendation,
        isResolved: false
      },
      include: {
        inventoryItem: true,
        restaurant: true
      }
    })

    return NextResponse.json(alert)
  } catch (error) {
    console.error('Error creating inventory alert:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}