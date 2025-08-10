import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PUT /api/staff/[id]/role - Assign or update staff role
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { roleId } = body

    if (!roleId) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 })
    }

    // Get the staff member
    const staff = await db.staff.findUnique({
      where: { id: params.id },
      include: {
        restaurant: true
      }
    })

    if (!staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    // Check if user has permission to manage staff in this restaurant
    const currentUser = await db.staff.findFirst({
      where: {
        userId: session.user.id,
        restaurantId: staff.restaurantId
      }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get the role to assign
    const role = await db.role.findUnique({
      where: { id: roleId }
    })

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    // Check if role belongs to the same restaurant or is a system role
    if (role.restaurantId && role.restaurantId !== staff.restaurantId && !role.isSystem) {
      return NextResponse.json({ error: 'Role does not belong to this restaurant' }, { status: 400 })
    }

    // Update the staff member's role
    const updatedStaff = await db.staff.update({
      where: { id: params.id },
      data: {
        roleId: role.id
      },
      include: {
        assignedRole: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedStaff)
  } catch (error) {
    console.error('Error updating staff role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/staff/[id]/role - Remove staff role assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the staff member
    const staff = await db.staff.findUnique({
      where: { id: params.id },
      include: {
        restaurant: true
      }
    })

    if (!staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    // Check if user has permission to manage staff in this restaurant
    const currentUser = await db.staff.findFirst({
      where: {
        userId: session.user.id,
        restaurantId: staff.restaurantId
      }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Remove the staff member's role
    const updatedStaff = await db.staff.update({
      where: { id: params.id },
      data: {
        roleId: null
      }
    })

    return NextResponse.json(updatedStaff)
  } catch (error) {
    console.error('Error removing staff role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}