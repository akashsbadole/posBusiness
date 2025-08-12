import { db } from "../src/lib/db";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

async function seedDummyUsers() {
  try {
    console.log("Seeding dummy users...");

    // Hash passwords
    const ownerPassword = await bcrypt.hash("owner123", 12);
    const managerPassword = await bcrypt.hash("manager123", 12);
    const cashierPassword = await bcrypt.hash("cashier123", 12);
    const kitchenPassword = await bcrypt.hash("kitchen123", 12);
    const waiterPassword = await bcrypt.hash("waiter123", 12);
    const demoPassword = await bcrypt.hash("demo123", 12);

    // Create or get Spice Business
    let spiceBusiness = await db.restaurant.findFirst({
      where: { name: "Spice Business" },
    });

    if (!spiceBusiness) {
      // Create or get owner user first
      let ownerUser = await db.user.findUnique({
        where: { email: "owner@spicegarden.com" },
      });

      if (!ownerUser) {
        ownerUser = await db.user.create({
          data: {
            id: uuidv4(),
            name: "Business Owner",
            email: "owner@spicegarden.com",
            password: ownerPassword,
            emailVerified: true,
            isActive: true,
            role: "OWNER" as any,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      // Create Spice Business - Try different businessType values
      const businessTypeOptions = [
        "RESTAURANT",
        "RETAIL",
        "CAFE",
        "FOOD_TRUCK",
        "BAKERY",
        "BAR",
      ];
      let businessCreated = false;

      for (const businessType of businessTypeOptions) {
        try {
          spiceBusiness = await db.restaurant.create({
            data: {
              id: uuidv4(),
              name: "Spice Business",
              address: "123 Main Street, Mumbai, Maharashtra 400001",
              phone: "+91 22 1234 5678",
              email: "info@spicebusiness.com",
              gstNumber: "27ABCDE1234F1Z5",
              description: "Retail business with modern management",
              businessType: businessType as any,
              isActive: true,
              isVerified: true,
              ownerId: ownerUser.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
          businessCreated = true;
          console.log(
            `Created Spice Business with businessType: ${businessType}`
          );
          break;
        } catch (error) {
          console.log(
            `Failed to create business with type ${businessType}, trying next...`
          );
          continue;
        }
      }

      // If all business types fail, try without businessType
      if (!businessCreated) {
        try {
          spiceBusiness = await db.restaurant.create({
            data: {
              id: uuidv4(),
              name: "Spice Business",
              address: "123 Main Street, Mumbai, Maharashtra 400001",
              phone: "+91 22 1234 5678",
              email: "info@spicebusiness.com",
              gstNumber: "27ABCDE1234F1Z5",
              description: "Retail business with modern management",
              // businessType: omitted
              isActive: true,
              isVerified: true,
              ownerId: ownerUser.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
          console.log("Created Spice Business without businessType");
        } catch (error) {
          console.error(
            "Failed to create business even without businessType:",
            error
          );
          throw error;
        }
      }

      // Create default outlet for Spice Business
      const spiceOutlet = await db.outlet.create({
        data: {
          id: uuidv4(),
          name: "Main Branch",
          address: "123 Main Street, Mumbai, Maharashtra 400001",
          phone: "+91 22 1234 5678",
          isActive: true,
          restaurantId: spiceBusiness.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Create owner staff record if it doesn't exist
      const existingOwnerStaff = await db.staff.findFirst({
        where: {
          email: "owner@spicegarden.com",
          restaurantId: spiceBusiness.id,
        },
      });

      if (!existingOwnerStaff) {
        await db.staff.create({
          data: {
            id: uuidv4(),
            name: "Business Owner",
            email: "owner@spicegarden.com",
            phone: "+91 98765 43210",
            role: "OWNER" as any,
            password: ownerPassword,
            isActive: true,
            isVerified: true,
            userId: ownerUser.id,
            restaurantId: spiceBusiness.id,
            outletId: spiceOutlet.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      // Create or get manager user for Spice Business
      let managerUser = await db.user.findUnique({
        where: { email: "manager@spicegarden.com" },
      });

      if (!managerUser) {
        managerUser = await db.user.create({
          data: {
            id: uuidv4(),
            name: "Business Manager",
            email: "manager@spicegarden.com",
            password: managerPassword,
            emailVerified: true,
            isActive: true,
            role: "MANAGER" as any,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      // Create manager staff record if it doesn't exist
      const existingManagerStaff = await db.staff.findFirst({
        where: {
          email: "manager@spicegarden.com",
          restaurantId: spiceBusiness.id,
        },
      });

      if (!existingManagerStaff) {
        await db.staff.create({
          data: {
            id: uuidv4(),
            name: "Business Manager",
            email: "manager@spicegarden.com",
            phone: "+91 98765 43211",
            role: "MANAGER" as any,
            password: managerPassword,
            isActive: true,
            isVerified: true,
            userId: managerUser.id,
            restaurantId: spiceBusiness.id,
            outletId: spiceOutlet.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      // Create or get cashier user for Spice Business
      let cashierUser = await db.user.findUnique({
        where: { email: "cashier@spicegarden.com" },
      });

      if (!cashierUser) {
        cashierUser = await db.user.create({
          data: {
            id: uuidv4(),
            name: "Business Cashier",
            email: "cashier@spicegarden.com",
            password: cashierPassword,
            emailVerified: true,
            isActive: true,
            role: "CASHIER" as any,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      // Create cashier staff record if it doesn't exist
      const existingCashierStaff = await db.staff.findFirst({
        where: {
          email: "cashier@spicegarden.com",
          restaurantId: spiceBusiness.id,
        },
      });

      if (!existingCashierStaff) {
        await db.staff.create({
          data: {
            id: uuidv4(),
            name: "Business Cashier",
            email: "cashier@spicegarden.com",
            phone: "+91 98765 43213",
            role: "CASHIER" as any,
            password: cashierPassword,
            isActive: true,
            isVerified: true,
            userId: cashierUser.id,
            restaurantId: spiceBusiness.id,
            outletId: spiceOutlet.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      // Create or get operations staff user for Spice Business
      let operationsUser = await db.user.findUnique({
        where: { email: "kitchen@spicegarden.com" },
      });

      if (!operationsUser) {
        operationsUser = await db.user.create({
          data: {
            id: uuidv4(),
            name: "Operations Staff",
            email: "kitchen@spicegarden.com",
            password: kitchenPassword,
            emailVerified: true,
            isActive: true,
            role: "KITCHEN" as any,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      // Create operations staff record if it doesn't exist
      const existingOperationsStaff = await db.staff.findFirst({
        where: {
          email: "kitchen@spicegarden.com",
          restaurantId: spiceBusiness.id,
        },
      });

      if (!existingOperationsStaff) {
        await db.staff.create({
          data: {
            id: uuidv4(),
            name: "Operations Staff",
            email: "kitchen@spicegarden.com",
            phone: "+91 98765 43214",
            role: "KITCHEN" as any,
            password: kitchenPassword,
            isActive: true,
            isVerified: true,
            userId: operationsUser.id,
            restaurantId: spiceBusiness.id,
            outletId: spiceOutlet.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      // Create or get service staff user for Spice Business
      let serviceUser = await db.user.findUnique({
        where: { email: "waiter@spicegarden.com" },
      });

      if (!serviceUser) {
        serviceUser = await db.user.create({
          data: {
            id: uuidv4(),
            name: "Service Staff",
            email: "waiter@spicegarden.com",
            password: waiterPassword,
            emailVerified: true,
            isActive: true,
            role: "WAITER" as any,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      // Create service staff record if it doesn't exist
      const existingServiceStaff = await db.staff.findFirst({
        where: {
          email: "waiter@spicegarden.com",
          restaurantId: spiceBusiness.id,
        },
      });

      if (!existingServiceStaff) {
        await db.staff.create({
          data: {
            id: uuidv4(),
            name: "Service Staff",
            email: "waiter@spicegarden.com",
            phone: "+91 98765 43215",
            role: "WAITER" as any,
            password: waiterPassword,
            isActive: true,
            isVerified: true,
            userId: serviceUser.id,
            restaurantId: spiceBusiness.id,
            outletId: spiceOutlet.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      console.log(
        "Created Spice Business with owner, manager, cashier, operations, and service staff"
      );
    }

    // Create Demo Business
    let demoBusiness = await db.restaurant.findFirst({
      where: { name: "Demo Business" },
    });

    if (!demoBusiness) {
      // Create or get demo user
      let demoUser = await db.user.findUnique({
        where: { email: "demo@restaurant.com" },
      });

      if (!demoUser) {
        demoUser = await db.user.create({
          data: {
            id: uuidv4(),
            name: "Demo User",
            email: "demo@restaurant.com",
            password: demoPassword,
            emailVerified: true,
            isActive: true,
            role: "OWNER" as any,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      // Create Demo Business - Try different businessType values or omit it
      let demoBusinessCreated = false;
      const businessTypeOptions = [
        "RESTAURANT",
        "RETAIL",
        "CAFE",
        "FOOD_TRUCK",
        "BAKERY",
        "BAR",
      ];

      for (const businessType of businessTypeOptions) {
        try {
          demoBusiness = await db.restaurant.create({
            data: {
              id: uuidv4(),
              name: "Demo Business",
              address: "456 Demo Street, Mumbai, Maharashtra 400002",
              phone: "+91 22 9876 5432",
              email: "demo@business.com",
              gstNumber: "27DEMO1234F1Z5",
              description: "Demo business for testing and training",
              businessType: businessType as any,
              isActive: true,
              isVerified: true,
              ownerId: demoUser.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
          demoBusinessCreated = true;
          console.log(
            `Created Demo Business with businessType: ${businessType}`
          );
          break;
        } catch (error) {
          console.log(
            `Failed to create demo business with type ${businessType}, trying next...`
          );
          continue;
        }
      }

      // If all business types fail, try without businessType
      if (!demoBusinessCreated) {
        try {
          demoBusiness = await db.restaurant.create({
            data: {
              id: uuidv4(),
              name: "Demo Business",
              address: "456 Demo Street, Mumbai, Maharashtra 400002",
              phone: "+91 22 9876 5432",
              email: "demo@business.com",
              gstNumber: "27DEMO1234F1Z5",
              description: "Demo business for testing and training",
              // businessType: omitted
              isActive: true,
              isVerified: true,
              ownerId: demoUser.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
          console.log("Created Demo Business without businessType");
        } catch (error) {
          console.error(
            "Failed to create demo business even without businessType:",
            error
          );
          throw error;
        }
      }

      // Create default outlet for Demo Business
      const demoOutlet = await db.outlet.create({
        data: {
          id: uuidv4(),
          name: "Demo Branch",
          address: "456 Demo Street, Mumbai, Maharashtra 400002",
          phone: "+91 22 9876 5432",
          isActive: true,
          restaurantId: demoBusiness.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Create demo staff record if it doesn't exist
      const existingDemoStaff = await db.staff.findFirst({
        where: {
          email: "demo@restaurant.com",
          restaurantId: demoBusiness.id,
        },
      });

      if (!existingDemoStaff) {
        await db.staff.create({
          data: {
            id: uuidv4(),
            name: "Demo User",
            email: "demo@restaurant.com",
            phone: "+91 98765 43212",
            role: "OWNER" as any,
            password: demoPassword,
            isActive: true,
            isVerified: true,
            userId: demoUser.id,
            restaurantId: demoBusiness.id,
            outletId: demoOutlet.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      console.log("Created Demo Business with demo user");
    }

    // Create basic categories and menu items for both businesses
    const businesses = [spiceBusiness, demoBusiness].filter(Boolean);

    for (const business of businesses) {
      // Check if categories already exist
      const existingCategories = await db.category.findMany({
        where: { restaurantId: business.id },
      });

      if (existingCategories.length === 0) {
        // Create default categories
        const categories = await Promise.all([
          db.category.create({
            data: {
              id: uuidv4(),
              name: "Products",
              description: "Main products and services",
              displayOrder: 1,
              isActive: true,
              restaurantId: business.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          }),
          db.category.create({
            data: {
              id: uuidv4(),
              name: "Services",
              description: "Additional services",
              displayOrder: 2,
              isActive: true,
              restaurantId: business.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          }),
          db.category.create({
            data: {
              id: uuidv4(),
              name: "Miscellaneous",
              description: "Miscellaneous items",
              displayOrder: 3,
              isActive: true,
              restaurantId: business.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          }),
        ]);

        // Create sample menu items
        await Promise.all([
          db.menuItem.create({
            data: {
              id: uuidv4(),
              name: "Premium Product",
              description: "High-quality premium product",
              price: 250,
              categoryId: categories[0].id,
              restaurantId: business.id,
              isActive: true,
              isAvailable: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          }),
          db.menuItem.create({
            data: {
              id: uuidv4(),
              name: "Standard Service",
              description: "Standard service offering",
              price: 350,
              categoryId: categories[1].id,
              restaurantId: business.id,
              isActive: true,
              isAvailable: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          }),
          db.menuItem.create({
            data: {
              id: uuidv4(),
              name: "Basic Item",
              description: "Basic miscellaneous item",
              price: 30,
              categoryId: categories[2].id,
              restaurantId: business.id,
              isActive: true,
              isAvailable: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          }),
        ]);

        console.log(`Created categories and menu items for ${business.name}`);
      }
    }

    console.log("Dummy users and data seeded successfully!");
    console.log("\nAvailable credentials:");
    console.log("Owner: owner@spicegarden.com / owner123");
    console.log("Manager: manager@spicegarden.com / manager123");
    console.log("Cashier: cashier@spicegarden.com / cashier123");
    console.log("Kitchen: kitchen@spicegarden.com / kitchen123");
    console.log("Waiter: waiter@spicegarden.com / waiter123");
    console.log("Demo: demo@restaurant.com / demo123");
  } catch (error) {
    console.error("Error seeding dummy users:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

seedDummyUsers();
