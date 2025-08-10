"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Star,
  Clock,
  Users,
  Scissors,
  Heart,
  Pill,
  Dumbbell,
  Stethoscope,
  Coffee,
  Building,
  Wine,
  Store,
  ShoppingBag,
  Truck,
  Package,
  ChefHat,
  Smartphone,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useMenuItems, useCategories } from '@/hooks'

interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  categoryId: string
  category: {
    id: string
    name: string
  }
  isActive: boolean
  isAvailable: boolean
  imageUrl?: string
  preparationTime?: number
  calories?: number
  allergens?: string[]
  dietaryInfo?: string[]
  customFields?: string
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
  description?: string
  displayOrder: number
  isActive: boolean
}

interface ServiceItem {
  id: string
  name: string
  description?: string
  price: number
  duration: number
  category: string
  isActive: boolean
  staffRequired: string[]
  customFields?: string
}

interface Product {
  id: string
  name: string
  description?: string
  price: number
  sku: string
  barcode?: string
  category: string
  stock: number
  isActive: boolean
  customFields?: string
}

export default function EnhancedMenuManagement() {
  const [activeTab, setActiveTab] = useState('menu')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | ServiceItem | Product | null>(null)
  const [itemType, setItemType] = useState<'menu' | 'service' | 'product'>('menu')
  
  const { data: menuItems = [], refetch: refetchMenu } = useMenuItems()
  const { data: categories = [], refetch: refetchCategories } = useCategories()

  // Mock data for services and products (in real app, these would come from API)
  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: '1',
      name: 'Haircut',
      description: 'Professional haircut and styling',
      price: 500,
      duration: 30,
      category: 'Hair Services',
      isActive: true,
      staffRequired: ['Barber', 'Beautician']
    },
    {
      id: '2',
      name: 'Facial',
      description: 'Rejuvenating facial treatment',
      price: 1200,
      duration: 60,
      category: 'Skin Care',
      isActive: true,
      staffRequired: ['Beautician']
    }
  ])

  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Paracetamol 500mg',
      description: 'Pain relief medication',
      price: 15,
      sku: 'MED001',
      barcode: '1234567890123',
      category: 'Medicines',
      stock: 100,
      isActive: true
    },
    {
      id: '2',
      name: 'Protein Powder',
      description: 'Whey protein supplement',
      price: 2500,
      sku: 'SUP001',
      category: 'Supplements',
      stock: 50,
      isActive: true
    }
  ])

  // Filter items based on search and category
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get business type specific features
  const getBusinessTypeFeatures = () => {
    // This would typically come from the business settings
    return {
      hasMenu: true,
      hasServices: true,
      hasProducts: true,
      hasInventory: true
    }
  }

  const features = getBusinessTypeFeatures()

  // Get icon for item type
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'menu': return ChefHat
      case 'service': return Scissors
      case 'product': return Package
      default: return Package
    }
  }

  // Get status badge
  const getStatusBadge = (isActive: boolean, isAvailable?: boolean) => {
    if (!isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    if (isAvailable === false) {
      return <Badge variant="outline">Unavailable</Badge>
    }
    return <Badge className="bg-green-500">Active</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Menu & Services Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your menu items, services, and products</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              setItemType('menu')
              setIsCreateDialogOpen(true)
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Menu Item
          </Button>
          {features.hasServices && (
            <Button 
              onClick={() => {
                setItemType('service')
                setIsCreateDialogOpen(true)
              }}
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          )}
          {features.hasProducts && (
            <Button 
              onClick={() => {
                setItemType('product')
                setIsCreateDialogOpen(true)
              }}
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menuItems.length}</div>
            <p className="text-xs text-muted-foreground">Active menu items</p>
          </CardContent>
        </Card>

        {features.hasServices && (
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Services</CardTitle>
              <Scissors className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services.length}</div>
              <p className="text-xs text-muted-foreground">Available services</p>
            </CardContent>
          </Card>
        )}

        {features.hasProducts && (
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">Products in stock</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Total categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {features.hasMenu && (
            <TabsTrigger value="menu">Menu Items</TabsTrigger>
          )}
          {features.hasServices && (
            <TabsTrigger value="services">Services</TabsTrigger>
          )}
          {features.hasProducts && (
            <TabsTrigger value="products">Products</TabsTrigger>
          )}
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        {features.hasMenu && (
          <TabsContent value="menu" className="space-y-4">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Menu Items</CardTitle>
                <CardDescription>Manage your food and beverage menu items</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prep Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMenuItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>{item.category.name}</TableCell>
                        <TableCell>₹{item.price.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{getStatusBadge(item.isActive, item.isAvailable)}</TableCell>
                        <TableCell>{item.preparationTime ? `${item.preparationTime} min` : '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(item)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedItem(item)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {features.hasServices && (
          <TabsContent value="services" className="space-y-4">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Services</CardTitle>
                <CardDescription>Manage your service offerings</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Staff Required</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-gray-500">{service.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>{service.category}</TableCell>
                        <TableCell>{service.duration} min</TableCell>
                        <TableCell>₹{service.price.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {service.staffRequired.map((staff, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {staff}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(service.isActive)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(service)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedItem(service)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {features.hasProducts && (
          <TabsContent value="products" className="space-y-4">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>Manage your product inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{product.stock}</span>
                            {product.stock < 10 && (
                              <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>₹{product.price.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{getStatusBadge(product.isActive)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(product)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedItem(product)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="categories" className="space-y-4">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Manage item categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.id} className="border-slate-200 dark:border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{category.name}</h3>
                        {getStatusBadge(category.isActive)}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{category.description}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false)
          setIsEditDialogOpen(false)
          setSelectedItem(null)
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? 'Edit Item' : `Add New ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen ? 'Update item information' : `Create a new ${itemType} for your business`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input id="name" placeholder="Enter name" />
              </div>
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input id="price" type="number" placeholder="0.00" />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Enter description" rows={3} />
            </div>
            {itemType === 'menu' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="prepTime">Preparation Time (minutes)</Label>
                  <Input id="prepTime" type="number" placeholder="15" />
                </div>
              </div>
            )}
            {itemType === 'service' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input id="duration" type="number" placeholder="30" />
                </div>
                <div>
                  <Label htmlFor="serviceCategory">Service Category</Label>
                  <Input id="serviceCategory" placeholder="e.g., Hair Services" />
                </div>
              </div>
            )}
            {itemType === 'product' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" placeholder="e.g., PRD001" />
                </div>
                <div>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input id="stock" type="number" placeholder="0" />
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Switch id="isActive" />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false)
              setIsEditDialogOpen(false)
              setSelectedItem(null)
            }}>
              Cancel
            </Button>
            <Button>
              {isEditDialogOpen ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}