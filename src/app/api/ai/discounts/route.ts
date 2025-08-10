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

    const whereClause: any = { restaurantId, isActive: true }
    
    // Filter by customer if specified
    if (customerId) {
      // Get customer data for personalization
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

      if (customer) {
        // Generate personalized discounts
        const personalizedDiscounts = await generatePersonalizedDiscounts(customer, restaurantId)
        return NextResponse.json(personalizedDiscounts)
      }
    }

    // Get general active discounts
    const discounts = await db.discountRule.findMany({
      where: whereClause,
      include: {
        restaurant: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(discounts)
  } catch (error) {
    console.error('Error fetching discounts:', error)
    return NextResponse.json({ error: 'Failed to fetch discounts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      restaurantId, 
      name, 
      description, 
      type, 
      value, 
      conditions, 
      targetCustomers,
      minPurchaseAmount,
      maxDiscountAmount,
      usageLimit,
      startDate,
      endDate
    } = body

    if (!restaurantId || !name || !type || value === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const discount = await db.discountRule.create({
      data: {
        restaurantId,
        name,
        description,
        type,
        value,
        conditions: conditions ? JSON.stringify(conditions) : null,
        targetCustomers: targetCustomers ? JSON.stringify(targetCustomers) : null,
        minPurchaseAmount,
        maxDiscountAmount,
        usageLimit,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      },
      include: {
        restaurant: true
      }
    })

    return NextResponse.json(discount)
  } catch (error) {
    console.error('Error creating discount rule:', error)
    return NextResponse.json({ error: 'Failed to create discount rule' }, { status: 500 })
  }
}

async function generatePersonalizedDiscounts(customer: any, restaurantId: string) {
  try {
    const zai = await ZAI.create()

    // Analyze customer data
    const totalOrders = customer.orders.length
    const totalSpent = customer.orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0)
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
    const loyaltyPoints = customer.loyaltyPoints

    // Get purchase patterns
    const purchasePatterns = analyzePurchasePatterns(customer.orders)

    const prompt = `
      Generate personalized discount offers for this customer:

      Customer Profile:
      - Total Orders: ${totalOrders}
      - Total Spent: ₹${totalSpent}
      - Average Order Value: ₹${avgOrderValue}
      - Loyalty Points: ${loyaltyPoints}
      - Purchase Patterns: ${JSON.stringify(purchasePatterns)}

      Create 3 personalized discount offers with:
      1. Discount name
      2. Description
      3. Type (PERCENTAGE, FIXED_AMOUNT, LOYALTY_POINTS)
      4. Value
      5. Minimum purchase amount
      6. Reason for the offer

      Consider:
      - High-value customers deserve better discounts
      - Frequent customers might appreciate loyalty-based offers
      - Customers with high average order value could get percentage discounts
      - New customers might need introductory offers

      Return the response as a JSON array.
    `

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI discount recommendation engine for a POS system. Create personalized discount offers based on customer behavior and value.'
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

    let aiDiscounts
    try {
      aiDiscounts = JSON.parse(response)
    } catch (parseError) {
      aiDiscounts = createFallbackDiscounts(customer)
    }

    // Convert AI discounts to database format and save
    const personalizedDiscounts = []
    for (const discount of aiDiscounts) {
      const discountRule = await db.discountRule.create({
        data: {
          restaurantId,
          name: discount.name,
          description: discount.description,
          type: discount.type,
          value: discount.value,
          minPurchaseAmount: discount.minPurchaseAmount,
          targetCustomers: JSON.stringify({
            customerIds: [customer.id],
            conditions: discount.conditions || {}
          }),
          usageLimit: 1, // Personalized offers are typically one-time use
          isActive: true
        },
        include: {
          restaurant: true
        }
      })

      // Create AI suggestion for the discount
      await db.aISuggestion.create({
        data: {
          restaurantId,
          customerId: customer.id,
          type: 'DISCOUNT_OFFER',
          title: discount.name,
          description: discount.reason || 'Personalized offer based on your purchase history',
          data: JSON.stringify({
            discountId: discountRule.id,
            confidence: 0.8
          }),
          confidence: 0.8
        }
      })

      personalizedDiscounts.push(discountRule)
    }

    return personalizedDiscounts
  } catch (error) {
    console.error('Error generating personalized discounts:', error)
    const fallbackDiscounts = createFallbackDiscounts(customer)
    
    const personalizedDiscounts = []
    for (const discount of fallbackDiscounts) {
      const discountRule = await db.discountRule.create({
        data: {
          restaurantId,
          name: discount.name,
          description: discount.description,
          type: discount.type,
          value: discount.value,
          minPurchaseAmount: discount.minPurchaseAmount,
          targetCustomers: JSON.stringify({
            customerIds: [customer.id]
          }),
          usageLimit: 1,
          isActive: true
        },
        include: {
          restaurant: true
        }
      })

      personalizedDiscounts.push(discountRule)
    }

    return personalizedDiscounts
  }
}

function analyzePurchasePatterns(orders: any[]) {
  const patterns = {
    frequentCategories: {} as { [key: string]: number },
    averageOrderValue: 0,
    visitFrequency: 0,
    preferredPriceRange: 'low'
  }

  let totalSpent = 0
  orders.forEach(order => {
    totalSpent += order.totalAmount
    order.orderItems.forEach((item: any) => {
      const category = item.menuItem.category?.name || 'Unknown'
      patterns.frequentCategories[category] = (patterns.frequentCategories[category] || 0) + 1
    })
  })

  patterns.averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0
  patterns.visitFrequency = orders.length

  if (patterns.averageOrderValue > 1000) {
    patterns.preferredPriceRange = 'high'
  } else if (patterns.averageOrderValue > 500) {
    patterns.preferredPriceRange = 'medium'
  }

  return patterns
}

function createFallbackDiscounts(customer: any) {
  const totalOrders = customer.orders.length
  const totalSpent = customer.orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0)
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0

  const discounts = []

  if (totalOrders === 0) {
    // First-time customer discount
    discounts.push({
      name: 'Welcome Offer',
      description: 'Special discount for your first order',
      type: 'PERCENTAGE',
      value: 15,
      minPurchaseAmount: 200,
      conditions: { firstOrder: true }
    })
  } else if (totalOrders >= 10) {
    // Loyalty discount
    discounts.push({
      name: 'Loyalty Reward',
      description: 'Thank you for being a loyal customer',
      type: 'PERCENTAGE',
      value: 20,
      minPurchaseAmount: 500,
      conditions: { loyalCustomer: true }
    })
  } else {
    // Regular customer discount
    discounts.push({
      name: 'Come Back Soon',
      description: 'We miss you! Here\'s a discount for your next visit',
      type: 'FIXED_AMOUNT',
      value: 100,
      minPurchaseAmount: 300,
      conditions: { returningCustomer: true }
    })
  }

  // High-value customer discount
  if (avgOrderValue > 1000) {
    discounts.push({
      name: 'VIP Treatment',
      description: 'Exclusive discount for our valued customers',
      type: 'PERCENTAGE',
      value: 25,
      minPurchaseAmount: 1000,
      conditions: { highValueCustomer: true }
    })
  }

  return discounts
}