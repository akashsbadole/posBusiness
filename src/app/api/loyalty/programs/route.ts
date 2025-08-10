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
    const programId = searchParams.get('programId');

    const whereClause: any = {};
    if (programId) {
      whereClause.id = programId;
    }

    const programs = await db.loyaltyProgram.findMany({
      where: whereClause,
      include: {
        tiers: true,
        rewards: true,
        customers: {
          include: {
            customer: true
          }
        }
      }
    });

    // Calculate program statistics
    const programsWithStats = await Promise.all(programs.map(async program => {
      const totalPoints = await db.loyaltyPoint.aggregate({
        where: { programId: program.id },
        _sum: { points: true }
      });

      const redeemedPoints = await db.loyaltyPoint.aggregate({
        where: { 
          programId: program.id,
          type: 'redemption'
        },
        _sum: { points: true }
      });

      const customerCount = await db.customerLoyalty.count({
        where: { programId: program.id }
      });

      return {
        ...program,
        stats: {
          totalPointsIssued: totalPoints._sum.points || 0,
          totalPointsRedeemed: Math.abs(redeemedPoints._sum.points || 0),
          customerCount,
          redemptionRate: totalPoints._sum.points ? 
            Math.abs((redeemedPoints._sum.points || 0) / totalPoints._sum.points * 100) : 0
        }
      };
    }));

    return NextResponse.json(programsWithStats);
  } catch (error) {
    console.error('Error fetching loyalty programs:', error);
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
      description,
      type,
      pointsPerRupee,
      minRedemptionPoints,
      redemptionRate,
      tiers,
      rewards
    } = body;

    // Create loyalty program
    const program = await db.loyaltyProgram.create({
      data: {
        name,
        description,
        type,
        pointsPerRupee,
        minRedemptionPoints,
        redemptionRate,
        status: 'active',
        tiers: {
          create: tiers.map((tier: any) => ({
            name: tier.name,
            description: tier.description,
            minPoints: tier.minPoints,
            maxPoints: tier.maxPoints,
            benefits: tier.benefits,
            color: tier.color,
            icon: tier.icon
          }))
        },
        rewards: {
          create: rewards.map((reward: any) => ({
            name: reward.name,
            description: reward.description,
            type: reward.type,
            pointsRequired: reward.pointsRequired,
            value: reward.value,
            isRedeemable: reward.isRedeemable,
            expiryDays: reward.expiryDays
          }))
        }
      },
      include: {
        tiers: true,
        rewards: true
      }
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error('Error creating loyalty program:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}