'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Download, FileText, FileSpreadsheet, File, Database, Image, Mail, Share2, RefreshCw, Filter, Eye, Settings, BarChart3, TrendingUp, Users, Package, ShoppingCart } from 'lucide-react'
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'

interface ExportConfig {
  format: 'PDF' | 'Excel' | 'CSV' | 'JSON' | 'XML'
  reportType: string
  dateRange: {
    start: string
    end: string
  }
  filters: Record<string, any>
  schedule?: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    email: string
  }
  template?: string
}

interface ExportHistory {
  id: string
  fileName: string
  format: string
  reportType: string
  size: string
  createdAt: string
  status: 'completed' | 'failed' | 'processing'
  downloadUrl?: string
}

interface ScheduledExport {
  id: string
  name: string
  reportType: string
  format: string
  frequency: string
  nextRun: string
  isActive: boolean
  lastRun?: string
}

export default function ReportsExport() {
  const [isLoading, setIsLoading] = useState(false)
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'PDF',
    reportType: 'sales',
    dateRange: {
      start: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd')
    },
    filters: {},
    schedule: {
      enabled: false,
      frequency: 'monthly',
      email: ''
    }
  })
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([])
  const [scheduledExports, setScheduledExports] = useState<ScheduledExport[]>([])
  const [activeTab, setActiveTab] = useState('export')

  const reportTypes = [
    { value: 'sales', label: 'Sales Report', icon: ShoppingCart },
    { value: 'inventory', label: 'Inventory Report', icon: Package },
    { value: 'customers', label: 'Customer Report', icon: Users },
    { value: 'financial', label: 'Financial Report', icon: BarChart3 },
    { value: 'tax', label: 'Tax Report', icon: FileText },
    { value: 'orders', label: 'Orders Report', icon: ShoppingCart },
    { value: 'products', label: 'Products Report', icon: Package },
    { value: 'staff', label: 'Staff Report', icon: Users }
  ]

  const exportFormats = [
    { value: 'PDF', label: 'PDF Document', icon: FileText, description: 'Portable Document Format' },
    { value: 'Excel', label: 'Excel Spreadsheet', icon: FileSpreadsheet, description: 'Microsoft Excel Format' },
    { value: 'CSV', label: 'CSV File', icon: Database, description: 'Comma-Separated Values' },
    { value: 'JSON', label: 'JSON Data', icon: File, description: 'JavaScript Object Notation' },
    { value: 'XML', label: 'XML Data', icon: File, description: 'eXtensible Markup Language' }
  ]

  useEffect(() => {
    loadExportHistory()
    loadScheduledExports()
  }, [])

  const loadExportHistory = () => {
    const mockHistory: ExportHistory[] = [
      {
        id: '1',
        fileName: 'Sales_Report_Oct_2024.pdf',
        format: 'PDF',
        reportType: 'sales',
        size: '2.4 MB',
        createdAt: '2024-10-15T10:30:00Z',
        status: 'completed',
        downloadUrl: '/downloads/sales_report_oct_2024.pdf'
      },
      {
        id: '2',
        fileName: 'Inventory_Report_Oct_2024.xlsx',
        format: 'Excel',
        reportType: 'inventory',
        size: '1.8 MB',
        createdAt: '2024-10-14T14:20:00Z',
        status: 'completed',
        downloadUrl: '/downloads/inventory_report_oct_2024.xlsx'
      },
      {
        id: '3',
        fileName: 'Customer_Report_Oct_2024.csv',
        format: 'CSV',
        reportType: 'customers',
        size: '856 KB',
        createdAt: '2024-10-13T09:15:00Z',
        status: 'completed',
        downloadUrl: '/downloads/customer_report_oct_2024.csv'
      },
      {
        id: '4',
        fileName: 'Financial_Report_Q3_2024.pdf',
        format: 'PDF',
        reportType: 'financial',
        size: '3.2 MB',
        createdAt: '2024-10-12T16:45:00Z',
        status: 'failed'
      }
    ]
    setExportHistory(mockHistory)
  }

  const loadScheduledExports = () => {
    const mockScheduled: ScheduledExport[] = [
      {
        id: '1',
        name: 'Monthly Sales Report',
        reportType: 'sales',
        format: 'PDF',
        frequency: 'monthly',
        nextRun: '2024-11-01T00:00:00Z',
        isActive: true,
        lastRun: '2024-10-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Weekly Inventory Summary',
        reportType: 'inventory',
        format: 'Excel',
        frequency: 'weekly',
        nextRun: '2024-10-21T00:00:00Z',
        isActive: true,
        lastRun: '2024-10-14T00:00:00Z'
      },
      {
        id: '3',
        name: 'Quarterly Financial Report',
        reportType: 'financial',
        format: 'PDF',
        frequency: 'quarterly',
        nextRun: '2025-01-01T00:00:00Z',
        isActive: false,
        lastRun: '2024-07-01T00:00:00Z'
      }
    ]
    setScheduledExports(mockScheduled)
  }

  const handleExport = async () => {
    setIsLoading(true)
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const newExport: ExportHistory = {
        id: Date.now().toString(),
        fileName: `${exportConfig.reportType}_Report_${format(new Date(), 'MMM_yyyy')}.${exportConfig.format.toLowerCase()}`,
        format: exportConfig.format,
        reportType: exportConfig.reportType,
        size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
        createdAt: new Date().toISOString(),
        status: 'completed'
      }
      
      setExportHistory([newExport, ...exportHistory])
      
      // Show success message
      alert(`Report exported successfully as ${newExport.fileName}`)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleScheduleExport = () => {
    if (!exportConfig.schedule?.enabled || !exportConfig.schedule.email) {
      alert('Please enable scheduling and provide an email address.')
      return
    }

    const newScheduled: ScheduledExport = {
      id: Date.now().toString(),
      name: `${exportConfig.reportType} Report - ${exportConfig.schedule.frequency}`,
      reportType: exportConfig.reportType,
      format: exportConfig.format,
      frequency: exportConfig.schedule.frequency,
      nextRun: calculateNextRun(exportConfig.schedule.frequency),
      isActive: true
    }

    setScheduledExports([...scheduledExports, newScheduled])
    alert('Export scheduled successfully!')
  }

  const calculateNextRun = (frequency: string): string => {
    const now = new Date()
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
      case 'quarterly':
        return new Date(now.getFullYear(), now.getMonth() + 3, 1).toISOString()
      default:
        return now.toISOString()
    }
  }

  const toggleScheduledExport = (id: string) => {
    setScheduledExports(scheduledExports.map(export_ => 
      export_.id === id ? { ...export_, isActive: !export_.isActive } : export_
    ))
  }

  const deleteScheduledExport = (id: string) => {
    setScheduledExports(scheduledExports.filter(export_ => export_.id !== id))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (size: string) => {
    return size
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports Export</h1>
          <p className="text-gray-600">Export and schedule reports in various formats</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="export">Export Report</TabsTrigger>
          <TabsTrigger value="history">Export History</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Exports</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Export Configuration */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Export Configuration
                  </CardTitle>
                  <CardDescription>Configure your report export settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Report Type Selection */}
                  <div>
                    <Label className="text-sm font-medium">Report Type</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                      {reportTypes.map((type) => {
                        const Icon = type.icon
                        return (
                          <Card 
                            key={type.value}
                            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                              exportConfig.reportType === type.value ? 'ring-2 ring-blue-500' : ''
                            }`}
                            onClick={() => setExportConfig({...exportConfig, reportType: type.value})}
                          >
                            <CardContent className="p-4 text-center">
                              <Icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                              <div className="text-sm font-medium">{type.label}</div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>

                  {/* Export Format Selection */}
                  <div>
                    <Label className="text-sm font-medium">Export Format</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {exportFormats.map((format) => {
                        const Icon = format.icon
                        return (
                          <Card 
                            key={format.value}
                            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                              exportConfig.format === format.value ? 'ring-2 ring-blue-500' : ''
                            }`}
                            onClick={() => setExportConfig({...exportConfig, format: format.value as any})}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <Icon className="h-6 w-6 text-blue-600" />
                                <div>
                                  <div className="font-medium">{format.label}</div>
                                  <div className="text-sm text-gray-600">{format.description}</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div>
                    <Label className="text-sm font-medium">Date Range</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label htmlFor="start-date" className="text-xs">Start Date</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={exportConfig.dateRange.start}
                          onChange={(e) => setExportConfig({
                            ...exportConfig,
                            dateRange: {...exportConfig.dateRange, start: e.target.value}
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-date" className="text-xs">End Date</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={exportConfig.dateRange.end}
                          onChange={(e) => setExportConfig({
                            ...exportConfig,
                            dateRange: {...exportConfig.dateRange, end: e.target.value}
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Scheduling */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Schedule Export</CardTitle>
                      <CardDescription>Automatically export reports on a schedule</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="enable-schedule"
                          checked={exportConfig.schedule?.enabled}
                          onChange={(e) => setExportConfig({
                            ...exportConfig,
                            schedule: {...exportConfig.schedule!, enabled: e.target.checked}
                          })}
                        />
                        <Label htmlFor="enable-schedule">Enable scheduled export</Label>
                      </div>

                      {exportConfig.schedule?.enabled && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="frequency">Frequency</Label>
                              <Select 
                                value={exportConfig.schedule.frequency} 
                                onValueChange={(value) => setExportConfig({
                                  ...exportConfig,
                                  schedule: {...exportConfig.schedule!, frequency: value as any}
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  <SelectItem value="quarterly">Quarterly</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="email">Email Address</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="report@example.com"
                                value={exportConfig.schedule.email}
                                onChange={(e) => setExportConfig({
                                  ...exportConfig,
                                  schedule: {...exportConfig.schedule!, email: e.target.value}
                                })}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>

            {/* Export Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Export Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Report Type:</span>
                      <span className="font-medium">
                        {reportTypes.find(t => t.value === exportConfig.reportType)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Format:</span>
                      <span className="font-medium">{exportConfig.format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Date Range:</span>
                      <span className="font-medium text-xs">
                        {format(new Date(exportConfig.dateRange.start), 'MMM dd')} - {format(new Date(exportConfig.dateRange.end), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    {exportConfig.schedule?.enabled && (
                      <div className="flex justify-between">
                        <span className="text-sm">Schedule:</span>
                        <span className="font-medium">{exportConfig.schedule.frequency}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-4">
                    <Button 
                      onClick={handleExport} 
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Export Now
                        </>
                      )}
                    </Button>

                    {exportConfig.schedule?.enabled && (
                      <Button 
                        variant="outline" 
                        onClick={handleScheduleExport}
                        className="w-full"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Schedule Export
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Report
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Image className="h-4 w-4 mr-2" alt="" />
                    Export as Image
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Bulk Export
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Export History
                </span>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
              <CardDescription>
                View and download previously exported reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exportHistory.map((export_) => (
                  <div key={export_.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{export_.fileName}</div>
                        <div className="text-sm text-gray-600">
                          {export_.reportType} • {formatFileSize(export_.size)} • {formatDate(export_.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(export_.status)}>
                        {export_.status}
                      </Badge>
                      {export_.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Scheduled Exports
                </span>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
              <CardDescription>
                Manage your automated report exports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledExports.map((scheduled) => (
                  <div key={scheduled.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{scheduled.name}</div>
                        <div className="text-sm text-gray-600">
                          {scheduled.reportType} • {scheduled.format} • {scheduled.frequency}
                        </div>
                        <div className="text-xs text-gray-500">
                          Next run: {formatDate(scheduled.nextRun)}
                          {scheduled.lastRun && ` • Last run: ${formatDate(scheduled.lastRun)}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={scheduled.isActive ? 'default' : 'secondary'}>
                        {scheduled.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleScheduledExport(scheduled.id)}
                      >
                        {scheduled.isActive ? 'Disable' : 'Enable'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteScheduledExport(scheduled.id)}
                      >
                        Delete
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