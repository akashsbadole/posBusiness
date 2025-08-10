import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const locationId = params.id;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const lowStock = searchParams.get('lowStock');
    const outOfStock = searchParams.get('outOfStock');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const offset = (page - 1) * limit;

    const whereClause: any = {
      locationId
    };

    if (category) {
      whereClause.category = category;
    }

    if (lowStock === 'true') {
      whereClause.stock = {
        lte: db.menuItem.fields.reorderLevel
      };
    }

    if (outOfStock === 'true') {
      whereClause.stock = 0;
    }

    const inventory = await db.menuItem.findMany({
      where: whereClause,
      include: {
        category: true
      },
      orderBy: [
        { category: { name: 'asc' } },
        { name: 'asc' }
      ],
      skip: offset,
      take: limit
    });

    const total = await db.menuItem.count({ where: whereClause });

    // Calculate inventory statistics
    const stats = await db.menuItem.aggregate({
      where: { locationId },
      _sum: {
        stock: true,
        cost: true
      },
      _count: {
        _all: true
      }
    });

    const lowStockCount = await db.menuItem.count({
      where: {
        locationId,
        stock: {
          lte: db.menuItem.fields.reorderLevel
        }
      }
    });

    const outOfStockCount = await db.menuItem.count({
      where: {
        locationId,
        stock: 0
      }
    });

    // Group by category
    const categoryStats = await db.menuItem.groupBy({
      by: ['category'],
      where: { locationId },
      _sum: {
        stock: true,
        cost: true
      },
      _count: {
        _all: true
      }
    });

    return NextResponse.json({
      inventory,
      stats: {
        totalItems: stats._count._all,
        totalStock: stats._sum.stock || 0,
        totalValue: (stats._sum.stock || 0) * (stats._sum.cost || 0),
        lowStockItems: lowStockCount,
        outOfStockItems: outOfStockCount,
        categories: categoryStats
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching location inventory:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const locationId = params.id;
    const body = await request.json();
    const {
      name,
      description,
      price,
      cost,
      category,
      stock,
      reorderLevel,
      isActive,
      isVegetarian
    } = body;

    // Create new menu item for this location
    const menuItem = await db.menuItem.create({
      data: {
        name,
        description,
        price,
        cost,
        category,
        stock: stock || 0,
        reorderLevel: reorderLevel || 10,
        isActive: isActive !== undefined ? isActive : true,
        isVegetarian: isVegetarian !== undefined ? isVegetarian : false,
        locationId
      },
      include: {
        category: true
      }
    });

    // Create inventory transaction
    await db.inventoryTransaction.create({
      data: {
        itemId: menuItem.id,
        locationId,
        quantity: stock || 0,
        type: 'stock_in',
        notes: 'Initial stock setup'
      }
    });

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}