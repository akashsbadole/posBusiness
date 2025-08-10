import { NextRequest, NextResponse } from 'next/server'
import { createAIService, defaultAIConfig } from '@/lib/ai-service'

interface VoiceSearchResult {
  product?: string
  quantity?: number
  action?: 'add' | 'remove' | 'search'
  confidence: number
}

export async function POST(request: NextRequest) {
  try {
    const { text, aiConfig } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Use provided AI config or default
    const config = aiConfig || defaultAIConfig
    
    try {
      const aiService = createAIService(config)
      const result = await aiService.processVoiceCommand(text)

      return NextResponse.json(result)

    } catch (aiError) {
      console.error('AI service error:', aiError)
      
      // Fallback to basic processing
      const fallbackResult = fallbackProcessing(text)
      return NextResponse.json(fallbackResult)
    }

  } catch (error) {
    console.error('Voice search processing error:', error)
    
    // Return fallback result
    const fallbackResult = fallbackProcessing(text || '')
    return NextResponse.json(fallbackResult)
  }
}

function fallbackProcessing(text: string): VoiceSearchResult {
  const lowerText = text.toLowerCase()
  
  // Extract quantity
  const quantityMatch = lowerText.match(/(\d+)/)
  const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1
  
  // Extract action
  let action: 'add' | 'remove' | 'search' = 'add'
  if (lowerText.includes('remove') || lowerText.includes('delete')) {
    action = 'remove'
  } else if (lowerText.includes('search') || lowerText.includes('find')) {
    action = 'search'
  }
  
  // Extract product name (remove action words and numbers)
  let product = text
    .replace(/add|remove|delete|search|find/gi, '')
    .replace(/\d+/g, '')
    .replace(/^\s+|\s+$/g, '')
    .replace(/\s+/g, ' ')
  
  return {
    product: product || 'unknown',
    quantity: Math.max(1, Math.min(999, quantity)),
    action,
    confidence: 0.6 // Lower confidence for fallback
  }
}