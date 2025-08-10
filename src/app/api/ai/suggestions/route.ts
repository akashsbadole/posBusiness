import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const customerId = searchParams.get('customerId')
    const type = searchParams.get('type')

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 })
    }

    const whereClause: any = { restaurantId }
    if (customerId) whereClause.customerId = customerId
    if (type) whereClause.type = type

    const suggestions = await db.aISuggestion.findMany({
      where: whereClause,
      include: {
        customer: true,
        restaurant: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('Error fetching AI suggestions:', error)
    return NextResponse.json({ error: 'Failed to fetch AI suggestions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantId, customerId, type, title, description, data } = body

    if (!restaurantId || !type || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create AI suggestion
    const suggestion = await db.aISuggestion.create({
      data: {
        restaurantId,
        customerId,
        type,
        title,
        description,
        data: data ? JSON.stringify(data) : null,
        confidence: 0.8 // Default confidence
      },
      include: {
        customer: true,
        restaurant: true
      }
    })

    return NextResponse.json(suggestion)
  } catch (error) {
    console.error('Error creating AI suggestion:', error)
    return NextResponse.json({ error: 'Failed to create AI suggestion' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, isAccepted, isDismissed } = body

    if (!id) {
      return NextResponse.json({ error: 'Suggestion ID is required' }, { status: 400 })
    }

    const suggestion = await db.aISuggestion.update({
      where: { id },
      data: {
        isAccepted: isAccepted || false,
        isDismissed: isDismissed || false
      },
      include: {
        customer: true,
        restaurant: true
      }
    })

    return NextResponse.json(suggestion)
  } catch (error) {
    console.error('Error updating AI suggestion:', error)
    return NextResponse.json({ error: 'Failed to update AI suggestion' }, { status: 500 })
  }
}