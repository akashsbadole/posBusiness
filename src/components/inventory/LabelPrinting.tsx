'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Printer, 
  Tag, 
  Package, 
  Barcode, 
  QrCode, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Download,
  Eye,
  Copy,
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'

interface LabelTemplate {
  id: string
  name: string
  type: 'barcode' | 'qr' | 'price' | 'product'
  width: number
  height: number
  orientation: 'portrait' | 'landscape'
  fields: LabelField[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface LabelField {
  id: string
  type: 'text' | 'barcode' | 'qr' | 'image' | 'price'
  name: string
  value: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  fontSize?: number
  fontWeight?: 'normal' | 'bold'
  alignment?: 'left' | 'center' | 'right'
}

interface Product {
  id: string
  name: string
  sku: string
  barcode: string
  price: number
  category: string
  stock: number
  description?: string
  brand?: string
  weight?: string
  dimensions?: string
}

interface PrintJob {
  id: string
  templateId: string
  templateName: string
  products: Product[]
  quantity: number
  copies: number
  status: 'pending' | 'printing' | 'completed' | 'failed'
  createdAt: Date
  completedAt?: Date
  totalLabels: number
}

interface PrinterSettings {
  id: string
  name: string
  type: 'thermal' | 'laser' | 'inkjet'
  connection: 'usb' | 'network' | 'bluetooth'
  ipAddress?: string
  paperSize: string
  dpi: number
  isActive: boolean
}

export default function LabelPrinting() {
  const [activeTab, setActiveTab] = useState('templates')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)
  const [copies, setCopies] = useState(1)
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [templates, setTemplates] = useState<LabelTemplate[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([])
  const [printers, setPrinters] = useState<PrinterSettings[]>([])
  const [selectedPrinter, setSelectedPrinter] = useState('')
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'barcode' as const,
    width: 50,
    height: 25,
    orientation: 'portrait' as const
  })

  // Initialize mock data
  useEffect(() => {
    const mockTemplates: LabelTemplate[] = [
      {
        id: '1',
        name: 'Standard Barcode Label',
        type: 'barcode',
        width: 50,
        height: 25,
        orientation: 'portrait',
        isActive: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        fields: [
          {
            id: '1',
            type: 'barcode',
            name: 'Product Barcode',
            value: '{barcode}',
            position: { x: 5, y: 5 },
            size: { width: 40, height: 15 }
          },
          {
            id: '2',
            type: 'text',
            name: 'Product Name',
            value: '{name}',
            position: { x: 5, y: 20 },
            size: { width: 40, height: 5 },
            fontSize: 8,
            alignment: 'center'
          }
        ]
      },
      {
        id: '2',
        name: 'Price Tag Label',
        type: 'price',
        width: 60,
        height: 40,
        orientation: 'portrait',
        isActive: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        fields: [
          {
            id: '1',
            type: 'text',
            name: 'Product Name',
            value: '{name}',
            position: { x: 5, y: 5 },
            size: { width: 50, height: 10 },
            fontSize: 10,
            fontWeight: 'bold'
          },
          {
            id: '2',
            type: 'price',
            name: 'Price',
            value: '{price}',
            position: { x: 5, y: 20 },
            size: { width: 50, height: 15 },
            fontSize: 14,
            fontWeight: 'bold',
            alignment: 'center'
          }
        ]
      },
      {
        id: '3',
        name: 'QR Code Label',
        type: 'qr',
        width: 50,
        height: 50,
        orientation: 'portrait',
        isActive: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        fields: [
          {
            id: '1',
            type: 'qr',
            name: 'Product QR',
            value: '{sku}',
            position: { x: 10, y: 5 },
            size: { width: 30, height: 30 }
          },
          {
            id: '2',
            type: 'text',
            name: 'SKU',
            value: '{sku}',
            position: { x: 5, y: 40 },
            size: { width: 40, height: 5 },
            fontSize: 8,
            alignment: 'center'
          }
        ]
      }
    ]

    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Wireless Bluetooth Headphones',
        sku: 'WBH-001',
        barcode: '1234567890123',
        price: 79.99,
        category: 'Electronics',
        stock: 25,
        description: 'High-quality wireless headphones with noise cancellation',
        brand: 'AudioTech',
        weight: '250g',
        dimensions: '18 x 16 x 8 cm'
      },
      {
        id: '2',
        name: 'Organic Green Tea',
        sku: 'OGT-002',
        barcode: '2345678901234',
        price: 12.99,
        category: 'Food & Beverage',
        stock: 50,
        description: 'Premium organic green tea leaves',
        brand: 'Nature\'s Best',
        weight: '100g',
        dimensions: '10 x 15 x 5 cm'
      },
      {
        id: '3',
        name: 'Cotton T-Shirt',
        sku: 'CTS-003',
        barcode: '3456789012345',
        price: 24.99,
        category: 'Clothing',
        stock: 100,
        description: 'Comfortable 100% cotton t-shirt',
        brand: 'ComfortWear',
        weight: '200g',
        dimensions: '30 x 25 x 2 cm'
      },
      {
        id: '4',
        name: 'Stainless Steel Water Bottle',
        sku: 'SSB-004',
        barcode: '4567890123456',
        price: 19.99,
        category: 'Home & Garden',
        stock: 75,
        description: 'Insulated stainless steel water bottle',
        brand: 'EcoDrink',
        weight: '350g',
        dimensions: '25 x 7 x 7 cm'
      }
    ]

    const mockPrintJobs: PrintJob[] = [
      {
        id: '1',
        templateId: '1',
        templateName: 'Standard Barcode Label',
        products: [mockProducts[0]],
        quantity: 25,
        copies: 1,
        status: 'completed',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        totalLabels: 25
      },
      {
        id: '2',
        templateId: '2',
        templateName: 'Price Tag Label',
        products: [mockProducts[1], mockProducts[2]],
        quantity: 50,
        copies: 1,
        status: 'printing',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        totalLabels: 100
      }
    ]

    const mockPrinters: PrinterSettings[] = [
      {
        id: '1',
        name: 'Thermal Printer 1',
        type: 'thermal',
        connection: 'usb',
        paperSize: '50mm x 25mm',
        dpi: 300,
        isActive: true
      },
      {
        id: '2',
        name: 'Network Laser Printer',
        type: 'laser',
        connection: 'network',
        ipAddress: '192.168.1.100',
        paperSize: 'A4',
        dpi: 600,
        isActive: true
      }
    ]

    setTemplates(mockTemplates)
    setProducts(mockProducts)
    setPrintJobs(mockPrintJobs)
    setPrinters(mockPrinters)
    setSelectedPrinter(mockPrinters[0]?.id || '')
  }, [])

  const handleCreateTemplate = () => {
    if (!newTemplate.name) return

    const template: LabelTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      type: newTemplate.type,
      width: newTemplate.width,
      height: newTemplate.height,
      orientation: newTemplate.orientation,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: [
        {
          id: '1',
          type: newTemplate.type === 'qr' ? 'qr' : 'barcode',
          name: 'Main Code',
          value: '{barcode}',
          position: { x: 5, y: 5 },
          size: { width: newTemplate.width - 10, height: newTemplate.height - 10 }
        }
      ]
    }

    setTemplates(prev => [...prev, template])
    setNewTemplate({
      name: '',
      type: 'barcode',
      width: 50,
      height: 25,
      orientation: 'portrait'
    })
    setIsCreateTemplateOpen(false)
  }

  const handlePrintLabels = () => {
    if (!selectedTemplate || selectedProducts.length === 0 || !selectedPrinter) return

    const template = templates.find(t => t.id === selectedTemplate)
    const selectedProductsData = products.filter(p => selectedProducts.includes(p.id))

    if (!template) return

    const printJob: PrintJob = {
      id: Date.now().toString(),
      templateId: selectedTemplate,
      templateName: template.name,
      products: selectedProductsData,
      quantity,
      copies,
      status: 'pending',
      createdAt: new Date(),
      totalLabels: selectedProducts.length * quantity * copies
    }

    setPrintJobs(prev => [printJob, ...prev])

    // Simulate printing process
    setTimeout(() => {
      setPrintJobs(prev => 
        prev.map(job => 
          job.id === printJob.id 
            ? { ...job, status: 'printing' as const }
            : job
        )
      )

      setTimeout(() => {
        setPrintJobs(prev => 
          prev.map(job => 
            job.id === printJob.id 
              ? { ...job, status: 'completed' as const, completedAt: new Date() }
              : job
          )
        )
      }, 2000)
    }, 1000)

    // Reset form
    setSelectedProducts([])
    setQuantity(1)
    setCopies(1)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'printing': return 'bg-blue-500'
      case 'pending': return 'bg-yellow-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed'
      case 'printing': return 'Printing'
      case 'pending': return 'Pending'
      case 'failed': return 'Failed'
      default: return 'Unknown'
    }
  }

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'barcode': return <Barcode className="h-4 w-4" />
      case 'qr': return <QrCode className="h-4 w-4" />
      case 'price': return <Tag className="h-4 w-4" />
      case 'product': return <Package className="h-4 w-4" />
      default: return <Tag className="h-4 w-4" />
    }
  }

  const selectedProductsData = products.filter(p => selectedProducts.includes(p.id))
  const totalLabels = selectedProductsData.length * quantity * copies

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Label Printing</h1>
          <p className="text-muted-foreground">Create and print barcode labels for your products</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="print">Print Labels</TabsTrigger>
          <TabsTrigger value="history">Print History</TabsTrigger>
          <TabsTrigger value="settings">Printer Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Label Templates</h2>
            <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Label Template</DialogTitle>
                  <DialogDescription>
                    Define a new label template for printing
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="templateName">Template Name</Label>
                    <Input
                      id="templateName"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter template name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="templateType">Label Type</Label>
                    <Select 
                      value={newTemplate.type} 
                      onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="barcode">Barcode Label</SelectItem>
                        <SelectItem value="qr">QR Code Label</SelectItem>
                        <SelectItem value="price">Price Tag</SelectItem>
                        <SelectItem value="product">Product Label</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="width">Width (mm)</Label>
                      <Input
                        id="width"
                        type="number"
                        value={newTemplate.width}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (mm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={newTemplate.height}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orientation">Orientation</Label>
                    <Select 
                      value={newTemplate.orientation} 
                      onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, orientation: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleCreateTemplate} className="w-full">
                    Create Template
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map(template => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTemplateIcon(template.type)}
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription>
                    {template.width}mm × {template.height}mm • {template.orientation}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Fields: {template.fields.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Created: {format(template.createdAt, 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedTemplate(template.id)
                        setIsPreviewOpen(true)
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(template.id)
                        setActiveTab('print')
                      }}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Use
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="print" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Print Labels</CardTitle>
              <CardDescription>Select products and template to print labels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template">Label Template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.filter(t => t.isActive).map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="printer">Printer</Label>
                    <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select printer" />
                      </SelectTrigger>
                      <SelectContent>
                        {printers.filter(p => p.isActive).map(printer => (
                          <SelectItem key={printer.id} value={printer.id}>
                            {printer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Labels per Product</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="copies">Copies</Label>
                      <Input
                        id="copies"
                        type="number"
                        min="1"
                        value={copies}
                        onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm font-medium">Total Labels: {totalLabels}</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedProductsData.length} products × {quantity} labels × {copies} copies
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Products</Label>
                    <div className="border rounded-lg max-h-60 overflow-y-auto">
                      {products.map(product => (
                        <div key={product.id} className="flex items-center space-x-3 p-3 hover:bg-muted/50">
                          <Checkbox
                            id={product.id}
                            checked={selectedProducts.includes(product.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedProducts(prev => [...prev, product.id])
                              } else {
                                setSelectedProducts(prev => prev.filter(id => id !== product.id))
                              }
                            }}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.sku} • ${product.price.toFixed(2)} • Stock: {product.stock}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handlePrintLabels}
                disabled={!selectedTemplate || selectedProducts.length === 0 || !selectedPrinter}
                className="w-full"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Labels
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Print History</CardTitle>
              <CardDescription>View all label printing jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {printJobs.map(job => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.templateName}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {job.products.map(product => (
                            <div key={product.id} className="text-sm">
                              {product.name}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{job.totalLabels}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(job.status)}`} />
                          {getStatusText(job.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(job.createdAt, 'MMM dd, HH:mm')}</TableCell>
                      <TableCell>
                        {job.completedAt ? format(job.completedAt, 'MMM dd, HH:mm') : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reprint
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

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Printer Settings</CardTitle>
              <CardDescription>Configure and manage your printers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {printers.map(printer => (
                  <div key={printer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{printer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {printer.type} • {printer.connection} • {printer.paperSize} • {printer.dpi} DPI
                      </div>
                      {printer.ipAddress && (
                        <div className="text-sm text-muted-foreground">
                          IP: {printer.ipAddress}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={printer.isActive ? "default" : "secondary"}>
                        {printer.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Settings className="mr-2 h-4 w-4" />
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}