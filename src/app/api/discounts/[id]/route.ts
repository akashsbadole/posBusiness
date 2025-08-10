import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
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
      endDate,
      isActive
    } = body
    const discountId = params.id

    // Get the discount rule to verify it exists
    const existingDiscount = await db.discountRule.findUnique({
      where: { id: discountId }
    })

    if (!existingDiscount) {
      return NextResponse.json(
        { error: 'Discount rule not found' },
        { status: 404 }
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

    // Update discount rule
    const updatedDiscount = await db.discountRule.update({
      where: { id: discountId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(value !== undefined && { value }),
        ...(conditions !== undefined && { conditions: conditions ? JSON.stringify(conditions) : null }),
        ...(targetCustomers !== undefined && { targetCustomers: targetCustomers ? JSON.stringify(targetCustomers) : null }),
        ...(minPurchaseAmount !== undefined && { minPurchaseAmount }),
        ...(maxDiscountAmount !== undefined && { maxDiscountAmount }),
        ...(usageLimit !== undefined && { usageLimit }),
        ...(startDate !== undefined && { startDate }),
        ...(endDate !== undefined && { endDate }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json(updatedDiscount)
  } catch (error) {
    console.error('Error updating discount rule:', error)
    return NextResponse.json(
      { error: 'Failed to update discount rule' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const discountId = params.id

    // Get the discount rule to verify it exists
    const existingDiscount = await db.discountRule.findUnique({
      where: { id: discountId }
    })

    if (!existingDiscount) {
      return NextResponse.json(
        { error: 'Discount rule not found' },
        { status: 404 }
      )
    }

    // Delete discount rule
    await db.discountRule.delete({
      where: { id: discountId }
    })

    return NextResponse.json({ message: 'Discount rule deleted successfully' })
  } catch (error) {
    console.error('Error deleting discount rule:', error)
    return NextResponse.json(
      { error: 'Failed to delete discount rule' },
      { status: 500 }
    )
  }
}