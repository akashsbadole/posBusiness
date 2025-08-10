'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Smartphone, 
  Monitor, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  X
} from 'lucide-react'
import { useOffline } from '@/contexts/OfflineContext'

interface PWAInstallerProps {
  className?: string
}

export default function PWAInstaller({ className }: PWAInstallerProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const { isOnline, isOffline } = useOffline()

  useEffect(() => {
    // Check if the app is running in standalone mode (PWA)
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
    
    // Check if it's iOS
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream)

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
      
      // Show install prompt after a delay
      setTimeout(() => {
        setShowInstallPrompt(true)
      }, 5000)
    }

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setIsInstallable(false)
      }
      
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    } catch (error) {
      console.error('Error installing PWA:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  // Don't show if already installed or in standalone mode
  if (isInstalled || isStandalone) {
    return null
  }

  // iOS install instructions
  if (isIOS) {
    return (
      <Card className={`${className} mb-4`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="h-5 w-5" />
            Install App
          </CardTitle>
          <CardDescription className="text-sm">
            Install this app on your iOS device
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">To install this app:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Tap the share button <span className="inline-block w-4 h-4 bg-gray-200 rounded text-center leading-4">↑</span> in Safari</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" in the top right corner</li>
              </ol>
            </div>
            <Button 
              onClick={handleDismiss} 
              variant="outline" 
              size="sm" 
              className="w-full"
            >
              Got it
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Install prompt for Android/Desktop
  if (showInstallPrompt && isInstallable) {
    return (
      <Card className={`${className} mb-4 border-blue-200 bg-blue-50`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Download className="h-5 w-5" />
                Install App
              </CardTitle>
              <CardDescription className="text-sm">
                Install this app for better experience and offline support
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button onClick={handleInstall} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Install
            </Button>
            <Button variant="outline" onClick={handleDismiss}>
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Connection status indicator
  if (isOffline) {
    return (
      <Card className={`${className} mb-4 border-orange-200 bg-orange-50`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Offline Mode
          </CardTitle>
          <CardDescription className="text-sm">
            You're currently offline. Some features may be limited.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-orange-600 border-orange-300">
                Offline
              </Badge>
              <span className="text-sm text-muted-foreground">
                Changes will sync when online
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Online status indicator
  if (isOnline) {
    return (
      <Card className={`${className} mb-4 border-green-200 bg-green-50`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Online Mode
          </CardTitle>
          <CardDescription className="text-sm">
            All features are available. App is ready to use.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600 border-green-300">
              Online
            </Badge>
            {isInstallable && !showInstallPrompt && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowInstallPrompt(true)}
              >
                <Download className="mr-2 h-4 w-4" />
                Install App
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}