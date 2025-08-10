'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface CSVExportProps {
  businessType?: string
  onExportComplete?: (success: boolean) => void
}

interface ExportField {
  key: string
  label: string
  included: boolean
  required: boolean
}

export default function CSVExport({ businessType, onExportComplete }: CSVExportProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    exportedCount?: number
    fileName?: string
  } | null>(null)

  const [fields, setFields] = useState<ExportField[]>([
    { key: 'id', label: 'ID', included: false, required: false },
    { key: 'name', label: 'Name', included: true, required: true },
    { key: 'description', label: 'Description', included: true, required: false },
    { key: 'price', label: 'Price', included: true, required: true },
    { key: 'category', label: 'Category', included: true, required: false },
    { key: 'categoryId', label: 'Category ID', included: false, required: false },
    { key: 'isActive', label: 'Active', included: false, required: false },
    { key: 'isAvailable', label: 'Available', included: false, required: false },
    { key: 'createdAt', label: 'Created Date', included: false, required: false },
    { key: 'updatedAt', label: 'Updated Date', included: false, required: false }
  ])

  const handleFieldToggle = (key: string, checked: boolean) => {
    setFields(prev => prev.map(field => 
      field.key === key ? { ...field, included: checked } : field
    ))
  }

  const handleSelectAll = (checked: boolean) => {
    setFields(prev => prev.map(field => 
      ({ ...field, included: field.required ? true : checked })
    ))
  }

  const handleExport = async () => {
    const selectedFields = fields.filter(f => f.included)
    
    if (selectedFields.length === 0) {
      toast.error('Please select at least one field to export')
      return
    }

    setIsExporting(true)
    setExportProgress(0)
    setResult(null)

    try {
      const queryParams = new URLSearchParams({
        fields: selectedFields.map(f => f.key).join(','),
        businessType: businessType || ''
      })

      const response = await fetch(`/api/products/csv-export?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Export failed')
      }

      // Get the blob from response
      const blob = await response.blob()
      
      // Get filename from response headers
      const contentDisposition = response.headers.get('content-disposition')
      let fileName = `products_export_${new Date().toISOString().split('T')[0]}.csv`
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
        if (fileNameMatch?.[1]) {
          fileName = fileNameMatch[1]
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      // Get export count from response
      const exportCount = parseInt(response.headers.get('x-export-count') || '0')

      setResult({
        success: true,
        message: 'Export completed successfully',
        exportedCount: exportCount,
        fileName
      })

      onExportComplete?.(true)
      toast.success(`Successfully exported ${exportCount} products`)

    } catch (error) {
      console.error('Export error:', error)
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Export failed'
      })
      onExportComplete?.(false)
      toast.error('Export failed')
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const selectedCount = fields.filter(f => f.included).length
  const totalCount = fields.length

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Products to CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Select Fields to Export</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {selectedCount} of {totalCount} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSelectAll(selectedCount < totalCount)}
                className="h-6 px-2 text-xs"
              >
                {selectedCount < totalCount ? 'Select All' : 'Select None'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
            {fields.map((field) => (
              <div key={field.key} className="flex items-center space-x-2">
                <Checkbox
                  id={field.key}
                  checked={field.included}
                  onCheckedChange={(checked) => handleFieldToggle(field.key, checked as boolean)}
                  disabled={field.required}
                />
                <Label
                  htmlFor={field.key}
                  className={`text-sm cursor-pointer ${field.required ? 'font-medium' : ''}`}
                >
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleExport}
          disabled={isExporting || selectedCount === 0}
          className="w-full"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Export {selectedCount} Field{selectedCount !== 1 ? 's' : ''}
            </>
          )}
        </Button>

        {result && (
          <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <AlertDescription className="space-y-2">
                  <p className={result.success ? "text-green-800" : "text-red-800"}>
                    {result.message}
                  </p>
                  
                  {result.exportedCount && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {result.exportedCount} products exported
                      </Badge>
                      {result.fileName && (
                        <Badge variant="outline">
                          {result.fileName}
                        </Badge>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• CSV files can be opened in Excel, Google Sheets, or other spreadsheet applications</p>
          <p>• Required fields (*) are always included in the export</p>
          <p>• Large exports may take a few moments to process</p>
        </div>
      </CardContent>
    </Card>
  )
}