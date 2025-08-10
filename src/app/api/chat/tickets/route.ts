import { NextRequest, NextResponse } from 'next/server'

// Mock ticket data - in a real app, this would come from a database
let tickets = [
  {
    id: '1',
    title: 'Payment Gateway Integration Issue',
    description: 'Customers are reporting failed transactions with Razorpay. The error occurs during the payment confirmation step.',
    status: 'in-progress' as const,
    priority: 'high' as const,
    category: 'Payment',
    assignedTo: 'Sarah Chen',
    createdBy: 'user1',
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 3600000),
    tags: ['payment', 'razorpay', 'urgent'],
    estimatedResolution: new Date(Date.now() + 86400000),
    messages: [
      {
        id: '1',
        type: 'user',
        content: 'Payment gateway is not working properly. Customers are getting failed transactions.',
        timestamp: new Date(Date.now() - 86400000),
        status: 'read'
      },
      {
        id: '2',
        type: 'support',
        content: 'We are investigating the issue with Razorpay integration. Our team is looking into the API logs.',
        timestamp: new Date(Date.now() - 43200000),
        status: 'read'
      },
      {
        id: '3',
        type: 'support',
        content: 'Update: We\'ve identified the issue. It\'s related to the webhook configuration. Working on a fix now.',
        timestamp: new Date(Date.now() - 3600000),
        status: 'read'
      }
    ]
  },
  {
    id: '2',
    title: 'Inventory Sync Problem',
    description: 'Inventory levels are not syncing between our main store and the warehouse location.',
    status: 'open' as const,
    priority: 'medium' as const,
    category: 'Inventory',
    assignedTo: 'Mike Johnson',
    createdBy: 'user1',
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 172800000),
    tags: ['inventory', 'sync', 'multi-location'],
    estimatedResolution: new Date(Date.now() + 172800000),
    messages: []
  },
  {
    id: '3',
    title: 'Mobile App Login Issues',
    description: 'Users are reporting login failures on the React Native mobile app. Web login works fine.',
    status: 'resolved' as const,
    priority: 'medium' as const,
    category: 'Mobile',
    assignedTo: 'Emily Davis',
    createdBy: 'user1',
    createdAt: new Date(Date.now() - 259200000),
    updatedAt: new Date(Date.now() - 86400000),
    tags: ['mobile', 'login', 'authentication'],
    estimatedResolution: new Date(Date.now() - 86400000),
    messages: [
      {
        id: '1',
        type: 'user',
        content: 'Mobile app users cannot log in. Getting authentication errors.',
        timestamp: new Date(Date.now() - 259200000),
        status: 'read'
      },
      {
        id: '2',
        type: 'support',
        content: 'We\'ve identified the issue with the mobile app authentication token. A fix has been deployed.',
        timestamp: new Date(Date.now() - 172800000),
        status: 'read'
      },
      {
        id: '3',
        type: 'support',
        content: 'The issue has been resolved. Please update your mobile app to the latest version.',
        timestamp: new Date(Date.now() - 86400000),
        status: 'read'
      }
    ]
  }
]

const supportAgents = [
  { id: '1', name: 'Sarah Chen', specialty: 'Payment Integration' },
  { id: '2', name: 'Mike Johnson', specialty: 'Inventory Management' },
  { id: '3', name: 'Emily Davis', specialty: 'Mobile Development' },
  { id: '4', name: 'Dr. James Wilson', specialty: 'Healthcare Compliance' },
  { id: '5', name: 'Lisa Anderson', specialty: 'Educational Systems' }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')
    
    let filteredTickets = tickets
    
    // Filter by status
    if (status) {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === status)
    }
    
    // Filter by priority
    if (priority) {
      filteredTickets = filteredTickets.filter(ticket => ticket.priority === priority)
    }
    
    // Filter by category
    if (category) {
      filteredTickets = filteredTickets.filter(ticket => ticket.category === category)
    }
    
    // Sort by creation date (newest first)
    filteredTickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    
    return NextResponse.json({
      tickets: filteredTickets,
      agents: supportAgents
    })
    
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json()
    
    if (action === 'create') {
      const { title, description, priority, category, tags } = data
      
      if (!title || !description) {
        return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
      }
      
      // Auto-assign agent based on category
      const assignedAgent = supportAgents.find(agent => 
        agent.specialty.toLowerCase().includes(category.toLowerCase())
      ) || supportAgents[0]
      
      const newTicket = {
        id: Date.now().toString(),
        title,
        description,
        status: 'open' as const,
        priority: priority || 'medium' as const,
        category: category || 'General',
        assignedTo: assignedAgent.name,
        createdBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: tags || [],
        estimatedResolution: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        messages: []
      }
      
      tickets.unshift(newTicket)
      
      return NextResponse.json({
        ticket: newTicket,
        message: 'Ticket created successfully'
      })
    }
    
    if (action === 'update_status') {
      const { ticketId, status } = data
      
      if (!ticketId || !status) {
        return NextResponse.json({ error: 'Ticket ID and status are required' }, { status: 400 })
      }
      
      const ticket = tickets.find(t => t.id === ticketId)
      if (!ticket) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
      }
      
      ticket.status = status
      ticket.updatedAt = new Date()
      
      // Add system message
      ticket.messages.push({
        id: Date.now().toString(),
        type: 'system',
        content: `Ticket status updated to ${status}`,
        timestamp: new Date(),
        status: 'read'
      })
      
      return NextResponse.json({
        ticket,
        message: 'Ticket status updated successfully'
      })
    }
    
    if (action === 'add_message') {
      const { ticketId, message } = data
      
      if (!ticketId || !message) {
        return NextResponse.json({ error: 'Ticket ID and message are required' }, { status: 400 })
      }
      
      const ticket = tickets.find(t => t.id === ticketId)
      if (!ticket) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
      }
      
      const newMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: message,
        timestamp: new Date(),
        status: 'sent'
      }
      
      ticket.messages.push(newMessage)
      ticket.updatedAt = new Date()
      
      // Simulate support response
      setTimeout(() => {
        const supportResponse = {
          id: (Date.now() + 1).toString(),
          type: 'support',
          content: getSupportResponse(message, ticket.category),
          timestamp: new Date(),
          status: 'delivered'
        }
        
        ticket.messages.push(supportResponse)
        ticket.updatedAt = new Date()
      }, 3000)
      
      return NextResponse.json({
        message: 'Message added successfully',
        ticket
      })
    }
    
    if (action === 'assign_agent') {
      const { ticketId, agentId } = data
      
      if (!ticketId || !agentId) {
        return NextResponse.json({ error: 'Ticket ID and agent ID are required' }, { status: 400 })
      }
      
      const ticket = tickets.find(t => t.id === ticketId)
      if (!ticket) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
      }
      
      const agent = supportAgents.find(a => a.id === agentId)
      if (!agent) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
      }
      
      ticket.assignedTo = agent.name
      ticket.updatedAt = new Date()
      
      // Add system message
      ticket.messages.push({
        id: Date.now().toString(),
        type: 'system',
        content: `Ticket assigned to ${agent.name}`,
        timestamp: new Date(),
        status: 'read'
      })
      
      return NextResponse.json({
        ticket,
        message: 'Agent assigned successfully'
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (error) {
    console.error('Error in ticket API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getSupportResponse(message: string, category: string): string {
  const lowerMessage = message.toLowerCase()
  
  if (category === 'Payment') {
    if (lowerMessage.includes('failed') || lowerMessage.includes('error')) {
      return 'I understand you\'re experiencing payment failures. Let me check your payment gateway configuration and recent transaction logs to identify the issue.'
    }
    return 'Thank you for the additional information about your payment issue. Our team is investigating this and will provide a solution soon.'
  }
  
  if (category === 'Inventory') {
    if (lowerMessage.includes('sync') || lowerMessage.includes('location')) {
      return 'I see you\'re having inventory sync issues between locations. Let me check your sync settings and recent sync logs to diagnose the problem.'
    }
    return 'Thank you for providing details about your inventory issue. We\'re working on resolving the sync problem between your locations.'
  }
  
  if (category === 'Mobile') {
    if (lowerMessage.includes('login') || lowerMessage.includes('authentication')) {
      return 'I understand you\'re experiencing login issues with the mobile app. Let me check the authentication service and mobile app logs.'
    }
    return 'Thank you for reporting the mobile app issue. Our development team is investigating the problem and will provide an update soon.'
  }
  
  return 'Thank you for providing additional information about your issue. Our support team is reviewing this and will work on resolving it as soon as possible.'
}