'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    if (/^#[0-9A-F]{6}$/i.test(newValue)) {
      onChange(newValue)
    }
  }

  const handleColorSelect = (color: string) => {
    setInputValue(color)
    onChange(color)
  }

  const presetColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#008000', '#000080',
    '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'
  ]

  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded border cursor-pointer"
              style={{ backgroundColor: value }}
            />
            <Input
              value={inputValue}
              onChange={handleInputChange}
              placeholder="#000000"
              className="w-24 font-mono text-xs"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-medium">Color Picker</Label>
              <Input
                type="color"
                value={value}
                onChange={(e) => {
                  const newValue = e.target.value
                  setInputValue(newValue)
                  onChange(newValue)
                }}
                className="w-full h-10 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Preset Colors</Label>
              <div className="grid grid-cols-5 gap-1 mt-1">
                {presetColors.map((color) => (
                  <Button
                    key={color}
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0 border"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium">Hex Value</Label>
              <Input
                value={inputValue}
                onChange={handleInputChange}
                placeholder="#000000"
                className="w-full font-mono text-xs mt-1"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}