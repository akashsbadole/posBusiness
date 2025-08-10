import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withPermission } from '@/lib/permission-middleware'
import { Module, PermissionAction } from '@prisma/client'

async function getStaffHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const outletId = searchParams.get('outletId')

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    const whereClause: any = {
      restaurantId,
      isActive: true
    }

    if (outletId) {
      whereClause.outletId = outletId
    }

    const staff = await db.staff.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        restaurantId: true,
        outletId: true
      }
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}

async function createStaffHandler(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      role,
      password,
      restaurantId,
      outletId
    } = body

    if (!name || !email || !phone || !role || !password || !restaurantId) {
      return NextResponse.json(
        { error: 'Name, email, phone, role, password, and restaurant ID are required' },
        { status: 400 }
      )
    }

    // Check if staff member already exists
    const existingStaff = await db.staff.findUnique({
      where: { email }
    })

    if (existingStaff) {
      return NextResponse.json(
        { error: 'Staff member with this email already exists' },
        { status: 400 }
      )
    }

    // Create staff member
    const staff = await db.staff.create({
      data: {
        name,
        email,
        phone,
        role,
        password, // In production, hash the password
        restaurantId,
        outletId: outletId || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        restaurantId: true,
        outletId: true
      }
    })

    return NextResponse.json(staff, { status: 201 })
  } catch (error) {
    console.error('Error creating staff:', error)
    return NextResponse.json(
      { error: 'Failed to create staff' },
      { status: 500 }
    )
  }
}

export const GET = withPermission(getStaffHandler, { permission: { module: Module.STAFF, action: PermissionAction.READ } })
export const POST = withPermission(createStaffHandler, { permission: { module: Module.STAFF, action: PermissionAction.CREATE } })