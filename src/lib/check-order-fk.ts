import { db } from './db'

async function checkOrderFK() {
  try {
    console.log('Checking order foreign key constraints...')
    
    // Check all required tables and their IDs
    const restaurant = await db.restaurant.findFirst()
    console.log('Restaurant:', restaurant?.id, restaurant?.name)
    
    const staff = await db.staff.findMany()
    console.log('Staff:', staff.map(s => ({ id: s.id, name: s.name })))
    
    const customers = await db.customer.findMany()
    console.log('Customers:', customers.map(c => ({ id: c.id, name: c.name })))
    
    const tables = await db.table.findMany()
    console.log('Tables:', tables.map(t => ({ id: t.id, number: t.number })))
    
    const menuItems = await db.menuItem.findMany()
    console.log('Menu Items:', menuItems.map(m => ({ id: m.id, name: m.name })))
    
    // Check existing orders
    const orders = await db.order.findMany()
    console.log('Existing Orders:', orders.map(o => ({ 
      id: o.id, 
      orderNumber: o.orderNumber, 
      staffId: o.staffId,
      customerId: o.customerId,
      tableId: o.tableId 
    })))
    
    // Check if staff ID is valid
    const staffExists = await db.staff.findUnique({
      where: { id: 'eca71220-9e3b-4d60-81dc-372a8c780912' }
    })
    console.log('Staff ID eca71220-9e3b-4d60-81dc-372a8c780912 exists:', staffExists ? 'Yes' : 'No')
    
    // Check if restaurant ID is valid
    const restaurantExists = await db.restaurant.findUnique({
      where: { id: 'cme2cx36c0002x5haddxsxhtg' }
    })
    console.log('Restaurant ID cme2cx36c0002x5haddxsxhtg exists:', restaurantExists ? 'Yes' : 'No')
    
  } catch (error) {
    console.error('Error checking order FK:', error)
  }
}

checkOrderFK()
  .then(() => {
    console.log('Order FK check completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Order FK check failed:', error)
    process.exit(1)
  })