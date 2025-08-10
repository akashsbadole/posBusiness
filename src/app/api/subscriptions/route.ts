import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { AuditService } from '@/lib/audit'
import { AuditAction, SecurityLevel } from '@prisma/client'

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

    const subscription = await db.subscription.findUnique({
      where: { restaurantId },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Log the access
    await AuditService.log({
      action: AuditAction.READ,
      entityType: 'subscription',
      entityId: subscription.id,
      restaurantId,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      securityLevel: SecurityLevel.LOW
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantId, plan, paymentMethod } = body

    if (!restaurantId || !plan || !paymentMethod) {
      return NextResponse.json(
        { error: 'Restaurant ID, plan, and payment method are required' },
        { status: 400 }
      )
    }

    // Check if restaurant exists
    const restaurant = await db.restaurant.findUnique({
      where: { id: restaurantId }
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Calculate subscription details
    const planPrices = {
      BASIC: 999,
      PRO: 2499,
      ENTERPRISE: 4999
    }

    const amount = planPrices[plan as keyof typeof planPrices] || 999
    const startDate = new Date()
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

    // Create or update subscription
    const subscription = await db.subscription.upsert({
      where: { restaurantId },
      update: {
        plan,
        status: 'ACTIVE',
        startDate,
        endDate,
        lastBillingAt: new Date(),
        nextBillingAt: endDate,
        amount,
        updatedAt: new Date()
      },
      create: {
        id: `sub-${Date.now()}`,
        plan,
        status: 'ACTIVE',
        startDate,
        endDate,
        lastBillingAt: new Date(),
        nextBillingAt: endDate,
        amount,
        restaurantId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Create payment record
    const payment = await db.payment.create({
      data: {
        id: `pay-${Date.now()}`,
        orderId: `order-${Date.now()}`,
        amount,
        method: paymentMethod,
        status: 'COMPLETED',
        transactionId: `txn-${Date.now()}`,
        notes: `Subscription payment for ${plan} plan`,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Log the subscription creation
    await AuditService.log({
      action: AuditAction.CREATE,
      entityType: 'subscription',
      entityId: subscription.id,
      changes: JSON.stringify({
        plan,
        amount,
        paymentMethod,
        status: 'ACTIVE'
      }),
      restaurantId,
      paymentId: payment.id,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      securityLevel: SecurityLevel.MEDIUM
    })

    return NextResponse.json({
      subscription,
      message: 'Subscription updated successfully'
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantId, plan, status } = body

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    const existingSubscription = await db.subscription.findUnique({
      where: { restaurantId }
    })

    if (!existingSubscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    const oldValues = {
      plan: existingSubscription.plan,
      status: existingSubscription.status,
      amount: existingSubscription.amount
    }

    const updateData: any = {
      updatedAt: new Date()
    }

    if (plan) {
      updateData.plan = plan
      // Update amount based on plan
      const planPrices = {
        BASIC: 999,
        PRO: 2499,
        ENTERPRISE: 4999
      }
      updateData.amount = planPrices[plan as keyof typeof planPrices] || 999
    }

    if (status) {
      updateData.status = status
    }

    const updatedSubscription = await db.subscription.update({
      where: { restaurantId },
      data: updateData
    })

    // Log the subscription update
    await AuditService.log({
      action: AuditAction.UPDATE,
      entityType: 'subscription',
      entityId: existingSubscription.id,
      oldValues: JSON.stringify(oldValues),
      newValues: JSON.stringify({
        plan: updatedSubscription.plan,
        status: updatedSubscription.status,
        amount: updatedSubscription.amount
      }),
      restaurantId,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      securityLevel: SecurityLevel.MEDIUM
    })

    return NextResponse.json({
      subscription: updatedSubscription,
      message: 'Subscription updated successfully'
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    const existingSubscription = await db.subscription.findUnique({
      where: { restaurantId }
    })

    if (!existingSubscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    await db.subscription.delete({
      where: { restaurantId }
    })

    // Log the subscription deletion
    await AuditService.log({
      action: AuditAction.DELETE,
      entityType: 'subscription',
      entityId: existingSubscription.id,
      changes: JSON.stringify({
        plan: existingSubscription.plan,
        status: existingSubscription.status,
        amount: existingSubscription.amount
      }),
      restaurantId,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      securityLevel: SecurityLevel.HIGH
    })

    return NextResponse.json({
      message: 'Subscription cancelled successfully'
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}