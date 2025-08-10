import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const customerId = searchParams.get('customerId')

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 })
    }

    if (customerId) {
      // Get specific customer loyalty data
      const customerLoyalty = await getCustomerLoyaltyData(customerId, restaurantId)
      return NextResponse.json(customerLoyalty)
    }

    // Get all customers loyalty insights
    const insights = await db.customerInsight.findMany({
      where: { restaurantId },
      include: {
        customer: true
      },
      orderBy: { loyaltyScore: 'desc' }
    })

    return NextResponse.json(insights)
  } catch (error) {
    console.error('Error fetching loyalty data:', error)
    return NextResponse.json({ error: 'Failed to fetch loyalty data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantId, customerId, action } = body

    if (!restaurantId || !customerId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    switch (action) {
      case 'update_insights':
        const insights = await updateCustomerInsights(customerId, restaurantId)
        return NextResponse.json(insights)
      
      case 'generate_rewards':
        const rewards = await generateLoyaltyRewards(customerId, restaurantId)
        return NextResponse.json(rewards)
      
      case 'analyze_loyalty':
        const analysis = await analyzeCustomerLoyalty(customerId, restaurantId)
        return NextResponse.json(analysis)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error processing loyalty action:', error)
    return NextResponse.json({ error: 'Failed to process loyalty action' }, { status: 500 })
  }
}

async function getCustomerLoyaltyData(customerId: string, restaurantId: string) {
  const customer = await db.customer.findUnique({
    where: { id: customerId },
    include: {
      orders: {
        include: {
          orderItems: {
            include: {
              menuItem: true
            }
          }
        }
      },
      loyaltyRewards: {
        where: { isRedeemed: false },
        orderBy: { createdAt: 'desc' }
      },
      customerInsights: true
    }
  })

  if (!customer) {
    throw new Error('Customer not found')
  }

  const insight = customer.customerInsights[0] || await updateCustomerInsights(customerId, restaurantId)

  return {
    customer,
    insight,
    availableRewards: customer.loyaltyRewards
  }
}

async function updateCustomerInsights(customerId: string, restaurantId: string) {
  const customer = await db.customer.findUnique({
    where: { id: customerId },
    include: {
      orders: {
        include: {
          orderItems: {
            include: {
              menuItem: true
            }
          }
        }
      }
    }
  })

  if (!customer) {
    throw new Error('Customer not found')
  }

  // Calculate loyalty metrics
  const totalOrders = customer.orders.length
  const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalAmount, 0)
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0

  // Analyze purchase patterns
  const purchaseAnalysis = analyzePurchasePatterns(customer.orders)

  // Calculate visit frequency
  const visitFrequency = calculateVisitFrequency(customer.orders)

  // Calculate loyalty score
  const loyaltyScore = calculateLoyaltyScore(customer, purchaseAnalysis)

  // Calculate churn risk
  const churnRisk = calculateChurnRisk(customer.orders)

  // Predict next visit
  const predictedNextVisit = predictNextVisit(customer.orders)

  // Update or create customer insight
  const insight = await db.customerInsight.upsert({
    where: {
      restaurantId_customerId: {
        restaurantId,
        customerId
      }
    },
    update: {
      totalOrders,
      totalSpent,
      avgOrderValue,
      favoriteItems: JSON.stringify(purchaseAnalysis.favoriteItems),
      visitFrequency,
      lastVisit: customer.orders.length > 0 ? customer.orders[0].createdAt : null,
      predictedNextVisit,
      loyaltyScore,
      churnRisk,
      preferences: JSON.stringify(purchaseAnalysis.preferences)
    },
    create: {
      restaurantId,
      customerId,
      totalOrders,
      totalSpent,
      avgOrderValue,
      favoriteItems: JSON.stringify(purchaseAnalysis.favoriteItems),
      visitFrequency,
      lastVisit: customer.orders.length > 0 ? customer.orders[0].createdAt : null,
      predictedNextVisit,
      loyaltyScore,
      churnRisk,
      preferences: JSON.stringify(purchaseAnalysis.preferences)
    }
  })

  return insight
}

function analyzePurchasePatterns(orders: any[]) {
  const itemFrequency: { [key: string]: number } = {}
  const categoryFrequency: { [key: string]: number } = {}
  const preferences: { [key: string]: any } = {}

  orders.forEach(order => {
    order.orderItems.forEach((item: any) => {
      const itemId = item.menuItem.id
      const itemName = item.menuItem.name
      const categoryName = item.menuItem.category?.name || 'Unknown'
      
      itemFrequency[itemName] = (itemFrequency[itemName] || 0) + item.quantity
      categoryFrequency[categoryName] = (categoryFrequency[categoryName] || 0) + item.quantity
    })
  })

  // Get favorite items
  const favoriteItems = Object.entries(itemFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  // Analyze preferences
  preferences.preferredCategories = Object.entries(categoryFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([name]) => name)

  preferences.priceSensitivity = analyzePriceSensitivity(orders)
  preferences.visitPattern = analyzeVisitPattern(orders)

  return {
    favoriteItems,
    preferences
  }
}

function analyzePriceSensitivity(orders: any[]) {
  if (orders.length === 0) return 'unknown'

  const avgOrderValues = orders.map(order => 
    order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  )

  const avgOrderValue = avgOrderValues.reduce((sum, val) => sum + val, 0) / avgOrderValues.length
  const variance = avgOrderValues.reduce((sum, val) => sum + Math.pow(val - avgOrderValue, 2), 0) / avgOrderValues.length

  if (variance < avgOrderValue * 0.1) return 'consistent'
  if (variance < avgOrderValue * 0.3) return 'moderate'
  return 'variable'
}

function analyzeVisitPattern(orders: any[]) {
  if (orders.length < 3) return 'insufficient_data'

  const daysBetweenVisits = []
  for (let i = 1; i < orders.length; i++) {
    const days = Math.floor(
      (new Date(orders[i - 1].createdAt).getTime() - new Date(orders[i].createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    daysBetweenVisits.push(days)
  }

  const avgDaysBetween = daysBetweenVisits.reduce((sum, days) => sum + days, 0) / daysBetweenVisits.length

  if (avgDaysBetween <= 7) return 'frequent'
  if (avgDaysBetween <= 30) return 'regular'
  return 'occasional'
}

function calculateVisitFrequency(orders: any[]) {
  if (orders.length === 0) return 0

  const firstOrder = new Date(orders[orders.length - 1].createdAt)
  const lastOrder = new Date(orders[0].createdAt)
  const daysSpan = Math.max(1, Math.floor((lastOrder.getTime() - firstOrder.getTime()) / (1000 * 60 * 60 * 24)))

  return orders.length / daysSpan
}

function calculateLoyaltyScore(customer: any, purchaseAnalysis: any) {
  let score = 0

  // Base score from order frequency
  score += Math.min(30, customer.orders.length * 2)

  // Score from total spending
  const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalAmount, 0)
  score += Math.min(30, totalSpent / 100)

  // Score from loyalty points
  score += Math.min(20, customer.loyaltyPoints / 10)

  // Score from visit consistency
  if (purchaseAnalysis.preferences.visitPattern === 'frequent') score += 10
  else if (purchaseAnalysis.preferences.visitPattern === 'regular') score += 7
  else if (purchaseAnalysis.preferences.visitPattern === 'occasional') score += 3

  // Score from price sensitivity (consistent customers are more loyal)
  if (purchaseAnalysis.preferences.priceSensitivity === 'consistent') score += 10
  else if (purchaseAnalysis.preferences.priceSensitivity === 'moderate') score += 5

  return Math.min(100, Math.max(0, score))
}

function calculateChurnRisk(orders: any[]) {
  if (orders.length === 0) return 1.0

  const lastOrder = new Date(orders[0].createdAt)
  const daysSinceLastOrder = Math.floor((Date.now() - lastOrder.getTime()) / (1000 * 60 * 60 * 24))

  const visitFrequency = calculateVisitFrequency(orders)
  const expectedDaysBetween = visitFrequency > 0 ? 1 / visitFrequency : 30

  const risk = Math.min(1.0, daysSinceLastOrder / (expectedDaysBetween * 3))

  // Adjust risk based on customer history
  if (orders.length > 10) risk *= 0.8 // Long-term customers are less likely to churn
  if (orders.length < 3) risk *= 1.2 // New customers are more likely to churn

  return Math.min(1.0, Math.max(0.0, risk))
}

function predictNextVisit(orders: any[]) {
  if (orders.length === 0) return null

  const visitFrequency = calculateVisitFrequency(orders)
  if (visitFrequency === 0) return null

  const avgDaysBetween = 1 / visitFrequency
  const lastOrder = new Date(orders[0].createdAt)

  const predictedDate = new Date(lastOrder.getTime() + (avgDaysBetween * 24 * 60 * 60 * 1000))
  return predictedDate
}

async function generateLoyaltyRewards(customerId: string, restaurantId: string) {
  const customer = await db.customer.findUnique({
    where: { id: customerId },
    include: {
      customerInsights: true
    }
  })

  if (!customer) {
    throw new Error('Customer not found')
  }

  const insight = customer.customerInsights[0]
  if (!insight) {
    throw new Error('Customer insight not found')
  }

  try {
    const zai = await ZAI.create()

    const prompt = `
      Generate personalized loyalty rewards for this customer:

      Customer Profile:
      - Loyalty Score: ${insight.loyaltyScore}/100
      - Total Orders: ${insight.totalOrders}
      - Total Spent: ₹${insight.totalSpent}
      - Average Order Value: ₹${insight.avgOrderValue}
      - Current Loyalty Points: ${customer.loyaltyPoints}
      - Visit Frequency: ${insight.visitFrequency.toFixed(2)} visits/day
      - Churn Risk: ${(insight.churnRisk * 100).toFixed(1)}%
      - Favorite Items: ${JSON.stringify(insight.favoriteItems)}

      Generate 3 personalized rewards with:
      1. Reward name
      2. Description
      3. Type (DISCOUNT, FREE_ITEM, POINTS_BONUS, CASHBACK)
      4. Points required
      5. Value of the reward
      6. Expiration period

      Consider:
      - High loyalty score customers deserve premium rewards
      - High churn risk customers need retention incentives
      - Frequent visitors might appreciate experiential rewards
      - High spenders might value cashback or premium discounts

      Return the response as a JSON array.
    `

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI loyalty rewards engine. Create personalized rewards that encourage customer retention and increase engagement.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from AI')
    }

    let aiRewards
    try {
      aiRewards = JSON.parse(response)
    } catch (parseError) {
      aiRewards = createFallbackRewards(customer, insight)
    }

    // Save rewards to database
    const savedRewards = []
    for (const reward of aiRewards) {
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 3) // 3 months expiration

      const loyaltyReward = await db.loyaltyReward.create({
        data: {
          restaurantId,
          customerId,
          type: reward.type,
          name: reward.name,
          description: reward.description,
          pointsRequired: reward.pointsRequired,
          value: reward.value,
          expiresAt
        }
      })

      savedRewards.push(loyaltyReward)
    }

    return savedRewards
  } catch (error) {
    console.error('Error generating AI rewards:', error)
    const fallbackRewards = createFallbackRewards(customer, insight)
    
    const savedRewards = []
    for (const reward of fallbackRewards) {
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 3)

      const loyaltyReward = await db.loyaltyReward.create({
        data: {
          restaurantId,
          customerId,
          type: reward.type,
          name: reward.name,
          description: reward.description,
          pointsRequired: reward.pointsRequired,
          value: reward.value,
          expiresAt
        }
      })

      savedRewards.push(loyaltyReward)
    }

    return savedRewards
  }
}

function createFallbackRewards(customer: any, insight: any) {
  const rewards = []

  if (insight.loyaltyScore >= 80) {
    rewards.push({
      name: 'VIP Elite Reward',
      description: 'Exclusive reward for our most loyal customers',
      type: 'DISCOUNT',
      pointsRequired: 500,
      value: 25
    })
  }

  if (insight.churnRisk > 0.7) {
    rewards.push({
      name: 'We Miss You!',
      description: 'Special offer to welcome you back',
      type: 'DISCOUNT',
      pointsRequired: 100,
      value: 15
    })
  }

  if (insight.totalOrders >= 10) {
    rewards.push({
      name: 'Regular Customer Bonus',
      description: 'Thank you for your continued support',
      type: 'POINTS_BONUS',
      pointsRequired: 200,
      value: 50
    })
  }

  if (rewards.length === 0) {
    rewards.push({
      name: 'Loyalty Points Bonus',
      description: 'Earn bonus points on your next visit',
      type: 'POINTS_BONUS',
      pointsRequired: 50,
      value: 25
    })
  }

  return rewards
}

async function analyzeCustomerLoyalty(customerId: string, restaurantId: string) {
  const insight = await updateCustomerInsights(customerId, restaurantId)
  
  return {
    loyaltyScore: insight.loyaltyScore,
    churnRisk: insight.churnRisk,
    recommendations: generateLoyaltyRecommendations(insight),
    nextVisitPrediction: insight.predictedNextVisit,
    engagementLevel: getEngagementLevel(insight.loyaltyScore)
  }
}

function generateLoyaltyRecommendations(insight: any) {
  const recommendations = []

  if (insight.churnRisk > 0.7) {
    recommendations.push({
      type: 'retention',
      message: 'High churn risk detected. Consider sending a personalized offer.',
      priority: 'high'
    })
  }

  if (insight.loyaltyScore >= 80) {
    recommendations.push({
      type: 'recognition',
      message: 'Customer is highly loyal. Consider VIP treatment or exclusive offers.',
      priority: 'medium'
    })
  }

  if (insight.visitFrequency < 0.1) {
    recommendations.push({
      type: 'engagement',
      message: 'Low visit frequency. Consider a re-engagement campaign.',
      priority: 'medium'
    })
  }

  return recommendations
}

function getEngagementLevel(loyaltyScore: number) {
  if (loyaltyScore >= 80) return 'high'
  if (loyaltyScore >= 60) return 'medium'
  if (loyaltyScore >= 40) return 'low'
  return 'very_low'
}