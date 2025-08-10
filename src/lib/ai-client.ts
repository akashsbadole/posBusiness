// Client-side AI service - uses API calls instead of direct SDK imports
export type AIVendor = 'openai' | 'gemini' | 'zai' | 'fallback'

export interface AIConfig {
  vendor: AIVendor
  apiKey?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface VoiceSearchResult {
  product?: string
  quantity?: number
  action?: 'add' | 'remove' | 'search'
  confidence: number
  rawText: string
}

export interface AIServiceResponse {
  content: string
  vendor: AIVendor
  model?: string
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
}

class ClientAIService {
  private config: AIConfig

  constructor(config: AIConfig) {
    this.config = {
      vendor: config.vendor || 'zai',
      model: config.model || this.getDefaultModel(config.vendor),
      temperature: config.temperature || 0.1,
      maxTokens: config.maxTokens || 150,
      ...config
    }
  }

  private getDefaultModel(vendor: AIVendor): string {
    switch (vendor) {
      case 'openai':
        return 'gpt-3.5-turbo'
      case 'gemini':
        return 'gemini-pro'
      case 'zai':
        return 'default'
      default:
        return 'default'
    }
  }

  async processVoiceCommand(text: string): Promise<VoiceSearchResult> {
    try {
      const response = await fetch('/api/ai/voice-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, aiConfig: this.config }),
      })

      if (!response.ok) {
        throw new Error('Failed to process voice command')
      }

      const result = await response.json()
      
      return {
        ...result,
        rawText: text,
      }

    } catch (error) {
      console.error('AI service error:', error)
      return this.fallbackVoiceProcessing(text)
    }
  }

  async generateCompletion(messages: Array<{role: string, content: string}>): Promise<AIServiceResponse> {
    try {
      const response = await fetch('/api/ai/generate-completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages, 
          aiConfig: this.config 
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate completion')
      }

      return await response.json()
    } catch (error) {
      console.error('AI service error:', error)
      return this.callFallback(messages)
    }
  }

  private async callFallback(messages: Array<{role: string, content: string}>): Promise<AIServiceResponse> {
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

  private fallbackVoiceProcessing(text: string): VoiceSearchResult {
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
    
    // Extract product name
    let product = text
      .replace(/add|remove|delete|search|find/gi, '')
      .replace(/\d+/g, '')
      .replace(/^\s+|\s+$/g, '')
      .replace(/\s+/g, ' ')
    
    return {
      product: product || 'unknown',
      quantity: Math.max(1, Math.min(999, quantity)),
      action,
      confidence: 0.6,
      rawText: text
    }
  }
}

// Factory function to create AI service
export function createAIService(config: AIConfig): ClientAIService {
  return new ClientAIService(config)
}

// Default configuration
export const defaultAIConfig: AIConfig = {
  vendor: 'zai',
  model: 'default',
  temperature: 0.1,
  maxTokens: 150
}