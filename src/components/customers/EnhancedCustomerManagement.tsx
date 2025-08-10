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
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Star,
  Phone,
  MapPin,
  Mail,
  Calendar,
  Heart,
  Scissors,
  Pill,
  Dumbbell,
  Stethoscope,
  Coffee,
  Building,
  Wine,
  Store,
  ShoppingBag,
  Users,
  Award,
  Gift,
  TrendingUp
} from 'lucide-react'
import { useCustomers } from '@/hooks'
import CustomerNotes from './CustomerNotes'

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
  membershipLevel?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
  restaurantId: string
  createdAt: string
  updatedAt: string
  totalSpent: number
  visitCount: number
  lastVisit: string
  preferences?: string[]
  medicalHistory?: string[]
  fitnessGoals?: string[]
  subscriptionStatus?: 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
  appointments?: Appointment[]
  prescriptions?: Prescription[]
}

interface Appointment {
  id: string
  date: string
  service: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  staff: string
}

interface Prescription {
  id: string
  date: string
  medication: string
  dosage: string
  doctor: string
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED'
}

interface LoyaltyProgram {
  id: string
  name: string
  points: number
  tier: string
  benefits: string[]
}

export default function EnhancedCustomerManagement() {
  const [activeTab, setActiveTab] = useState('customers')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [loyaltyDialogOpen, setLoyaltyDialogOpen] = useState(false)
  
  const { data: customers = [], refetch } = useCustomers()

  // Mock loyalty programs
  const loyaltyPrograms: LoyaltyProgram[] = [
    {
      id: '1',
      name: 'Basic Rewards',
      points: 100,
      tier: 'Bronze',
      benefits: ['5% discount on birthday', 'Welcome gift']
    },
    {
      id: '2',
      name: 'Silver Club',
      points: 500,
      tier: 'Silver',
      benefits: ['10% discount', 'Priority service', 'Birthday treat']
    },
    {
      id: '3',
      name: 'Gold Elite',
      points: 1000,
      tier: 'Gold',
      benefits: ['15% discount', 'Free delivery', 'Exclusive events']
    },
    {
      id: '4',
      name: 'Platinum VIP',
      points: 2500,
      tier: 'Platinum',
      benefits: ['20% discount', 'Personal assistant', 'VIP access']
    }
  ]

  // Filter customers based on search and type
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm)
    
    const matchesType = filterType === 'all' || 
                        (filterType === 'loyalty' && customer.loyaltyPoints > 0) ||
                        (filterType === 'new' && new Date(customer.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
                        (filterType === 'vip' && ['GOLD', 'PLATINUM'].includes(customer.membershipLevel || ''))
    
    return matchesSearch && matchesType
  })

  // Get membership tier info
  const getMembershipInfo = (level?: string) => {
    const tierMap = {
      'BRONZE': { color: 'bg-orange-500 text-white', icon: Star, label: 'Bronze' },
      'SILVER': { color: 'bg-gray-400 text-white', icon: Star, label: 'Silver' },
      'GOLD': { color: 'bg-yellow-500 text-white', icon: Star, label: 'Gold' },
      'PLATINUM': { color: 'bg-purple-500 text-white', icon: Star, label: 'Platinum' }
    }
    return tierMap[level as keyof typeof tierMap] || { color: 'bg-gray-200 text-gray-700', icon: Star, label: 'Basic' }
  }

  // Get customer type specific features
  const getCustomerFeatures = () => {
    // This would typically come from the business settings
    return {
      hasLoyalty: true,
      hasAppointments: true,
      hasPrescriptions: true,
      hasSubscriptions: true,
      hasMedicalHistory: true,
      hasFitnessTracking: true
    }
  }

  const features = getCustomerFeatures()

  // Calculate customer statistics
  const totalCustomers = customers.length
  const loyalCustomers = customers.filter(c => c.loyaltyPoints > 0).length
  const vipCustomers = customers.filter(c => ['GOLD', 'PLATINUM'].includes(c.membershipLevel || '')).length
  const newCustomers = customers.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Customer Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Manage customer relationships and loyalty programs</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
          {features.hasLoyalty && (
            <Button 
              onClick={() => setLoyaltyDialogOpen(true)}
              variant="outline"
            >
              <Star className="mr-2 h-4 w-4" />
              Loyalty Programs
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>

        {features.hasLoyalty && (
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loyalty Members</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{loyalCustomers}</div>
              <p className="text-xs text-muted-foreground">Active loyalty program</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Customers</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{vipCustomers}</div>
            <p className="text-xs text-muted-foreground">Gold & Platinum members</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{newCustomers}</div>
            <p className="text-xs text-muted-foreground">New customers</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">Customer lifetime value</p>
          </CardContent>
        </Card>
      </div>

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
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {features.hasLoyalty && <SelectItem value="loyalty">Loyalty Members</SelectItem>}
            <SelectItem value="new">New Customers</SelectItem>
            <SelectItem value="vip">VIP Customers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          {features.hasLoyalty && (
            <TabsTrigger value="loyalty">Loyalty Program</TabsTrigger>
          )}
          {features.hasAppointments && (
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          )}
          {features.hasPrescriptions && (
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          )}
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Customer Directory</CardTitle>
              <CardDescription>View and manage all customer information</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Loyalty</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Visits</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => {
                    const membershipInfo = getMembershipInfo(customer.membershipLevel)
                    const MembershipIcon = membershipInfo.icon
                    return (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {customer.name}
                              {customer.membershipLevel && (
                                <Badge className={membershipInfo.color}>
                                  <MembershipIcon className="h-3 w-3 mr-1" />
                                  {membershipInfo.label}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">Member since {new Date(customer.createdAt).toLocaleDateString()}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{customer.phone}</span>
                            </div>
                            {customer.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{customer.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {customer.city || 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{customer.loyaltyPoints}</span>
                          </div>
                        </TableCell>
                        <TableCell>₹{customer.totalSpent.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{customer.visitCount}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedCustomer(customer)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCustomer(customer)}
                            >
                              <Eye className="h-4 w-4" />
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

        {features.hasLoyalty && (
          <TabsContent value="loyalty" className="space-y-4">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Loyalty Programs</CardTitle>
                <CardDescription>Manage customer loyalty programs and rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {loyaltyPrograms.map((program) => (
                    <Card key={program.id} className="border-slate-200 dark:border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">{program.name}</h3>
                          <Badge className="bg-yellow-500 text-white">{program.tier}</Badge>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{program.points} points</span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Benefits:</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {program.benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center gap-1">
                                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {features.hasAppointments && (
          <TabsContent value="appointments" className="space-y-4">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Customer Appointments</CardTitle>
                <CardDescription>Manage and track customer appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Appointment management features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {features.hasPrescriptions && (
          <TabsContent value="prescriptions" className="space-y-4">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Customer Prescriptions</CardTitle>
                <CardDescription>Manage customer prescriptions and medical records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Prescription management features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        <TabsContent value="notes" className="space-y-4">
          <CustomerNotes />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Customer Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false)
          setIsEditDialogOpen(false)
          setSelectedCustomer(null)
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? 'Edit Customer' : 'Add New Customer'}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen ? 'Update customer information' : 'Add a new customer to your database'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" placeholder="John Doe" />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" placeholder="+91 98765 43210" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="john@example.com" />
              </div>
              <div>
                <Label htmlFor="pincode">PIN Code</Label>
                <Input id="pincode" placeholder="400001" />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" placeholder="Enter complete address" rows={3} />
            </div>
            {features.hasLoyalty && (
              <div>
                <Label htmlFor="loyaltyPoints">Initial Loyalty Points</Label>
                <Input id="loyaltyPoints" type="number" placeholder="0" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Mumbai" />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input id="state" placeholder="Maharashtra" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false)
              setIsEditDialogOpen(false)
              setSelectedCustomer(null)
            }}>
              Cancel
            </Button>
            <Button>
              {isEditDialogOpen ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loyalty Programs Dialog */}
      <Dialog open={loyaltyDialogOpen} onOpenChange={setLoyaltyDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Loyalty Programs Management</DialogTitle>
            <DialogDescription>Configure and manage loyalty programs</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loyaltyPrograms.map((program) => (
                <Card key={program.id} className="border-slate-200 dark:border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{program.name}</h3>
                      <Badge className="bg-yellow-500 text-white">{program.tier}</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{program.points} points required</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Benefits:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {program.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoyaltyDialogOpen(false)}>
              Close
            </Button>
            <Button>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}