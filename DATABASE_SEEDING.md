# Database Seeding Guide

## 🌱 Overview

The Indian Restaurant POS system includes a comprehensive database seeding feature that populates your database with realistic sample data. This is perfect for development, testing, and demonstrations.

## 📋 What's Included in the Seed Data

### Core Entities
- **Users**: 1 admin user
- **Restaurants**: 1 demo restaurant ("Spice Garden")
- **Outlets**: 1 main branch outlet
- **Subscriptions**: 1 PRO subscription plan
- **Staff**: 1 manager account

### Restaurant Data
- **Categories**: 5 menu categories (Starters, Main Course, Breads, Desserts, Beverages)
- **Menu Items**: 10 realistic Indian restaurant dishes with proper pricing
- **Tables**: 5 restaurant tables with different capacities
- **Customers**: 3 sample customers with loyalty points

### Operational Data
- **Orders**: 3 sample orders with different statuses (Delivered, Ready, Preparing)
- **Order Items**: 8 order items linking to specific menu items
- **KOT Items**: 8 Kitchen Order Tickets with different statuses
- **Payments**: 2 completed payments (Card and UPI)
- **Inventory**: 5 inventory items with stock levels and pricing

## 🚀 Usage

### Basic Seeding
```bash
# Seed the database with sample data
npm run db:seed
```

### Complete Database Setup
```bash
# Push schema and seed data in one command
npm run db:setup
```

### Reset and Reseed
```bash
# Reset database and reseed (warning: deletes all existing data)
npm run db:reset -- --force
npm run db:seed
```

## 📊 Sample Data Details

### Restaurant Information
- **Name**: Spice Garden
- **Location**: Mumbai, Maharashtra
- **GST Number**: 27ABCDE1234F1Z5
- **Contact**: +91 22 1234 5678

### Menu Categories
1. **Starters** - Appetizers and starters
2. **Main Course** - Main course dishes
3. **Breads** - Indian breads and rotis
4. **Desserts** - Sweet dishes and desserts
5. **Beverages** - Drinks and beverages

### Sample Menu Items
| Item | Category | Price | Description |
|------|----------|-------|-------------|
| Paneer Tikka | Starters | ₹299 | Marinated paneer cubes grilled in tandoor |
| Butter Chicken | Main Course | ₹399 | Creamy tomato-based curry with tender chicken |
| Butter Naan | Breads | ₹59 | Soft leavened bread brushed with butter |
| Gulab Jamun | Desserts | ₹99 | Soft milk dumplings in sugar syrup |
| Masala Chai | Beverages | ₹49 | Spiced Indian tea with milk |

### Sample Orders
- **Order #001**: Dine-in order with Paneer Tikka, Butter Chicken, and Butter Naan (₹941.85)
- **Order #002**: Takeaway order with Paneer Butter Masala and Tandoori Roti (₹470.40)
- **Order #003**: Dine-in order with Chicken Tikka, Dal Makhani, and Butter Naan (₹732.90)

### Sample Customers
- **Amit Sharma**: 150 loyalty points
- **Priya Patel**: 320 loyalty points
- **Rahul Verma**: 85 loyalty points

## 🔧 Technical Details

### Seed File Location
```
prisma/seed.ts
```

### Seed Configuration
The seeding is configured in `package.json`:
```json
{
  "scripts": {
    "db:seed": "tsx prisma/seed.ts",
    "db:setup": "prisma db push && prisma db seed"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

### Upsert Operations
The seed script uses `upsert` operations to:
- **Create** records if they don't exist
- **Update** existing records if they already exist
- **Preserve** existing data while ensuring required data is present

### Dependencies
- `tsx`: For running TypeScript files
- `uuid`: For generating unique IDs
- `@prisma/client`: For database operations

## 🎯 Use Cases

### Development
- Quickly populate your database with realistic data
- Test all features without manual data entry
- Ensure consistent data across development environments

### Testing
- Create predictable test scenarios
- Test edge cases with various data combinations
- Validate database relationships and constraints

### Demonstrations
- Show the application with realistic data
- Demonstrate all features without manual setup
- Create compelling product demos

### Training
- Train staff on a fully populated system
- Practice workflows with real-world data
- Test different scenarios safely

## 🔄 Customizing Seed Data

### Adding New Data
1. Open `prisma/seed.ts`
2. Add new data to the appropriate section
3. Use `upsert` to avoid duplicates
4. Run `npm run db:seed` to apply changes

### Modifying Existing Data
1. Edit the values in `prisma/seed.ts`
2. Run `npm run db:seed` to update the data
3. The script will update existing records while preserving relationships

### Removing Data
To remove seeded data, you have two options:

1. **Reset Database** (deletes everything):
   ```bash
   npm run db:reset -- --force
   ```

2. **Manual Deletion** (specific records):
   ```bash
   # Use Prisma Studio or SQL commands
   npx prisma studio
   ```

## 🛠 Troubleshooting

### Common Issues

#### "Table does not exist" Error
```bash
# Ensure database schema is pushed first
npm run db:push
npm run db:seed
```

#### "Command not found" Error
```bash
# Ensure dependencies are installed
npm install
```

#### "Permission denied" Error
```bash
# Check file permissions
chmod +x prisma/seed.ts
```

### Debug Mode
To run the seed with verbose output:
```bash
# Run with debug logging
DEBUG=* npm run db:seed
```

### Checking Seeded Data
```bash
# Open Prisma Studio to view data
npx prisma studio

# Or run a simple check
npm run db:seed
```

## 📝 Best Practices

### Development Workflow
1. **Initial Setup**: `npm run db:setup`
2. **Development**: Use existing data or add new records
3. **Testing**: `npm run db:seed` to reset to known state
4. **Production**: Use production data, not seed data

### Data Management
- **Never** run seed scripts in production environments
- **Always** backup production data before running reset operations
- **Use** environment-specific seed configurations
- **Test** seed scripts in development first

### Performance
- **Large datasets**: Consider batching operations
- **Frequent reseeding**: Use transactions for data consistency
- **Memory usage**: Monitor memory usage with large datasets

## 🔒 Security Considerations

### Password Security
- Seed data uses simple passwords for development
- **Never** use these passwords in production
- **Always** use hashed passwords in production
- **Change** default passwords immediately

### Data Privacy
- Seed data contains fictional information
- **Do not** use real customer data
- **Ensure** compliance with data protection regulations
- **Anonymize** production data used for seeding

## 🚀 Production Deployment

### Disabling Seeding
For production deployments, you can:
1. Remove the seed configuration from `package.json`
2. Use environment variables to control seeding
3. Create separate seed files for different environments

### Environment-Specific Seeding
```bash
# Development seeding
NODE_ENV=development npm run db:seed

# Production seeding (if needed)
NODE_ENV=production npm run db:seed
```

## 📞 Support

For issues with database seeding:
1. Check the troubleshooting section above
2. Verify all dependencies are installed
3. Ensure database connection is working
4. Check file permissions and paths

---

## 🎉 Summary

The database seeding feature provides a complete, realistic dataset for the Indian Restaurant POS system. It includes all necessary entities and relationships, making it perfect for development, testing, and demonstrations.

**Key Benefits:**
- Realistic Indian restaurant data
- Complete entity relationships
- GST-compliant pricing
- Multiple order scenarios
- Inventory management data
- Customer loyalty data

**Usage:**
```bash
# Quick start
npm run db:setup

# Reseed only
npm run db:seed

# Complete reset
npm run db:reset -- --force
npm run db:seed
```

The seed data provides a solid foundation for developing and testing your restaurant POS system!