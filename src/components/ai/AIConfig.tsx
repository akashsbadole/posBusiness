'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Settings, Key, Bot, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { AIConfig, AIVendor } from '@/lib/ai-client'

interface AIConfigProps {
  onConfigChange: (config: AIConfig) => void
  currentConfig: AIConfig
}

export default function AIConfigComponent({ onConfigChange, currentConfig }: AIConfigProps) {
  const [config, setConfig] = useState<AIConfig>(currentConfig)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    vendor?: AIVendor
  } | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  const vendors = [
    { value: 'zai' as AIVendor, label: 'Z.ai', description: 'Built-in AI service' },
    { value: 'openai' as AIVendor, label: 'OpenAI', description: 'GPT models' },
    { value: 'gemini' as AIVendor, label: 'Google Gemini', description: 'Google AI models' },
  ]

  const models = {
    zai: ['default'],
    openai: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
    gemini: ['gemini-pro', 'gemini-pro-vision']
  }

  const handleConfigChange = (field: keyof AIConfig, value: any) => {
    const newConfig = { ...config, [field]: value }
    setConfig(newConfig)
    onConfigChange(newConfig)
  }

  const testConnection = async () => {
    setIsTesting(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      const result = await response.json()

      setTestResult({
        success: result.success,
        message: result.message,
        vendor: config.vendor
      })

      if (result.success) {
        toast.success(`${config.vendor} connection successful!`)
      } else {
        toast.error(`${config.vendor} connection failed: ${result.message}`)
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        vendor: config.vendor
      })
      toast.error('Connection test failed')
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          AI Configuration
        </CardTitle>
        <CardDescription>
          Configure AI service settings for voice search and other AI features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={config.vendor} onValueChange={(value) => handleConfigChange('vendor', value)}>
          <TabsList className="grid w-full grid-cols-3">
            {vendors.map(vendor => (
              <TabsTrigger key={vendor.value} value={vendor.value}>
                {vendor.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {vendors.map(vendor => (
            <TabsContent key={vendor.value} value={vendor.value} className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="h-4 w-4" />
                  <h3 className="font-semibold">{vendor.label}</h3>
                  <Badge variant="outline">{vendor.description}</Badge>
                </div>
                
                {vendor.value !== 'zai' && (
                  <div className="space-y-2">
                    <Label htmlFor={`api-key-${vendor.value}`}>API Key</Label>
                    <Input
                      id={`api-key-${vendor.value}`}
                      type="password"
                      placeholder={`Enter your ${vendor.label} API key`}
                      value={config.apiKey || ''}
                      onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your API key is stored securely and only used for AI requests
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor={`model-${vendor.value}`}>Model</Label>
                  <Select 
                    value={config.model || models[vendor.value][0]} 
                    onValueChange={(value) => handleConfigChange('model', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {models[vendor.value].map(model => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`temperature-${vendor.value}`}>Temperature</Label>
                    <Input
                      id={`temperature-${vendor.value}`}
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={config.temperature || 0.1}
                      onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`max-tokens-${vendor.value}`}>Max Tokens</Label>
                    <Input
                      id={`max-tokens-${vendor.value}`}
                      type="number"
                      min="1"
                      max="4000"
                      value={config.maxTokens || 150}
                      onChange={(e) => handleConfigChange('maxTokens', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex items-center gap-4">
          <Button onClick={testConnection} disabled={isTesting}>
            {isTesting ? 'Testing...' : 'Test Connection'}
          </Button>
          
          {testResult && (
            <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={testResult.success ? "text-green-800" : "text-red-800"}>
                  {testResult.message}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Z.ai is the default built-in service and requires no API key</p>
          <p>• OpenAI requires an API key from https://platform.openai.com</p>
          <p>• Gemini requires an API key from https://makersuite.google.com/app/apikey</p>
          <p>• All API keys are stored locally and never sent to external servers</p>
        </div>
      </CardContent>
    </Card>
  )
}