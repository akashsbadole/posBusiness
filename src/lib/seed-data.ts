import { db } from './db'

async function seedData() {
  try {
    // Create a sample restaurant
    const restaurant = await db.restaurant.create({
      data: {
        name: 'Spice Garden',
        address: '123 Main Street, Mumbai, Maharashtra 400001',
        phone: '+91 22 1234 5678',
        email: 'info@spicegarden.com',
        gstNumber: '27ABCDE1234F1Z5',
        description: 'Authentic Indian cuisine with modern twist',
        ownerId: 'temp-owner-id', // This should be replaced with actual user ID
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

    console.log('Sample data seeded successfully!')
    console.log('Restaurant ID:', restaurant.id)
    
  } catch (error) {
    console.error('Error seeding data:', error)
  }
}

// Run seed data function
seedData()
  .then(() => {
    console.log('Data seeding completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Data seeding failed:', error)
    process.exit(1)
  })