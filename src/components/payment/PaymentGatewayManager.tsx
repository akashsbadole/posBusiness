"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, CreditCard, Smartphone, Shield, TestTube } from 'lucide-react'

interface PaymentGatewayConfig {
  id: string
  name: string
  enabled: boolean
  config: {
    environment: 'test' | 'production'
    [key: string]: any
  }
}

interface PaymentGatewayManagerProps {
  onClose?: () => void
}

export default function PaymentGatewayManager({ onClose }: PaymentGatewayManagerProps) {
  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('razorpay')

  useEffect(() => {
    fetchGateways()
  }, [])

  const fetchGateways = async () => {
    try {
      const response = await fetch('/api/payment-gateway')
      const data = await response.json()
      if (data.success) {
        setGateways(data.gateways)
      }
    } catch (error) {
      console.error('Error fetching payment gateways:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateGatewayConfig = (gatewayId: string, updates: Partial<PaymentGatewayConfig>) => {
    setGateways(prev => 
      prev.map(gateway => 
        gateway.id === gatewayId ? { ...gateway, ...updates } : gateway
      )
    )
  }

  const updateGatewayField = (gatewayId: string, field: string, value: any) => {
    setGateways(prev => 
      prev.map(gateway => 
        gateway.id === gatewayId 
          ? { 
              ...gateway, 
              config: { ...gateway.config, [field]: value } 
            } 
          : gateway
      )
    )
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      // Here you would save the configuration to your database
      // For now, we'll just simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Configuration saved successfully!')
    } catch (error) {
      console.error('Error saving configuration:', error)
      alert('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const testGateway = async (gatewayId: string) => {
    try {
      const response = await fetch('/api/payment-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gatewayId,
          paymentData: {
            amount: 1, // Test with ₹1
            currency: 'INR',
            orderId: `test_${Date.now()}`,
            description: 'Test payment'
          }
        })
      })
      
      const data = await response.json()
      if (data.success) {
        alert(`Gateway test successful! Transaction ID: ${data.transactionId}`)
      } else {
        alert(`Gateway test failed: ${data.message}`)
      }
    } catch (error) {
      console.error('Error testing gateway:', error)
      alert('Failed to test gateway')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Gateway Configuration</h2>
          <p className="text-gray-600">Configure and manage payment gateways for your business</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={saveConfig} disabled={saving}>
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="razorpay">Razorpay</TabsTrigger>
          <TabsTrigger value="paytm">Paytm</TabsTrigger>
          <TabsTrigger value="payu">PayU</TabsTrigger>
        </TabsList>

        <TabsContent value="razorpay">
          <GatewayConfigCard
            gateway={gateways.find(g => g.id === 'razorpay')}
            onUpdate={(updates) => updateGatewayConfig('razorpay', updates)}
            onFieldUpdate={(field, value) => updateGatewayField('razorpay', field, value)}
            onTest={() => testGateway('razorpay')}
            icon={<CreditCard className="h-5 w-5" />}
            color="blue"
          />
        </TabsContent>

        <TabsContent value="paytm">
          <GatewayConfigCard
            gateway={gateways.find(g => g.id === 'paytm')}
            onUpdate={(updates) => updateGatewayConfig('paytm', updates)}
            onFieldUpdate={(field, value) => updateGatewayField('paytm', field, value)}
            onTest={() => testGateway('paytm')}
            icon={<Smartphone className="h-5 w-5" />}
            color="blue"
          />
        </TabsContent>

        <TabsContent value="payu">
          <GatewayConfigCard
            gateway={gateways.find(g => g.id === 'payu')}
            onUpdate={(updates) => updateGatewayConfig('payu', updates)}
            onFieldUpdate={(field, value) => updateGatewayField('payu', field, value)}
            onTest={() => testGateway('payu')}
            icon={<Shield className="h-5 w-5" />}
            color="blue"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface GatewayConfigCardProps {
  gateway?: PaymentGatewayConfig
  onUpdate: (updates: Partial<PaymentGatewayConfig>) => void
  onFieldUpdate: (field: string, value: any) => void
  onTest: () => void
  icon: React.ReactNode
  color: string
}

function GatewayConfigCard({ gateway, onUpdate, onFieldUpdate, onTest, icon, color }: GatewayConfigCardProps) {
  if (!gateway) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-gray-500">Gateway not available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon}
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>{gateway.name}</span>
                <Badge variant={gateway.enabled ? "default" : "secondary"}>
                  {gateway.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </CardTitle>
              <CardDescription>Configure {gateway.name} payment gateway</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={gateway.enabled}
              onCheckedChange={(checked) => onUpdate({ enabled: checked })}
            />
            <Button variant="outline" size="sm" onClick={onTest}>
              <TestTube className="h-4 w-4 mr-2" />
              Test
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="environment">Environment</Label>
            <Select
              value={gateway.config.environment}
              onValueChange={(value) => onFieldUpdate('environment', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="test">Test</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {gateway.id === 'razorpay' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="keyId">Key ID</Label>
              <Input
                id="keyId"
                placeholder="rzp_test_..."
                value={gateway.config.keyId || ''}
                onChange={(e) => onFieldUpdate('keyId', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="keySecret">Key Secret</Label>
              <Input
                id="keySecret"
                type="password"
                placeholder="Your secret key"
                value={gateway.config.keySecret || ''}
                onChange={(e) => onFieldUpdate('keySecret', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="webhookSecret">Webhook Secret</Label>
              <Input
                id="webhookSecret"
                type="password"
                placeholder="Your webhook secret"
                value={gateway.config.webhookSecret || ''}
                onChange={(e) => onFieldUpdate('webhookSecret', e.target.value)}
              />
            </div>
          </div>
        )}

        {gateway.id === 'paytm' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="merchantId">Merchant ID</Label>
              <Input
                id="merchantId"
                placeholder="Your merchant ID"
                value={gateway.config.merchantId || ''}
                onChange={(e) => onFieldUpdate('merchantId', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="merchantKey">Merchant Key</Label>
              <Input
                id="merchantKey"
                type="password"
                placeholder="Your merchant key"
                value={gateway.config.merchantKey || ''}
                onChange={(e) => onFieldUpdate('merchantKey', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="WEBSTAGING"
                value={gateway.config.website || ''}
                onChange={(e) => onFieldUpdate('website', e.target.value)}
              />
            </div>
          </div>
        )}

        {gateway.id === 'payu' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="merchantKey">Merchant Key</Label>
              <Input
                id="merchantKey"
                placeholder="Your merchant key"
                value={gateway.config.merchantKey || ''}
                onChange={(e) => onFieldUpdate('merchantKey', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="merchantSalt">Merchant Salt</Label>
              <Input
                id="merchantSalt"
                type="password"
                placeholder="Your merchant salt"
                value={gateway.config.merchantSalt || ''}
                onChange={(e) => onFieldUpdate('merchantSalt', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="authHeader">Auth Header</Label>
              <Input
                id="authHeader"
                placeholder="Your auth header"
                value={gateway.config.authHeader || ''}
                onChange={(e) => onFieldUpdate('authHeader', e.target.value)}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}