'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Star,
  Flag,
  AlertTriangle,
  CheckCircle,
  Clock,
  Tag,
  Paperclip,
  MoreHorizontal,
  ThumbsUp,
  Heart,
  Frown,
  Smile,
  Meh
} from 'lucide-react'
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns'

interface CustomerNote {
  id: string
  customerId: string
  customerName: string
  title: string
  content: string
  type: 'GENERAL' | 'COMPLAINT' | 'COMPLIMENT' | 'FEEDBACK' | 'REMINDER' | 'WARNING'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  tags: string[]
  attachments: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
  assignedTo?: string
  dueDate?: string
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
  lastVisit: string
  loyaltyPoints: number
}

export default function CustomerNotes() {
  const [isLoading, setIsLoading] = useState(true)
  const [notes, setNotes] = useState<CustomerNote[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedNote, setSelectedNote] = useState<CustomerNote | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    type: '',
    priority: '',
    status: '',
    customer: '',
    sentiment: ''
  })
  const [newNote, setNewNote] = useState({
    customerId: '',
    title: '',
    content: '',
    type: 'GENERAL' as CustomerNote['type'],
    priority: 'MEDIUM' as CustomerNote['priority'],
    tags: '',
    dueDate: ''
  })

  useEffect(() => {
    loadCustomerNotes()
    loadCustomers()
  }, [])

  const loadCustomerNotes = () => {
    const mockNotes: CustomerNote[] = [
      {
        id: '1',
        customerId: '1',
        customerName: 'John Doe',
        title: 'Excellent Service Experience',
        content: 'Customer was very happy with the service and mentioned they would recommend us to friends. They particularly appreciated the quick response time and professional attitude of the staff.',
        type: 'COMPLIMENT',
        priority: 'MEDIUM',
        status: 'RESOLVED',
        tags: ['service', 'recommendation', 'positive'],
        attachments: [],
        createdBy: 'Sarah Johnson',
        createdAt: '2024-10-15T10:30:00Z',
        updatedAt: '2024-10-15T11:00:00Z',
        sentiment: 'POSITIVE'
      },
      {
        id: '2',
        customerId: '2',
        customerName: 'Jane Smith',
        title: 'Order Delay Complaint',
        content: 'Customer complained about significant delay in their order. They waited for 45 minutes beyond the promised delivery time. Need to follow up and offer compensation.',
        type: 'COMPLAINT',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        tags: ['delay', 'delivery', 'complaint'],
        attachments: ['order_details.pdf'],
        createdBy: 'Mike Chen',
        createdAt: '2024-10-14T14:20:00Z',
        updatedAt: '2024-10-14T15:30:00Z',
        assignedTo: 'Manager',
        dueDate: '2024-10-16T17:00:00Z',
        sentiment: 'NEGATIVE'
      },
      {
        id: '3',
        customerId: '3',
        customerName: 'Bob Johnson',
        title: 'Product Quality Feedback',
        content: 'Customer provided detailed feedback about product quality. They suggested some improvements and mentioned they would like to see more variety in the menu.',
        type: 'FEEDBACK',
        priority: 'MEDIUM',
        status: 'OPEN',
        tags: ['quality', 'feedback', 'suggestions'],
        attachments: ['feedback_form.pdf'],
        createdBy: 'Emily Rodriguez',
        createdAt: '2024-10-13T09:15:00Z',
        updatedAt: '2024-10-13T09:15:00Z',
        sentiment: 'NEUTRAL'
      },
      {
        id: '4',
        customerId: '1',
        customerName: 'John Doe',
        title: 'Follow up on loyalty program',
        content: 'Remind customer about their expiring loyalty points and suggest redemption options. They have been a loyal customer for over 2 years.',
        type: 'REMINDER',
        priority: 'LOW',
        status: 'OPEN',
        tags: ['loyalty', 'follow-up', 'retention'],
        attachments: [],
        createdBy: 'Sarah Johnson',
        createdAt: '2024-10-12T16:45:00Z',
        updatedAt: '2024-10-12T16:45:00Z',
        dueDate: '2024-10-20T12:00:00Z'
      }
    ]
    setNotes(mockNotes)
    setIsLoading(false)
  }

  const loadCustomers = () => {
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 234-567-8900',
        totalOrders: 45,
        totalSpent: 12500,
        lastVisit: '2024-10-15',
        loyaltyPoints: 2500
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1 234-567-8901',
        totalOrders: 23,
        totalSpent: 8900,
        lastVisit: '2024-10-14',
        loyaltyPoints: 1800
      },
      {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        phone: '+1 234-567-8902',
        totalOrders: 67,
        totalSpent: 15600,
        lastVisit: '2024-10-13',
        loyaltyPoints: 3200
      }
    ]
    setCustomers(mockCustomers)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'COMPLIMENT': return 'bg-green-100 text-green-800'
      case 'COMPLAINT': return 'bg-red-100 text-red-800'
      case 'FEEDBACK': return 'bg-blue-100 text-blue-800'
      case 'REMINDER': return 'bg-yellow-100 text-yellow-800'
      case 'WARNING': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-gray-100 text-gray-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'RESOLVED': return 'bg-green-100 text-green-800'
      case 'CLOSED': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'POSITIVE': return <ThumbsUp className="h-4 w-4 text-green-600" />
      case 'NEGATIVE': return <ThumbsUp className="h-4 w-4 text-red-600 rotate-180" />
      case 'NEUTRAL': return <Meh className="h-4 w-4 text-gray-600" />
      default: return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'COMPLIMENT': return <Star className="h-4 w-4" />
      case 'COMPLAINT': return <AlertTriangle className="h-4 w-4" />
      case 'FEEDBACK': return <MessageSquare className="h-4 w-4" />
      case 'REMINDER': return <Clock className="h-4 w-4" />
      case 'WARNING': return <Flag className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const filteredNotes = notes.filter(note => {
    if (searchTerm && !note.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !note.content.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !note.customerName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (filters.type && note.type !== filters.type) return false
    if (filters.priority && note.priority !== filters.priority) return false
    if (filters.status && note.status !== filters.status) return false
    if (filters.customer && note.customerId !== filters.customer) return false
    if (filters.sentiment && note.sentiment !== filters.sentiment) return false
    return true
  })

  const groupedNotes = filteredNotes.reduce((acc, note) => {
    const date = new Date(note.createdAt)
    let group = 'Older'
    
    if (isToday(date)) group = 'Today'
    else if (isYesterday(date)) group = 'Yesterday'
    else if (isThisWeek(date)) group = 'This Week'
    else if (isThisMonth(date)) group = 'This Month'
    
    if (!acc[group]) acc[group] = []
    acc[group].push(note)
    return acc
  }, {} as Record<string, CustomerNote[]>)

  const handleCreateNote = () => {
    if (!newNote.customerId || !newNote.title || !newNote.content) {
      alert('Please fill in all required fields')
      return
    }

    const customer = customers.find(c => c.id === newNote.customerId)
    if (!customer) return

    const note: CustomerNote = {
      id: Date.now().toString(),
      customerId: newNote.customerId,
      customerName: customer.name,
      title: newNote.title,
      content: newNote.content,
      type: newNote.type,
      priority: newNote.priority,
      status: 'OPEN',
      tags: newNote.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      attachments: [],
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: newNote.dueDate || undefined
    }

    setNotes([note, ...notes])
    setNewNote({
      customerId: '',
      title: '',
      content: '',
      type: 'GENERAL',
      priority: 'MEDIUM',
      tags: '',
      dueDate: ''
    })
    setIsCreateDialogOpen(false)
  }

  const updateNoteStatus = (noteId: string, status: CustomerNote['status']) => {
    setNotes(notes.map(note => 
      note.id === noteId 
        ? { ...note, status, updatedAt: new Date().toISOString() }
        : note
    ))
  }

  const deleteNote = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== noteId))
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Notes</h1>
          <p className="text-gray-600">Track customer interactions, feedback, and important information</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Customer Note</DialogTitle>
              <DialogDescription>Add a new note about a customer interaction</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customer">Customer</Label>
                <Select value={newNote.customerId} onValueChange={(value) => setNewNote({...newNote, customerId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter note title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter note content"
                  rows={4}
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={newNote.type} onValueChange={(value) => setNewNote({...newNote, type: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="COMPLIMENT">Compliment</SelectItem>
                      <SelectItem value="COMPLAINT">Complaint</SelectItem>
                      <SelectItem value="FEEDBACK">Feedback</SelectItem>
                      <SelectItem value="REMINDER">Reminder</SelectItem>
                      <SelectItem value="WARNING">Warning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newNote.priority} onValueChange={(value) => setNewNote({...newNote, priority: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="tag1, tag2, tag3"
                    value={newNote.tags}
                    onChange={(e) => setNewNote({...newNote, tags: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="dueDate">Due Date (optional)</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={newNote.dueDate}
                    onChange={(e) => setNewNote({...newNote, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateNote} className="flex-1">
                  Create Note
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="type-filter">Type</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="COMPLIMENT">Compliment</SelectItem>
                  <SelectItem value="COMPLAINT">Complaint</SelectItem>
                  <SelectItem value="FEEDBACK">Feedback</SelectItem>
                  <SelectItem value="REMINDER">Reminder</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority-filter">Priority</Label>
              <Select value={filters.priority} onValueChange={(value) => setFilters({...filters, priority: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priorities</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="customer-filter">Customer</Label>
              <Select value={filters.customer} onValueChange={(value) => setFilters({...filters, customer: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Customers</SelectItem>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <div className="space-y-6">
        {Object.entries(groupedNotes).map(([group, groupNotes]) => (
          <div key={group}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{group}</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {groupNotes.map((note) => (
                <Card key={note.id} className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(note.type)}
                        <Badge className={getTypeColor(note.type)}>
                          {note.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {getSentimentIcon(note.sentiment)}
                        <Badge className={getPriorityColor(note.priority)}>
                          {note.priority}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {note.customerName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-3">{note.content}</p>
                    
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDate(note.createdAt)}</span>
                      <Badge className={getStatusColor(note.status)}>
                        {note.status}
                      </Badge>
                    </div>

                    {note.dueDate && (
                      <div className="flex items-center gap-1 text-xs text-orange-600">
                        <Clock className="h-3 w-3" />
                        Due: {format(new Date(note.dueDate), 'MMM dd, yyyy')}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {note.status === 'OPEN' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateNoteStatus(note.id, 'IN_PROGRESS')}
                        >
                          Start
                        </Button>
                      )}
                      {note.status === 'IN_PROGRESS' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateNoteStatus(note.id, 'RESOLVED')}
                        >
                          Resolve
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => deleteNote(note.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or create a new note</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}