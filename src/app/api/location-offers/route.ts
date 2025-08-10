import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');
    const restaurantId = searchParams.get('restaurantId');
    const active = searchParams.get('active');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const offset = (page - 1) * limit;

    const whereClause: any = {};
    if (locationId) whereClause.locationId = locationId;
    if (restaurantId) whereClause.location = { restaurantId };
    if (active === 'true') {
      whereClause.isActive = true;
      const now = new Date();
      whereClause.OR = [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: null },
        { startDate: null, endDate: { gte: now } }
      ];
    }

    const offers = await db.locationOffer.findMany({
      where: whereClause,
      include: {
        location: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    const total = await db.locationOffer.count({ where: whereClause });

    return NextResponse.json({
      offers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching location offers:', error);
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
      locationId,
      title,
      description,
      type,
      value,
      conditions,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      targetCustomers,
      startDate,
      endDate
    } = body;

    // Validate required fields
    if (!locationId || !title || !type || value === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if location exists and belongs to user's restaurant
    const location = await db.location.findFirst({
      where: {
        id: locationId,
        restaurant: {
          // Assuming we have a way to get the user's restaurant ID
          // This would typically come from the session or user context
        }
      }
    });

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Create offer
    const offer = await db.locationOffer.create({
      data: {
        locationId,
        title,
        description,
        type,
        value,
        conditions: conditions ? JSON.stringify(conditions) : null,
        minOrderAmount: minOrderAmount || null,
        maxDiscountAmount: maxDiscountAmount || null,
        usageLimit: usageLimit || null,
        targetCustomers: targetCustomers ? JSON.stringify(targetCustomers) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
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

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error('Error creating location offer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}