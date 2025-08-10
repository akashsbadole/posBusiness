"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  QrCode, 
  Copy, 
  Download,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'
import { TwoFactorService } from '@/lib/2fa-service'
import { useToast } from '@/hooks/use-toast'

interface TwoFactorSettings {
  id: string
  userId: string
  method: 'SMS' | 'TOTP' | 'EMAIL' | 'NONE'
  phoneNumber?: string
  email?: string
  secret?: string
  backupCodes?: string[]
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export default function TwoFactorManagement() {
  const [settings, setSettings] = useState<TwoFactorSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSetupDialogOpen, setIsSetupDialogOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<'SMS' | 'TOTP' | 'EMAIL'>('SMS')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [smsOTP, setSMSOTP] = useState('')
  const [emailOTP, setEmailOTP] = useState('')
  const [totpToken, setTOTPToken] = useState('')
  const [totpSecret, setTOTPSecret] = useState('')
  const [qrCodeUrl, setQRCodeUrl] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [verificationStep, setVerificationStep] = useState<'setup' | 'verify'>('setup')
  const [generatedOTP, setGeneratedOTP] = useState('')

  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      // In a real app, get user ID from auth context
      const userId = 'demo_user_id'
      const userSettings = await TwoFactorService.getUser2FASettings(userId)
      setSettings(userSettings)
    } catch (error) {
      console.error('Error loading 2FA settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const setupSMS2FA = async () => {
    try {
      const otp = await TwoFactorService.generateAndSendSMSOTP(phoneNumber)
      setGeneratedOTP(otp)
      setVerificationStep('verify')
      toast({
        title: "SMS Sent",
        description: "Verification code sent to your phone number",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send SMS verification code",
        variant: "destructive"
      })
    }
  }

  const setupEmail2FA = async () => {
    try {
      const otp = TwoFactorService.generateEmailOTP()
      await TwoFactorService.sendEmailOTP(email, otp)
      setGeneratedOTP(otp)
      setVerificationStep('verify')
      toast({
        title: "Email Sent",
        description: "Verification code sent to your email address",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email verification code",
        variant: "destructive"
      })
    }
  }

  const setupTOTP2FA = async () => {
    try {
      const userId = 'demo_user_id'
      const { secret, qrCodeUrl } = await TwoFactorService.generateTOTPSecret(userId, email || 'user@example.com')
      setTOTPSecret(secret)
      setQRCodeUrl(qrCodeUrl)
      setVerificationStep('verify')
      toast({
        title: "TOTP Setup Ready",
        description: "Scan the QR code with your authenticator app",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate TOTP setup",
        variant: "destructive"
      })
    }
  }

  const verifySMSOTP = async () => {
    if (smsOTP === generatedOTP) {
      await save2FASettings('SMS', { phoneNumber })
      toast({
        title: "Success",
        description: "SMS 2FA enabled successfully",
      })
      setIsSetupDialogOpen(false)
      resetSetup()
    } else {
      toast({
        title: "Error",
        description: "Invalid verification code",
        variant: "destructive"
      })
    }
  }

  const verifyEmailOTP = async () => {
    if (emailOTP === generatedOTP) {
      await save2FASettings('EMAIL', { email })
      toast({
        title: "Success",
        description: "Email 2FA enabled successfully",
      })
      setIsSetupDialogOpen(false)
      resetSetup()
    } else {
      toast({
        title: "Error",
        description: "Invalid verification code",
        variant: "destructive"
      })
    }
  }

  const verifyTOTP = async () => {
    if (TwoFactorService.verifyTOTPToken(totpToken, totpSecret)) {
      const newBackupCodes = TwoFactorService.generateBackupCodes()
      setBackupCodes(newBackupCodes)
      await save2FASettings('TOTP', { secret: totpSecret, backupCodes: newBackupCodes })
      toast({
        title: "Success",
        description: "TOTP 2FA enabled successfully",
      })
      setIsSetupDialogOpen(false)
      resetSetup()
    } else {
      toast({
        title: "Error",
        description: "Invalid TOTP token",
        variant: "destructive"
      })
    }
  }

  const save2FASettings = async (method: 'SMS' | 'TOTP' | 'EMAIL', additionalData: any) => {
    try {
      const userId = 'demo_user_id'
      const updatedSettings = await TwoFactorService.updateUser2FASettings(userId, {
        method,
        isEnabled: true,
        ...additionalData
      })
      setSettings(updatedSettings)
    } catch (error) {
      console.error('Error saving 2FA settings:', error)
    }
  }

  const disable2FA = async () => {
    try {
      const userId = 'demo_user_id'
      const updatedSettings = await TwoFactorService.updateUser2FASettings(userId, {
        method: 'NONE',
        isEnabled: false,
        phoneNumber: undefined,
        email: undefined,
        secret: undefined,
        backupCodes: undefined
      })
      setSettings(updatedSettings)
      toast({
        title: "Success",
        description: "2FA disabled successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable 2FA",
        variant: "destructive"
      })
    }
  }

  const resetSetup = () => {
    setVerificationStep('setup')
    setPhoneNumber('')
    setEmail('')
    setSMSOTP('')
    setEmailOTP('')
    setTOTPToken('')
    setTOTPSecret('')
    setQRCodeUrl('')
    setBackupCodes([])
    setShowBackupCodes(false)
    setGeneratedOTP('')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    })
  }

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Two-Factor Authentication
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Add an extra layer of security to your account
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              SMS Authentication
            </CardTitle>
            <CardDescription>
              Receive verification codes via SMS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge variant={settings?.method === 'SMS' ? 'default' : 'secondary'}>
                  {settings?.method === 'SMS' ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              {settings?.method === 'SMS' && (
                <div className="text-sm text-muted-foreground">
                  Phone: {settings.phoneNumber}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Authentication
            </CardTitle>
            <CardDescription>
              Receive verification codes via email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge variant={settings?.method === 'EMAIL' ? 'default' : 'secondary'}>
                  {settings?.method === 'EMAIL' ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              {settings?.method === 'EMAIL' && (
                <div className="text-sm text-muted-foreground">
                  Email: {settings.email}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Authenticator App
            </CardTitle>
            <CardDescription>
              Use Google/Microsoft Authenticator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge variant={settings?.method === 'TOTP' ? 'default' : 'secondary'}>
                  {settings?.method === 'TOTP' ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              {settings?.method === 'TOTP' && settings.backupCodes && (
                <div className="text-sm text-muted-foreground">
                  {settings.backupCodes.length} backup codes available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                {settings?.isEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">
                  {settings?.isEnabled ? '2FA is Enabled' : '2FA is Disabled'}
                </span>
              </div>
              {settings?.isEnabled && (
                <p className="text-sm text-muted-foreground mt-1">
                  Method: {settings.method} • {settings.backupCodes?.length || 0} backup codes available
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {settings?.isEnabled ? (
                <Button variant="destructive" onClick={disable2FA}>
                  Disable 2FA
                </Button>
              ) : (
                <Dialog open={isSetupDialogOpen} onOpenChange={setIsSetupDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Enable 2FA</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
                      <DialogDescription>
                        Choose your preferred 2FA method
                      </DialogDescription>
                    </DialogHeader>
                    
                    {verificationStep === 'setup' && (
                      <div className="space-y-4">
                        <Select value={selectedMethod} onValueChange={(value: any) => setSelectedMethod(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select 2FA method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SMS">
                              <div className="flex items-center gap-2">
                                <Smartphone className="h-4 w-4" />
                                SMS Verification
                              </div>
                            </SelectItem>
                            <SelectItem value="EMAIL">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email Verification
                              </div>
                            </SelectItem>
                            <SelectItem value="TOTP">
                              <div className="flex items-center gap-2">
                                <QrCode className="h-4 w-4" />
                                Authenticator App
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        {selectedMethod === 'SMS' && (
                          <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                              id="phoneNumber"
                              type="tel"
                              placeholder="+1234567890"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                          </div>
                        )}

                        {selectedMethod === 'EMAIL' && (
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="user@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                        )}

                        {selectedMethod === 'TOTP' && (
                          <div className="space-y-2">
                            <Label htmlFor="totpEmail">Email Address (for setup)</Label>
                            <Input
                              id="totpEmail"
                              type="email"
                              placeholder="user@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                        )}

                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsSetupDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => {
                              if (selectedMethod === 'SMS') setupSMS2FA()
                              else if (selectedMethod === 'EMAIL') setupEmail2FA()
                              else if (selectedMethod === 'TOTP') setupTOTP2FA()
                            }}
                            disabled={
                              (selectedMethod === 'SMS' && !phoneNumber) ||
                              (selectedMethod === 'EMAIL' && !email) ||
                              (selectedMethod === 'TOTP' && !email)
                            }
                          >
                            Continue
                          </Button>
                        </DialogFooter>
                      </div>
                    )}

                    {verificationStep === 'verify' && (
                      <div className="space-y-4">
                        {selectedMethod === 'SMS' && (
                          <div className="space-y-2">
                            <Label htmlFor="smsOTP">Enter SMS Verification Code</Label>
                            <Input
                              id="smsOTP"
                              placeholder="Enter 6-digit code"
                              value={smsOTP}
                              onChange={(e) => setSMSOTP(e.target.value)}
                              maxLength={6}
                            />
                            <p className="text-sm text-muted-foreground">
                              Demo code: {generatedOTP}
                            </p>
                          </div>
                        )}

                        {selectedMethod === 'EMAIL' && (
                          <div className="space-y-2">
                            <Label htmlFor="emailOTP">Enter Email Verification Code</Label>
                            <Input
                              id="emailOTP"
                              placeholder="Enter 6-digit code"
                              value={emailOTP}
                              onChange={(e) => setEmailOTP(e.target.value)}
                              maxLength={6}
                            />
                            <p className="text-sm text-muted-foreground">
                              Demo code: {generatedOTP}
                            </p>
                          </div>
                        )}

                        {selectedMethod === 'TOTP' && (
                          <div className="space-y-4">
                            <div className="text-center">
                              <img src={qrCodeUrl} alt="TOTP QR Code" className="mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Scan this QR code with your authenticator app
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="totpToken">Enter TOTP Token</Label>
                              <Input
                                id="totpToken"
                                placeholder="Enter 6-digit code"
                                value={totpToken}
                                onChange={(e) => setTOTPToken(e.target.value)}
                                maxLength={6}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Manual Entry Key</Label>
                              <div className="flex gap-2">
                                <Input value={totpSecret} readOnly />
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => copyToClipboard(totpSecret)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        <DialogFooter>
                          <Button variant="outline" onClick={() => setVerificationStep('setup')}>
                            Back
                          </Button>
                          <Button 
                            onClick={() => {
                              if (selectedMethod === 'SMS') verifySMSOTP()
                              else if (selectedMethod === 'EMAIL') verifyEmailOTP()
                              else if (selectedMethod === 'TOTP') verifyTOTP()
                            }}
                            disabled={
                              (selectedMethod === 'SMS' && !smsOTP) ||
                              (selectedMethod === 'EMAIL' && !emailOTP) ||
                              (selectedMethod === 'TOTP' && !totpToken)
                            }
                          >
                            Verify & Enable
                          </Button>
                        </DialogFooter>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {settings?.isEnabled && settings.backupCodes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Backup Codes
            </CardTitle>
            <CardDescription>
              Save these backup codes in a safe place. You can use them to access your account if you lose your 2FA device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowBackupCodes(!showBackupCodes)}
                >
                  {showBackupCodes ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                  {showBackupCodes ? 'Hide Codes' : 'Show Codes'}
                </Button>
                <Button variant="outline" onClick={downloadBackupCodes}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              
              {showBackupCodes && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {settings.backupCodes.map((code, index) => (
                    <div key={index} className="p-2 bg-muted rounded text-sm font-mono">
                      {code}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}