import { PrismaClient, BusinessType, StaffRole } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Business type configurations
const businessTypes = [
  {
    type: BusinessType.RESTAURANT,
    name: 'Spice Garden Restaurant',
    description: 'Authentic Indian cuisine with modern twist',
    address: '123 Main Street, Mumbai, Maharashtra 400001',
    phone: '+91 22 1234 5678',
    email: 'info@spicegarden.com',
    gstNumber: '27ABCDE1234F1Z5',
    features: {
      enableGST: true,
      enableInventory: true,
      enableTables: true,
      enableAppointments: false,
      enableServices: false,
      enableSubscriptions: false,
      enableLoyalty: true,
      enableDelivery: true,
      enableAI: true
    }
  },
  {
    type: BusinessType.RETAIL_STORE,
    name: 'TechHub Electronics',
    description: 'Premium electronics and gadgets store',
    address: '456 Tech Park, Bangalore, Karnataka 560001',
    phone: '+91 80 2345 6789',
    email: 'info@techhub.com',
    gstNumber: '29FGHIJ5678K1Z5',
    features: {
      enableGST: true,
      enableInventory: true,
      enableTables: false,
      enableAppointments: false,
      enableServices: true,
      enableSubscriptions: false,
      enableLoyalty: true,
      enableDelivery: true,
      enableAI: true
    }
  },
  {
    type: BusinessType.CAFE,
    name: 'Brew & Beans Cafe',
    description: 'Artisanal coffee and freshly baked goods',
    address: '789 Coffee Lane, Pune, Maharashtra 411001',
    phone: '+91 20 3456 7890',
    email: 'info@brewandbeans.com',
    gstNumber: '27KLMNO9012P1Z5',
    features: {
      enableGST: true,
      enableInventory: true,
      enableTables: true,
      enableAppointments: false,
      enableServices: false,
      enableSubscriptions: false,
      enableLoyalty: true,
      enableDelivery: true,
      enableAI: true
    }
  },
  {
    type: BusinessType.HOTEL,
    name: 'Grand Palace Hotel',
    description: 'Luxury hotel with fine dining and premium services',
    address: '321 Palace Road, Delhi, Delhi 110001',
    phone: '+91 11 4567 8901',
    email: 'info@grandpalace.com',
    gstNumber: '07QRSTU3456V1Z5',
    features: {
      enableGST: true,
      enableInventory: true,
      enableTables: true,
      enableAppointments: true,
      enableServices: true,
      enableSubscriptions: false,
      enableLoyalty: true,
      enableDelivery: true,
      enableAI: true
    }
  },
  {
    type: BusinessType.BAR,
    name: 'The Sky Lounge',
    description: 'Premium bar with signature cocktails and nightlife',
    address: '654 Sky Tower, Mumbai, Maharashtra 400001',
    phone: '+91 22 5678 9012',
    email: 'info@skylounge.com',
    gstNumber: '27WXYZA7890B1Z5',
    features: {
      enableGST: true,
      enableInventory: true,
      enableTables: true,
      enableAppointments: false,
      enableServices: false,
      enableSubscriptions: false,
      enableLoyalty: true,
      enableDelivery: false,
      enableAI: true
    }
  },
  {
    type: BusinessType.ECOMMERCE,
    name: 'ShopZone Online',
    description: 'Complete e-commerce platform with multiple categories',
    address: '987 Digital Plaza, Hyderabad, Telangana 500001',
    phone: '+91 40 6789 0123',
    email: 'info@shopzone.com',
    gstNumber: '36CDEFG1234H1Z5',
    features: {
      enableGST: true,
      enableInventory: true,
      enableTables: false,
      enableAppointments: false,
      enableServices: false,
      enableSubscriptions: true,
      enableLoyalty: true,
      enableDelivery: true,
      enableAI: true
    }
  },
  {
    type: BusinessType.SALON,
    name: 'Style Studio Salon',
    description: 'Premium hair and beauty salon',
    address: '147 Beauty Street, Chennai, Tamil Nadu 600001',
    phone: '+91 44 7890 1234',
    email: 'info@stylestudio.com',
    gstNumber: '33IJKLM5678N1Z5',
    features: {
      enableGST: true,
      enableInventory: true,
      enableTables: false,
      enableAppointments: true,
      enableServices: true,
      enableSubscriptions: false,
      enableLoyalty: true,
      enableDelivery: false,
      enableAI: true
    }
  },
  {
    type: BusinessType.SPA,
    name: 'Tranquil Spa & Wellness',
    description: 'Luxury spa and wellness center',
    address: '258 Wellness Road, Goa, Goa 403001',
    phone: '+91 832 8901 2345',
    email: 'info@tranquilspa.com',
    gstNumber: '30OPQRS9012T1Z5',
    features: {
      enableGST: true,
      enableInventory: true,
      enableTables: false,
      enableAppointments: true,
      enableServices: true,
      enableSubscriptions: true,
      enableLoyalty: true,
      enableDelivery: false,
      enableAI: true
    }
  },
  {
    type: BusinessType.PHARMACY,
    name: 'CarePlus Pharmacy',
    description: 'Complete healthcare and pharmacy services',
    address: '369 Health Avenue, Ahmedabad, Gujarat 380001',
    phone: '+91 79 9012 3456',
    email: 'info@careplus.com',
    gstNumber: '24UVWXY3456Z1Z5',
    features: {
      enableGST: true,
      enableInventory: true,
      enableTables: false,
      enableAppointments: true,
      enableServices: true,
      enableSubscriptions: false,
      enableLoyalty: true,
      enableDelivery: true,
      enableAI: true
    }
  },
  {
    type: BusinessType.GROCERY_STORE,
    name: 'FreshMart Grocery',
    description: 'Supermarket with fresh produce and daily essentials',
    address: '741 Market Street, Kolkata, West Bengal 700001',
    phone: '+91 33 0123 4567',
    email: 'info@freshmart.com',
    gstNumber: '19ZABCD7890E1Z5',
    features: {
      enableGST: true,
      enableInventory: true,
      enableTables: false,
      enableAppointments: false,
      enableServices: false,
      enableSubscriptions: false,
      enableLoyalty: true,
      enableDelivery: true,
      enableAI: true
    }
  },
  {
    type: BusinessType.FOOD_TRUCK,
    name: 'Street Eats Food Truck',
    description: 'Mobile food service with gourmet street food',
    address: '852 Mobile Kitchen, Mumbai, Maharashtra 400001',
    phone: '+91 22 1234 5678',
    email: 'info@streeteats.com',
    gstNumber: '27FGHIJ1234K1Z5',
    features: {
      enableGST: true,
      enableInventory: true,
      enableTables: false,
      enableAppointments: false,
      enableServices: false,
      enableSubscriptions: false,
      enableLoyalty: true,
      enableDelivery: true,
      enableAI: true
    }
  },
  {
    type: BusinessType.GYM,
    name: 'FitZone Gym',
    description: 'Premium fitness center with personal training',
    address: '963 Fitness Boulevard, Pune, Maharashtra 411001',
    phone: '+91 20 2345 6789',
    email: 'info@fitzone.com',
    gstNumber: '27LMNOP5678M1Z5',
    features: {
      enableGST: false,
      enableInventory: true,
      enableTables: false,
      enableAppointments: true,
      enableServices: true,
      enableSubscriptions: true,
      enableLoyalty: true,
      enableDelivery: false,
      enableAI: true
    }
  },
  {
    type: BusinessType.CLINIC,
    name: 'HealthFirst Clinic',
    description: 'Multi-specialty healthcare clinic',
    address: '159 Medical Center, Bangalore, Karnataka 560001',
    phone: '+91 80 3456 7890',
    email: 'info@healthfirst.com',
    gstNumber: '29QRSTU9012N1Z5',
    features: {
      enableGST: false,
      enableInventory: true,
      enableTables: false,
      enableAppointments: true,
      enableServices: true,
      enableSubscriptions: false,
      enableLoyalty: true,
      enableDelivery: false,
      enableAI: true
    }
  }
]

// Staff role configurations for each business type
const getStaffRoles = (businessType: BusinessType) => {
  const baseRoles = [
    { role: StaffRole.OWNER, name: 'Owner', emailSuffix: 'owner' },
    { role: StaffRole.MANAGER, name: 'Manager', emailSuffix: 'manager' },
    { role: StaffRole.CASHIER, name: 'Cashier', emailSuffix: 'cashier' }
  ]

  switch (businessType) {
    case BusinessType.RESTAURANT:
      return [
        ...baseRoles,
        { role: StaffRole.CHEF, name: 'Chef', emailSuffix: 'chef' },
        { role: StaffRole.WAITER, name: 'Waiter', emailSuffix: 'waiter' }
      ]
    case BusinessType.RETAIL_STORE:
      return [
        ...baseRoles,
        { role: StaffRole.SALES_ASSOCIATE, name: 'Sales Associate', emailSuffix: 'sales' },
        { role: StaffRole.CASHIER, name: 'Customer Service', emailSuffix: 'service' }
      ]
    case BusinessType.CAFE:
      return [
        ...baseRoles,
        { role: StaffRole.CHEF, name: 'Barista', emailSuffix: 'barista' },
        { role: StaffRole.WAITER, name: 'Server', emailSuffix: 'server' }
      ]
    case BusinessType.HOTEL:
      return [
        ...baseRoles,
        { role: StaffRole.CHEF, name: 'Executive Chef', emailSuffix: 'chef' },
        { role: StaffRole.WAITER, name: 'Concierge', emailSuffix: 'concierge' },
        { role: StaffRole.CASHIER, name: 'Front Desk', emailSuffix: 'frontdesk' }
      ]
    case BusinessType.BAR:
      return [
        ...baseRoles,
        { role: StaffRole.CHEF, name: 'Bartender', emailSuffix: 'bartender' },
        { role: StaffRole.WAITER, name: 'Server', emailSuffix: 'server' }
      ]
    case BusinessType.ECOMMERCE:
      return [
        ...baseRoles,
        { role: StaffRole.SALES_ASSOCIATE, name: 'Warehouse', emailSuffix: 'warehouse' },
        { role: StaffRole.CASHIER, name: 'Customer Support', emailSuffix: 'support' }
      ]
    case BusinessType.SALON:
      return [
        ...baseRoles,
        { role: StaffRole.BARBER, name: 'Stylist', emailSuffix: 'stylist' },
        { role: StaffRole.CASHIER, name: 'Receptionist', emailSuffix: 'reception' }
      ]
    case BusinessType.SPA:
      return [
        ...baseRoles,
        { role: StaffRole.BEAUTICIAN, name: 'Therapist', emailSuffix: 'therapist' },
        { role: StaffRole.CASHIER, name: 'Receptionist', emailSuffix: 'reception' }
      ]
    case BusinessType.PHARMACY:
      return [
        ...baseRoles,
        { role: StaffRole.PHARMACIST, name: 'Pharmacist', emailSuffix: 'pharmacist' },
        { role: StaffRole.SALES_ASSOCIATE, name: 'Assistant', emailSuffix: 'assistant' }
      ]
    case BusinessType.GROCERY_STORE:
      return [
        ...baseRoles,
        { role: StaffRole.SALES_ASSOCIATE, name: 'Store Manager', emailSuffix: 'store' },
        { role: StaffRole.CASHIER, name: 'Customer Service', emailSuffix: 'service' }
      ]
    case BusinessType.FOOD_TRUCK:
      return [
        ...baseRoles,
        { role: StaffRole.CHEF, name: 'Cook', emailSuffix: 'cook' },
        { role: StaffRole.WAITER, name: 'Server', emailSuffix: 'server' }
      ]
    case BusinessType.GYM:
      return [
        ...baseRoles,
        { role: StaffRole.SALES_ASSOCIATE, name: 'Trainer', emailSuffix: 'trainer' },
        { role: StaffRole.CASHIER, name: 'Receptionist', emailSuffix: 'reception' }
      ]
    case BusinessType.CLINIC:
      return [
        ...baseRoles,
        { role: StaffRole.SALES_ASSOCIATE, name: 'Doctor', emailSuffix: 'doctor' },
        { role: StaffRole.SALES_ASSOCIATE, name: 'Nurse', emailSuffix: 'nurse' },
        { role: StaffRole.CASHIER, name: 'Receptionist', emailSuffix: 'reception' }
      ]
    default:
      return baseRoles
  }
}

async function main() {
  console.log('🌱 Seeding database with all business types...')

  // Hash passwords
  const hashedPassword = await bcrypt.hash('password123', 10)
  const ownerPassword = await bcrypt.hash('owner123', 10)
  const managerPassword = await bcrypt.hash('manager123', 10)
  const staffPassword = await bcrypt.hash('staff123', 10)

  // Create businesses and their staff
  for (const businessConfig of businessTypes) {
    console.log(`📝 Creating ${businessConfig.name}...`)

    // Create owner user
    const ownerUser = await prisma.user.upsert({
      where: { email: `${businessConfig.email.split('@')[0]}-owner@${businessConfig.email.split('@')[1]}` },
      update: {},
      create: {
        id: uuidv4(),
        email: `${businessConfig.email.split('@')[0]}-owner@${businessConfig.email.split('@')[1]}`,
        name: `${businessConfig.name} Owner`,
        emailVerified: true,
      },
    })

    // Create restaurant/business
    const restaurant = await prisma.restaurant.upsert({
      where: { id: `restaurant-${businessConfig.type.toLowerCase()}` },
      update: {},
      create: {
        id: `restaurant-${businessConfig.type.toLowerCase()}`,
        name: businessConfig.name,
        address: businessConfig.address,
        phone: businessConfig.phone,
        email: businessConfig.email,
        gstNumber: businessConfig.gstNumber,
        description: businessConfig.description,
        businessType: businessConfig.type,
        isActive: true,
        isVerified: true,
        ownerId: ownerUser.id,
      },
    })

    // Create outlet
    const outlet = await prisma.outlet.upsert({
      where: { id: `outlet-${businessConfig.type.toLowerCase()}` },
      update: {},
      create: {
        id: `outlet-${businessConfig.type.toLowerCase()}`,
        name: 'Main Branch',
        address: businessConfig.address,
        phone: businessConfig.phone,
        isActive: true,
        restaurantId: restaurant.id,
      },
    })

    // Create subscription
    await prisma.subscription.upsert({
      where: { restaurantId: restaurant.id },
      update: {},
      create: {
        id: uuidv4(),
        plan: 'PRO',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        lastBillingAt: new Date(),
        nextBillingAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount: 2499.00,
        restaurantId: restaurant.id,
      },
    })

    // Create business settings
    await prisma.businessSettings.upsert({
      where: { restaurantId: restaurant.id },
      update: {},
      create: {
        id: uuidv4(),
        restaurantId: restaurant.id,
        businessType: businessConfig.type,
        ...businessConfig.features,
        currency: 'INR',
        timezone: 'Asia/Kolkata',
      },
    })

    // Get staff roles for this business type
    const staffRoles = getStaffRoles(businessConfig.type)

    // Create staff accounts
    for (const staffRole of staffRoles) {
      // Create user for staff
      const staffUser = await prisma.user.upsert({
        where: { email: `${businessConfig.email.split('@')[0]}-${staffRole.emailSuffix}@${businessConfig.email.split('@')[1]}` },
        update: {},
        create: {
          id: uuidv4(),
          email: `${businessConfig.email.split('@')[0]}-${staffRole.emailSuffix}@${businessConfig.email.split('@')[1]}`,
          name: `${staffRole.name} - ${businessConfig.name}`,
          emailVerified: true,
        },
      })

      // Determine password based on role
      let password = hashedPassword
      if (staffRole.role === StaffRole.OWNER) password = ownerPassword
      else if (staffRole.role === StaffRole.MANAGER) password = managerPassword
      else if (staffRole.role === StaffRole.CASHIER) password = staffPassword

      // Create staff
      await prisma.staff.upsert({
        where: { email: `${businessConfig.email.split('@')[0]}-${staffRole.emailSuffix}@${businessConfig.email.split('@')[1]}` },
        update: {},
        create: {
          id: uuidv4(),
          name: staffRole.name,
          email: `${businessConfig.email.split('@')[0]}-${staffRole.emailSuffix}@${businessConfig.email.split('@')[1]}`,
          phone: businessConfig.phone,
          role: staffRole.role,
          password: password,
          isActive: true,
          isVerified: true,
          userId: staffUser.id,
          restaurantId: restaurant.id,
          outletId: outlet.id,
        },
      })
    }

    // Create basic categories based on business type
    const categories = await createCategoriesForBusinessType(businessConfig.type, restaurant.id)

    // Create basic menu items/services based on business type
    await createMenuItemsForBusinessType(businessConfig.type, restaurant.id, categories)

    // Create sample customers
    await createSampleCustomers(restaurant.id)

    // Create sample orders
    await createSampleOrders(restaurant.id, businessConfig.type)

    console.log(`✅ ${businessConfig.name} created successfully!`)
  }

  // Create default roles and permissions
  await createDefaultRolesAndPermissions()

  console.log('✅ All business types seeded successfully!')
  console.log('📝 Demo Accounts Summary:')
  
  businessTypes.forEach(business => {
    const staffRoles = getStaffRoles(business.type)
    console.log(`\n🏢 ${business.name} (${business.type}):`)
    console.log(`   Email: ${business.email}`)
    staffRoles.forEach(role => {
      const email = `${business.email.split('@')[0]}-${role.emailSuffix}@${business.email.split('@')[1]}`
      const password = role.role === StaffRole.OWNER ? 'owner123' : 
                      role.role === StaffRole.MANAGER ? 'manager123' : 
                      role.role === StaffRole.CASHIER ? 'staff123' : 'password123'
      console.log(`   ${role.name}: ${email} / ${password}`)
    })
  })
}

async function createCategoriesForBusinessType(businessType: BusinessType, restaurantId: string) {
  const categoryConfigs = {
    [BusinessType.RESTAURANT]: [
      { name: 'Starters', description: 'Appetizers and starters' },
      { name: 'Main Course', description: 'Main course dishes' },
      { name: 'Breads', description: 'Indian breads and rotis' },
      { name: 'Desserts', description: 'Sweet dishes and desserts' },
      { name: 'Beverages', description: 'Drinks and beverages' }
    ],
    [BusinessType.RETAIL_STORE]: [
      { name: 'Electronics', description: 'Electronic devices and gadgets' },
      { name: 'Clothing', description: 'Apparel and accessories' },
      { name: 'Home & Kitchen', description: 'Home appliances and kitchen items' },
      { name: 'Books & Media', description: 'Books, movies, and music' },
      { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear' }
    ],
    [BusinessType.CAFE]: [
      { name: 'Coffee', description: 'Hot and cold coffee beverages' },
      { name: 'Tea', description: 'Tea varieties and infusions' },
      { name: 'Pastries', description: 'Freshly baked pastries and cakes' },
      { name: 'Sandwiches', description: 'Fresh sandwiches and wraps' },
      { name: 'Smoothies', description: 'Fresh fruit smoothies and juices' }
    ],
    [BusinessType.HOTEL]: [
      { name: 'Room Service', description: 'In-room dining options' },
      { name: 'Restaurant', description: 'Main restaurant menu' },
      { name: 'Bar', description: 'Beverages and cocktails' },
      { name: 'Spa Services', description: 'Spa and wellness treatments' },
      { name: 'Concierge', description: 'Concierge services' }
    ],
    [BusinessType.BAR]: [
      { name: 'Cocktails', description: 'Signature cocktails' },
      { name: 'Beer', description: 'Domestic and imported beers' },
      { name: 'Wine', description: 'Wine selection' },
      { name: 'Spirits', description: 'Premium spirits and liquors' },
      { name: 'Bar Food', description: 'Food pairings and appetizers' }
    ],
    [BusinessType.ECOMMERCE]: [
      { name: 'Electronics', description: 'Electronic devices' },
      { name: 'Fashion', description: 'Clothing and accessories' },
      { name: 'Home & Living', description: 'Home decor and furniture' },
      { name: 'Beauty', description: 'Beauty and personal care' },
      { name: 'Sports', description: 'Sports and fitness equipment' }
    ],
    [BusinessType.SALON]: [
      { name: 'Hair Services', description: 'Hair cutting and styling' },
      { name: 'Beauty Services', description: 'Beauty treatments' },
      { name: 'Nail Services', description: 'Manicure and pedicure' },
      { name: 'Makeup', description: 'Makeup services' },
      { name: 'Products', description: 'Beauty products for sale' }
    ],
    [BusinessType.SPA]: [
      { name: 'Massages', description: 'Massage therapies' },
      { name: 'Facials', description: 'Facial treatments' },
      { name: 'Body Treatments', description: 'Body treatments and wraps' },
      { name: 'Wellness', description: 'Wellness packages' },
      { name: 'Memberships', description: 'Spa memberships' }
    ],
    [BusinessType.PHARMACY]: [
      { name: 'Prescriptions', description: 'Prescription medications' },
      { name: 'OTC Medicines', description: 'Over-the-counter medicines' },
      { name: 'Health Products', description: 'Health and wellness products' },
      { name: 'Personal Care', description: 'Personal care items' },
      { name: 'Medical Supplies', description: 'Medical equipment and supplies' }
    ],
    [BusinessType.GROCERY_STORE]: [
      { name: 'Fresh Produce', description: 'Fresh fruits and vegetables' },
      { name: 'Dairy', description: 'Dairy products' },
      { name: 'Bakery', description: 'Fresh bread and baked goods' },
      { name: 'Meat & Seafood', description: 'Fresh meat and seafood' },
      { name: 'Pantry', description: 'Pantry staples and dry goods' }
    ],
    [BusinessType.FOOD_TRUCK]: [
      { name: 'Main Dishes', description: 'Signature main dishes' },
      { name: 'Sides', description: 'Side dishes and add-ons' },
      { name: 'Beverages', description: 'Drinks and beverages' },
      { name: 'Desserts', description: 'Sweet treats and desserts' },
      { name: 'Combos', description: 'Value meal combinations' }
    ],
    [BusinessType.GYM]: [
      { name: 'Memberships', description: 'Gym membership plans' },
      { name: 'Personal Training', description: 'Personal training sessions' },
      { name: 'Group Classes', description: 'Group fitness classes' },
      { name: 'Specialized Programs', description: 'Specialized fitness programs' },
      { name: 'Products', description: 'Fitness equipment and supplements' }
    ],
    [BusinessType.CLINIC]: [
      { name: 'Consultations', description: 'Medical consultations' },
      { name: 'Diagnostic Services', description: 'Diagnostic tests and services' },
      { name: 'Treatments', description: 'Medical treatments' },
      { name: 'Health Checkups', description: 'Preventive health checkups' },
      { name: 'Pharmacy', description: 'In-house pharmacy services' }
    ]
  }

  const categories = categoryConfigs[businessType] || [
    { name: 'General', description: 'General items and services' }
  ]

  return await Promise.all(
    categories.map((category, index) =>
      prisma.category.upsert({
        where: { id: `cat-${businessType.toLowerCase()}-${index}` },
        update: {},
        create: {
          id: `cat-${businessType.toLowerCase()}-${index}`,
          name: category.name,
          description: category.description,
          displayOrder: index + 1,
          isActive: true,
          restaurantId: restaurantId,
        },
      })
    )
  )
}

async function createMenuItemsForBusinessType(businessType: BusinessType, restaurantId: string, categories: any[]) {
  const menuItemConfigs = {
    [BusinessType.RESTAURANT]: [
      { name: 'Paneer Tikka', price: 299, categoryIndex: 0 },
      { name: 'Butter Chicken', price: 399, categoryIndex: 1 },
      { name: 'Butter Naan', price: 59, categoryIndex: 2 },
      { name: 'Gulab Jamun', price: 99, categoryIndex: 3 },
      { name: 'Masala Chai', price: 49, categoryIndex: 4 }
    ],
    [BusinessType.RETAIL_STORE]: [
      { name: 'Smartphone', price: 15000, categoryIndex: 0 },
      { name: 'T-Shirt', price: 599, categoryIndex: 1 },
      { name: 'Coffee Maker', price: 2999, categoryIndex: 2 },
      { name: 'Bestseller Book', price: 299, categoryIndex: 3 },
      { name: 'Yoga Mat', price: 899, categoryIndex: 4 }
    ],
    [BusinessType.CAFE]: [
      { name: 'Espresso', price: 120, categoryIndex: 0 },
      { name: 'Green Tea', price: 80, categoryIndex: 1 },
      { name: 'Croissant', price: 90, categoryIndex: 2 },
      { name: 'Club Sandwich', price: 180, categoryIndex: 3 },
      { name: 'Mango Smoothie', price: 150, categoryIndex: 4 }
    ],
    [BusinessType.HOTEL]: [
      { name: 'Room Service Breakfast', price: 500, categoryIndex: 0 },
      { name: 'Grilled Salmon', price: 1200, categoryIndex: 1 },
      { name: 'Signature Cocktail', price: 450, categoryIndex: 2 },
      { name: 'Swedish Massage', price: 2500, categoryIndex: 3 },
      { name: 'Airport Transfer', price: 800, categoryIndex: 4 }
    ],
    [BusinessType.BAR]: [
      { name: 'Old Fashioned', price: 350, categoryIndex: 0 },
      { name: 'Craft Beer', price: 200, categoryIndex: 1 },
      { name: 'Red Wine', price: 400, categoryIndex: 2 },
      { name: 'Whiskey', price: 300, categoryIndex: 3 },
      { name: 'Nachos', price: 180, categoryIndex: 4 }
    ],
    [BusinessType.ECOMMERCE]: [
      { name: 'Laptop', price: 45000, categoryIndex: 0 },
      { name: 'Jeans', price: 1299, categoryIndex: 1 },
      { name: 'Sofa', price: 15000, categoryIndex: 2 },
      { name: 'Face Cream', price: 599, categoryIndex: 3 },
      { name: 'Dumbbells', price: 2000, categoryIndex: 4 }
    ],
    [BusinessType.SALON]: [
      { name: 'Haircut', price: 300, categoryIndex: 0 },
      { name: 'Facial', price: 800, categoryIndex: 1 },
      { name: 'Manicure', price: 250, categoryIndex: 2 },
      { name: 'Bridal Makeup', price: 2500, categoryIndex: 3 },
      { name: 'Shampoo', price: 199, categoryIndex: 4 }
    ],
    [BusinessType.SPA]: [
      { name: 'Swedish Massage', price: 2000, categoryIndex: 0 },
      { name: 'Anti-Aging Facial', price: 1500, categoryIndex: 1 },
      { name: 'Body Wrap', price: 1800, categoryIndex: 2 },
      { name: 'Monthly Membership', price: 5000, categoryIndex: 3 },
      { name: 'Massage Oil', price: 599, categoryIndex: 4 }
    ],
    [BusinessType.PHARMACY]: [
      { name: 'Prescription Medicine', price: 200, categoryIndex: 0 },
      { name: 'Pain Reliever', price: 50, categoryIndex: 1 },
      { name: 'Vitamins', price: 299, categoryIndex: 2 },
      { name: 'Hand Sanitizer', price: 80, categoryIndex: 3 },
      { name: 'First Aid Kit', price: 199, categoryIndex: 4 }
    ],
    [BusinessType.GROCERY_STORE]: [
      { name: 'Fresh Apples', price: 120, categoryIndex: 0 },
      { name: 'Milk', price: 60, categoryIndex: 1 },
      { name: 'Bread', price: 40, categoryIndex: 2 },
      { name: 'Chicken Breast', price: 200, categoryIndex: 3 },
      { name: 'Rice', price: 80, categoryIndex: 4 }
    ],
    [BusinessType.FOOD_TRUCK]: [
      { name: 'Gourmet Burger', price: 250, categoryIndex: 0 },
      { name: 'French Fries', price: 80, categoryIndex: 1 },
      { name: 'Soft Drink', price: 50, categoryIndex: 2 },
      { name: 'Ice Cream', price: 60, categoryIndex: 3 },
      { name: 'Combo Meal', price: 350, categoryIndex: 4 }
    ],
    [BusinessType.GYM]: [
      { name: 'Monthly Membership', price: 1500, categoryIndex: 0 },
      { name: 'Personal Training', price: 800, categoryIndex: 1 },
      { name: 'Yoga Class', price: 300, categoryIndex: 2 },
      { name: 'Weight Loss Program', price: 3000, categoryIndex: 3 },
      { name: 'Protein Powder', price: 1200, categoryIndex: 4 }
    ],
    [BusinessType.CLINIC]: [
      { name: 'General Consultation', price: 500, categoryIndex: 0 },
      { name: 'Blood Test', price: 300, categoryIndex: 1 },
      { name: 'Vaccination', price: 800, categoryIndex: 2 },
      { name: 'Full Body Checkup', price: 2500, categoryIndex: 3 },
      { name: 'Medicine', price: 100, categoryIndex: 4 }
    ]
  }

  const menuItems = menuItemConfigs[businessType] || [
    { name: 'Basic Service', price: 100, categoryIndex: 0 }
  ]

  return await Promise.all(
    menuItems.map((item, index) =>
      prisma.menuItem.upsert({
        where: { id: `menu-${businessType.toLowerCase()}-${index}` },
        update: {},
        create: {
          id: `menu-${businessType.toLowerCase()}-${index}`,
          name: item.name,
          description: `Premium ${item.name.toLowerCase()} for ${businessType.toLowerCase()}`,
          price: item.price,
          categoryId: categories[item.categoryIndex].id,
          restaurantId: restaurantId,
          isActive: true,
          isAvailable: true,
        },
      })
    )
  )
}

async function createSampleCustomers(restaurantId: string) {
  return await Promise.all([
    prisma.customer.upsert({
      where: { id: `customer-${restaurantId}-1` },
      update: {},
      create: {
        id: `customer-${restaurantId}-1`,
        name: 'Amit Sharma',
        email: `amit.sharma-${restaurantId}@email.com`,
        phone: '+91 98765 43210',
        address: '456 Park Avenue, Mumbai',
        loyaltyPoints: 150,
        restaurantId: restaurantId,
      },
    }),
    prisma.customer.upsert({
      where: { id: `customer-${restaurantId}-2` },
      update: {},
      create: {
        id: `customer-${restaurantId}-2`,
        name: 'Priya Patel',
        email: `priya.patel-${restaurantId}@email.com`,
        phone: '+91 87654 32109',
        address: '789 Marine Drive, Mumbai',
        loyaltyPoints: 320,
        restaurantId: restaurantId,
      },
    }),
    prisma.customer.upsert({
      where: { id: `customer-${restaurantId}-3` },
      update: {},
      create: {
        id: `customer-${restaurantId}-3`,
        name: 'Rahul Verma',
        email: `rahul.verma-${restaurantId}@email.com`,
        phone: '+91 76543 21098',
        address: '321 Bandra West, Mumbai',
        loyaltyPoints: 85,
        restaurantId: restaurantId,
      },
    }),
  ])
}

async function createSampleOrders(restaurantId: string, businessType: BusinessType) {
  // Get first staff member for order assignment
  const staff = await prisma.staff.findFirst({
    where: { restaurantId: restaurantId }
  })

  if (!staff) return []

  // Get customers
  const customers = await prisma.customer.findMany({
    where: { restaurantId: restaurantId },
    take: 3
  })

  if (customers.length === 0) return []

  // Determine order types based on business type
  const orderTypes = {
    [BusinessType.RESTAURANT]: ['DINE_IN', 'TAKEAWAY', 'DELIVERY'],
    [BusinessType.RETAIL_STORE]: ['IN_STORE'],
    [BusinessType.CAFE]: ['IN_STORE', 'TAKEAWAY'],
    [BusinessType.HOTEL]: ['DINE_IN', 'DELIVERY'],
    [BusinessType.BAR]: ['DINE_IN'],
    [BusinessType.ECOMMERCE]: ['ONLINE', 'DELIVERY'],
    [BusinessType.SALON]: ['APPOINTMENT', 'SERVICE'],
    [BusinessType.SPA]: ['APPOINTMENT', 'SERVICE', 'SUBSCRIPTION'],
    [BusinessType.PHARMACY]: ['IN_STORE'],
    [BusinessType.GROCERY_STORE]: ['IN_STORE', 'ONLINE', 'DELIVERY'],
    [BusinessType.FOOD_TRUCK]: ['IN_STORE', 'TAKEAWAY'],
    [BusinessType.GYM]: ['SUBSCRIPTION', 'APPOINTMENT'],
    [BusinessType.CLINIC]: ['APPOINTMENT', 'SERVICE']
  }

  const validOrderTypes = orderTypes[businessType] || ['IN_STORE']

  return await Promise.all([
    prisma.order.upsert({
      where: { orderNumber: `ORD-${restaurantId}-001` },
      update: {},
      create: {
        id: `order-${restaurantId}-1`,
        orderNumber: `ORD-${restaurantId}-001`,
        orderType: validOrderTypes[0] as any,
        status: 'DELIVERED',
        customerId: customers[0].id,
        staffId: staff.id,
        restaurantId: restaurantId,
        subtotal: 500.00,
        gstAmount: 25.00,
        totalAmount: 525.00,
        discount: 0,
        notes: 'Sample order',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    }),
    prisma.order.upsert({
      where: { orderNumber: `ORD-${restaurantId}-002` },
      update: {},
      create: {
        id: `order-${restaurantId}-2`,
        orderNumber: `ORD-${restaurantId}-002`,
        orderType: validOrderTypes[1] || validOrderTypes[0] as any,
        status: 'PREPARING',
        customerId: customers[1].id,
        staffId: staff.id,
        restaurantId: restaurantId,
        subtotal: 300.00,
        gstAmount: 15.00,
        totalAmount: 315.00,
        discount: 0,
        notes: 'In progress',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    }),
  ])
}

async function createDefaultRolesAndPermissions() {
  console.log('🔧 Creating default roles and permissions...')

  // Create default permissions
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: 'dashboard:read' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'dashboard:read',
        description: 'View dashboard',
        module: 'DASHBOARD',
        action: 'READ',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'menu:read' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'menu:read',
        description: 'View menu items',
        module: 'MENU',
        action: 'READ',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'menu:create' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'menu:create',
        description: 'Create menu items',
        module: 'MENU',
        action: 'CREATE',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'menu:update' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'menu:update',
        description: 'Update menu items',
        module: 'MENU',
        action: 'UPDATE',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'menu:delete' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'menu:delete',
        description: 'Delete menu items',
        module: 'MENU',
        action: 'DELETE',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'orders:read' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'orders:read',
        description: 'View orders',
        module: 'ORDERS',
        action: 'READ',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'orders:create' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'orders:create',
        description: 'Create orders',
        module: 'ORDERS',
        action: 'CREATE',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'orders:update' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'orders:update',
        description: 'Update orders',
        module: 'ORDERS',
        action: 'UPDATE',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'staff:read' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'staff:read',
        description: 'View staff',
        module: 'STAFF',
        action: 'READ',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'staff:create' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'staff:create',
        description: 'Create staff',
        module: 'STAFF',
        action: 'CREATE',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'settings:read' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'settings:read',
        description: 'View settings',
        module: 'SETTINGS',
        action: 'READ',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'settings:manage' },
      update: {},
      create: {
        id: uuidv4(),
        name: 'settings:manage',
        description: 'Manage settings',
        module: 'SETTINGS',
        action: 'MANAGE',
        isSystem: true,
      },
    }),
  ])

  console.log(`✅ Created ${permissions.length} default permissions`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })