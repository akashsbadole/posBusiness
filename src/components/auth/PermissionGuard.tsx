'use client'

import { ReactNode } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { Module, PermissionAction, RoleLevel } from '@prisma/client'

interface PermissionGuardProps {
  permission?: {
    module: Module
    action: PermissionAction
    resource?: string
  }
  roleLevel?: RoleLevel
  requireOwner?: boolean
  fallback?: ReactNode
  children: ReactNode
}

export function PermissionGuard({
  permission,
  roleLevel,
  requireOwner = false,
  fallback = null,
  children
}: PermissionGuardProps) {
  const { hasPermission, hasRoleLevel, isOwner, loading } = usePermissions()

  if (loading) {
    // You could return a loading spinner here
    return null
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

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

// Higher-order component for permission guarding
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: {
    module: Module
    action: PermissionAction
    resource?: string
  },
  fallback?: ReactNode
) {
  return function GuardedComponent(props: P) {
    return (
      <PermissionGuard permission={permission} fallback={fallback}>
        <Component {...props} />
      </PermissionGuard>
    )
  }
}

// Higher-order component for role level guarding
export function withRoleLevel<P extends object>(
  Component: React.ComponentType<P>,
  minimumLevel: RoleLevel,
  fallback?: ReactNode
) {
  return function GuardedComponent(props: P) {
    return (
      <PermissionGuard roleLevel={minimumLevel} fallback={fallback}>
        <Component {...props} />
      </PermissionGuard>
    )
  }
}