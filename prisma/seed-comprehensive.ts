import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding comprehensive database...')

  // Hash passwords
  const hashedPassword = await bcrypt.hash('password123', 10)
  const ownerPassword = await bcrypt.hash('owner123', 10)
  const managerPassword = await bcrypt.hash('manager123', 10)
  const staffPassword = await bcrypt.hash('staff123', 10)

  // Create OWNER user
  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@spicegarden.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'owner@spicegarden.com',
      name: 'Restaurant Owner',
      emailVerified: true,
    },
  })

  // Create MANAGER user
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@spicegarden.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'manager@spicegarden.com',
      name: 'Restaurant Manager',
      emailVerified: true,
    },
  })

  // Create STAFF user
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@spicegarden.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'staff@spicegarden.com',
      name: 'Restaurant Staff',
      emailVerified: true,
    },
  })

  // Create demo restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { id: 'cme2cx36c0002x5haddxsxhtg' },
    update: {},
    create: {
      id: 'cme2cx36c0002x5haddxsxhtg',
      name: 'Spice Garden',
      address: '123 Main Street, Mumbai, Maharashtra 400001',
      phone: '+91 22 1234 5678',
      email: 'info@spicegarden.com',
      gstNumber: '27ABCDE1234F1Z5',
      description: 'Authentic Indian cuisine with modern twist',
      isActive: true,
      isVerified: true,
      ownerId: ownerUser.id,
    },
  })

  // Create demo outlet
  const outlet = await prisma.outlet.upsert({
    where: { id: 'outlet-1' },
    update: {},
    create: {
      id: 'outlet-1',
      name: 'Main Branch',
      address: '123 Main Street, Mumbai, Maharashtra 400001',
      phone: '+91 22 1234 5678',
      isActive: true,
      restaurantId: restaurant.id,
    },
  })

  // Create demo subscription
  const subscription = await prisma.subscription.upsert({
    where: { restaurantId: restaurant.id },
    update: {},
    create: {
      id: uuidv4(),
      plan: 'PRO',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      lastBillingAt: new Date(),
      nextBillingAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      amount: 2499.00,
      restaurantId: restaurant.id,
    },
  })

  // Create OWNER staff account (linked to owner user)
  const ownerStaff = await prisma.staff.upsert({
    where: { email: 'owner@spicegarden.com' },
    update: {},
    create: {
      id: uuidv4(),
      name: 'Restaurant Owner',
      email: 'owner@spicegarden.com',
      phone: '+91 99999 99999',
      role: 'OWNER',
      password: ownerPassword,
      isActive: true,
      isVerified: true,
      userId: ownerUser.id,
      restaurantId: restaurant.id,
      outletId: outlet.id,
    },
  })

  // Create MANAGER staff account (linked to manager user)
  const managerStaff = await prisma.staff.upsert({
    where: { email: 'manager@spicegarden.com' },
    update: {},
    create: {
      id: uuidv4(),
      name: 'Rajesh Kumar',
      email: 'manager@spicegarden.com',
      phone: '+91 98765 43210',
      role: 'MANAGER',
      password: managerPassword,
      isActive: true,
      isVerified: true,
      userId: managerUser.id,
      restaurantId: restaurant.id,
      outletId: outlet.id,
    },
  })

  // Create STAFF staff account (linked to staff user)
  const staffStaff = await prisma.staff.upsert({
    where: { email: 'staff@spicegarden.com' },
    update: {},
    create: {
      id: uuidv4(),
      name: 'Amit Sharma',
      email: 'staff@spicegarden.com',
      phone: '+91 87654 32109',
      role: 'WAITER',
      password: staffPassword,
      isActive: true,
      isVerified: true,
      userId: staffUser.id,
      restaurantId: restaurant.id,
      outletId: outlet.id,
    },
  })

  // Create additional staff accounts for testing
  const additionalStaff = await Promise.all([
    prisma.staff.upsert({
      where: { email: 'chef@spicegarden.com' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'Priya Singh',
        email: 'chef@spicegarden.com',
        phone: '+91 76543 21098',
        role: 'CHEF',
        password: hashedPassword,
        isActive: true,
        isVerified: true,
        restaurantId: restaurant.id,
        outletId: outlet.id,
      },
    }),
    prisma.staff.upsert({
      where: { email: 'cashier@spicegarden.com' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'Suresh Patel',
        email: 'cashier@spicegarden.com',
        phone: '+91 65432 10987',
        role: 'CASHIER',
        password: hashedPassword,
        isActive: true,
        isVerified: true,
        restaurantId: restaurant.id,
        outletId: outlet.id,
      },
    }),
    prisma.staff.upsert({
      where: { email: 'waiter@spicegarden.com' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'Anita Desai',
        email: 'waiter@spicegarden.com',
        phone: '+91 54321 09876',
        role: 'WAITER',
        password: hashedPassword,
        isActive: true,
        isVerified: true,
        restaurantId: restaurant.id,
        outletId: outlet.id,
      },
    }),
  ])

  // Create default roles and permissions
  const superAdminRole = await prisma.role.upsert({
    where: { id: 'super-admin-role' },
    update: {},
    create: {
      id: 'super-admin-role',
      name: 'Super Admin',
      description: 'System administrator with full access',
      level: 'SUPER_ADMIN',
      isSystem: true,
      isActive: true,
    },
  })

  const ownerRole = await prisma.role.upsert({
    where: { id: 'owner-role' },
    update: {},
    create: {
      id: 'owner-role',
      name: 'Owner',
      description: 'Restaurant owner with full access',
      level: 'STORE_ADMIN',
      isActive: true,
      restaurantId: restaurant.id,
    },
  })

  const managerRole = await prisma.role.upsert({
    where: { id: 'manager-role' },
    update: {},
    create: {
      id: 'manager-role',
      name: 'Manager',
      description: 'Restaurant manager with operational access',
      level: 'STORE_ADMIN',
      isActive: true,
      restaurantId: restaurant.id,
    },
  })

  const staffRole = await prisma.role.upsert({
    where: { id: 'staff-role' },
    update: {},
    create: {
      id: 'staff-role',
      name: 'Staff',
      description: 'Restaurant staff with limited access',
      level: 'STORE_STAFF',
      isActive: true,
      restaurantId: restaurant.id,
    },
  })

  // Assign roles to staff
  await Promise.all([
    prisma.staff.update({
      where: { id: ownerStaff.id },
      data: { roleId: ownerRole.id },
    }),
    prisma.staff.update({
      where: { id: managerStaff.id },
      data: { roleId: managerRole.id },
    }),
    prisma.staff.update({
      where: { id: staffStaff.id },
      data: { roleId: staffRole.id },
    }),
  ])

  // Create permissions
  const permissions = await Promise.all([
    // Dashboard permissions
    prisma.permission.upsert({
      where: { name: 'dashboard:read' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'dashboard:read',
        description: 'View dashboard',
        module: 'DASHBOARD',
        action: 'READ',
        isSystem: true,
      },
    }),

    // Menu permissions
    prisma.permission.upsert({
      where: { name: 'menu:read' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'menu:read',
        description: 'View menu items',
        module: 'MENU',
        action: 'READ',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'menu:create' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'menu:create',
        description: 'Create menu items',
        module: 'MENU',
        action: 'CREATE',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'menu:update' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'menu:update',
        description: 'Update menu items',
        module: 'MENU',
        action: 'UPDATE',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'menu:delete' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'menu:delete',
        description: 'Delete menu items',
        module: 'MENU',
        action: 'DELETE',
        isSystem: true,
      },
    }),

    // Orders permissions
    prisma.permission.upsert({
      where: { name: 'orders:read' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'orders:read',
        description: 'View orders',
        module: 'ORDERS',
        action: 'READ',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'orders:create' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'orders:create',
        description: 'Create orders',
        module: 'ORDERS',
        action: 'CREATE',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'orders:update' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'orders:update',
        description: 'Update orders',
        module: 'ORDERS',
        action: 'UPDATE',
        isSystem: true,
      },
    }),

    // Staff permissions
    prisma.permission.upsert({
      where: { name: 'staff:read' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'staff:read',
        description: 'View staff',
        module: 'STAFF',
        action: 'READ',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'staff:create' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'staff:create',
        description: 'Create staff',
        module: 'STAFF',
        action: 'CREATE',
        isSystem: true,
      },
    }),

    // Settings permissions
    prisma.permission.upsert({
      where: { name: 'settings:read' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'settings:read',
        description: 'View settings',
        module: 'SETTINGS',
        action: 'READ',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'settings:manage' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'settings:manage',
        description: 'Manage settings',
        module: 'SETTINGS',
        action: 'MANAGE',
        isSystem: true,
      },
    }),
  ])

  // Assign permissions to roles
  const rolePermissions = await Promise.all([
    // Owner permissions (all permissions)
    ...permissions.map(permission => 
      prisma.rolePermission.upsert({
        where: { 
          roleId_permissionId: { 
            roleId: ownerRole.id, 
            permissionId: permission.id 
          } 
        },
        update: {},
        create: {
          roleId: ownerRole.id,
          permissionId: permission.id,
        },
      })
    ),

    // Manager permissions (most permissions)
    ...permissions.filter(p => !p.name.includes('staff:create') && !p.name.includes('settings:manage')).map(permission => 
      prisma.rolePermission.upsert({
        where: { 
          roleId_permissionId: { 
            roleId: managerRole.id, 
            permissionId: permission.id 
          } 
        },
        update: {},
        create: {
          roleId: managerRole.id,
          permissionId: permission.id,
        },
      })
    ),

    // Staff permissions (limited permissions)
    ...permissions.filter(p => 
      p.name.includes('dashboard:read') || 
      p.name.includes('menu:read') || 
      p.name.includes('orders:read') || 
      p.name.includes('orders:create')
    ).map(permission => 
      prisma.rolePermission.upsert({
        where: { 
          roleId_permissionId: { 
            roleId: staffRole.id, 
            permissionId: permission.id 
          } 
        },
        update: {},
        create: {
          roleId: staffRole.id,
          permissionId: permission.id,
        },
      })
    ),
  ])

  // Create business settings
  const businessSettings = await prisma.businessSettings.upsert({
    where: { restaurantId: restaurant.id },
    update: {},
    create: {
      id: uuidv4(),
      restaurantId: restaurant.id,
      businessType: 'RESTAURANT',
      enableGST: true,
      gstRate: 0.05,
      enableInventory: true,
      enableTables: true,
      enableAppointments: false,
      enableServices: false,
      enableSubscriptions: false,
      enableLoyalty: true,
      enableDelivery: true,
      enableAI: true,
      currency: 'INR',
      timezone: 'Asia/Kolkata',
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('📝 Test Accounts:')
  console.log('   Owner: owner@spicegarden.com / owner123')
  console.log('   Manager: manager@spicegarden.com / manager123')
  console.log('   Staff: staff@spicegarden.com / staff123')
  console.log('   Chef: chef@spicegarden.com / password123')
  console.log('   Cashier: cashier@spicegarden.com / password123')
  console.log('   Waiter: waiter@spicegarden.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })