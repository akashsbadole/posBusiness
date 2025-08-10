import { db } from './db'
import { RoleLevel, Module, PermissionAction } from '@prisma/client'

interface PermissionDefinition {
  name: string
  description: string
  module: Module
  action: PermissionAction
  resource?: string
}

interface RoleDefinition {
  name: string
  description: string
  level: RoleLevel
  permissions: string[]
  isSystem?: boolean
}

// Define all system permissions
const systemPermissions: PermissionDefinition[] = [
  // Dashboard permissions
  { name: 'dashboard:read', description: 'View dashboard', module: Module.DASHBOARD, action: PermissionAction.READ },
  
  // Orders permissions
  { name: 'orders:read', description: 'View orders', module: Module.ORDERS, action: PermissionAction.READ },
  { name: 'orders:create', description: 'Create orders', module: Module.ORDERS, action: PermissionAction.CREATE },
  { name: 'orders:update', description: 'Update orders', module: Module.ORDERS, action: PermissionAction.UPDATE },
  { name: 'orders:delete', description: 'Delete orders', module: Module.ORDERS, action: PermissionAction.DELETE },
  { name: 'orders:manage', description: 'Manage orders (full access)', module: Module.ORDERS, action: PermissionAction.MANAGE },
  { name: 'orders:approve', description: 'Approve orders', module: Module.ORDERS, action: PermissionAction.APPROVE },
  { name: 'orders:reject', description: 'Reject orders', module: Module.ORDERS, action: PermissionAction.REJECT },
  
  // Menu permissions
  { name: 'menu:read', description: 'View menu items', module: Module.MENU, action: PermissionAction.READ },
  { name: 'menu:create', description: 'Create menu items', module: Module.MENU, action: PermissionAction.CREATE },
  { name: 'menu:update', description: 'Update menu items', module: Module.MENU, action: PermissionAction.UPDATE },
  { name: 'menu:delete', description: 'Delete menu items', module: Module.MENU, action: PermissionAction.DELETE },
  { name: 'menu:manage', description: 'Manage menu (full access)', module: Module.MENU, action: PermissionAction.MANAGE },
  
  // Inventory permissions
  { name: 'inventory:read', description: 'View inventory', module: Module.INVENTORY, action: PermissionAction.READ },
  { name: 'inventory:create', description: 'Create inventory items', module: Module.INVENTORY, action: PermissionAction.CREATE },
  { name: 'inventory:update', description: 'Update inventory items', module: Module.INVENTORY, action: PermissionAction.UPDATE },
  { name: 'inventory:delete', description: 'Delete inventory items', module: Module.INVENTORY, action: PermissionAction.DELETE },
  { name: 'inventory:manage', description: 'Manage inventory (full access)', module: Module.INVENTORY, action: PermissionAction.MANAGE },
  
  // Customers permissions
  { name: 'customers:read', description: 'View customers', module: Module.CUSTOMERS, action: PermissionAction.READ },
  { name: 'customers:create', description: 'Create customers', module: Module.CUSTOMERS, action: PermissionAction.CREATE },
  { name: 'customers:update', description: 'Update customers', module: Module.CUSTOMERS, action: PermissionAction.UPDATE },
  { name: 'customers:delete', description: 'Delete customers', module: Module.CUSTOMERS, action: PermissionAction.DELETE },
  { name: 'customers:manage', description: 'Manage customers (full access)', module: Module.CUSTOMERS, action: PermissionAction.MANAGE },
  
  // Staff permissions
  { name: 'staff:read', description: 'View staff members', module: Module.STAFF, action: PermissionAction.READ },
  { name: 'staff:create', description: 'Create staff members', module: Module.STAFF, action: PermissionAction.CREATE },
  { name: 'staff:update', description: 'Update staff members', module: Module.STAFF, action: PermissionAction.UPDATE },
  { name: 'staff:delete', description: 'Delete staff members', module: Module.STAFF, action: PermissionAction.DELETE },
  { name: 'staff:manage', description: 'Manage staff (full access)', module: Module.STAFF, action: PermissionAction.MANAGE },
  
  // Reports permissions
  { name: 'reports:read', description: 'View reports', module: Module.REPORTS, action: PermissionAction.READ },
  { name: 'reports:export', description: 'Export reports', module: Module.REPORTS, action: PermissionAction.EXPORT },
  { name: 'reports:import', description: 'Import report data', module: Module.REPORTS, action: PermissionAction.IMPORT },
  
  // Settings permissions
  { name: 'settings:read', description: 'View settings', module: Module.SETTINGS, action: PermissionAction.READ },
  { name: 'settings:update', description: 'Update settings', module: Module.SETTINGS, action: PermissionAction.UPDATE },
  { name: 'settings:manage', description: 'Manage settings (full access)', module: Module.SETTINGS, action: PermissionAction.MANAGE },
  
  // Payments permissions
  { name: 'payments:read', description: 'View payments', module: Module.PAYMENTS, action: PermissionAction.READ },
  { name: 'payments:create', description: 'Create payments', module: Module.PAYMENTS, action: PermissionAction.CREATE },
  { name: 'payments:update', description: 'Update payments', module: Module.PAYMENTS, action: PermissionAction.UPDATE },
  { name: 'payments:delete', description: 'Delete payments', module: Module.PAYMENTS, action: PermissionAction.DELETE },
  { name: 'payments:manage', description: 'Manage payments (full access)', module: Module.PAYMENTS, action: PermissionAction.MANAGE },
  
  // Tables permissions
  { name: 'tables:read', description: 'View tables', module: Module.TABLES, action: PermissionAction.READ },
  { name: 'tables:create', description: 'Create tables', module: Module.TABLES, action: PermissionAction.CREATE },
  { name: 'tables:update', description: 'Update tables', module: Module.TABLES, action: PermissionAction.UPDATE },
  { name: 'tables:delete', description: 'Delete tables', module: Module.TABLES, action: PermissionAction.DELETE },
  { name: 'tables:manage', description: 'Manage tables (full access)', module: Module.TABLES, action: PermissionAction.MANAGE },
  
  // Outlets permissions
  { name: 'outlets:read', description: 'View outlets', module: Module.OUTLETS, action: PermissionAction.READ },
  { name: 'outlets:create', description: 'Create outlets', module: Module.OUTLETS, action: PermissionAction.CREATE },
  { name: 'outlets:update', description: 'Update outlets', module: Module.OUTLETS, action: PermissionAction.UPDATE },
  { name: 'outlets:delete', description: 'Delete outlets', module: Module.OUTLETS, action: PermissionAction.DELETE },
  { name: 'outlets:manage', description: 'Manage outlets (full access)', module: Module.OUTLETS, action: PermissionAction.MANAGE },
  
  // Subscriptions permissions
  { name: 'subscriptions:read', description: 'View subscriptions', module: Module.SUBSCRIPTIONS, action: PermissionAction.READ },
  { name: 'subscriptions:manage', description: 'Manage subscriptions', module: Module.SUBSCRIPTIONS, action: PermissionAction.MANAGE },
  
  // Audit logs permissions
  { name: 'audit_logs:read', description: 'View audit logs', module: Module.AUDIT_LOGS, action: PermissionAction.READ },
  { name: 'audit_logs:export', description: 'Export audit logs', module: Module.AUDIT_LOGS, action: PermissionAction.EXPORT },
  
  // AI suggestions permissions
  { name: 'ai_suggestions:read', description: 'View AI suggestions', module: Module.AI_SUGGESTIONS, action: PermissionAction.READ },
  { name: 'ai_suggestions:manage', description: 'Manage AI suggestions', module: Module.AI_SUGGESTIONS, action: PermissionAction.MANAGE },
  
  // Discounts permissions
  { name: 'discounts:read', description: 'View discounts', module: Module.DISCOUNTS, action: PermissionAction.READ },
  { name: 'discounts:create', description: 'Create discounts', module: Module.DISCOUNTS, action: PermissionAction.CREATE },
  { name: 'discounts:update', description: 'Update discounts', module: Module.DISCOUNTS, action: PermissionAction.UPDATE },
  { name: 'discounts:delete', description: 'Delete discounts', module: Module.DISCOUNTS, action: PermissionAction.DELETE },
  { name: 'discounts:manage', description: 'Manage discounts (full access)', module: Module.DISCOUNTS, action: PermissionAction.MANAGE },
  
  // Loyalty permissions
  { name: 'loyalty:read', description: 'View loyalty program', module: Module.LOYALTY, action: PermissionAction.READ },
  { name: 'loyalty:manage', description: 'Manage loyalty program', module: Module.LOYALTY, action: PermissionAction.MANAGE },
  
  // POS Customization permissions
  { name: 'pos_customization:read', description: 'View POS layouts', module: Module.POS_CUSTOMIZATION, action: PermissionAction.READ },
  { name: 'pos_customization:edit', description: 'Edit POS layouts', module: Module.POS_CUSTOMIZATION, action: PermissionAction.EDIT },
  { name: 'pos_customization:manage', description: 'Manage POS layouts (full access)', module: Module.POS_CUSTOMIZATION, action: PermissionAction.MANAGE },
]

// Define system roles
const systemRoles: RoleDefinition[] = [
  {
    name: 'Super Admin',
    description: 'Super administrator with full system access',
    level: RoleLevel.SUPER_ADMIN,
    permissions: [], // Super admin has all permissions by default
    isSystem: true
  },
  {
    name: 'Store Admin',
    description: 'Store administrator with full access to restaurant operations',
    level: RoleLevel.STORE_ADMIN,
    permissions: [
      'dashboard:read',
      'orders:read', 'orders:create', 'orders:update', 'orders:delete', 'orders:manage', 'orders:approve', 'orders:reject',
      'menu:read', 'menu:create', 'menu:update', 'menu:delete', 'menu:manage',
      'inventory:read', 'inventory:create', 'inventory:update', 'inventory:delete', 'inventory:manage',
      'customers:read', 'customers:create', 'customers:update', 'customers:delete', 'customers:manage',
      'staff:read', 'staff:create', 'staff:update', 'staff:delete', 'staff:manage',
      'reports:read', 'reports:export',
      'settings:read', 'settings:update', 'settings:manage',
      'payments:read', 'payments:create', 'payments:update', 'payments:delete', 'payments:manage',
      'tables:read', 'tables:create', 'tables:update', 'tables:delete', 'tables:manage',
      'outlets:read', 'outlets:create', 'outlets:update', 'outlets:delete', 'outlets:manage',
      'subscriptions:read', 'subscriptions:manage',
      'audit_logs:read', 'audit_logs:export',
      'ai_suggestions:read', 'ai_suggestions:manage',
      'discounts:read', 'discounts:create', 'discounts:update', 'discounts:delete', 'discounts:manage',
      'loyalty:read', 'loyalty:manage',
    ],
    isSystem: true
  },
  {
    name: 'Store Staff',
    description: 'Store staff with limited access to daily operations',
    level: RoleLevel.STORE_STAFF,
    permissions: [
      'dashboard:read',
      'orders:read', 'orders:create', 'orders:update',
      'menu:read',
      'inventory:read',
      'customers:read', 'customers:create', 'customers:update',
      'staff:read',
      'reports:read',
      'settings:read',
      'payments:read', 'payments:create',
      'tables:read',
      'outlets:read',
      'ai_suggestions:read',
      'discounts:read',
      'loyalty:read',
    ],
    isSystem: true
  }
]

export async function seedRolesAndPermissions() {
  try {
    console.log('Seeding roles and permissions...')

    // Create a system user for system restaurant
    let systemUser = await db.user.findFirst({
      where: { email: 'system@restaurant.com' }
    })

    if (!systemUser) {
      systemUser = await db.user.create({
        data: {
          email: 'system@restaurant.com',
          name: 'System User',
          isActive: false // Mark as inactive
        }
      })
    }

    // Create a system restaurant for system roles
    let systemRestaurant = await db.restaurant.findFirst({
      where: { email: 'system@restaurant.com' }
    })

    if (!systemRestaurant) {
      systemRestaurant = await db.restaurant.create({
        data: {
          name: 'System Restaurant',
          email: 'system@restaurant.com',
          address: 'System Address',
          phone: '0000000000',
          ownerId: systemUser.id,
          isActive: false // Mark as inactive so it doesn't appear in normal operations
        }
      })
    }

    // Create permissions
    const createdPermissions = []
    for (const permissionDef of systemPermissions) {
      const permission = await db.permission.upsert({
        where: { name: permissionDef.name },
        update: {},
        create: {
          name: permissionDef.name,
          description: permissionDef.description,
          module: permissionDef.module,
          action: permissionDef.action,
          resource: permissionDef.resource,
          isSystem: true
        }
      })
      createdPermissions.push(permission)
    }
    console.log(`Created ${createdPermissions.length} permissions`)

    // Create roles
    const createdRoles = []
    for (const roleDef of systemRoles) {
      // For system roles, use the system restaurant
      const role = await db.role.upsert({
        where: { 
          name_restaurantId: {
            name: roleDef.name,
            restaurantId: systemRestaurant.id
          }
        },
        update: {},
        create: {
          name: roleDef.name,
          description: roleDef.description,
          level: roleDef.level,
          isSystem: roleDef.isSystem || false,
          restaurantId: systemRestaurant.id
        }
      })
      createdRoles.push(role)
    }
    console.log(`Created ${createdRoles.length} roles`)

    // Assign permissions to roles
    for (const roleDef of systemRoles) {
      const role = createdRoles.find(r => r.name === roleDef.name)
      if (!role) continue

      // For Super Admin, we don't need to assign specific permissions
      // as they have access to everything by default
      if (roleDef.level === RoleLevel.SUPER_ADMIN) {
        continue
      }

      // Get permission IDs for this role
      const permissionIds = createdPermissions
        .filter(p => roleDef.permissions.includes(p.name))
        .map(p => p.id)

      // Delete existing role permissions
      await db.rolePermission.deleteMany({
        where: { roleId: role.id }
      })

      // Create new role permissions
      if (permissionIds.length > 0) {
        await db.rolePermission.createMany({
          data: permissionIds.map(permissionId => ({
            roleId: role.id,
            permissionId
          }))
        })
      }
    }
    console.log('Assigned permissions to roles')

    console.log('Roles and permissions seeded successfully!')
    return { success: true, message: 'Roles and permissions seeded successfully' }
  } catch (error) {
    console.error('Error seeding roles and permissions:', error)
    return { success: false, error: 'Failed to seed roles and permissions' }
  }
}

// Run this function directly if this file is executed
if (require.main === module) {
  seedRolesAndPermissions()
    .then(result => {
      if (result.success) {
        console.log(result.message)
        process.exit(0)
      } else {
        console.error(result.error)
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('Unexpected error:', error)
      process.exit(1)
    })
}