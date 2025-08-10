'use client'

import { useState, useEffect } from 'react'
import { Module, PermissionAction, RoleLevel } from '@prisma/client'

export interface PermissionCheck {
  module: Module
  action: PermissionAction
  resource?: string
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([])
  const [roleLevel, setRoleLevel] = useState<RoleLevel | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserPermissions()
  }, [])

  const fetchUserPermissions = async () => {
    try {
      const response = await fetch('/api/auth/user-permissions')
      if (response.ok) {
        const data = await response.json()
        setPermissions(data.permissions || [])
        setRoleLevel(data.roleLevel || null)
        setIsOwner(data.isOwner || false)
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const hasPermission = (permission: PermissionCheck): boolean => {
    if (loading) return false
    
    // Owners and super admins have all permissions
    if (isOwner || roleLevel === RoleLevel.SUPER_ADMIN) {
      return true
    }

    const permissionName = `${permission.module}:${permission.action}`.toLowerCase()
    return permissions.includes(permissionName)
  }

  const hasRoleLevel = (minimumLevel: RoleLevel): boolean => {
    if (loading) return false
    
    const levelHierarchy = {
      [RoleLevel.SUPER_ADMIN]: 3,
      [RoleLevel.STORE_ADMIN]: 2,
      [RoleLevel.STORE_STAFF]: 1
    }

    return roleLevel ? levelHierarchy[roleLevel] >= levelHierarchy[minimumLevel] : false
  }

  // Common permission checks
  const can = {
    viewDashboard: () => hasPermission({ module: Module.DASHBOARD, action: PermissionAction.READ }),
    manageOrders: () => hasPermission({ module: Module.ORDERS, action: PermissionAction.MANAGE }),
    createOrders: () => hasPermission({ module: Module.ORDERS, action: PermissionAction.CREATE }),
    updateOrders: () => hasPermission({ module: Module.ORDERS, action: PermissionAction.UPDATE }),
    deleteOrders: () => hasPermission({ module: Module.ORDERS, action: PermissionAction.DELETE }),
    
    manageMenu: () => hasPermission({ module: Module.MENU, action: PermissionAction.MANAGE }),
    viewMenu: () => hasPermission({ module: Module.MENU, action: PermissionAction.READ }),
    
    manageInventory: () => hasPermission({ module: Module.INVENTORY, action: PermissionAction.MANAGE }),
    viewInventory: () => hasPermission({ module: Module.INVENTORY, action: PermissionAction.READ }),
    
    manageCustomers: () => hasPermission({ module: Module.CUSTOMERS, action: PermissionAction.MANAGE }),
    viewCustomers: () => hasPermission({ module: Module.CUSTOMERS, action: PermissionAction.READ }),
    
    manageStaff: () => hasPermission({ module: Module.STAFF, action: PermissionAction.MANAGE }),
    viewStaff: () => hasPermission({ module: Module.STAFF, action: PermissionAction.READ }),
    
    viewReports: () => hasPermission({ module: Module.REPORTS, action: PermissionAction.READ }),
    exportReports: () => hasPermission({ module: Module.REPORTS, action: PermissionAction.EXPORT }),
    
    manageSettings: () => hasPermission({ module: Module.SETTINGS, action: PermissionAction.MANAGE }),
    viewSettings: () => hasPermission({ module: Module.SETTINGS, action: PermissionAction.READ }),
    
    managePayments: () => hasPermission({ module: Module.PAYMENTS, action: PermissionAction.MANAGE }),
    viewPayments: () => hasPermission({ module: Module.PAYMENTS, action: PermissionAction.READ }),
    
    manageTables: () => hasPermission({ module: Module.TABLES, action: PermissionAction.MANAGE }),
    viewTables: () => hasPermission({ module: Module.TABLES, action: PermissionAction.READ }),
    
    manageOutlets: () => hasPermission({ module: Module.OUTLETS, action: PermissionAction.MANAGE }),
    viewOutlets: () => hasPermission({ module: Module.OUTLETS, action: PermissionAction.READ }),
    
    manageRoles: () => hasPermission({ module: Module.STAFF, action: PermissionAction.MANAGE }),
    
    isSuperAdmin: () => hasRoleLevel(RoleLevel.SUPER_ADMIN),
    isStoreAdmin: () => hasRoleLevel(RoleLevel.STORE_ADMIN),
    isStoreStaff: () => hasRoleLevel(RoleLevel.STORE_STAFF),
  }

  return {
    permissions,
    roleLevel,
    isOwner,
    loading,
    checkPermission,
    checkRoleLevel,
    hasPermission,
    hasRoleLevel,
    can,
  }
}