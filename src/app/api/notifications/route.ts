import { NextRequest, NextResponse } from 'next/server'
import { notificationService, notificationTemplates } from '@/lib/notification-service'

interface NotificationRecipient {
  id: string
  name: string
  email?: string
  phone?: string
  preferences: {
    email: boolean
    sms: boolean
    whatsapp: boolean
  }
}

interface SendNotificationRequest {
  recipients: NotificationRecipient[]
  templateId: string
  variablesList: { [key: string]: any }[]
  priority?: 'low' | 'normal' | 'high'
}

export async function POST(request: NextRequest) {
  try {
    const body: SendNotificationRequest = await request.json()
    const { recipients, templateId, variablesList, priority = 'normal' } = body

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Recipients array is required and cannot be empty' },
        { status: 400 }
      )
    }

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    if (!variablesList || !Array.isArray(variablesList) || variablesList.length === 0) {
      return NextResponse.json(
        { error: 'Variables list is required and cannot be empty' },
        { status: 400 }
      )
    }

    if (recipients.length !== variablesList.length) {
      return NextResponse.json(
        { error: 'Number of recipients must match number of variables lists' },
        { status: 400 }
      )
    }

    // Get the template
    const template = notificationTemplates[templateId]
    if (!template) {
      return NextResponse.json(
        { error: `Template '${templateId}' not found` },
        { status: 404 }
      )
    }

    // Send notifications
    const results = await notificationService.sendBulkNotifications(
      recipients,
      template,
      variablesList
    )

    // Calculate success rate
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    const successRate = results.length > 0 ? (successful / results.length) * 100 : 0

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        successful,
        failed,
        successRate: Math.round(successRate * 100) / 100
      },
      template: {
        id: template.id,
        name: template.name,
        type: template.type
      }
    })
  } catch (error) {
    console.error('Error sending notifications:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Return available templates
    const templates = Object.values(notificationTemplates).map(template => ({
      id: template.id,
      name: template.name,
      type: template.type,
      variables: template.variables
    }))

    return NextResponse.json({
      success: true,
      templates
    })
  } catch (error) {
    console.error('Error fetching notification templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification templates' },
      { status: 500 }
    )
  }
}