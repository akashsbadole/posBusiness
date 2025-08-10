'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Bell, 
  Plus, 
  Send, 
  CalendarIcon, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Filter,
  Search,
  Eye,
  Trash2,
  Edit
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface CustomerNotification {
  id: string
  restaurantId: string
  customerId?: string
  type: 'PROMOTIONAL' | 'TRANSACTIONAL' | 'REMINDER' | 'ALERT'
  channel: 'SMS' | 'EMAIL' | 'WHATSAPP' | 'PUSH'
  title: string
  message: string
  status: 'PENDING' | 'SENDING' | 'SENT' | 'FAILED' | 'SCHEDULED'
  templateId?: string
  scheduledFor?: Date
  sentAt?: Date
  errorMessage?: string
  metadata?: any
  createdAt: string
  updatedAt: string
  customer?: {
    id: string
    name: string
    phone: string
    email: string
  }
}

interface NotificationTemplate {
  id: string
  restaurantId: string
  name: string
  type: 'PROMOTIONAL' | 'TRANSACTIONAL' | 'REMINDER' | 'ALERT'
  channel: 'SMS' | 'EMAIL' | 'WHATSAPP' | 'PUSH'
  subject?: string
  message: string
  variables?: any
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CustomerNotificationsProps {
  restaurantId: string
}

export default function CustomerNotifications({ restaurantId }: CustomerNotificationsProps) {
  const [notifications, setNotifications] = useState<CustomerNotification[]>([])
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isManagingTemplates, setIsManagingTemplates] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchNotifications()
    fetchTemplates()
  }, [restaurantId])

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications/customer?restaurantId=${restaurantId}&type=${filter === 'all' ? '' : filter}`)
      const data = await response.json()
      setNotifications(data)
    } catch (error) {
      toast.error('Failed to fetch notifications')
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`/api/notifications/templates?restaurantId=${restaurantId}`)
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      toast.error('Failed to fetch templates')
    }
  }

  const handleSendNotification = async (notificationData: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/notifications/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          ...notificationData
        })
      })

      if (response.ok) {
        await fetchNotifications()
        setIsCreating(false)
        toast.success('Notification sent successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to send notification')
      }
    } catch (error) {
      toast.error('Failed to send notification')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'bg-green-500'
      case 'FAILED': return 'bg-red-500'
      case 'SENDING': return 'bg-blue-500'
      case 'SCHEDULED': return 'bg-yellow-500'
      case 'PENDING': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT': return <CheckCircle className="w-4 h-4" />
      case 'FAILED': return <XCircle className="w-4 h-4" />
      case 'SENDING': return <Clock className="w-4 h-4" />
      case 'SCHEDULED': return <CalendarIcon className="w-4 h-4" />
      case 'PENDING': return <Clock className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'SMS': return <Smartphone className="w-4 h-4" />
      case 'EMAIL': return <Mail className="w-4 h-4" />
      case 'WHATSAPP': return <MessageSquare className="w-4 h-4" />
      case 'PUSH': return <Bell className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || notification.type.toLowerCase() === filter.toLowerCase()
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (notification.customer?.name && notification.customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customer Notifications</h2>
          <p className="text-muted-foreground">
            Send promotional messages, order updates, and alerts to customers
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isManagingTemplates} onOpenChange={setIsManagingTemplates}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Notification Templates</DialogTitle>
                <DialogDescription>
                  Manage notification templates for quick messaging
                </DialogDescription>
              </DialogHeader>
              <TemplateManager 
                templates={templates} 
                restaurantId={restaurantId}
                onUpdate={fetchTemplates}
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Send Notification</DialogTitle>
                <DialogDescription>
                  Create and send a new customer notification
                </DialogDescription>
              </DialogHeader>
              <NotificationForm
                templates={templates}
                onSubmit={handleSendNotification}
                onCancel={() => setIsCreating(false)}
                loading={loading}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="transactional">Transactional</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
            
            {filteredNotifications.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">No notifications found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Analytics</CardTitle>
              <CardDescription>
                View performance metrics for your notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {notifications.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {notifications.filter(n => n.status === 'SENT').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Delivered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {notifications.filter(n => n.status === 'FAILED').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {notifications.filter(n => n.status === 'SCHEDULED').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Scheduled</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure notification preferences and channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center text-muted-foreground py-8">
                  Notification settings will be implemented here
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface NotificationCardProps {
  notification: CustomerNotification
}

function NotificationCard({ notification }: NotificationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'bg-green-500'
      case 'FAILED': return 'bg-red-500'
      case 'SENDING': return 'bg-blue-500'
      case 'SCHEDULED': return 'bg-yellow-500'
      case 'PENDING': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT': return <CheckCircle className="w-4 h-4" />
      case 'FAILED': return <XCircle className="w-4 h-4" />
      case 'SENDING': return <Clock className="w-4 h-4" />
      case 'SCHEDULED': return <CalendarIcon className="w-4 h-4" />
      case 'PENDING': return <Clock className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'SMS': return <Smartphone className="w-4 h-4" />
      case 'EMAIL': return <Mail className="w-4 h-4" />
      case 'WHATSAPP': return <MessageSquare className="w-4 h-4" />
      case 'PUSH': return <Bell className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              {getChannelIcon(notification.channel)}
              <h3 className="text-lg font-semibold">{notification.title}</h3>
              <Badge variant="outline">{notification.type}</Badge>
              <Badge 
                variant="secondary" 
                className={`${getStatusColor(notification.status)} text-white`}
              >
                {getStatusIcon(notification.status)}
                <span className="ml-1">{notification.status}</span>
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">{notification.message}</p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {notification.customer && (
                <span>Customer: {notification.customer.name}</span>
              )}
              {notification.scheduledFor && (
                <span>Scheduled: {format(new Date(notification.scheduledFor), 'MMM dd, yyyy HH:mm')}</span>
              )}
              {notification.sentAt && (
                <span>Sent: {format(new Date(notification.sentAt), 'MMM dd, yyyy HH:mm')}</span>
              )}
              <span>Created: {format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}</span>
            </div>

            {notification.errorMessage && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                Error: {notification.errorMessage}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface NotificationFormProps {
  templates: NotificationTemplate[]
  onSubmit: (data: any) => void
  onCancel: () => void
  loading?: boolean
}

function NotificationForm({ templates, onSubmit, onCancel, loading = false }: NotificationFormProps) {
  const [formData, setFormData] = useState({
    type: 'PROMOTIONAL',
    channel: 'SMS',
    customerId: '',
    title: '',
    message: '',
    templateId: '',
    scheduledFor: '',
    isScheduled: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      scheduledFor: formData.isScheduled ? formData.scheduledFor : null
    })
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setFormData(prev => ({
        ...prev,
        templateId,
        type: template.type,
        channel: template.channel,
        title: template.subject || '',
        message: template.message
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="notification-type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PROMOTIONAL">Promotional</SelectItem>
              <SelectItem value="TRANSACTIONAL">Transactional</SelectItem>
              <SelectItem value="REMINDER">Reminder</SelectItem>
              <SelectItem value="ALERT">Alert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="notification-channel">Channel</Label>
          <Select
            value={formData.channel}
            onValueChange={(value) => setFormData(prev => ({ ...prev, channel: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SMS">SMS</SelectItem>
              <SelectItem value="EMAIL">Email</SelectItem>
              <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
              <SelectItem value="PUSH">Push Notification</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="template">Template (Optional)</Label>
          <Select
            value={formData.templateId}
            onValueChange={handleTemplateSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name} ({template.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="customer-id">Customer ID (Optional)</Label>
          <Input
            id="customer-id"
            value={formData.customerId}
            onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
            placeholder="Leave empty for broadcast"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notification-title">Title</Label>
        <Input
          id="notification-title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="notification-message">Message</Label>
        <Textarea
          id="notification-message"
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          rows={4}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="schedule-notification"
          checked={formData.isScheduled}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isScheduled: checked }))}
        />
        <Label htmlFor="schedule-notification">Schedule for later</Label>
      </div>

      {formData.isScheduled && (
        <div>
          <Label htmlFor="scheduled-for">Schedule Date & Time</Label>
          <Input
            id="scheduled-for"
            type="datetime-local"
            value={formData.scheduledFor}
            onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
            min={new Date().toISOString().slice(0, 16)}
            required
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Notification'}
        </Button>
      </div>
    </form>
  )
}

interface TemplateManagerProps {
  templates: NotificationTemplate[]
  restaurantId: string
  onUpdate: () => void
}

function TemplateManager({ templates, restaurantId, onUpdate }: TemplateManagerProps) {
  const [isCreating, setIsCreating] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Notification Templates</h3>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id}>
              <TableCell>{template.name}</TableCell>
              <TableCell>{template.type}</TableCell>
              <TableCell>{template.channel}</TableCell>
              <TableCell>
                <Badge variant={template.isActive ? 'default' : 'secondary'}>
                  {template.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {templates.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No templates found. Create your first template to get started.
        </div>
      )}
    </div>
  )
}