'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Store, 
  Coffee, 
  Building, 
  Wine, 
  ShoppingBag, 
  Scissors, 
  Heart, 
  Pill, 
  ShoppingCart, 
  Truck,
  Dumbbell,
  Stethoscope,
  Utensils,
  CheckCircle
} from 'lucide-react'

interface BusinessTypeSelectorProps {
  selectedType?: string
  onTypeSelect: (type: string) => void
  onBusinessInfoSubmit: (info: any) => void
  initialData?: any
}

const businessTypes = [
  {
    id: 'RESTAURANT',
    name: 'Restaurant',
    description: 'Full-service restaurant with dine-in, takeaway, and delivery options',
    icon: Utensils,
    features: ['Table Management', 'Kitchen Display', 'Waiter Staff', 'GST Billing', 'Reservations'],
    orderTypes: ['DINE_IN', 'TAKEAWAY', 'DELIVERY']
  },
  {
    id: 'RETAIL_STORE',
    name: 'Retail Store',
    description: 'General retail store with comprehensive inventory and sales management',
    icon: Store,
    features: ['Inventory Tracking', 'Barcode Scanning', 'Sales Reports', 'Customer Management', 'Supplier Integration'],
    orderTypes: ['IN_STORE']
  },
  {
    id: 'CAFE',
    name: 'Cafe',
    description: 'Coffee shop and quick service restaurant with loyalty programs',
    icon: Coffee,
    features: ['Quick Service', 'Loyalty Program', 'Mobile Orders', 'Takeaway', 'Digital Menu'],
    orderTypes: ['IN_STORE', 'TAKEAWAY']
  },
  {
    id: 'HOTEL',
    name: 'Hotel',
    description: 'Hotel with integrated restaurant, bar, and room service management',
    icon: Building,
    features: ['Room Service', 'Restaurant', 'Bar', 'Billing Integration', 'Guest Management'],
    orderTypes: ['DINE_IN', 'ROOM_SERVICE', 'DELIVERY']
  },
  {
    id: 'BAR',
    name: 'Bar',
    description: 'Bar and pub with comprehensive beverage and tab management',
    icon: Wine,
    features: ['Beverage Inventory', 'Happy Hour', 'Age Verification', 'Tab Management', 'Cocktail Menu'],
    orderTypes: ['DINE_IN', 'TAB']
  },
  {
    id: 'ECOMMERCE',
    name: 'E-commerce',
    description: 'Online store with complete order management and shipping integration',
    icon: ShoppingBag,
    features: ['Online Orders', 'Shipping', 'Payment Gateway', 'Order Tracking', 'Inventory Sync'],
    orderTypes: ['ONLINE', 'DELIVERY']
  },
  {
    id: 'SALON',
    name: 'Salon',
    description: 'Hair salon and beauty services with appointment scheduling',
    icon: Scissors,
    features: ['Appointment Booking', 'Staff Management', 'Service Menu', 'Client History', 'Product Sales'],
    orderTypes: ['APPOINTMENT', 'SERVICE']
  },
  {
    id: 'SPA',
    name: 'Spa',
    description: 'Spa and wellness center with treatment and membership management',
    icon: Heart,
    features: ['Appointment Booking', 'Therapist Management', 'Packages', 'Membership', 'Treatment Tracking'],
    orderTypes: ['APPOINTMENT', 'SERVICE', 'SUBSCRIPTION']
  },
  {
    id: 'PHARMACY',
    name: 'Pharmacy',
    description: 'Pharmacy with prescription management and health record tracking',
    icon: Pill,
    features: ['Prescription Management', 'Inventory Control', 'Insurance Billing', 'Health Records', 'Compliance'],
    orderTypes: ['IN_STORE', 'PRESCRIPTION']
  },
  {
    id: 'GROCERY_STORE',
    name: 'Grocery Store',
    description: 'Supermarket and grocery store with perishable inventory management',
    icon: ShoppingCart,
    features: ['Perishable Inventory', 'Weight Management', 'Loyalty Program', 'Online Orders', 'Supplier Management'],
    orderTypes: ['IN_STORE', 'ONLINE', 'DELIVERY']
  },
  {
    id: 'FOOD_TRUCK',
    name: 'Food Truck',
    description: 'Mobile food service business with location-based operations',
    icon: Truck,
    features: ['Mobile POS', 'Location Tracking', 'Quick Service', 'Cashless Payments', 'Route Management'],
    orderTypes: ['IN_STORE', 'TAKEAWAY']
  },
  {
    id: 'GYM',
    name: 'Gym',
    description: 'Fitness center and gym with membership and class management',
    icon: Dumbbell,
    features: ['Membership Management', 'Class Booking', 'Trainer Scheduling', 'Access Control', 'Progress Tracking'],
    orderTypes: ['SUBSCRIPTION', 'APPOINTMENT']
  },
  {
    id: 'CLINIC',
    name: 'Clinic',
    description: 'Medical clinic and healthcare facility with patient management',
    icon: Stethoscope,
    features: ['Patient Records', 'Appointment Scheduling', 'Medical Billing', 'Insurance', 'Treatment Planning'],
    orderTypes: ['APPOINTMENT', 'SERVICE']
  }
]

export default function BusinessTypeSelector({ 
  selectedType, 
  onTypeSelect, 
  onBusinessInfoSubmit,
  initialData 
}: BusinessTypeSelectorProps) {
  const [selectedBusinessType, setSelectedBusinessType] = useState(selectedType || '')
  const [businessInfo, setBusinessInfo] = useState({
    name: initialData?.name || '',
    address: initialData?.address || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    gstNumber: initialData?.gstNumber || '',
    description: initialData?.description || '',
    currency: initialData?.currency || 'INR',
    timezone: initialData?.timezone || 'Asia/Kolkata'
  })

  const selectedBusiness = businessTypes.find(bt => bt.id === selectedBusinessType)

  const handleTypeSelect = (typeId: string) => {
    setSelectedBusinessType(typeId)
    onTypeSelect(typeId)
  }

  const handleBusinessInfoChange = (field: string, value: string) => {
    setBusinessInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    onBusinessInfoSubmit({
      ...businessInfo,
      businessType: selectedBusinessType
    })
  }

  const isFormValid = selectedBusinessType && 
                    businessInfo.name.trim() && 
                    businessInfo.address.trim() && 
                    businessInfo.phone.trim()

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Choose Your Business Type</h1>
        <p className="text-gray-600">Select the type that best matches your business to get started with the right features</p>
      </div>

      {/* Business Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businessTypes.map((businessType) => {
          const Icon = businessType.icon
          const isSelected = selectedBusinessType === businessType.id
          
          return (
            <Card 
              key={businessType.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''
              }`}
              onClick={() => handleTypeSelect(businessType.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className="h-8 w-8 text-blue-600" />
                  {isSelected && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
                <CardTitle className="text-lg">{businessType.name}</CardTitle>
                <CardDescription className="text-sm">
                  {businessType.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Key Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {businessType.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Order Types:</h4>
                    <div className="flex flex-wrap gap-1">
                      {businessType.orderTypes.map((orderType, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {orderType.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Business Information Form */}
      {selectedBusinessType && (
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Tell us about your {selectedBusiness?.name?.toLowerCase()} to customize your experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={businessInfo.name}
                  onChange={(e) => handleBusinessInfoChange('name', e.target.value)}
                  placeholder="Enter your business name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={businessInfo.phone}
                  onChange={(e) => handleBusinessInfoChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={businessInfo.email}
                  onChange={(e) => handleBusinessInfoChange('email', e.target.value)}
                  placeholder="business@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number (if applicable)</Label>
                <Input
                  id="gstNumber"
                  value={businessInfo.gstNumber}
                  onChange={(e) => handleBusinessInfoChange('gstNumber', e.target.value)}
                  placeholder="27ABCDE1234F1Z5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={businessInfo.currency} onValueChange={(value) => handleBusinessInfoChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="GBP">British Pound (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={businessInfo.timezone} onValueChange={(value) => handleBusinessInfoChange('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">India Standard Time (IST)</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Japan Standard Time (JST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Business Address *</Label>
              <Textarea
                id="address"
                value={businessInfo.address}
                onChange={(e) => handleBusinessInfoChange('address', e.target.value)}
                placeholder="Enter your complete business address"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                value={businessInfo.description}
                onChange={(e) => handleBusinessInfoChange('description', e.target.value)}
                placeholder="Describe your business, services, or specialities"
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmit}
                disabled={!isFormValid}
                className="px-8"
              >
                Continue to Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}