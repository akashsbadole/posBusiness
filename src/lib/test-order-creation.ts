import { db } from './db'

async function testOrderCreation() {
  try {
    console.log('Testing order creation...')
    
    // Test data similar to what the frontend sends
    const orderData = {
      orderType: 'DINE_IN',
      customerId: null,
      tableId: null,
      staffId: 'eca71220-9e3b-4d60-81dc-372a8c780912',
      restaurantId: 'cme2cx36c0002x5haddxsxhtg',
      outletId: null,
      orderItems: [
        {
          menuItemId: 'menu-paneer-tikka',
          quantity: 1,
          price: 280,
          notes: ''
        }
      ],
      notes: ''
    }
    
    console.log('Order data:', orderData)
    
    // Check if menu item exists
    const menuItem = await db.menuItem.findUnique({
      where: { id: orderData.orderItems[0].menuItemId }
    })
    console.log('Menu item exists:', menuItem ? 'Yes' : 'No')
    if (menuItem) {
      console.log('Menu item details:', { id: menuItem.id, name: menuItem.name, price: menuItem.price })
    }
    
    // Check if staff exists
    const staff = await db.staff.findUnique({
      where: { id: orderData.staffId }
    })
    console.log('Staff exists:', staff ? 'Yes' : 'No')
    if (staff) {
      console.log('Staff details:', { id: staff.id, name: staff.name })
    }
    
    // Check if restaurant exists
    const restaurant = await db.restaurant.findUnique({
      where: { id: orderData.restaurantId }
    })
    console.log('Restaurant exists:', restaurant ? 'Yes' : 'No')
    if (restaurant) {
      console.log('Restaurant details:', { id: restaurant.id, name: restaurant.name })
    }
    
    // Try to create the order
    console.log('Attempting to create order...')
    
    // Calculate order totals
    let subtotal = 0
    const processedOrderItems = orderData.orderItems.map((item: any) => {
      const itemTotal = item.price * item.quantity
      subtotal += itemTotal
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || null
      }
    })
    
    // Calculate GST (assuming 5% for restaurant items in India)
    const gstRate = 0.05
    const gstAmount = subtotal * gstRate
    const totalAmount = subtotal + gstAmount
    
    // Generate order number
    const orderCount = await db.order.count({
      where: { restaurantId: orderData.restaurantId }
    })
    const orderNumber = `ORD-${String(orderCount + 1).padStart(4, '0')}`
    
    console.log('Order number:', orderNumber)
    console.log('Processed order items:', processedOrderItems)
    
    // Create order with order items
    const order = await db.order.create({
      data: {
        orderNumber,
        orderType: orderData.orderType,
        status: 'PENDING',
        customerId: orderData.customerId || null,
        tableId: orderData.tableId || null,
        staffId: orderData.staffId,
        restaurantId: orderData.restaurantId,
        outletId: orderData.outletId || null,
        subtotal,
        gstAmount,
        totalAmount,
        discount: 0,
        notes: orderData.notes || null,
        orderItems: {
          create: processedOrderItems
        }
      },
      include: {
        customer: true,
        table: true,
        staff: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        orderItems: {
          include: {
            menuItem: true
          }
        },
        payments: true
      }
    })
    
    console.log('Order created successfully:', order.id)
    
  } catch (error) {
    console.error('Error creating order:', error)
    console.error('Error details:', error.message)
    if (error.code) {
      console.error('Error code:', error.code)
    }
    if (error.meta) {
      console.error('Error meta:', error.meta)
    }
  }
}

testOrderCreation()
  .then(() => {
    console.log('Order creation test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Order creation test failed:', error)
    process.exit(1)
  })