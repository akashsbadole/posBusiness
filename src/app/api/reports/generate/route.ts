import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    const locationId = searchParams.get('locationId');
    const reportType = searchParams.get('type') || 'sales';

    const whereClause: any = {};
    if (locationId) {
      whereClause.locationId = locationId;
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    whereClause.createdAt = {
      gte: startDate
    };

    let reportData;

    switch (reportType) {
      case 'sales':
        reportData = await generateSalesReport(whereClause);
        break;
      case 'items':
        reportData = await generateItemsReport(whereClause);
        break;
      case 'customers':
        reportData = await generateCustomersReport(whereClause);
        break;
      case 'financial':
        reportData = await generateFinancialReport(whereClause);
        break;
      case 'inventory':
        reportData = await generateInventoryReport(whereClause);
        break;
      default:
        reportData = await generateSalesReport(whereClause);
    }

    return NextResponse.json({
      period,
      reportType,
      data: reportData,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateSalesReport(whereClause: any) {
  const orders = await db.order.findMany({
    where: whereClause,
    include: {
      items: {
        include: {
          menuItem: true
        }
      },
      customer: true
    }
  });

  // Group by date
  const dailySales = orders.reduce((acc, order) => {
    const date = order.createdAt.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        date,
        sales: 0,
        orders: 0,
        customers: new Set()
      };
    }
    acc[date].sales += order.totalAmount;
    acc[date].orders += 1;
    acc[date].customers.add(order.customerId);
    return acc;
  }, {} as Record<string, any>);

  // Convert to array and calculate metrics
  const salesData = Object.values(dailySales).map((day: any) => ({
    date: day.date,
    sales: day.sales,
    orders: day.orders,
    customers: day.customers.size
  }));

  // Calculate totals
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const uniqueCustomers = new Set(orders.map(order => order.customerId)).size;

  return {
    summary: {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      uniqueCustomers
    },
    dailyData: salesData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  };
}

async function generateItemsReport(whereClause: any) {
  const orderItems = await db.orderItem.findMany({
    where: {
      order: whereClause
    },
    include: {
      menuItem: true,
      order: true
    }
  });

  // Group by menu item
  const itemStats = orderItems.reduce((acc, item) => {
    const itemId = item.menuItemId;
    if (!acc[itemId]) {
      acc[itemId] = {
        id: itemId,
        name: item.menuItem.name,
        category: item.menuItem.category,
        quantity: 0,
        revenue: 0
      };
    }
    acc[itemId].quantity += item.quantity;
    acc[itemId].revenue += item.price * item.quantity;
    return acc;
  }, {} as Record<string, any>);

  // Sort by revenue and get top items
  const topItems = Object.values(itemStats)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 20);

  return {
    topItems,
    totalItemsSold: Object.values(itemStats).reduce((sum: number, item: any) => sum + item.quantity, 0)
  };
}

async function generateCustomersReport(whereClause: any) {
  const orders = await db.order.findMany({
    where: whereClause,
    include: {
      customer: true
    }
  });

  // Group by customer
  const customerStats = orders.reduce((acc, order) => {
    const customerId = order.customerId;
    if (!customerId) return acc;
    
    if (!acc[customerId]) {
      acc[customerId] = {
        id: customerId,
        name: order.customer?.name || 'Unknown',
        orders: 0,
        totalSpent: 0,
        lastOrder: order.createdAt
      };
    }
    acc[customerId].orders += 1;
    acc[customerId].totalSpent += order.totalAmount;
    if (order.createdAt > acc[customerId].lastOrder) {
      acc[customerId].lastOrder = order.createdAt;
    }
    return acc;
  }, {} as Record<string, any>);

  const customers = Object.values(customerStats);

  // Segment customers
  const segments = {
    new: customers.filter((c: any) => c.orders === 1),
    regular: customers.filter((c: any) => c.orders > 1 && c.orders <= 5),
    vip: customers.filter((c: any) => c.orders > 5)
  };

  return {
    totalCustomers: customers.length,
    segments: {
      new: {
        count: segments.new.length,
        revenue: segments.new.reduce((sum, c: any) => sum + c.totalSpent, 0),
        avgOrderValue: segments.new.length > 0 ? 
          segments.new.reduce((sum, c: any) => sum + c.totalSpent, 0) / segments.new.length : 0
      },
      regular: {
        count: segments.regular.length,
        revenue: segments.regular.reduce((sum, c: any) => sum + c.totalSpent, 0),
        avgOrderValue: segments.regular.length > 0 ? 
          segments.regular.reduce((sum, c: any) => sum + c.totalSpent, 0) / segments.regular.length : 0
      },
      vip: {
        count: segments.vip.length,
        revenue: segments.vip.reduce((sum, c: any) => sum + c.totalSpent, 0),
        avgOrderValue: segments.vip.length > 0 ? 
          segments.vip.reduce((sum, c: any) => sum + c.totalSpent, 0) / segments.vip.length : 0
      }
    },
    topCustomers: customers
      .sort((a: any, b: any) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
  };
}

async function generateFinancialReport(whereClause: any) {
  const orders = await db.order.findMany({
    where: whereClause,
    include: {
      payments: true
    }
  });

  const payments = await db.payment.findMany({
    where: {
      order: whereClause
    }
  });

  // Revenue by order type
  const revenueByType = orders.reduce((acc, order) => {
    const type = order.type;
    if (!acc[type]) {
      acc[type] = 0;
    }
    acc[type] += order.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  // Payment methods breakdown
  const paymentMethods = payments.reduce((acc, payment) => {
    const method = payment.method;
    if (!acc[method]) {
      acc[method] = 0;
    }
    acc[method] += payment.amount;
    return acc;
  }, {} as Record<string, number>);

  // GST breakdown
  const totalGST = orders.reduce((sum, order) => sum + order.gstAmount, 0);
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const netRevenue = totalRevenue - totalGST;

  return {
    revenue: {
      total: totalRevenue,
      net: netRevenue,
      gst: totalGST,
      byType: revenueByType
    },
    payments: paymentMethods,
    discounts: {
      total: orders.reduce((sum, order) => sum + order.discountAmount, 0),
      count: orders.filter(order => order.discountAmount > 0).length
    }
  };
}

async function generateInventoryReport(whereClause: any) {
  const menuItems = await db.menuItem.findMany({
    where: {
      locationId: whereClause.locationId
    }
  });

  const lowStockItems = menuItems.filter(item => item.stock <= item.reorderLevel);
  const outOfStockItems = menuItems.filter(item => item.stock === 0);

  // Calculate inventory value
  const totalInventoryValue = menuItems.reduce((sum, item) => sum + (item.stock * item.cost), 0);

  return {
    summary: {
      totalItems: menuItems.length,
      lowStockItems: lowStockItems.length,
      outOfStockItems: outOfStockItems.length,
      totalInventoryValue
    },
    lowStockItems: lowStockItems.map(item => ({
      id: item.id,
      name: item.name,
      currentStock: item.stock,
      reorderLevel: item.reorderLevel,
      cost: item.cost
    })),
    outOfStockItems: outOfStockItems.map(item => ({
      id: item.id,
      name: item.name,
      cost: item.cost
    }))
  };
}