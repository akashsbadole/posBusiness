import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    // Get notification templates for the restaurant
    const templates = await db.notificationTemplate.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching notification templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      restaurantId,
      name,
      type,
      channel,
      subject,
      message,
      variables,
      isActive = true
    } = body

    if (!restaurantId || !name || !type || !channel || !message) {
      return NextResponse.json(
        { error: 'Restaurant ID, name, type, channel, and message are required' },
        { status: 400 }
      )
    }

    // Create notification template
    const template = await db.notificationTemplate.create({
      data: {
        restaurantId,
        name,
        type,
        channel,
        subject,
        message,
        variables: variables ? JSON.stringify(variables) : null,
        isActive
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error creating notification template:', error)
    return NextResponse.json(
      { error: 'Failed to create notification template' },
      { status: 500 }
    )
  }
}