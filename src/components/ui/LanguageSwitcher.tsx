'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Globe, Check } from 'lucide-react'
import { useI18n, SUPPORTED_LANGUAGES } from '@/lib/i18n/context'

export default function LanguageSwitcher() {
  const { language, setLanguage, supportedLanguages } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode)
    setIsOpen(false)
  }

  const currentLanguage = supportedLanguages.find(lang => lang.code === language)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentLanguage?.flag} {currentLanguage?.nativeName}
          </span>
          <span className="sm:hidden">
            {currentLanguage?.flag}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="end">
        <div className="p-2">
          <div className="text-sm font-medium text-gray-900 mb-2">
            భాష ఎంచుకోండి / Choose Language
          </div>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {supportedLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                    {language === lang.code && (
                      <Check className="h-4 w-4 ml-auto" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="border-t p-2">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="font-medium">Supported Languages:</div>
            <div className="grid grid-cols-2 gap-1">
              {supportedLanguages.map((lang) => (
                <div key={lang.code} className="flex items-center gap-1 text-xs">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Compact version for mobile or tight spaces
export function CompactLanguageSwitcher() {
  const { language, setLanguage, supportedLanguages } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = supportedLanguages.find(lang => lang.code === language)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2">
          <Globe className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0" align="end">
        <div className="p-2">
          <div className="text-sm font-medium text-gray-900 mb-2">
            Select Language
          </div>
          <div className="space-y-1">
            {supportedLanguages.map((lang) => (
              <Button
                key={lang.code}
                variant={language === lang.code ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => {
                  setLanguage(lang.code)
                  setIsOpen(false)
                }}
              >
                <span>{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}