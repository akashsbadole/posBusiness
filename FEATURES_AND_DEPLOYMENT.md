# Indian Restaurant POS System - Features & Deployment Guide

## 📋 Table of Contents
1. [Features Overview](#features-overview)
2. [Core Features](#core-features)
3. [Operational Features](#operational-features)
4. [Analytics & Reporting](#analytics--reporting)
5. [Customer Features](#customer-features)
6. [Subscription Features](#subscription-features)
7. [Indian Localization](#indian-localization)
8. [Technical Stack](#technical-stack)
9. [Deployment Steps](#deployment-steps)
10. [Environment Setup](#environment-setup)
11. [Database Configuration](#database-configuration)
12. [Running the Application](#running-the-application)

---

## 🌟 Features Overview

This is a comprehensive subscription-based Point of Sale (POS) system specifically designed for Indian restaurants. The application provides end-to-end restaurant management capabilities with GST compliance, UPI payment integration, and multi-location support.

---

## 🎯 Core Features

### 1. Order Management
- **Order Creation**: Create dine-in, takeaway, and delivery orders
- **Order Tracking**: Real-time order status updates (Pending → Confirmed → Preparing → Ready → Delivered)
- **Order Modification**: Add/remove items, modify quantities, and update order details
- **Order History**: Complete order history with search and filter capabilities
- **Order Cancellation**: Cancel orders with reason tracking

### 2. Menu Management
- **Menu Categories**: Organize menu items by categories (Starters, Main Course, Desserts, etc.)
- **Menu Items**: Add, edit, and remove menu items with pricing and descriptions
- **Menu Availability**: Toggle item availability in real-time
- **Menu Pricing**: Dynamic pricing with GST calculation
- **Menu Images**: Upload and manage menu item images

### 3. Billing & Payments
- **GST Calculation**: Automatic CGST/SGST calculation (5% for non-AC, 18% for AC restaurants)
- **Multiple Payment Methods**: Cash, UPI, Card, Net Banking, Wallet
- **UPI Integration**: Support for all major UPI apps (Paytm, PhonePe, Google Pay, etc.)
- **Bill Generation**: Professional bill generation with restaurant branding
- **Discount Management**: Apply discounts on orders and individual items
- **Split Billing**: Split bills between multiple customers

### 4. Inventory Management
- **Stock Tracking**: Real-time inventory level monitoring
- **Low Stock Alerts**: Automatic alerts for low stock items
- **Purchase Orders**: Create and manage purchase orders
- **Stock Adjustment**: Adjust stock levels for wastage, damage, etc.
- **Supplier Management**: Manage supplier information and pricing

---

## 🚀 Operational Features

### 1. Table Management
- **Table Layout**: Visual table management with drag-and-drop
- **Table Status**: Real-time table status (Available, Occupied, Reserved, Maintenance)
- **Table Reservation**: Reserve tables for future bookings
- **Table Capacity**: Manage seating capacity and table types
- **Table History**: View table usage history and analytics

### 2. Order Tracking
- **Real-time Updates**: Live order status updates
- **Kitchen Display System (KDS)**: Digital KOT (Kitchen Order Ticket) display
- **Order Timers**: Track preparation and delivery times
- **Order Notifications**: SMS/email notifications for order status changes
- **Order Prioritization**: Priority handling for urgent orders

### 3. Staff Management
- **Role-based Access**: Different access levels (Owner, Manager, Cashier, Waiter, Chef)
- **Staff Scheduling**: Create and manage staff schedules
- **Performance Tracking**: Monitor staff performance and sales metrics
- **Attendance Management**: Track staff attendance and working hours
- **Commission Tracking**: Calculate staff commissions and incentives

### 4. KOT Generation
- **Digital KOT**: Generate Kitchen Order Tickets automatically
- **KOT Status Tracking**: Track KOT status (Pending → Preparing → Ready)
- **KOT History**: Complete KOT history for audit purposes
- **Kitchen Display**: Real-time KOT display in kitchen
- **KOT Modifications**: Handle modifications and cancellations

---

## 📊 Analytics & Reporting

### 1. Sales Reports
- **Daily Sales**: Daily sales summary with breakdowns
- **Monthly Reports**: Monthly sales trends and comparisons
- **Category-wise Sales**: Sales analysis by menu categories
- **Item-wise Sales**: Best-selling and least-selling items
- **Hourly Sales**: Peak hours analysis and staff optimization

### 2. Financial Reports
- **Revenue Reports**: Total revenue with GST breakdown
- **Expense Tracking**: Track operational expenses
- **Profit & Loss**: Comprehensive P&L statements
- **Tax Reports**: GST reports for filing purposes
- **Payment Method Analysis**: Analysis of payment method usage

### 3. Customer Analytics
- **Customer Demographics**: Age, location, and preference analysis
- **Visit Frequency**: Customer visit patterns and loyalty
- **Average Order Value**: Customer spending analysis
- **Customer Retention**: Retention rate and churn analysis
- **Feedback Analysis**: Customer feedback and rating analysis

### 4. Inventory Reports
- **Stock Reports**: Current stock levels and valuation
- **Usage Reports**: Ingredient usage patterns
- **Wastage Reports**: Track food wastage and costs
- **Purchase History**: Historical purchase data
- **Cost Analysis**: Food cost percentage analysis

---

## 👥 Customer Features

### 1. Customer Management
- **Customer Database**: Complete customer profile management
- **Loyalty Program**: Points-based loyalty system
- **Customer Segmentation**: Categorize customers by spending habits
- **Birthday/Anniversary Reminders**: Special occasion tracking
- **Customer Feedback**: Collect and manage customer reviews

### 2. Loyalty Programs
- **Points System**: Earn points on every purchase
- **Reward Tiers**: Different reward levels based on spending
- **Redemption Options**: Redeem points for discounts or free items
- **Referral Program**: Customer referral rewards
- **Special Offers**: Exclusive offers for loyal customers

### 3. CRM Features
- **Customer Communication**: SMS/email marketing campaigns
- **Personalized Offers**: Targeted offers based on customer preferences
- **Visit History**: Complete customer visit and order history
- **Preference Tracking**: Track customer preferences and allergies
- **Feedback Management**: Collect and act on customer feedback

---

## 💳 Subscription Features

### 1. Subscription Plans
- **Basic Plan**: Essential features for small restaurants
- **Pro Plan**: Advanced features for growing restaurants
- **Enterprise Plan**: Complete solution for restaurant chains
- **Custom Plans**: Tailored solutions for specific needs
- **Trial Period**: 14-day free trial for all plans

### 2. Billing Management
- **Automated Billing**: Monthly subscription billing
- **Payment Processing**: Secure payment processing
- **Invoice Generation**: Automatic invoice generation
- **Payment Reminders**: Automated payment reminders
- **Upgrade/Downgrade**: Flexible plan changes

### 3. Feature Access
- **Plan-based Features**: Feature access based on subscription
- **Usage Limits**: Usage limits based on plan
- **Add-on Features**: Additional features for extra cost
- **Multi-location Support**: Support for multiple outlets
- **API Access**: API access for integrations

---

## 🇮🇳 Indian Localization

### 1. GST Compliance
- **GST Calculation**: Automatic CGST/SGST calculation
- **GST Rates**: Support for different GST rates (5%, 12%, 18%, 28%)
- **GST Invoicing**: GST-compliant invoicing
- **GST Reports**: GST reports for filing
- **HSN Codes**: HSN code integration for menu items

### 2. UPI Integration
- **Multiple UPI Apps**: Support for Paytm, PhonePe, Google Pay, etc.
- **QR Code Payments**: Generate UPI QR codes
- **UPI ID Integration**: Accept payments via UPI IDs
- **Payment Confirmation**: Real-time payment confirmation
- **UPI Settlement**: Automatic settlement tracking

### 3. Indian Payment Methods
- **Cash Payments**: Cash payment handling
- **Card Payments**: Debit/Credit card support
- **Net Banking**: All major Indian banks
- **Digital Wallets**: Paytm Wallet, PhonePe Wallet, etc.
- **EMI Options**: EMI payment options for large orders

### 4. Regional Features
- **Multi-language Support**: English, Hindi, and regional languages
- **Regional Cuisines**: Support for various Indian cuisines
- **Festival Offers**: Festival-specific promotions
- **Local Taxes**: Support for local taxes and cess
- **Regional Compliance**: State-specific compliance requirements

---

## 🛠 Technical Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Backend
- **Database**: SQLite with Prisma ORM
- **API**: RESTful API with Next.js API Routes
- **Authentication**: NextAuth.js v4
- **Real-time**: Socket.IO for real-time features
- **File Upload**: Native Next.js file handling
- **Caching**: Local memory caching

### Development Tools
- **Package Manager**: npm
- **Code Quality**: ESLint with Next.js rules
- **Database Management**: Prisma Studio
- **Development Server**: nodemon with tsx
- **Environment**: dotenv for environment variables

---

## 🚀 Deployment Steps

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git for version control
- Basic knowledge of terminal commands

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd indian-restaurant-pos
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Setup
Create a `.env.local` file in the root directory:
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Application
NODE_ENV="development"
PORT="3000"
```

### Step 4: Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# (Optional) Open Prisma Studio for database management
npx prisma studio
```

### Step 5: Build the Application
```bash
npm run build
```

### Step 6: Start the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

---

## 🔧 Environment Setup

### Development Environment
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Initialize database
npm run db:push

# Start development server
npm run dev
```

### Production Environment
```bash
# Install production dependencies
npm install --production

# Set production environment variables
export NODE_ENV=production
export DATABASE_URL="file:./prod.db"
export NEXTAUTH_SECRET="your-production-secret"

# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables
Create `.env.local` with:
```env
# Database Configuration
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secure-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Application Configuration
NODE_ENV="development"
PORT="3000"

# Optional: External API Keys
STRIPE_SECRET_KEY="your-stripe-secret-key"
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"
```

---

## 🗄 Database Configuration

### Database Schema
The application uses Prisma ORM with SQLite database. The schema includes:

- **Users**: Authentication and user management
- **Restaurants**: Restaurant details and configuration
- **Outlets**: Multi-location support
- **Subscriptions**: Subscription plan management
- **Staff**: Employee management with roles
- **Categories**: Menu categorization
- **Menu Items**: Food and beverage items
- **Customers**: Customer database and loyalty
- **Tables**: Restaurant table management
- **Orders**: Order management and tracking
- **Order Items**: Individual order items
- **KOT Items**: Kitchen order tickets
- **Payments**: Payment processing
- **Inventory**: Stock and inventory management

### Database Migrations
```bash
# Create new migration
npx prisma migrate dev --name migration-name

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

### Database Seeding
To seed the database with initial data:
```bash
# Create seed script
npx prisma db seed
```

---

## 🏃 Running the Application

### Development Mode
```bash
# Start development server with hot reload
npm run dev

# The application will be available at:
# http://localhost:3000
```

### Production Mode
```bash
# Build for production
npm run build

# Start production server
npm start

# The application will be available at:
# http://localhost:3000
```

### Database Management
```bash
# Open Prisma Studio (database GUI)
npx prisma studio

# View database schema
npx prisma db pull

# Reset database
npx prisma migrate reset
```

### Code Quality
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint -- --fix

# Type checking
npx tsc --noEmit
```

### Testing
```bash
# Run tests (if implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

---

## 📱 Application Access

Once the application is running, you can access:

- **Main Application**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs (if implemented)
- **Database Studio**: http://localhost:5555 (when running Prisma Studio)

### Default Login Credentials
For initial setup, you can create a default user:
- Email: admin@example.com
- Password: password123

---

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check if database file exists
   ls -la prisma/
   
   # Re-generate Prisma client
   npm run db:generate
   
   # Re-push schema
   npm run db:push
   ```

2. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   
   # Or use different port
   PORT=3001 npm run dev
   ```

3. **Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   
   # Re-install dependencies
   rm -rf node_modules
   npm install
   
   # Re-build
   npm run build
   ```

4. **TypeScript Errors**
   ```bash
   # Check TypeScript configuration
   npx tsc --noEmit
   
   # Generate types
   npm run db:generate
   ```

---

## 📞 Support

For support and issues:
1. Check the troubleshooting section above
2. Review the logs in the console
3. Check the database connection
4. Verify environment variables
5. Ensure all dependencies are properly installed

---

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

*Last Updated: December 2024*