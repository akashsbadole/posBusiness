import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { message, businessType, context } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Initialize ZAI client
    const zai = await ZAI.create()

    // Create system prompt based on business type and context
    const systemPrompt = `You are a helpful AI assistant for a ${businessType || 'business'} POS system. 
    Your name is POSBiz Assistant. You help users with:
    - Order management and tracking
    - Inventory and stock management
    - Payment processing and transactions
    - Customer management and loyalty programs
    - Staff and role management
    - Business settings and configuration
    - Technical support and troubleshooting
    
    Business Context: ${context || 'General business management'}
    
    Guidelines:
    - Be helpful, concise, and professional
    - Provide specific, actionable advice
    - If you don't know something, suggest contacting support
    - Keep responses focused on POS and business management
    - Use friendly but professional tone
    
    Current user message: ${message}`

    // Generate AI response
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const response = completion.choices[0]?.message?.content || 'I apologize, but I\'m having trouble responding right now. Please try again later.'

    // Log the interaction for analytics
    console.log('Chat interaction:', {
      message,
      businessType,
      response: response.substring(0, 100) + '...',
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
      businessType
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    // Fallback response when AI service is unavailable
    const fallbackResponse = getFallbackResponse(message)
    
    return NextResponse.json({
      response: fallbackResponse,
      timestamp: new Date().toISOString(),
      fallback: true
    })
  }
}

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('order') || lowerMessage.includes('booking')) {
    return 'I can help you with order management. You can view orders, create new ones, or check order status from the Orders tab. Would you like me to guide you there?'
  }
  
  if (lowerMessage.includes('inventory') || lowerMessage.includes('stock')) {
    return 'For inventory management, you can check stock levels, set up alerts, and manage inventory across multiple locations. Visit the Inventory tab for detailed management.'
  }
  
  if (lowerMessage.includes('payment') || lowerMessage.includes('transaction')) {
    return 'Payment issues can be managed through the Payment Gateway settings. You can also check transaction history and reconcile payments. Need help with something specific?'
  }
  
  if (lowerMessage.includes('customer') || lowerMessage.includes('client')) {
    return 'Customer management includes viewing customer history, managing loyalty programs, and handling customer support. Check the Customers tab for comprehensive management tools.'
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
    return 'I\'m here to help! You can also create a support ticket for complex issues, or chat with our developers for technical assistance. What specific area do you need help with?'
  }
  
  if (lowerMessage.includes('menu') || lowerMessage.includes('product')) {
    return 'Menu and product management can be handled in the Menu tab. You can add, edit, and remove items, manage categories, and set pricing. Would you like me to show you how?'
  }
  
  if (lowerMessage.includes('report') || lowerMessage.includes('analytics')) {
    return 'Business reports and analytics are available in the Advanced Reports tab. You can generate sales reports, inventory reports, and customer analytics there.'
  }
  
  return 'I understand your question. Let me help you with that. Could you provide more details so I can assist you better? You can also create a support ticket for complex issues.'
}