import { db } from './db'

async function seedSimpleData() {
  try {
    // Create a sample user first
    const user = await db.user.create({
      data: {
        email: 'owner@spicegarden.com',
        name: 'Restaurant Owner'
      }
    })

    // Create a sample restaurant
    const restaurant = await db.restaurant.create({
      data: {
        name: 'Spice Garden',
        address: '123 Main Street, Mumbai, Maharashtra 400001',
        phone: '+91 22 1234 5678',
        email: 'info@spicegarden.com',
        gstNumber: '27ABCDE1234F1Z5',
        description: 'Authentic Indian cuisine with modern twist',
        ownerId: user.id,
        isActive: true
      }
    })

    // Create sample categories
    const categories = await Promise.all([
      db.category.create({
        data: {
          name: 'Starters',
          description: 'Appetizers and finger foods',
          displayOrder: 1,
          restaurantId: restaurant.id
        }
      }),
      db.category.create({
        data: {
          name: 'Main Course',
          description: 'Main dishes and curries',
          displayOrder: 2,
          restaurantId: restaurant.id
        }
      }),
      db.category.create({
        data: {
          name: 'Desserts',
          description: 'Sweet endings',
          displayOrder: 3,
          restaurantId: restaurant.id
        }
      }),
      db.category.create({
        data: {
          name: 'Beverages',
          description: 'Drinks and refreshments',
          displayOrder: 4,
          restaurantId: restaurant.id
        }
      })
    ])

    // Create sample menu items
    const menuItems = await Promise.all([
      // Starters
      db.menuItem.create({
        data: {
          name: 'Paneer Tikka',
          description: 'Grilled cottage cheese with spices',
          price: 280,
          categoryId: categories[0].id,
          restaurantId: restaurant.id
        }
      }),
      db.menuItem.create({
        data: {
          name: 'Chicken 65',
          description: 'Spicy deep fried chicken',
          price: 320,
          categoryId: categories[0].id,
          restaurantId: restaurant.id
        }
      }),
      // Main Course
      db.menuItem.create({
        data: {
          name: 'Butter Chicken',
          description: 'Tender chicken in creamy tomato sauce',
          price: 350,
          categoryId: categories[1].id,
          restaurantId: restaurant.id
        }
      }),
      db.menuItem.create({
        data: {
          name: 'Paneer Butter Masala',
          description: 'Cottage cheese in rich creamy gravy',
          price: 280,
          categoryId: categories[1].id,
          restaurantId: restaurant.id
        }
      }),
      db.menuItem.create({
        data: {
          name: 'Biryani',
          description: 'Fragrant rice with aromatic spices',
          price: 380,
          categoryId: categories[1].id,
          restaurantId: restaurant.id
        }
      }),
      // Desserts
      db.menuItem.create({
        data: {
          name: 'Gulab Jamun',
          description: 'Sweet milk dumplings in sugar syrup',
          price: 120,
          categoryId: categories[2].id,
          restaurantId: restaurant.id
        }
      }),
      db.menuItem.create({
        data: {
          name: 'Rasmalai',
          description: 'Soft cottage cheese dumplings in sweet milk',
          price: 150,
          categoryId: categories[2].id,
          restaurantId: restaurant.id
        }
      }),
      // Beverages
      db.menuItem.create({
        data: {
          name: 'Masala Chai',
          description: 'Spiced Indian tea',
          price: 40,
          categoryId: categories[3].id,
          restaurantId: restaurant.id
        }
      }),
      db.menuItem.create({
        data: {
          name: 'Fresh Lime Soda',
          description: 'Refreshing lime drink',
          price: 80,
          categoryId: categories[3].id,
          restaurantId: restaurant.id
        }
      })
    ])

    // Create sample customers
    const customers = await Promise.all([
      db.customer.create({
        data: {
          name: 'Raj Kumar',
          phone: '+91 98765 43210',
          email: 'raj.kumar@email.com',
          restaurantId: restaurant.id,
          loyaltyPoints: 150
        }
      }),
      db.customer.create({
        data: {
          name: 'Priya Sharma',
          phone: '+91 87654 32109',
          email: 'priya.sharma@email.com',
          restaurantId: restaurant.id,
          loyaltyPoints: 200
        }
      }),
      db.customer.create({
        data: {
          name: 'Amit Patel',
          phone: '+91 76543 21098',
          email: 'amit.patel@email.com',
          restaurantId: restaurant.id,
          loyaltyPoints: 75
        }
      })
    ])

    // Create sample tables
    const tables = await Promise.all([
      db.table.create({
        data: {
          number: 1,
          capacity: 4,
          restaurantId: restaurant.id
        }
      }),
      db.table.create({
        data: {
          number: 2,
          capacity: 4,
          restaurantId: restaurant.id
        }
      }),
      db.table.create({
        data: {
          number: 3,
          capacity: 6,
          restaurantId: restaurant.id
        }
      }),
      db.table.create({
        data: {
          number: 4,
          capacity: 2,
          restaurantId: restaurant.id
        }
      }),
      db.table.create({
        data: {
          number: 5,
          capacity: 8,
          restaurantId: restaurant.id
        }
      })
    ])

    // Create sample staff
    const staff = await Promise.all([
      db.staff.create({
        data: {
          name: 'John Manager',
          email: 'john@spicegarden.com',
          phone: '+91 98765 11111',
          role: 'MANAGER',
          password: 'hashed_password_here',
          restaurantId: restaurant.id
        }
      }),
      db.staff.create({
        data: {
          name: 'Priya Waiter',
          email: 'priya@spicegarden.com',
          phone: '+91 98765 22222',
          role: 'WAITER',
          password: 'hashed_password_here',
          restaurantId: restaurant.id
        }
      }),
      db.staff.create({
        data: {
          name: 'Raj Chef',
          email: 'raj@spicegarden.com',
          phone: '+91 98765 33333',
          role: 'CHEF',
          password: 'hashed_password_here',
          restaurantId: restaurant.id
        }
      })
    ])

    // Create sample orders
    const orders = await Promise.all([
      db.order.create({
        data: {
          orderNumber: 'ORD-001',
          orderType: 'DINE_IN',
          status: 'DELIVERED',
          customerId: customers[0].id,
          tableId: tables[0].id,
          staffId: staff[1].id,
          restaurantId: restaurant.id,
          subtotal: 630,
          gstAmount: 31.5,
          totalAmount: 661.5,
          discount: 0,
          notes: 'Customer enjoyed the meal',
          orderItems: {
            create: [
              {
                menuItemId: menuItems[0].id,
                quantity: 1,
                price: 280
              },
              {
                menuItemId: menuItems[2].id,
                quantity: 1,
                price: 350
              }
            ]
          }
        }
      }),
      db.order.create({
        data: {
          orderNumber: 'ORD-002',
          orderType: 'TAKEAWAY',
          status: 'READY',
          customerId: customers[1].id,
          staffId: staff[1].id,
          restaurantId: restaurant.id,
          subtotal: 400,
          gstAmount: 20,
          totalAmount: 420,
          discount: 0,
          orderItems: {
            create: [
              {
                menuItemId: menuItems[3].id,
                quantity: 1,
                price: 280
              },
              {
                menuItemId: menuItems[7].id,
                quantity: 3,
                price: 40
              }
            ]
          }
        }
      }),
      db.order.create({
        data: {
          orderNumber: 'ORD-003',
          orderType: 'DELIVERY',
          status: 'PREPARING',
          customerId: customers[2].id,
          staffId: staff[1].id,
          restaurantId: restaurant.id,
          subtotal: 500,
          gstAmount: 25,
          totalAmount: 525,
          discount: 0,
          notes: 'Delivery to nearby office',
          orderItems: {
            create: [
              {
                menuItemId: menuItems[4].id,
                quantity: 1,
                price: 380
              },
              {
                menuItemId: menuItems[5].id,
                quantity: 1,
                price: 120
              }
            ]
          }
        }
      })
    ])

    console.log('Sample data seeded successfully!')
    console.log('Restaurant ID:', restaurant.id)
    console.log('User ID:', user.id)
    console.log('Created:', {
      categories: categories.length,
      menuItems: menuItems.length,
      customers: customers.length,
      tables: tables.length,
      staff: staff.length,
      orders: orders.length
    })
    
  } catch (error) {
    console.error('Error seeding data:', error)
  }
}

// Run seed data function
seedSimpleData()
  .then(() => {
    console.log('Data seeding completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Data seeding failed:', error)
    process.exit(1)
  })