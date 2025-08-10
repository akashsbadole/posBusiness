"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Download,
  Upload,
  BarChart3,
  Settings,
  Clock,
  ChefHat,
  Scale,
  Factory,
  Activity,
  Target,
  Zap
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

interface Ingredient {
  id: string
  name: string
  sku: string
  barcode: string
  category: string
  currentStock: number
  unit: string
  costPrice: number
  location: string
  minStockLevel: number
}

interface Product {
  id: string
  name: string
  sku: string
  category: string
  sellingPrice: number
  productionTime: number // in minutes
  status: 'ACTIVE' | 'INACTIVE'
}

interface Recipe {
  id: string
  productId: string
  productName: string
  ingredients: {
    ingredientId: string
    ingredientName: string
    quantity: number
    unit: string
  }[]
  instructions: string[]
  yieldQuantity: number
  yieldUnit: string
  preparationTime: number
  cookingTime: number
  status: 'ACTIVE' | 'INACTIVE'
  lastUpdated: string
}

interface ProductionBatch {
  id: string
  recipeId: string
  recipeName: string
  batchNumber: string
  plannedQuantity: number
  actualQuantity: number
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  startTime: string
  endTime: string | null
  assignedTo: string
  notes: string
  ingredientsUsed: {
    ingredientId: string
    ingredientName: string
    plannedQuantity: number
    actualQuantity: number
    unit: string
  }[]
  qualityChecks: {
    checkName: string
    status: 'PENDING' | 'PASSED' | 'FAILED'
    notes: string
    checkedBy: string
    checkedAt: string
  }[]
  cost: number
  revenue: number
  profit: number
}

interface ProductionSummary {
  activeBatches: number
  completedToday: number
  totalProduced: number
  efficiency: number
  lowStockIngredients: number
}

export default function ProductionTracking() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [batches, setBatches] = useState<ProductionBatch[]>([])
  const [summary, setSummary] = useState<ProductionSummary>({
    activeBatches: 0,
    completedToday: 0,
    totalProduced: 0,
    efficiency: 0,
    lowStockIngredients: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateBatchDialogOpen, setIsCreateBatchDialogOpen] = useState(false)
  const [isCreateRecipeDialogOpen, setIsCreateRecipeDialogOpen] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Form states
  const [batchForm, setBatchForm] = useState({
    recipeId: '',
    plannedQuantity: '',
    assignedTo: '',
    notes: ''
  })

  const [recipeForm, setRecipeForm] = useState({
    productId: '',
    yieldQuantity: '',
    yieldUnit: '',
    preparationTime: '',
    cookingTime: '',
    instructions: '',
    ingredients: [] as { ingredientId: string; quantity: number }[]
  })

  // Mock data for demonstration
  useEffect(() => {
    const mockIngredients: Ingredient[] = [
      {
        id: '1',
        name: 'Rice Flour',
        sku: 'RF001',
        barcode: '8901234567890',
        category: 'Flours',
        currentStock: 50,
        unit: 'kg',
        costPrice: 60,
        location: 'Pantry',
        minStockLevel: 10
      },
      {
        id: '2',
        name: 'Urad Dal',
        sku: 'UD001',
        barcode: '8901234567891',
        category: 'Pulses',
        currentStock: 25,
        unit: 'kg',
        costPrice: 120,
        location: 'Pantry',
        minStockLevel: 5
      },
      {
        id: '3',
        name: 'Salt',
        sku: 'SALT001',
        barcode: '8901234567892',
        category: 'Spices',
        currentStock: 8,
        unit: 'kg',
        costPrice: 20,
        location: 'Pantry',
        minStockLevel: 2
      },
      {
        id: '4',
        name: 'Oil',
        sku: 'OIL001',
        barcode: '8901234567893',
        category: 'Oils',
        currentStock: 15,
        unit: 'L',
        costPrice: 150,
        location: 'Pantry',
        minStockLevel: 3
      }
    ]

    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Idli Batter',
        sku: 'IDLI001',
        category: 'Batters',
        sellingPrice: 80,
        productionTime: 480, // 8 hours
        status: 'ACTIVE'
      },
      {
        id: '2',
        name: 'Dosa Batter',
        sku: 'DOSA001',
        category: 'Batters',
        sellingPrice: 90,
        productionTime: 360, // 6 hours
        status: 'ACTIVE'
      }
    ]

    const mockRecipes: Recipe[] = [
      {
        id: '1',
        productId: '1',
        productName: 'Idli Batter',
        ingredients: [
          { ingredientId: '1', ingredientName: 'Rice Flour', quantity: 3, unit: 'kg' },
          { ingredientId: '2', ingredientName: 'Urad Dal', quantity: 1, unit: 'kg' },
          { ingredientId: '3', ingredientName: 'Salt', quantity: 0.1, unit: 'kg' }
        ],
        instructions: [
          'Soak rice and urad dal separately for 4-6 hours',
          'Grind to smooth paste',
          'Mix together and add salt',
          'Ferment for 8-12 hours',
          'Batter is ready for use'
        ],
        yieldQuantity: 5,
        yieldUnit: 'kg',
        preparationTime: 60,
        cookingTime: 0,
        status: 'ACTIVE',
        lastUpdated: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        productId: '2',
        productName: 'Dosa Batter',
        ingredients: [
          { ingredientId: '1', ingredientName: 'Rice Flour', quantity: 4, unit: 'kg' },
          { ingredientId: '2', ingredientName: 'Urad Dal', quantity: 1, unit: 'kg' },
          { ingredientId: '3', ingredientName: 'Salt', quantity: 0.15, unit: 'kg' }
        ],
        instructions: [
          'Soak rice and urad dal separately for 4-6 hours',
          'Grind to smooth paste',
          'Mix together and add salt',
          'Ferment for 6-8 hours',
          'Batter is ready for use'
        ],
        yieldQuantity: 6,
        yieldUnit: 'kg',
        preparationTime: 60,
        cookingTime: 0,
        status: 'ACTIVE',
        lastUpdated: '2024-01-15T11:00:00Z'
      }
    ]

    const mockBatches: ProductionBatch[] = [
      {
        id: '1',
        recipeId: '1',
        recipeName: 'Idli Batter',
        batchNumber: 'IB-2024-001',
        plannedQuantity: 10,
        actualQuantity: 9.8,
        status: 'COMPLETED',
        startTime: '2024-01-15T06:00:00Z',
        endTime: '2024-01-15T14:00:00Z',
        assignedTo: 'Chef Kumar',
        notes: 'Good fermentation, quality excellent',
        ingredientsUsed: [
          { ingredientId: '1', ingredientName: 'Rice Flour', plannedQuantity: 6, actualQuantity: 5.9, unit: 'kg' },
          { ingredientId: '2', ingredientName: 'Urad Dal', plannedQuantity: 2, actualQuantity: 1.95, unit: 'kg' },
          { ingredientId: '3', ingredientName: 'Salt', plannedQuantity: 0.2, actualQuantity: 0.2, unit: 'kg' }
        ],
        qualityChecks: [
          { checkName: 'Consistency', status: 'PASSED', notes: 'Perfect consistency', checkedBy: 'Quality Team', checkedAt: '2024-01-15T14:30:00Z' },
          { checkName: 'Taste', status: 'PASSED', notes: 'Excellent taste', checkedBy: 'Chef Kumar', checkedAt: '2024-01-15T14:30:00Z' }
        ],
        cost: 660,
        revenue: 784,
        profit: 124
      },
      {
        id: '2',
        recipeId: '2',
        recipeName: 'Dosa Batter',
        batchNumber: 'DB-2024-001',
        plannedQuantity: 12,
        actualQuantity: 0,
        status: 'IN_PROGRESS',
        startTime: '2024-01-15T08:00:00Z',
        endTime: null,
        assignedTo: 'Chef Sharma',
        notes: 'In fermentation stage',
        ingredientsUsed: [
          { ingredientId: '1', ingredientName: 'Rice Flour', plannedQuantity: 8, actualQuantity: 8, unit: 'kg' },
          { ingredientId: '2', ingredientName: 'Urad Dal', plannedQuantity: 2, actualQuantity: 2, unit: 'kg' },
          { ingredientId: '3', ingredientName: 'Salt', plannedQuantity: 0.3, actualQuantity: 0.3, unit: 'kg' }
        ],
        qualityChecks: [
          { checkName: 'Ingredients Check', status: 'PASSED', notes: 'All ingredients fresh', checkedBy: 'Chef Sharma', checkedAt: '2024-01-15T08:30:00Z' }
        ],
        cost: 840,
        revenue: 0,
        profit: -840
      }
    ]

    const today = new Date().toDateString()
    const completedToday = mockBatches.filter(b => 
      b.status === 'COMPLETED' && 
      new Date(b.endTime!).toDateString() === today
    ).length

    const mockSummary: ProductionSummary = {
      activeBatches: mockBatches.filter(b => b.status === 'IN_PROGRESS').length,
      completedToday,
      totalProduced: mockBatches.filter(b => b.status === 'COMPLETED').reduce((sum, b) => sum + b.actualQuantity, 0),
      efficiency: mockBatches.filter(b => b.status === 'COMPLETED').length > 0 
        ? mockBatches.filter(b => b.status === 'COMPLETED').reduce((sum, b) => sum + (b.actualQuantity / b.plannedQuantity), 0) / mockBatches.filter(b => b.status === 'COMPLETED').length * 100
        : 0,
      lowStockIngredients: mockIngredients.filter(i => i.currentStock <= i.minStockLevel).length
    }

    setIngredients(mockIngredients)
    setProducts(mockProducts)
    setRecipes(mockRecipes)
    setBatches(mockBatches)
    setSummary(mockSummary)
    setIsLoading(false)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED': return 'bg-gray-500'
      case 'IN_PROGRESS': return 'bg-yellow-500'
      case 'COMPLETED': return 'bg-green-500'
      case 'CANCELLED': return 'bg-red-500'
      case 'ACTIVE': return 'bg-green-500'
      case 'INACTIVE': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getQualityCheckColor = (status: string) => {
    switch (status) {
      case 'PASSED': return 'text-green-600'
      case 'FAILED': return 'text-red-600'
      case 'PENDING': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const handleCreateBatch = async () => {
    try {
      const recipe = recipes.find(r => r.id === batchForm.recipeId)
      if (!recipe) return

      const plannedQuantity = parseFloat(batchForm.plannedQuantity)
      
      // Calculate ingredients needed
      const ingredientsNeeded = recipe.ingredients.map(ing => ({
        ingredientId: ing.ingredientId,
        ingredientName: ing.ingredientName,
        plannedQuantity: (ing.quantity / recipe.yieldQuantity) * plannedQuantity,
        actualQuantity: 0,
        unit: ing.unit
      }))

      // Calculate cost
      const totalCost = ingredientsNeeded.reduce((sum, ing) => {
        const ingredient = ingredients.find(i => i.id === ing.ingredientId)
        return sum + (ing.plannedQuantity * (ingredient?.costPrice || 0))
      }, 0)

      const newBatch: ProductionBatch = {
        id: Date.now().toString(),
        recipeId: recipe.id,
        recipeName: recipe.productName,
        batchNumber: `${recipe.productName.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${String(batches.length + 1).padStart(3, '0')}`,
        plannedQuantity,
        actualQuantity: 0,
        status: 'PLANNED',
        startTime: new Date().toISOString(),
        endTime: null,
        assignedTo: batchForm.assignedTo,
        notes: batchForm.notes,
        ingredientsUsed: ingredientsNeeded,
        qualityChecks: [],
        cost: totalCost,
        revenue: 0,
        profit: -totalCost
      }

      setBatches([newBatch, ...batches])
      setIsCreateBatchDialogOpen(false)
      resetBatchForm()
      
      // Update summary
      setSummary(prev => ({
        ...prev,
        activeBatches: prev.activeBatches + 1
      }))
    } catch (error) {
      console.error('Error creating batch:', error)
    }
  }

  const handleStartBatch = async (batchId: string) => {
    try {
      setBatches(batches.map(batch => 
        batch.id === batchId 
          ? { ...batch, status: 'IN_PROGRESS' as const, startTime: new Date().toISOString() }
          : batch
      ))
    } catch (error) {
      console.error('Error starting batch:', error)
    }
  }

  const handleCompleteBatch = async (batchId: string) => {
    try {
      const batch = batches.find(b => b.id === batchId)
      if (!batch) return

      const actualQuantity = batch.plannedQuantity * 0.98 // 98% efficiency
      const revenue = actualQuantity * (products.find(p => p.name === batch.recipeName)?.sellingPrice || 0)
      const profit = revenue - batch.cost

      setBatches(batches.map(b => 
        b.id === batchId 
          ? { 
              ...b, 
              status: 'COMPLETED' as const, 
              actualQuantity,
              endTime: new Date().toISOString(),
              revenue,
              profit
            }
          : b
      ))
      
      // Update ingredient stock
      const updatedIngredients = ingredients.map(ingredient => {
        const usedIngredient = batch.ingredientsUsed.find(i => i.ingredientId === ingredient.id)
        if (usedIngredient) {
          return {
            ...ingredient,
            currentStock: ingredient.currentStock - usedIngredient.plannedQuantity
          }
        }
        return ingredient
      })
      setIngredients(updatedIngredients)
    } catch (error) {
      console.error('Error completing batch:', error)
    }
  }

  const resetBatchForm = () => {
    setBatchForm({
      recipeId: '',
      plannedQuantity: '',
      assignedTo: '',
      notes: ''
    })
  }

  const resetRecipeForm = () => {
    setRecipeForm({
      productId: '',
      yieldQuantity: '',
      yieldUnit: '',
      preparationTime: '',
      cookingTime: '',
      instructions: '',
      ingredients: []
    })
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatDateTime = (dateString: string) => {
    return format(parseISO(dateString), 'MMM dd, yyyy HH:mm')
  }

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.recipeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || batch.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const statuses = ['all', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Tracking</h1>
          <p className="text-gray-600">Manage production batches and recipes</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateBatchDialogOpen} onOpenChange={setIsCreateBatchDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                New Batch
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Production Batch</DialogTitle>
                <DialogDescription>
                  Start a new production batch
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="recipe">Recipe</Label>
                  <Select value={batchForm.recipeId} onValueChange={(value) => setBatchForm({...batchForm, recipeId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipes.map((recipe) => (
                        <SelectItem key={recipe.id} value={recipe.id}>
                          {recipe.productName} (Yield: {recipe.yieldQuantity} {recipe.yieldUnit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="plannedQuantity">Planned Quantity</Label>
                  <Input
                    id="plannedQuantity"
                    type="number"
                    placeholder="0"
                    value={batchForm.plannedQuantity}
                    onChange={(e) => setBatchForm({...batchForm, plannedQuantity: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    placeholder="Staff name"
                    value={batchForm.assignedTo}
                    onChange={(e) => setBatchForm({...batchForm, assignedTo: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes..."
                    value={batchForm.notes}
                    onChange={(e) => setBatchForm({...batchForm, notes: e.target.value})}
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateBatch} className="flex-1">
                    Create Batch
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateBatchDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateRecipeDialogOpen} onOpenChange={setIsCreateRecipeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Manage Recipes
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Production Recipes</DialogTitle>
                <DialogDescription>
                  Manage production recipes and ingredients
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="max-h-96 overflow-y-auto">
                  {recipes.map((recipe) => (
                    <Card key={recipe.id} className="mb-4">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{recipe.productName}</h4>
                            <p className="text-sm text-gray-600">
                              Yield: {recipe.yieldQuantity} {recipe.yieldUnit} | 
                              Prep: {recipe.preparationTime}min | 
                              Cook: {recipe.cookingTime}min
                            </p>
                            <div className="mt-2">
                              <p className="text-sm font-medium">Ingredients:</p>
                              <ul className="text-sm text-gray-600">
                                {recipe.ingredients.map((ing, index) => (
                                  <li key={index}>
                                    {ing.ingredientName}: {ing.quantity} {ing.unit}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(recipe.status)} text-white`}>
                            {recipe.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateRecipeDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Batches</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.activeBatches}</p>
              </div>
              <Activity className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-green-600">{summary.completedToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Produced</p>
                <p className="text-2xl font-bold text-blue-600">{summary.totalProduced.toFixed(1)} kg</p>
              </div>
              <Scale className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency</p>
                <p className="text-2xl font-bold text-purple-600">{summary.efficiency.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="batches">Production Batches</TabsTrigger>
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Production Batches</CardTitle>
                <CardDescription>Currently in-progress batches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {batches.filter(b => b.status === 'IN_PROGRESS').map((batch) => (
                    <div key={batch.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div>
                        <p className="font-medium text-yellow-900">{batch.recipeName}</p>
                        <p className="text-sm text-yellow-700">Batch: {batch.batchNumber}</p>
                        <p className="text-xs text-yellow-600">
                          Started: {formatDateTime(batch.startTime)}
                        </p>
                        <p className="text-xs text-yellow-600">
                          Assigned to: {batch.assignedTo}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getStatusColor(batch.status)} text-white`}>
                            {batch.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-yellow-700">
                          {batch.plannedQuantity} {recipes.find(r => r.id === batch.recipeId)?.yieldUnit}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => handleCompleteBatch(batch.id)}
                          className="mt-2 bg-green-600 hover:bg-green-700"
                        >
                          Complete
                        </Button>
                      </div>
                    </div>
                  ))}
                  {batches.filter(b => b.status === 'IN_PROGRESS').length === 0 && (
                    <div className="text-center py-8">
                      <Factory className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No active batches</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>Ingredients that need restocking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ingredients.filter(i => i.currentStock <= i.minStockLevel).map((ingredient) => (
                    <div key={ingredient.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div>
                        <p className="font-medium text-red-900">{ingredient.name}</p>
                        <p className="text-sm text-red-700">
                          Current: {ingredient.currentStock} {ingredient.unit} | 
                          Minimum: {ingredient.minStockLevel} {ingredient.unit}
                        </p>
                        <p className="text-sm text-red-600">
                          Need to order: {ingredient.minStockLevel - ingredient.currentStock} {ingredient.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-900">
                          {formatCurrency((ingredient.minStockLevel - ingredient.currentStock) * ingredient.costPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {ingredients.filter(i => i.currentStock <= i.minStockLevel).length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-gray-500">All ingredients well stocked</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="batches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Production Batches</CardTitle>
              <CardDescription>Manage all production batches</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search batches..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === 'all' ? 'All Status' : status.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch #</TableHead>
                      <TableHead>Recipe</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Planned vs Actual</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Profit/Loss</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBatches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-medium">{batch.batchNumber}</TableCell>
                        <TableCell>{batch.recipeName}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(batch.status)} text-white`}>
                            {batch.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>Planned: {batch.plannedQuantity} {recipes.find(r => r.id === batch.recipeId)?.yieldUnit}</div>
                            <div className="text-sm text-gray-500">
                              Actual: {batch.actualQuantity || '-'} {recipes.find(r => r.id === batch.recipeId)?.yieldUnit}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{batch.assignedTo}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${batch.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {batch.profit >= 0 ? '+' : ''}{formatCurrency(batch.profit)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {batch.status === 'PLANNED' && (
                              <Button
                                size="sm"
                                onClick={() => handleStartBatch(batch.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Zap className="h-3 w-3" />
                              </Button>
                            )}
                            {batch.status === 'IN_PROGRESS' && (
                              <Button
                                size="sm"
                                onClick={() => handleCompleteBatch(batch.id)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedBatch(batch)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Production Recipes</CardTitle>
              <CardDescription>Manage recipes for production</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recipes.map((recipe) => (
                  <Card key={recipe.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{recipe.productName}</h3>
                          <p className="text-sm text-gray-600">
                            Yield: {recipe.yieldQuantity} {recipe.yieldUnit}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(recipe.status)} text-white`}>
                          {recipe.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm">Ingredients:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {recipe.ingredients.map((ing, index) => (
                              <li key={index} className="flex justify-between">
                                <span>{ing.ingredientName}</span>
                                <span>{ing.quantity} {ing.unit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm">Time Requirements:</h4>
                          <p className="text-sm text-gray-600">
                            Preparation: {recipe.preparationTime} minutes
                            {recipe.cookingTime > 0 && ` | Cooking: ${recipe.cookingTime} minutes`}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm">Instructions:</h4>
                          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                            {recipe.instructions.slice(0, 3).map((instruction, index) => (
                              <li key={index}>{instruction}</li>
                            ))}
                            {recipe.instructions.length > 3 && (
                              <li className="text-gray-400">+{recipe.instructions.length - 3} more steps...</li>
                            )}
                          </ol>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRecipe(recipe)}
                          className="w-full"
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ingredients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Production Ingredients</CardTitle>
              <CardDescription>Manage ingredients for production</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Min Level</TableHead>
                      <TableHead>Cost Price</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ingredients.map((ingredient) => (
                      <TableRow key={ingredient.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{ingredient.name}</div>
                            <div className="text-sm text-gray-500">SKU: {ingredient.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell>{ingredient.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{ingredient.currentStock}</span>
                            <span className="text-gray-500">{ingredient.unit}</span>
                            {ingredient.currentStock <= ingredient.minStockLevel && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{ingredient.minStockLevel} {ingredient.unit}</TableCell>
                        <TableCell>{formatCurrency(ingredient.costPrice)}</TableCell>
                        <TableCell>{ingredient.location}</TableCell>
                        <TableCell>
                          <Badge className={
                            ingredient.currentStock <= ingredient.minStockLevel 
                              ? 'bg-red-500 text-white' 
                              : 'bg-green-500 text-white'
                          }>
                            {ingredient.currentStock <= ingredient.minStockLevel ? 'Low Stock' : 'In Stock'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Batch Details Dialog */}
      {selectedBatch && (
        <Dialog open={!!selectedBatch} onOpenChange={() => setSelectedBatch(null)}>
          <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Batch Details - {selectedBatch.batchNumber}</DialogTitle>
              <DialogDescription>
                {selectedBatch.recipeName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Batch Information */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={`${getStatusColor(selectedBatch.status)} text-white`}>
                    {selectedBatch.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Started</Label>
                  <p className="font-semibold">{formatDateTime(selectedBatch.startTime)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Assigned To</Label>
                  <p className="font-semibold">{selectedBatch.assignedTo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Profit/Loss</Label>
                  <p className={`font-semibold ${selectedBatch.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedBatch.profit >= 0 ? '+' : ''}{formatCurrency(selectedBatch.profit)}
                  </p>
                </div>
              </div>

              {/* Production Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedBatch.plannedQuantity}</p>
                  <p className="text-sm text-gray-600">Planned</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedBatch.actualQuantity}</p>
                  <p className="text-sm text-gray-600">Actual</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedBatch.actualQuantity > 0 ? ((selectedBatch.actualQuantity / selectedBatch.plannedQuantity) * 100).toFixed(1) : 0}%
                  </p>
                  <p className="text-sm text-gray-600">Efficiency</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(selectedBatch.cost)}</p>
                  <p className="text-sm text-gray-600">Cost</p>
                </div>
              </div>

              {/* Ingredients Used */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Ingredients Used</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingredient</TableHead>
                        <TableHead>Planned</TableHead>
                        <TableHead>Actual</TableHead>
                        <TableHead>Variance</TableHead>
                        <TableHead>Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedBatch.ingredientsUsed.map((ingredient, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{ingredient.ingredientName}</TableCell>
                          <TableCell>{ingredient.plannedQuantity} {ingredient.unit}</TableCell>
                          <TableCell>{ingredient.actualQuantity} {ingredient.unit}</TableCell>
                          <TableCell>
                            <span className={`font-medium ${
                              ingredient.actualQuantity > ingredient.plannedQuantity 
                                ? 'text-red-600' 
                                : ingredient.actualQuantity < ingredient.plannedQuantity 
                                ? 'text-green-600' 
                                : 'text-gray-600'
                            }`}>
                              {ingredient.actualQuantity - ingredient.plannedQuantity > 0 ? '+' : ''}
                              {ingredient.actualQuantity - ingredient.plannedQuantity} {ingredient.unit}
                            </span>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(ingredient.actualQuantity * (ingredients.find(i => i.id === ingredient.ingredientId)?.costPrice || 0))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Quality Checks */}
              {selectedBatch.qualityChecks.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-4">Quality Checks</h4>
                  <div className="space-y-3">
                    {selectedBatch.qualityChecks.map((check, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{check.checkName}</p>
                          <p className="text-sm text-gray-600">{check.notes}</p>
                          <p className="text-xs text-gray-500">
                            Checked by {check.checkedBy} at {formatDateTime(check.checkedAt)}
                          </p>
                        </div>
                        <Badge className={`${getQualityCheckColor(check.status)} bg-white border`}>
                          {check.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedBatch.notes && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">Notes</h4>
                  <p className="text-gray-600">{selectedBatch.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedBatch(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Recipe Details Dialog */}
      {selectedRecipe && (
        <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Recipe Details - {selectedRecipe.productName}</DialogTitle>
              <DialogDescription>
                Complete recipe information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Recipe Information */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Yield</Label>
                  <p className="font-semibold">{selectedRecipe.yieldQuantity} {selectedRecipe.yieldUnit}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Preparation Time</Label>
                  <p className="font-semibold">{selectedRecipe.preparationTime} minutes</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Cooking Time</Label>
                  <p className="font-semibold">{selectedRecipe.cookingTime} minutes</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={`${getStatusColor(selectedRecipe.status)} text-white`}>
                    {selectedRecipe.status}
                  </Badge>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Ingredients</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingredient</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedRecipe.ingredients.map((ingredient, index) => {
                        const ingredientData = ingredients.find(i => i.id === ingredient.ingredientId)
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{ingredient.ingredientName}</TableCell>
                            <TableCell>{ingredient.quantity}</TableCell>
                            <TableCell>{ingredient.unit}</TableCell>
                            <TableCell>
                              {formatCurrency(ingredient.quantity * (ingredientData?.costPrice || 0))}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Instructions</h4>
                <ol className="space-y-2">
                  {selectedRecipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedRecipe(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}