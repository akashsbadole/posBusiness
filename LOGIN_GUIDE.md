# Restaurant POS System - Login Guide

## 🚀 Quick Start

All accounts are now working! You can log in with any of the following test accounts:

### 👑 **Owner Account**
- **Email**: `owner@spicegarden.com`
- **Password**: `owner123`
- **Role**: Restaurant Owner (Full access to all features)

### 👨‍💼 **Manager Account**
- **Email**: `manager@spicegarden.com`
- **Password**: `manager123`
- **Role**: Restaurant Manager (Operational access)

### 👨‍🍳 **Staff Accounts**

#### General Staff
- **Email**: `staff@spicegarden.com`
- **Password**: `staff123`
- **Role**: Waiter (Limited access)

#### Chef
- **Email**: `chef@spicegarden.com`
- **Password**: `password123`
- **Role**: Chef (Kitchen access)

#### Cashier
- **Email**: `cashier@spicegarden.com`
- **Password**: `password123`
- **Role**: Cashier (Payment processing)

#### Waiter
- **Email**: `waiter@spicegarden.com`
- **Password**: `password123`
- **Role**: Waiter (Order management)

## 🔐 **How to Login**

1. **Navigate to the application**
   - Open your browser and go to `http://localhost:3000`
   - You will be redirected to the login page

2. **Enter your credentials**
   - Use any of the test accounts above
   - Make sure to type the email and password exactly as shown

3. **Access the dashboard**
   - After successful login, you'll be redirected to the main dashboard
   - The dashboard will show features based on your role

## 🎯 **Role-Based Access**

### **Owner Access** (`owner@spicegarden.com`)
- ✅ Full access to all features
- ✅ Can manage staff and roles
- ✅ Can access financial reports
- ✅ Can modify business settings
- ✅ Can manage multiple locations
- ✅ Can view audit trails

### **Manager Access** (`manager@spicegarden.com`)
- ✅ Dashboard and analytics
- ✅ Order management
- ✅ Menu management
- ✅ Staff management (view only)
- ✅ Inventory management
- ✅ Customer management
- ❌ Financial reports (limited)
- ❌ Business settings (limited)

### **Staff Access** (Various roles)
- ✅ Dashboard (basic view)
- ✅ Order creation and management
- ✅ Menu viewing
- ✅ Customer management (basic)
- ❌ Staff management
- ❌ Financial reports
- ❌ Business settings
- ❌ Advanced analytics

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **"Invalid email or password"**
- Make sure you're using the correct email and password
- Check for typos in the email address
- Ensure Caps Lock is off
- Try copying and pasting the credentials

#### **"Staff account not found or inactive"**
- This should now be resolved with the latest fixes
- All staff accounts are active and properly linked
- Try refreshing the page and logging in again

#### **"No restaurant found for this user"**
- This occurs when user accounts are not properly linked to restaurants
- The comprehensive seed has fixed this issue
- All accounts are now properly linked to the demo restaurant

### **If Issues Persist**

1. **Clear browser cache and cookies**
2. **Try a different browser**
3. **Check the console for errors** (F12 → Console)
4. **Ensure the server is running** (`npm run dev`)

## 📱 **Mobile Access**

The system is fully responsive and works on:
- ✅ Desktop browsers
- ✅ Tablets
- ✅ Mobile phones
- ✅ Progressive Web App (PWA) enabled

## 🔧 **Technical Details**

### **Authentication Flow**
1. User enters credentials
2. System checks against database
3. Verifies password (bcrypt hashed)
4. Generates JWT token
5. Returns user data and restaurant info
6. Stores token in localStorage
7. Redirects to dashboard

### **Security Features**
- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Session timeout (24 hours)
- ✅ Secure password storage
- ✅ Input validation and sanitization

### **Database Structure**
- **Users**: Main user accounts
- **Staff**: Staff profiles with roles
- **Restaurants**: Business entities
- **Roles**: Permission groups
- **Permissions**: Granular access control

## 🎉 **Success!**

All authentication issues have been resolved. The system now has:

- ✅ **6 working test accounts** with different roles
- ✅ **Proper password hashing** for security
- ✅ **Role-based access control** (RBAC)
- ✅ **Complete user-staff-restaurant linking**
- ✅ **Comprehensive permissions system**
- ✅ **Error handling and validation**

You can now test all features of the Restaurant POS System using any of the provided accounts!