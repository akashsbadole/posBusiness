import { db } from '../src/lib/db'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

async function updateToBusiness() {
  try {
    console.log('Updating to business-agnostic system...')

    // Update existing restaurant to business
    const spiceBusiness = await db.restaurant.updateMany({
      where: { name: 'Spice Garden' },
      data: {
        name: 'Spice Business',
        email: 'info@spicebusiness.com',
        description: 'Retail business with modern management',
        businessType: 'RETAIL_STORE'
      }
    })

    console.log(`Updated ${spiceBusiness.count} restaurant(s) to Spice Business`)

    // Update demo restaurant to demo business
    const demoBusiness = await db.restaurant.updateMany({
      where: { name: 'Demo Restaurant' },
      data: {
        name: 'Demo Business',
        email: 'demo@business.com',
        description: 'Demo business for testing and training',
        businessType: 'RETAIL_STORE'
      }
    })

    console.log(`Updated ${demoBusiness.count} restaurant(s) to Demo Business`)

    // Update user names to be more generic
    const updatedUsers = await db.user.updateMany({
      where: {
        OR: [
          { name: 'Restaurant Admin' },
          { name: 'Restaurant Owner' },
          { name: 'Restaurant Manager' },
          { name: 'Restaurant Cashier' }
        ]
      },
      data: {
        name: {
          set: 'Business User'
        }
      }
    })

    console.log(`Updated ${updatedUsers.count} user names to be business-agnostic`)

    // Update staff names to be more generic
    const updatedStaff = await db.staff.updateMany({
      where: {
        OR: [
          { name: 'Restaurant Owner' },
          { name: 'Restaurant Manager' },
          { name: 'Restaurant Cashier' },
          { name: 'Kitchen Staff' },
          { name: 'Waiter Staff' }
        ]
      },
      data: {
        name: {
          set: 'Business Staff'
        }
      }
    })

    console.log(`Updated ${updatedStaff.count} staff names to be business-agnostic`)

    // Update categories to be more generic
    const updatedCategories = await db.category.updateMany({
      where: {
        OR: [
          { name: 'Starters' },
          { name: 'Main Course' },
          { name: 'Breads' },
          { name: 'Desserts' },
          { name: 'Beverages' }
        ]
      },
      data: {
        name: {
          set: 'General Products'
        },
        description: {
          set: 'General products and services'
        }
      }
    })

    console.log(`Updated ${updatedCategories.count} categories to be business-agnostic`)

    // Update menu items to be more generic
    const updatedMenuItems = await db.menuItem.updateMany({
      where: {
        OR: [
          { name: 'Paneer Tikka' },
          { name: 'Chicken Tikka' },
          { name: 'Samosa' },
          { name: 'Butter Chicken' },
          { name: 'Paneer Butter Masala' },
          { name: 'Dal Makhani' },
          { name: 'Butter Naan' },
          { name: 'Tandoori Roti' },
          { name: 'Gulab Jamun' },
          { name: 'Rasmalai' },
          { name: 'Masala Chai' },
          { name: 'Mango Lassi' }
        ]
      },
      data: {
        name: {
          set: 'General Product'
        },
        description: {
          set: 'General product or service'
        }
      }
    })

    console.log(`Updated ${updatedMenuItems.count} menu items to be business-agnostic`)

    console.log('Business-agnostic update completed successfully!')

  } catch (error) {
    console.error('Error updating to business-agnostic system:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

updateToBusiness()