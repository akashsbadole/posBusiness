'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart,
  Clock,
  Star,
  Target,
  BarChart3,
  PieChart,
  Download,
  Calendar,
  Filter
} from 'lucide-react';

interface ReportMetric {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ReactNode;
  description: string;
}

interface SalesData {
  date: string;
  sales: number;
  orders: number;
  customers: number;
}

interface TopItem {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
  category: string;
}

interface CustomerSegment {
  name: string;
  count: number;
  revenue: number;
  avgOrderValue: number;
}

const AdvancedReportingDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real app, this would come from API
  const metrics: ReportMetric[] = [
    {
      title: "Total Revenue",
      value: "₹2,45,678",
      change: "+12.5%",
      changeType: 'positive',
      icon: <DollarSign className="h-5 w-5" />,
      description: "vs previous period"
    },
    {
      title: "Total Orders",
      value: "1,234",
      change: "+8.2%",
      changeType: 'positive',
      icon: <ShoppingCart className="h-5 w-5" />,
      description: "orders processed"
    },
    {
      title: "Average Order Value",
      value: "₹199.12",
      change: "-2.1%",
      changeType: 'negative',
      icon: <Target className="h-5 w-5" />,
      description: "per order"
    },
    {
      title: "Customer Retention",
      value: "78.5%",
      change: "+5.3%",
      changeType: 'positive',
      icon: <Users className="h-5 w-5" />,
      description: "returning customers"
    }
  ];

  const salesData: SalesData[] = [
    { date: '2024-01-01', sales: 45000, orders: 45, customers: 38 },
    { date: '2024-01-02', sales: 52000, orders: 52, customers: 45 },
    { date: '2024-01-03', sales: 48000, orders: 48, customers: 42 },
    { date: '2024-01-04', sales: 61000, orders: 61, customers: 52 },
    { date: '2024-01-05', sales: 55000, orders: 55, customers: 48 },
    { date: '2024-01-06', sales: 67000, orders: 67, customers: 58 },
    { date: '2024-01-07', sales: 72000, orders: 72, customers: 63 }
  ];

  const topItems: TopItem[] = [
    { id: '1', name: 'Butter Chicken', quantity: 156, revenue: 78000, category: 'Main Course' },
    { id: '2', name: 'Garlic Naan', quantity: 234, revenue: 46800, category: 'Bread' },
    { id: '3', name: 'Paneer Tikka', quantity: 89, revenue: 53400, category: 'Starter' },
    { id: '4', name: 'Biryani', quantity: 112, revenue: 67200, category: 'Main Course' },
    { id: '5', name: 'Masala Chai', quantity: 345, revenue: 17250, category: 'Beverages' }
  ];

  const customerSegments: CustomerSegment[] = [
    { name: 'Regular Customers', count: 156, revenue: 245000, avgOrderValue: 1570 },
    { name: 'New Customers', count: 89, revenue: 89000, avgOrderValue: 1000 },
    { name: 'VIP Customers', count: 23, revenue: 67000, avgOrderValue: 2913 },
    { name: 'Corporate Orders', count: 12, revenue: 45000, avgOrderValue: 3750 }
  ];

  const peakHours = [
    { hour: '12:00', orders: 15, revenue: 12000 },
    { hour: '13:00', orders: 25, revenue: 20000 },
    { hour: '14:00', orders: 18, revenue: 14400 },
    { hour: '19:00', orders: 22, revenue: 17600 },
    { hour: '20:00', orders: 35, revenue: 28000 },
    { hour: '21:00', orders: 28, revenue: 22400 }
  ];

  const handleExportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsLoading(true);
    try {
      // In real app, this would call an API to generate and download the report
      console.log(`Exporting report in ${format} format`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMetricCard = (metric: ReportMetric) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
        {metric.icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metric.value}</div>
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          {metric.changeType === 'positive' ? (
            <TrendingUp className="h-3 w-3 text-green-600" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-600" />
          )}
          <span className={metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
            {metric.change}
          </span>
          <span>{metric.description}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Advanced Reporting & Analytics</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex rounded-md shadow-sm">
            {['7d', '30d', '90d', '1y'].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className="rounded-none first:rounded-l-md last:rounded-r-md"
              >
                {period}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Custom Range
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(renderMetricCard)}
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
          <TabsTrigger value="items">Menu Performance</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
          <TabsTrigger value="peak">Peak Hours</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sales Trend</CardTitle>
                  <CardDescription>Daily sales performance over the selected period</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleExportReport('pdf')}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportReport('excel')}>
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesData.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">
                        {day.orders} orders • {day.customers} customers
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{day.sales.toLocaleString('en-IN')}</p>
                      <p className="text-sm text-gray-600">
                        Avg: ₹{Math.round(day.sales / day.orders).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Menu Items</CardTitle>
              <CardDescription>Most popular and profitable items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topItems.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 rounded-full font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{item.revenue.toLocaleString('en-IN')}</p>
                      <p className="text-sm text-gray-600">{item.quantity} sold</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segmentation</CardTitle>
              <CardDescription>Analysis of customer groups and their behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerSegments.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{segment.name}</p>
                      <p className="text-sm text-gray-600">{segment.count} customers</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{segment.revenue.toLocaleString('en-IN')}</p>
                      <p className="text-sm text-gray-600">
                        Avg: ₹{segment.avgOrderValue.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peak" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Peak Hours Analysis</CardTitle>
              <CardDescription>Busiest times and revenue patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {peakHours.map((hour, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{hour.hour}</p>
                        <p className="text-sm text-gray-600">{hour.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{hour.revenue.toLocaleString('en-IN')}</p>
                      <p className="text-sm text-gray-600">
                        Avg: ₹{Math.round(hour.revenue / hour.orders).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Income sources and percentages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Dine-in</span>
                    <Badge variant="secondary">65%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Takeaway</span>
                    <Badge variant="secondary">25%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Delivery</span>
                    <Badge variant="secondary">10%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Popular payment options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>UPI</span>
                    <Badge variant="secondary">45%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cash</span>
                    <Badge variant="secondary">30%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Credit/Debit Card</span>
                    <Badge variant="secondary">25%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Performance</CardTitle>
              <CardDescription>Stock levels and waste analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">92%</p>
                  <p className="text-sm text-gray-600">Stock Accuracy</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">3.2%</p>
                  <p className="text-sm text-gray-600">Waste Rate</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">15</p>
                  <p className="text-sm text-gray-600">Low Stock Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedReportingDashboard;