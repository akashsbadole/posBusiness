"use client"

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GripVertical, Eye, EyeOff, Asterisk, Trash2 } from 'lucide-react'

interface POSField {
  id: string
  name: string
  label: string
  type: 'text' | 'number' | 'email' | 'phone' | 'date' | 'time' | 'select' | 'textarea' | 'checkbox'
  required: boolean
  visible: boolean
  order: number
  placeholder?: string
  options?: string[]
  businessTypes: string[]
  icon?: React.ReactNode
}

interface SortableFieldProps {
  field: POSField
  onToggleVisibility: (fieldId: string) => void
  onToggleRequired: (fieldId: string) => void
  onRemove: (fieldId: string) => void
}

export function SortableField({ field, onToggleVisibility, onToggleRequired, onRemove }: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getFieldTypeColor = (type: string) => {
    const colors = {
      text: 'bg-blue-100 text-blue-800',
      number: 'bg-green-100 text-green-800',
      email: 'bg-purple-100 text-purple-800',
      phone: 'bg-orange-100 text-orange-800',
      date: 'bg-pink-100 text-pink-800',
      time: 'bg-indigo-100 text-indigo-800',
      select: 'bg-yellow-100 text-yellow-800',
      textarea: 'bg-gray-100 text-gray-800',
      checkbox: 'bg-teal-100 text-teal-800',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-all duration-200 ${
        isDragging ? 'opacity-50 shadow-lg scale-105' : 'opacity-100'
      } ${!field.visible ? 'opacity-60' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
            >
              <GripVertical className="h-5 w-5" />
            </div>
            
            <div className="flex items-center gap-2 flex-1">
              {field.icon}
              <div>
                <h4 className="font-medium text-sm">{field.label}</h4>
                <p className="text-xs text-muted-foreground">{field.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={getFieldTypeColor(field.type)}>
                {field.type}
              </Badge>
              
              {field.required && (
                <Badge variant="destructive" className="text-xs">
                  <Asterisk className="h-3 w-3 mr-1" />
                  Required
                </Badge>
              )}
              
              {field.businessTypes.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {field.businessTypes.includes('all') ? 'All' : field.businessTypes.length}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleVisibility(field.id)}
              className="h-8 w-8 p-0"
            >
              {field.visible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleRequired(field.id)}
              className={`h-8 w-8 p-0 ${field.required ? 'text-red-600' : 'text-gray-400'}`}
            >
              <Asterisk className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(field.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {field.placeholder && (
          <p className="text-xs text-muted-foreground mt-2 ml-8">
            Placeholder: {field.placeholder}
          </p>
        )}
        
        {field.options && field.options.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1 ml-8">
            Options: {field.options.join(', ')}
          </p>
        )}
      </CardContent>
    </Card>
  )
}