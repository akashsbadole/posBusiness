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
    const pincode = searchParams.get('pincode');
    const active = searchParams.get('active');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const offset = (page - 1) * limit;

    const whereClause: any = {};
    if (locationId) whereClause.locationId = locationId;
    if (restaurantId) whereClause.location = { restaurantId };
    if (pincode) whereClause.pincode = pincode;
    if (active === 'true') whereClause.isActive = true;

    const deliveryZones = await db.deliveryZone.findMany({
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

    const total = await db.deliveryZone.count({ where: whereClause });

    return NextResponse.json({
      deliveryZones,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching delivery zones:', error);
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
      name,
      pincode,
      area,
      city,
      state,
      deliveryFee,
      estimatedTime,
      minOrderAmount
    } = body;

    // Validate required fields
    if (!locationId || !name || !pincode || !deliveryFee || !estimatedTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if location exists
    const location = await db.location.findUnique({
      where: { id: locationId }
    });

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Check if delivery zone already exists for this pincode and location
    const existingZone = await db.deliveryZone.findFirst({
      where: {
        locationId,
        pincode
      }
    });

    if (existingZone) {
      return NextResponse.json({ error: 'Delivery zone already exists for this PIN code' }, { status: 400 });
    }

    // Create delivery zone
    const deliveryZone = await db.deliveryZone.create({
      data: {
        locationId,
        name,
        pincode,
        area,
        city: city || location.city,
        state: state || location.state,
        deliveryFee,
        estimatedTime,
        minOrderAmount: minOrderAmount || null
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

    return NextResponse.json(deliveryZone, { status: 201 });
  } catch (error) {
    console.error('Error creating delivery zone:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}