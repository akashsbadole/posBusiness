import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { user, restaurant, password } = await request.json()

    // Validate required fields
    if (!user?.name || !user?.email || !user?.phone || !password) {
      return NextResponse.json(
        { error: 'All user fields are required' },
        { status: 400 }
      )
    }

    if (!restaurant?.name || !restaurant?.address || !restaurant?.phone || !restaurant?.email) {
      return NextResponse.json(
        { error: 'All restaurant fields are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(user.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (!emailRegex.test(restaurant.email)) {
      return NextResponse.json(
        { error: 'Invalid restaurant email format' },
        { status: 400 }
      )
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(user.phone.replace(/[\s\-\(\)]/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid user phone number format' },
        { status: 400 }
      )
    }

    if (!phoneRegex.test(restaurant.phone.replace(/[\s\-\(\)]/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid restaurant phone number format' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: user.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Check if restaurant email already exists
    const existingRestaurant = await db.restaurant.findFirst({
      where: { 
        OR: [
          { email: restaurant.email },
          { phone: restaurant.phone }
        ]
      }
    })

    if (existingRestaurant) {
      return NextResponse.json(
        { error: 'Restaurant with this email or phone already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Use transaction to ensure all records are created or none
    const result = await db.$transaction(async (prisma) => {
      // Create user
      const newUser = await prisma.user.create({
        data: {
          id: uuidv4(),
          name: user.name,
          email: user.email,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Create restaurant
      const newRestaurant = await prisma.restaurant.create({
        data: {
          id: uuidv4(),
          name: restaurant.name,
          address: restaurant.address,
          phone: restaurant.phone,
          email: restaurant.email,
          gstNumber: restaurant.gstNumber || null,
          description: `${restaurant.name} - Restaurant Management System`,
          isActive: true,
          ownerId: newUser.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Create default outlet
      const newOutlet = await prisma.outlet.create({
        data: {
          id: uuidv4(),
          name: 'Main Branch',
          address: restaurant.address,
          phone: restaurant.phone,
          isActive: true,
          restaurantId: newRestaurant.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Create staff record for the user
      const newStaff = await prisma.staff.create({
        data: {
          id: uuidv4(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: 'OWNER',
          password: hashedPassword,
          isActive: true,
          userId: newUser.id,
          restaurantId: newRestaurant.id,
          outletId: newOutlet.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Create default subscription (14-day trial)
      const trialEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      const subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      
      const newSubscription = await prisma.subscription.create({
        data: {
          id: uuidv4(),
          plan: 'BASIC',
          status: 'TRIAL',
          startDate: new Date(),
          endDate: subscriptionEndDate,
          trialEndsAt: trialEndDate,
          lastBillingAt: new Date(),
          nextBillingAt: subscriptionEndDate,
          amount: 0,
          restaurantId: newRestaurant.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      return { newUser, newRestaurant, newOutlet, newStaff, newSubscription }
    })

    const { newUser, newRestaurant, newOutlet, newStaff } = result

    // Create default categories
    const categories = await Promise.all([
      db.category.create({
        data: {
          id: uuidv4(),
          name: 'Starters',
          description: 'Appetizers and starters',
          displayOrder: 1,
          isActive: true,
          restaurantId: newRestaurant.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      db.category.create({
        data: {
          id: uuidv4(),
          name: 'Main Course',
          description: 'Main course dishes',
          displayOrder: 2,
          isActive: true,
          restaurantId: newRestaurant.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      db.category.create({
        data: {
          id: uuidv4(),
          name: 'Beverages',
          description: 'Drinks and beverages',
          displayOrder: 3,
          isActive: true,
          restaurantId: newRestaurant.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      db.category.create({
        data: {
          id: uuidv4(),
          name: 'Desserts',
          description: 'Sweet dishes and desserts',
          displayOrder: 4,
          isActive: true,
          restaurantId: newRestaurant.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    ])

    // Create default tables
    const tables = await Promise.all([
      db.table.create({
        data: {
          id: uuidv4(),
          number: 1,
          capacity: 4,
          status: 'AVAILABLE',
          restaurantId: newRestaurant.id,
          outletId: newOutlet.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      db.table.create({
        data: {
          id: uuidv4(),
          number: 2,
          capacity: 4,
          status: 'AVAILABLE',
          restaurantId: newRestaurant.id,
          outletId: newOutlet.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      db.table.create({
        data: {
          id: uuidv4(),
          number: 3,
          capacity: 6,
          status: 'AVAILABLE',
          restaurantId: newRestaurant.id,
          outletId: newOutlet.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    ])

    // Generate token for immediate login
    const token = Buffer.from(JSON.stringify({
      userId: newUser.id,
      restaurantId: newRestaurant.id,
      email: newUser.email,
      timestamp: Date.now()
    })).toString('base64')

    const response = {
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        restaurantId: newRestaurant.id,
        role: 'OWNER'
      },
      restaurant: {
        id: newRestaurant.id,
        name: newRestaurant.name,
        address: newRestaurant.address,
        phone: newRestaurant.phone,
        email: newRestaurant.email,
        gstNumber: newRestaurant.gstNumber
      },
      message: 'Registration successful! Your restaurant has been set up with default categories and tables.'
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}