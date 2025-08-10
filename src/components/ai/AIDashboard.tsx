"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain, 
  TrendingUp, 
  Package, 
  Gift, 
  Users, 
  AlertTriangle,
  CheckCircle,
  X,
  RefreshCw,
  Target,
  ShoppingCart,
  Star
} from 'lucide-react'

interface AISuggestion {
  id: string
  type: string
  title: string
  description: string
  confidence: number
  isAccepted: boolean
  isDismissed: boolean
  createdAt: string
  customer?: {
    name: string
  }
}

interface InventoryAlert {
  id: string
  type: string
  severity: string
  message: string
  currentQuantity: number
  threshold: number
  predictedDays?: number
  recommendation?: string
  isResolved: boolean
  inventoryItem: {
    name: string
    unit: string
  }
}

interface SalesForecast {
  id: string
  forecastDate: string
  predictedRevenue: number
  predictedOrders: number
  confidence: number
  factors?: string
}

interface CustomerInsight {
  id: string
  loyaltyScore: number
  churnRisk: number
  totalOrders: number
  totalSpent: number
  avgOrderValue: number
  customer: {
    name: string
    loyaltyPoints: number
  }
}

interface AIDashboardProps {
  restaurantId: string
}

export default function AIDashboard({ restaurantId }: AIDashboardProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [forecasts, setForecasts] = useState<SalesForecast[]>([])
  const [insights, setInsights] = useState<CustomerInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadAIData()
  }, [restaurantId])

  const loadAIData = async () => {
    try {
      setLoading(true)
      
      // Load data in parallel
      const [suggestionsRes, alertsRes, forecastsRes, insightsRes] = await Promise.all([
        fetch(`/api/ai/suggestions?restaurantId=${restaurantId}`),
        fetch(`/api/ai/inventory-alerts?restaurantId=${restaurantId}`),
        fetch(`/api/ai/forecasting?restaurantId=${restaurantId}&days=7`),
        fetch(`/api/ai/loyalty?restaurantId=${restaurantId}`)
      ])

      const [suggestionsData, alertsData, forecastsData, insightsData] = await Promise.all([
        suggestionsRes.json(),
        alertsRes.json(),
        forecastsRes.json(),
        insightsRes.json()
      ])

      setSuggestions(suggestionsData || [])
      setAlerts(alertsData || [])
      setForecasts(forecastsData || [])
      setInsights(insightsData || [])
    } catch (error) {
      console.error('Error loading AI data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionAction = async (suggestionId: string, action: 'accept' | 'dismiss') => {
    try {
      const response = await fetch('/api/ai/suggestions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: suggestionId,
          isAccepted: action === 'accept',
          isDismissed: action === 'dismiss'
        })
      })

      if (response.ok) {
        setSuggestions(prev => prev.map(s => 
          s.id === suggestionId 
            ? { ...s, isAccepted: action === 'accept', isDismissed: action === 'dismiss' }
            : s
        ))
      }
    } catch (error) {
      console.error('Error updating suggestion:', error)
    }
  }

  const handleAlertResolve = async (alertId: string) => {
    try {
      const response = await fetch('/api/ai/inventory-alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId, isResolved: true })
      })

      if (response.ok) {
        setAlerts(prev => prev.map(a => 
          a.id === alertId ? { ...a, isResolved: true } : a
        ))
      }
    } catch (error) {
      console.error('Error resolving alert:', error)
    }
  }

  const generateProductSuggestions = async () => {
    try {
      const response = await fetch('/api/ai/product-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId })
      })

      if (response.ok) {
        await loadAIData()
      }
    } catch (error) {
      console.error('Error generating product suggestions:', error)
    }
  }

  const generateDiscounts = async () => {
    try {
      const response = await fetch('/api/ai/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId })
      })

      if (response.ok) {
        await loadAIData()
      }
    } catch (error) {
      console.error('Error generating discounts:', error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500'
      case 'HIGH': return 'bg-orange-500'
      case 'MEDIUM': return 'bg-yellow-500'
      case 'LOW': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getLoyaltyColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading AI insights...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI Insights & Recommendations</h2>
          <p className="text-gray-600">Powered by intelligent analysis of your business data</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generateProductSuggestions} variant="outline">
            <Target className="mr-2 h-4 w-4" />
            Generate Suggestions
          </Button>
          <Button onClick={generateDiscounts} variant="outline">
            <Gift className="mr-2 h-4 w-4" />
            Generate Discounts
          </Button>
          <Button onClick={loadAIData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Suggestions</p>
                <p className="text-2xl font-bold">
                  {suggestions.filter(s => !s.isAccepted && !s.isDismissed).length}
                </p>
              </div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Alerts</p>
                <p className="text-2xl font-bold">
                  {alerts.filter(a => !a.isResolved).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">7-Day Forecast</p>
                <p className="text-2xl font-bold">
                  ₹{forecasts.reduce((sum, f) => sum + f.predictedRevenue, 0).toLocaleString('en-IN')}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High-Loyalty Customers</p>
                <p className="text-2xl font-bold">
                  {insights.filter(i => i.loyaltyScore >= 80).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent AI Suggestions</CardTitle>
                <CardDescription>Latest recommendations for your business</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suggestions.slice(0, 5).map((suggestion) => (
                    <div key={suggestion.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{suggestion.title}</h4>
                        <div className="flex gap-2">
                          {!suggestion.isAccepted && !suggestion.isDismissed && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleSuggestionAction(suggestion.id, 'accept')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSuggestionAction(suggestion.id, 'dismiss')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">{suggestion.type}</Badge>
                        <span className={`text-sm ${getConfidenceColor(suggestion.confidence)}`}>
                          {Math.round(suggestion.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                  ))}
                  {suggestions.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No suggestions available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sales Forecast */}
            <Card>
              <CardHeader>
                <CardTitle>7-Day Sales Forecast</CardTitle>
                <CardDescription>AI-powered sales predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forecasts.map((forecast) => (
                    <div key={forecast.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">
                          {new Date(forecast.forecastDate).toLocaleDateString()}
                        </h4>
                        <span className={`text-sm ${getConfidenceColor(forecast.confidence)}`}>
                          {Math.round(forecast.confidence * 100)}% confidence
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Revenue:</span>
                          <span className="ml-2 font-medium">₹{forecast.predictedRevenue.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Orders:</span>
                          <span className="ml-2 font-medium">{forecast.predictedOrders}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {forecasts.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No forecast data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All AI Suggestions</CardTitle>
              <CardDescription>Comprehensive list of AI-powered recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{suggestion.title}</h4>
                        {suggestion.customer && (
                          <p className="text-sm text-gray-600">For: {suggestion.customer.name}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!suggestion.isAccepted && !suggestion.isDismissed && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSuggestionAction(suggestion.id, 'accept')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSuggestionAction(suggestion.id, 'dismiss')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {suggestion.isAccepted && (
                          <Badge className="bg-green-500">Accepted</Badge>
                        )}
                        {suggestion.isDismissed && (
                          <Badge variant="outline">Dismissed</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">{suggestion.type}</Badge>
                      <span className={`text-sm ${getConfidenceColor(suggestion.confidence)}`}>
                        {Math.round(suggestion.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                ))}
                {suggestions.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No suggestions available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Alerts</CardTitle>
              <CardDescription>AI-powered inventory management alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Alert key={alert.id} className={`${alert.isResolved ? 'opacity-50' : ''}`}>
                    <AlertTriangle className={`h-4 w-4 ${getSeverityColor(alert.severity).replace('bg-', 'text-')}`} />
                    <AlertDescription>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{alert.message}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {alert.inventoryItem.name}: {alert.currentQuantity} {alert.inventoryItem.unit} 
                            (threshold: {alert.threshold} {alert.inventoryItem.unit})
                          </p>
                          {alert.recommendation && (
                            <p className="text-sm text-blue-600 mt-1">
                              <strong>Recommendation:</strong> {alert.recommendation}
                            </p>
                          )}
                          {alert.predictedDays && (
                            <p className="text-sm text-orange-600 mt-1">
                              <strong>Predicted stockout in:</strong> {alert.predictedDays} days
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          {!alert.isResolved && (
                            <Button
                              size="sm"
                              onClick={() => handleAlertResolve(alert.id)}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
                {alerts.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No inventory alerts</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Loyalty Insights</CardTitle>
              <CardDescription>AI-powered customer analysis and loyalty tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium">{insight.customer.name}</h4>
                        <p className="text-sm text-gray-600">
                          {insight.totalOrders} orders • ₹{insight.totalSpent.toLocaleString('en-IN')} spent
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getLoyaltyColor(insight.loyaltyScore)}`}>
                          {Math.round(insight.loyaltyScore)}/100
                        </div>
                        <div className="text-sm text-gray-600">Loyalty Score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Avg Order:</span>
                        <div className="font-medium">₹{insight.avgOrderValue.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Points:</span>
                        <div className="font-medium">{insight.customer.loyaltyPoints}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Churn Risk:</span>
                        <div className={`font-medium ${insight.churnRisk > 0.7 ? 'text-red-600' : 'text-green-600'}`}>
                          {(insight.churnRisk * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Frequency:</span>
                        <div className="font-medium">{insight.visitFrequency.toFixed(2)}/day</div>
                      </div>
                    </div>

                    {insight.churnRisk > 0.7 && (
                      <Alert className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          High churn risk detected. Consider sending a personalized retention offer.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
                {insights.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No customer insights available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}