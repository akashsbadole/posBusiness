'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Palette, 
  FileText, 
  Image, 
  Settings, 
  Save,
  Upload,
  Download,
  RefreshCw,
  Crown
} from 'lucide-react'
import SubscriptionManagement from '@/components/subscription/SubscriptionManagement'

interface CustomizationSettingsProps {
  restaurantId: string
  initialSettings?: any
  onSave?: (settings: any) => void
}

export default function CustomizationSettings({ 
  restaurantId, 
  initialSettings, 
  onSave 
}: CustomizationSettingsProps) {
  const [settings, setSettings] = useState({
    // Restaurant Branding
    restaurantName: initialSettings?.restaurantName || '',
    restaurantAddress: initialSettings?.restaurantAddress || '',
    restaurantPhone: initialSettings?.restaurantPhone || '',
    restaurantEmail: initialSettings?.restaurantEmail || '',
    gstNumber: initialSettings?.gstNumber || '',
    logo: initialSettings?.logo || '',
    
    // Invoice Customization
    invoiceTemplate: initialSettings?.invoiceTemplate || 'default',
    headerColor: initialSettings?.headerColor || '#000000',
    accentColor: initialSettings?.accentColor || '#4f46e5',
    showGST: initialSettings?.showGST ?? true,
    showDiscount: initialSettings?.showDiscount ?? true,
    customFooter: initialSettings?.customFooter || '',
    customHeader: initialSettings?.customHeader || '',
    
    // UI Preferences
    theme: initialSettings?.theme || 'light',
    language: initialSettings?.language || 'en',
    currency: initialSettings?.currency || 'INR',
    dateFormat: initialSettings?.dateFormat || 'dd/mm/yyyy',
    timeFormat: initialSettings?.timeFormat || '24h',
    
    // Feature Settings
    enableInventory: initialSettings?.enableInventory ?? true,
    enableLoyalty: initialSettings?.enableLoyalty ?? true,
    enableOnlineOrders: initialSettings?.enableOnlineOrders ?? false,
    enableDelivery: initialSettings?.enableDelivery ?? false,
    enableTableReservation: initialSettings?.enableTableReservation ?? true,
    
    // Notification Settings
    emailNotifications: initialSettings?.emailNotifications ?? true,
    smsNotifications: initialSettings?.smsNotifications ?? false,
    orderNotifications: initialSettings?.orderNotifications ?? true,
    paymentNotifications: initialSettings?.paymentNotifications ?? true,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(initialSettings?.logo || null)

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setLogoPreview(result)
        handleInputChange('logo', result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Save settings to backend
      const response = await fetch(`/api/restaurants/${restaurantId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      const savedSettings = await response.json()
      onSave?.(savedSettings)
      
      // Show success message
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setSettings({
      restaurantName: '',
      restaurantAddress: '',
      restaurantPhone: '',
      restaurantEmail: '',
      gstNumber: '',
      logo: '',
      invoiceTemplate: 'default',
      headerColor: '#000000',
      accentColor: '#4f46e5',
      showGST: true,
      showDiscount: true,
      customFooter: '',
      customHeader: '',
      theme: 'light',
      language: 'en',
      currency: 'INR',
      dateFormat: 'dd/mm/yyyy',
      timeFormat: '24h',
      enableInventory: true,
      enableLoyalty: true,
      enableOnlineOrders: false,
      enableDelivery: false,
      enableTableReservation: true,
      emailNotifications: true,
      smsNotifications: false,
      orderNotifications: true,
      paymentNotifications: true,
    })
    setLogoPreview(null)
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `restaurant-settings-${restaurantId}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string)
          setSettings(importedSettings)
          if (importedSettings.logo) {
            setLogoPreview(importedSettings.logo)
          }
          alert('Settings imported successfully!')
        } catch (error) {
          alert('Invalid settings file. Please try again.')
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Customization Settings</h2>
          <p className="text-gray-600">Personalize your restaurant POS experience</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportSettings}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <label htmlFor="import-settings">
            <Button variant="outline" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </span>
            </Button>
          </label>
          <input
            id="import-settings"
            type="file"
            accept=".json"
            className="hidden"
            onChange={importSettings}
          />
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="invoice" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Invoice
          </TabsTrigger>
          <TabsTrigger value="ui" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            UI/UX
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Subscription
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Branding</CardTitle>
              <CardDescription>Customize your restaurant's appearance and identity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Restaurant Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Restaurant logo" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Image className="w-8 h-8 text-gray-400" alt="Upload icon" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload">
                      <Button variant="outline" asChild>
                        <span>Upload Logo</span>
                      </Button>
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Recommended: 200x200px, max 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Restaurant Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Restaurant Name</Label>
                  <Input
                    value={settings.restaurantName}
                    onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                    placeholder="Enter restaurant name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={settings.restaurantPhone}
                    onChange={(e) => handleInputChange('restaurantPhone', e.target.value)}
                    placeholder="+91 22 1234 5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    value={settings.restaurantEmail}
                    onChange={(e) => handleInputChange('restaurantEmail', e.target.value)}
                    placeholder="info@restaurant.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>GST Number</Label>
                  <Input
                    value={settings.gstNumber}
                    onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                    placeholder="27ABCDE1234F1Z5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea
                  value={settings.restaurantAddress}
                  onChange={(e) => handleInputChange('restaurantAddress', e.target.value)}
                  placeholder="Enter restaurant address"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoice">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Customization</CardTitle>
              <CardDescription>Customize how your invoices look and what information they include</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Selection */}
              <div className="space-y-2">
                <Label>Invoice Template</Label>
                <Select 
                  value={settings.invoiceTemplate} 
                  onValueChange={(value) => handleInputChange('invoiceTemplate', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Template</SelectItem>
                    <SelectItem value="modern">Modern Template</SelectItem>
                    <SelectItem value="classic">Classic Template</SelectItem>
                    <SelectItem value="minimal">Minimal Template</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Color Customization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Header Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.headerColor}
                      onChange={(e) => handleInputChange('headerColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.headerColor}
                      onChange={(e) => handleInputChange('headerColor', e.target.value)}
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      placeholder="#4f46e5"
                    />
                  </div>
                </div>
              </div>

              {/* Display Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show GST Information</Label>
                    <p className="text-sm text-gray-600">Include GST details in invoices</p>
                  </div>
                  <Switch
                    checked={settings.showGST}
                    onCheckedChange={(checked) => handleInputChange('showGST', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Discount Information</Label>
                    <p className="text-sm text-gray-600">Include discount details in invoices</p>
                  </div>
                  <Switch
                    checked={settings.showDiscount}
                    onCheckedChange={(checked) => handleInputChange('showDiscount', checked)}
                  />
                </div>
              </div>

              {/* Custom Header/Footer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Custom Header</Label>
                  <Textarea
                    value={settings.customHeader}
                    onChange={(e) => handleInputChange('customHeader', e.target.value)}
                    placeholder="Custom header text for invoices"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custom Footer</Label>
                  <Textarea
                    value={settings.customFooter}
                    onChange={(e) => handleInputChange('customFooter', e.target.value)}
                    placeholder="Custom footer text for invoices"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ui">
          <Card>
            <CardHeader>
              <CardTitle>UI/UX Preferences</CardTitle>
              <CardDescription>Customize the user interface and user experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Theme */}
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select 
                    value={settings.theme} 
                    onValueChange={(value) => handleInputChange('theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select 
                    value={settings.language} 
                    onValueChange={(value) => handleInputChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                      <SelectItem value="gu">ગુજરાતી (Gujarati)</SelectItem>
                      <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                      <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select 
                    value={settings.currency} 
                    onValueChange={(value) => handleInputChange('currency', value)}
                  >
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

                {/* Date Format */}
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select 
                    value={settings.dateFormat} 
                    onValueChange={(value) => handleInputChange('dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Format */}
                <div className="space-y-2">
                  <Label>Time Format</Label>
                  <Select 
                    value={settings.timeFormat} 
                    onValueChange={(value) => handleInputChange('timeFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12-hour</SelectItem>
                      <SelectItem value="24h">24-hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Feature Settings</CardTitle>
              <CardDescription>Enable or disable specific features for your restaurant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Feature Toggles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Inventory Management</Label>
                      <p className="text-sm text-gray-600">Track stock and ingredients</p>
                    </div>
                    <Switch
                      checked={settings.enableInventory}
                      onCheckedChange={(checked) => handleInputChange('enableInventory', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Loyalty Program</Label>
                      <p className="text-sm text-gray-600">Customer loyalty points system</p>
                    </div>
                    <Switch
                      checked={settings.enableLoyalty}
                      onCheckedChange={(checked) => handleInputChange('enableLoyalty', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Online Orders</Label>
                      <p className="text-sm text-gray-600">Accept orders from website/app</p>
                    </div>
                    <Switch
                      checked={settings.enableOnlineOrders}
                      onCheckedChange={(checked) => handleInputChange('enableOnlineOrders', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Delivery Service</Label>
                      <p className="text-sm text-gray-600">Manage delivery operations</p>
                    </div>
                    <Switch
                      checked={settings.enableDelivery}
                      onCheckedChange={(checked) => handleInputChange('enableDelivery', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Table Reservation</Label>
                      <p className="text-sm text-gray-600">Online table booking system</p>
                    </div>
                    <Switch
                      checked={settings.enableTableReservation}
                      onCheckedChange={(checked) => handleInputChange('enableTableReservation', checked)}
                    />
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Notifications</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive email alerts</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-gray-600">Receive SMS alerts</p>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Order Notifications</Label>
                      <p className="text-sm text-gray-600">Alerts for new orders</p>
                    </div>
                    <Switch
                      checked={settings.orderNotifications}
                      onCheckedChange={(checked) => handleInputChange('orderNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Payment Notifications</Label>
                      <p className="text-sm text-gray-600">Alerts for payment events</p>
                    </div>
                    <Switch
                      checked={settings.paymentNotifications}
                      onCheckedChange={(checked) => handleInputChange('paymentNotifications', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionManagement restaurantId={restaurantId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}