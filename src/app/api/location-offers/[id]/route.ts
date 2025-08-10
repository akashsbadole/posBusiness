import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const offer = await db.locationOffer.findUnique({
      where: { id: params.id },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true
          }
        }
      }
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json(offer);
  } catch (error) {
    console.error('Error fetching location offer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      value,
      conditions,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      targetCustomers,
      isActive,
      startDate,
      endDate
    } = body;

    // Check if offer exists
    const existingOffer = await db.locationOffer.findUnique({
      where: { id: params.id },
      include: { location: true }
    });

    if (!existingOffer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Update offer
    const updatedOffer = await db.locationOffer.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(value !== undefined && { value }),
        ...(conditions !== undefined && { conditions: conditions ? JSON.stringify(conditions) : null }),
        ...(minOrderAmount !== undefined && { minOrderAmount }),
        ...(maxDiscountAmount !== undefined && { maxDiscountAmount }),
        ...(usageLimit !== undefined && { usageLimit }),
        ...(targetCustomers !== undefined && { targetCustomers: targetCustomers ? JSON.stringify(targetCustomers) : null }),
        ...(isActive !== undefined && { isActive }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null })
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true
          }
        }
      }
    });

    return NextResponse.json(updatedOffer);
  } catch (error) {
    console.error('Error updating location offer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if offer exists
    const existingOffer = await db.locationOffer.findUnique({
      where: { id: params.id }
    });

    if (!existingOffer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Delete offer
    await db.locationOffer.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Error deleting location offer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}