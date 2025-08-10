'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Lock, 
  Building2, 
  Mail, 
  Phone, 
  Key,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink
} from 'lucide-react'
import { useState } from 'react'

interface SystemConfigProps {
  onConfigChange?: (config: any) => void
}

export default function SystemConfig({ onConfigChange }: SystemConfigProps) {
  const [registrationEnabled, setRegistrationEnabled] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Dummy credentials for testing
  const dummyCredentials = {
    owner: {
      email: 'owner@spicegarden.com',
      password: 'owner123',
      restaurant: 'Spice Garden'
    },
    staff: {
      email: 'staff@spicegarden.com',
      password: 'staff123',
      role: 'MANAGER'
    },
    demo: {
      email: 'demo@restaurant.com',
      password: 'demo123',
      restaurant: 'Demo Restaurant'
    }
  }

  const systemInfo = {
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: 'SQLite',
    features: [
      'Order Management',
      'Menu Management',
      'Customer Management',
      'Inventory Tracking',
      'GST Compliance',
      'UPI Payments',
      'AI Insights',
      'Offline Mode'
    ]
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const handleRegistrationToggle = (enabled: boolean) => {
    setRegistrationEnabled(enabled)
    onConfigChange?.({ registrationEnabled: enabled })
  }

  return (
    <div className="space-y-6">
      {/* Registration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Registration Settings
          </CardTitle>
          <CardDescription>
            Configure user registration access and system settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="registration-toggle" className="text-base font-medium">
                  Public Registration
                </Label>
                <Badge variant={registrationEnabled ? "default" : "secondary"}>
                  {registrationEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Allow new users to register and create restaurant accounts
              </p>
            </div>
            <Switch
              id="registration-toggle"
              checked={registrationEnabled}
              onCheckedChange={handleRegistrationToggle}
            />
          </div>

          {!registrationEnabled && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-800">
                  Registration is currently disabled
                </p>
                <p className="text-sm text-amber-700">
                  New users cannot register. Use the dummy credentials below for testing or enable registration to allow new signups.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dummy Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Test Credentials
          </CardTitle>
          <CardDescription>
            Use these dummy credentials for testing the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="owner" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="owner">Owner Account</TabsTrigger>
              <TabsTrigger value="staff">Staff Account</TabsTrigger>
              <TabsTrigger value="demo">Demo Account</TabsTrigger>
            </TabsList>

            <TabsContent value="owner" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-gray-600">{dummyCredentials.owner.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(dummyCredentials.owner.email, 'owner-email')}
                    className="flex items-center gap-1"
                  >
                    {copiedField === 'owner-email' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedField === 'owner-email' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Password</p>
                      <p className="text-sm text-gray-600">{dummyCredentials.owner.password}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(dummyCredentials.owner.password, 'owner-password')}
                    className="flex items-center gap-1"
                  >
                    {copiedField === 'owner-password' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedField === 'owner-password' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Restaurant</p>
                    <p className="text-sm text-blue-600">{dummyCredentials.owner.restaurant}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <User className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Access Level</p>
                    <p className="text-sm text-green-600">Full administrative access</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="staff" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-gray-600">{dummyCredentials.staff.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(dummyCredentials.staff.email, 'staff-email')}
                    className="flex items-center gap-1"
                  >
                    {copiedField === 'staff-email' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedField === 'staff-email' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Password</p>
                      <p className="text-sm text-gray-600">{dummyCredentials.staff.password}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(dummyCredentials.staff.password, 'staff-password')}
                    className="flex items-center gap-1"
                  >
                    {copiedField === 'staff-password' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedField === 'staff-password' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <User className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-purple-800">Role</p>
                    <p className="text-sm text-purple-600">{dummyCredentials.staff.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Permissions</p>
                    <p className="text-sm text-orange-600">Limited to assigned duties</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="demo" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-gray-600">{dummyCredentials.demo.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(dummyCredentials.demo.email, 'demo-email')}
                    className="flex items-center gap-1"
                  >
                    {copiedField === 'demo-email' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedField === 'demo-email' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Password</p>
                      <p className="text-sm text-gray-600">{dummyCredentials.demo.password}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(dummyCredentials.demo.password, 'demo-password')}
                    className="flex items-center gap-1"
                  >
                    {copiedField === 'demo-password' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedField === 'demo-password' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>

                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                  <Building2 className="h-4 w-4 text-indigo-500" />
                  <div>
                    <p className="text-sm font-medium text-indigo-800">Restaurant</p>
                    <p className="text-sm text-indigo-600">{dummyCredentials.demo.restaurant}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-teal-500" />
                  <div>
                    <p className="text-sm font-medium text-teal-800">Purpose</p>
                    <p className="text-sm text-teal-600">Testing and demonstration</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            System Information
          </CardTitle>
          <CardDescription>
            Current system configuration and available features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Version</p>
                <p className="text-sm text-gray-600">{systemInfo.version}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Environment</p>
                <Badge variant={systemInfo.environment === 'production' ? 'destructive' : 'secondary'}>
                  {systemInfo.environment}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Database</p>
                <p className="text-sm text-gray-600">{systemInfo.database}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Available Features</p>
              <div className="flex flex-wrap gap-2">
                {systemInfo.features.map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}