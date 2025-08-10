"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MapPin,
  Star,
  Gift,
  Bell,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Calendar,
  CreditCard,
  MessageSquare,
  Crown,
  Award,
  Target,
  Settings
} from 'lucide-react'

interface Customer {
  id: string
  name: string
  email?: string
  phone: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  latitude?: number
  longitude?: number
  preferredLocationId?: string
  loyaltyPoints: number
  restaurantId: string
  createdAt: string
  updatedAt: string
  orders: Order[]
  loyaltyRewards: LoyaltyReward[]
  customerInsights: CustomerInsight[]
}

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
}

interface LoyaltyReward {
  id: string
  type: 'POINTS' | 'DISCOUNT' | 'FREE_ITEM' | 'CASHBACK'
  name: string
  description?: string
  pointsRequired: number
  value: number
  isRedeemed: boolean
  redeemedAt?: string
  expiresAt?: string
}

interface CustomerInsight {
  id: string
  type: 'PREFERRED_ITEMS' | 'VISIT_PATTERN' | 'SPENDING_BEHAVIOR' | 'FEEDBACK'
  data: string
  confidence: number
  createdAt: string
}

interface LoyaltyProgram {
  id: string
  name: string
  description: string
  type: 'POINTS' | 'TIERED' | 'CASHBACK'
  pointsPerRupee: number
  tiers: LoyaltyTier[]
  isActive: boolean
  createdAt: string
}

interface LoyaltyTier {
  id: string
  name: string
  description: string
  minPoints: number
  maxPoints?: number
  benefits: string[]
  color: string
}

interface NotificationTemplate {
  id: string
  name: string
  type: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH'
  subject?: string
  content: string
  isActive: boolean
  createdAt: string
}

export default function CustomerManagement() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCity, setFilterCity] = useState('all')
  const [filterLoyalty, setFilterLoyalty] = useState('all')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [isSendNotificationOpen, setIsSendNotificationOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  })
  const [notificationData, setNotificationData] = useState({
    type: 'EMAIL',
    subject: '',
    message: '',
    targetCustomers: 'all'
  })

  // Mock data - in real app, this would come from API
  const [customers] = useState<Customer[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+91 9876543210',
      address: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      loyaltyPoints: 1250,
      restaurantId: 'restaurant1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      orders: [
        { id: '1', orderNumber: 'ORD-001', status: 'COMPLETED', totalAmount: 1250, createdAt: '2024-01-15T00:00:00Z' }
      ],
      loyaltyRewards: [
        { id: '1', type: 'DISCOUNT', name: '10% Off', pointsRequired: 500, value: 10, isRedeemed: false }
      ],
      customerInsights: [
        { id: '1', type: 'PREFERRED_ITEMS', data: '["Biryani", "Butter Chicken"]', confidence: 0.85, createdAt: '2024-01-15T00:00:00Z' }
      ]
    }
  ])

  const [loyaltyPrograms] = useState<LoyaltyProgram[]>([
    {
      id: '1',
      name: 'Spice Garden Rewards',
      description: 'Earn points with every purchase and unlock exclusive benefits',
      type: 'TIERED',
      pointsPerRupee: 1,
      tiers: [
        { id: '1', name: 'Bronze', description: 'Entry level rewards', minPoints: 0, maxPoints: 999, benefits: ['5% birthday discount', 'Welcome gift'], color: '#CD7F32' },
        { id: '2', name: 'Silver', description: 'Enhanced benefits', minPoints: 1000, maxPoints: 4999, benefits: ['10% birthday discount', 'Priority seating', 'Free dessert'], color: '#C0C0C0' },
        { id: '3', name: 'Gold', description: 'Premium benefits', minPoints: 5000, benefits: ['15% birthday discount', 'VIP seating', 'Free main course', 'Exclusive events'], color: '#FFD700' }
      ],
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    }
  ])

  const [notificationTemplates] = useState<NotificationTemplate[]>([
    { id: '1', name: 'Welcome Email', type: 'EMAIL', subject: 'Welcome to Spice Garden!', content: 'Thank you for joining us...', isActive: true, createdAt: '2024-01-01T00:00:00Z' },
    { id: '2', name: 'Birthday Offer', type: 'SMS', content: 'Happy birthday! Enjoy 15% off on your special day...', isActive: true, createdAt: '2024-01-01T00:00:00Z' }
  ])

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm)
    
    const matchesCity = filterCity === 'all' || customer.city === filterCity
    const matchesLoyalty = filterLoyalty === 'all' || 
                          (filterLoyalty === 'bronze' && customer.loyaltyPoints < 1000) ||
                          (filterLoyalty === 'silver' && customer.loyaltyPoints >= 1000 && customer.loyaltyPoints < 5000) ||
                          (filterLoyalty === 'gold' && customer.loyaltyPoints >= 5000)

    return matchesSearch && matchesCity && matchesLoyalty
  })

  // Get customer loyalty tier
  const getCustomerTier = (points: number) => {
    if (points >= 5000) return { name: 'Gold', color: '#FFD700', icon: Crown }
    if (points >= 1000) return { name: 'Silver', color: '#C0C0C0', icon: Star }
    return { name: 'Bronze', color: '#CD7F32', icon: Award }
  }

  // Get customer statistics
  const totalCustomers = customers.length
  const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0)
  const averageOrdersPerCustomer = customers.reduce((sum, c) => sum + c.orders.length, 0) / totalCustomers || 0
  const topCustomers = customers.sort((a, b) => b.loyaltyPoints - a.loyaltyPoints).slice(0, 5)

  // Add customer
  const handleAddCustomer = async () => {
    try {
      // In real app, this would call API
      console.log('Adding customer:', newCustomer)
      setIsAddCustomerOpen(false)
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
      })
    } catch (error) {
      console.error('Error adding customer:', error)
    }
  }

  // Send notification
  const handleSendNotification = async () => {
    try {
      // In real app, this would call notification service
      console.log('Sending notification:', notificationData)
      setIsSendNotificationOpen(false)
      setNotificationData({
        type: 'EMAIL',
        subject: '',
        message: '',
        targetCustomers: 'all'
      })
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-gray-600">Manage customers, loyalty programs, and communications</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddCustomerOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
          <Button onClick={() => setIsSendNotificationOpen(true)}>
            <Bell className="mr-2 h-4 w-4" />
            Send Notification
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{totalLoyaltyPoints.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">Total points earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Orders/Customer</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{averageOrdersPerCustomer.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Average orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <Gift className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{loyaltyPrograms.filter(p => p.isActive).length}</div>
            <p className="text-xs text-muted-foreground">Loyalty programs</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty Programs</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="insights">Customer Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Customers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>Customers with highest loyalty points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCustomers.map((customer, index) => {
                    const tier = getCustomerTier(customer.loyaltyPoints)
                    const TierIcon = tier.icon
                    return (
                      <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium">#{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <TierIcon className="h-4 w-4" style={{ color: tier.color }} />
                            <span className="text-sm font-medium" style={{ color: tier.color }}>
                              {tier.name}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">{customer.loyaltyPoints} pts</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Loyalty Programs Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Loyalty Programs</CardTitle>
                <CardDescription>Active customer loyalty programs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loyaltyPrograms.filter(p => p.isActive).map((program) => (
                    <div key={program.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{program.name}</h3>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{program.description}</p>
                      <div className="flex gap-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {program.pointsPerRupee} point/₹
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {program.tiers.length} tiers
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCity} onValueChange={setFilterCity}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                <SelectItem value="Mumbai">Mumbai</SelectItem>
                <SelectItem value="Delhi">Delhi</SelectItem>
                <SelectItem value="Bangalore">Bangalore</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterLoyalty} onValueChange={setFilterLoyalty}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Loyalty Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Customers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Customers</CardTitle>
              <CardDescription>Manage customer profiles and information</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Loyalty Points</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => {
                    const tier = getCustomerTier(customer.loyaltyPoints)
                    const TierIcon = tier.icon
                    return (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span className="text-sm">{customer.phone}</span>
                            </div>
                            {customer.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="text-sm text-gray-500">{customer.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="text-sm">{customer.city}, {customer.state}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-600" />
                            <span className="font-medium">{customer.loyaltyPoints}</span>
                          </div>
                        </TableCell>
                        <TableCell>{customer.orders.length}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TierIcon className="h-4 w-4" style={{ color: tier.color }} />
                            <span className="text-sm font-medium" style={{ color: tier.color }}>
                              {tier.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCustomer(customer)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Programs */}
            <Card>
              <CardHeader>
                <CardTitle>Active Loyalty Programs</CardTitle>
                <CardDescription>Current customer loyalty programs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loyaltyPrograms.filter(p => p.isActive).map((program) => (
                    <div key={program.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{program.name}</h3>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{program.description}</p>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Tiers:</div>
                        {program.tiers.map((tier) => (
                          <div key={tier.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: tier.color }}
                              />
                              <span className="text-sm font-medium">{tier.name}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {tier.minPoints}+ points
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Earn Rate:</span> {program.pointsPerRupee} point per ₹1 spent
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Program Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Program Settings</CardTitle>
                <CardDescription>Configure loyalty program parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Points Configuration</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Points per ₹100 spent:</span>
                        <span className="font-medium">100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Point value:</span>
                        <span className="font-medium">₹1.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expiry period:</span>
                        <span className="font-medium">12 months</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Redemption Options</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Checkbox checked />
                        <span>Discount vouchers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked />
                        <span>Free menu items</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked />
                        <span>Cashback</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Configure Programs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notification Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Templates</CardTitle>
                <CardDescription>Pre-built notification templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notificationTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {template.type === 'EMAIL' && <Mail className="h-4 w-4" />}
                          {template.type === 'SMS' && <MessageSquare className="h-4 w-4" />}
                          {template.type === 'WHATSAPP' && <MessageSquare className="h-4 w-4" />}
                          {template.type === 'PUSH' && <Bell className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-500">{template.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={template.isActive ? 'default' : 'secondary'}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Notification History</CardTitle>
                <CardDescription>Recently sent notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Welcome Email</div>
                        <div className="text-sm text-gray-500">Sent to 5 customers</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">2 hours ago</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Birthday Offer</div>
                        <div className="text-sm text-gray-500">Sent to 12 customers</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">1 day ago</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="h-4 w-4" />
                      <div>
                        <div className="font-medium">New Menu Alert</div>
                        <div className="text-sm text-gray-500">Sent to 150 customers</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">3 days ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Insights</CardTitle>
              <CardDescription>AI-powered customer behavior analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">Preferred Items</h3>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>• Biryani (45% of customers)</div>
                    <div>• Butter Chicken (32% of customers)</div>
                    <div>• Naan (28% of customers)</div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium">Visit Patterns</h3>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>• Peak: Friday-Sunday</div>
                    <div>• Avg. Visit: 2.3 times/month</div>
                    <div>• Best Time: 7-9 PM</div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    <h3 className="font-medium">Spending Behavior</h3>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>• Avg. Order: ₹1,250</div>
                    <div>• High Spenders: 18%</div>
                    <div>• Budget Conscious: 35%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Customer Dialog */}
      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>Enter customer details to create a new profile</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input
                id="email"
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Phone</Label>
              <Input
                id="phone"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">Address</Label>
              <Input
                id="address"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">City</Label>
              <Input
                id="city"
                value={newCustomer.city}
                onChange={(e) => setNewCustomer({...newCustomer, city: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="state" className="text-right">State</Label>
              <Input
                id="state"
                value={newCustomer.state}
                onChange={(e) => setNewCustomer({...newCustomer, state: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pincode" className="text-right">Pincode</Label>
              <Input
                id="pincode"
                value={newCustomer.pincode}
                onChange={(e) => setNewCustomer({...newCustomer, pincode: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCustomerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomer}>Add Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Notification Dialog */}
      <Dialog open={isSendNotificationOpen} onOpenChange={setIsSendNotificationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>Send a notification to customers</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notificationType">Notification Type</Label>
              <Select value={notificationData.type} onValueChange={(value) => setNotificationData({...notificationData, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="PUSH">Push Notification</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {notificationData.type === 'EMAIL' && (
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={notificationData.subject}
                  onChange={(e) => setNotificationData({...notificationData, subject: e.target.value})}
                  placeholder="Enter subject"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={notificationData.message}
                onChange={(e) => setNotificationData({...notificationData, message: e.target.value})}
                placeholder="Enter your message..."
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="targetCustomers">Target Customers</Label>
              <Select value={notificationData.targetCustomers} onValueChange={(value) => setNotificationData({...notificationData, targetCustomers: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="loyalty">Loyalty Members</SelectItem>
                  <SelectItem value="recent">Recent Customers</SelectItem>
                  <SelectItem value="inactive">Inactive Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendNotificationOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendNotification}>Send Notification</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}