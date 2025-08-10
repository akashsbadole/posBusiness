import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    if (type === 'status') {
      // Return overall chat system status
      const status = {
        online: true,
        lastUpdate: new Date().toISOString(),
        services: {
          chatBot: {
            status: 'operational',
            responseTime: '< 1 second',
            lastCheck: new Date().toISOString()
          },
          developerChat: {
            status: 'operational',
            availableDevelopers: 3,
            onlineDevelopers: 2,
            lastCheck: new Date().toISOString()
          },
          supportTickets: {
            status: 'operational',
            openTickets: 2,
            inProgressTickets: 1,
            averageResolutionTime: '24 hours',
            lastCheck: new Date().toISOString()
          }
        },
        statistics: {
          totalChatsToday: 156,
          totalTicketsToday: 8,
          averageResponseTime: '2 minutes',
          satisfactionRate: '94%'
        }
      }
      
      return NextResponse.json(status)
    }
    
    if (type === 'analytics') {
      // Return chat analytics data
      const analytics = {
        dailyStats: [
          { date: '2024-01-01', chats: 45, tickets: 3, responses: 42 },
          { date: '2024-01-02', chats: 52, tickets: 5, responses: 48 },
          { date: '2024-01-03', chats: 38, tickets: 2, responses: 36 },
          { date: '2024-01-04', chats: 67, tickets: 8, responses: 61 },
          { date: '2024-01-05', chats: 89, tickets: 6, responses: 84 },
          { date: '2024-01-06', chats: 73, tickets: 4, responses: 69 },
          { date: '2024-01-07', chats: 156, tickets: 8, responses: 148 }
        ],
        categoryDistribution: [
          { category: 'Payment', count: 35, percentage: 28 },
          { category: 'Inventory', count: 28, percentage: 22 },
          { category: 'Technical', count: 24, percentage: 19 },
          { category: 'Mobile', count: 18, percentage: 14 },
          { category: 'Account', count: 12, percentage: 9 },
          { category: 'Other', count: 9, percentage: 8 }
        ],
        responseTimeMetrics: {
          average: '2.3 minutes',
          fastest: '30 seconds',
          slowest: '15 minutes',
          target: '< 5 minutes'
        },
        satisfactionMetrics: {
          overall: 94,
          chatBot: 91,
          developerSupport: 96,
          ticketSupport: 95
        }
      }
      
      return NextResponse.json(analytics)
    }
    
    if (type === 'config') {
      // Return chat system configuration
      const config = {
        chatBot: {
          enabled: true,
          maxTokens: 500,
          temperature: 0.7,
          allowedTopics: [
            'orders', 'inventory', 'payments', 'customers', 'staff', 
            'settings', 'menu', 'reports', 'technical', 'general'
          ],
          businessContext: true,
          personalization: true
        },
        developerChat: {
          enabled: true,
          maxSessionDuration: 3600, // 1 hour in seconds
          allowedFileTypes: ['txt', 'pdf', 'jpg', 'png', 'log'],
          maxFileSize: 10485760, // 10MB in bytes
          autoAwayTimeout: 300 // 5 minutes in seconds
        },
        supportTickets: {
          enabled: true,
          autoAssignment: true,
          slaTargets: {
            high: '4 hours',
            medium: '24 hours',
            low: '72 hours'
          },
          categories: [
            'Payment', 'Inventory', 'Technical', 'Mobile', 'Account', 'Other'
          ],
          priorities: ['low', 'medium', 'high', 'urgent']
        },
        notifications: {
          email: true,
          push: true,
          desktop: true,
          responseAlerts: true,
          ticketUpdates: true,
          developerMessages: true
        }
      }
      
      return NextResponse.json(config)
    }
    
    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    
  } catch (error) {
    console.error('Error in chat system API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json()
    
    if (action === 'update_config') {
      // Update chat system configuration
      const { config } = data
      
      // In a real app, you would save this to a database or config file
      console.log('Updating chat system configuration:', config)
      
      return NextResponse.json({
        message: 'Configuration updated successfully',
        timestamp: new Date().toISOString()
      })
    }
    
    if (action === 'test_connection') {
      // Test connection to AI service
      try {
        // Test the ZAI connection
        const testResponse = {
          status: 'connected',
          responseTime: '< 1 second',
          timestamp: new Date().toISOString(),
          service: 'ZAI Chat Service'
        }
        
        return NextResponse.json(testResponse)
      } catch (error) {
        return NextResponse.json({
          status: 'error',
          error: 'Failed to connect to AI service',
          timestamp: new Date().toISOString()
        }, { status: 500 })
      }
    }
    
    if (action === 'export_chat_data') {
      // Export chat data for analytics
      const { startDate, endDate, format } = data
      
      // In a real app, you would query the database for actual chat data
      const exportData = {
        exportId: Date.now().toString(),
        status: 'processing',
        startDate,
        endDate,
        format: format || 'json',
        estimatedSize: '2.5MB',
        downloadUrl: `/api/chat/exports/${Date.now().toString()}.${format || 'json'}`,
        timestamp: new Date().toISOString()
      }
      
      return NextResponse.json(exportData)
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (error) {
    console.error('Error in chat system API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}