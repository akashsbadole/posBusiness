import { NextRequest, NextResponse } from 'next/server'
import { enhancedAuth, getCurrentUserPermissions } from '@/lib/auth-enhanced'
import { RoleLevel } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await enhancedAuth(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const permissions = await getCurrentUserPermissions(request)

    return NextResponse.json({
      permissions,
      roleLevel: session.roleLevel,
      isOwner: session.isOwner,
      isSuperAdmin: session.roleLevel === RoleLevel.SUPER_ADMIN,
      isStoreAdmin: session.roleLevel === RoleLevel.STORE_ADMIN,
      isStoreStaff: session.roleLevel === RoleLevel.STORE_STAFF,
    })
  } catch (error) {
    console.error('Error fetching user permissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}