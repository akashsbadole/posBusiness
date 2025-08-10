'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Building, 
  Package, 
  Users, 
  TrendingUp, 
  Plus,
  Settings,
  Truck,
  Phone,
  Mail,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  ArrowRight
} from 'lucide-react';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  type: 'restaurant' | 'cloud_kitchen' | 'food_truck' | 'kiosk';
  status: 'active' | 'inactive' | 'maintenance';
  gstNumber: string;
  capacity: number;
  openingHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  manager: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  inventory: LocationInventory;
  stats: LocationStats;
}

interface LocationInventory {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  categories: {
    [key: string]: {
      totalItems: number;
      lowStockItems: number;
      value: number;
    };
  };
}

interface LocationStats {
  todayRevenue: number;
  todayOrders: number;
  todayCustomers: number;
  weeklyRevenue: number;
  weeklyOrders: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  staffCount: number;
  tableOccupancy: number;
}

interface InventoryTransfer {
  id: string;
  fromLocationId: string;
  toLocationId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  status: 'pending' | 'approved' | 'in_transit' | 'completed' | 'cancelled';
  requestedAt: string;
  approvedAt?: string;
  completedAt?: string;
  requestedBy: string;
  approvedBy?: string;
}

const MultiLocationManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isCreatingLocation, setIsCreatingLocation] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);

  // Mock data - in real app, this would come from API
  const locations: Location[] = [
    {
      id: '1',
      name: 'Spice Garden - Andheri',
      address: '123 Linking Road, Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400053',
      phone: '+91 22 1234 5678',
      email: 'andheri@spicegarden.com',
      type: 'restaurant',
      status: 'active',
      gstNumber: '27ABCDE1234F1Z5',
      capacity: 80,
      openingHours: {
        monday: { open: '11:00', close: '23:00', closed: false },
        tuesday: { open: '11:00', close: '23:00', closed: false },
        wednesday: { open: '11:00', close: '23:00', closed: false },
        thursday: { open: '11:00', close: '23:00', closed: false },
        friday: { open: '11:00', close: '23:30', closed: false },
        saturday: { open: '11:00', close: '23:30', closed: false },
        sunday: { open: '11:00', close: '23:00', closed: false }
      },
      manager: {
        id: 'm1',
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@spicegarden.com',
        phone: '+91 98765 43210'
      },
      inventory: {
        totalItems: 245,
        lowStockItems: 12,
        outOfStockItems: 3,
        totalValue: 485000,
        categories: {
          'vegetables': { totalItems: 45, lowStockItems: 5, value: 45000 },
          'meat': { totalItems: 32, lowStockItems: 3, value: 96000 },
          'dairy': { totalItems: 28, lowStockItems: 2, value: 28000 },
          'grains': { totalItems: 67, lowStockItems: 1, value: 134000 },
          'spices': { totalItems: 73, lowStockItems: 1, value: 182000 }
        }
      },
      stats: {
        todayRevenue: 45600,
        todayOrders: 48,
        todayCustomers: 42,
        weeklyRevenue: 289000,
        weeklyOrders: 312,
        monthlyRevenue: 1156000,
        monthlyOrders: 1248,
        staffCount: 15,
        tableOccupancy: 78
      }
    },
    {
      id: '2',
      name: 'Spice Garden - Powai',
      address: '456 Hiranandani Gardens, Powai',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400076',
      phone: '+91 22 2345 6789',
      email: 'powai@spicegarden.com',
      type: 'restaurant',
      status: 'active',
      gstNumber: '27ABCDE1234F1Z6',
      capacity: 120,
      openingHours: {
        monday: { open: '11:00', close: '23:00', closed: false },
        tuesday: { open: '11:00', close: '23:00', closed: false },
        wednesday: { open: '11:00', close: '23:00', closed: false },
        thursday: { open: '11:00', close: '23:00', closed: false },
        friday: { open: '11:00', close: '23:30', closed: false },
        saturday: { open: '11:00', close: '23:30', closed: false },
        sunday: { open: '11:00', close: '23:00', closed: false }
      },
      manager: {
        id: 'm2',
        name: 'Priya Sharma',
        email: 'priya.sharma@spicegarden.com',
        phone: '+91 98765 54321'
      },
      inventory: {
        totalItems: 198,
        lowStockItems: 8,
        outOfStockItems: 2,
        totalValue: 392000,
        categories: {
          'vegetables': { totalItems: 38, lowStockItems: 3, value: 38000 },
          'meat': { totalItems: 25, lowStockItems: 2, value: 75000 },
          'dairy': { totalItems: 22, lowStockItems: 1, value: 22000 },
          'grains': { totalItems: 56, lowStockItems: 1, value: 112000 },
          'spices': { totalItems: 57, lowStockItems: 1, value: 145000 }
        }
      },
      stats: {
        todayRevenue: 52800,
        todayOrders: 56,
        todayCustomers: 48,
        weeklyRevenue: 324000,
        weeklyOrders: 345,
        monthlyRevenue: 1296000,
        monthlyOrders: 1380,
        staffCount: 18,
        tableOccupancy: 85
      }
    },
    {
      id: '3',
      name: 'Spice Cloud Kitchen - Bandra',
      address: '789 Bandra West, Near Linking Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      phone: '+91 22 3456 7890',
      email: 'bandra.cloud@spicegarden.com',
      type: 'cloud_kitchen',
      status: 'active',
      gstNumber: '27ABCDE1234F1Z7',
      capacity: 0,
      openingHours: {
        monday: { open: '10:00', close: '22:00', closed: false },
        tuesday: { open: '10:00', close: '22:00', closed: false },
        wednesday: { open: '10:00', close: '22:00', closed: false },
        thursday: { open: '10:00', close: '22:00', closed: false },
        friday: { open: '10:00', close: '22:00', closed: false },
        saturday: { open: '10:00', close: '22:00', closed: false },
        sunday: { open: '10:00', close: '22:00', closed: false }
      },
      manager: {
        id: 'm3',
        name: 'Amit Patel',
        email: 'amit.patel@spicegarden.com',
        phone: '+91 98765 65432'
      },
      inventory: {
        totalItems: 156,
        lowStockItems: 5,
        outOfStockItems: 1,
        totalValue: 278000,
        categories: {
          'vegetables': { totalItems: 32, lowStockItems: 2, value: 32000 },
          'meat': { totalItems: 18, lowStockItems: 1, value: 54000 },
          'dairy': { totalItems: 15, lowStockItems: 1, value: 15000 },
          'grains': { totalItems: 48, lowStockItems: 0, value: 96000 },
          'spices': { totalItems: 43, lowStockItems: 1, value: 81000 }
        }
      },
      stats: {
        todayRevenue: 32400,
        todayOrders: 72,
        todayCustomers: 0,
        weeklyRevenue: 198000,
        weeklyOrders: 432,
        monthlyRevenue: 792000,
        monthlyOrders: 1728,
        staffCount: 8,
        tableOccupancy: 0
      }
    }
  ];

  const inventoryTransfers: InventoryTransfer[] = [
    {
      id: 't1',
      fromLocationId: '1',
      toLocationId: '2',
      itemId: 'item1',
      itemName: 'Basmati Rice',
      quantity: 50,
      status: 'pending',
      requestedAt: '2024-01-15T10:00:00Z',
      requestedBy: 'Rajesh Kumar'
    },
    {
      id: 't2',
      fromLocationId: '2',
      toLocationId: '3',
      itemId: 'item2',
      itemName: 'Chicken Breast',
      quantity: 25,
      status: 'approved',
      requestedAt: '2024-01-14T14:30:00Z',
      approvedAt: '2024-01-14T15:00:00Z',
      requestedBy: 'Priya Sharma',
      approvedBy: 'System Admin'
    },
    {
      id: 't3',
      fromLocationId: '1',
      toLocationId: '3',
      itemId: 'item3',
      itemName: 'Paneer',
      quantity: 30,
      status: 'in_transit',
      requestedAt: '2024-01-13T09:00:00Z',
      approvedAt: '2024-01-13T09:30:00Z',
      requestedBy: 'Rajesh Kumar',
      approvedBy: 'System Admin'
    }
  ];

  const overallStats = {
    totalLocations: locations.length,
    activeLocations: locations.filter(l => l.status === 'active').length,
    totalStaff: locations.reduce((sum, l) => sum + l.stats.staffCount, 0),
    totalInventoryValue: locations.reduce((sum, l) => sum + l.inventory.totalValue, 0),
    todayRevenue: locations.reduce((sum, l) => sum + l.stats.todayRevenue, 0),
    todayOrders: locations.reduce((sum, l) => sum + l.stats.todayOrders, 0),
    lowStockItems: locations.reduce((sum, l) => sum + l.inventory.lowStockItems, 0),
    outOfStockItems: locations.reduce((sum, l) => sum + l.inventory.outOfStockItems, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getTransferStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-blue-500';
      case 'in_transit': return 'bg-purple-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const renderLocationCard = (location: Location) => (
    <Card 
      key={location.id} 
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedLocation === location.id ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => setSelectedLocation(location.id)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">{location.name}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={location.status === 'active' ? 'default' : 'secondary'}>
              {location.status}
            </Badge>
            <Badge variant="outline">{location.type.replace('_', ' ')}</Badge>
          </div>
        </div>
        <CardDescription className="flex items-center space-x-1">
          <MapPin className="h-4 w-4" />
          <span>{location.address}, {location.city}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Today's Revenue</p>
            <p className="font-semibold">₹{location.stats.todayRevenue.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Today's Orders</p>
            <p className="font-semibold">{location.stats.todayOrders}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Staff Count</p>
            <p className="font-semibold">{location.stats.staffCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Low Stock Items</p>
            <p className="font-semibold text-yellow-600">{location.inventory.lowStockItems}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>Manager: {location.manager.name}</span>
          <span>Capacity: {location.capacity > 0 ? `${location.capacity} seats` : 'Cloud Kitchen'}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Multi-Location Management</h2>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsCreatingLocation(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
          <Button variant="outline" onClick={() => setShowTransferDialog(true)}>
            <ArrowRight className="h-4 w-4 mr-2" />
            Inventory Transfer
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Locations</p>
                <p className="text-lg font-bold">{overallStats.totalLocations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Today's Revenue</p>
                <p className="text-lg font-bold">₹{overallStats.todayRevenue.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Inventory Value</p>
                <p className="text-lg font-bold">₹{(overallStats.totalInventoryValue / 100000).toFixed(1)}L</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-lg font-bold">{overallStats.totalStaff}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Locations</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {locations.map(renderLocationCard)}
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {locations.map(location => (
              <Card key={location.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>{location.name} - Inventory</span>
                  </CardTitle>
                  <CardDescription>Current stock levels and values</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-lg font-bold text-green-600">{location.inventory.totalItems}</p>
                        <p className="text-sm text-gray-600">Total Items</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-lg font-bold text-blue-600">
                          ₹{(location.inventory.totalValue / 1000).toFixed(0)}K
                        </p>
                        <p className="text-sm text-gray-600">Total Value</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Low Stock Items:</span>
                        <Badge variant="outline" className="text-yellow-600">
                          {location.inventory.lowStockItems}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Out of Stock:</span>
                        <Badge variant="destructive">
                          {location.inventory.outOfStockItems}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Categories:</p>
                      {Object.entries(location.inventory.categories).map(([category, data]) => (
                        <div key={category} className="flex justify-between items-center text-sm">
                          <span className="capitalize">{category}</span>
                          <span>{data.totalItems} items (₹{(data.value / 1000).toFixed(0)}K)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowRight className="h-5 w-5" />
                <span>Inventory Transfers</span>
              </CardTitle>
              <CardDescription>Track inventory movements between locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventoryTransfers.map(transfer => {
                  const fromLocation = locations.find(l => l.id === transfer.fromLocationId);
                  const toLocation = locations.find(l => l.id === transfer.toLocationId);
                  
                  return (
                    <div key={transfer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getTransferStatusColor(transfer.status)}`} />
                          <span className="text-sm font-medium capitalize">{transfer.status.replace('_', ' ')}</span>
                        </div>
                        <div>
                          <p className="font-medium">{transfer.itemName}</p>
                          <p className="text-sm text-gray-600">
                            {fromLocation?.name} → {toLocation?.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{transfer.quantity} units</p>
                        <p className="text-sm text-gray-600">
                          {new Date(transfer.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Comparison</CardTitle>
                <CardDescription>Performance across all locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {locations.map(location => (
                    <div key={location.id} className="flex justify-between items-center">
                      <span className="text-sm">{location.name}</span>
                      <div className="text-right">
                        <p className="font-semibold">₹{location.stats.todayRevenue.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-gray-600">{location.stats.todayOrders} orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Health</CardTitle>
                <CardDescription>Stock status across locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {locations.map(location => (
                    <div key={location.id} className="flex justify-between items-center">
                      <span className="text-sm">{location.name}</span>
                      <div className="flex items-center space-x-2">
                        {location.inventory.outOfStockItems > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {location.inventory.outOfStockItems} out of stock
                          </Badge>
                        )}
                        {location.inventory.lowStockItems > 0 && (
                          <Badge variant="outline" className="text-xs text-yellow-600">
                            {location.inventory.lowStockItems} low stock
                          </Badge>
                        )}
                        {location.inventory.outOfStockItems === 0 && location.inventory.lowStockItems === 0 && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Location Settings</CardTitle>
              <CardDescription>Configure location-specific settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Inventory Sync Settings</h4>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span>Auto-sync inventory across locations</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span>Enable low stock alerts</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span>Require approval for inventory transfers</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Reporting Settings</h4>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span>Consolidated reports for all locations</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span>Location-specific performance metrics</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span>Automated report scheduling</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">User Permissions</h4>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span>Cross-location access for managers</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span>Location-restricted staff access</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span>Centralized user management</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultiLocationManagement;