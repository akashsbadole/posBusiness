import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status, paymentStatus, specialInstructions } = body;

    const order = await db.order.findUnique({
      where: { id },
      include: { payments: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (specialInstructions !== undefined) updateData.specialInstructions = specialInstructions;

    const updatedOrder = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        customer: true,
        location: true,
        payments: true
      }
    });

    // Update payment status if provided
    if (paymentStatus && order.payments.length > 0) {
      await db.payment.update({
        where: { id: order.payments[0].id },
        data: { status: paymentStatus }
      });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}