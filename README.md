# Indian Restaurant POS System

A comprehensive, enterprise-grade Point of Sale (POS) system specifically designed for Indian restaurants, featuring complete GST compliance, multi-payment gateway integration, advanced analytics, and scalable architecture.

## 🌟 Complete Feature Set

### 📦 Inventory Management

- **Real-time Stock Tracking**: Monitor inventory levels across all locations in real-time
- **Low Stock Alerts**: Automated notifications when stock reaches minimum thresholds
- **Inventory Reporting**: Generate comprehensive reports on stock levels, movements, and product popularity
- **Multi-location Inventory**: Track inventory separately for each outlet/location
- **Barcode Integration**: Scan barcodes for quick inventory updates
- **Stock Forecasting**: AI-powered predictions for inventory requirements
- **Supplier Management**: Track supplier information and purchase orders
- **Waste Tracking**: Monitor and reduce food waste with detailed tracking

### 📋 Order Management

- **Complete Order Tracking**: Track orders from placement to fulfillment with real-time status updates
- **Order Status Updates**: Real-time status changes (Pending → Confirmed → Preparing → Ready → Delivered)
- **Order Cancellation**: Allow customers and staff to cancel orders with proper reason tracking
- **Order Timeline**: Visual timeline showing complete order journey
- **Multi-order Types**: Support for Dine-in, Takeaway, Delivery, and Online orders
- **Order Modifications**: Allow order changes with proper audit trails
- **KOT Integration**: Kitchen Order Tickets for seamless kitchen operations
- **Order Analytics**: Detailed order performance metrics and insights

### 💳 Payment Processing

- **Multi-Payment Options**: Support for Cash, Credit/Debit Cards, UPI, Digital Wallets, and Bank Transfers
- **Payment Gateway Integration**: Seamless integration with Razorpay, PhonePe, Stripe, PayPal, and more
- **Payment Tokenization**: Secure storage of payment information for repeat customers
- **Refund Management**: Complete refund processing with reason tracking
- **Payment Analytics**: Detailed payment method analysis and trends
- **Split Payments**: Allow multiple payment methods for single orders
- **Payment Reconciliation**: Automated reconciliation of payments with orders
- **Failed Payment Handling**: Robust error handling and retry mechanisms

### 👥 Customer Management

- **Customer Profiles**: Comprehensive customer database with contact information and purchase history
- **Loyalty Programs**: Multi-tiered loyalty programs with points, rewards, and benefits
- **Customer Notifications**: Multi-channel notifications (Email, SMS, WhatsApp, Push) for promotions and updates
- **Customer Segmentation**: Advanced customer segmentation based on behavior and preferences
- **Visit History**: Complete tracking of customer visits and preferences
- **Customer Insights**: AI-powered insights into customer behavior and preferences
- **Targeted Marketing**: Send personalized offers based on customer behavior
- **Feedback Management**: Collect and analyze customer feedback

### 📊 Reporting and Analytics

- **Sales Reporting**: Comprehensive sales reports with revenue, profit margins, and growth trends
- **Customer Reporting**: Detailed customer analytics including lifetime value, visit frequency, and preferences
- **Inventory Reporting**: Complete inventory reports including stock levels, turnover rates, and wastage
- **Financial Reports**: P&L statements, balance sheets, and cash flow reports
- **Custom Reports**: Build custom reports with drag-and-drop interface
- **Real-time Dashboard**: Live dashboard with key metrics and KPIs
- **Forecasting**: AI-powered sales and inventory forecasting
- **Export Capabilities**: Export reports in multiple formats (PDF, Excel, CSV)

### 🔒 Security and Compliance

- **Data Encryption**: End-to-end encryption for sensitive data including payment information
- **Access Control**: Role-based access control (RBAC) with granular permissions
- **GST Compliance**: Complete GST compliance with CGST/SGST calculation and reporting
- **Audit Trails**: Comprehensive audit logging for all system activities
- **Data Backup**: Automated backup and disaster recovery
- **PCI-DSS Compliance**: Payment Card Industry compliance for secure payment processing
- **GDPR Compliance**: Data protection and privacy compliance
- **Security Monitoring**: Real-time security monitoring and alerting

### 🔌 Integration Capabilities

- **E-commerce Integration**: Seamless integration with Shopify, WooCommerce, and custom e-commerce platforms
- **Accounting Integration**: Integration with QuickBooks, Xero, and other accounting software
- **Third-party Services**: Integration with delivery providers, payment gateways, and marketing tools
- **API Access**: Complete RESTful API for custom integrations
- **Webhook Support**: Real-time webhooks for external system notifications
- **Zapier Integration**: Connect with 5000+ apps through Zapier
- **Custom Integrations**: Support for custom API integrations
- **Data Sync**: Real-time data synchronization across systems

### 📱 Mobile POS Features

- **Mobile App**: Native mobile apps for iOS and Android with full POS functionality
- **Tablet Support**: Optimized for tablet devices with touch-friendly interface
- **Offline Mode**: Complete offline functionality with automatic syncing when online
- **Mobile Payments**: Accept payments directly through mobile devices
- **Mobile Menu Access**: Full menu access and ordering from mobile devices
- **Location Services**: GPS-based location tracking and delivery management
- **Push Notifications**: Real-time notifications for orders and updates
- **Mobile Analytics**: Access reports and analytics on mobile devices

## 🚀 Deployment Guide

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- SQLite (for development) or PostgreSQL/MySQL (for production)

### Automated Deployment

```bash
# Clone the repository
git clone <repository-url>
cd indian-restaurant-pos

# Run the automated deployment script
./deploy.sh
```

### Manual Deployment

#### 1. Environment Setup

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Configure the following environment variables:
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
DATABASE_URL="file:./dev.db"
```

#### 2. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# (Optional) Seed with sample data
npm run db:seed
```

#### 3. Development Server

```bash
# Start development server
npm run dev

# Access the application
# Main App: http://localhost:3000
# Database Studio: npx prisma studio
```

Available credentials:
Owner: owner@spicegarden.com / owner123
Manager: manager@spicegarden.com / manager123
Cashier: cashier@spicegarden.com / cashier123
Kitchen: kitchen@spicegarden.com / kitchen123
Waiter: waiter@spicegarden.com / waiter123
Demo: demo@restaurant.com / demo123

🌱 Seeding demo accounts for login page...
Created POSBiz Demo restaurant with all demo accounts
Created categories and menu items for POSBiz Demo
Created sample tables for POSBiz Demo
Demo accounts seeded successfully!

Available demo credentials:
Super Admin: admin@posbiz.com / admin123
Restaurant Manager: manager@restaurant.com / manager123
Staff Member: staff@restaurant.com / staff123
Demo Account: demo@posbiz.com / demo123

//use starting data
// "db:seed-update-business": "tsx scripts/update-to-business.ts",
// "db:seed-all-business": "tsx prisma/seed-all-business-types.ts",
// "db:seed-all-comprehensive": "tsx prisma/seed-comprehensive.ts",
// "db:seed-fix-staff": "tsx prisma/seed-fix-staff.ts"

#### 4. Production Deployment

##### Build the Application

```bash
# Build for production
npm run build

# Start production server
npm start
```

##### Docker Deployment

```bash
# Build Docker image
docker build -t restaurant-pos .

# Run with Docker
docker run -p 3000:3000 restaurant-pos
```

##### Docker Compose (Recommended for Production)

```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/restaurant_pos
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: restaurant_pos
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

##### Cloud Deployment

###### AWS ECS

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
docker build -t restaurant-pos .
docker tag restaurant-pos:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/restaurant-pos:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/restaurant-pos:latest
```

###### Google Cloud Run

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT-ID/restaurant-pos
gcloud run deploy --image gcr.io/PROJECT-ID/restaurant-pos --platform managed
```

###### Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Configuration

#### Environment Variables

```bash
# Application
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-key

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/restaurant_pos

# Payment Gateways
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Email Service
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password

# SMS Service
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone

# External APIs
GOOGLE_MAPS_API_KEY=your_google_maps_key
ZOMATO_API_KEY=your_zomato_key
```

#### Database Configuration

```javascript
// prisma/schema.prisma
datasource db {
  provider = "postgresql" // or "mysql" for production
  url      = env("DATABASE_URL")
}
```

#### Security Configuration

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};
```

### Monitoring and Maintenance

#### Health Checks

```bash
# Application health check
curl http://localhost:3000/api/health

# Database health check
npm run db:health
```

#### Logging

```javascript
// Configure logging in production
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});
```

#### Backup Strategy

```bash
# Database backup
pg_dump restaurant_pos > backup_$(date +%Y%m%d).sql

# Automated backup script (add to cron)
0 2 * * * pg_dump restaurant_pos > /backups/daily_$(date +\%Y\%m\%d).sql
```

#### Performance Monitoring

```bash
# Install monitoring dependencies
npm install @vercel/otel

# Configure monitoring in your app
const { NodeSDK } = require('@vercel/otel');
```

## 🛠 Technical Architecture

### Frontend Stack

- **Next.js 15** with App Router for optimal performance
- **TypeScript 5** for type safety and better development experience
- **Tailwind CSS 4** for utility-first styling
- **shadcn/ui** for accessible, customizable UI components
- **Zustand** for efficient state management
- **TanStack Query** for server state management
- **Framer Motion** for smooth animations
- **React Hook Form** for form handling
- **Zod** for schema validation

### Backend Stack

- **Next.js API Routes** for serverless API endpoints
- **Prisma ORM** with type-safe database access
- **NextAuth.js** for authentication and session management
- **Socket.IO** for real-time features
- **Zod** for API input validation
- **bcrypt** for password hashing
- **jsonwebtoken** for JWT tokens
- **nodemailer** for email notifications
- **twilio** for SMS notifications

### Database

- **SQLite** for development (file-based, easy setup)
- **PostgreSQL** recommended for production (scalable, reliable)
- **MySQL** alternative for production
- **Redis** for caching and session storage (optional)

### Infrastructure

- **Docker** for containerization
- **Docker Compose** for local development
- **Nginx** for reverse proxy and load balancing
- **PM2** for process management in production
- **SSL/TLS** certificates for HTTPS

## 📊 Database Schema Overview

### Core Models

- **Restaurant**: Main restaurant entity with configuration
- **Outlet**: Multi-location support
- **User**: System users and authentication
- **Staff**: Restaurant staff with roles and permissions
- **Customer**: Customer database with loyalty programs
- **MenuItem**: Food and beverage items
- **Category**: Menu categorization
- **Order**: Order management and tracking
- **OrderItem**: Individual order items
- **Payment**: Payment processing and records
- **Inventory**: Stock and inventory management
- **Table**: Restaurant table management

### Advanced Models

- **Subscription**: Subscription plan management
- **Role**: Role-based access control
- **Permission**: Granular permission system
- **AuditLog**: Comprehensive audit trails
- **LoyaltyReward**: Loyalty program rewards
- **CustomerInsight**: AI-powered customer insights
- **InventoryAlert**: Stock level alerts
- **NotificationTemplate**: Notification templates
- **PaymentGateway**: Payment gateway configuration

## 💳 Subscription Plans

### Starter Plan - ₹1,999/month

- Up to 2 outlets
- Basic inventory management
- Order management
- Customer database
- Basic reporting
- Email support
- Mobile app access

### Professional Plan - ₹4,999/month

- Up to 5 outlets
- Advanced inventory with forecasting
- Complete order management
- Loyalty programs
- Advanced analytics
- Multi-payment gateways
- Priority support
- API access

### Enterprise Plan - Custom Pricing

- Unlimited outlets
- All Professional features
- Custom integrations
- White-label solution
- Dedicated account manager
- 24/7 phone support
- Training and onboarding
- Custom development

## 🇮🇳 Indian-Specific Features

### GST Compliance

- **Automatic Tax Calculation**: CGST/SGST/IGST based on location
- **GST Invoicing**: GST-compliant invoice generation
- **HSN Codes**: Support for HSN/SAC codes
- **GST Reports**: GSTR-1, GSTR-3B compatible reports
- **Multi-rate GST**: Support for different tax rates (0%, 5%, 12%, 18%, 28%)
- **GST Registration**: Track GST registration details

### Payment Integration

- **UPI Integration**: Support for all major UPI apps
- **QR Code Payments**: Generate and scan UPI QR codes
- **Net Banking**: Integration with major Indian banks
- **Wallet Integration**: Paytm, PhonePe, Google Pay, Amazon Pay
- **Card Payments**: All major credit/debit cards
- **Cash Management**: Cash handling and reconciliation

### Regional Features

- **Multi-language Support**: English, Hindi, Tamil, Telugu, Kannada, Bengali
- **Regional Cuisines**: Support for various Indian food categories
- **Festival Features**: Festival-specific promotions and menus
- **Local Taxes**: Support for state-specific taxes and cess
- **Regional Compliance**: Compliance with local restaurant regulations

## 📚 Documentation and Support

### Documentation

- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [User Manual](./docs/user-manual.md)
- [Admin Guide](./docs/admin-guide.md)
- [Developer Guide](./docs/developer-guide.md)

### Support Channels

- **Email Support**: support@restaurantpos.com
- **Phone Support**: +91 22 1234 5678 (Enterprise only)
- **Live Chat**: Available on web dashboard
- **Knowledge Base**: Comprehensive FAQ and tutorials
- **Video Tutorials**: Step-by-step video guides

### Community

- **User Forum**: community.restaurantpos.com
- **GitHub Discussions**: github.com/restaurantpos/discussions
- **Slack Community**: Join our Slack workspace
- **Monthly Webinars**: Feature updates and best practices

## 🔧 Development Commands

### Development

```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Run tests
npm test

# Watch tests
npm run test:watch
```

### Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Seed database
npm run db:seed

# Complete setup
npm run db:setup

# Open database studio
npx prisma studio

# Reset database
npm run db:reset -- --force
```

### Production

```bash
# Build application
npm run build

# Start production server
npm start

# Generate production build
npm run build:analyze
```

### Docker

```bash
# Build Docker image
docker build -t restaurant-pos .

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔍 Troubleshooting

### Common Issues and Solutions

#### Port Already in Use

```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use npx to kill port
npx kill-port 3000
```

#### Database Connection Issues

```bash
# Check database status
npm run db:health

# Regenerate Prisma client
npm run db:generate

# Reset database connection
npm run db:reset
```

#### Build Errors

```bash
# Clean build
rm -rf .next
rm -rf node_modules
npm install
npm run build

# Clear Next.js cache
npm run build:clean
```

#### Memory Issues

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run dev

# Check memory usage
npm run analyze:bundle
```

#### Performance Issues

```bash
# Analyze bundle size
npm run analyze

# Optimize images
npm run optimize:images

# Generate sitemap
npm run generate:sitemap
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Standards

- Follow TypeScript best practices
- Use ESLint configuration
- Write comprehensive tests
- Update documentation
- Follow semantic versioning

### Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- filename.test.ts

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

### Upcoming Features

- **AI-powered Menu Optimization**: Intelligent menu suggestions based on sales data
- **Advanced CRM**: Enhanced customer relationship management features
- **Mobile Kitchen Display**: Kitchen display system for mobile devices
- **Voice Ordering**: Voice-based order taking
- **Advanced Analytics**: Machine learning-powered business insights
- **Multi-currency Support**: Support for international operations
- **Advanced Reporting**: Custom report builder and scheduled reports
- **Integration Marketplace**: App store for third-party integrations

### Performance Improvements

- **Caching Layer**: Redis caching for improved performance
- **Database Optimization**: Query optimization and indexing
- **Frontend Optimization**: Lazy loading and code splitting
- **API Optimization**: Response time improvements
- **Mobile Optimization**: Enhanced mobile performance

## 📞 Contact

For support, questions, or feedback:

- **Email**: support@restaurantpos.com
- **Phone**: +91 22 1234 5678
- **Website**: www.restaurantpos.com
- **Address**: 123 Business Park, Mumbai, Maharashtra 400001

---

_Transform your restaurant business with our comprehensive, scalable, and user-friendly POS system designed specifically for the Indian market._
