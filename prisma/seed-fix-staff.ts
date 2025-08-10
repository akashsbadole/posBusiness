import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Fixing staff accounts...')

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create user records for additional staff
  const chefUser = await prisma.user.upsert({
    where: { email: 'chef@spicegarden.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'chef@spicegarden.com',
      name: 'Priya Singh',
      emailVerified: true,
    },
  })

  const cashierUser = await prisma.user.upsert({
    where: { email: 'cashier@spicegarden.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'cashier@spicegarden.com',
      name: 'Suresh Patel',
      emailVerified: true,
    },
  })

  const waiterUser = await prisma.user.upsert({
    where: { email: 'waiter@spicegarden.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'waiter@spicegarden.com',
      name: 'Anita Desai',
      emailVerified: true,
    },
  })

  // Get restaurant
  const restaurant = await prisma.restaurant.findFirst({
    where: { id: 'cme2cx36c0002x5haddxsxhtg' }
  })

  if (!restaurant) {
    console.log('❌ Restaurant not found')
    return
  }

  // Get outlet
  const outlet = await prisma.outlet.findFirst({
    where: { id: 'outlet-1' }
  })

  if (!outlet) {
    console.log('❌ Outlet not found')
    return
  }

  // Update staff records to include userId
  await Promise.all([
    prisma.staff.update({
      where: { email: 'chef@spicegarden.com' },
      data: { 
        userId: chefUser.id,
        password: hashedPassword,
        isActive: true,
        isVerified: true,
      },
    }),
    prisma.staff.update({
      where: { email: 'cashier@spicegarden.com' },
      data: { 
        userId: cashierUser.id,
        password: hashedPassword,
        isActive: true,
        isVerified: true,
      },
    }),
    prisma.staff.update({
      where: { email: 'waiter@spicegarden.com' },
      data: { 
        userId: waiterUser.id,
        password: hashedPassword,
        isActive: true,
        isVerified: true,
      },
    }),
  ])

  // Also fix manager account password if needed
  const managerUser = await prisma.user.findUnique({
    where: { email: 'manager@spicegarden.com' }
  })

  if (managerUser) {
    await prisma.staff.update({
      where: { email: 'manager@spicegarden.com' },
      data: { 
        userId: managerUser.id,
        password: await bcrypt.hash('manager123', 10),
        isActive: true,
        isVerified: true,
      },
    })
  }

  console.log('✅ Staff accounts fixed successfully!')
  console.log('📝 Updated Test Accounts:')
  console.log('   Owner: owner@spicegarden.com / owner123')
  console.log('   Manager: manager@spicegarden.com / manager123')
  console.log('   Staff: staff@spicegarden.com / staff123')
  console.log('   Chef: chef@spicegarden.com / password123')
  console.log('   Cashier: cashier@spicegarden.com / password123')
  console.log('   Waiter: waiter@spicegarden.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Error fixing staff accounts:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })