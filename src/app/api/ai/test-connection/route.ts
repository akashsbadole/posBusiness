import { NextRequest, NextResponse } from 'next/server'
import { createAIService, AIConfig } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const config: AIConfig = await request.json()

    if (!config.vendor) {
      return NextResponse.json(
        { success: false, message: 'AI vendor is required' },
        { status: 400 }
      )
    }

    // Test the AI service with a simple message
    const aiService = createAIService(config)
    
    try {
      const response = await aiService.generateCompletion([
        { role: 'user', content: 'Hello, please respond with "Connection successful"' }
      ])

      return NextResponse.json({
        success: true,
        message: `Successfully connected to ${config.vendor}`,
        vendor: config.vendor,
        response: response.content
      })

    } catch (aiError) {
      return NextResponse.json({
        success: false,
        message: `Failed to connect to ${config.vendor}: ${aiError instanceof Error ? aiError.message : 'Unknown error'}`,
        vendor: config.vendor
      })
    }

  } catch (error) {
    console.error('AI connection test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error testing AI connection',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}