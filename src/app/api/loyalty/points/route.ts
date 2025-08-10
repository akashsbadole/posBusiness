import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      customerId,
      programId,
      points,
      type,
      description,
      orderId,
      rewardId
    } = body;

    // Validate required fields
    if (!customerId || !programId || !points || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get customer loyalty record
    const customerLoyalty = await db.customerLoyalty.findFirst({
      where: {
        customerId,
        programId
      }
    });

    if (!customerLoyalty) {
      return NextResponse.json({ error: 'Customer not enrolled in this program' }, { status: 404 });
    }

    // Get program details
    const program = await db.loyaltyProgram.findUnique({
      where: { id: programId }
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // For redemptions, check if customer has enough points
    if (type === 'redemption' && customerLoyalty.currentPoints < Math.abs(points)) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
    }

    // Create loyalty points transaction
    const loyaltyPoint = await db.loyaltyPoint.create({
      data: {
        customerId,
        programId,
        points: type === 'redemption' ? -Math.abs(points) : Math.abs(points),
        type,
        description,
        orderId,
        rewardId
      }
    });

    // Update customer loyalty points
    const updatedCustomerLoyalty = await db.customerLoyalty.update({
      where: { id: customerLoyalty.id },
      data: {
        currentPoints: {
          [type === 'redemption' ? 'decrement' : 'increment']: Math.abs(points)
        },
        lifetimePoints: {
          increment: type === 'redemption' ? 0 : Math.abs(points)
        },
        lastActivity: new Date()
      },
      include: {
        customer: true,
        program: {
          include: {
            tiers: true
          }
        }
      }
    });

    // Check if customer tier has changed
    const newTier = updatedCustomerLoyalty.program.tiers
      .filter(tier => updatedCustomerLoyalty.currentPoints >= tier.minPoints)
      .sort((a, b) => b.minPoints - a.minPoints)[0];

    // If tier changed, create a notification
    if (newTier && newTier.name !== customerLoyalty.currentTier) {
      await db.notification.create({
        data: {
          title: 'Tier Upgrade!',
          message: `Congratulations! You've been upgraded to ${newTier.name} tier!`,
          type: 'tier_upgrade',
          customerId,
          data: {
            oldTier: customerLoyalty.currentTier,
            newTier: newTier.name,
            programId
          }
        }
      });
    }

    return NextResponse.json({
      loyaltyPoint,
      customerLoyalty: updatedCustomerLoyalty,
      tierUpgrade: newTier && newTier.name !== customerLoyalty.currentTier ? newTier : null
    });
  } catch (error) {
    console.error('Error processing loyalty points:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const programId = searchParams.get('programId');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const offset = (page - 1) * limit;

    const whereClause: any = {};
    if (customerId) whereClause.customerId = customerId;
    if (programId) whereClause.programId = programId;
    if (type) whereClause.type = type;

    const points = await db.loyaltyPoint.findMany({
      where: whereClause,
      include: {
        customer: true,
        order: true,
        reward: true
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    const total = await db.loyaltyPoint.count({ where: whereClause });

    return NextResponse.json({
      points,
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