'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { 
  Send, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  Users, 
  Template,
  History,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2
} from 'lucide-react'

interface NotificationRecipient {
  id: string
  name: string
  email?: string
  phone?: string
  preferences: {
    email: boolean
    sms: boolean
    whatsapp: boolean
  }
}

interface NotificationTemplate {
  id: string
  name: string
  type: 'email' | 'sms' | 'whatsapp'
  subject?: string
  content: string
  variables: string[]
}

interface NotificationResult {
  success: boolean
  messageId?: string
  error?: string
  channel: string
}

interface NotificationHistory {
  id: string
  templateId: string
  templateName: string
  recipientCount: number
  successful: number
  failed: number
  sentAt: string
  status: 'sent' | 'failed' | 'pending'
}

export default function NotificationManager() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [recipients, setRecipients] = useState<NotificationRecipient[]>([])
  const [messageVariables, setMessageVariables] = useState<{ [key: string]: string }>({})
  const [isSending, setIsSending] = useState(false)
  const [results, setResults] = useState<NotificationResult[]>([])
  const [history, setHistory] = useState<NotificationHistory[]>([])
  const [activeTab, setActiveTab] = useState('send')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTemplates()
    fetchHistory()
    loadMockRecipients()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/notifications')
      const data = await response.json()
      if (data.success) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      // Mock history data - in a real implementation, this would come from an API
      const mockHistory: NotificationHistory[] = [
        {
          id: '1',
          templateId: 'order_confirmation',
          templateName: 'Order Confirmation',
          recipientCount: 1,
          successful: 1,
          failed: 0,
          sentAt: new Date(Date.now() - 3600000).toISOString(),
          status: 'sent'
        },
        {
          id: '2',
          templateId: 'promotion_email',
          templateName: 'Promotional Email',
          recipientCount: 50,
          successful: 48,
          failed: 2,
          sentAt: new Date(Date.now() - 7200000).toISOString(),
          status: 'sent'
        }
      ]
      setHistory(mockHistory)
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  const loadMockRecipients = () => {
    // Mock recipients - in a real implementation, this would come from the customer database
    const mockRecipients: NotificationRecipient[] = [
      {
        id: '1',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@email.com',
        phone: '+91 98765 43210',
        preferences: {
          email: true,
          sms: true,
          whatsapp: true
        }
      },
      {
        id: '2',
        name: 'Priya Patel',
        email: 'priya.patel@email.com',
        phone: '+91 98765 43211',
        preferences: {
          email: true,
          sms: false,
          whatsapp: true
        }
      },
      {
        id: '3',
        name: 'Amit Kumar',
        email: 'amit.kumar@email.com',
        phone: '+91 98765 43212',
        preferences: {
          email: false,
          sms: true,
          whatsapp: false
        }
      }
    ]
    setRecipients(mockRecipients)
  }

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = templates.find(t => t.id === templateId)
    if (template) {
      // Initialize variables with empty values
      const initialVariables: { [key: string]: string } = {}
      template.variables.forEach(variable => {
        initialVariables[variable] = ''
      })
      setMessageVariables(initialVariables)
    }
  }

  const handleVariableChange = (variable: string, value: string) => {
    setMessageVariables(prev => ({
      ...prev,
      [variable]: value
    }))
  }

  const handleSendNotifications = async () => {
    if (!selectedTemplate || recipients.length === 0) {
      alert('Please select a template and add recipients')
      return
    }

    setIsSending(true)
    setResults([])

    try {
      const template = templates.find(t => t.id === selectedTemplate)
      if (!template) return

      // Prepare variables for each recipient
      const variablesList = recipients.map(() => ({ ...messageVariables }))

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients,
          templateId: selectedTemplate,
          variablesList,
          priority: 'normal'
        })
      })

      const data = await response.json()
      if (data.success) {
        setResults(data.results)
        
        // Add to history
        const newHistoryItem: NotificationHistory = {
          id: Date.now().toString(),
          templateId: selectedTemplate,
          templateName: template.name,
          recipientCount: recipients.length,
          successful: data.summary.successful,
          failed: data.summary.failed,
          sentAt: new Date().toISOString(),
          status: data.summary.failed === 0 ? 'sent' : 'partial'
        }
        setHistory(prev => [newHistoryItem, ...prev])
      } else {
        alert('Failed to send notifications: ' + data.error)
      }
    } catch (error) {
      console.error('Error sending notifications:', error)
      alert('Failed to send notifications')
    } finally {
      setIsSending(false)
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'sms':
        return <Smartphone className="h-4 w-4" />
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Send className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'partial':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification Manager</h2>
          <p className="text-gray-600">Send SMS, Email, and WhatsApp notifications to customers and staff</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="send">Send Notifications</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send New Notification</CardTitle>
              <CardDescription>Choose a template and customize the message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Selection */}
              <div>
                <Label htmlFor="template">Notification Template</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          {getChannelIcon(template.type)}
                          {template.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Template Preview */}
              {selectedTemplate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Template Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      {templates.find(t => t.id === selectedTemplate)?.subject && (
                        <div>
                          <strong>Subject:</strong> {templates.find(t => t.id === selectedTemplate)?.subject}
                        </div>
                      )}
                      <div>
                        <strong>Content:</strong>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {templates.find(t => t.id === selectedTemplate)?.content}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Variables */}
              {selectedTemplate && messageVariables && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Message Variables</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.keys(messageVariables).map(variable => (
                        <div key={variable}>
                          <Label htmlFor={variable}>{variable}</Label>
                          <Input
                            id={variable}
                            value={messageVariables[variable]}
                            onChange={(e) => handleVariableChange(variable, e.target.value)}
                            placeholder={`Enter ${variable}`}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recipients */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Recipients ({recipients.length})</span>
                    <Button variant="outline" size="sm" onClick={loadMockRecipients}>
                      Load Mock Recipients
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {recipients.map(recipient => (
                      <div key={recipient.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium">{recipient.name}</div>
                          <div className="text-sm text-gray-600">
                            {recipient.email && <span>📧 {recipient.email}</span>}
                            {recipient.phone && <span className="ml-2">📱 {recipient.phone}</span>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {recipient.preferences.email && <Badge variant="secondary">Email</Badge>}
                          {recipient.preferences.sms && <Badge variant="secondary">SMS</Badge>}
                          {recipient.preferences.whatsapp && <Badge variant="secondary">WhatsApp</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Send Button */}
              <Button 
                onClick={handleSendNotifications} 
                disabled={isSending || !selectedTemplate || recipients.length === 0}
                className="w-full"
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Notifications ({recipients.length} recipients)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Send Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        {getChannelIcon(result.channel)}
                        <span className="capitalize">{result.channel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-green-600">Success</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="text-red-600">Failed</span>
                          </>
                        )}
                        {result.messageId && (
                          <span className="text-sm text-gray-500">ID: {result.messageId}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4">
            {templates.map(template => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getChannelIcon(template.type)}
                    {template.name}
                  </CardTitle>
                  <CardDescription>
                    Type: {template.type} • Variables: {template.variables.length}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    {template.subject && (
                      <div>
                        <strong>Subject:</strong> {template.subject}
                      </div>
                    )}
                    <div>
                      <strong>Content:</strong>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto max-h-32">
                        {template.content}
                      </pre>
                    </div>
                    <div>
                      <strong>Variables:</strong> {template.variables.join(', ')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-2">
            {history.map(item => (
              <Card key={item.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <div className="font-medium">{item.templateName}</div>
                        <div className="text-sm text-gray-600">
                          {item.recipientCount} recipients • {new Date(item.sentAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        <span className="text-green-600">{item.successful} sent</span>
                        {item.failed > 0 && (
                          <span className="text-red-600 ml-2">{item.failed} failed</span>
                        )}
                      </div>
                      <Badge variant={item.status === 'sent' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recipients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Recipients</CardTitle>
              <CardDescription>Manage customer notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recipients.map(recipient => (
                  <div key={recipient.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <div className="font-medium">{recipient.name}</div>
                      <div className="text-sm text-gray-600">
                        {recipient.email && <div>📧 {recipient.email}</div>}
                        {recipient.phone && <div>📱 {recipient.phone}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Email:</span>
                        <Switch checked={recipient.preferences.email} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">SMS:</span>
                        <Switch checked={recipient.preferences.sms} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">WhatsApp:</span>
                        <Switch checked={recipient.preferences.whatsapp} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}