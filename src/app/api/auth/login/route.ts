import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if user has an associated restaurant
    const restaurant = await db.restaurant.findFirst({
      where: { ownerId: user.id }
    })

    if (!restaurant) {
      // If user doesn't own a restaurant, check if they are staff
      const staff = await db.staff.findFirst({
        where: { email },
        include: {
          restaurant: true
        }
      })

      if (!staff || !staff.isActive) {
        return NextResponse.json(
          { error: 'No restaurant found for this user or account is inactive' },
          { status: 401 }
        )
      }

      // Verify password using staff record
      const isPasswordValid = await bcrypt.compare(password, staff.password)
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // Generate JWT token
      const token = Buffer.from(JSON.stringify({
        userId: user.id,
        restaurantId: staff.restaurantId,
        email: user.email,
        timestamp: Date.now()
      })).toString('base64')

      const response = {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          restaurantId: staff.restaurantId,
          role: staff.role
        },
        restaurant: {
          id: staff.restaurant.id,
          name: staff.restaurant.name,
          address: staff.restaurant.address,
          phone: staff.restaurant.phone,
          email: staff.restaurant.email,
          gstNumber: staff.restaurant.gstNumber
        }
      }

      return NextResponse.json(response)
    }

    // For restaurant owners, check staff record for password
    const staff = await db.staff.findFirst({
      where: { userId: user.id }
    })

    if (!staff || !staff.isActive) {
      return NextResponse.json(
        { error: 'Staff account not found or inactive' },
        { status: 401 }
      )
    }

    // Verify password using staff record
    const isPasswordValid = await bcrypt.compare(password, staff.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = Buffer.from(JSON.stringify({
      userId: user.id,
      restaurantId: restaurant.id,
      email: user.email,
      timestamp: Date.now()
    })).toString('base64')

    // Get user's staff role if exists
    const staffWithRole = await db.staff.findFirst({
      where: { userId: user.id },
      select: { role: true }
    })

    const response = {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        restaurantId: restaurant.id,
        role: staffWithRole?.role || 'OWNER'
      },
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        phone: restaurant.phone,
        email: restaurant.email,
        gstNumber: restaurant.gstNumber
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}