import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { discountId, orderId, restaurantId } = body

    if (!discountId || !orderId || !restaurantId) {
      return NextResponse.json(
        { error: 'Discount ID, Order ID, and Restaurant ID are required' },
        { status: 400 }
      )
    }

    // Get the discount rule
    const discountRule = await db.discountRule.findUnique({
      where: { id: discountId }
    })

    if (!discountRule) {
      return NextResponse.json(
        { error: 'Discount rule not found' },
        { status: 404 }
      )
    }

    // Check if discount is active
    if (!discountRule.isActive) {
      return NextResponse.json(
        { error: 'Discount rule is not active' },
        { status: 400 }
      )
    }

    // Check date validity
    const now = new Date()
    if (discountRule.startDate && now < discountRule.startDate) {
      return NextResponse.json(
        { error: 'Discount rule has not started yet' },
        { status: 400 }
      )
    }

    if (discountRule.endDate && now > discountRule.endDate) {
      return NextResponse.json(
        { error: 'Discount rule has expired' },
        { status: 400 }
      )
    }

    // Check usage limit
    if (discountRule.usageLimit && discountRule.usedCount >= discountRule.usageLimit) {
      return NextResponse.json(
        { error: 'Discount usage limit reached' },
        { status: 400 }
      )
    }

    // Get the order
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        orderItems: {
          include: {
            menuItem: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check minimum purchase amount
    if (discountRule.minPurchaseAmount && order.subtotal < discountRule.minPurchaseAmount) {
      return NextResponse.json(
        { error: `Minimum purchase amount of ₹${discountRule.minPurchaseAmount} required` },
        { status: 400 }
      )
    }

    // Check target customer conditions
    if (discountRule.targetCustomers) {
      const targetCustomers = JSON.parse(discountRule.targetCustomers)
      let customerEligible = false

      // Check if customer matches any of the target conditions
      for (const condition of targetCustomers) {
        if (condition.type === 'ALL') {
          customerEligible = true
          break
        } else if (condition.type === 'NEW' && order.customer) {
          // Check if customer is new (first order)
          const customerOrderCount = await db.order.count({
            where: {
              customerId: order.customerId,
              status: { not: 'CANCELLED' }
            }
          })
          if (customerOrderCount === 1) {
            customerEligible = true
            break
          }
        } else if (condition.type === 'LOYALTY' && order.customer) {
          // Check loyalty points threshold
          if (order.customer.loyaltyPoints >= (condition.minPoints || 0)) {
            customerEligible = true
            break
          }
        } else if (condition.type === 'SEGMENT' && order.customer) {
          // Check customer segment (could be based on order history, total spent, etc.)
          // This is a simplified version - in production, you'd have more sophisticated segmentation
          const totalSpent = await db.order.aggregate({
            where: {
              customerId: order.customerId,
              status: { not: 'CANCELLED' }
            },
            _sum: { totalAmount: true }
          })

          if (condition.minSpent && totalSpent._sum.totalAmount >= condition.minSpent) {
            customerEligible = true
            break
          }
        }
      }

      if (!customerEligible) {
        return NextResponse.json(
          { error: 'Customer is not eligible for this discount' },
          { status: 400 }
        )
      }
    }

    // Check additional conditions
    if (discountRule.conditions) {
      const conditions = JSON.parse(discountRule.conditions)
      
      for (const condition of conditions) {
        if (condition.type === 'ITEM_CATEGORY') {
          // Check if order contains items from specific categories
          const hasCategoryItem = order.orderItems.some(item => 
            condition.categories.includes(item.menuItem.categoryId)
          )
          
          if (!hasCategoryItem) {
            return NextResponse.json(
              { error: `Order must contain items from specified categories` },
              { status: 400 }
            )
          }
        } else if (condition.type === 'ITEM_COUNT') {
          // Check minimum item count
          const totalItems = order.orderItems.reduce((sum, item) => sum + item.quantity, 0)
          if (totalItems < condition.minCount) {
            return NextResponse.json(
              { error: `Minimum ${condition.minCount} items required` },
              { status: 400 }
            )
          }
        } else if (condition.type === 'TIME_BASED') {
          // Check if order is within specified time range
          const orderTime = new Date(order.createdAt)
          const orderHour = orderTime.getHours()
          
          if (condition.startHour !== undefined && orderHour < condition.startHour) {
            return NextResponse.json(
              { error: `Discount not available at this time` },
              { status: 400 }
            )
          }
          
          if (condition.endHour !== undefined && orderHour > condition.endHour) {
            return NextResponse.json(
              { error: `Discount not available at this time` },
              { status: 400 }
            )
          }
        }
      }
    }

    // Calculate discount amount
    let discountAmount = 0
    if (discountRule.type === 'PERCENTAGE') {
      discountAmount = (order.subtotal * discountRule.value) / 100
    } else if (discountRule.type === 'FIXED') {
      discountAmount = discountRule.value
    }

    // Apply maximum discount limit
    if (discountRule.maxDiscountAmount && discountAmount > discountRule.maxDiscountAmount) {
      discountAmount = discountRule.maxDiscountAmount
    }

    // Ensure discount doesn't make order total negative
    if (discountAmount > order.subtotal) {
      discountAmount = order.subtotal
    }

    // Update the order with discount
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        discount: discountAmount,
        // Recalculate total amount
        totalAmount: order.subtotal - discountAmount + order.gstAmount
      }
    })

    // Increment usage count
    await db.discountRule.update({
      where: { id: discountId },
      data: {
        usedCount: discountRule.usedCount + 1
      }
    })

    return NextResponse.json({
      success: true,
      discountAmount,
      updatedOrder,
      message: 'Discount applied successfully'
    })

  } catch (error) {
    console.error('Error applying discount:', error)
    return NextResponse.json(
      { error: 'Failed to apply discount' },
      { status: 500 }
    )
  }
}