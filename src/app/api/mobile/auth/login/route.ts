import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, password, loginMethod = 'email' } = body;

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    let customer;

    if (loginMethod === 'email' && email) {
      customer = await db.customer.findUnique({
        where: { email }
      });
    } else if (loginMethod === 'phone' && phone) {
      customer = await db.customer.findUnique({
        where: { phone }
      });
    } else {
      return NextResponse.json({ error: 'Email or phone is required' }, { status: 400 });
    }

    if (!customer) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        customerId: customer.id,
        email: customer.email,
        phone: customer.phone
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...customerWithoutPassword } = customer;

    return NextResponse.json({
      token,
      customer: customerWithoutPassword
    });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}