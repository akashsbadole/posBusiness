import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('id');

    if (customerId) {
      // Get specific customer
      const customer = await db.customer.findUnique({
        where: { id: customerId },
        include: {
          orders: {
            include: {
              items: {
                include: {
                  menuItem: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          loyaltyPoints: true,
          addresses: true
        }
      });

      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      return NextResponse.json(customer);
    } else {
      // Get current customer from session
      if (!session.user?.customerId) {
        return NextResponse.json({ error: 'Customer not found in session' }, { status: 404 });
      }

      const customer = await db.customer.findUnique({
        where: { id: session.user.customerId },
        include: {
          orders: {
            include: {
              items: {
                include: {
                  menuItem: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          loyaltyPoints: {
            orderBy: { createdAt: 'desc' },
            take: 5
          },
          addresses: true
        }
      });

      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      return NextResponse.json(customer);
    }
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      password,
      address,
      gstNumber,
      dateOfBirth
    } = body;

    // Check if customer already exists
    const existingCustomer = await db.customer.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ]
      }
    });

    if (existingCustomer) {
      return NextResponse.json({ error: 'Customer already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create customer
    const customer = await db.customer.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        gstNumber,
        dateOfBirth,
        addresses: address ? {
          create: {
            ...address,
            isDefault: true
          }
        } : undefined
      },
      include: {
        addresses: true
      }
    });

    // Remove password from response
    const { password: _, ...customerWithoutPassword } = customer;

    return NextResponse.json(customerWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}