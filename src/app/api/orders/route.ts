import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withPermission } from '@/lib/permission-middleware'
import { Module, PermissionAction } from '@prisma/client'

async function getOrdersHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const outletId = searchParams.get('outletId')
    const status = searchParams.get('status')
    const orderType = searchParams.get('orderType')

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    const whereClause: any = {
      restaurantId
    }

    if (outletId) {
      whereClause.outletId = outletId
    }

    if (status) {
      whereClause.status = status
    }

    if (orderType) {
      whereClause.orderType = orderType
    }

    const orders = await db.order.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        customer: true,
        table: true,
        staff: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        orderItems: {
          include: {
            menuItem: true
          }
        },
        payments: true
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

async function createOrderHandler(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      orderType,
      customerId,
      tableId,
      staffId,
      restaurantId,
      outletId,
      orderItems,
      notes
    } = body

    if (!orderType || !staffId || !restaurantId || !orderItems || orderItems.length === 0) {
      return NextResponse.json(
        { error: 'Order type, staff ID, restaurant ID, and order items are required' },
        { status: 400 }
      )
    }

    // Validate foreign key references
    // Check staff exists
    const staff = await db.staff.findUnique({
      where: { id: staffId }
    })
    if (!staff) {
      return NextResponse.json(
        { error: 'Staff not found' },
        { status: 400 }
      )
    }

    // Check restaurant exists
    const restaurant = await db.restaurant.findUnique({
      where: { id: restaurantId }
    })
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 400 }
      )
    }

    // Check customer exists if provided
    if (customerId) {
      const customer = await db.customer.findUnique({
        where: { id: customerId }
      })
      if (!customer) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 400 }
        )
      }
    }

    // Check table exists if provided
    if (tableId) {
      const table = await db.table.findUnique({
        where: { id: tableId }
      })
      if (!table) {
        return NextResponse.json(
          { error: 'Table not found' },
          { status: 400 }
        )
      }
    }

    // Check all menu items exist
    for (const item of orderItems) {
      const menuItem = await db.menuItem.findUnique({
        where: { id: item.menuItemId }
      })
      if (!menuItem) {
        return NextResponse.json(
          { error: `Menu item not found: ${item.menuItemId}` },
          { status: 400 }
        )
      }
    }

    // Calculate order totals
    let subtotal = 0
    const processedOrderItems = orderItems.map((item: any) => {
      const itemTotal = item.price * item.quantity
      subtotal += itemTotal
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || null
      }
    })

    // Calculate GST (assuming 5% for restaurant items in India)
    const gstRate = 0.05
    const gstAmount = subtotal * gstRate
    const totalAmount = subtotal + gstAmount

    // Generate order number
    const orderCount = await db.order.count({
      where: { restaurantId }
    })
    const orderNumber = `ORD-${String(orderCount + 1).padStart(4, '0')}`

    // Create order with order items
    const order = await db.order.create({
      data: {
        orderNumber,
        orderType,
        status: 'PENDING',
        customerId: customerId || null,
        tableId: tableId || null,
        staffId,
        restaurantId,
        outletId: outletId || null,
        subtotal,
        gstAmount,
        totalAmount,
        discount: 0,
        notes: notes || null,
        orderItems: {
          create: processedOrderItems
        }
      },
      include: {
        customer: true,
        table: true,
        staff: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        orderItems: {
          include: {
            menuItem: true
          }
        },
        payments: true
      }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export const GET = withPermission(getOrdersHandler, { permission: { module: Module.ORDERS, action: PermissionAction.READ } })
export const POST = withPermission(createOrderHandler, { permission: { module: Module.ORDERS, action: PermissionAction.CREATE } })