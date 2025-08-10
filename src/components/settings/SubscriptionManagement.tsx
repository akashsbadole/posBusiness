'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Crown, 
  Star, 
  Zap, 
  Users, 
  CheckCircle, 
  AlertCircle,
  CreditCard,
  Calendar,
  TrendingUp,
  RefreshCw
} from 'lucide-react'

interface SubscriptionManagementProps {
  restaurantId: string
  currentSubscription?: any
  onSubscriptionChange?: (subscription: any) => void
}

interface Plan {
  id: string
  name: string
  price: number
  period: string
  description: string
  features: string[]
  popular?: boolean
  icon: React.ReactNode
}

export default function SubscriptionManagement({ 
  restaurantId, 
  currentSubscription, 
  onSubscriptionChange 
}: SubscriptionManagementProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('')

  const plans: Plan[] = [
    {
      id: 'BASIC',
      name: 'Basic',
      price: 999,
      period: '/month',
      description: 'Perfect for small restaurants getting started',
      features: [
        'Up to 3 staff members',
        'Basic inventory management',
        'Order management',
        'Customer management',
        'Email support',
        'Mobile app access'
      ],
      icon: <Star className="w-6 h-6" />
    },
    {
      id: 'PRO',
      name: 'Professional',
      price: 2499,
      period: '/month',
      description: 'Great for growing restaurants with multiple locations',
      features: [
        'Up to 10 staff members',
        'Advanced inventory management',
        'Multi-location support',
        'Advanced analytics',
        'Priority support',
        'API access',
        'Custom branding',
        'Loyalty program'
      ],
      popular: true,
      icon: <Crown className="w-6 h-6" />
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      price: 4999,
      period: '/month',
      description: 'Complete solution for large restaurant chains',
      features: [
        'Unlimited staff members',
        'Full inventory management',
        'Unlimited locations',
        'Advanced analytics & reporting',
        '24/7 phone support',
        'API access & integrations',
        'Custom branding',
        'Loyalty program',
        'Delivery management',
        'Online ordering system',
        'White-label solution'
      ],
      icon: <Zap className="w-6 h-6" />
    }
  ]

  const getPlanFeatures = (planId: string) => {
    return plans.find(p => p.id === planId)?.features || []
  }

  const getSubscriptionStatus = (subscription: any) => {
    if (!subscription) return { status: 'NO_SUBSCRIPTION', color: 'gray', text: 'No Subscription' }
    
    const now = new Date()
    const endDate = new Date(subscription.endDate)
    const trialEndsAt = subscription.trialEndsAt ? new Date(subscription.trialEndsAt) : null

    if (subscription.status === 'TRIAL' && trialEndsAt && trialEndsAt > now) {
      return { status: 'TRIAL', color: 'blue', text: 'Trial Active' }
    } else if (subscription.status === 'ACTIVE' && endDate > now) {
      return { status: 'ACTIVE', color: 'green', text: 'Active' }
    } else if (endDate < now) {
      return { status: 'EXPIRED', color: 'red', text: 'Expired' }
    } else {
      return { status: subscription.status, color: 'orange', text: subscription.status }
    }
  }

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId,
          plan: planId,
          paymentMethod: 'CARD' // In production, this would be handled by a payment gateway
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update subscription')
      }

      const data = await response.json()
      onSubscriptionChange?.(data.subscription)
      alert('Subscription updated successfully!')
    } catch (error) {
      console.error('Error updating subscription:', error)
      alert('Failed to update subscription. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? This will take effect at the end of your current billing period.')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/subscriptions?restaurantId=${restaurantId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      onSubscriptionChange?.(null)
      alert('Subscription cancelled successfully!')
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      alert('Failed to cancel subscription. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const subscriptionStatus = currentSubscription ? getSubscriptionStatus(currentSubscription) : { status: 'NO_SUBSCRIPTION', color: 'gray', text: 'No Subscription' }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>
            Manage your restaurant subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentSubscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={subscriptionStatus.color === 'green' ? 'default' : 'secondary'}>
                      {subscriptionStatus.text}
                    </Badge>
                    {subscriptionStatus.status === 'TRIAL' && (
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        Trial
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {currentSubscription.plan} Plan • ₹{currentSubscription.amount}/month
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    Next billing: {new Date(currentSubscription.nextBillingAt).toLocaleDateString()}
                  </div>
                  {subscriptionStatus.status === 'ACTIVE' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {getPlanFeatures(currentSubscription.plan).length}
                  </div>
                  <div className="text-sm text-gray-600">Features</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {currentSubscription.plan === 'BASIC' ? '3' : currentSubscription.plan === 'PRO' ? '10' : '∞'}
                  </div>
                  <div className="text-sm text-gray-600">Staff Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {currentSubscription.plan === 'BASIC' ? '1' : currentSubscription.plan === 'PRO' ? '3' : '∞'}
                  </div>
                  <div className="text-sm text-gray-600">Locations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {subscriptionStatus.status === 'TRIAL' ? 
                      Math.ceil((new Date(currentSubscription.trialEndsAt!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) 
                      : '∞'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {subscriptionStatus.status === 'TRIAL' ? 'Trial Days Left' : 'Support'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
              <p className="text-gray-600 mb-4">
                Choose a plan below to get started with our restaurant management system
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Choose Your Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">
                  {plan.icon}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">₹{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full ${plan.popular ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                  variant={currentSubscription?.plan === plan.id ? "outline" : "default"}
                  onClick={() => {
                    if (currentSubscription?.plan !== plan.id) {
                      setSelectedPlan(plan.id)
                      handleUpgrade(plan.id)
                    }
                  }}
                  disabled={isLoading || currentSubscription?.plan === plan.id}
                >
                  {isLoading && selectedPlan === plan.id ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : currentSubscription?.plan === plan.id ? (
                    'Current Plan'
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>
            Compare features across all subscription plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="text-center py-3 px-4">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Price</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      ₹{plan.price}/month
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Staff Members</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.id === 'BASIC' ? '3' : plan.id === 'PRO' ? '10' : 'Unlimited'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Locations</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.id === 'BASIC' ? '1' : plan.id === 'PRO' ? '3' : 'Unlimited'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Inventory Management</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Order Management</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Advanced Analytics</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.id === 'BASIC' ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">API Access</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.id === 'ENTERPRISE' ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Priority Support</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.id === 'BASIC' ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}