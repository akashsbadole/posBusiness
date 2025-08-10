'use client'

import { ReactNode } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { Module, PermissionAction, RoleLevel } from '@prisma/client'

interface PermissionBasedUIProps {
  children: ReactNode
  permission?: {
    module: Module
    action: PermissionAction
    resource?: string
  }
  roleLevel?: RoleLevel
  requireOwner?: boolean
  fallback?: ReactNode
  hideCompletely?: boolean // If true, doesn't render anything instead of fallback
}

/**
 * Component for conditionally rendering UI elements based on permissions
 * Similar to PermissionGuard but optimized for UI elements rather than entire components
 */
export function PermissionBasedUI({
  children,
  permission,
  roleLevel,
  requireOwner = false,
  fallback = null,
  hideCompletely = false
}: PermissionBasedUIProps) {
  const { hasPermission, hasRoleLevel, isOwner, loading } = usePermissions()

  if (loading) {
    return hideCompletely ? null : fallback
  }

  let hasAccess = true

  if (requireOwner) {
    hasAccess = hasAccess && isOwner
  }

  if (roleLevel) {
    hasAccess = hasAccess && hasRoleLevel(roleLevel)
  }

  if (permission) {
    hasAccess = hasAccess && hasPermission(permission)
  }

  if (hasAccess) {
    return <>{children}</>
  }

  return hideCompletely ? null : <>{fallback}</>
}

/**
 * Higher-order component for permission-based UI rendering
 */
export function withPermissionUI<P extends object>(
  Component: React.ComponentType<P>,
  permission: {
    module: Module
    action: PermissionAction
    resource?: string
  },
  fallback?: ReactNode,
  hideCompletely?: boolean
) {
  return function GuardedComponent(props: P) {
    return (
      <PermissionBasedUI 
        permission={permission} 
        fallback={fallback}
        hideCompletely={hideCompletely}
      >
        <Component {...props} />
      </PermissionBasedUI>
    )
  }
}

/**
 * Pre-configured permission UI components for common use cases
 */
export function CanViewDashboard({ children }: { children: ReactNode }) {
  return (
    <PermissionBasedUI permission={{ module: Module.DASHBOARD, action: PermissionAction.READ }}>
      {children}
    </PermissionBasedUI>
  )
}

export function CanManageOrders({ children }: { children: ReactNode }) {
  return (
    <PermissionBasedUI permission={{ module: Module.ORDERS, action: PermissionAction.MANAGE }}>
      {children}
    </PermissionBasedUI>
  )
}

export function CanCreateOrders({ children }: { children: ReactNode }) {
  return (
    <PermissionBasedUI permission={{ module: Module.ORDERS, action: PermissionAction.CREATE }}>
      {children}
    </PermissionBasedUI>
  )
}

export function CanManageMenu({ children }: { children: ReactNode }) {
  return (
    <PermissionBasedUI permission={{ module: Module.MENU, action: PermissionAction.MANAGE }}>
      {children}
    </PermissionBasedUI>
  )
}

export function CanViewMenu({ children }: { children: ReactNode }) {
  return (
    <PermissionBasedUI permission={{ module: Module.MENU, action: PermissionAction.READ }}>
      {children}
    </PermissionBasedUI>
  )
}

export function CanManageInventory({ children }: { children: ReactNode }) {
  return (
    <PermissionBasedUI permission={{ module: Module.INVENTORY, action: PermissionAction.MANAGE }}>
      {children}
    </PermissionBasedUI>
  )
}

export function CanManageCustomers({ children }: { children: ReactNode }) {
  return (
    <PermissionBasedUI permission={{ module: Module.CUSTOMERS, action: PermissionAction.MANAGE }}>
      {children}
    </PermissionBasedUI>
  )
}

export function CanManageStaff({ children }: { children: ReactNode }) {
  return (
    <PermissionBasedUI permission={{ module: Module.STAFF, action: PermissionAction.MANAGE }}>
      {children}
    </PermissionBasedUI>
  )
}

export function CanViewReports({ children }: { children: ReactNode }) {
  return (
    <PermissionBasedUI permission={{ module: Module.REPORTS, action: PermissionAction.READ }}>
      {children}
    </PermissionBasedUI>
  )
}

export function CanManageSettings({ children }: { children: ReactNode }) {
  return (
    <PermissionBasedUI permission={{ module: Module.SETTINGS, action: PermissionAction.MANAGE }}>
      {children}
    </PermissionBasedUI>
  )
}

export function CanManageAI({ children }: { children: ReactNode }) {
  return (
    <PermissionBasedUI permission={{ module: Module.AI, action: PermissionAction.MANAGE }}>
      {children}
    </PermissionBasedUI>
  )
}

export function IsSuperAdmin({ children }: { children: ReactNode }) {
  return (
    <PermissionBasedUI roleLevel={RoleLevel.SUPER_ADMIN}>
      {children}
    </PermissionBasedUI>
  )
}

export function IsStoreAdmin({ children }: { children: ReactNode }) {
  return (
    <PermissionBasedUI roleLevel={RoleLevel.STORE_ADMIN}>
      {children}
    </PermissionBasedUI>
  )
}

export function IsStoreStaff({ children }: { children: ReactNode }) {
  return (
    <PermissionBasedUI roleLevel={RoleLevel.STORE_STAFF}>
      {children}
    </PermissionBasedUI>
  )
}

export function IsOwner({ children }: { children: ReactNode }) {
  return (
    <PermissionBasedUI requireOwner={true}>
      {children}
    </PermissionBasedUI>
  )
}