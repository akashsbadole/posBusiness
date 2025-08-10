import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { RoleLevel, Module, PermissionAction } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/roles - Get all roles for a restaurant
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 })
    }

    // Check if user has permission to view roles
    const staff = await db.staff.findFirst({
      where: {
        userId: session.user.id,
        restaurantId
      }
    })

    if (!staff) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const roles = await db.role.findMany({
      where: {
        OR: [
          { restaurantId: restaurantId },
          { isSystem: true } // Include system roles
        ]
      },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        },
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true
          }
        },
        _count: {
          select: {
            staff: true
          }
        }
      },
      orderBy: [
        { level: 'desc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(roles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/roles - Create a new role
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, level, restaurantId, permissionIds } = body

    if (!name || !level || !restaurantId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user has permission to create roles
    const staff = await db.staff.findFirst({
      where: {
        userId: session.user.id,
        restaurantId
      }
    })

    if (!staff) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if role name already exists for this restaurant
    const existingRole = await db.role.findFirst({
      where: {
        name,
        restaurantId
      }
    })

    if (existingRole) {
      return NextResponse.json({ error: 'Role with this name already exists' }, { status: 400 })
    }

    // Create the role
    const role = await db.role.create({
      data: {
        name,
        description,
        level,
        restaurantId,
        isSystem: false
      }
    })

    // Add permissions if provided
    if (permissionIds && permissionIds.length > 0) {
      await db.rolePermission.createMany({
        data: permissionIds.map((permissionId: string) => ({
          roleId: role.id,
          permissionId
        }))
      })
    }

    // Fetch the created role with permissions
    const createdRole = await db.role.findUnique({
      where: { id: role.id },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    })

    return NextResponse.json(createdRole, { status: 201 })
  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}