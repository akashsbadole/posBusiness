'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calculator, Plus, Edit, Trash2, Settings, Percent, FileText, AlertTriangle, CheckCircle, Info, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import TaxReports from '@/components/reports/TaxReports'

interface TaxConfig {
  cgstRate: number
  sgstRate: number
  igstRate: number
  cessRate: number
  standardRate: number
  enableCess: boolean
  categoryRates: Record<string, number>
  hsnRates: Record<string, number>
  exemptions: Array<{
    type: string
    threshold: number
    percentage: number
    description: string
  }>
  taxSlabs: Array<{
    minAmount: number
    maxAmount: number | null
    rate: number
  }>
}

interface TaxBreakdown {
  cgst: number
  sgst: number
  igst: number
  cess: number
  total: number
}

interface TaxManagementProps {
  restaurantId: string
}

export default function TaxManagement({ restaurantId }: TaxManagementProps) {
  const [taxConfig, setTaxConfig] = useState<TaxConfig>({
    cgstRate: 2.5,
    sgstRate: 2.5,
    igstRate: 5,
    cessRate: 0,
    standardRate: 5,
    enableCess: false,
    categoryRates: {},
    hsnRates: {},
    exemptions: [],
    taxSlabs: [
      { minAmount: 0, maxAmount: 1000, rate: 0 },
      { minAmount: 1000, maxAmount: 5000, rate: 5 },
      { minAmount: 5000, maxAmount: null, rate: 12 }
    ]
  })
  const [loading, setLoading] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  const [calculatorInput, setCalculatorInput] = useState({
    subtotal: 1000,
    customerState: '',
    restaurantState: '',
    isInterState: false
  })
  const [calculationResult, setCalculationResult] = useState<any>(null)

  useEffect(() => {
    fetchTaxConfig()
  }, [restaurantId])

  const fetchTaxConfig = async () => {
    try {
      const response = await fetch(`/api/tax/rates?restaurantId=${restaurantId}`)
      const data = await response.json()
      setTaxConfig(data)
    } catch (error) {
      toast.error('Failed to fetch tax configuration')
    }
  }

  const handleSaveConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/tax/rates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          rates: taxConfig
        })
      })

      if (response.ok) {
        toast.success('Tax configuration saved successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save tax configuration')
      }
    } catch (error) {
      toast.error('Failed to save tax configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleCalculateTax = async () => {
    try {
      const response = await fetch('/api/tax/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          subtotal: calculatorInput.subtotal,
          items: [
            {
              id: '1',
              name: 'Sample Item',
              price: calculatorInput.subtotal,
              quantity: 1
            }
          ],
          customerState: calculatorInput.customerState,
          restaurantState: calculatorInput.restaurantState,
          isInterState: calculatorInput.isInterState
        })
      })

      const data = await response.json()
      if (response.ok) {
        setCalculationResult(data)
      } else {
        toast.error(data.error || 'Failed to calculate tax')
      }
    } catch (error) {
      toast.error('Failed to calculate tax')
    }
  }

  const addCategoryRate = (category: string, rate: number) => {
    setTaxConfig(prev => ({
      ...prev,
      categoryRates: {
        ...prev.categoryRates,
        [category]: rate
      }
    }))
  }

  const removeCategoryRate = (category: string) => {
    setTaxConfig(prev => {
      const newCategoryRates = { ...prev.categoryRates }
      delete newCategoryRates[category]
      return {
        ...prev,
        categoryRates: newCategoryRates
      }
    })
  }

  const addHSNRate = (hsnCode: string, rate: number) => {
    setTaxConfig(prev => ({
      ...prev,
      hsnRates: {
        ...prev.hsnRates,
        [hsnCode]: rate
      }
    }))
  }

  const removeHSNRate = (hsnCode: string) => {
    setTaxConfig(prev => {
      const newHSNRates = { ...prev.hsnRates }
      delete newHSNRates[hsnCode]
      return {
        ...prev,
        hsnRates: newHSNRates
      }
    })
  }

  const addExemption = () => {
    setTaxConfig(prev => ({
      ...prev,
      exemptions: [
        ...prev.exemptions,
        {
          type: 'AMOUNT_BASED',
          threshold: 1000,
          percentage: 100,
          description: 'Exempt for orders below ₹1000'
        }
      ]
    }))
  }

  const removeExemption = (index: number) => {
    setTaxConfig(prev => ({
      ...prev,
      exemptions: prev.exemptions.filter((_, i) => i !== index)
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tax Management</h2>
          <p className="text-muted-foreground">
            Configure GST, VAT, CGST, SGST, IGST rates and tax rules
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calculator className="w-4 h-4 mr-2" />
                Tax Calculator
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tax Calculator</DialogTitle>
                <DialogDescription>
                  Calculate tax for a given amount
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subtotal">Subtotal Amount</Label>
                  <Input
                    id="subtotal"
                    type="number"
                    value={calculatorInput.subtotal}
                    onChange={(e) => setCalculatorInput(prev => ({ ...prev, subtotal: parseFloat(e.target.value) }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer-state">Customer State</Label>
                    <Input
                      id="customer-state"
                      value={calculatorInput.customerState}
                      onChange={(e) => setCalculatorInput(prev => ({ ...prev, customerState: e.target.value }))}
                      placeholder="e.g., Maharashtra"
                    />
                  </div>
                  <div>
                    <Label htmlFor="restaurant-state">Restaurant State</Label>
                    <Input
                      id="restaurant-state"
                      value={calculatorInput.restaurantState}
                      onChange={(e) => setCalculatorInput(prev => ({ ...prev, restaurantState: e.target.value }))}
                      placeholder="e.g., Maharashtra"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="inter-state"
                    checked={calculatorInput.isInterState}
                    onCheckedChange={(checked) => setCalculatorInput(prev => ({ ...prev, isInterState: checked }))}
                  />
                  <Label htmlFor="inter-state">Inter-state Transaction</Label>
                </div>

                <Button onClick={handleCalculateTax} className="w-full">
                  Calculate Tax
                </Button>

                {calculationResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Calculation Result</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(calculationResult.summary.subtotal)}</span>
                      </div>
                      {calculationResult.taxBreakdown.cgst > 0 && (
                        <div className="flex justify-between">
                          <span>CGST:</span>
                          <span>{formatCurrency(calculationResult.taxBreakdown.cgst)}</span>
                        </div>
                      )}
                      {calculationResult.taxBreakdown.sgst > 0 && (
                        <div className="flex justify-between">
                          <span>SGST:</span>
                          <span>{formatCurrency(calculationResult.taxBreakdown.sgst)}</span>
                        </div>
                      )}
                      {calculationResult.taxBreakdown.igst > 0 && (
                        <div className="flex justify-between">
                          <span>IGST:</span>
                          <span>{formatCurrency(calculationResult.taxBreakdown.igst)}</span>
                        </div>
                      )}
                      {calculationResult.taxBreakdown.cess > 0 && (
                        <div className="flex justify-between">
                          <span>CESS:</span>
                          <span>{formatCurrency(calculationResult.taxBreakdown.cess)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total Tax:</span>
                        <span>{formatCurrency(calculationResult.taxBreakdown.total)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total Amount:</span>
                        <span>{formatCurrency(calculationResult.summary.totalAmount)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Effective Tax Rate: {calculationResult.effectiveRate.toFixed(2)}%
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={handleSaveConfig} disabled={loading}>
            <Settings className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="rates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="rates">Tax Rates</TabsTrigger>
          <TabsTrigger value="categories">Category Rates</TabsTrigger>
          <TabsTrigger value="hsn">HSN Codes</TabsTrigger>
          <TabsTrigger value="exemptions">Exemptions</TabsTrigger>
          <TabsTrigger value="slabs">Tax Slabs</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="rates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Standard Tax Rates</CardTitle>
              <CardDescription>
                Configure default GST rates for your restaurant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="cgst-rate">CGST Rate (%)</Label>
                  <Input
                    id="cgst-rate"
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    value={taxConfig.cgstRate}
                    onChange={(e) => setTaxConfig(prev => ({ ...prev, cgstRate: parseFloat(e.target.value) }))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Central Goods and Services Tax</p>
                </div>

                <div>
                  <Label htmlFor="sgst-rate">SGST Rate (%)</Label>
                  <Input
                    id="sgst-rate"
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    value={taxConfig.sgstRate}
                    onChange={(e) => setTaxConfig(prev => ({ ...prev, sgstRate: parseFloat(e.target.value) }))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">State Goods and Services Tax</p>
                </div>

                <div>
                  <Label htmlFor="igst-rate">IGST Rate (%)</Label>
                  <Input
                    id="igst-rate"
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    value={taxConfig.igstRate}
                    onChange={(e) => setTaxConfig(prev => ({ ...prev, igstRate: parseFloat(e.target.value) }))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Integrated Goods and Services Tax</p>
                </div>

                <div>
                  <Label htmlFor="cess-rate">CESS Rate (%)</Label>
                  <Input
                    id="cess-rate"
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    value={taxConfig.cessRate}
                    onChange={(e) => setTaxConfig(prev => ({ ...prev, cessRate: parseFloat(e.target.value) }))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Additional CESS</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-cess"
                  checked={taxConfig.enableCess}
                  onCheckedChange={(checked) => setTaxConfig(prev => ({ ...prev, enableCess: checked }))}
                />
                <Label htmlFor="enable-cess">Enable CESS Calculation</Label>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Tax Information</span>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• CGST + SGST = Total GST for intra-state transactions</p>
                  <p>• IGST = Total GST for inter-state transactions</p>
                  <p>• Standard Rate: {taxConfig.cgstRate + taxConfig.sgstRate}%</p>
                  <p>• CESS is applied additionally when enabled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category-specific Tax Rates</CardTitle>
              <CardDescription>
                Set different tax rates for different menu categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {Object.entries(taxConfig.categoryRates).map(([category, rate]) => (
                  <div key={category} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">{category}</span>
                      <span className="ml-2 text-sm text-muted-foreground">{rate}%</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCategoryRate(category)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Category name"
                  id="new-category"
                />
                <Input
                  placeholder="Rate %"
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  id="new-category-rate"
                />
                <Button
                  onClick={() => {
                    const category = (document.getElementById('new-category') as HTMLInputElement)?.value
                    const rate = parseFloat((document.getElementById('new-category-rate') as HTMLInputElement)?.value)
                    if (category && rate >= 0) {
                      addCategoryRate(category, rate)
                      ;(document.getElementById('new-category') as HTMLInputElement).value = ''
                      ;(document.getElementById('new-category-rate') as HTMLInputElement).value = ''
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hsn" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>HSN Code-based Tax Rates</CardTitle>
              <CardDescription>
                Set tax rates based on HSN (Harmonized System of Nomenclature) codes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {Object.entries(taxConfig.hsnRates).map(([hsnCode, rate]) => (
                  <div key={hsnCode} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">{hsnCode}</span>
                      <span className="ml-2 text-sm text-muted-foreground">{rate}%</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeHSNRate(hsnCode)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="HSN Code"
                  id="new-hsn"
                />
                <Input
                  placeholder="Rate %"
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  id="new-hsn-rate"
                />
                <Button
                  onClick={() => {
                    const hsnCode = (document.getElementById('new-hsn') as HTMLInputElement)?.value
                    const rate = parseFloat((document.getElementById('new-hsn-rate') as HTMLInputElement)?.value)
                    if (hsnCode && rate >= 0) {
                      addHSNRate(hsnCode, rate)
                      ;(document.getElementById('new-hsn') as HTMLInputElement).value = ''
                      ;(document.getElementById('new-hsn-rate') as HTMLInputElement).value = ''
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exemptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Exemptions</CardTitle>
              <CardDescription>
                Configure tax exemptions for specific conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {taxConfig.exemptions.map((exemption, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">{exemption.description}</span>
                      <div className="text-sm text-muted-foreground">
                        Threshold: {formatCurrency(exemption.threshold)}, 
                        Exemption: {exemption.percentage}%
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeExemption(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button onClick={addExemption} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Exemption
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slabs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Slabs</CardTitle>
              <CardDescription>
                Configure tax slabs based on order amount ranges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Min Amount</TableHead>
                    <TableHead>Max Amount</TableHead>
                    <TableHead>Tax Rate</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxConfig.taxSlabs.map((slab, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatCurrency(slab.minAmount)}</TableCell>
                      <TableCell>{slab.maxAmount ? formatCurrency(slab.maxAmount) : 'No Limit'}</TableCell>
                      <TableCell>{slab.rate}%</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <TaxReports />
        </TabsContent>
      </Tabs>
    </div>
  )
}