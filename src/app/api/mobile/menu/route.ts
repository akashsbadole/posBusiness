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
    const locationId = searchParams.get('locationId');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const vegetarian = searchParams.get('vegetarian');

    const whereClause: any = {
      isActive: true,
      stock: { gt: 0 }
    };

    if (locationId) {
      whereClause.locationId = locationId;
    }

    if (category) {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (vegetarian === 'true') {
      whereClause.isVegetarian = true;
    }

    const menuItems = await db.menuItem.findMany({
      where: whereClause,
      include: {
        category: true,
        location: true
      },
      orderBy: [
        { category: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    // Group by category
    const groupedMenu = menuItems.reduce((acc, item) => {
      const categoryName = item.category?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(item);
      return acc;
    }, {} as Record<string, typeof menuItems>);

    return NextResponse.json({
      menu: groupedMenu,
      flat: menuItems
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}