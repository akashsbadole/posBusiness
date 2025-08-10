'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Barcode, 
  Camera, 
  Search, 
  Plus, 
  Minus,
  Package,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface BarcodeItem {
  barcode: string
  name: string
  price: number
  quantity: number
  category?: string
  hsnCode?: string
  gstRate?: number
}

interface BarcodeScannerProps {
  onAddToCart?: (item: BarcodeItem) => void
  onSearchProduct?: (barcode: string) => Promise<BarcodeItem | null>
  className?: string
}

export default function BarcodeScanner({ onAddToCart, onSearchProduct, className }: BarcodeScannerProps) {
  const [barcode, setBarcode] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [lastScanned, setLastScanned] = useState<BarcodeItem | null>(null)
  const [scanHistory, setScanHistory] = useState<BarcodeItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus on barcode input when scanning starts
  useEffect(() => {
    if (isScanning && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isScanning])

  // Handle barcode input
  const handleBarcodeInput = async (value: string) => {
    setBarcode(value)
    setError(null)
    setSuccess(null)

    if (value.length >= 8) { // Minimum barcode length
      await processBarcode(value)
    }
  }

  // Process scanned barcode
  const processBarcode = async (barcodeValue: string) => {
    setIsProcessing(true)
    
    try {
      let item: BarcodeItem | null = null

      // Try to find product via API if provided
      if (onSearchProduct) {
        item = await onSearchProduct(barcodeValue)
      }

      // If not found via API, try to find in mock database
      if (!item) {
        item = await searchMockProduct(barcodeValue)
      }

      if (item) {
        // Update quantity
        const itemWithQuantity = { ...item, quantity }
        
        setLastScanned(itemWithQuantity)
        setScanHistory(prev => [itemWithQuantity, ...prev.slice(0, 9)]) // Keep last 10 scans
        setSuccess(`Found: ${item.name}`)
        
        // Auto-add to cart if callback provided
        if (onAddToCart) {
          onAddToCart(itemWithQuantity)
        }
        
        // Reset for next scan
        setTimeout(() => {
          setBarcode('')
          setQuantity(1)
          if (inputRef.current) {
            inputRef.current.focus()
          }
        }, 1000)
      } else {
        setError(`Product not found for barcode: ${barcodeValue}`)
      }
    } catch (err) {
      setError(`Error processing barcode: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Mock product database for demonstration
  const searchMockProduct = async (barcode: string): Promise<BarcodeItem | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const mockProducts: { [key: string]: BarcodeItem } = {
      '8901058334258': {
        barcode: '8901058334258',
        name: 'Basmati Rice Premium',
        price: 299.99,
        quantity: 1,
        category: 'Groceries',
        hsnCode: '10063010',
        gstRate: 5
      },
      '8906001234567': {
        barcode: '8906001234567',
        name: 'Toor Dal (Split Pigeon Peas)',
        price: 189.50,
        quantity: 1,
        category: 'Groceries',
        hsnCode: '07132090',
        gstRate: 5
      },
      '8901234567890': {
        barcode: '8901234567890',
        name: 'Refined Sunflower Oil',
        price: 145.00,
        quantity: 1,
        category: 'Groceries',
        hsnCode: '15151990',
        gstRate: 5
      },
      '8909876543210': {
        barcode: '8909876543210',
        name: 'Fresh Milk 1L',
        price: 56.00,
        quantity: 1,
        category: 'Dairy',
        hsnCode: '04012090',
        gstRate: 0
      },
      '8905555555555': {
        barcode: '8905555555555',
        name: 'Wheat Flour Atta',
        price: 89.99,
        quantity: 1,
        category: 'Groceries',
        hsnCode: '11010000',
        gstRate: 5
      }
    }

    return mockProducts[barcode] || null
  }

  // Start/stop scanning
  const toggleScanning = () => {
    setIsScanning(!isScanning)
    setBarcode('')
    setError(null)
    setSuccess(null)
    if (!isScanning && inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Handle manual quantity change
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0 && newQuantity <= 999) {
      setQuantity(newQuantity)
    }
  }

  // Add last scanned item to cart with current quantity
  const addToCart = () => {
    if (lastScanned && onAddToCart) {
      const itemWithQuantity = { ...lastScanned, quantity }
      onAddToCart(itemWithQuantity)
      setSuccess(`Added ${quantity}x ${lastScanned.name} to cart`)
    }
  }

  // Clear scan history
  const clearHistory = () => {
    setScanHistory([])
    setLastScanned(null)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Scanner Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Barcode className="h-5 w-5" />
            Barcode Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Scanner Controls */}
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleScanning}
                variant={isScanning ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Stop Scanning
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    Start Scanning
                  </>
                )}
              </Button>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="quantity">Qty:</Label>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-16 text-center"
                    min="1"
                    max="999"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 999}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Barcode Input */}
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode (or type manually)</Label>
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  id="barcode"
                  value={barcode}
                  onChange={(e) => handleBarcodeInput(e.target.value)}
                  placeholder="Scan barcode or enter manually..."
                  disabled={!isScanning || isProcessing}
                  className="flex-1"
                />
                <Button
                  onClick={() => barcode && processBarcode(barcode)}
                  disabled={!barcode || isProcessing}
                  size="sm"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-2 rounded">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Processing barcode...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Last Scanned Item */}
      {lastScanned && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Last Scanned Item
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Product Name</div>
                <div className="font-medium">{lastScanned.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Price</div>
                <div className="font-medium">₹{lastScanned.price.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Barcode</div>
                <div className="font-medium">{lastScanned.barcode}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Category</div>
                <div className="font-medium">{lastScanned.category || 'N/A'}</div>
              </div>
              {lastScanned.hsnCode && (
                <div>
                  <div className="text-sm text-gray-600">HSN Code</div>
                  <div className="font-medium">{lastScanned.hsnCode}</div>
                </div>
              )}
              {lastScanned.gstRate !== undefined && (
                <div>
                  <div className="text-sm text-gray-600">GST Rate</div>
                  <div className="font-medium">{lastScanned.gstRate}%</div>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button onClick={addToCart} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add {quantity}x to Cart (₹{(lastScanned.price * quantity).toFixed(2)})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Scan History ({scanHistory.length})
              </div>
              <Button variant="outline" size="sm" onClick={clearHistory}>
                Clear
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {scanHistory.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      {item.barcode} • {item.quantity}x • ₹{item.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</div>
                    {item.category && (
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-1">
            <div>• Click "Start Scanning" to activate the barcode scanner</div>
            <div>• Scan product barcodes using a barcode scanner or type manually</div>
            <div>• Adjust quantity before adding to cart</div>
            <div>• Products are automatically added to cart when scanned</div>
            <div>• View scan history for recently scanned items</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}