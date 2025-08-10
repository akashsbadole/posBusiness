import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/roles/[id] - Get a specific role
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = await db.role.findUnique({
      where: { id: params.id },
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
      }
    })

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    // Check if user has access to this role's restaurant
    const staff = await db.staff.findFirst({
      where: {
        userId: session.user.id,
        restaurantId: role.restaurantId
      }
    })

    if (!staff && !role.isSystem) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json(role)
  } catch (error) {
    console.error('Error fetching role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/roles/[id] - Update a role
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
    const { name, description, level, permissionIds } = body

    // Get the existing role
    const existingRole = await db.role.findUnique({
      where: { id: params.id }
    })

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    // Cannot modify system roles
    if (existingRole.isSystem) {
      return NextResponse.json({ error: 'Cannot modify system roles' }, { status: 403 })
    }

    // Check if user has permission to update this role
    const staff = await db.staff.findFirst({
      where: {
        userId: session.user.id,
        restaurantId: existingRole.restaurantId
      }
    })

    if (!staff) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if role name already exists (excluding current role)
    if (name && name !== existingRole.name) {
      const nameExists = await db.role.findFirst({
        where: {
          name,
          restaurantId: existingRole.restaurantId,
          NOT: { id: params.id }
        }
      })

      if (nameExists) {
        return NextResponse.json({ error: 'Role with this name already exists' }, { status: 400 })
      }
    }

    // Update the role
    const updatedRole = await db.role.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(level && { level })
      }
    })

    // Update permissions if provided
    if (permissionIds !== undefined) {
      // Remove existing permissions
      await db.rolePermission.deleteMany({
        where: { roleId: params.id }
      })

      // Add new permissions
      if (permissionIds.length > 0) {
        await db.rolePermission.createMany({
          data: permissionIds.map((permissionId: string) => ({
            roleId: params.id,
            permissionId
          }))
        })
      }
    }

    // Fetch the updated role with permissions
    const role = await db.role.findUnique({
      where: { id: params.id },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    })

    return NextResponse.json(role)
  } catch (error) {
    console.error('Error updating role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/roles/[id] - Delete a role
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the existing role
    const existingRole = await db.role.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            staff: true
          }
        }
      }
    })

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    // Cannot delete system roles
    if (existingRole.isSystem) {
      return NextResponse.json({ error: 'Cannot delete system roles' }, { status: 403 })
    }

    // Cannot delete roles that have assigned staff
    if (existingRole._count.staff > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete role with assigned staff. Please reassign staff first.' 
      }, { status: 400 })
    }

    // Check if user has permission to delete this role
    const staff = await db.staff.findFirst({
      where: {
        userId: session.user.id,
        restaurantId: existingRole.restaurantId
      }
    })

    if (!staff) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Delete the role (this will cascade delete role permissions)
    await db.role.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Role deleted successfully' })
  } catch (error) {
    console.error('Error deleting role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}