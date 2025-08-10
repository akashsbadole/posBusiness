import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const includeResolved = searchParams.get('includeResolved') === 'true'

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 })
    }

    const whereClause: any = { restaurantId }
    if (!includeResolved) {
      whereClause.isResolved = false
    }

    const alerts = await db.inventoryAlert.findMany({
      where: whereClause,
      include: {
        inventoryItem: true,
        restaurant: true
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching inventory alerts:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory alerts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantId, checkAllItems } = body

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 })
    }

    // Get all inventory items for the restaurant
    const inventoryItems = await db.inventoryItem.findMany({
      where: { 
        restaurantId,
        isActive: true 
      },
      include: {
        menuItem: true
      }
    })

    // Generate alerts for items that need attention
    const alerts = await generateInventoryAlerts(inventoryItems, restaurantId)

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error generating inventory alerts:', error)
    return NextResponse.json({ error: 'Failed to generate inventory alerts' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, isResolved } = body

    if (!id) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 })
    }

    const alert = await db.inventoryAlert.update({
      where: { id },
      data: {
        isResolved: isResolved || false,
        resolvedAt: isResolved ? new Date() : null
      },
      include: {
        inventoryItem: true,
        restaurant: true
      }
    })

    return NextResponse.json(alert)
  } catch (error) {
    console.error('Error updating inventory alert:', error)
    return NextResponse.json({ error: 'Failed to update inventory alert' }, { status: 500 })
  }
}

async function generateInventoryAlerts(inventoryItems: any[], restaurantId: string) {
  try {
    const zai = await ZAI.create()

    // Get historical usage data
    const usageData = await getUsageData(restaurantId)

    const alerts = []

    for (const item of inventoryItems) {
      // Basic threshold-based alerts
      if (item.quantity <= item.minStock) {
        const severity = item.quantity === 0 ? 'CRITICAL' : 'HIGH'
        const predictedDays = await predictStockoutDays(item, usageData)

        const alert = await db.inventoryAlert.create({
          data: {
            restaurantId,
            inventoryItemId: item.id,
            type: 'LOW_STOCK',
            severity,
            message: `${item.name} is running low on stock`,
            currentQuantity: item.quantity,
            threshold: item.minStock,
            predictedDays,
            recommendation: generateReorderRecommendation(item, predictedDays)
          },
          include: {
            inventoryItem: true,
            restaurant: true
          }
        })

        alerts.push(alert)
      }

      // Overstock alerts
      if (item.quantity >= item.maxStock) {
        const alert = await db.inventoryAlert.create({
          data: {
            restaurantId,
            inventoryItemId: item.id,
            type: 'OVERSTOCK',
            severity: 'MEDIUM',
            message: `${item.name} is overstocked`,
            currentQuantity: item.quantity,
            threshold: item.maxStock,
            recommendation: 'Consider reducing order quantities or running promotions'
          },
          include: {
            inventoryItem: true,
            restaurant: true
          }
        })

        alerts.push(alert)
      }

      // AI-powered predictive alerts
      if (usageData[item.id] && usageData[item.id].length > 0) {
        const aiAlert = await generateAIAlert(item, usageData[item.id], restaurantId)
        if (aiAlert) {
          alerts.push(aiAlert)
        }
      }
    }

    return alerts
  } catch (error) {
    console.error('Error generating inventory alerts:', error)
    return []
  }
}

async function getUsageData(restaurantId: string) {
  // Get order data to calculate usage patterns
  const orders = await db.order.findMany({
    where: {
      restaurantId,
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    },
    include: {
      orderItems: {
        include: {
          menuItem: true
        }
      }
    }
  })

  const usageData: { [key: string]: any[] } = {}

  orders.forEach(order => {
    const orderDate = order.createdAt.toISOString().split('T')[0]
    
    order.orderItems.forEach(orderItem => {
      const menuItem = orderItem.menuItem
      if (!menuItem) return

      // Find inventory item for this menu item
      // This is a simplified version - in reality, you'd need a more complex mapping
      const inventoryItemId = menuItem.id // Assuming direct mapping for simplicity

      if (!usageData[inventoryItemId]) {
        usageData[inventoryItemId] = []
      }

      usageData[inventoryItemId].push({
        date: orderDate,
        quantity: orderItem.quantity
      })
    })
  })

  return usageData
}

async function predictStockoutDays(item: any, usageData: { [key: string]: any[] }) {
  if (!usageData[item.id] || usageData[item.id].length === 0) {
    return null
  }

  const dailyUsage = usageData[item.id]
  const avgDailyUsage = dailyUsage.reduce((sum, day) => sum + day.quantity, 0) / dailyUsage.length

  if (avgDailyUsage === 0) {
    return null
  }

  return Math.floor(item.quantity / avgDailyUsage)
}

function generateReorderRecommendation(item: any, predictedDays: number | null) {
  if (predictedDays === null) {
    return 'Reorder soon - usage pattern unclear'
  }

  if (predictedDays <= 1) {
    return 'URGENT: Reorder immediately'
  } else if (predictedDays <= 3) {
    return 'Reorder within 3 days'
  } else if (predictedDays <= 7) {
    return 'Reorder within a week'
  } else {
    return `Reorder in ${predictedDays} days`
  }
}

async function generateAIAlert(item: any, usageData: any[], restaurantId: string) {
  try {
    const zai = await ZAI.create()

    // Calculate usage patterns
    const totalUsage = usageData.reduce((sum, day) => sum + day.quantity, 0)
    const avgDailyUsage = totalUsage / usageData.length
    const recentUsage = usageData.slice(-7).reduce((sum, day) => sum + day.quantity, 0) / 7 // Last 7 days

    const usageTrend = recentUsage > avgDailyUsage ? 'increasing' : 'stable'

    const prompt = `
      Analyze this inventory item and generate predictive alerts:

      Item: ${item.name}
      Current Quantity: ${item.quantity}
      Min Stock: ${item.minStock}
      Max Stock: ${item.maxStock}
      Average Daily Usage: ${avgDailyUsage.toFixed(2)}
      Recent Daily Usage (7 days): ${recentUsage.toFixed(2)}
      Usage Trend: ${usageTrend}
      Current Stock Level: ${((item.quantity / item.maxStock) * 100).toFixed(1)}%

      Generate an alert if:
      1. Stock is likely to run out soon based on usage patterns
      2. Usage has suddenly increased
      3. Stock levels are unhealthy

      If an alert is needed, provide:
      - Alert type (LOW_STOCK, STOCKOUT, USAGE_SPIKE)
      - Severity (LOW, MEDIUM, HIGH, CRITICAL)
      - Message
      - Predicted days until stockout (if applicable)
      - Recommendation

      Return the response as JSON if an alert is needed, or null if no alert is needed.
    `

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI inventory management system. Predict stock issues and provide actionable recommendations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      return null
    }

    let alertData
    try {
      alertData = JSON.parse(response)
    } catch (parseError) {
      return null
    }

    if (!alertData) {
      return null
    }

    const alert = await db.inventoryAlert.create({
      data: {
        restaurantId,
        inventoryItemId: item.id,
        type: alertData.type,
        severity: alertData.severity,
        message: alertData.message,
        currentQuantity: item.quantity,
        threshold: item.minStock,
        predictedDays: alertData.predictedDays,
        recommendation: alertData.recommendation
      },
      include: {
        inventoryItem: true,
        restaurant: true
      }
    })

    return alert
  } catch (error) {
    console.error('Error generating AI alert:', error)
    return null
  }
}