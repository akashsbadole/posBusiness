import { db } from './db'
import { RoleLevel, Module, PermissionAction } from '@prisma/client'

export interface PermissionCheck {
  module: Module
  action: PermissionAction
  resource?: string
}

export interface RolePermission {
  id: string
  name: string
  description?: string
  level: RoleLevel
  permissions: Permission[]
}

export interface Permission {
  id: string
  name: string
  description?: string
  module: Module
  action: PermissionAction
  resource?: string
}

/**
 * Check if a staff member has a specific permission
 */
export async function hasPermission(
  staffId: string,
  permission: PermissionCheck
): Promise<boolean> {
  try {
    const staff = await db.staff.findUnique({
      where: { id: staffId },
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

    if (!staff || !staff.assignedRole) {
      return false
    }

    // Super admin has all permissions
    if (staff.assignedRole.level === RoleLevel.SUPER_ADMIN) {
      return true
    }

    // Check specific permissions
    const hasSpecificPermission = staff.assignedRole.rolePermissions.some(
      (rp) => {
        const p = rp.permission
        return (
          p.module === permission.module &&
          p.action === permission.action &&
          (!permission.resource || p.resource === permission.resource)
        )
      }
    )

    return hasSpecificPermission
  } catch (error) {
    console.error('Error checking permission:', error)
    return false
  }
}

/**
 * Get all permissions for a staff member
 */
export async function getStaffPermissions(staffId: string): Promise<Permission[]> {
  try {
    const staff = await db.staff.findUnique({
      where: { id: staffId },
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

    if (!staff || !staff.assignedRole) {
      return []
    }

    // Super admin has all permissions (return all system permissions)
    if (staff.assignedRole.level === RoleLevel.SUPER_ADMIN) {
      const allPermissions = await db.permission.findMany({
        where: { isSystem: true }
      })
      return allPermissions
    }

    return staff.assignedRole.rolePermissions.map((rp) => rp.permission)
  } catch (error) {
    console.error('Error getting staff permissions:', error)
    return []
  }
}

/**
 * Check if a staff member has any of the specified permissions
 */
export async function hasAnyPermission(
  staffId: string,
  permissions: PermissionCheck[]
): Promise<boolean> {
  for (const permission of permissions) {
    if (await hasPermission(staffId, permission)) {
      return true
    }
  }
  return false
}

/**
 * Check if a staff member has all of the specified permissions
 */
export async function hasAllPermissions(
  staffId: string,
  permissions: PermissionCheck[]
): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await hasPermission(staffId, permission))) {
      return false
    }
  }
  return true
}

/**
 * Get role level for a staff member
 */
export async function getStaffRoleLevel(staffId: string): Promise<RoleLevel | null> {
  try {
    const staff = await db.staff.findUnique({
      where: { id: staffId },
      include: {
        assignedRole: true
      }
    })

    return staff?.assignedRole?.level || null
  } catch (error) {
    console.error('Error getting staff role level:', error)
    return null
  }
}

/**
 * Check if staff is at least a certain role level
 */
export async function hasRoleLevel(
  staffId: string,
  minimumLevel: RoleLevel
): Promise<boolean> {
  try {
    const staffLevel = await getStaffRoleLevel(staffId)
    if (!staffLevel) return false

    const levelHierarchy = {
      [RoleLevel.SUPER_ADMIN]: 3,
      [RoleLevel.STORE_ADMIN]: 2,
      [RoleLevel.STORE_STAFF]: 1
    }

    return levelHierarchy[staffLevel] >= levelHierarchy[minimumLevel]
  } catch (error) {
    console.error('Error checking role level:', error)
    return false
  }
}

/**
 * Check if staff can access a specific restaurant
 */
export async function canAccessRestaurant(
  staffId: string,
  restaurantId: string
): Promise<boolean> {
  try {
    const staff = await db.staff.findUnique({
      where: { id: staffId }
    })

    return staff?.restaurantId === restaurantId
  } catch (error) {
    console.error('Error checking restaurant access:', error)
    return false
  }
}

/**
 * Check if staff can access a specific outlet
 */
export async function canAccessOutlet(
  staffId: string,
  outletId: string
): Promise<boolean> {
  try {
    const staff = await db.staff.findUnique({
      where: { id: staffId }
    })

    // If staff has no specific outlet, they can access all outlets in the restaurant
    if (!staff?.outletId) {
      return true
    }

    return staff.outletId === outletId
  } catch (error) {
    console.error('Error checking outlet access:', error)
    return false
  }
}

/**
 * Common permission checks for convenience
 */
export const Permissions = {
  // Dashboard
  canViewDashboard: (staffId: string) => 
    hasPermission(staffId, { module: Module.DASHBOARD, action: PermissionAction.READ }),

  // Orders
  canViewOrders: (staffId: string) => 
    hasPermission(staffId, { module: Module.ORDERS, action: PermissionAction.READ }),
  canCreateOrders: (staffId: string) => 
    hasPermission(staffId, { module: Module.ORDERS, action: PermissionAction.CREATE }),
  canUpdateOrders: (staffId: string) => 
    hasPermission(staffId, { module: Module.ORDERS, action: PermissionAction.UPDATE }),
  canDeleteOrders: (staffId: string) => 
    hasPermission(staffId, { module: Module.ORDERS, action: PermissionAction.DELETE }),
  canManageOrders: (staffId: string) => 
    hasPermission(staffId, { module: Module.ORDERS, action: PermissionAction.MANAGE }),

  // Menu
  canViewMenu: (staffId: string) => 
    hasPermission(staffId, { module: Module.MENU, action: PermissionAction.READ }),
  canManageMenu: (staffId: string) => 
    hasPermission(staffId, { module: Module.MENU, action: PermissionAction.MANAGE }),

  // Inventory
  canViewInventory: (staffId: string) => 
    hasPermission(staffId, { module: Module.INVENTORY, action: PermissionAction.READ }),
  canManageInventory: (staffId: string) => 
    hasPermission(staffId, { module: Module.INVENTORY, action: PermissionAction.MANAGE }),

  // Customers
  canViewCustomers: (staffId: string) => 
    hasPermission(staffId, { module: Module.CUSTOMERS, action: PermissionAction.READ }),
  canManageCustomers: (staffId: string) => 
    hasPermission(staffId, { module: Module.CUSTOMERS, action: PermissionAction.MANAGE }),

  // Staff
  canViewStaff: (staffId: string) => 
    hasPermission(staffId, { module: Module.STAFF, action: PermissionAction.READ }),
  canManageStaff: (staffId: string) => 
    hasPermission(staffId, { module: Module.STAFF, action: PermissionAction.MANAGE }),

  // Reports
  canViewReports: (staffId: string) => 
    hasPermission(staffId, { module: Module.REPORTS, action: PermissionAction.READ }),
  canExportReports: (staffId: string) => 
    hasPermission(staffId, { module: Module.REPORTS, action: PermissionAction.EXPORT }),

  // Settings
  canViewSettings: (staffId: string) => 
    hasPermission(staffId, { module: Module.SETTINGS, action: PermissionAction.READ }),
  canManageSettings: (staffId: string) => 
    hasPermission(staffId, { module: Module.SETTINGS, action: PermissionAction.MANAGE }),

  // Payments
  canViewPayments: (staffId: string) => 
    hasPermission(staffId, { module: Module.PAYMENTS, action: PermissionAction.READ }),
  canManagePayments: (staffId: string) => 
    hasPermission(staffId, { module: Module.PAYMENTS, action: PermissionAction.MANAGE }),

  // Role-based checks
  isSuperAdmin: (staffId: string) => 
    hasRoleLevel(staffId, RoleLevel.SUPER_ADMIN),
  isStoreAdmin: (staffId: string) => 
    hasRoleLevel(staffId, RoleLevel.STORE_ADMIN),
  isStoreStaff: (staffId: string) => 
    hasRoleLevel(staffId, RoleLevel.STORE_STAFF),
}