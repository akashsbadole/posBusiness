import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'admin@spicegarden.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'admin@spicegarden.com',
      name: 'Restaurant Admin',
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
      ownerId: user.id,
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

  // Create demo staff
  const staff = await prisma.staff.upsert({
    where: { email: 'manager@spicegarden.com' },
    update: {},
    create: {
      id: uuidv4(),
      name: 'Rajesh Kumar',
      email: 'manager@spicegarden.com',
      phone: '+91 98765 43210',
      role: 'MANAGER',
      password: 'password123', // In production, use hashed passwords
      isActive: true,
      userId: user.id,
      restaurantId: restaurant.id,
      outletId: outlet.id,
    },
  })

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'cat-starters' },
      update: {},
      create: {
        id: 'cat-starters',
        name: 'Starters',
        description: 'Appetizers and starters',
        displayOrder: 1,
        isActive: true,
        restaurantId: restaurant.id,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-main-course' },
      update: {},
      create: {
        id: 'cat-main-course',
        name: 'Main Course',
        description: 'Main course dishes',
        displayOrder: 2,
        isActive: true,
        restaurantId: restaurant.id,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-breads' },
      update: {},
      create: {
        id: 'cat-breads',
        name: 'Breads',
        description: 'Indian breads and rotis',
        displayOrder: 3,
        isActive: true,
        restaurantId: restaurant.id,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-desserts' },
      update: {},
      create: {
        id: 'cat-desserts',
        name: 'Desserts',
        description: 'Sweet dishes and desserts',
        displayOrder: 4,
        isActive: true,
        restaurantId: restaurant.id,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-beverages' },
      update: {},
      create: {
        id: 'cat-beverages',
        name: 'Beverages',
        description: 'Drinks and beverages',
        displayOrder: 5,
        isActive: true,
        restaurantId: restaurant.id,
      },
    }),
  ])

  // Create menu items
  const menuItems = await Promise.all([
    // Starters
    prisma.menuItem.upsert({
      where: { id: 'menu-paneer-tikka' },
      update: {},
      create: {
        id: 'menu-paneer-tikka',
        name: 'Paneer Tikka',
        description: 'Marinated paneer cubes grilled in tandoor',
        price: 299.00,
        categoryId: categories[0].id, // Starters
        restaurantId: restaurant.id,
        isActive: true,
        isAvailable: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'menu-chicken-tikka' },
      update: {},
      create: {
        id: 'menu-chicken-tikka',
        name: 'Chicken Tikka',
        description: 'Tender chicken pieces marinated and grilled',
        price: 349.00,
        categoryId: categories[0].id, // Starters
        restaurantId: restaurant.id,
        isActive: true,
        isAvailable: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'menu-samosa' },
      update: {},
      create: {
        id: 'menu-samosa',
        name: 'Samosa',
        description: 'Crispy pastry filled with spiced potatoes',
        price: 89.00,
        categoryId: categories[0].id, // Starters
        restaurantId: restaurant.id,
        isActive: true,
        isAvailable: true,
      },
    }),

    // Main Course
    prisma.menuItem.upsert({
      where: { id: 'menu-butter-chicken' },
      update: {},
      create: {
        id: 'menu-butter-chicken',
        name: 'Butter Chicken',
        description: 'Creamy tomato-based curry with tender chicken',
        price: 399.00,
        categoryId: categories[1].id, // Main Course
        restaurantId: restaurant.id,
        isActive: true,
        isAvailable: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'menu-paneer-butter-masala' },
      update: {},
      create: {
        id: 'menu-paneer-butter-masala',
        name: 'Paneer Butter Masala',
        description: 'Cottage cheese in rich tomato and butter gravy',
        price: 349.00,
        categoryId: categories[1].id, // Main Course
        restaurantId: restaurant.id,
        isActive: true,
        isAvailable: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'menu-dal-makhani' },
      update: {},
      create: {
        id: 'menu-dal-makhani',
        name: 'Dal Makhani',
        description: 'Creamy black lentils cooked with butter',
        price: 249.00,
        categoryId: categories[1].id, // Main Course
        restaurantId: restaurant.id,
        isActive: true,
        isAvailable: true,
      },
    }),

    // Breads
    prisma.menuItem.upsert({
      where: { id: 'menu-butter-naan' },
      update: {},
      create: {
        id: 'menu-butter-naan',
        name: 'Butter Naan',
        description: 'Soft leavened bread brushed with butter',
        price: 59.00,
        categoryId: categories[2].id, // Breads
        restaurantId: restaurant.id,
        isActive: true,
        isAvailable: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'menu-tandoori-roti' },
      update: {},
      create: {
        id: 'menu-tandoori-roti',
        name: 'Tandoori Roti',
        description: 'Whole wheat bread baked in tandoor',
        price: 39.00,
        categoryId: categories[2].id, // Breads
        restaurantId: restaurant.id,
        isActive: true,
        isAvailable: true,
      },
    }),

    // Desserts
    prisma.menuItem.upsert({
      where: { id: 'menu-gulab-jamun' },
      update: {},
      create: {
        id: 'menu-gulab-jamun',
        name: 'Gulab Jamun',
        description: 'Soft milk dumplings in sugar syrup',
        price: 99.00,
        categoryId: categories[3].id, // Desserts
        restaurantId: restaurant.id,
        isActive: true,
        isAvailable: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'menu-rasmalai' },
      update: {},
      create: {
        id: 'menu-rasmalai',
        name: 'Rasmalai',
        description: 'Soft cheese patties in sweetened milk',
        price: 129.00,
        categoryId: categories[3].id, // Desserts
        restaurantId: restaurant.id,
        isActive: true,
        isAvailable: true,
      },
    }),

    // Beverages
    prisma.menuItem.upsert({
      where: { id: 'menu-masala-chai' },
      update: {},
      create: {
        id: 'menu-masala-chai',
        name: 'Masala Chai',
        description: 'Spiced Indian tea with milk',
        price: 49.00,
        categoryId: categories[4].id, // Beverages
        restaurantId: restaurant.id,
        isActive: true,
        isAvailable: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'menu-mango-lassi' },
      update: {},
      create: {
        id: 'menu-mango-lassi',
        name: 'Mango Lassi',
        description: 'Sweet mango yogurt drink',
        price: 89.00,
        categoryId: categories[4].id, // Beverages
        restaurantId: restaurant.id,
        isActive: true,
        isAvailable: true,
      },
    }),
  ])

  // Create tables
  const tables = await Promise.all([
    prisma.table.upsert({
      where: { id: 'table-1' },
      update: {},
      create: {
        id: 'table-1',
        number: 1,
        capacity: 4,
        status: 'AVAILABLE',
        restaurantId: restaurant.id,
        outletId: outlet.id,
      },
    }),
    prisma.table.upsert({
      where: { id: 'table-2' },
      update: {},
      create: {
        id: 'table-2',
        number: 2,
        capacity: 4,
        status: 'AVAILABLE',
        restaurantId: restaurant.id,
        outletId: outlet.id,
      },
    }),
    prisma.table.upsert({
      where: { id: 'table-3' },
      update: {},
      create: {
        id: 'table-3',
        number: 3,
        capacity: 6,
        status: 'AVAILABLE',
        restaurantId: restaurant.id,
        outletId: outlet.id,
      },
    }),
    prisma.table.upsert({
      where: { id: 'table-4' },
      update: {},
      create: {
        id: 'table-4',
        number: 4,
        capacity: 2,
        status: 'AVAILABLE',
        restaurantId: restaurant.id,
        outletId: outlet.id,
      },
    }),
    prisma.table.upsert({
      where: { id: 'table-5' },
      update: {},
      create: {
        id: 'table-5',
        number: 5,
        capacity: 8,
        status: 'AVAILABLE',
        restaurantId: restaurant.id,
        outletId: outlet.id,
      },
    }),
  ])

  // Create customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { id: 'customer-1' },
      update: {},
      create: {
        id: 'customer-1',
        name: 'Amit Sharma',
        email: 'amit.sharma@email.com',
        phone: '+91 98765 43210',
        address: '456 Park Avenue, Mumbai',
        loyaltyPoints: 150,
        restaurantId: restaurant.id,
      },
    }),
    prisma.customer.upsert({
      where: { id: 'customer-2' },
      update: {},
      create: {
        id: 'customer-2',
        name: 'Priya Patel',
        email: 'priya.patel@email.com',
        phone: '+91 87654 32109',
        address: '789 Marine Drive, Mumbai',
        loyaltyPoints: 320,
        restaurantId: restaurant.id,
      },
    }),
    prisma.customer.upsert({
      where: { id: 'customer-3' },
      update: {},
      create: {
        id: 'customer-3',
        name: 'Rahul Verma',
        email: 'rahul.verma@email.com',
        phone: '+91 76543 21098',
        address: '321 Bandra West, Mumbai',
        loyaltyPoints: 85,
        restaurantId: restaurant.id,
      },
    }),
  ])

  // Create sample orders
  const orders = await Promise.all([
    prisma.order.upsert({
      where: { orderNumber: 'ORD-001' },
      update: {},
      create: {
        id: 'order-1',
        orderNumber: 'ORD-001',
        orderType: 'DINE_IN',
        status: 'DELIVERED',
        customerId: customers[0].id,
        tableId: tables[0].id,
        staffId: staff.id,
        restaurantId: restaurant.id,
        outletId: outlet.id,
        subtotal: 897.00,
        gstAmount: 44.85,
        totalAmount: 941.85,
        discount: 0,
        notes: 'Customer requested extra spicy',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    }),
    prisma.order.upsert({
      where: { orderNumber: 'ORD-002' },
      update: {},
      create: {
        id: 'order-2',
        orderNumber: 'ORD-002',
        orderType: 'TAKEAWAY',
        status: 'READY',
        customerId: customers[1].id,
        staffId: staff.id,
        restaurantId: restaurant.id,
        outletId: outlet.id,
        subtotal: 448.00,
        gstAmount: 22.40,
        totalAmount: 470.40,
        discount: 0,
        notes: 'Pickup in 30 minutes',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
    }),
    prisma.order.upsert({
      where: { orderNumber: 'ORD-003' },
      update: {},
      create: {
        id: 'order-3',
        orderNumber: 'ORD-003',
        orderType: 'DINE_IN',
        status: 'PREPARING',
        customerId: customers[2].id,
        tableId: tables[2].id,
        staffId: staff.id,
        restaurantId: restaurant.id,
        outletId: outlet.id,
        subtotal: 698.00,
        gstAmount: 34.90,
        totalAmount: 732.90,
        discount: 50.00, // 50 rupees discount
        notes: 'Birthday celebration',
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
    }),
  ])

  // Create order items
  const orderItems = await Promise.all([
    // Order 1 items
    prisma.orderItem.upsert({
      where: { id: 'order-item-1' },
      update: {},
      create: {
        id: 'order-item-1',
        orderId: orders[0].id,
        menuItemId: menuItems[0].id, // Paneer Tikka
        quantity: 1,
        price: 299.00,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    }),
    prisma.orderItem.upsert({
      where: { id: 'order-item-2' },
      update: {},
      create: {
        id: 'order-item-2',
        orderId: orders[0].id,
        menuItemId: menuItems[3].id, // Butter Chicken
        quantity: 1,
        price: 399.00,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    }),
    prisma.orderItem.upsert({
      where: { id: 'order-item-3' },
      update: {},
      create: {
        id: 'order-item-3',
        orderId: orders[0].id,
        menuItemId: menuItems[6].id, // Butter Naan
        quantity: 2,
        price: 59.00,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    }),

    // Order 2 items
    prisma.orderItem.upsert({
      where: { id: 'order-item-4' },
      update: {},
      create: {
        id: 'order-item-4',
        orderId: orders[1].id,
        menuItemId: menuItems[4].id, // Paneer Butter Masala
        quantity: 1,
        price: 349.00,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    }),
    prisma.orderItem.upsert({
      where: { id: 'order-item-5' },
      update: {},
      create: {
        id: 'order-item-5',
        orderId: orders[1].id,
        menuItemId: menuItems[7].id, // Tandoori Roti
        quantity: 2,
        price: 39.00,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    }),

    // Order 3 items
    prisma.orderItem.upsert({
      where: { id: 'order-item-6' },
      update: {},
      create: {
        id: 'order-item-6',
        orderId: orders[2].id,
        menuItemId: menuItems[1].id, // Chicken Tikka
        quantity: 1,
        price: 349.00,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    }),
    prisma.orderItem.upsert({
      where: { id: 'order-item-7' },
      update: {},
      create: {
        id: 'order-item-7',
        orderId: orders[2].id,
        menuItemId: menuItems[5].id, // Dal Makhani
        quantity: 1,
        price: 249.00,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    }),
    prisma.orderItem.upsert({
      where: { id: 'order-item-8' },
      update: {},
      create: {
        id: 'order-item-8',
        orderId: orders[2].id,
        menuItemId: menuItems[6].id, // Butter Naan
        quantity: 2,
        price: 59.00,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    }),
  ])

  // Create KOT items
  const kotItems = await Promise.all([
    prisma.kOTItem.upsert({
      where: { id: 'kot-item-1' },
      update: {},
      create: {
        id: 'kot-item-1',
        orderItemId: orderItems[0].id,
        orderId: orders[0].id,
        status: 'READY',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    }),
    prisma.kOTItem.upsert({
      where: { id: 'kot-item-2' },
      update: {},
      create: {
        id: 'kot-item-2',
        orderItemId: orderItems[1].id,
        orderId: orders[0].id,
        status: 'READY',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    }),
    prisma.kOTItem.upsert({
      where: { id: 'kot-item-3' },
      update: {},
      create: {
        id: 'kot-item-3',
        orderItemId: orderItems[2].id,
        orderId: orders[0].id,
        status: 'READY',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    }),
    prisma.kOTItem.upsert({
      where: { id: 'kot-item-4' },
      update: {},
      create: {
        id: 'kot-item-4',
        orderItemId: orderItems[3].id,
        orderId: orders[1].id,
        status: 'READY',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    }),
    prisma.kOTItem.upsert({
      where: { id: 'kot-item-5' },
      update: {},
      create: {
        id: 'kot-item-5',
        orderItemId: orderItems[4].id,
        orderId: orders[1].id,
        status: 'READY',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    }),
    prisma.kOTItem.upsert({
      where: { id: 'kot-item-6' },
      update: {},
      create: {
        id: 'kot-item-6',
        orderItemId: orderItems[5].id,
        orderId: orders[2].id,
        status: 'PREPARING',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    }),
    prisma.kOTItem.upsert({
      where: { id: 'kot-item-7' },
      update: {},
      create: {
        id: 'kot-item-7',
        orderItemId: orderItems[6].id,
        orderId: orders[2].id,
        status: 'PREPARING',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    }),
    prisma.kOTItem.upsert({
      where: { id: 'kot-item-8' },
      update: {},
      create: {
        id: 'kot-item-8',
        orderItemId: orderItems[7].id,
        orderId: orders[2].id,
        status: 'PREPARING',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    }),
  ])

  // Create payments
  const payments = await Promise.all([
    prisma.payment.upsert({
      where: { id: 'payment-1' },
      update: {},
      create: {
        id: 'payment-1',
        orderId: orders[0].id,
        amount: 941.85,
        method: 'CARD',
        status: 'COMPLETED',
        transactionId: 'TXN123456789',
        notes: 'Paid via credit card',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    }),
    prisma.payment.upsert({
      where: { id: 'payment-2' },
      update: {},
      create: {
        id: 'payment-2',
        orderId: orders[1].id,
        amount: 470.40,
        method: 'UPI',
        status: 'COMPLETED',
        transactionId: 'UPI987654321',
        notes: 'Paid via PhonePe',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    }),
  ])

  // Create inventory items
  const inventoryItems = await Promise.all([
    prisma.inventoryItem.upsert({
      where: { id: 'inventory-1' },
      update: {},
      create: {
        id: 'inventory-1',
        name: 'Paneer',
        description: 'Fresh cottage cheese',
        quantity: 50.0,
        unit: 'kg',
        minStock: 10.0,
        maxStock: 100.0,
        cost: 200.00,
        restaurantId: restaurant.id,
        outletId: outlet.id,
        isActive: true,
      },
    }),
    prisma.inventoryItem.upsert({
      where: { id: 'inventory-2' },
      update: {},
      create: {
        id: 'inventory-2',
        name: 'Chicken',
        description: 'Fresh chicken breast',
        quantity: 30.0,
        unit: 'kg',
        minStock: 15.0,
        maxStock: 50.0,
        cost: 250.00,
        restaurantId: restaurant.id,
        outletId: outlet.id,
        isActive: true,
      },
    }),
    prisma.inventoryItem.upsert({
      where: { id: 'inventory-3' },
      update: {},
      create: {
        id: 'inventory-3',
        name: 'Wheat Flour',
        description: 'Whole wheat flour for breads',
        quantity: 100.0,
        unit: 'kg',
        minStock: 20.0,
        maxStock: 200.0,
        cost: 40.00,
        restaurantId: restaurant.id,
        outletId: outlet.id,
        isActive: true,
      },
    }),
    prisma.inventoryItem.upsert({
      where: { id: 'inventory-4' },
      update: {},
      create: {
        id: 'inventory-4',
        name: 'Tomatoes',
        description: 'Fresh tomatoes',
        quantity: 25.0,
        unit: 'kg',
        minStock: 10.0,
        maxStock: 50.0,
        cost: 30.00,
        restaurantId: restaurant.id,
        outletId: outlet.id,
        isActive: true,
      },
    }),
    prisma.inventoryItem.upsert({
      where: { id: 'inventory-5' },
      update: {},
      create: {
        id: 'inventory-5',
        name: 'Milk',
        description: 'Fresh milk for desserts',
        quantity: 20.0,
        unit: 'liters',
        minStock: 5.0,
        maxStock: 50.0,
        cost: 50.00,
        restaurantId: restaurant.id,
        outletId: outlet.id,
        isActive: true,
      },
    }),
  ])

  console.log('✅ Database seeded successfully!')
  console.log('📊 Seeded data summary:')
  console.log(`   - Users: 1`)
  console.log(`   - Restaurants: 1`)
  console.log(`   - Outlets: 1`)
  console.log(`   - Subscriptions: 1`)
  console.log(`   - Staff: 1`)
  console.log(`   - Categories: 5`)
  console.log(`   - Menu Items: 10`)
  console.log(`   - Tables: 5`)
  console.log(`   - Customers: 3`)
  console.log(`   - Orders: 3`)
  console.log(`   - Order Items: 8`)
  console.log(`   - KOT Items: 8`)
  console.log(`   - Payments: 2`)
  console.log(`   - Inventory Items: 5`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })