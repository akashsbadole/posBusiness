import { db } from './db'

async function checkDatabase() {
  try {
    console.log('Checking database state...')
    
    // Check staff
    const staff = await db.staff.findMany()
    console.log('Staff members:', staff.map(s => ({ id: s.id, name: s.name, email: s.email })))
    
    // Check restaurant
    const restaurant = await db.restaurant.findFirst()
    console.log('Restaurant:', restaurant?.id, restaurant?.name)
    
    // Check if the specific staff ID exists
    const targetStaff = await db.staff.findUnique({
      where: { id: 'eca71220-9e3b-4d60-81dc-372a8c780912' }
    })
    console.log('Target staff found:', targetStaff ? 'Yes' : 'No')
    
  } catch (error) {
    console.error('Error checking database:', error)
  }
}

checkDatabase()
  .then(() => {
    console.log('Database check completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Database check failed:', error)
    process.exit(1)
  })