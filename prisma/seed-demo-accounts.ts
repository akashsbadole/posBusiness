import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding demo accounts for login page...')

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 12)
  const managerPassword = await bcrypt.hash('manager123', 12)
  const staffPassword = await bcrypt.hash('staff123', 12)
  const demoPassword = await bcrypt.hash('demo123', 12)

  // Create or get POSBiz restaurant
  let posbizRestaurant = await prisma.restaurant.findFirst({
    where: { name: 'POSBiz Demo' }
  })

  if (!posbizRestaurant) {
    // Create admin user first
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@posbiz.com' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'Super Admin',
        email: 'admin@posbiz.com',
        emailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Create POSBiz Demo restaurant
    posbizRestaurant = await prisma.restaurant.create({
      data: {
        id: 'posbiz-demo-001',
        name: 'POSBiz Demo',
        address: '123 Demo Street, Mumbai, Maharashtra 400001',
        phone: '+91 22 1234 5678',
        email: 'info@posbiz.com',
        gstNumber: '27POSBIZ1234F1Z5',
        description: 'Demo restaurant for POSBiz system',
        businessType: 'RESTAURANT',
        isActive: true,
        isVerified: true,
        ownerId: adminUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Create default outlet for POSBiz Demo
    const posbizOutlet = await prisma.outlet.create({
      data: {
        id: 'posbiz-outlet-001',
        name: 'Main Branch',
        address: '123 Demo Street, Mumbai, Maharashtra 400001',
        phone: '+91 22 1234 5678',
        isActive: true,
        restaurantId: posbizRestaurant.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Create admin staff record (Super Admin)
    await prisma.staff.upsert({
      where: { email: 'admin@posbiz.com' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'Super Admin',
        email: 'admin@posbiz.com',
        phone: '+91 98765 43210',
        role: 'OWNER',
        password: adminPassword,
        isActive: true,
        isVerified: true,
        userId: adminUser.id,
        restaurantId: posbizRestaurant.id,
        outletId: posbizOutlet.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Create manager user for POSBiz Demo
    const managerUser = await prisma.user.upsert({
      where: { email: 'manager@restaurant.com' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'Restaurant Manager',
        email: 'manager@restaurant.com',
        emailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Create manager staff record
    await prisma.staff.upsert({
      where: { email: 'manager@restaurant.com' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'Restaurant Manager',
        email: 'manager@restaurant.com',
        phone: '+91 98765 43211',
        role: 'MANAGER',
        password: managerPassword,
        isActive: true,
        isVerified: true,
        userId: managerUser.id,
        restaurantId: posbizRestaurant.id,
        outletId: posbizOutlet.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Create staff user for POSBiz Demo
    const staffUser = await prisma.user.upsert({
      where: { email: 'staff@restaurant.com' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'Staff Member',
        email: 'staff@restaurant.com',
        emailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Create staff record
    await prisma.staff.upsert({
      where: { email: 'staff@restaurant.com' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'Staff Member',
        email: 'staff@restaurant.com',
        phone: '+91 98765 43212',
        role: 'KITCHEN_STAFF',
        password: staffPassword,
        isActive: true,
        isVerified: true,
        userId: staffUser.id,
        restaurantId: posbizRestaurant.id,
        outletId: posbizOutlet.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Create demo user
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@posbiz.com' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'Demo User',
        email: 'demo@posbiz.com',
        emailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Create demo staff record
    await prisma.staff.upsert({
      where: { email: 'demo@posbiz.com' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'Demo User',
        email: 'demo@posbiz.com',
        phone: '+91 98765 43213',
        role: 'OWNER',
        password: demoPassword,
        isActive: true,
        isVerified: true,
        userId: demoUser.id,
        restaurantId: posbizRestaurant.id,
        outletId: posbizOutlet.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('Created POSBiz Demo restaurant with all demo accounts')
  }

  // Create basic categories and menu items for POSBiz Demo
  const existingCategories = await prisma.category.findMany({
    where: { restaurantId: posbizRestaurant.id }
  })

  if (existingCategories.length === 0) {
    // Create default categories
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          id: 'posbiz-cat-1',
          name: 'Starters',
          description: 'Appetizers and starters',
          displayOrder: 1,
          isActive: true,
          restaurantId: posbizRestaurant.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      prisma.category.create({
        data: {
          id: 'posbiz-cat-2',
          name: 'Main Course',
          description: 'Main course dishes',
          displayOrder: 2,
          isActive: true,
          restaurantId: posbizRestaurant.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      prisma.category.create({
        data: {
          id: 'posbiz-cat-3',
          name: 'Beverages',
          description: 'Drinks and beverages',
          displayOrder: 3,
          isActive: true,
          restaurantId: posbizRestaurant.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    ])

    // Create sample menu items
    await Promise.all([
      prisma.menuItem.create({
        data: {
          id: 'posbiz-menu-1',
          name: 'Demo Starter',
          description: 'Sample appetizer for demo',
          price: 150,
          categoryId: categories[0].id,
          restaurantId: posbizRestaurant.id,
          isActive: true,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      prisma.menuItem.create({
        data: {
          id: 'posbiz-menu-2',
          name: 'Demo Main Course',
          description: 'Sample main course for demo',
          price: 350,
          categoryId: categories[1].id,
          restaurantId: posbizRestaurant.id,
          isActive: true,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      prisma.menuItem.create({
        data: {
          id: 'posbiz-menu-3',
          name: 'Demo Beverage',
          description: 'Sample drink for demo',
          price: 50,
          categoryId: categories[2].id,
          restaurantId: posbizRestaurant.id,
          isActive: true,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    ])

    console.log('Created categories and menu items for POSBiz Demo')
  }

  // Create sample tables
  const existingTables = await prisma.table.findMany({
    where: { restaurantId: posbizRestaurant.id }
  })

  if (existingTables.length === 0) {
    await Promise.all([
      prisma.table.create({
        data: {
          id: 'posbiz-table-1',
          number: 1,
          capacity: 4,
          status: 'AVAILABLE',
          restaurantId: posbizRestaurant.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      prisma.table.create({
        data: {
          id: 'posbiz-table-2',
          number: 2,
          capacity: 2,
          status: 'AVAILABLE',
          restaurantId: posbizRestaurant.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    ])

    console.log('Created sample tables for POSBiz Demo')
  }

  console.log('Demo accounts seeded successfully!')
  console.log('\nAvailable demo credentials:')
  console.log('Super Admin: admin@posbiz.com / admin123')
  console.log('Restaurant Manager: manager@restaurant.com / manager123')
  console.log('Staff Member: staff@restaurant.com / staff123')
  console.log('Demo Account: demo@posbiz.com / demo123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })