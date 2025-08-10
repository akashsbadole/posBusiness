// AI Service with multiple vendor support - SERVER SIDE ONLY
// This file should only be imported on the server side or in API routes
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

class AIService {
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
      const systemPrompt = `You are a voice command processor for a POS (Point of Sale) system. 
Your task is to analyze voice commands and extract structured information.

Analyze the voice command and return a JSON object with:
- product: The product name (cleaned, without action words)
- quantity: The quantity mentioned (default to 1 if not specified)
- action: The action type ("add", "remove", or "search")
- confidence: Your confidence level (0.0 to 1.0)

Examples:
- "add 2 coca cola" -> {"product": "coca cola", "quantity": 2, "action": "add", "confidence": 0.95}
- "remove one pizza" -> {"product": "pizza", "quantity": 1, "action": "remove", "confidence": 0.9}
- "search for coffee" -> {"product": "coffee", "quantity": 1, "action": "search", "confidence": 0.85}
- "I want 3 burgers" -> {"product": "burgers", "quantity": 3, "action": "add", "confidence": 0.8}

Return ONLY the JSON object, no other text.`

      const response = await this.generateCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ])

      let result: VoiceSearchResult
      try {
        result = JSON.parse(response.content)
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError)
        result = this.fallbackVoiceProcessing(text)
      }

      // Validate and sanitize the result
      return {
        product: result.product || 'unknown',
        quantity: Math.max(1, Math.min(999, result.quantity || 1)),
        action: ['add', 'remove', 'search'].includes(result.action || '') ? result.action : 'add',
        confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
        rawText: text
      }

    } catch (error) {
      console.error('AI service error:', error)
      return this.fallbackVoiceProcessing(text)
    }
  }

  async generateCompletion(messages: Array<{role: string, content: string}>): Promise<AIServiceResponse> {
    switch (this.config.vendor) {
      case 'openai':
        return this.callOpenAI(messages)
      case 'gemini':
        return this.callGemini(messages)
      case 'zai':
        return this.callZAI(messages)
      default:
        return this.callFallback(messages)
    }
  }

  private async callOpenAI(messages: Array<{role: string, content: string}>): Promise<AIServiceResponse> {
    try {
      if (!this.config.apiKey) {
        throw new Error('OpenAI API key is required')
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model || 'gpt-3.5-turbo',
          messages: messages,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content || ''

      return {
        content,
        vendor: 'openai',
        model: data.model,
        usage: {
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
          totalTokens: data.usage?.total_tokens,
        }
      }
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw error
    }
  }

  private async callGemini(messages: Array<{role: string, content: string}>): Promise<AIServiceResponse> {
    try {
      if (!this.config.apiKey) {
        throw new Error('Gemini API key is required')
      }

      // Convert messages to Gemini format
      const contents = messages
        .filter(msg => msg.role !== 'system') // Gemini doesn't have system messages
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }))

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model || 'gemini-pro'}:generateContent?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: this.config.temperature,
              maxOutputTokens: this.config.maxTokens,
            },
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.candidates[0]?.content?.parts[0]?.text || ''

      return {
        content,
        vendor: 'gemini',
        model: this.config.model || 'gemini-pro'
      }
    } catch (error) {
      console.error('Gemini API error:', error)
      throw error
    }
  }

  private async callZAI(messages: Array<{role: string, content: string}>): Promise<AIServiceResponse> {
    try {
      // Dynamic import to avoid server-side issues
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const completion = await zai.chat.completions.create({
        messages: messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      })

      const content = completion.choices[0]?.message?.content || ''

      return {
        content,
        vendor: 'zai',
        model: 'default'
      }
    } catch (error) {
      console.error('ZAI API error:', error)
      throw error
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
export function createAIService(config: AIConfig): AIService {
  return new AIService(config)
}

// Default configuration
export const defaultAIConfig: AIConfig = {
  vendor: 'zai',
  model: 'default',
  temperature: 0.1,
  maxTokens: 150
}