import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { RoleLevel, Module, PermissionAction } from '@prisma/client'

export interface EnhancedAuthSession {
  userId: string
  restaurantId: string
  email: string
  staffId?: string
  roleId?: string
  roleLevel?: RoleLevel
  permissions?: string[]
  isOwner?: boolean
}

export interface PermissionCheck {
  module: Module
  action: PermissionAction
  resource?: string
}

export async function enhancedAuth(request?: NextRequest): Promise<EnhancedAuthSession | null> {
  try {
    // For client-side components, check localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        return null
      }

      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
        
        // Verify token is not expired (24 hours)
        if (decoded.timestamp && Date.now() - decoded.timestamp > 24 * 60 * 60 * 1000) {
          localStorage.removeItem('auth_token')
          return null
        }

        return await buildEnhancedSession(decoded)
      } catch (error) {
        console.error('Error decoding auth token:', error)
        localStorage.removeItem('auth_token')
        return null
      }
    }

    // For server-side API routes, check Authorization header
    if (request) {
      const authHeader = request.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null
      }

      const token = authHeader.substring(7)
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
        
        // Verify token is not expired (24 hours)
        if (decoded.timestamp && Date.now() - decoded.timestamp > 24 * 60 * 60 * 1000) {
          return null
        }

        return await buildEnhancedSession(decoded)
      } catch (error) {
        console.error('Error decoding auth token:', error)
        return null
      }
    }

    return null
  } catch (error) {
    console.error('Enhanced auth error:', error)
    return null
  }
}

async function buildEnhancedSession(decoded: any): Promise<EnhancedAuthSession | null> {
  try {
    // Get user with restaurant and staff information
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      include: {
        restaurants: {
          where: { id: decoded.restaurantId }
        },
        staff: {
          where: { 
            restaurantId: decoded.restaurantId,
            isActive: true
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
        }
      }
    })

    if (!user || user.restaurants.length === 0) {
      return null
    }

    const isOwner = user.restaurants.length > 0
    const staff = user.staff[0] // User should have at most one active staff record per restaurant

    // Build enhanced session
    const session: EnhancedAuthSession = {
      userId: user.id,
      restaurantId: decoded.restaurantId,
      email: user.email,
      isOwner
    }

    // Add staff and role information if available
    if (staff) {
      session.staffId = staff.id
      
      if (staff.assignedRole) {
        session.roleId = staff.assignedRole.id
        session.roleLevel = staff.assignedRole.level
        
        // Add permissions for non-super admin roles
        if (staff.assignedRole.level !== RoleLevel.SUPER_ADMIN) {
          session.permissions = staff.assignedRole.rolePermissions.map(
            rp => rp.permission.name
          )
        }
      }
    }

    return session
  } catch (error) {
    console.error('Error building enhanced session:', error)
    return null
  }
}

// Check if user has a specific permission
export async function hasPermission(
  request: NextRequest | undefined,
  permission: PermissionCheck
): Promise<boolean> {
  const session = await enhancedAuth(request)
  if (!session) {
    return false
  }

  // Super admin has all permissions
  if (session.roleLevel === RoleLevel.SUPER_ADMIN) {
    return true
  }

  // Restaurant owners have all permissions for their restaurant
  if (session.isOwner) {
    return true
  }

  // Check specific permissions
  if (!session.permissions) {
    return false
  }

  const permissionName = `${permission.module}:${permission.action}`.toLowerCase()
  return session.permissions.includes(permissionName)
}

// Check if user has any of the specified permissions
export async function hasAnyPermission(
  request: NextRequest | undefined,
  permissions: PermissionCheck[]
): Promise<boolean> {
  for (const permission of permissions) {
    if (await hasPermission(request, permission)) {
      return true
    }
  }
  return false
}

// Check if user has all of the specified permissions
export async function hasAllPermissions(
  request: NextRequest | undefined,
  permissions: PermissionCheck[]
): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await hasPermission(request, permission))) {
      return false
    }
  }
  return true
}

// Check if user has at least a specific role level
export async function hasRoleLevel(
  request: NextRequest | undefined,
  minimumLevel: RoleLevel
): Promise<boolean> {
  const session = await enhancedAuth(request)
  if (!session || !session.roleLevel) {
    return false
  }

  const levelHierarchy = {
    [RoleLevel.SUPER_ADMIN]: 3,
    [RoleLevel.STORE_ADMIN]: 2,
    [RoleLevel.STORE_STAFF]: 1
  }

  return levelHierarchy[session.roleLevel] >= levelHierarchy[minimumLevel]
}

// Middleware factory for protecting routes with permissions
export function requirePermission(permission: PermissionCheck) {
  return async (request: NextRequest): Promise<{ success: boolean; session?: EnhancedAuthSession; error?: string }> => {
    const session = await enhancedAuth(request)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const hasAccess = await hasPermission(request, permission)
    if (!hasAccess) {
      return { success: false, error: 'Insufficient permissions' }
    }

    return { success: true, session }
  }
}

// Middleware factory for protecting routes with role level
export function requireRoleLevel(minimumLevel: RoleLevel) {
  return async (request: NextRequest): Promise<{ success: boolean; session?: EnhancedAuthSession; error?: string }> => {
    const session = await enhancedAuth(request)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const hasAccess = await hasRoleLevel(request, minimumLevel)
    if (!hasAccess) {
      return { success: false, error: 'Insufficient role level' }
    }

    return { success: true, session }
  }
}

// Helper function to get current user's permissions
export async function getCurrentUserPermissions(request?: NextRequest): Promise<string[]> {
  const session = await enhancedAuth(request)
  if (!session) {
    return []
  }

  // Super admin has all permissions
  if (session.roleLevel === RoleLevel.SUPER_ADMIN || session.isOwner) {
    // Return all system permissions
    const allPermissions = await db.permission.findMany({
      where: { isSystem: true }
    })
    return allPermissions.map(p => p.name)
  }

  return session.permissions || []
}

// Client-side hook for permission checking
export function usePermission() {
  const checkPermission = async (permission: PermissionCheck): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/check-permission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permission }),
      })
      
      if (response.ok) {
        const result = await response.json()
        return result.hasPermission
      }
      return false
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }

  const checkRoleLevel = async (minimumLevel: RoleLevel): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/check-role-level', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ minimumLevel }),
      })
      
      if (response.ok) {
        const result = await response.json()
        return result.hasRoleLevel
      }
      return false
    } catch (error) {
      console.error('Error checking role level:', error)
      return false
    }
  }

  return { checkPermission, checkRoleLevel }
}