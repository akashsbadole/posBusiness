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
    const { customerId, rewardId, programId } = body;

    // Validate required fields
    if (!customerId || !rewardId || !programId) {
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

    // Get reward details
    const reward = await db.loyaltyReward.findUnique({
      where: { id: rewardId }
    });

    if (!reward) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 });
    }

    if (!reward.isRedeemable) {
      return NextResponse.json({ error: 'Reward is not currently redeemable' }, { status: 400 });
    }

    // Check if customer has enough points
    if (customerLoyalty.currentPoints < reward.pointsRequired) {
      return NextResponse.json({ 
        error: 'Insufficient points',
        required: reward.pointsRequired,
        available: customerLoyalty.currentPoints
      }, { status: 400 });
    }

    // Create redemption record
    const redemption = await db.loyaltyRedemption.create({
      data: {
        customerId,
        rewardId,
        programId,
        pointsUsed: reward.pointsRequired,
        status: 'completed',
        redemptionDate: new Date()
      },
      include: {
        customer: true,
        reward: true,
        program: true
      }
    });

    // Deduct points from customer
    await db.loyaltyPoint.create({
      data: {
        customerId,
        programId,
        points: -reward.pointsRequired,
        type: 'redemption',
        description: `Redeemed reward: ${reward.name}`,
        rewardId
      }
    });

    // Update customer loyalty
    await db.customerLoyalty.update({
      where: { id: customerLoyalty.id },
      data: {
        currentPoints: {
          decrement: reward.pointsRequired
        },
        lastActivity: new Date()
      }
    });

    // Update reward redemption count
    await db.loyaltyReward.update({
      where: { id: rewardId },
      data: {
        redemptionCount: {
          increment: 1
        }
      }
    });

    // Create notification for customer
    await db.notification.create({
      data: {
        title: 'Reward Redeemed!',
        message: `You have successfully redeemed: ${reward.name}`,
        type: 'reward_redeemed',
        customerId,
        data: {
          rewardName: reward.name,
          pointsUsed: reward.pointsRequired,
          redemptionId: redemption.id
        }
      }
    });

    return NextResponse.json({
      redemption,
      message: 'Reward redeemed successfully'
    });
  } catch (error) {
    console.error('Error redeeming reward:', error);
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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const offset = (page - 1) * limit;

    const whereClause: any = {};
    if (customerId) whereClause.customerId = customerId;
    if (programId) whereClause.programId = programId;
    if (status) whereClause.status = status;

    const redemptions = await db.loyaltyRedemption.findMany({
      where: whereClause,
      include: {
        customer: true,
        reward: true,
        program: true
      },
      orderBy: { redemptionDate: 'desc' },
      skip: offset,
      take: limit
    });

    const total = await db.loyaltyRedemption.count({ where: whereClause });

    return NextResponse.json({
      redemptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching loyalty redemptions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}