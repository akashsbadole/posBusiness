'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface CSVImportResult {
  success: boolean
  message: string
  importedCount?: number
  errors?: string[]
  warnings?: string[]
}

interface CSVImportProps {
  onImportComplete?: (result: CSVImportResult) => void
  businessType?: string
}

export default function CSVImport({ onImportComplete, businessType }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [result, setResult] = useState<CSVImportResult | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error('Please select a CSV file')
        return
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB')
        return
      }

      setFile(selectedFile)
      setResult(null)
      previewCSV(selectedFile)
    }
  }

  const previewCSV = async (file: File) => {
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        toast.error('CSV must have at least a header and one data row')
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const previewData = lines.slice(1, 6).map((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const row: any = {}
        headers.forEach((header, i) => {
          row[header] = values[i] || ''
        })
        row._id = index + 1
        return row
      })

      setPreview(previewData)
    } catch (error) {
      console.error('Error previewing CSV:', error)
      toast.error('Error reading CSV file')
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('businessType', businessType || '')

      const response = await fetch('/api/products/csv-import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      })

      const data = await response.json()
      setResult(data)
      onImportComplete?.(data)
      
      if (data.success) {
        toast.success(`Successfully imported ${data.importedCount} products`)
      } else {
        toast.error(data.message || 'Import failed')
      }

      setIsUploading(false)
    } catch (error) {
      console.error('Import error:', error)
      setResult({
        success: false,
        message: 'Error during import',
        errors: ['Network error occurred']
      })
      toast.error('Error during import')
      setIsUploading(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    setResult(null)
    setPreview([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadTemplate = () => {
    const template = `name,description,price,category,sku,stock_quantity,barcode
"Sample Product 1","Product description 1",19.99,"Main Course","SKU001",10,"BAR001"
"Sample Product 2","Product description 2",29.99,"Main Course","SKU002",15,"BAR002"
"Sample Product 3","Product description 3",9.99,"Appetizer","SKU003",20,"BAR003"
"Sample Product 4","Product description 4",14.99,"Appetizer","SKU004",25,"BAR004"
"Sample Product 5","Product description 5",4.99,"Beverages","SKU005",50,"BAR005"`
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'menu_items_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Products from CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button onClick={downloadTemplate} variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Label className="text-sm text-muted-foreground">
            Use this template to ensure correct format
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="csv-file">Select CSV File</Label>
          <Input
            ref={fileInputRef}
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          {file && (
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span className="text-sm font-medium">{file.name}</span>
              <Button onClick={clearFile} variant="ghost" size="sm">
                Clear
              </Button>
            </div>
          )}
        </div>

        {preview.length > 0 && (
          <div className="space-y-2">
            <Label>Preview (first 5 rows)</Label>
            <div className="border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    {Object.keys(preview[0]).filter(key => key !== '_id').map((header) => (
                      <th key={header} className="p-2 text-left font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row) => (
                    <tr key={row._id} className="border-t">
                      {Object.entries(row).filter(([key]) => key !== '_id').map(([key, value]) => (
                        <td key={key} className="p-2">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {file && (
          <Button 
            onClick={handleImport} 
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Importing...
              </>
            ) : (
              'Import Products'
            )}
          </Button>
        )}

        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {result && (
          <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <AlertDescription className="space-y-2">
                  <p className={result.success ? "text-green-800" : "text-red-800"}>
                    {result.message}
                  </p>
                  
                  {result.importedCount && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {result.importedCount} products imported
                      </Badge>
                    </div>
                  )}
                  
                  {result.errors && result.errors.length > 0 && (
                    <div className="space-y-1">
                      <p className="font-medium text-red-800">Errors:</p>
                      {result.errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-700">• {error}</p>
                      ))}
                    </div>
                  )}
                  
                  {result.warnings && result.warnings.length > 0 && (
                    <div className="space-y-1">
                      <p className="font-medium text-yellow-800">Warnings:</p>
                      {result.warnings.map((warning, index) => (
                        <p key={index} className="text-sm text-yellow-700">• {warning}</p>
                      ))}
                    </div>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}