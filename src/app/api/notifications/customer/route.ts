import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const type = searchParams.get('type') // 'promotional', 'transactional', 'all'

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    // Build where clause based on type filter
    const whereClause: any = { restaurantId }
    if (type && type !== 'all') {
      whereClause.type = type.toUpperCase()
    }

    // Get customer notifications
    const notifications = await db.customerNotification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching customer notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      restaurantId,
      customerId,
      type,
      channel,
      title,
      message,
      templateId,
      scheduledFor,
      metadata
    } = body

    if (!restaurantId || !type || !channel || !title || !message) {
      return NextResponse.json(
        { error: 'Restaurant ID, type, channel, title, and message are required' },
        { status: 400 }
      )
    }

    // Validate notification type
    const validTypes = ['PROMOTIONAL', 'TRANSACTIONAL', 'REMINDER', 'ALERT']
    if (!validTypes.includes(type.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      )
    }

    // Validate channel
    const validChannels = ['SMS', 'EMAIL', 'WHATSAPP', 'PUSH']
    if (!validChannels.includes(channel.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid notification channel' },
        { status: 400 }
      )
    }

    // Create notification
    const notification = await db.customerNotification.create({
      data: {
        restaurantId,
        customerId,
        type: type.toUpperCase(),
        channel: channel.toUpperCase(),
        title,
        message,
        templateId,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        status: scheduledFor ? 'SCHEDULED' : 'PENDING',
        metadata: metadata ? JSON.stringify(metadata) : null
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      }
    })

    // If not scheduled, try to send immediately
    if (!scheduledFor) {
      await sendNotification(notification)
    }

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error creating customer notification:', error)
    return NextResponse.json(
      { error: 'Failed to create customer notification' },
      { status: 500 }
    )
  }
}

async function sendNotification(notification: any) {
  try {
    // Update status to sending
    await db.customerNotification.update({
      where: { id: notification.id },
      data: { status: 'SENDING' }
    })

    let sent = false
    let errorMessage = null

    // Send based on channel
    switch (notification.channel) {
      case 'SMS':
        sent = await sendSMS(notification)
        break
      case 'EMAIL':
        sent = await sendEmail(notification)
        break
      case 'WHATSAPP':
        sent = await sendWhatsApp(notification)
        break
      case 'PUSH':
        sent = await sendPushNotification(notification)
        break
      default:
        errorMessage = 'Unsupported notification channel'
    }

    // Update status based on send result
    await db.customerNotification.update({
      where: { id: notification.id },
      data: {
        status: sent ? 'SENT' : 'FAILED',
        sentAt: sent ? new Date() : null,
        errorMessage
      }
    })

    return sent
  } catch (error) {
    console.error('Error sending notification:', error)
    await db.customerNotification.update({
      where: { id: notification.id },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    })
    return false
  }
}

async function sendSMS(notification: any) {
  // This is a mock implementation
  // In a real implementation, you would integrate with SMS providers like Twilio, AWS SNS, etc.
  console.log(`Sending SMS to ${notification.customer.phone}: ${notification.message}`)
  
  // Simulate SMS sending
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Simulate 90% success rate
  return Math.random() > 0.1
}

async function sendEmail(notification: any) {
  // This is a mock implementation
  // In a real implementation, you would integrate with email services like SendGrid, AWS SES, etc.
  console.log(`Sending Email to ${notification.customer.email}: ${notification.title}`)
  
  // Simulate email sending
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Simulate 95% success rate
  return Math.random() > 0.05
}

async function sendWhatsApp(notification: any) {
  // This is a mock implementation
  // In a real implementation, you would integrate with WhatsApp Business API
  console.log(`Sending WhatsApp to ${notification.customer.phone}: ${notification.message}`)
  
  // Simulate WhatsApp sending
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Simulate 85% success rate
  return Math.random() > 0.15
}

async function sendPushNotification(notification: any) {
  // This is a mock implementation
  // In a real implementation, you would integrate with FCM, APNS, etc.
  console.log(`Sending Push Notification to customer ${notification.customerId}: ${notification.title}`)
  
  // Simulate push notification sending
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Simulate 80% success rate
  return Math.random() > 0.2
}