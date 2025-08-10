"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarContent, AvatarFallback } from '@/components/ui/avatar'
import { 
  MessageSquare, 
  Bot, 
  Users, 
  Ticket, 
  Send, 
  Paperclip, 
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  CreditCard,
  Package,
  BookOpen,
  User,
  ArrowUpRight,
  Brain,
  Zap,
  Shield,
  ThumbsUp,
  ThumbsDown,
  HelpCircle
} from 'lucide-react'
import { usePOSStore } from '@/store'

interface ChatMessage {
  id: string
  type: 'user' | 'bot' | 'support' | 'developer'
  content: string
  timestamp: Date
  status?: 'sent' | 'delivered' | 'read'
  escalationLevel?: 'none' | 'knowledge_base' | 'support_agent' | 'developer' | 'urgent'
  suggestedActions?: string[]
  confidence?: number
  relatedArticles?: Array<{
    id: string
    title: string
    category: string
  }>
}

interface SupportTicket {
  id: string
  title: string
  description: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
  messages: ChatMessage[]
}

interface DeveloperChat {
  id: string
  businessType: string
  developerName: string
  status: 'online' | 'offline' | 'busy'
  lastMessage?: Date
  unreadCount: number
}

export default function ChatSystem() {
  const { currentRestaurant } = usePOSStore()
  const [activeTab, setActiveTab] = useState('store-chat')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [developerChats, setDeveloperChats] = useState<DeveloperChat[]>([])
  const [newTicket, setNewTicket] = useState({ title: '', description: '', category: '', priority: 'medium' as const })
  const [isTyping, setIsTyping] = useState(false)
  const [showEscalationOptions, setShowEscalationOptions] = useState(false)
  const [escalationContext, setEscalationContext] = useState('')
  const [aiConfidence, setAiConfidence] = useState(0)
  const [knowledgeBaseSuggestions, setKnowledgeBaseSuggestions] = useState<Array<{
    id: string
    title: string
    category: string
    relevance: number
  }>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: '1',
      type: 'bot',
      content: `Welcome to ${currentRestaurant?.name || 'your store'}! I'm your AI assistant. I can help you with common questions, and if needed, I can escalate complex issues to human support agents or developers.`,
      timestamp: new Date(),
      status: 'delivered',
      escalationLevel: 'none',
      confidence: 0.95,
      suggestedActions: [
        'Check order status',
        'View inventory levels',
        'Payment issues',
        'Customer management',
        'Technical support'
      ]
    }
    setMessages([welcomeMessage])
  }, [currentRestaurant])

  // Initialize developer chats
  useEffect(() => {
    const mockDeveloperChats: DeveloperChat[] = [
      {
        id: '1',
        businessType: 'Restaurant',
        developerName: 'Sarah Chen',
        status: 'online',
        lastMessage: new Date(Date.now() - 300000),
        unreadCount: 2
      },
      {
        id: '2',
        businessType: 'Retail',
        developerName: 'Mike Johnson',
        status: 'busy',
        lastMessage: new Date(Date.now() - 1800000),
        unreadCount: 0
      },
      {
        id: '3',
        businessType: 'Service',
        developerName: 'Emily Davis',
        status: 'offline',
        lastMessage: new Date(Date.now() - 3600000),
        unreadCount: 1
      }
    ]
    setDeveloperChats(mockDeveloperChats)
  }, [])

  // Initialize sample tickets
  useEffect(() => {
    const sampleTickets: SupportTicket[] = [
      {
        id: '1',
        title: 'Payment Gateway Integration Issue',
        description: 'Customers are reporting failed transactions with Razorpay',
        status: 'in-progress',
        priority: 'high',
        category: 'Payment',
        assignedTo: 'Sarah Chen',
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 3600000),
        messages: [
          {
            id: '1',
            type: 'user',
            content: 'Payment gateway is not working properly',
            timestamp: new Date(Date.now() - 86400000),
            status: 'read'
          },
          {
            id: '2',
            type: 'support',
            content: 'We are investigating the issue with Razorpay integration',
            timestamp: new Date(Date.now() - 43200000),
            status: 'read'
          }
        ]
      },
      {
        id: '2',
        title: 'Inventory Sync Problem',
        description: 'Inventory levels are not syncing between locations',
        status: 'open',
        priority: 'medium',
        category: 'Inventory',
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 172800000),
        messages: []
      }
    ]
    setTickets(sampleTickets)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      status: 'sent'
    }

    setMessages(prev => [...prev, userMessage])
    const messageToSend = inputMessage
    setInputMessage('')
    setIsTyping(true)

    try {
      // Analyze message for escalation needs
      const analysis = await analyzeMessageForEscalation(messageToSend)
      setAiConfidence(analysis.confidence)
      setKnowledgeBaseSuggestions(analysis.knowledgeBaseSuggestions)

      // Call the chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          businessType: currentRestaurant?.name || 'General Business',
          context: `Restaurant: ${currentRestaurant?.name}, Location: ${currentRestaurant?.address}`,
          escalationLevel: analysis.escalationLevel,
          confidence: analysis.confidence
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response from chat service')
      }

      const data = await response.json()
      
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.response,
        timestamp: new Date(),
        status: 'delivered',
        escalationLevel: analysis.escalationLevel,
        confidence: analysis.confidence,
        suggestedActions: analysis.suggestedActions,
        relatedArticles: analysis.relatedArticles
      }
      
      setMessages(prev => [...prev, botResponse])

      // Show escalation options if needed
      if (analysis.escalationLevel !== 'none' && analysis.confidence < 0.7) {
        setShowEscalationOptions(true)
        setEscalationContext(messageToSend)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      
      // Fallback to local response with escalation analysis
      const analysis = analyzeMessageForEscalation(messageToSend)
      const fallbackResponse = getBotResponse(messageToSend, analysis)
      
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: fallbackResponse.content,
        timestamp: new Date(),
        status: 'delivered',
        escalationLevel: analysis.escalationLevel,
        confidence: analysis.confidence,
        suggestedActions: fallbackResponse.suggestedActions,
        relatedArticles: analysis.relatedArticles
      }
      
      setMessages(prev => [...prev, botResponse])

      // Show escalation options if needed
      if (analysis.escalationLevel !== 'none' && analysis.confidence < 0.7) {
        setShowEscalationOptions(true)
        setEscalationContext(messageToSend)
      }
    } finally {
      setIsTyping(false)
    }
  }

  const analyzeMessageForEscalation = (message: string) => {
    const lowerMessage = message.toLowerCase()
    let escalationLevel: 'none' | 'knowledge_base' | 'support_agent' | 'developer' | 'urgent' = 'none'
    let confidence = 0.9
    const suggestedActions: string[] = []
    const relatedArticles: Array<{ id: string; title: string; category: string }> = []
    const knowledgeBaseSuggestions: Array<{ id: string; title: string; category: string; relevance: number }> = []

    // Check for urgent issues
    if (lowerMessage.includes('urgent') || lowerMessage.includes('emergency') || lowerMessage.includes('critical') || lowerMessage.includes('down')) {
      escalationLevel = 'urgent'
      confidence = 0.95
      suggestedActions.push('Create urgent ticket', 'Call support')
    }
    // Check for technical issues requiring developer support
    else if (lowerMessage.includes('bug') || lowerMessage.includes('error') || lowerMessage.includes('crash') || lowerMessage.includes('integration') || lowerMessage.includes('api')) {
      escalationLevel = 'developer'
      confidence = 0.75
      suggestedActions.push('Contact developer', 'Create technical ticket')
      relatedArticles.push({ id: '2', title: 'Troubleshooting Payment Gateway Issues', category: 'Payment & Billing' })
    }
    // Check for complex support issues
    else if (lowerMessage.includes('refund') || lowerMessage.includes('dispute') || lowerMessage.includes('complaint') || lowerMessage.includes('billing')) {
      escalationLevel = 'support_agent'
      confidence = 0.8
      suggestedActions.push('Create support ticket', 'View billing history')
      relatedArticles.push({ id: '2', title: 'Troubleshooting Payment Gateway Issues', category: 'Payment & Billing' })
    }
    // Check for knowledge base applicable issues
    else if (lowerMessage.includes('how') || lowerMessage.includes('help') || lowerMessage.includes('guide') || lowerMessage.includes('tutorial')) {
      escalationLevel = 'knowledge_base'
      confidence = 0.85
      suggestedActions.push('View knowledge base', 'Search help articles')
      
      // Add relevant knowledge base suggestions
      knowledgeBaseSuggestions.push(
        { id: '1', title: 'Getting Started with POSBiz Dashboard', category: 'Getting Started', relevance: 0.9 },
        { id: '3', title: 'Inventory Management Best Practices', category: 'Inventory', relevance: 0.7 },
        { id: '4', title: 'Customer Management and Loyalty Programs', category: 'Customer Management', relevance: 0.6 }
      )
    }

    return {
      escalationLevel,
      confidence,
      suggestedActions,
      relatedArticles,
      knowledgeBaseSuggestions
    }
  }

  const getBotResponse = (message: string, analysis?: any): { content: string; suggestedActions: string[] } => {
    const lowerMessage = message.toLowerCase()
    let content = ''
    const suggestedActions: string[] = []

    if (analysis?.escalationLevel === 'urgent') {
      content = 'I detect this is an urgent issue. Let me help you escalate this immediately. You can create an urgent ticket or contact support directly.'
      suggestedActions.push('Create urgent ticket', 'Call support now')
    }
    else if (analysis?.escalationLevel === 'developer') {
      content = 'This appears to be a technical issue that may require developer assistance. I can help you create a technical support ticket or connect you with our development team.'
      suggestedActions.push('Create technical ticket', 'Contact developer')
    }
    else if (analysis?.escalationLevel === 'support_agent') {
      content = 'This issue requires human support assistance. I can help you create a support ticket or connect you with our support team.'
      suggestedActions.push('Create support ticket', 'Live chat with agent')
    }
    else if (analysis?.escalationLevel === 'knowledge_base') {
      content = 'I found some helpful articles in our knowledge base that might answer your question. Would you like me to show you these resources?'
      suggestedActions.push('View knowledge base', 'Search help articles')
    }
    else if (lowerMessage.includes('order') || lowerMessage.includes('booking')) {
      content = 'I can help you with order management. You can view orders, create new ones, or check order status. What would you like to do?'
      suggestedActions.push('View orders', 'Create new order', 'Check order status')
    }
    else if (lowerMessage.includes('inventory') || lowerMessage.includes('stock')) {
      content = 'For inventory management, you can check stock levels, set up alerts, and manage inventory across multiple locations. Need help with something specific?'
      suggestedActions.push('View inventory', 'Set up alerts', 'Multi-location management')
    }
    else if (lowerMessage.includes('payment') || lowerMessage.includes('transaction')) {
      content = 'Payment issues can be resolved through our payment gateway settings. You can also check transaction history and reconcile payments. Would you like me to guide you?'
      suggestedActions.push('Payment settings', 'Transaction history', 'Reconcile payments')
    }
    else if (lowerMessage.includes('customer') || lowerMessage.includes('client')) {
      content = 'Customer management includes viewing customer history, managing loyalty programs, and handling customer support. How can I assist you with customer-related tasks?'
      suggestedActions.push('Customer history', 'Loyalty programs', 'Customer support')
    }
    else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      content = 'I\'m here to help! You can also create a support ticket for complex issues, or chat with our developers for technical assistance. What do you need help with?'
      suggestedActions.push('Create ticket', 'Developer chat', 'Knowledge base')
    }
    else {
      content = 'I understand your question. Let me help you with that. Could you provide more details so I can assist you better?'
      suggestedActions.push('Provide more details', 'View help articles', 'Contact support')
    }

    return { content, suggestedActions }
  }

  const handleCreateTicket = () => {
    if (!newTicket.title || !newTicket.description) return

    const ticket: SupportTicket = {
      id: Date.now().toString(),
      title: newTicket.title,
      description: newTicket.description,
      status: 'open',
      priority: newTicket.priority,
      category: newTicket.category || 'General',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: []
    }

    setTickets(prev => [ticket, ...prev])
    setNewTicket({ title: '', description: '', category: '', priority: 'medium' })
  }

  const handleEscalate = (level: 'support_agent' | 'developer' | 'urgent') => {
    let ticketTitle = ''
    let ticketDescription = escalationContext
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'

    switch (level) {
      case 'urgent':
        ticketTitle = 'URGENT: Immediate assistance required'
        priority = 'urgent'
        break
      case 'developer':
        ticketTitle = 'Technical Issue - Developer Assistance Required'
        priority = 'high'
        break
      case 'support_agent':
        ticketTitle = 'Support Request - Human Agent Assistance'
        priority = 'medium'
        break
    }

    const ticket: SupportTicket = {
      id: Date.now().toString(),
      title: ticketTitle,
      description: ticketDescription,
      status: 'open',
      priority,
      category: level === 'developer' ? 'Technical' : 'General',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: []
    }

    setTickets(prev => [ticket, ...prev])
    setShowEscalationOptions(false)
    setEscalationContext('')

    // Add confirmation message
    const confirmationMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'bot',
      content: `I've created a ${priority === 'urgent' ? 'URGENT' : priority === 'high' ? 'high priority' : ''} support ticket for you. Our team will respond as soon as possible. You can track the status in the Tickets tab.`,
      timestamp: new Date(),
      status: 'delivered',
      escalationLevel: 'none',
      confidence: 1.0
    }

    setMessages(prev => [...prev, confirmationMessage])
  }

  const handleKnowledgeBaseSearch = () => {
    setActiveTab('knowledge-base')
    setShowEscalationOptions(false)
  }

  const handleFeedback = (messageId: string, isHelpful: boolean) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, confidence: isHelpful ? Math.min(msg.confidence || 0.5 + 0.1, 1.0) : Math.max(msg.confidence || 0.5 - 0.1, 0.1) }
        : msg
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200'
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDeveloperStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getEscalationColor = (level: string) => {
    switch (level) {
      case 'none': return 'bg-green-100 text-green-800'
      case 'knowledge_base': return 'bg-blue-100 text-blue-800'
      case 'support_agent': return 'bg-yellow-100 text-yellow-800'
      case 'developer': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEscalationIcon = (level: string) => {
    switch (level) {
      case 'none': return <Brain className="w-4 h-4" />
      case 'knowledge_base': return <BookOpen className="w-4 h-4" />
      case 'support_agent': return <User className="w-4 h-4" />
      case 'developer': return <Zap className="w-4 h-4" />
      case 'urgent': return <Shield className="w-4 h-4" />
      default: return <HelpCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="flex h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-blue-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Chat & Support Center
                </h1>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {currentRestaurant?.name || 'Your Business'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                <Clock className="w-3 h-3 mr-1" />
                Online
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Sidebar */}
          <div className="w-80 bg-white dark:bg-slate-800 border-r border-blue-200 dark:border-slate-700 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-4 bg-blue-100 dark:bg-slate-700 m-2">
                <TabsTrigger value="store-chat" className="text-xs">
                  <Bot className="w-3 h-3 mr-1" />
                  Store
                </TabsTrigger>
                <TabsTrigger value="knowledge-base" className="text-xs">
                  <BookOpen className="w-3 h-3 mr-1" />
                  KB
                </TabsTrigger>
                <TabsTrigger value="developers" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  Devs
                </TabsTrigger>
                <TabsTrigger value="tickets" className="text-xs">
                  <Ticket className="w-3 h-3 mr-1" />
                  Tickets
                </TabsTrigger>
              </TabsList>

              <TabsContent value="store-chat" className="flex-1 p-4">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">Store Assistant</h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400">AI-powered support</p>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Quick Actions</p>
                      <div className="mt-2 space-y-1">
                        <Button variant="ghost" size="sm" className="w-full justify-start text-left">
                          <MessageSquare className="w-3 h-3 mr-2" />
                          Check Order Status
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start text-left">
                          <Package className="w-3 h-3 mr-2" />
                          Inventory Help
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start text-left">
                          <CreditCard className="w-3 h-3 mr-2" />
                          Payment Issues
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="knowledge-base" className="flex-1 p-4">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">Knowledge Base</h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Self-help resources</p>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Popular Articles</p>
                      <div className="space-y-1">
                        <Button variant="ghost" size="sm" className="w-full justify-start text-left">
                          <BookOpen className="w-3 h-3 mr-2" />
                          Getting Started Guide
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start text-left">
                          <AlertCircle className="w-3 h-3 mr-2" />
                          Payment Troubleshooting
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start text-left">
                          <Package className="w-3 h-3 mr-2" />
                          Inventory Management
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start text-left">
                          <Users className="w-3 h-3 mr-2" />
                          Customer Loyalty Programs
                        </Button>
                      </div>
                    </div>
                    {knowledgeBaseSuggestions.length > 0 && (
                      <div className="p-3 bg-blue-50 dark:bg-slate-700 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Suggested for You</p>
                        <div className="space-y-1">
                          {knowledgeBaseSuggestions.map((article) => (
                            <Button key={article.id} variant="ghost" size="sm" className="w-full justify-start text-left">
                              <BookOpen className="w-3 h-3 mr-2" />
                              {article.title}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="developers" className="flex-1 p-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Developer Support</h3>
                  {developerChats.map((chat) => (
                    <div key={chat.id} className="p-3 bg-blue-50 dark:bg-slate-700 rounded-lg hover:bg-blue-100 dark:hover:bg-slate-600 cursor-pointer transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                                {chat.developerName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${getDeveloperStatusColor(chat.status)}`}></div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{chat.developerName}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">{chat.businessType}</p>
                          </div>
                        </div>
                        {chat.unreadCount > 0 && (
                          <Badge variant="destructive" className="w-5 h-5 p-0 flex items-center justify-center text-xs">
                            {chat.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400">
                        <span className="capitalize">{chat.status}</span>
                        <span>{chat.lastMessage ? new Date(chat.lastMessage).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="tickets" className="flex-1 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">Support Tickets</h3>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="w-3 h-3 mr-1" />
                      New
                    </Button>
                  </div>
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="p-3 bg-blue-50 dark:bg-slate-700 rounded-lg hover:bg-blue-100 dark:hover:bg-slate-600 cursor-pointer transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{ticket.title}</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 line-clamp-2">{ticket.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </Badge>
                        <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </Badge>
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeTab === 'store-chat' && (
              <div className="flex-1 flex flex-col">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : message.type === 'bot'
                              ? 'bg-purple-100 dark:bg-slate-700 text-blue-900 dark:text-blue-100'
                              : 'bg-blue-100 dark:bg-slate-700 text-blue-900 dark:text-blue-100'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {message.type === 'bot' && <Bot className="w-3 h-3" />}
                              {message.type === 'support' && <Users className="w-3 h-3" />}
                              {message.type === 'developer' && <Users className="w-3 h-3" />}
                              <span className="text-xs opacity-70">
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {message.escalationLevel && message.escalationLevel !== 'none' && (
                              <Badge className={`text-xs ${getEscalationColor(message.escalationLevel)}`}>
                                {getEscalationIcon(message.escalationLevel)}
                                <span className="ml-1 capitalize">{message.escalationLevel.replace('_', ' ')}</span>
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm mb-2">{message.content}</p>
                          
                          {/* AI Confidence and Feedback */}
                          {message.type === 'bot' && message.confidence !== undefined && (
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-purple-200 dark:border-slate-600">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Brain className="w-3 h-3" />
                                  <span className="text-xs opacity-70">
                                    {(message.confidence * 100).toFixed(0)}% confident
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-6 h-6 p-0"
                                  onClick={() => handleFeedback(message.id, true)}
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-6 h-6 p-0"
                                  onClick={() => handleFeedback(message.id, false)}
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {/* Suggested Actions */}
                          {message.suggestedActions && message.suggestedActions.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-purple-200 dark:border-slate-600">
                              <p className="text-xs font-medium mb-1">Suggested Actions:</p>
                              <div className="flex flex-wrap gap-1">
                                {message.suggestedActions.map((action, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs py-0 px-2 h-6"
                                    onClick={() => {
                                      setInputMessage(action)
                                      if (action.includes('ticket') || action.includes('support') || action.includes('developer')) {
                                        setShowEscalationOptions(true)
                                        setEscalationContext(action)
                                      }
                                    }}
                                  >
                                    {action}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Related Articles */}
                          {message.relatedArticles && message.relatedArticles.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-purple-200 dark:border-slate-600">
                              <p className="text-xs font-medium mb-1">Related Articles:</p>
                              <div className="space-y-1">
                                {message.relatedArticles.map((article, index) => (
                                  <Button
                                    key={index}
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs w-full justify-start text-left p-1 h-auto"
                                    onClick={() => {
                                      setActiveTab('knowledge-base')
                                      setKnowledgeBaseSuggestions([{
                                        id: article.id,
                                        title: article.title,
                                        category: article.category,
                                        relevance: 0.9
                                      }])
                                    }}
                                  >
                                    <BookOpen className="w-3 h-3 mr-1" />
                                    {article.title}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-purple-100 dark:bg-slate-700 px-4 py-2 rounded-lg">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t border-blue-200 dark:border-slate-700 p-4">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Escalation Options Modal */}
            {showEscalationOptions && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md mx-4 bg-white dark:bg-slate-800 border-blue-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
                      <ArrowUpRight className="w-5 h-5" />
                      Escalation Options
                    </CardTitle>
                    <CardDescription className="text-blue-600 dark:text-blue-400">
                      I need to escalate this issue to get you better help
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-blue-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Issue Context:</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{escalationContext}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Choose escalation level:</h4>
                      
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left p-3 h-auto"
                        onClick={() => handleEscalate('knowledge_base')}
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-blue-900 dark:text-blue-100">Knowledge Base</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">Search help articles and guides</p>
                          </div>
                        </div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left p-3 h-auto"
                        onClick={() => handleEscalate('support_agent')}
                      >
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-yellow-600" />
                          <div>
                            <p className="font-medium text-blue-900 dark:text-blue-100">Support Agent</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">Human support assistance</p>
                          </div>
                        </div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left p-3 h-auto"
                        onClick={() => handleEscalate('developer')}
                      >
                        <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className="font-medium text-blue-900 dark:text-blue-100">Developer Support</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">Technical issues and bugs</p>
                          </div>
                        </div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left p-3 h-auto border-red-200 hover:bg-red-50"
                        onClick={() => handleEscalate('urgent')}
                      >
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-red-600" />
                          <div>
                            <p className="font-medium text-red-900 dark:text-red-100">Urgent Escalation</p>
                            <p className="text-xs text-red-600 dark:text-red-400">Critical issues requiring immediate attention</p>
                          </div>
                        </div>
                      </Button>
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" onClick={() => setShowEscalationOptions(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button onClick={handleKnowledgeBaseSearch} className="flex-1">
                        Search Knowledge Base
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'knowledge-base' && (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Knowledge Base</h3>
                  <p className="text-blue-600 dark:text-blue-400 mb-4">
                    Access self-help resources and guides
                  </p>
                  <div className="space-y-2 text-left max-w-md mx-auto">
                    <div className="p-3 bg-blue-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Available Resources:</p>
                      <ul className="text-xs text-blue-600 dark:text-blue-400 mt-1 space-y-1">
                        <li>• Getting started guides</li>
                        <li>• Troubleshooting articles</li>
                        <li>• Best practices</li>
                        <li>• FAQ and common issues</li>
                      </ul>
                    </div>
                    <Button 
                      onClick={() => {
                        // This would typically navigate to the full knowledge base
                        alert('Knowledge Base integration would open here')
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Open Full Knowledge Base
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'developers' && (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Developer Support</h3>
                  <p className="text-blue-600 dark:text-blue-400 mb-4">
                    Select a developer from the sidebar to start chatting
                  </p>
                  <div className="space-y-2 text-left max-w-md mx-auto">
                    <div className="p-3 bg-blue-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Available Support:</p>
                      <ul className="text-xs text-blue-600 dark:text-blue-400 mt-1 space-y-1">
                        <li>• Technical integration issues</li>
                        <li>• API and webhook support</li>
                        <li>• Custom development requests</li>
                        <li>• Performance optimization</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tickets' && (
              <div className="flex-1 p-4">
                <div className="max-w-2xl mx-auto">
                  <Card className="bg-white dark:bg-slate-800 border-blue-200 dark:border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-blue-900 dark:text-blue-100">Create New Ticket</CardTitle>
                      <CardDescription className="text-blue-600 dark:text-blue-400">
                        Submit a support ticket for technical assistance
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Title
                        </label>
                        <Input
                          value={newTicket.title}
                          onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Brief description of the issue"
                          className="border-blue-200 dark:border-slate-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Description
                        </label>
                        <Textarea
                          value={newTicket.description}
                          onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Detailed description of the issue..."
                          rows={4}
                          className="border-blue-200 dark:border-slate-600"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                            Category
                          </label>
                          <select
                            value={newTicket.category}
                            onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full p-2 border border-blue-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-blue-900 dark:text-blue-100"
                          >
                            <option value="">Select category</option>
                            <option value="Payment">Payment</option>
                            <option value="Inventory">Inventory</option>
                            <option value="Orders">Orders</option>
                            <option value="Technical">Technical</option>
                            <option value="Account">Account</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                            Priority
                          </label>
                          <select
                            value={newTicket.priority}
                            onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as any }))}
                            className="w-full p-2 border border-blue-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-blue-900 dark:text-blue-100"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                      </div>
                      <Button
                        onClick={handleCreateTicket}
                        disabled={!newTicket.title || !newTicket.description}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Ticket className="w-4 h-4 mr-2" />
                        Create Ticket
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}