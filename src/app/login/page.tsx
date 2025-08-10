'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  Shield,
  Smartphone,
  QrCode,
  Key,
  RefreshCw,
  Copy,
  ArrowRight
} from 'lucide-react'
import { TwoFactorService } from '@/lib/2fa-service'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('login')
  const [registrationDisabled, setRegistrationDisabled] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // 2FA states
  const [show2FADialog, setShow2FADialog] = useState(false)
  const [twoFactorMethod, setTwoFactorMethod] = useState<'SMS' | 'EMAIL' | 'TOTP'>('SMS')
  const [twoFactorStep, setTwoFactorStep] = useState<'select' | 'setup' | 'verify'>('select')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [generatedOTP, setGeneratedOTP] = useState('')
  const [totpSecret, setTotpSecret] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  // Demo accounts - updated to match actual database accounts
  const demoAccounts = [
    {
      email: 'admin@posbiz.com',
      password: 'admin123',
      role: 'Super Admin',
      description: 'Full system access with all permissions',
      badge: 'ADMIN',
      color: 'bg-red-50 border-red-200 text-red-800'
    },
    {
      email: 'manager@restaurant.com',
      password: 'manager123',
      role: 'Restaurant Manager',
      description: 'Manage restaurant operations and staff',
      badge: 'MANAGER',
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      email: 'staff@restaurant.com',
      password: 'staff123',
      role: 'Staff Member',
      description: 'Daily operations and order management',
      badge: 'STAFF',
      color: 'bg-green-50 border-green-200 text-green-800'
    },
    {
      email: 'demo@posbiz.com',
      password: 'demo123',
      role: 'Demo Account',
      description: 'Testing and exploration access',
      badge: 'DEMO',
      color: 'bg-purple-50 border-purple-200 text-purple-800'
    }
  ]

  // Business type demo accounts (from comprehensive seed)
  const businessDemoAccounts = [
    {
      email: 'info-owner@spicegarden.com',
      password: 'owner123',
      role: 'Restaurant Owner',
      description: 'Spice Garden Restaurant - Full access',
      badge: 'RESTAURANT',
      color: 'bg-orange-50 border-orange-200 text-orange-800'
    },
    {
      email: 'info-owner@techhub.com',
      password: 'owner123',
      role: 'Retail Owner',
      description: 'TechHub Electronics - Full access',
      badge: 'RETAIL',
      color: 'bg-cyan-50 border-cyan-200 text-cyan-800'
    },
    {
      email: 'info-owner@brewandbeans.com',
      password: 'owner123',
      role: 'Cafe Owner',
      description: 'Brew & Beans Cafe - Full access',
      badge: 'CAFE',
      color: 'bg-amber-50 border-amber-200 text-amber-800'
    },
    {
      email: 'info-owner@grandpalace.com',
      password: 'owner123',
      role: 'Hotel Owner',
      description: 'Grand Palace Hotel - Full access',
      badge: 'HOTEL',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-800'
    }
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Check if 2FA is enabled for this user
      if (data.requires2FA) {
        setShow2FADialog(true)
        setIsLoading(false)
        return
      }

      // Store token
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      setSuccess('Login successful! Redirecting...')
      setTimeout(() => {
        router.push('/')
      }, 1500)

    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = (email: string, password: string) => {
    setLoginForm({ email, password, rememberMe: false })
    setTimeout(() => {
      const form = document.querySelector('form') as HTMLFormElement
      if (form) form.requestSubmit()
    }, 100)
  }

  const setup2FA = async () => {
    try {
      if (twoFactorMethod === 'SMS') {
        const otp = await TwoFactorService.generateAndSendSMSOTP(phoneNumber)
        setGeneratedOTP(otp)
      } else if (twoFactorMethod === 'EMAIL') {
        const otp = TwoFactorService.generateEmailOTP()
        await TwoFactorService.sendEmailOTP(email, otp)
        setGeneratedOTP(otp)
      } else if (twoFactorMethod === 'TOTP') {
        const { secret, qrCodeUrl } = await TwoFactorService.generateTOTPSecret('user', email || 'user@example.com')
        setTotpSecret(secret)
        setQrCodeUrl(qrCodeUrl)
      }
      setTwoFactorStep('verify')
    } catch (error) {
      setError('Failed to setup 2FA method')
    }
  }

  const verify2FA = async () => {
    try {
      let isValid = false
      
      if (twoFactorMethod === 'SMS' || twoFactorMethod === 'EMAIL') {
        isValid = otpCode === generatedOTP
      } else if (twoFactorMethod === 'TOTP') {
        isValid = TwoFactorService.verifyTOTPToken(otpCode, totpSecret)
        if (isValid) {
          const newBackupCodes = TwoFactorService.generateBackupCodes()
          setBackupCodes(newBackupCodes)
        }
      }

      if (isValid) {
        // Complete login process
        setShow2FADialog(false)
        setSuccess('2FA verification successful! Redirecting...')
        setTimeout(() => {
          router.push('/')
        }, 1500)
      } else {
        setError('Invalid verification code')
      }
    } catch (error) {
      setError('2FA verification failed')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('Copied to clipboard!')
    setTimeout(() => setSuccess(''), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Split Layout */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Branding and Info */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
          <div className="relative z-10 text-center text-white max-w-2xl">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                POSBiz
              </h1>
              <p className="text-xl lg:text-2xl text-blue-100 mb-8">
                Next-Generation Business Management System
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Enterprise Security</h3>
                <p className="text-blue-100 text-sm">
                  Advanced 2FA, role-based access, and end-to-end encryption
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Mobile-First</h3>
                <p className="text-blue-100 text-sm">
                  Responsive design with mobile app integration and offline support
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">POS Customization</h3>
                <p className="text-blue-100 text-sm">
                  Drag-and-drop interface customization for any business type
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                  <Key className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Multi-Platform</h3>
                <p className="text-blue-100 text-sm">
                  Support for restaurants, retail, healthcare, and service businesses
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-blue-200 mb-4">
                Trusted by businesses worldwide
              </p>
              <div className="flex justify-center space-x-8 text-blue-300">
                <div className="text-center">
                  <div className="text-2xl font-bold">13+</div>
                  <div className="text-sm">Business Types</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">99.9%</div>
                  <div className="text-sm">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white">
          <div className="w-full max-w-md">
            {/* Logo for mobile */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">POSBiz</h1>
              <p className="text-gray-600">Business Management System</p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            {/* Login Card */}
            <Card className="shadow-xl border-0">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
                <CardDescription className="text-gray-600">
                  Sign in to your account to continue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className="pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={loginForm.rememberMe}
                        onCheckedChange={(checked) => setLoginForm({...loginForm, rememberMe: !!checked})}
                      />
                      <Label htmlFor="remember" className="text-sm text-gray-600">Remember me</Label>
                    </div>
                    <Button variant="link" className="text-sm p-0 h-auto text-blue-600 hover:text-blue-700">
                      Forgot password?
                    </Button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Demo Accounts */}
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-sm text-gray-500">Or try with demo accounts:</span>
                  </div>
                  
                  {/* Basic Demo Accounts */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Basic Demo Accounts</h4>
                    {demoAccounts.map((account, index) => (
                      <div 
                        key={index}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${account.color}`}
                        onClick={() => handleQuickLogin(account.email, account.password)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="font-medium">{account.role}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {account.badge}
                          </Badge>
                        </div>
                        <p className="text-xs opacity-90 mb-2">{account.description}</p>
                        <div className="text-xs opacity-75">
                          <strong>Email:</strong> {account.email} • <strong>Pass:</strong> {account.password}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Business Type Demo Accounts */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Business Type Demo Accounts</h4>
                    {businessDemoAccounts.map((account, index) => (
                      <div 
                        key={`business-${index}`}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${account.color}`}
                        onClick={() => handleQuickLogin(account.email, account.password)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            <span className="font-medium">{account.role}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {account.badge}
                          </Badge>
                        </div>
                        <p className="text-xs opacity-90 mb-2">{account.description}</p>
                        <div className="text-xs opacity-75">
                          <strong>Email:</strong> {account.email} • <strong>Pass:</strong> {account.password}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      13+ business types available • All accounts use same password format
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Links */}
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                Don't have an account?{' '}
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Contact Sales
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Verification Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Verify your identity with a second factor of authentication
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {twoFactorStep === 'select' && (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setTwoFactorMethod('SMS')
                    setTwoFactorStep('setup')
                  }}
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  SMS Verification
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setTwoFactorMethod('EMAIL')
                    setTwoFactorStep('setup')
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email Verification
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setTwoFactorMethod('TOTP')
                    setTwoFactorStep('setup')
                  }}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Authenticator App
                </Button>
              </div>
            )}

            {twoFactorStep === 'setup' && (
              <div className="space-y-4">
                {twoFactorMethod === 'SMS' && (
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      placeholder="+1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                )}

                {twoFactorMethod === 'EMAIL' && (
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                )}

                {twoFactorMethod === 'TOTP' && (
                  <div className="space-y-2">
                    <Label>Email Address (for setup)</Label>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setTwoFactorStep('select')}>
                    Back
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={setup2FA}
                    disabled={
                      (twoFactorMethod === 'SMS' && !phoneNumber) ||
                      (twoFactorMethod === 'EMAIL' && !email) ||
                      (twoFactorMethod === 'TOTP' && !email)
                    }
                  >
                    Send Code
                  </Button>
                </div>
              </div>
            )}

            {twoFactorStep === 'verify' && (
              <div className="space-y-4">
                {twoFactorMethod === 'TOTP' && qrCodeUrl && (
                  <div className="text-center">
                    <img src={qrCodeUrl} alt="TOTP QR Code" className="mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Scan with your authenticator app
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Verification Code</Label>
                  <Input
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                  />
                  {generatedOTP && (
                    <p className="text-sm text-muted-foreground">
                      Demo code: {generatedOTP}
                    </p>
                  )}
                </div>

                {twoFactorMethod === 'TOTP' && totpSecret && (
                  <div className="space-y-2">
                    <Label>Manual Entry Key</Label>
                    <div className="flex gap-2">
                      <Input value={totpSecret} readOnly className="font-mono text-xs" />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(totpSecret)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setTwoFactorStep('setup')}>
                    Back
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={verify2FA}
                    disabled={!otpCode}
                  >
                    Verify & Login
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}