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
    const customerId = searchParams.get('customerId');
    const programId = searchParams.get('programId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const offset = (page - 1) * limit;

    const whereClause: any = {};
    if (customerId) whereClause.customerId = customerId;
    if (programId) whereClause.programId = programId;

    const customerLoyalties = await db.customerLoyalty.findMany({
      where: whereClause,
      include: {
        customer: true,
        program: {
          include: {
            tiers: true
          }
        },
        points: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      },
      skip: offset,
      take: limit
    });

    const total = await db.customerLoyalty.count({ where: whereClause });

    // Calculate current tier for each customer
    const customerLoyaltiesWithTier = customerLoyalties.map(cl => {
      const currentTier = cl.program.tiers
        .filter(tier => cl.currentPoints >= tier.minPoints)
        .sort((a, b) => b.minPoints - a.minPoints)[0];

      return {
        ...cl,
        currentTier: currentTier || null
      };
    });

    return NextResponse.json({
      customerLoyalties: customerLoyaltiesWithTier,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customer loyalty data:', error);
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
    const { customerId, programId } = body;

    // Check if customer is already enrolled
    const existingEnrollment = await db.customerLoyalty.findFirst({
      where: {
        customerId,
        programId
      }
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Customer already enrolled in this program' }, { status: 400 });
    }

    // Get program details
    const program = await db.loyaltyProgram.findUnique({
      where: { id: programId },
      include: { tiers: true }
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Enroll customer in program
    const customerLoyalty = await db.customerLoyalty.create({
      data: {
        customerId,
        programId,
        currentPoints: 0,
        lifetimePoints: 0,
        joinDate: new Date(),
        lastActivity: new Date()
      },
      include: {
        customer: true,
        program: true
      }
    });

    return NextResponse.json(customerLoyalty, { status: 201 });
  } catch (error) {
    console.error('Error enrolling customer in loyalty program:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}