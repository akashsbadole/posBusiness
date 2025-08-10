'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  CalendarIcon,
  FileText,
  Users,
  Settings,
  Activity,
  BarChart3,
  Database
} from 'lucide-react'
import { format } from 'date-fns'
import { AuditAction, SecurityLevel } from '@prisma/client'

interface AuditLog {
  id: string
  action: AuditAction
  entityType: string
  entityId: string
  changes?: string
  oldValues?: string
  newValues?: string
  userId?: string
  staffId?: string
  restaurantId: string
  orderId?: string
  paymentId?: string
  ipAddress?: string
  userAgent?: string
  securityLevel: SecurityLevel
  createdAt: string
  user?: {
    id: string
    name: string
    email: string
  }
  staff?: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface SecurityAlert {
  id: string
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  description: string
  timestamp: string
  ipAddress?: string
  userId?: string
  resolved: boolean
  resolvedAt?: string
  resolvedBy?: string
}

interface AuditTrailsProps {
  restaurantId: string
}

export default function AuditTrails({ restaurantId }: AuditTrailsProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    userId: '',
    staffId: '',
    startDate: '',
    endDate: '',
    securityLevel: ''
  })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchAuditLogs()
    fetchSecurityAlerts()
  }, [restaurantId, filters])

  const fetchAuditLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ restaurantId })
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/audit?${params}`)
      const data = await response.json()
      setAuditLogs(data.logs || [])
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSecurityAlerts = async () => {
    try {
      const response = await fetch(`/api/audit/alerts?restaurantId=${restaurantId}&days=30`)
      const data = await response.json()
      setSecurityAlerts(data.alerts || [])
    } catch (error) {
      console.error('Error fetching security alerts:', error)
    }
  }

  const exportAuditLogs = async () => {
    try {
      const params = new URLSearchParams({ restaurantId, format: 'csv' })
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/audit/export?${params}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting audit logs:', error)
    }
  }

  const getSecurityLevelColor = (level: SecurityLevel) => {
    switch (level) {
      case 'LOW': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'CRITICAL': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionIcon = (action: AuditAction) => {
    switch (action) {
      case 'CREATE': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'UPDATE': return <Settings className="w-4 h-4 text-blue-600" />
      case 'DELETE': return <XCircle className="w-4 h-4 text-red-600" />
      case 'LOGIN': return <Users className="w-4 h-4 text-purple-600" />
      case 'LOGOUT': return <Users className="w-4 h-4 text-gray-600" />
      case 'VIEW': return <Eye className="w-4 h-4 text-blue-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-green-500'
      case 'MEDIUM': return 'bg-yellow-500'
      case 'HIGH': return 'bg-orange-500'
      case 'CRITICAL': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user?.name && log.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.staff?.name && log.staff.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesSearch
  })

  const gstRelevantLogs = filteredAuditLogs.filter(log => 
    log.entityType.includes('TAX') || 
    log.entityType.includes('INVOICE') || 
    log.entityType.includes('PAYMENT') ||
    log.changes?.includes('gst') ||
    log.changes?.includes('tax')
  )

  const securityRelevantLogs = filteredAuditLogs.filter(log => 
    log.securityLevel !== 'LOW' ||
    log.action === 'LOGIN' ||
    log.action === 'LOGOUT' ||
    log.entityType.includes('USER') ||
    log.entityType.includes('STAFF') ||
    log.entityType.includes('PERMISSION')
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Audit Trails & Compliance</h2>
          <p className="text-muted-foreground">
            Monitor system activity, security events, and GST compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportAuditLogs}>
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gst-compliance">GST Compliance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="all-logs">All Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Activities</p>
                    <p className="text-2xl font-bold">{auditLogs.length}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Security Alerts</p>
                    <p className="text-2xl font-bold">{securityAlerts.length}</p>
                  </div>
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">GST Events</p>
                    <p className="text-2xl font-bold">{gstRelevantLogs.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">High Risk Events</p>
                    <p className="text-2xl font-bold">
                      {auditLogs.filter(log => log.securityLevel === 'HIGH' || log.securityLevel === 'CRITICAL').length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Security Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Recent Security Alerts
              </CardTitle>
              <CardDescription>
                Monitor security events and potential threats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityAlerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`} />
                      <div>
                        <p className="font-medium">{alert.type}</p>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(alert.timestamp), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.resolved ? 'default' : 'destructive'}>
                        {alert.resolved ? 'Resolved' : 'Open'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {securityAlerts.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No security alerts found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gst-compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                GST Compliance Events
              </CardTitle>
              <CardDescription>
                Monitor GST-related activities for compliance and auditing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gstRelevantLogs.map((log) => (
                  <AuditLogCard key={log.id} log={log} />
                ))}
                {gstRelevantLogs.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No GST-related events found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Events
              </CardTitle>
              <CardDescription>
                Monitor security-related activities and potential threats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityRelevantLogs.map((log) => (
                  <AuditLogCard key={log.id} log={log} />
                ))}
                {securityRelevantLogs.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No security events found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-logs" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filters.action} onValueChange={(value) => setFilters(prev => ({ ...prev, action: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Actions</SelectItem>
                    <SelectItem value="CREATE">Create</SelectItem>
                    <SelectItem value="UPDATE">Update</SelectItem>
                    <SelectItem value="DELETE">Delete</SelectItem>
                    <SelectItem value="LOGIN">Login</SelectItem>
                    <SelectItem value="LOGOUT">Logout</SelectItem>
                    <SelectItem value="VIEW">View</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.entityType} onValueChange={(value) => setFilters(prev => ({ ...prev, entityType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Entity Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="ORDER">Order</SelectItem>
                    <SelectItem value="PAYMENT">Payment</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="INVOICE">Invoice</SelectItem>
                    <SelectItem value="TAX">Tax</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.securityLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, securityLevel: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Security Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  placeholder="Start Date"
                />

                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  placeholder="End Date"
                />
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Audit Logs</CardTitle>
              <CardDescription>
                Complete audit trail of all system activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAuditLogs.map((log) => (
                  <AuditLogCard key={log.id} log={log} />
                ))}
                {filteredAuditLogs.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No audit logs found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface AuditLogCardProps {
  log: AuditLog
}

function AuditLogCard({ log }: AuditLogCardProps) {
  const getSecurityLevelColor = (level: SecurityLevel) => {
    switch (level) {
      case 'LOW': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'CRITICAL': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionIcon = (action: AuditAction) => {
    switch (action) {
      case 'CREATE': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'UPDATE': return <Settings className="w-4 h-4 text-blue-600" />
      case 'DELETE': return <XCircle className="w-4 h-4 text-red-600" />
      case 'LOGIN': return <Users className="w-4 h-4 text-purple-600" />
      case 'LOGOUT': return <Users className="w-4 h-4 text-gray-600" />
      case 'VIEW': return <Eye className="w-4 h-4 text-blue-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const formatChanges = (changes: string) => {
    try {
      const parsed = JSON.parse(changes)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return changes
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              {getActionIcon(log.action)}
              <span className="font-semibold">{log.action}</span>
              <Badge variant="outline">{log.entityType}</Badge>
              <Badge className={getSecurityLevelColor(log.securityLevel)}>
                {log.securityLevel}
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Entity ID: {log.entityId}</p>
              <p>By: {log.user?.name || log.staff?.name || 'System'}</p>
              <p>IP: {log.ipAddress || 'Unknown'}</p>
              <p>Time: {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}</p>
            </div>

            {(log.changes || log.oldValues || log.newValues) && (
              <details className="text-sm">
                <summary className="cursor-pointer text-blue-600 hover:underline">
                  View Changes
                </summary>
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-32">
                  {log.changes && (
                    <div>
                      <strong>Changes:</strong>
                      <pre>{formatChanges(log.changes)}</pre>
                    </div>
                  )}
                  {log.oldValues && (
                    <div className="mt-2">
                      <strong>Old Values:</strong>
                      <pre>{formatChanges(log.oldValues)}</pre>
                    </div>
                  )}
                  {log.newValues && (
                    <div className="mt-2">
                      <strong>New Values:</strong>
                      <pre>{formatChanges(log.newValues)}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}