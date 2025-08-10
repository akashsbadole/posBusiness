import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const days = parseInt(searchParams.get('days') || '7')

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 })
    }

    // Get historical data
    const historicalData = await getHistoricalData(restaurantId, days)
    
    // Generate sales forecast
    const forecast = await generateSalesForecast(historicalData, restaurantId, days)

    return NextResponse.json(forecast)
  } catch (error) {
    console.error('Error generating sales forecast:', error)
    return NextResponse.json({ error: 'Failed to generate sales forecast' }, { status: 500 })
  }
}

async function getHistoricalData(restaurantId: string, days: number) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - (days * 2)) // Get double the days for better analysis

  const orders = await db.order.findMany({
    where: {
      restaurantId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      orderItems: true
    },
    orderBy: { createdAt: 'asc' }
  })

  // Group orders by day
  const dailyData: { [key: string]: any } = {}
  
  orders.forEach(order => {
    const dateKey = order.createdAt.toISOString().split('T')[0]
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        date: dateKey,
        revenue: 0,
        orders: 0,
        avgOrderValue: 0,
        itemsSold: 0
      }
    }
    
    dailyData[dateKey].revenue += order.totalAmount
    dailyData[dateKey].orders += 1
    dailyData[dateKey].itemsSold += order.orderItems.reduce((sum, item) => sum + item.quantity, 0)
  })

  // Calculate average order value for each day
  Object.keys(dailyData).forEach(dateKey => {
    const dayData = dailyData[dateKey]
    dayData.avgOrderValue = dayData.orders > 0 ? dayData.revenue / dayData.orders : 0
  })

  return Object.values(dailyData)
}

async function generateSalesForecast(historicalData: any[], restaurantId: string, forecastDays: number) {
  try {
    const zai = await ZAI.create()

    // Calculate trends and patterns
    const trends = analyzeTrends(historicalData)

    const prompt = `
      Generate a sales forecast for the next ${forecastDays} days based on historical data:

      Historical Sales Data (last ${historicalData.length} days):
      ${historicalData.map((day, index) => 
        `Day ${index + 1}: Revenue ₹${day.revenue.toFixed(2)}, Orders: ${day.orders}, Avg Order Value: ₹${day.avgOrderValue.toFixed(2)}`
      ).join('\n')}

      Trends Analysis:
      - Average Daily Revenue: ₹${trends.avgDailyRevenue.toFixed(2)}
      - Revenue Growth Rate: ${trends.revenueGrowthRate.toFixed(2)}%
      - Average Daily Orders: ${trends.avgDailyOrders.toFixed(1)}
      - Order Growth Rate: ${trends.orderGrowthRate.toFixed(2)}%
      - Average Order Value: ₹${trends.avgOrderValue.toFixed(2)}
      - Peak Day: ${trends.peakDay || 'None identified'}
      - Lowest Day: ${trends.lowestDay || 'None identified'}

      Generate a forecast for each of the next ${forecastDays} days with:
      1. Date (YYYY-MM-DD format)
      2. Predicted revenue
      3. Predicted number of orders
      4. Confidence level (0-1)
      5. Key factors influencing the prediction

      Consider:
      - Day of week patterns
      - Recent trends
      - Seasonal variations
      - Growth patterns

      Return the response as a JSON array.
    `

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI sales forecasting engine for a POS system. Analyze historical sales data and predict future sales with confidence levels.'
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
      throw new Error('No response from AI')
    }

    let aiForecast
    try {
      aiForecast = JSON.parse(response)
    } catch (parseError) {
      aiForecast = createFallbackForecast(historicalData, forecastDays)
    }

    // Save forecast to database
    const savedForecast = []
    for (const dayForecast of aiForecast) {
      const forecastDate = new Date(dayForecast.date)
      
      const forecast = await db.salesForecast.create({
        data: {
          restaurantId,
          forecastDate,
          predictedRevenue: dayForecast.predictedRevenue,
          predictedOrders: dayForecast.predictedOrders,
          confidence: dayForecast.confidence,
          factors: JSON.stringify({
            factors: dayForecast.factors || [],
            trends: trends
          })
        },
        include: {
          restaurant: true
        }
      })

      savedForecast.push(forecast)
    }

    return savedForecast
  } catch (error) {
    console.error('Error generating AI forecast:', error)
    const fallbackForecast = createFallbackForecast(historicalData, forecastDays)
    
    const savedForecast = []
    for (const dayForecast of fallbackForecast) {
      const forecastDate = new Date(dayForecast.date)
      
      const forecast = await db.salesForecast.create({
        data: {
          restaurantId,
          forecastDate,
          predictedRevenue: dayForecast.predictedRevenue,
          predictedOrders: dayForecast.predictedOrders,
          confidence: dayForecast.confidence,
          factors: JSON.stringify({ method: 'fallback' })
        },
        include: {
          restaurant: true
        }
      })

      savedForecast.push(forecast)
    }

    return savedForecast
  }
}

function analyzeTrends(historicalData: any[]) {
  if (historicalData.length < 2) {
    return {
      avgDailyRevenue: 0,
      revenueGrowthRate: 0,
      avgDailyOrders: 0,
      orderGrowthRate: 0,
      avgOrderValue: 0,
      peakDay: null,
      lowestDay: null
    }
  }

  const totalRevenue = historicalData.reduce((sum, day) => sum + day.revenue, 0)
  const totalOrders = historicalData.reduce((sum, day) => sum + day.orders, 0)
  
  const avgDailyRevenue = totalRevenue / historicalData.length
  const avgDailyOrders = totalOrders / historicalData.length
  const avgOrderValue = historicalData.reduce((sum, day) => sum + day.avgOrderValue, 0) / historicalData.length

  // Calculate growth rates
  const firstHalf = historicalData.slice(0, Math.floor(historicalData.length / 2))
  const secondHalf = historicalData.slice(Math.floor(historicalData.length / 2))

  const firstHalfRevenue = firstHalf.reduce((sum, day) => sum + day.revenue, 0)
  const secondHalfRevenue = secondHalf.reduce((sum, day) => sum + day.revenue, 0)
  
  const revenueGrowthRate = firstHalfRevenue > 0 ? 
    ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 : 0

  const firstHalfOrders = firstHalf.reduce((sum, day) => sum + day.orders, 0)
  const secondHalfOrders = secondHalf.reduce((sum, day) => sum + day.orders, 0)
  
  const orderGrowthRate = firstHalfOrders > 0 ? 
    ((secondHalfOrders - firstHalfOrders) / firstHalfOrders) * 100 : 0

  // Find peak and lowest days
  const peakDay = historicalData.reduce((max, day) => 
    day.revenue > max.revenue ? day : max
  )
  
  const lowestDay = historicalData.reduce((min, day) => 
    day.revenue < min.revenue ? day : min
  )

  return {
    avgDailyRevenue,
    revenueGrowthRate,
    avgDailyOrders,
    orderGrowthRate,
    avgOrderValue,
    peakDay: peakDay.date,
    lowestDay: lowestDay.date
  }
}

function createFallbackForecast(historicalData: any[], forecastDays: number) {
  if (historicalData.length === 0) {
    return []
  }

  const trends = analyzeTrends(historicalData)
  const forecast = []

  for (let i = 1; i <= forecastDays; i++) {
    const forecastDate = new Date()
    forecastDate.setDate(forecastDate.getDate() + i)

    // Simple trend-based forecasting
    const growthFactor = 1 + (trends.revenueGrowthRate / 100)
    const predictedRevenue = trends.avgDailyRevenue * growthFactor
    const predictedOrders = trends.avgDailyOrders * growthFactor

    forecast.push({
      date: forecastDate.toISOString().split('T')[0],
      predictedRevenue,
      predictedOrders: Math.round(predictedOrders),
      confidence: Math.max(0.3, Math.min(0.8, 1 - (i * 0.05))), // Decreasing confidence
      factors: ['Historical average', 'Simple trend analysis']
    })
  }

  return forecast
}