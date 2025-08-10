import { NextRequest, NextResponse } from 'next/server'
import { createAIService, AIConfig } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { messages, aiConfig } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Use provided AI config or default
    const config: AIConfig = aiConfig || {
      vendor: 'zai',
      model: 'default',
      temperature: 0.1,
      maxTokens: 150
    }
    
    try {
      const aiService = createAIService(config)
      const result = await aiService.generateCompletion(messages)

      return NextResponse.json(result)

    } catch (aiError) {
      console.error('AI service error:', aiError)
      
      // Fallback to basic processing
      const fallbackResult = await fallbackProcessing(messages)
      return NextResponse.json(fallbackResult)
    }

  } catch (error) {
    console.error('Generate completion error:', error)
    
    // Return fallback result
    const fallbackResult = await fallbackProcessing(messages || [])
    return NextResponse.json(fallbackResult)
  }
}

async function fallbackProcessing(messages: Array<{role: string, content: string}>) {
  // Simple rule-based fallback
  const userMessage = messages.find(m => m.role === 'user')?.content || ''
  
  // Basic pattern matching
  const quantityMatch = userMessage.match(/(\d+)/)
  const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1
  
  let action: 'add' | 'remove' | 'search' = 'add'
  if (userMessage.toLowerCase().includes('remove') || userMessage.toLowerCase().includes('delete')) {
    action = 'remove'
  } else if (userMessage.toLowerCase().includes('search') || userMessage.toLowerCase().includes('find')) {
    action = 'search'
  }
  
  let product = userMessage
    .replace(/add|remove|delete|search|find/gi, '')
    .replace(/\d+/g, '')
    .replace(/^\s+|\s+$/g, '')
    .replace(/\s+/g, ' ')

  return {
    content: JSON.stringify({
      product: product || 'unknown',
      quantity,
      action,
      confidence: 0.6
    }),
    vendor: 'fallback'
  }
}