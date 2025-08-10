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
  Ticket, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Users, 
  Clock, 
  MapPin, 
  Phone,
  CheckCircle,
  AlertTriangle,
  Settings,
  QrCode,
  Printer,
  Share2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PredefinedTicket {
  id: string
  name: string
  description?: string
  type: 'table' | 'takeaway' | 'delivery' | 'online' | 'phone'
  status: 'active' | 'inactive' | 'archived'
  tableNumber?: number
  capacity?: number
  location?: string
  area?: string
  phone?: string
  email?: string
  defaultItems?: string[]
  specialInstructions?: string
  orderCount: number
  revenue: number
  lastUsed: Date
  createdAt: Date
  updatedAt: Date
  settings: TicketSettings
}

interface TicketSettings {
  requiresConfirmation: boolean
  autoAssignStaff: boolean
  notificationEnabled: boolean
  priority: 'low' | 'normal' | 'high'
  preparationTime: number
  maxOrders: number
  timeSlots?: TimeSlot[]
  customFields?: CustomField[]
}

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  maxOrders: number
  isActive: boolean
}

interface CustomField {
  id: string
  name: string
  type: 'text' | 'number' | 'select' | 'boolean'
  required: boolean
  options?: string[]
  defaultValue?: string | number | boolean
}

interface TicketTemplate {
  id: string
  name: string
  description: string
  type: PredefinedTicket['type']
  isDefault: boolean
  settings: Partial<TicketSettings>
}

export default function PredefinedTickets() {
  const [tickets, setTickets] = useState<PredefinedTicket[]>([
    {
      id: '1',
      name: 'Table 1',
      description: 'Window seat for 2 people',
      type: 'table',
      status: 'active',
      tableNumber: 1,
      capacity: 2,
      location: 'Window Area',
      defaultItems: ['Water', 'Menu'],
      specialInstructions: 'Premium window seat with city view',
      orderCount: 45,
      revenue: 36000,
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      settings: {
        requiresConfirmation: true,
        autoAssignStaff: true,
        notificationEnabled: true,
        priority: 'normal',
        preparationTime: 20,
        maxOrders: 10
      }
    },
    {
      id: '2',
      name: 'Takeaway Counter',
      description: 'Quick pickup orders',
      type: 'takeaway',
      status: 'active',
      phone: '+91 22 1234 5678',
      defaultItems: ['Packaging', 'Utensils'],
      specialInstructions: 'Ready in 15 minutes',
      orderCount: 89,
      revenue: 45000,
      lastUsed: new Date(Date.now() - 30 * 60 * 1000),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000),
      settings: {
        requiresConfirmation: false,
        autoAssignStaff: false,
        notificationEnabled: true,
        priority: 'normal',
        preparationTime: 15,
        maxOrders: 20
      }
    },
    {
      id: '3',
      name: 'Delivery Zone 1',
      description: 'Central area delivery',
      type: 'delivery',
      status: 'active',
      area: 'Downtown',
      phone: '+91 22 1234 5678',
      email: 'delivery@restaurant.com',
      defaultItems: ['Delivery packaging', 'Utensils'],
      specialInstructions: '30-45 minutes delivery time',
      orderCount: 156,
      revenue: 125000,
      lastUsed: new Date(Date.now() - 45 * 60 * 1000),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 45 * 60 * 1000),
      settings: {
        requiresConfirmation: true,
        autoAssignStaff: true,
        notificationEnabled: true,
        priority: 'normal',
        preparationTime: 30,
        maxOrders: 15
      }
    },
    {
      id: '4',
      name: 'Phone Orders',
      description: 'Telephone order bookings',
      type: 'phone',
      status: 'active',
      phone: '+91 22 1234 5678',
      specialInstructions: 'Call for reservations and orders',
      orderCount: 67,
      revenue: 54000,
      lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      settings: {
        requiresConfirmation: true,
        autoAssignStaff: true,
        notificationEnabled: true,
        priority: 'high',
        preparationTime: 25,
        maxOrders: 25
      }
    }
  ])

  const [templates, setTemplates] = useState<TicketTemplate[]>([
    {
      id: '1',
      name: 'Standard Table',
      description: 'Regular dining table setup',
      type: 'table',
      isDefault: true,
      settings: {
        requiresConfirmation: true,
        autoAssignStaff: true,
        notificationEnabled: true,
        priority: 'normal',
        preparationTime: 20,
        maxOrders: 10
      }
    },
    {
      id: '2',
      name: 'Express Takeaway',
      description: 'Fast pickup service',
      type: 'takeaway',
      isDefault: true,
      settings: {
        requiresConfirmation: false,
        autoAssignStaff: false,
        notificationEnabled: true,
        priority: 'normal',
        preparationTime: 15,
        maxOrders: 20
      }
    }
  ])

  const [isAddingTicket, setIsAddingTicket] = useState(false)
  const [editingTicket, setEditingTicket] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<PredefinedTicket['type']>('table')
  const [newTicket, setNewTicket] = useState<Partial<PredefinedTicket>>({
    name: '',
    description: '',
    type: 'table',
    status: 'active',
    settings: {
      requiresConfirmation: true,
      autoAssignStaff: true,
      notificationEnabled: true,
      priority: 'normal',
      preparationTime: 20,
      maxOrders: 10
    }
  })
  const { toast } = useToast()

  const filteredTickets = tickets.filter(ticket => ticket.type === selectedType)

  const handleAddTicket = () => {
    if (!newTicket.name) {
      toast({
        title: "Validation Error",
        description: "Ticket name is required.",
        variant: "destructive"
      })
      return
    }

    const ticket: PredefinedTicket = {
      id: Date.now().toString(),
      name: newTicket.name!,
      description: newTicket.description,
      type: newTicket.type!,
      status: newTicket.status!,
      tableNumber: newTicket.tableNumber,
      capacity: newTicket.capacity,
      location: newTicket.location,
      area: newTicket.area,
      phone: newTicket.phone,
      email: newTicket.email,
      defaultItems: newTicket.defaultItems,
      specialInstructions: newTicket.specialInstructions,
      orderCount: 0,
      revenue: 0,
      lastUsed: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: newTicket.settings!
    }

    setTickets(prev => [...prev, ticket])
    setIsAddingTicket(false)
    setNewTicket({
      name: '',
      description: '',
      type: 'table',
      status: 'active',
      settings: {
        requiresConfirmation: true,
        autoAssignStaff: true,
        notificationEnabled: true,
        priority: 'normal',
        preparationTime: 20,
        maxOrders: 10
      }
    })

    toast({
      title: "Ticket Created",
      description: "New predefined ticket has been created successfully."
    })
  }

  const handleDeleteTicket = (ticketId: string) => {
    setTickets(prev => prev.filter(ticket => ticket.id !== ticketId))
    toast({
      title: "Ticket Deleted",
      description: "Predefined ticket has been deleted successfully."
    })
  }

  const handleToggleTicket = (ticketId: string) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            status: ticket.status === 'active' ? 'inactive' : 'active',
            updatedAt: new Date()
          } 
        : ticket
    ))

    const ticket = tickets.find(t => t.id === ticketId)
    toast({
      title: ticket?.status === 'active' ? "Ticket Deactivated" : "Ticket Activated",
      description: `Predefined ticket has been ${ticket?.status === 'active' ? 'deactivated' : 'activated'}.`
    })
  }

  const handleEditTicket = (ticketId: string) => {
    setEditingTicket(ticketId)
  }

  const handleSaveTicket = (ticketId: string) => {
    setEditingTicket(null)
    toast({
      title: "Ticket Updated",
      description: "Predefined ticket has been updated successfully."
    })
  }

  const handlePrintTicket = (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId)
    toast({
      title: "Printing Ticket",
      description: `Printing ticket for ${ticket?.name}...`
    })
  }

  const handleShareTicket = (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId)
    toast({
      title: "Sharing Ticket",
      description: `Sharing QR code for ${ticket?.name}...`
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'table': return <Users className="h-4 w-4" />
      case 'takeaway': return <Ticket className="h-4 w-4" />
      case 'delivery': return <MapPin className="h-4 w-4" />
      case 'phone': return <Phone className="h-4 w-4" />
      case 'online': return <QrCode className="h-4 w-4" />
      default: return <Ticket className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'inactive': return 'bg-gray-500'
      case 'archived': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeStats = () => {
    const stats = {
      table: { active: 0, total: 0, revenue: 0 },
      takeaway: { active: 0, total: 0, revenue: 0 },
      delivery: { active: 0, total: 0, revenue: 0 },
      phone: { active: 0, total: 0, revenue: 0 },
      online: { active: 0, total: 0, revenue: 0 }
    }

    tickets.forEach(ticket => {
      stats[ticket.type].total++
      stats[ticket.type].revenue += ticket.revenue
      if (ticket.status === 'active') {
        stats[ticket.type].active++
      }
    })

    return stats
  }

  const typeStats = getTypeStats()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Predefined Tickets</h2>
          <p className="text-gray-600">Manage predefined order tickets for quick service</p>
        </div>
        <Button onClick={() => setIsAddingTicket(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Ticket
        </Button>
      </div>

      {/* Type Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(typeStats).map(([type, stats]) => (
          <Card key={type} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedType(type as PredefinedTicket['type'])}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(type)}
                  <span className="text-sm font-medium capitalize">{type}</span>
                </div>
                {selectedType === type && <CheckCircle className="h-4 w-4 text-green-500" />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Active</span>
                  <span className="font-medium">{stats.active}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-medium">{stats.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Revenue</span>
                  <span className="font-medium">₹{stats.revenue.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Ticket Form */}
      {isAddingTicket && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardHeader>
            <CardTitle>Create New Predefined Ticket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-name">Ticket Name</Label>
                <Input
                  id="ticket-name"
                  value={newTicket.name}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter ticket name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-type">Ticket Type</Label>
                <Select
                  value={newTicket.type}
                  onValueChange={(value) => setNewTicket(prev => ({ ...prev, type: value as PredefinedTicket['type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="takeaway">Takeaway</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-description">Description</Label>
                <Textarea
                  id="ticket-description"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter ticket description"
                />
              </div>
              {newTicket.type === 'table' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="table-number">Table Number</Label>
                    <Input
                      id="table-number"
                      type="number"
                      value={newTicket.tableNumber}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, tableNumber: parseInt(e.target.value) }))}
                      placeholder="Enter table number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="table-capacity">Capacity</Label>
                    <Input
                      id="table-capacity"
                      type="number"
                      value={newTicket.capacity}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                      placeholder="Enter seating capacity"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="table-location">Location</Label>
                    <Input
                      id="table-location"
                      value={newTicket.location}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter table location"
                    />
                  </div>
                </>
              )}
              {newTicket.type === 'delivery' && (
                <div className="space-y-2">
                  <Label htmlFor="delivery-area">Delivery Area</Label>
                  <Input
                    id="delivery-area"
                    value={newTicket.area}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, area: e.target.value }))}
                    placeholder="Enter delivery area"
                  />
                </div>
              )}
              {(newTicket.type === 'takeaway' || newTicket.type === 'delivery' || newTicket.type === 'phone') && (
                <div className="space-y-2">
                  <Label htmlFor="ticket-phone">Phone Number</Label>
                  <Input
                    id="ticket-phone"
                    value={newTicket.phone}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="special-instructions">Special Instructions</Label>
                <Textarea
                  id="special-instructions"
                  value={newTicket.specialInstructions}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  placeholder="Enter special instructions"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddTicket}>
                <Save className="mr-2 h-4 w-4" />
                Create Ticket
              </Button>
              <Button variant="outline" onClick={() => setIsAddingTicket(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tickets List */}
      <div className="grid gap-4">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(ticket.type)}
                    <CardTitle className="text-lg">{ticket.name}</CardTitle>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                    <Badge className={getPriorityColor(ticket.settings.priority)}>
                      {ticket.settings.priority}
                    </Badge>
                  </div>
                  <CardDescription>{ticket.description}</CardDescription>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {ticket.settings.preparationTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {ticket.orderCount} orders
                    </span>
                    <span>₹{ticket.revenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={ticket.status === 'active'}
                    onCheckedChange={() => handleToggleTicket(ticket.id)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrintTicket(ticket.id)}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShareTicket(ticket.id)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  {editingTicket === ticket.id ? (
                    <Button
                      size="sm"
                      onClick={() => handleSaveTicket(ticket.id)}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTicket(ticket.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTicket(ticket.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Details</div>
                  <div className="space-y-1 text-sm">
                    {ticket.tableNumber && (
                      <div>Table: {ticket.tableNumber}</div>
                    )}
                    {ticket.capacity && (
                      <div>Capacity: {ticket.capacity} seats</div>
                    )}
                    {ticket.location && (
                      <div>Location: {ticket.location}</div>
                    )}
                    {ticket.area && (
                      <div>Area: {ticket.area}</div>
                    )}
                    {ticket.phone && (
                      <div>Phone: {ticket.phone}</div>
                    )}
                    {ticket.email && (
                      <div>Email: {ticket.email}</div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Settings</div>
                  <div className="space-y-1 text-sm">
                    <div>Max Orders: {ticket.settings.maxOrders}</div>
                    <div>Requires Confirmation: {ticket.settings.requiresConfirmation ? 'Yes' : 'No'}</div>
                    <div>Auto Assign Staff: {ticket.settings.autoAssignStaff ? 'Yes' : 'No'}</div>
                    <div>Notifications: {ticket.settings.notificationEnabled ? 'Enabled' : 'Disabled'}</div>
                  </div>
                </div>
              </div>
              
              {ticket.specialInstructions && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <div className="text-sm font-medium text-yellow-800 mb-1">Special Instructions</div>
                  <div className="text-sm text-yellow-700">{ticket.specialInstructions}</div>
                </div>
              )}
              
              {ticket.defaultItems && ticket.defaultItems.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Default Items</div>
                  <div className="flex flex-wrap gap-2">
                    {ticket.defaultItems.map((item, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-500">No predefined tickets found for this type.</p>
              <Button className="mt-4" onClick={() => setIsAddingTicket(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}