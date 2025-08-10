import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Fixing demo accounts...')

  // Get POSBiz Demo restaurant
  const posbizRestaurant = await prisma.restaurant.findFirst({
    where: { name: 'POSBiz Demo' }
  })

  if (!posbizRestaurant) {
    console.error('POSBiz Demo restaurant not found')
    return
  }

  // Get POSBiz Demo outlet
  const posbizOutlet = await prisma.outlet.findFirst({
    where: { restaurantId: posbizRestaurant.id }
  })

  if (!posbizOutlet) {
    console.error('POSBiz Demo outlet not found')
    return
  }

  // Fix staff@restaurant.com
  const staffUser = await prisma.user.findUnique({
    where: { email: 'staff@restaurant.com' }
  })

  if (staffUser) {
    const staffPassword = await bcrypt.hash('staff123', 12)
    
    // Create staff record for staff@restaurant.com
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
    
    console.log('Created staff record for staff@restaurant.com')
  }

  // Create demo@posbiz.com user and staff record
  const demoPassword = await bcrypt.hash('demo123', 12)
  
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

  // Create staff record for demo@posbiz.com
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

  console.log('Created user and staff record for demo@posbiz.com')

  // Verify all accounts
  const allStaff = await prisma.staff.findMany({
    where: {
      email: {
        in: [
          'admin@posbiz.com',
          'manager@restaurant.com',
          'staff@restaurant.com',
          'demo@posbiz.com'
        ]
      }
    }
  })

  console.log('\nAll demo accounts verified:')
  allStaff.forEach(staff => {
    console.log(`- ${staff.email} (${staff.role})`)
  })

  console.log('\nDemo accounts fixed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })