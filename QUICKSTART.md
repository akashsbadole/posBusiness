# Indian Restaurant POS System - Quick Start Guide

## 🚀 Quick Start

### Option 1: Automated Deployment (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd indian-restaurant-pos

# Run the automated deployment script
./deploy.sh

# For production deployment
./deploy.sh --prod
```

### Option 2: Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env.local

# 3. Setup database
npm run db:generate
npm run db:push

# 4. Start development server
npm run dev
```

## 📱 Access the Application

- **Main Application**: http://localhost:3000
- **Database Studio**: http://localhost:5555 (run `npx prisma studio`)

## 🔧 First-Time Setup

### 1. Create Demo Restaurant
The application includes a demo restaurant:
- **Name**: Spice Garden
- **Location**: Mumbai, Maharashtra
- **GST**: 27ABCDE1234F1Z5

### 2. Explore Features
- **Dashboard**: View daily statistics and analytics
- **Orders**: Create and manage customer orders
- **Menu**: Add and manage menu items
- **Tables**: Manage restaurant tables
- **Customers**: Handle customer database and loyalty
- **Inventory**: Track stock and supplies

### 3. Create Your First Order
1. Click "New Order" in the dashboard
2. Select order type (Dine-in, Takeaway, Delivery)
3. Choose table (for dine-in) and customer
4. Add menu items to the order
5. Process payment using various methods

## 🛠 Common Commands

### Development
```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

### Database
```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Seed database with sample data
npm run db:seed

# Complete database setup (push + seed)
npm run db:setup

# Open database studio
npx prisma studio

# Reset database (warning: deletes all data)
npm run db:reset -- --force
```

### Production
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Issues
```bash
# Re-generate Prisma client
npm run db:generate

# Re-push schema
npm run db:push
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Re-install dependencies
rm -rf node_modules
npm install
```

## 📞 Support

For detailed documentation, see `FEATURES_AND_DEPLOYMENT.md`

For issues and questions:
1. Check the troubleshooting section
2. Review the console logs
3. Verify environment variables
4. Ensure all dependencies are installed

---

## 🎯 Next Steps

1. **Customize Restaurant Settings**: Update restaurant details, GST number, and branding
2. **Add Menu Items**: Populate your restaurant's menu with items and categories
3. **Setup Tables**: Configure restaurant tables and seating capacity
4. **Add Staff**: Create staff accounts with appropriate roles
5. **Configure Payments**: Set up payment methods and UPI integration
6. **Explore Reports**: Check analytics and reporting features

Happy selling! 🍽️