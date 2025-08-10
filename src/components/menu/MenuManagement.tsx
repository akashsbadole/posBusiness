'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Download, 
  Mic,
  Volume2,
  Package,
  DollarSign,
  Tag
} from 'lucide-react'
import { toast } from 'sonner'
import VoiceSearch from '@/components/voice/VoiceSearch'
import CSVImport from '@/components/csv/CSVImport'
import CSVExport from '@/components/csv/CSVExport'
import { PermissionGuard, withPermission } from '@/components/auth/PermissionGuard'
import { Module, PermissionAction } from '@prisma/client'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  sku?: string
  stockQuantity: number
  barcode?: string
  isActive: boolean
  businessType: string
}

interface MenuManagementProps {
  businessType?: string
}

export default function MenuManagement({ businessType = 'general' }: MenuManagementProps) {
  return (
    <PermissionGuard 
      permission={{ module: Module.MENU, action: PermissionAction.READ }}
      fallback={
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">You don't have permission to view the menu management.</p>
          </CardContent>
        </Card>
      }
    >
      <MenuManagementContent businessType={businessType} />
    </PermissionGuard>
  )
}

function MenuManagementContent({ businessType = 'general' }: MenuManagementProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false)
  const [isCSVImportOpen, setIsCSVImportOpen] = useState(false)
  const [isCSVExportOpen, setIsCSVExportOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)

  // Mock data for demonstration
  React.useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and basil',
        price: 12.99,
        category: 'Pizza',
        sku: 'PIZZA001',
        stockQuantity: 50,
        barcode: '1234567890123',
        isActive: true,
        businessType: businessType
      },
      {
        id: '2',
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with Caesar dressing and croutons',
        price: 8.99,
        category: 'Salads',
        sku: 'SALAD001',
        stockQuantity: 30,
        barcode: '1234567890124',
        isActive: true,
        businessType: businessType
      },
      {
        id: '3',
        name: 'Coca Cola',
        description: 'Refreshing cola drink',
        price: 2.99,
        category: 'Beverages',
        sku: 'BEV001',
        stockQuantity: 100,
        barcode: '1234567890125',
        isActive: true,
        businessType: businessType
      }
    ]
    setProducts(mockProducts)
  }, [businessType])

  const categories = ['all', ...new Set(products.map(p => p.category))]

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleVoiceResult = (result: any) => {
    if (result.action === 'search' && result.product) {
      setSearchTerm(result.product)
      toast.success(`Searching for: ${result.product}`)
    } else if (result.action === 'add' && result.product) {
      toast.success(`Added to cart: ${result.quantity}x ${result.product}`)
    }
  }

  const handleImportComplete = (result: any) => {
    if (result.success) {
      // Refresh products list
      toast.success('Products imported successfully')
    }
  }

  const handleExportComplete = (success: boolean) => {
    if (success) {
      toast.success('Products exported successfully')
    }
  }

  const getStockStatus = (quantity: number) => {
    if (quantity <= 0) return { color: 'bg-red-500', text: 'Out of Stock' }
    if (quantity <= 10) return { color: 'bg-yellow-500', text: 'Low Stock' }
    return { color: 'bg-green-500', text: 'In Stock' }
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Menu Management</h2>
          <p className="text-gray-600">Manage your products and inventory</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Dialog open={isVoiceSearchOpen} onOpenChange={setIsVoiceSearchOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className={isListening ? 'bg-red-50 border-red-200' : ''}>
                <Mic className="h-4 w-4 mr-2" />
                Voice Search
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Voice Search</DialogTitle>
                <DialogDescription>
                  Use your voice to search for products or add items to cart
                </DialogDescription>
              </DialogHeader>
              <VoiceSearch 
                onResult={handleVoiceResult}
                onListeningChange={setIsListening}
              />
            </DialogContent>
          </Dialog>

          <PermissionGuard permission={{ module: Module.MENU, action: PermissionAction.CREATE }}>
            <Dialog open={isCSVImportOpen} onOpenChange={setIsCSVImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Import Products from CSV</DialogTitle>
                  <DialogDescription>
                    Upload a CSV file to import multiple products at once
                  </DialogDescription>
                </DialogHeader>
                <CSVImport 
                  businessType={businessType}
                  onImportComplete={handleImportComplete}
                />
              </DialogContent>
            </Dialog>
          </PermissionGuard>

          <PermissionGuard permission={{ module: Module.MENU, action: PermissionAction.READ }}>
            <Dialog open={isCSVExportOpen} onOpenChange={setIsCSVExportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Export Products to CSV</DialogTitle>
                  <DialogDescription>
                    Export your products to a CSV file for backup or analysis
                  </DialogDescription>
                </DialogHeader>
                <CSVExport 
                  businessType={businessType}
                  onExportComplete={handleExportComplete}
                />
              </DialogContent>
            </Dialog>
          </PermissionGuard>

          <PermissionGuard permission={{ module: Module.MENU, action: PermissionAction.CREATE }}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'All Categories' : category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => {
          const stockStatus = getStockStatus(product.stockQuantity)
          
          return (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="mt-1">{product.description}</CardDescription>
                  </div>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-lg font-semibold">₹{product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{product.stockQuantity}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={`${stockStatus.color} text-white`}>
                    {stockStatus.text}
                  </Badge>
                  
                  {product.sku && (
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-500">{product.sku}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <PermissionGuard permission={{ module: Module.MENU, action: PermissionAction.UPDATE }}>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard permission={{ module: Module.MENU, action: PermissionAction.DELETE }}>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </PermissionGuard>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first product'
              }
            </p>
            <Button onClick={() => setIsCSVImportOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import Products
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Voice Search Floating Button (Mobile) */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={() => setIsVoiceSearchOpen(true)}
        >
          <Mic className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}