"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { 
  Utensils, 
  Car, 
  Home, 
  Users, 
  Clock, 
  MapPin, 
  Phone, 
  Plus, 
  Trash2, 
  Settings,
  CheckCircle,
  AlertTriangle,
  Timer,
  Navigation,
  CreditCard
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DiningOption {
  id: string
  name: string
  type: 'dine_in' | 'takeaway' | 'delivery'
  description: string
  isActive: boolean
  icon: string
  settings: DiningOptionSettings
  orderCount: number
  revenue: number
}

interface DiningOptionSettings {
  preparationTime: number // in minutes
  minimumOrder?: number
  deliveryFee?: number
  deliveryRadius?: number // in kilometers
  requiresAddress?: boolean
  requiresPhone?: boolean
  requiresPrepayment?: boolean
  timeSlots?: TimeSlot[]
  specialInstructions?: string
}

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  maxOrders: number
  isActive: boolean
}

interface DeliveryZone {
  id: string
  name: string
  pincode: string
  area: string
  deliveryFee: number
  estimatedTime: number
  minOrderAmount: number
  isActive: boolean
}

interface Table {
  id: string
  number: number
  capacity: number
  status: 'available' | 'occupied' | 'reserved' | 'maintenance'
  location: string
  isActive: boolean
}

export default function DiningOptions() {
  const [diningOptions, setDiningOptions] = useState<DiningOption[]>([
    {
      id: '1',
      name: 'Dine In',
      type: 'dine_in',
      description: 'Enjoy your meal at our restaurant',
      isActive: true,
      icon: 'Utensils',
      settings: {
        preparationTime: 20,
        requiresAddress: false,
        requiresPhone: true,
        requiresPrepayment: false,
        specialInstructions: 'Please arrive 5 minutes before your reservation time'
      },
      orderCount: 156,
      revenue: 125000
    },
    {
      id: '2',
      name: 'Takeaway',
      type: 'takeaway',
      description: 'Order now and pick up at your convenience',
      isActive: true,
      icon: 'Car',
      settings: {
        preparationTime: 15,
        minimumOrder: 100,
        requiresAddress: false,
        requiresPhone: true,
        requiresPrepayment: false,
        specialInstructions: 'Bring your order confirmation for faster pickup'
      },
      orderCount: 89,
      revenue: 45000
    },
    {
      id: '3',
      name: 'Delivery',
      type: 'delivery',
      description: 'Get your favorite food delivered to your doorstep',
      isActive: true,
      icon: 'Home',
      settings: {
        preparationTime: 30,
        minimumOrder: 200,
        deliveryFee: 50,
        deliveryRadius: 5,
        requiresAddress: true,
        requiresPhone: true,
        requiresPrepayment: true,
        specialInstructions: 'Delivery partner will call you when they arrive'
      },
      orderCount: 234,
      revenue: 187000
    }
  ])

  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([
    {
      id: '1',
      name: 'Central Zone',
      pincode: '400001',
      area: 'Downtown Area',
      deliveryFee: 50,
      estimatedTime: 30,
      minOrderAmount: 200,
      isActive: true
    },
    {
      id: '2',
      name: 'North Zone',
      pincode: '400002',
      area: 'North District',
      deliveryFee: 80,
      estimatedTime: 45,
      minOrderAmount: 300,
      isActive: true
    },
    {
      id: '3',
      name: 'South Zone',
      pincode: '400003',
      area: 'South District',
      deliveryFee: 60,
      estimatedTime: 35,
      minOrderAmount: 250,
      isActive: false
    }
  ])

  const [tables, setTables] = useState<Table[]>([
    { id: '1', number: 1, capacity: 2, status: 'available', location: 'Window Area', isActive: true },
    { id: '2', number: 2, capacity: 4, status: 'occupied', location: 'Window Area', isActive: true },
    { id: '3', number: 3, capacity: 4, status: 'available', location: 'Center Area', isActive: true },
    { id: '4', number: 4, capacity: 6, status: 'reserved', location: 'Center Area', isActive: true },
    { id: '5', number: 5, capacity: 8, status: 'available', location: 'Private Room', isActive: true },
    { id: '6', number: 6, capacity: 2, status: 'maintenance', location: 'Window Area', isActive: false }
  ])

  const [selectedOption, setSelectedOption] = useState<string>('dine_in')
  const [isAddingZone, setIsAddingZone] = useState(false)
  const [newZone, setNewZone] = useState<Partial<DeliveryZone>>({
    name: '',
    pincode: '',
    area: '',
    deliveryFee: 0,
    estimatedTime: 30,
    minOrderAmount: 200,
    isActive: true
  })
  const { toast } = useToast()

  const handleToggleOption = (optionId: string) => {
    setDiningOptions(prev => prev.map(option => 
      option.id === optionId ? { ...option, isActive: !option.isActive } : option
    ))

    const option = diningOptions.find(o => o.id === optionId)
    toast({
      title: option?.isActive ? "Option Disabled" : "Option Enabled",
      description: `${option?.name} has been ${option?.isActive ? 'disabled' : 'enabled'}.`
    })
  }

  const handleUpdateSettings = (optionId: string, settings: Partial<DiningOptionSettings>) => {
    setDiningOptions(prev => prev.map(option => 
      option.id === optionId ? { ...option, settings: { ...option.settings, ...settings } } : option
    ))

    toast({
      title: "Settings Updated",
      description: "Dining option settings have been updated successfully."
    })
  }

  const handleAddDeliveryZone = () => {
    if (!newZone.name || !newZone.pincode || !newZone.area) {
      toast({
        title: "Validation Error",
        description: "Zone name, pincode, and area are required.",
        variant: "destructive"
      })
      return
    }

    const zone: DeliveryZone = {
      id: Date.now().toString(),
      name: newZone.name!,
      pincode: newZone.pincode!,
      area: newZone.area!,
      deliveryFee: newZone.deliveryFee!,
      estimatedTime: newZone.estimatedTime!,
      minOrderAmount: newZone.minOrderAmount!,
      isActive: newZone.isActive!
    }

    setDeliveryZones(prev => [...prev, zone])
    setIsAddingZone(false)
    setNewZone({
      name: '',
      pincode: '',
      area: '',
      deliveryFee: 0,
      estimatedTime: 30,
      minOrderAmount: 200,
      isActive: true
    })

    toast({
      title: "Delivery Zone Added",
      description: "New delivery zone has been added successfully."
    })
  }

  const handleDeleteDeliveryZone = (zoneId: string) => {
    setDeliveryZones(prev => prev.filter(zone => zone.id !== zoneId))
    toast({
      title: "Delivery Zone Removed",
      description: "Delivery zone has been removed successfully."
    })
  }

  const handleToggleDeliveryZone = (zoneId: string) => {
    setDeliveryZones(prev => prev.map(zone => 
      zone.id === zoneId ? { ...zone, isActive: !zone.isActive } : zone
    ))

    const zone = deliveryZones.find(z => z.id === zoneId)
    toast({
      title: zone?.isActive ? "Zone Disabled" : "Zone Enabled",
      description: `Delivery zone has been ${zone?.isActive ? 'disabled' : 'enabled'}.`
    })
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Utensils': return <Utensils className="h-5 w-5" />
      case 'Car': return <Car className="h-5 w-5" />
      case 'Home': return <Home className="h-5 w-5" />
      default: return <Utensils className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500'
      case 'occupied': return 'bg-red-500'
      case 'reserved': return 'bg-yellow-500'
      case 'maintenance': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-50'
      case 'occupied': return 'text-red-600 bg-red-50'
      case 'reserved': return 'text-yellow-600 bg-yellow-50'
      case 'maintenance': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const selectedDiningOption = diningOptions.find(option => option.type === selectedOption)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dining Options</h2>
          <p className="text-gray-600">Configure dining, takeaway, and delivery options</p>
        </div>
      </div>

      <Tabs value={selectedOption} onValueChange={setSelectedOption}>
        <TabsList className="grid w-full grid-cols-3">
          {diningOptions.map((option) => (
            <TabsTrigger key={option.id} value={option.type} className="flex items-center gap-2">
              {getIconComponent(option.icon)}
              <span>{option.name}</span>
              {!option.isActive && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
            </TabsTrigger>
          ))}
        </TabsList>

        {diningOptions.map((option) => (
          <TabsContent key={option.id} value={option.type} className="space-y-6">
            {/* Option Overview */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{option.name}</CardTitle>
                      <Badge className={option.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                        {option.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription>{option.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={option.isActive}
                      onCheckedChange={() => handleToggleOption(option.id)}
                    />
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Orders</div>
                      <div className="text-lg font-semibold">{option.orderCount}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Revenue</div>
                      <div className="text-lg font-semibold">₹{option.revenue.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Configure {option.name.toLowerCase()} options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="preparation-time">Preparation Time (minutes)</Label>
                      <Input
                        id="preparation-time"
                        type="number"
                        value={option.settings.preparationTime}
                        onChange={(e) => handleUpdateSettings(option.id, { preparationTime: parseInt(e.target.value) })}
                      />
                      <p className="text-sm text-gray-500">Average time to prepare orders</p>
                    </div>

                    {option.type === 'takeaway' && (
                      <div className="space-y-2">
                        <Label htmlFor="min-order">Minimum Order Amount (₹)</Label>
                        <Input
                          id="min-order"
                          type="number"
                          value={option.settings.minimumOrder || ''}
                          onChange={(e) => handleUpdateSettings(option.id, { minimumOrder: parseInt(e.target.value) })}
                        />
                        <p className="text-sm text-gray-500">Minimum order value for takeaway</p>
                      </div>
                    )}

                    {option.type === 'delivery' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="delivery-fee">Delivery Fee (₹)</Label>
                          <Input
                            id="delivery-fee"
                            type="number"
                            value={option.settings.deliveryFee || ''}
                            onChange={(e) => handleUpdateSettings(option.id, { deliveryFee: parseInt(e.target.value) })}
                          />
                          <p className="text-sm text-gray-500">Standard delivery charge</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="delivery-radius">Delivery Radius (km)</Label>
                          <Input
                            id="delivery-radius"
                            type="number"
                            value={option.settings.deliveryRadius || ''}
                            onChange={(e) => handleUpdateSettings(option.id, { deliveryRadius: parseInt(e.target.value) })}
                          />
                          <p className="text-sm text-gray-500">Maximum delivery distance</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="min-delivery-order">Minimum Order Amount (₹)</Label>
                          <Input
                            id="min-delivery-order"
                            type="number"
                            value={option.settings.minimumOrder || ''}
                            onChange={(e) => handleUpdateSettings(option.id, { minimumOrder: parseInt(e.target.value) })}
                          />
                          <p className="text-sm text-gray-500">Minimum order for delivery</p>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="special-instructions">Special Instructions</Label>
                      <Textarea
                        id="special-instructions"
                        value={option.settings.specialInstructions || ''}
                        onChange={(e) => handleUpdateSettings(option.id, { specialInstructions: e.target.value })}
                        placeholder="Enter special instructions for customers"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label>Requirements</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Phone Number Required</span>
                          <Switch
                            checked={option.settings.requiresPhone}
                            onCheckedChange={(checked) => handleUpdateSettings(option.id, { requiresPhone: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Address Required</span>
                          <Switch
                            checked={option.settings.requiresAddress || false}
                            onCheckedChange={(checked) => handleUpdateSettings(option.id, { requiresAddress: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Prepayment Required</span>
                          <Switch
                            checked={option.settings.requiresPrepayment || false}
                            onCheckedChange={(checked) => handleUpdateSettings(option.id, { requiresPrepayment: checked })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Timer className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Order Timeline</span>
                      </div>
                      <div className="space-y-1 text-sm text-blue-700">
                        <div>• Order placed: Immediate</div>
                        <div>• Preparation: {option.settings.preparationTime} minutes</div>
                        {option.type === 'delivery' && (
                          <div>• Delivery: {option.settings.deliveryRadius}km radius</div>
                        )}
                        <div>• Total time: {option.settings.preparationTime + (option.type === 'delivery' ? 15 : 0)} minutes</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Zones (only for delivery option) */}
            {option.type === 'delivery' && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Delivery Zones</CardTitle>
                      <CardDescription>Manage delivery areas and pricing</CardDescription>
                    </div>
                    <Button onClick={() => setIsAddingZone(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Zone
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {deliveryZones.map((zone) => (
                      <div key={zone.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{zone.name}</span>
                            <Badge className={zone.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                              {zone.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {zone.area} • {zone.pincode}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Navigation className="h-4 w-4" />
                              {zone.estimatedTime} min
                            </span>
                            <span className="flex items-center gap-1">
                              <CreditCard className="h-4 w-4" />
                              ₹{zone.deliveryFee}
                            </span>
                            <span className="flex items-center gap-1">
                              Min: ₹{zone.minOrderAmount}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={zone.isActive}
                            onCheckedChange={() => handleToggleDeliveryZone(zone.id)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteDeliveryZone(zone.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {isAddingZone && (
                    <Card className="border-2 border-dashed border-gray-300 mt-4">
                      <CardHeader>
                        <CardTitle>Add New Delivery Zone</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="zone-name">Zone Name</Label>
                            <Input
                              id="zone-name"
                              value={newZone.name}
                              onChange={(e) => setNewZone(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter zone name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zone-pincode">Pincode</Label>
                            <Input
                              id="zone-pincode"
                              value={newZone.pincode}
                              onChange={(e) => setNewZone(prev => ({ ...prev, pincode: e.target.value }))}
                              placeholder="Enter pincode"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zone-area">Area</Label>
                            <Input
                              id="zone-area"
                              value={newZone.area}
                              onChange={(e) => setNewZone(prev => ({ ...prev, area: e.target.value }))}
                              placeholder="Enter area name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zone-delivery-fee">Delivery Fee (₹)</Label>
                            <Input
                              id="zone-delivery-fee"
                              type="number"
                              value={newZone.deliveryFee}
                              onChange={(e) => setNewZone(prev => ({ ...prev, deliveryFee: parseInt(e.target.value) }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zone-estimated-time">Estimated Time (minutes)</Label>
                            <Input
                              id="zone-estimated-time"
                              type="number"
                              value={newZone.estimatedTime}
                              onChange={(e) => setNewZone(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zone-min-order">Minimum Order (₹)</Label>
                            <Input
                              id="zone-min-order"
                              type="number"
                              value={newZone.minOrderAmount}
                              onChange={(e) => setNewZone(prev => ({ ...prev, minOrderAmount: parseInt(e.target.value) }))}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleAddDeliveryZone}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Zone
                          </Button>
                          <Button variant="outline" onClick={() => setIsAddingZone(false)}>
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tables (only for dine-in option) */}
            {option.type === 'dine_in' && (
              <Card>
                <CardHeader>
                  <CardTitle>Table Management</CardTitle>
                  <CardDescription>Manage restaurant tables and seating</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tables.filter(table => table.isActive).map((table) => (
                      <Card key={table.id} className={`border-l-4 ${table.status === 'available' ? 'border-l-green-500' : table.status === 'occupied' ? 'border-l-red-500' : table.status === 'reserved' ? 'border-l-yellow-500' : 'border-l-gray-500'}`}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium">Table {table.number}</div>
                              <div className="text-sm text-gray-500">{table.location}</div>
                            </div>
                            <Badge className={getTableStatusColor(table.status)}>
                              {table.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Users className="h-4 w-4" />
                            <span>{table.capacity} seats</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}