import { NextRequest, NextResponse } from 'next/server'

// Mock developer data - in a real app, this would come from a database
const developers = [
  {
    id: '1',
    businessType: 'Restaurant',
    name: 'Sarah Chen',
    email: 'sarah.chen@posbiz.com',
    expertise: ['Payment Integration', 'API Development', 'Performance Optimization'],
    status: 'online',
    availability: 'Available now',
    responseTime: '< 5 minutes'
  },
  {
    id: '2',
    businessType: 'Retail',
    name: 'Mike Johnson',
    email: 'mike.johnson@posbiz.com',
    expertise: ['Inventory Management', 'Multi-location Sync', 'Custom Reports'],
    status: 'busy',
    availability: 'Available in 30 minutes',
    responseTime: '< 30 minutes'
  },
  {
    id: '3',
    businessType: 'Service',
    name: 'Emily Davis',
    email: 'emily.davis@posbiz.com',
    expertise: ['Customer Management', 'Loyalty Programs', 'Mobile Integration'],
    status: 'offline',
    availability: 'Available tomorrow',
    responseTime: '< 2 hours'
  },
  {
    id: '4',
    businessType: 'Healthcare',
    name: 'Dr. James Wilson',
    email: 'james.wilson@posbiz.com',
    expertise: ['Healthcare Compliance', 'Patient Management', 'HIPAA Integration'],
    status: 'online',
    availability: 'Available now',
    responseTime: '< 10 minutes'
  },
  {
    id: '5',
    businessType: 'Education',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@posbiz.com',
    expertise: ['Educational Tools', 'Student Management', 'Reporting Systems'],
    status: 'busy',
    availability: 'Available in 1 hour',
    responseTime: '< 1 hour'
  }
]

// Mock chat sessions
let chatSessions = [
  {
    id: '1',
    developerId: '1',
    userId: 'user1',
    messages: [
      {
        id: '1',
        type: 'user',
        content: 'Hi Sarah, I need help with Razorpay integration',
        timestamp: new Date(Date.now() - 3600000),
        status: 'read'
      },
      {
        id: '2',
        type: 'developer',
        content: 'Hello! I can help you with Razorpay integration. What specific issue are you facing?',
        timestamp: new Date(Date.now() - 3500000),
        status: 'read'
      }
    ],
    status: 'active',
    unreadCount: 0,
    lastMessage: new Date(Date.now() - 3500000)
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessType = searchParams.get('businessType')
    
    // Filter developers by business type if specified
    let filteredDevelopers = developers
    if (businessType) {
      filteredDevelopers = developers.filter(dev => 
        dev.businessType.toLowerCase().includes(businessType.toLowerCase())
      )
    }
    
    // Get chat sessions for the user (in a real app, you'd get the user ID from auth)
    const userSessions = chatSessions.filter(session => session.userId === 'user1')
    
    // Combine developer info with session info
    const developersWithSessions = filteredDevelopers.map(dev => {
      const session = userSessions.find(s => s.developerId === dev.id)
      return {
        ...dev,
        sessionId: session?.id,
        unreadCount: session?.unreadCount || 0,
        lastMessage: session?.lastMessage,
        hasActiveSession: !!session
      }
    })
    
    return NextResponse.json({
      developers: developersWithSessions,
      sessions: userSessions
    })
    
  } catch (error) {
    console.error('Error fetching developer chats:', error)
    return NextResponse.json({ error: 'Failed to fetch developer chats' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, developerId, message, sessionId } = await request.json()
    
    if (action === 'start_session') {
      // Start a new chat session with a developer
      const developer = developers.find(dev => dev.id === developerId)
      if (!developer) {
        return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
      }
      
      // Check if session already exists
      const existingSession = chatSessions.find(session => 
        session.developerId === developerId && session.userId === 'user1'
      )
      
      if (existingSession) {
        return NextResponse.json({
          session: existingSession,
          message: 'Chat session already exists'
        })
      }
      
      // Create new session
      const newSession = {
        id: Date.now().toString(),
        developerId,
        userId: 'user1',
        messages: [],
        status: 'active',
        unreadCount: 0,
        lastMessage: new Date()
      }
      
      chatSessions.push(newSession)
      
      return NextResponse.json({
        session: newSession,
        message: 'Chat session started successfully'
      })
    }
    
    if (action === 'send_message') {
      if (!sessionId || !message) {
        return NextResponse.json({ error: 'Session ID and message are required' }, { status: 400 })
      }
      
      const session = chatSessions.find(s => s.id === sessionId)
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }
      
      // Add user message
      const userMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: message,
        timestamp: new Date(),
        status: 'sent'
      }
      
      session.messages.push(userMessage)
      session.lastMessage = new Date()
      
      // Simulate developer response (in a real app, this would be handled by WebSocket or push notifications)
      setTimeout(() => {
        const developerResponse = {
          id: (Date.now() + 1).toString(),
          type: 'developer',
          content: getDeveloperResponse(message),
          timestamp: new Date(),
          status: 'delivered'
        }
        
        session.messages.push(developerResponse)
        session.lastMessage = new Date()
        session.unreadCount = (session.unreadCount || 0) + 1
      }, 2000)
      
      return NextResponse.json({
        message: 'Message sent successfully',
        session
      })
    }
    
    if (action === 'get_messages') {
      if (!sessionId) {
        return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
      }
      
      const session = chatSessions.find(s => s.id === sessionId)
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }
      
      // Mark messages as read
      session.unreadCount = 0
      
      return NextResponse.json({
        messages: session.messages,
        session
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (error) {
    console.error('Error in developer chat API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getDeveloperResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('payment') || lowerMessage.includes('razorpay')) {
    return 'I can help you with payment integration issues. Let me check your current configuration and guide you through the troubleshooting steps.'
  }
  
  if (lowerMessage.includes('api') || lowerMessage.includes('integration')) {
    return 'API integration issues can be complex. Could you share the error messages you\'re seeing and the API endpoint you\'re trying to integrate with?'
  }
  
  if (lowerMessage.includes('inventory') || lowerMessage.includes('stock')) {
    return 'For inventory management issues, I\'ll need to understand your current setup. Are you using multiple locations, and what specific sync problems are you experiencing?'
  }
  
  if (lowerMessage.includes('performance') || lowerMessage.includes('slow')) {
    return 'Performance issues can be caused by various factors. Let me help you identify the bottleneck. Could you share your current system specifications and the specific areas that are slow?'
  }
  
  if (lowerMessage.includes('mobile') || lowerMessage.includes('app')) {
    return 'Mobile integration issues are common. Are you experiencing problems with the React Native app or the mobile web version? Let me help you troubleshoot.'
  }
  
  return 'I understand your issue. Let me help you resolve this. Could you provide more details about the problem you\'re experiencing, including any error messages or specific scenarios where the issue occurs?'
}