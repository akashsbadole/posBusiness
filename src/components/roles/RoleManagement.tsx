'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Shield, Users, Key, Plus, Edit, Trash2 } from 'lucide-react'
import { RoleLevel, Module, PermissionAction } from '@prisma/client'

interface Permission {
  id: string
  name: string
  description?: string
  module: Module
  action: PermissionAction
  resource?: string
}

interface Role {
  id: string
  name: string
  description?: string
  level: RoleLevel
  isSystem: boolean
  isActive: boolean
  rolePermissions: {
    permission: Permission
  }[]
  _count: {
    staff: number
  }
}

interface RoleManagementProps {
  restaurantId: string
}

export default function RoleManagement({ restaurantId }: RoleManagementProps) {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    level: RoleLevel.STORE_STAFF,
    permissionIds: [] as string[]
  })

  useEffect(() => {
    fetchData()
  }, [restaurantId])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch roles
      const rolesResponse = await fetch(`/api/roles?restaurantId=${restaurantId}`)
      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json()
        setRoles(rolesData)
      }

      // Fetch permissions
      const permissionsResponse = await fetch(`/api/permissions?restaurantId=${restaurantId}`)
      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json()
        setPermissions(permissionsData.permissions)
        setGroupedPermissions(permissionsData.groupedPermissions)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRole = async () => {
    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newRole,
          restaurantId,
        }),
      })

      if (response.ok) {
        await fetchData()
        setIsCreateDialogOpen(false)
        setNewRole({
          name: '',
          description: '',
          level: RoleLevel.STORE_STAFF,
          permissionIds: [],
        })
      }
    } catch (error) {
      console.error('Error creating role:', error)
    }
  }

  const handleUpdateRole = async (roleId: string, updates: Partial<Role>) => {
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await fetchData()
        setIsEditDialogOpen(false)
      }
    } catch (error) {
      console.error('Error updating role:', error)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) {
      return
    }

    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error deleting role:', error)
    }
  }

  const getRoleLevelColor = (level: RoleLevel) => {
    switch (level) {
      case RoleLevel.SUPER_ADMIN:
        return 'bg-red-100 text-red-800'
      case RoleLevel.STORE_ADMIN:
        return 'bg-blue-100 text-blue-800'
      case RoleLevel.STORE_STAFF:
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getModuleIcon = (module: Module) => {
    switch (module) {
      case Module.DASHBOARD:
        return '📊'
      case Module.ORDERS:
        return '📋'
      case Module.MENU:
        return '🍽️'
      case Module.INVENTORY:
        return '📦'
      case Module.CUSTOMERS:
        return '👥'
      case Module.STAFF:
        return '👔'
      case Module.REPORTS:
        return '📈'
      case Module.SETTINGS:
        return '⚙️'
      case Module.PAYMENTS:
        return '💳'
      case Module.TABLES:
        return '🪑'
      case Module.OUTLETS:
        return '🏪'
      case Module.SUBSCRIPTIONS:
        return '📅'
      case Module.AUDIT_LOGS:
        return '🔍'
      case Module.AI_SUGGESTIONS:
        return '🤖'
      case Module.DISCOUNTS:
        return '🏷️'
      case Module.LOYALTY:
        return '⭐'
      default:
        return '📄'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Role Management</h2>
          <p className="text-muted-foreground">
            Manage roles and permissions for your restaurant staff
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Create a new role with specific permissions for your restaurant staff.
              </DialogDescription>
            </DialogHeader>
            <RoleForm
              role={newRole}
              groupedPermissions={groupedPermissions}
              onChange={setNewRole}
              onSave={handleCreateRole}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getRoleLevelColor(role.level)}>
                    {role.level.replace('_', ' ')}
                  </Badge>
                  {role.isSystem && (
                    <Badge variant="secondary">System</Badge>
                  )}
                </div>
              </div>
              {role.description && (
                <CardDescription>{role.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{role._count.staff} staff members</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Key className="h-4 w-4" />
                    <span>{role.rolePermissions.length} permissions</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <Switch
                    checked={role.isActive}
                    onCheckedChange={(checked) => 
                      handleUpdateRole(role.id, { isActive: checked })
                    }
                    disabled={role.isSystem}
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <Dialog open={isEditDialogOpen && selectedRole?.id === role.id} onOpenChange={(open) => {
                    setIsEditDialogOpen(open)
                    if (open) setSelectedRole(role)
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        disabled={role.isSystem}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Role: {role.name}</DialogTitle>
                        <DialogDescription>
                          Update role details and permissions.
                        </DialogDescription>
                      </DialogHeader>
                      {selectedRole && (
                        <RoleForm
                          role={{
                            name: selectedRole.name,
                            description: selectedRole.description || '',
                            level: selectedRole.level,
                            permissionIds: selectedRole.rolePermissions.map(rp => rp.permission.id)
                          }}
                          groupedPermissions={groupedPermissions}
                          onChange={(updated) => {
                            setSelectedRole(prev => prev ? { ...prev, ...updated } : null)
                          }}
                          onSave={() => {
                            if (selectedRole) {
                              handleUpdateRole(selectedRole.id, {
                                name: selectedRole.name,
                                description: selectedRole.description,
                                level: selectedRole.level,
                              })
                            }
                          }}
                          onCancel={() => setIsEditDialogOpen(false)}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteRole(role.id)}
                    disabled={role.isSystem || role._count.staff > 0}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

interface RoleFormProps {
  role: {
    name: string
    description: string
    level: RoleLevel
    permissionIds: string[]
  }
  groupedPermissions: Record<string, Permission[]>
  onChange: (role: any) => void
  onSave: () => void
  onCancel: () => void
}

function RoleForm({ role, groupedPermissions, onChange, onSave, onCancel }: RoleFormProps) {
  const handlePermissionToggle = (permissionId: string) => {
    const newPermissionIds = role.permissionIds.includes(permissionId)
      ? role.permissionIds.filter(id => id !== permissionId)
      : [...role.permissionIds, permissionId]
    
    onChange({ ...role, permissionIds: newPermissionIds })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div>
          <label className="text-sm font-medium">Role Name</label>
          <input
            type="text"
            value={role.name}
            onChange={(e) => onChange({ ...role, name: e.target.value })}
            className="w-full mt-1 px-3 py-2 border border-input rounded-md"
            placeholder="Enter role name"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={role.description}
            onChange={(e) => onChange({ ...role, description: e.target.value })}
            className="w-full mt-1 px-3 py-2 border border-input rounded-md"
            placeholder="Enter role description"
            rows={3}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Role Level</label>
          <select
            value={role.level}
            onChange={(e) => onChange({ ...role, level: e.target.value as RoleLevel })}
            className="w-full mt-1 px-3 py-2 border border-input rounded-md"
          >
            <option value={RoleLevel.STORE_STAFF}>Store Staff</option>
            <option value={RoleLevel.STORE_ADMIN}>Store Admin</option>
            <option value={RoleLevel.SUPER_ADMIN}>Super Admin</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-3 block">Permissions</label>
        <ScrollArea className="h-96 border rounded-md p-4">
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([module, permissions]) => (
              <div key={module} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getModuleIcon(module as Module)}</span>
                  <h4 className="font-semibold">{module.replace('_', ' ')}</h4>
                </div>
                <div className="grid gap-2 pl-8">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={permission.id}
                        checked={role.permissionIds.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        className="rounded"
                      />
                      <label htmlFor={permission.id} className="text-sm cursor-pointer">
                        {permission.action.replace('_', ' ').toLowerCase()} - {permission.description}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={!role.name.trim()}>
          Save Role
        </Button>
      </div>
    </div>
  )
}