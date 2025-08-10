import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const customerId = searchParams.get('customerId')
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 })
    }

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    // Get customer's order history
    const customerOrders = await db.order.findMany({
      where: { customerId, restaurantId },
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Analyze purchase patterns
    const purchaseHistory = analyzePurchaseHistory(customerOrders)
    
    // Get all available menu items
    const menuItems = await db.menuItem.findMany({
      where: { 
        restaurantId, 
        isActive: true, 
        isAvailable: true 
      },
      include: {
        category: true
      }
    })

    // Use AI to generate product suggestions
    const suggestions = await generateProductSuggestions(
      purchaseHistory, 
      menuItems, 
      customerId, 
      restaurantId
    )

    return NextResponse.json(suggestions.slice(0, limit))
  } catch (error) {
    console.error('Error generating product suggestions:', error)
    return NextResponse.json({ error: 'Failed to generate product suggestions' }, { status: 500 })
  }
}

function analyzePurchaseHistory(orders: any[]) {
  const itemFrequency: { [key: string]: number } = {}
  const categoryFrequency: { [key: string]: number } = {}
  const totalSpent = 0
  const orderCount = orders.length

  orders.forEach(order => {
    order.orderItems.forEach((item: any) => {
      const itemId = item.menuItem.id
      const categoryName = item.menuItem.category?.name || 'Unknown'
      
      itemFrequency[itemId] = (itemFrequency[itemId] || 0) + item.quantity
      categoryFrequency[categoryName] = (categoryFrequency[categoryName] || 0) + item.quantity
    })
  })

  return {
    itemFrequency,
    categoryFrequency,
    totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    orderCount,
    avgOrderValue: orderCount > 0 ? totalSpent / orderCount : 0
  }
}

async function generateProductSuggestions(
  purchaseHistory: any, 
  menuItems: any[], 
  customerId: string, 
  restaurantId: string
) {
  try {
    const zai = await ZAI.create()

    const prompt = `
      Based on the following customer purchase history, suggest related products that the customer might like:

      Purchase History:
      - Items purchased: ${JSON.stringify(purchaseHistory.itemFrequency)}
      - Categories preferred: ${JSON.stringify(purchaseHistory.categoryFrequency)}
      - Total spent: ₹${purchaseHistory.totalSpent}
      - Order count: ${purchaseHistory.orderCount}
      - Average order value: ₹${purchaseHistory.avgOrderValue}

      Available Menu Items:
      ${menuItems.map(item => `- ${item.name} (${item.category?.name || 'Unknown'}) - ₹${item.price}`).join('\n')}

      Provide 5 product suggestions with:
      1. Product name
      2. Reason for suggestion
      3. Confidence level (0-1)
      4. Type (UPSELL, CROSS_SELL, REORDER_REMINDER)

      Return the response as a JSON array.
    `

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI product recommendation engine for a POS system. Analyze customer purchase patterns and suggest relevant products.'
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

    let suggestions
    try {
      suggestions = JSON.parse(response)
    } catch (parseError) {
      // If JSON parsing fails, create fallback suggestions
      suggestions = createFallbackSuggestions(purchaseHistory, menuItems)
    }

    // Save suggestions to database
    const savedSuggestions = []
    for (const suggestion of suggestions) {
      const menuItem = menuItems.find(item => 
        item.name.toLowerCase().includes(suggestion.product.toLowerCase())
      )

      if (menuItem) {
        const savedSuggestion = await db.aISuggestion.create({
          data: {
            restaurantId,
            customerId,
            type: suggestion.type || 'PRODUCT_SUGGESTION',
            title: `Try ${menuItem.name}`,
            description: suggestion.reason || 'Based on your purchase history',
            data: JSON.stringify({
              menuItemId: menuItem.id,
              confidence: suggestion.confidence || 0.7,
              reason: suggestion.reason
            }),
            confidence: suggestion.confidence || 0.7
          },
          include: {
            customer: true,
            restaurant: true
          }
        })
        savedSuggestions.push(savedSuggestion)
      }
    }

    return savedSuggestions
  } catch (error) {
    console.error('Error generating AI suggestions:', error)
    // Fallback to rule-based suggestions
    const fallbackSuggestions = createFallbackSuggestions(purchaseHistory, menuItems)
    
    const savedSuggestions = []
    for (const suggestion of fallbackSuggestions) {
      const savedSuggestion = await db.aISuggestion.create({
        data: {
          restaurantId,
          customerId,
          type: suggestion.type,
          title: suggestion.title,
          description: suggestion.description,
          data: JSON.stringify(suggestion.data),
          confidence: suggestion.confidence
        },
        include: {
          customer: true,
          restaurant: true
        }
      })
      savedSuggestions.push(savedSuggestion)
    }

    return savedSuggestions
  }
}

function createFallbackSuggestions(purchaseHistory: any, menuItems: any[]) {
  const suggestions = []
  
  // Find most purchased category
  const mostPurchasedCategory = Object.entries(purchaseHistory.categoryFrequency)
    .sort(([,a], [,b]) => b - a)[0]

  if (mostPurchasedCategory) {
    const [categoryName] = mostPurchasedCategory
    const categoryItems = menuItems.filter(item => 
      item.category?.name === categoryName
    )

    // Suggest popular items from favorite category
    const popularItems = categoryItems.slice(0, 3)
    popularItems.forEach(item => {
      suggestions.push({
        type: 'PRODUCT_SUGGESTION',
        title: `Try ${item.name}`,
        description: `Popular item from your favorite category: ${categoryName}`,
        data: {
          menuItemId: item.id,
          confidence: 0.6
        },
        confidence: 0.6
      })
    })
  }

  // Suggest higher-priced items for upsell
  const avgOrderValue = purchaseHistory.avgOrderValue
  const upsellItems = menuItems.filter(item => 
    item.price > avgOrderValue * 0.5 && item.price <= avgOrderValue * 1.5
  ).slice(0, 2)

  upsellItems.forEach(item => {
    suggestions.push({
      type: 'UPSELL',
      title: `Upgrade to ${item.name}`,
      description: `Premium option within your budget range`,
      data: {
        menuItemId: item.id,
        confidence: 0.5
      },
      confidence: 0.5
    })
  })

  return suggestions
}