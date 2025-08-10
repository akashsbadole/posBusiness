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
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const offset = (page - 1) * limit;

    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (type) whereClause.type = type;

    const locations = await db.location.findMany({
      where: whereClause,
      include: {
        manager: true,
        staff: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        inventory: {
          include: {
            menuItem: true
          }
        },
        _count: {
          select: {
            orders: true,
            staff: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    const total = await db.location.count({ where: whereClause });

    // Calculate stats for each location
    const locationsWithStats = await Promise.all(locations.map(async location => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayOrders = await db.order.findMany({
        where: {
          locationId: location.id,
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      });

      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const todayOrdersCount = todayOrders.length;

      const inventoryStats = await db.menuItem.aggregate({
        where: {
          locationId: location.id
        },
        _sum: {
          stock: true,
          cost: true
        },
        _count: {
          _all: true
        }
      });

      const lowStockItems = await db.menuItem.count({
        where: {
          locationId: location.id,
          stock: {
            lte: db.menuItem.fields.reorderLevel
          }
        }
      });

      const outOfStockItems = await db.menuItem.count({
        where: {
          locationId: location.id,
          stock: 0
        }
      });

      return {
        ...location,
        stats: {
          todayRevenue,
          todayOrders: todayOrdersCount,
          totalStaff: location._count.staff,
          totalOrders: location._count.orders,
          inventory: {
            totalItems: inventoryStats._count._all,
            totalValue: (inventoryStats._sum.stock || 0) * (inventoryStats._sum.cost || 0),
            lowStockItems,
            outOfStockItems
          }
        }
      };
    }));

    return NextResponse.json({
      locations: locationsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
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
      name,
      address,
      city,
      state,
      pincode,
      phone,
      email,
      type,
      capacity,
      gstNumber,
      openingHours,
      managerId
    } = body;

    // Create location
    const location = await db.location.create({
      data: {
        name,
        address,
        city,
        state,
        pincode,
        phone,
        email,
        type,
        capacity: capacity || 0,
        gstNumber,
        openingHours: openingHours || {},
        managerId,
        status: 'active'
      },
      include: {
        manager: true,
        staff: true
      }
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}