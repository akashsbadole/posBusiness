'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Crown, 
  Star, 
  Building2, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  CreditCard,
  Smartphone,
  Banknote,
  Calendar,
  TrendingUp
} from 'lucide-react'
import { useSubscription } from '@/hooks'

interface SubscriptionManagementProps {
  restaurantId: string
}

const PLANS = {
  BASIC: {
    name: 'Basic',
    price: 999,
    icon: Star,
    color: 'bg-blue-100 text-blue-800',
    features: [
      'Up to 50 orders per day',
      'Basic reporting',
      'Single outlet',
      'Email support',
      'Mobile app access'
    ]
  },
  PRO: {
    name: 'Pro',
    price: 2499,
    icon: Crown,
    color: 'bg-purple-100 text-purple-800',
    features: [
      'Up to 200 orders per day',
      'Advanced analytics',
      'Up to 3 outlets',
      'Priority support',
      'Custom branding',
      'Inventory management'
    ]
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 4999,
    icon: Building2,
    color: 'bg-green-100 text-green-800',
    features: [
      'Unlimited orders',
      'Full analytics suite',
      'Unlimited outlets',
      '24/7 phone support',
      'White-label solution',
      'API access',
      'Custom integrations'
    ]
  }
}

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash', icon: Banknote },
  { value: 'UPI', label: 'UPI', icon: Smartphone },
  { value: 'CARD', label: 'Credit/Debit Card', icon: CreditCard },
  { value: 'NET_BANKING', label: 'Net Banking', icon: Building2 }
]

export default function SubscriptionManagement({ restaurantId }: SubscriptionManagementProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)
  
  const { 
    subscription, 
    isLoading, 
    error, 
    createSubscription, 
    updateSubscription, 
    cancelSubscription 
  } = useSubscription(restaurantId)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'TRIAL': return 'bg-blue-100 text-blue-800'
      case 'EXPIRED': return 'bg-red-100 text-red-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return CheckCircle
      case 'TRIAL': return Clock
      case 'EXPIRED': return AlertTriangle
      case 'CANCELLED': return AlertTriangle
      default: return Clock
    }
  }

  const handleUpgrade = async () => {
    if (!selectedPlan || !selectedPaymentMethod) return

    try {
      if (subscription) {
        await updateSubscription.mutateAsync({
          restaurantId,
          plan: selectedPlan
        })
      } else {
        await createSubscription.mutateAsync({
          restaurantId,
          plan: selectedPlan,
          paymentMethod: selectedPaymentMethod
        })
      }
      setIsUpgradeDialogOpen(false)
      setSelectedPlan('')
      setSelectedPaymentMethod('')
    } catch (error) {
      console.error('Failed to upgrade subscription:', error)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return

    try {
      await cancelSubscription.mutateAsync(restaurantId)
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysRemaining = (endDate: string) => {
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Current Subscription
            </CardTitle>
            <CardDescription>
              Manage your restaurant subscription and billing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Plan</p>
                <Badge className={PLANS[subscription.plan as keyof typeof PLANS].color}>
                  {PLANS[subscription.plan as keyof typeof PLANS].name}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Status</p>
                <Badge className={getStatusColor(subscription.status)}>
                  {(() => {
                    const Icon = getStatusIcon(subscription.status)
                    return <Icon className="h-3 w-3 mr-1 inline" />
                  })()}
                  {subscription.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Next Billing</p>
                <p className="font-medium">
                  {formatDate(subscription.nextBillingAt)}
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Days Remaining</p>
                <p className="font-medium">
                  {getDaysRemaining(subscription.endDate)} days
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Upgrade Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Upgrade Subscription</DialogTitle>
                    <DialogDescription>
                      Choose a new plan and payment method to upgrade your subscription
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Select Plan</label>
                      <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PLANS).map(([key, plan]) => (
                            <SelectItem key={key} value={key}>
                              {plan.name} - ₹{plan.price.toLocaleString('en-IN')}/month
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {!subscription && (
                      <div>
                        <label className="text-sm font-medium">Payment Method</label>
                        <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_METHODS.map((method) => {
                              const Icon = method.icon
                              return (
                                <SelectItem key={method.value} value={method.value}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    {method.label}
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleUpgrade}
                        disabled={!selectedPlan || (!subscription && !selectedPaymentMethod)}
                      >
                        Upgrade Now
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              {subscription.status === 'ACTIVE' && (
                <Button 
                  variant="outline" 
                  onClick={handleCancelSubscription}
                  className="text-red-600 hover:text-red-700"
                >
                  Cancel Subscription
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Plan</CardTitle>
          <CardDescription>
            Select the perfect plan for your restaurant business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(PLANS).map(([key, plan]) => {
              const Icon = plan.icon
              const isCurrentPlan = subscription?.plan === key
              
              return (
                <Card key={key} className={`relative ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
                  {isCurrentPlan && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Current Plan
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-2">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      <span className="text-3xl font-bold">₹{plan.price.toLocaleString('en-IN')}</span>
                      <span className="text-sm">/month</span>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full" 
                      variant={isCurrentPlan ? "outline" : "default"}
                      onClick={() => {
                        setSelectedPlan(key)
                        setIsUpgradeDialogOpen(true)
                      }}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Trial Information */}
      {!subscription && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Start with a 14-day free trial. No credit card required. Upgrade anytime during your trial.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}