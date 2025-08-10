import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user?.customerId) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const offset = (page - 1) * limit;

    const loyaltyPoints = await db.loyaltyPoint.findMany({
      where: { customerId: session.user.customerId },
      include: {
        order: true
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    const total = await db.loyaltyPoint.count({
      where: { customerId: session.user.customerId }
    });

    // Get current balance
    const balance = await db.loyaltyPoint.aggregate({
      where: { customerId: session.user.customerId },
      _sum: { points: true }
    });

    // Get loyalty tier info
    const totalPoints = balance._sum.points || 0;
    let tier = 'Bronze';
    let nextTierPoints = 1000;
    
    if (totalPoints >= 5000) {
      tier = 'Platinum';
      nextTierPoints = 10000;
    } else if (totalPoints >= 2000) {
      tier = 'Gold';
      nextTierPoints = 5000;
    } else if (totalPoints >= 1000) {
      tier = 'Silver';
      nextTierPoints = 2000;
    }

    return NextResponse.json({
      points: loyaltyPoints,
      balance: totalPoints,
      tier,
      nextTierPoints,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching loyalty points:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}