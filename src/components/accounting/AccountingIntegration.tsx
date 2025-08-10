'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Settings, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  TestTube, 
  Sync,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react'
import { AccountingConfig, SyncResult } from '@/lib/accounting/types'

interface AccountingIntegrationProps {
  restaurantId: string
}

export default function AccountingIntegration({ restaurantId }: AccountingIntegrationProps) {
  const [configs, setConfigs] = useState<AccountingConfig[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [isTesting, setIsTesting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [testResults, setTestResults] = useState<{ [key: string]: boolean }>({})
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newConfig, setNewConfig] = useState<Partial<AccountingConfig>>({
    provider: 'tally',
    isEnabled: true,
    syncFrequency: 'daily'
  })

  // Load existing configurations
  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    try {
      const response = await fetch('/api/accounting?action=list')
      const data = await response.json()
      setConfigs(data.configs || [])
    } catch (error) {
      console.error('Failed to load accounting configs:', error)
    }
  }

  const handleAddConfig = async () => {
    try {
      const response = await fetch('/api/accounting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addConfig',
          config: { ...newConfig, isEnabled: true }
        })
      })

      const result = await response.json()
      if (result.success) {
        setShowAddForm(false)
        setNewConfig({ provider: 'tally', isEnabled: true, syncFrequency: 'daily' })
        loadConfigs()
      } else {
        alert('Failed to add configuration')
      }
    } catch (error) {
      console.error('Failed to add config:', error)
      alert('Failed to add configuration')
    }
  }

  const handleRemoveConfig = async (provider: string) => {
    if (!confirm(`Are you sure you want to remove ${provider} integration?`)) {
      return
    }

    try {
      const response = await fetch('/api/accounting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'removeConfig',
          provider
        })
      })

      const result = await response.json()
      if (result.success) {
        loadConfigs()
      } else {
        alert('Failed to remove configuration')
      }
    } catch (error) {
      console.error('Failed to remove config:', error)
      alert('Failed to remove configuration')
    }
  }

  const testConnection = async (provider?: string) => {
    setIsTesting(true)
    try {
      const action = provider ? `test&provider=${provider}` : 'testAll'
      const response = await fetch(`/api/accounting?action=${action}`)
      const data = await response.json()
      setTestResults(data.results || { [provider || 'all']: data.success })
    } catch (error) {
      console.error('Failed to test connection:', error)
      setTestResults({ [provider || 'all']: false })
    } finally {
      setIsTesting(false)
    }
  }

  const syncData = async (provider: string) => {
    setIsSyncing(true)
    try {
      const response = await fetch('/api/accounting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'syncAll',
          provider,
          data: {
            transactions: [], // This would come from your database
            customers: [],
            vendors: []
          }
        })
      })

      const result = await response.json()
      setSyncResult(result)
    } catch (error) {
      console.error('Failed to sync data:', error)
      setSyncResult({
        success: false,
        syncedTransactions: 0,
        failedTransactions: 0,
        syncedCustomers: 0,
        failedCustomers: 0,
        syncedVendors: 0,
        failedVendors: 0,
        errors: [error instanceof Error ? error.message : 'Sync failed'],
        lastSyncTime: new Date()
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const getStatusBadge = (config: AccountingConfig) => {
    if (!config.isEnabled) {
      return <Badge variant="secondary">Disabled</Badge>
    }
    
    const testResult = testResults[config.provider]
    if (testResult === undefined) {
      return <Badge variant="outline">Not Tested</Badge>
    }
    
    return testResult ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Connected
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Disconnected
      </Badge>
    )
  }

  const providers = [
    {
      id: 'tally',
      name: 'Tally',
      description: 'Popular accounting software in India',
      website: 'https://tallysolutions.com',
      fields: [
        { key: 'baseUrl', label: 'Server URL', placeholder: 'http://localhost:9000' },
        { key: 'companyId', label: 'Company ID', placeholder: 'Company Name' },
        { key: 'apiKey', label: 'API Key', placeholder: 'Your API key' }
      ]
    },
    {
      id: 'zoho',
      name: 'Zoho Books',
      description: 'Cloud-based accounting software',
      website: 'https://www.zoho.com/books',
      fields: [
        { key: 'apiKey', label: 'API Key', placeholder: 'Your Zoho API key' },
        { key: 'companyId', label: 'Organization ID', placeholder: 'Organization ID' }
      ]
    }
  ]

  const selectedProviderData = providers.find(p => p.id === selectedProvider)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Accounting Integration</h2>
          <p className="text-gray-600">Connect your accounting software for automatic synchronization</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Integration
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Integration</CardTitle>
            <CardDescription>Configure your accounting software connection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Accounting Software</Label>
              <Select 
                value={newConfig.provider} 
                onValueChange={(value) => {
                  setNewConfig(prev => ({ ...prev, provider: value as any }))
                  setSelectedProvider(value)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providers.map(provider => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProviderData && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{selectedProviderData.name}</h3>
                  <Badge variant="outline">{selectedProviderData.id}</Badge>
                  <a 
                    href={selectedProviderData.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Visit website
                  </a>
                </div>
                <p className="text-sm text-gray-600">{selectedProviderData.description}</p>

                {selectedProviderData.fields.map(field => (
                  <div key={field.key} className="space-y-2">
                    <Label>{field.label}</Label>
                    <Input
                      placeholder={field.placeholder}
                      value={newConfig[field.key as keyof AccountingConfig] as string || ''}
                      onChange={(e) => setNewConfig(prev => ({
                        ...prev,
                        [field.key]: e.target.value
                      }))}
                    />
                  </div>
                ))}

                <div className="space-y-2">
                  <Label>Sync Frequency</Label>
                  <Select 
                    value={newConfig.syncFrequency} 
                    onValueChange={(value) => setNewConfig(prev => ({ ...prev, syncFrequency: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleAddConfig}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Add Integration
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="sync">Sync Status</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          {configs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No accounting integrations configured</h3>
                <p className="text-gray-600 mb-4">Connect your accounting software to get started</p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Integration
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {configs.map(config => {
                const provider = providers.find(p => p.id === config.provider)
                return (
                  <Card key={config.provider}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {provider?.name}
                            {getStatusBadge(config)}
                          </CardTitle>
                          <CardDescription>{provider?.description}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testConnection(config.provider)}
                            disabled={isTesting}
                          >
                            <TestTube className="w-4 h-4 mr-1" />
                            Test
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => syncData(config.provider)}
                            disabled={isSyncing || !config.isEnabled}
                          >
                            <Sync className="w-4 h-4 mr-1" />
                            Sync
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveConfig(config.provider)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <Label className="text-gray-500">Status</Label>
                          <p>{config.isEnabled ? 'Enabled' : 'Disabled'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-500">Sync Frequency</Label>
                          <p>{config.syncFrequency}</p>
                        </div>
                        <div>
                          <Label className="text-gray-500">Last Sync</Label>
                          <p>{config.lastSync ? new Date(config.lastSync).toLocaleDateString() : 'Never'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-500">Provider</Label>
                          <p className="uppercase">{config.provider}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          {syncResult && (
            <Card>
              <CardHeader>
                <CardTitle>Sync Results</CardTitle>
                <CardDescription>
                  Last sync: {syncResult.lastSyncTime.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {syncResult.syncedTransactions}
                    </div>
                    <div className="text-sm text-gray-600">Transactions Synced</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {syncResult.syncedCustomers}
                    </div>
                    <div className="text-sm text-gray-600">Customers Synced</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {syncResult.syncedVendors}
                    </div>
                    <div className="text-sm text-gray-600">Vendors Synced</div>
                  </div>
                </div>

                {(syncResult.failedTransactions > 0 || syncResult.failedCustomers > 0 || syncResult.failedVendors > 0) && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600">Sync Errors</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {syncResult.failedTransactions > 0 && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">
                            {syncResult.failedTransactions}
                          </div>
                          <div className="text-sm text-gray-600">Failed Transactions</div>
                        </div>
                      )}
                      {syncResult.failedCustomers > 0 && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">
                            {syncResult.failedCustomers}
                          </div>
                          <div className="text-sm text-gray-600">Failed Customers</div>
                        </div>
                      )}
                      {syncResult.failedVendors > 0 && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">
                            {syncResult.failedVendors}
                          </div>
                          <div className="text-sm text-gray-600">Failed Vendors</div>
                        </div>
                      )}
                    </div>
                    {syncResult.errors.length > 0 && (
                      <Alert>
                        <AlertDescription>
                          <div className="space-y-1">
                            {syncResult.errors.map((error, index) => (
                              <div key={index} className="text-sm">• {error}</div>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Manual Sync</CardTitle>
              <CardDescription>Manually trigger data synchronization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  {configs.map(config => (
                    <div key={config.provider} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{config.provider}</div>
                        <div className="text-sm text-gray-600">
                          Last sync: {config.lastSync ? new Date(config.lastSync).toLocaleDateString() : 'Never'}
                        </div>
                      </div>
                      <Button
                        onClick={() => syncData(config.provider)}
                        disabled={isSyncing || !config.isEnabled}
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                        Sync Now
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Settings</CardTitle>
              <CardDescription>Configure accounting integration settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Auto-sync</Label>
                  <p className="text-sm text-gray-600">Automatically sync data at scheduled intervals</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="space-y-2">
                <Label>Default Sync Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data Mapping</Label>
                <p className="text-sm text-gray-600">Configure how your POS data maps to accounting categories</p>
                <Button variant="outline" size="sm">
                  Configure Mappings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}