'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Settings, Save, RefreshCw } from 'lucide-react'

interface BusinessSettingsProps {
  restaurantId: string
  initialSettings?: any
  onSettingsUpdate: (settings: any) => void
}

const businessTypeConfig = {
  RESTAURANT: {
    defaultFeatures: {
      enableGST: true,
      enableInventory: true,
      enableTables: true,
      enableAppointments: false,
      enableServices: false,
      enableSubscriptions: false,
      enableLoyalty: true,
      enableDelivery: true,
      gstRate: 0.05
    },
    availableOrderTypes: ['DINE_IN', 'TAKEAWAY', 'DELIVERY'],
    customFields: ['tableNumber', 'specialInstructions', 'allergenInfo']
  },
  RETAIL_STORE: {
    defaultFeatures: {
      enableGST: true,
      enableInventory: true,
      enableTables: false,
      enableAppointments: false,
      enableServices: false,
      enableSubscriptions: false,
      enableLoyalty: true,
      enableDelivery: false,
      gstRate: 0.05
    },
    availableOrderTypes: ['IN_STORE'],
    customFields: ['sku', 'barcode', 'weight', 'size']
  },
  CAFE: {
    defaultFeatures: {
      enableGST: true,
      enableInventory: true,
      enableTables: false,
      enableAppointments: false,
      enableServices: false,
      enableSubscriptions: false,
      enableLoyalty: true,
      enableDelivery: true,
      gstRate: 0.05
    },
    availableOrderTypes: ['IN_STORE', 'TAKEAWAY'],
    customFields: ['customizations', 'temperature', 'pickupTime']
  },
  HOTEL: {
    defaultFeatures: {
      enableGST: true,
      enableInventory: true,
      enableTables: true,
      enableAppointments: false,
      enableServices: true,
      enableSubscriptions: false,
      enableLoyalty: true,
      enableDelivery: true,
      gstRate: 0.05
    },
    availableOrderTypes: ['DINE_IN', 'ROOM_SERVICE', 'DELIVERY'],
    customFields: ['roomNumber', 'guestName', 'specialRequests']
  },
  BAR: {
    defaultFeatures: {
      enableGST: true,
      enableInventory: true,
      enableTables: true,
      enableAppointments: false,
      enableServices: false,
      enableSubscriptions: false,
      enableLoyalty: true,
      enableDelivery: false,
      gstRate: 0.05
    },
    availableOrderTypes: ['DINE_IN', 'TAB'],
    customFields: ['tabNumber', 'ageVerified', 'drinkPreferences']
  },
  ECOMMERCE: {
    defaultFeatures: {
      enableGST: true,
      enableInventory: true,
      enableTables: false,
      enableAppointments: false,
      enableServices: false,
      enableSubscriptions: true,
      enableLoyalty: true,
      enableDelivery: true,
      gstRate: 0.05
    },
    availableOrderTypes: ['ONLINE', 'DELIVERY'],
    customFields: ['shippingAddress', 'trackingNumber', 'giftWrap']
  },
  SALON: {
    defaultFeatures: {
      enableGST: true,
      enableInventory: false,
      enableTables: false,
      enableAppointments: true,
      enableServices: true,
      enableSubscriptions: false,
      enableLoyalty: true,
      enableDelivery: false,
      gstRate: 0.05
    },
    availableOrderTypes: ['APPOINTMENT', 'SERVICE'],
    customFields: ['stylist', 'serviceDuration', 'clientNotes']
  },
  SPA: {
    defaultFeatures: {
      enableGST: true,
      enableInventory: false,
      enableTables: false,
      enableAppointments: true,
      enableServices: true,
      enableSubscriptions: true,
      enableLoyalty: true,
      enableDelivery: false,
      gstRate: 0.05
    },
    availableOrderTypes: ['APPOINTMENT', 'SERVICE', 'SUBSCRIPTION'],
    customFields: ['therapist', 'treatmentType', 'pressurePreference']
  },
  PHARMACY: {
    defaultFeatures: {
      enableGST: true,
      enableInventory: true,
      enableTables: false,
      enableAppointments: false,
      enableServices: false,
      enableSubscriptions: false,
      enableLoyalty: true,
      enableDelivery: true,
      gstRate: 0.05
    },
    availableOrderTypes: ['IN_STORE', 'PRESCRIPTION'],
    customFields: ['prescriptionNumber', 'doctorName', 'insuranceInfo']
  },
  GROCERY_STORE: {
    defaultFeatures: {
      enableGST: true,
      enableInventory: true,
      enableTables: false,
      enableAppointments: false,
      enableServices: false,
      enableSubscriptions: false,
      enableLoyalty: true,
      enableDelivery: true,
      gstRate: 0.05
    },
    availableOrderTypes: ['IN_STORE', 'ONLINE', 'DELIVERY'],
    customFields: ['weight', 'expiryDate', 'organic', 'brand']
  },
  FOOD_TRUCK: {
    defaultFeatures: {
      enableGST: true,
      enableInventory: true,
      enableTables: false,
      enableAppointments: false,
      enableServices: false,
      enableSubscriptions: false,
      enableLoyalty: true,
      enableDelivery: false,
      gstRate: 0.05
    },
    availableOrderTypes: ['IN_STORE', 'TAKEAWAY'],
    customFields: ['location', 'orderReadyTime', 'specialInstructions']
  },
  GYM: {
    defaultFeatures: {
      enableGST: true,
      enableInventory: false,
      enableTables: false,
      enableAppointments: true,
      enableServices: true,
      enableSubscriptions: true,
      enableLoyalty: true,
      enableDelivery: false,
      gstRate: 0.05
    },
    availableOrderTypes: ['SUBSCRIPTION', 'APPOINTMENT'],
    customFields: ['trainer', 'membershipType', 'fitnessGoals']
  },
  CLINIC: {
    defaultFeatures: {
      enableGST: true,
      enableInventory: true,
      enableTables: false,
      enableAppointments: true,
      enableServices: true,
      enableSubscriptions: false,
      enableLoyalty: true,
      enableDelivery: false,
      gstRate: 0.05
    },
    availableOrderTypes: ['APPOINTMENT', 'SERVICE'],
    customFields: ['doctor', 'symptoms', 'medicalHistory', 'insurance']
  }
}

export default function BusinessSettings({ 
  restaurantId, 
  initialSettings, 
  onSettingsUpdate 
}: BusinessSettingsProps) {
  const [settings, setSettings] = useState({
    businessType: initialSettings?.businessType || 'RESTAURANT',
    enableGST: initialSettings?.enableGST ?? true,
    gstRate: initialSettings?.gstRate ?? 0.05,
    enableInventory: initialSettings?.enableInventory ?? true,
    enableTables: initialSettings?.enableTables ?? true,
    enableAppointments: initialSettings?.enableAppointments ?? false,
    enableServices: initialSettings?.enableServices ?? false,
    enableSubscriptions: initialSettings?.enableSubscriptions ?? false,
    enableLoyalty: initialSettings?.enableLoyalty ?? true,
    enableDelivery: initialSettings?.enableDelivery ?? true,
    currency: initialSettings?.currency || 'INR',
    timezone: initialSettings?.timezone || 'Asia/Kolkata',
    receiptHeader: initialSettings?.receiptHeader || '',
    receiptFooter: initialSettings?.receiptFooter || '',
    businessHours: initialSettings?.businessHours || '{}',
    customFields: initialSettings?.customFields || '[]',
    features: initialSettings?.features || '{}'
  })

  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const businessConfig = businessTypeConfig[settings.businessType as keyof typeof businessTypeConfig]

  useEffect(() => {
    if (businessConfig) {
      setSettings(prev => ({
        ...prev,
        ...businessConfig.defaultFeatures
      }))
    }
  }, [settings.businessType, businessConfig])

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onSettingsUpdate(settings)
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetToDefaults = () => {
    if (businessConfig) {
      setSettings(prev => ({
        ...prev,
        ...businessConfig.defaultFeatures
      }))
      setHasChanges(true)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Business Settings</h1>
          <p className="text-gray-600">Configure your business-specific features and preferences</p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleResetToDefaults}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
          )}
          <Button onClick={handleSave} disabled={!hasChanges || isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Basic business settings and configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <Select value={settings.businessType} onValueChange={(value) => handleSettingChange('businessType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(businessTypeConfig).map(type => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={settings.currency} onValueChange={(value) => handleSettingChange('currency', value)}>
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
                  <Label>Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
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
                <div className="space-y-2">
                  <Label>GST Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.gstRate * 100}
                    onChange={(e) => handleSettingChange('gstRate', parseFloat(e.target.value) / 100)}
                    disabled={!settings.enableGST}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Configuration</CardTitle>
              <CardDescription>Enable or disable features based on your business needs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable GST</Label>
                      <p className="text-sm text-gray-600">Calculate and display GST on orders</p>
                    </div>
                    <Switch
                      checked={settings.enableGST}
                      onCheckedChange={(checked) => handleSettingChange('enableGST', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Inventory</Label>
                      <p className="text-sm text-gray-600">Track inventory levels and stock</p>
                    </div>
                    <Switch
                      checked={settings.enableInventory}
                      onCheckedChange={(checked) => handleSettingChange('enableInventory', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Tables</Label>
                      <p className="text-sm text-gray-600">Manage table reservations and seating</p>
                    </div>
                    <Switch
                      checked={settings.enableTables}
                      onCheckedChange={(checked) => handleSettingChange('enableTables', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Appointments</Label>
                      <p className="text-sm text-gray-600">Allow appointment booking and scheduling</p>
                    </div>
                    <Switch
                      checked={settings.enableAppointments}
                      onCheckedChange={(checked) => handleSettingChange('enableAppointments', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Services</Label>
                      <p className="text-sm text-gray-600">Offer services instead of products</p>
                    </div>
                    <Switch
                      checked={settings.enableServices}
                      onCheckedChange={(checked) => handleSettingChange('enableServices', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Subscriptions</Label>
                      <p className="text-sm text-gray-600">Manage recurring subscriptions and memberships</p>
                    </div>
                    <Switch
                      checked={settings.enableSubscriptions}
                      onCheckedChange={(checked) => handleSettingChange('enableSubscriptions', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Loyalty Program</Label>
                      <p className="text-sm text-gray-600">Track customer loyalty points and rewards</p>
                    </div>
                    <Switch
                      checked={settings.enableLoyalty}
                      onCheckedChange={(checked) => handleSettingChange('enableLoyalty', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Delivery</Label>
                      <p className="text-sm text-gray-600">Offer delivery services for orders</p>
                    </div>
                    <Switch
                      checked={settings.enableDelivery}
                      onCheckedChange={(checked) => handleSettingChange('enableDelivery', checked)}
                    />
                  </div>
                </div>
              </div>

              {businessConfig && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Available Order Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {businessConfig.availableOrderTypes.map(type => (
                      <Badge key={type} variant="outline">
                        {type.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Receipt Customization</CardTitle>
              <CardDescription>Customize how your receipts look and what information they include</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receiptHeader">Receipt Header</Label>
                <Textarea
                  id="receiptHeader"
                  value={settings.receiptHeader}
                  onChange={(e) => handleSettingChange('receiptHeader', e.target.value)}
                  placeholder="Enter your business name, address, and contact information"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiptFooter">Receipt Footer</Label>
                <Textarea
                  id="receiptFooter"
                  value={settings.receiptFooter}
                  onChange={(e) => handleSettingChange('receiptFooter', e.target.value)}
                  placeholder="Thank you message, return policy, or promotional text"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Advanced configuration options for your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Business Hours (JSON format)</Label>
                <Textarea
                  value={settings.businessHours}
                  onChange={(e) => handleSettingChange('businessHours', e.target.value)}
                  placeholder='{"monday": "09:00-18:00", "tuesday": "09:00-18:00"}'
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Custom Fields (JSON format)</Label>
                <Textarea
                  value={settings.customFields}
                  onChange={(e) => handleSettingChange('customFields', e.target.value)}
                  placeholder='["field1", "field2"]'
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Additional Features (JSON format)</Label>
                <Textarea
                  value={settings.features}
                  onChange={(e) => handleSettingChange('features', e.target.value)}
                  placeholder='{"feature1": true, "feature2": "value"}'
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}