import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { AuditAction } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const outletId = searchParams.get('outletId')
    const locationId = searchParams.get('locationId')
    const lowStock = searchParams.get('lowStock') === 'true'
    const overstock = searchParams.get('overstock') === 'true'

    const whereClause: any = {}
    
    if (restaurantId) {
      whereClause.restaurantId = restaurantId
    }
    
    if (outletId) {
      whereClause.outletId = outletId
    }
    
    if (locationId) {
      whereClause.locationId = locationId
    }

    let inventoryItems = await db.inventoryItem.findMany({
      where: whereClause,
      include: {
        restaurant: true,
        outlet: true,
        location: true,
        menuItem: true,
        inventoryAlerts: {
          where: {
            isResolved: false
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Apply filters
    if (lowStock) {
      inventoryItems = inventoryItems.filter(item => item.quantity <= item.minStock)
    }
    
    if (overstock) {
      inventoryItems = inventoryItems.filter(item => item.quantity >= item.maxStock)
    }

    return NextResponse.json(inventoryItems)
  } catch (error) {
    console.error('Error fetching inventory items:', error)
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
      name,
      description,
      quantity,
      unit,
      minStock,
      maxStock,
      cost,
      restaurantId,
      outletId,
      locationId,
      menuItemId
    } = body

    // Validate required fields
    if (!name || !restaurantId || quantity === undefined || !unit || minStock === undefined || maxStock === undefined || cost === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create inventory item
    const inventoryItem = await db.inventoryItem.create({
      data: {
        name,
        description,
        quantity,
        unit,
        minStock,
        maxStock,
        cost,
        restaurantId,
        outletId,
        locationId,
        menuItemId,
        isActive: true
      },
      include: {
        restaurant: true,
        outlet: true,
        location: true,
        menuItem: true
      }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        action: AuditAction.CREATE,
        entityType: 'InventoryItem',
        entityId: inventoryItem.id,
        newValues: JSON.stringify(inventoryItem),
        restaurantId,
        userId: session.user.id
      }
    })

    // Check for low stock alerts
    if (quantity <= minStock) {
      await db.inventoryAlert.create({
        data: {
          restaurantId,
          inventoryItemId: inventoryItem.id,
          type: 'LOW_STOCK',
          severity: 'MEDIUM',
          message: `Low stock alert for ${name}`,
          currentQuantity: quantity,
          threshold: minStock,
          recommendation: `Restock ${name} immediately`
        }
      })
    }

    return NextResponse.json(inventoryItem)
  } catch (error) {
    console.error('Error creating inventory item:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}