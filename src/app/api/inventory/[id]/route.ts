import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { AuditAction } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const inventoryItem = await db.inventoryItem.findUnique({
      where: { id: params.id },
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
      }
    })

    if (!inventoryItem) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    return NextResponse.json(inventoryItem)
  } catch (error) {
    console.error('Error fetching inventory item:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      isActive
    } = body

    // Get current item for audit log
    const currentItem = await db.inventoryItem.findUnique({
      where: { id: params.id }
    })

    if (!currentItem) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    // Update inventory item
    const updatedItem = await db.inventoryItem.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(quantity !== undefined && { quantity }),
        ...(unit && { unit }),
        ...(minStock !== undefined && { minStock }),
        ...(maxStock !== undefined && { maxStock }),
        ...(cost !== undefined && { cost }),
        ...(isActive !== undefined && { isActive })
      },
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
      }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        action: AuditAction.UPDATE,
        entityType: 'InventoryItem',
        entityId: params.id,
        oldValues: JSON.stringify(currentItem),
        newValues: JSON.stringify(updatedItem),
        restaurantId: currentItem.restaurantId,
        userId: session.user.id
      }
    })

    // Check for stock alerts
    if (quantity !== undefined && quantity <= updatedItem.minStock) {
      // Check if alert already exists
      const existingAlert = await db.inventoryAlert.findFirst({
        where: {
          inventoryItemId: params.id,
          type: 'LOW_STOCK',
          isResolved: false
        }
      })

      if (!existingAlert) {
        await db.inventoryAlert.create({
          data: {
            restaurantId: currentItem.restaurantId,
            inventoryItemId: params.id,
            type: 'LOW_STOCK',
            severity: 'MEDIUM',
            message: `Low stock alert for ${updatedItem.name}`,
            currentQuantity: quantity,
            threshold: updatedItem.minStock,
            recommendation: `Restock ${updatedItem.name} immediately`
          }
        })
      }
    }

    // Resolve low stock alert if stock is now above minimum
    if (quantity !== undefined && quantity > updatedItem.minStock) {
      await db.inventoryAlert.updateMany({
        where: {
          inventoryItemId: params.id,
          type: 'LOW_STOCK',
          isResolved: false
        },
        data: {
          isResolved: true,
          resolvedAt: new Date()
        }
      })
    }

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Error updating inventory item:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const inventoryItem = await db.inventoryItem.findUnique({
      where: { id: params.id }
    })

    if (!inventoryItem) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    // Soft delete by setting isActive to false
    await db.inventoryItem.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        action: AuditAction.DELETE,
        entityType: 'InventoryItem',
        entityId: params.id,
        oldValues: JSON.stringify(inventoryItem),
        restaurantId: inventoryItem.restaurantId,
        userId: session.user.id
      }
    })

    return NextResponse.json({ message: 'Inventory item deleted successfully' })
  } catch (error) {
    console.error('Error deleting inventory item:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}