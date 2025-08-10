import { NextRequest, NextResponse } from 'next/server'
import { Module, PermissionAction, RoleLevel } from '@prisma/client'
import { enhancedAuth } from './auth-enhanced'
import { db } from './db'

export interface PermissionCheck {
  module: Module
  action: PermissionAction
  resource?: string
}

export interface PermissionMiddlewareOptions {
  permission?: PermissionCheck
  roleLevel?: RoleLevel
  requireOwner?: boolean
  requireAuth?: boolean
}

/**
 * Middleware to check permissions for API routes
 * @param options Permission checking options
 * @returns NextResponse if permission check fails, null if successful
 */
export async function permissionMiddleware(
  request: NextRequest,
  options: PermissionMiddlewareOptions
): Promise<NextResponse | null> {
  try {
    // Check authentication first if required
    if (options.requireAuth !== false) {
      const authResult = await enhancedAuth(request)
      if (!authResult) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
    }

    // Get user from request
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    // Check role level if specified
    if (options.roleLevel) {
      const hasRoleLevel = await checkUserRoleLevel(user.id, options.roleLevel)
      if (!hasRoleLevel) {
        return NextResponse.json(
          { error: 'Insufficient role level' },
          { status: 403 }
        )
      }
    }

    // Check ownership if required
    if (options.requireOwner) {
      const isOwner = await checkUserOwnership(user.id)
      if (!isOwner) {
        return NextResponse.json(
          { error: 'Owner access required' },
          { status: 403 }
        )
      }
    }

    // Check specific permission if specified
    if (options.permission) {
      const hasPermission = await checkUserPermission(user.id, options.permission)
      if (!hasPermission) {
        return NextResponse.json(
          { error: 'Permission denied' },
          { status: 403 }
        )
      }
    }

    // All checks passed
    return null
  } catch (error) {
    console.error('Permission middleware error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to get user from request
 */
async function getUserFromRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
    
    // Verify token is not expired (24 hours)
    if (decoded.timestamp && Date.now() - decoded.timestamp > 24 * 60 * 60 * 1000) {
      return null
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      include: {
        staff: {
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
        }
      }
    })

    return user
  } catch (error) {
    console.error('Error getting user from request:', error)
    return null
  }
}

/**
 * Helper function to check user role level
 */
async function checkUserRoleLevel(userId: string, requiredLevel: RoleLevel): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        staff: {
          include: {
            assignedRole: true
          }
        }
      }
    })

    if (!user?.staff?.assignedRole) {
      return false
    }

    const levelHierarchy = {
      [RoleLevel.SUPER_ADMIN]: 3,
      [RoleLevel.STORE_ADMIN]: 2,
      [RoleLevel.STORE_STAFF]: 1
    }

    return levelHierarchy[user.staff.assignedRole.level] >= levelHierarchy[requiredLevel]
  } catch (error) {
    console.error('Error checking user role level:', error)
    return false
  }
}

/**
 * Helper function to check user ownership
 */
async function checkUserOwnership(userId: string): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        staff: true
      }
    })

    return user?.staff?.isOwner || false
  } catch (error) {
    console.error('Error checking user ownership:', error)
    return false
  }
}

/**
 * Helper function to check user permission
 */
async function checkUserPermission(userId: string, permission: PermissionCheck): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        staff: {
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
        }
      }
    })

    if (!user?.staff?.assignedRole) {
      return false
    }

    // Super admins and owners have all permissions
    if (user.staff.assignedRole.level === RoleLevel.SUPER_ADMIN || user.staff.isOwner) {
      return true
    }

    // Check specific permission
    const permissionName = `${permission.module}:${permission.action}`.toLowerCase()
    const hasPermission = user.staff.assignedRole.rolePermissions.some(
      rp => rp.permission.name.toLowerCase() === permissionName
    )

    return hasPermission
  } catch (error) {
    console.error('Error checking user permission:', error)
    return false
  }
}

/**
 * Higher-order function to wrap API handlers with permission checks
 */
export function withPermission(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: PermissionMiddlewareOptions
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const permissionResult = await permissionMiddleware(request, options)
    if (permissionResult) {
      return permissionResult
    }
    return handler(request, context)
  }
}

/**
 * Predefined permission middleware configurations
 */
export const requireAuth = (request: NextRequest) => 
  permissionMiddleware(request, { requireAuth: true })

export const requireSuperAdmin = (request: NextRequest) => 
  permissionMiddleware(request, { roleLevel: RoleLevel.SUPER_ADMIN })

export const requireStoreAdmin = (request: NextRequest) => 
  permissionMiddleware(request, { roleLevel: RoleLevel.STORE_ADMIN })

export const requireOwner = (request: NextRequest) => 
  permissionMiddleware(request, { requireOwner: true })

export const requireMenuRead = (request: NextRequest) => 
  permissionMiddleware(request, { permission: { module: Module.MENU, action: PermissionAction.READ } })

export const requireMenuCreate = (request: NextRequest) => 
  permissionMiddleware(request, { permission: { module: Module.MENU, action: PermissionAction.CREATE } })

export const requireMenuUpdate = (request: NextRequest) => 
  permissionMiddleware(request, { permission: { module: Module.MENU, action: PermissionAction.UPDATE } })

export const requireMenuDelete = (request: NextRequest) => 
  permissionMiddleware(request, { permission: { module: Module.MENU, action: PermissionAction.DELETE } })

export const requireMenuManage = (request: NextRequest) => 
  permissionMiddleware(request, { permission: { module: Module.MENU, action: PermissionAction.MANAGE } })

export const requireOrdersRead = (request: NextRequest) => 
  permissionMiddleware(request, { permission: { module: Module.ORDERS, action: PermissionAction.READ } })

export const requireOrdersCreate = (request: NextRequest) => 
  permissionMiddleware(request, { permission: { module: Module.ORDERS, action: PermissionAction.CREATE } })

export const requireOrdersUpdate = (request: NextRequest) => 
  permissionMiddleware(request, { permission: { module: Module.ORDERS, action: PermissionAction.UPDATE } })

export const requireOrdersDelete = (request: NextRequest) => 
  permissionMiddleware(request, { permission: { module: Module.ORDERS, action: PermissionAction.DELETE } })

export const requireOrdersManage = (request: NextRequest) => 
  permissionMiddleware(request, { permission: { module: Module.ORDERS, action: PermissionAction.MANAGE } })

export const requireStaffRead = (request: NextRequest) => 
  permissionMiddleware(request, { permission: { module: Module.STAFF, action: PermissionAction.READ } })

export const requireStaffCreate = (request: NextRequest) => 
  permissionMiddleware(request, { permission: { module: Module.STAFF, action: PermissionAction.CREATE } })

export const requireStaffUpdate = (request: NextRequest) => 
  permissionMiddleware(request, { permission: { module: Module.STAFF, action: PermissionAction.UPDATE } })

export const requireStaffDelete = (request: NextRequest) => 
  permissionMiddleware(request, { permission: { module: Module.STAFF, action: PermissionAction.DELETE } })

export const requireStaffManage = (request: NextRequest) => 
  permissionMiddleware(request, { permission: { module: Module.STAFF, action: PermissionAction.MANAGE } })

export const requireSettingsRead = (request: NextRequest) => 
  permissionMiddleware(request, { permission: { module: Module.SETTINGS, action: PermissionAction.READ } })

export const requireSettingsManage = (request: NextRequest) => 
  permissionMiddleware(request, { permission: { module: Module.SETTINGS, action: PermissionAction.MANAGE } })