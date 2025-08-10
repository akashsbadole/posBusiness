import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'all';
    const locationId = searchParams.get('locationId');

    const offset = (page - 1) * limit;

    const whereClause: any = {};
    if (status !== 'all') {
      whereClause.status = status;
    }
    if (locationId) {
      whereClause.locationId = locationId;
    }

    const orders = await db.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        customer: true,
        location: true,
        payments: true
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    const total = await db.order.count({ where: whereClause });

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      customerId,
      locationId,
      items,
      type = 'dine-in',
      tableNumber,
      specialInstructions,
      paymentMethod,
      discountCode
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
    }

    // Calculate total amount
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await db.menuItem.findUnique({
        where: { id: item.menuItemId }
      });

      if (!menuItem) {
        return NextResponse.json({ error: `Menu item not found: ${item.menuItemId}` }, { status: 404 });
      }

      if (menuItem.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${menuItem.name}` }, { status: 400 });
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
        specialInstructions: item.specialInstructions || null
      });
    }

    // Apply discount if provided
    let discountAmount = 0;
    let discount = null;

    if (discountCode) {
      discount = await db.discount.findFirst({
        where: {
          code: discountCode,
          isActive: true,
          validFrom: { lte: new Date() },
          validTo: { gte: new Date() }
        }
      });

      if (discount) {
        if (discount.type === 'percentage') {
          discountAmount = subtotal * (discount.value / 100);
        } else {
          discountAmount = discount.value;
        }
      }
    }

    // Calculate GST
    const gstAmount = (subtotal - discountAmount) * 0.18; // 18% GST
    const totalAmount = subtotal - discountAmount + gstAmount;

    // Create order
    const order = await db.order.create({
      data: {
        customerId,
        locationId,
        type,
        tableNumber,
        specialInstructions,
        subtotal,
        discountAmount,
        gstAmount,
        totalAmount,
        status: 'pending',
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        customer: true,
        location: true
      }
    });

    // Update inventory
    for (const item of items) {
      await db.menuItem.update({
        where: { id: item.menuItemId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    // Create payment record if payment method provided
    if (paymentMethod) {
      await db.payment.create({
        data: {
          orderId: order.id,
          amount: totalAmount,
          method: paymentMethod,
          status: 'pending'
        }
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}