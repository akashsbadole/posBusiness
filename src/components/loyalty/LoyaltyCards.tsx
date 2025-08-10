'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { 
  CreditCard, 
  Barcode, 
  QrCode, 
  Users, 
  Gift, 
  Star,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  Smartphone,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Award,
  Crown
} from 'lucide-react'
import { format } from 'date-fns'

interface LoyaltyTier {
  id: string
  name: string
  description: string
  pointsRequired: number
  discountPercentage: number
  benefits: string[]
  color: string
  icon: string
}

interface LoyaltyProgram {
  id: string
  name: string
  description: string
  isActive: boolean
  pointsPerCurrency: number
  pointsExpiryDays: number
  tiers: LoyaltyTier[]
  createdAt: Date
  updatedAt: Date
}

interface LoyaltyCard {
  id: string
  cardNumber: string
  barcode: string
  qrCode: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  programId: string
  programName: string
  currentTier: string
  points: number
  lifetimePoints: number
  totalSpent: number
  joinDate: Date
  lastActivity: Date
  status: 'active' | 'inactive' | 'expired'
  notes?: string
}

interface LoyaltyTransaction {
  id: string
  cardId: string
  cardNumber: string
  customerName: string
  type: 'earned' | 'redeemed' | 'adjusted' | 'expired'
  points: number
  description: string
  orderId?: string
  amount?: number
  createdAt: Date
  balance: number
}

interface Reward {
  id: string
  name: string
  description: string
  pointsRequired: number
  type: 'discount' | 'free_item' | 'cashback' | 'experience'
  value: number
  isActive: boolean
  expiryDate?: Date
  usageLimit?: number
  timesUsed: number
}

export default function LoyaltyCards() {
  const [activeTab, setActiveTab] = useState('cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProgram, setSelectedProgram] = useState('')
  const [selectedTier, setSelectedTier] = useState('')
  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false)
  const [isScanMode, setIsScanMode] = useState(false)
  const [cards, setCards] = useState<LoyaltyCard[]>([])
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([])
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [newCard, setNewCard] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    programId: '',
    notes: ''
  })

  // Initialize mock data
  useEffect(() => {
    const mockTiers: LoyaltyTier[] = [
      {
        id: '1',
        name: 'Bronze',
        description: 'Entry level membership',
        pointsRequired: 0,
        discountPercentage: 0,
        benefits: ['Birthday discount', 'Early access to sales'],
        color: '#CD7F32',
        icon: '🥉'
      },
      {
        id: '2',
        name: 'Silver',
        description: 'Regular customer benefits',
        pointsRequired: 500,
        discountPercentage: 5,
        benefits: ['5% discount on all purchases', 'Free shipping', 'Exclusive offers'],
        color: '#C0C0C0',
        icon: '🥈'
      },
      {
        id: '3',
        name: 'Gold',
        description: 'Premium membership',
        pointsRequired: 1500,
        discountPercentage: 10,
        benefits: ['10% discount', 'Priority support', 'Exclusive events', 'Free gift on birthday'],
        color: '#FFD700',
        icon: '🥇'
      },
      {
        id: '4',
        name: 'Platinum',
        description: 'Elite membership',
        pointsRequired: 5000,
        discountPercentage: 15,
        benefits: ['15% discount', 'Personal shopper', 'VIP events', 'Free returns'],
        color: '#E5E4E2',
        icon: '💎'
      }
    ]

    const mockPrograms: LoyaltyProgram[] = [
      {
        id: '1',
        name: 'Retail Rewards Plus',
        description: 'Earn points on every purchase and unlock exclusive benefits',
        isActive: true,
        pointsPerCurrency: 1,
        pointsExpiryDays: 365,
        tiers: mockTiers,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      }
    ]

    const mockCards: LoyaltyCard[] = [
      {
        id: '1',
        cardNumber: 'RC100001',
        barcode: '1234567890123',
        qrCode: 'RC100001',
        customerId: '1',
        customerName: 'John Smith',
        customerEmail: 'john.smith@email.com',
        customerPhone: '+1 555-0123',
        programId: '1',
        programName: 'Retail Rewards Plus',
        currentTier: 'Gold',
        points: 2350,
        lifetimePoints: 3200,
        totalSpent: 2850.00,
        joinDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'active',
        notes: 'VIP customer, prefers email communication'
      },
      {
        id: '2',
        cardNumber: 'RC100002',
        barcode: '2345678901234',
        qrCode: 'RC100002',
        customerId: '2',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah.j@email.com',
        customerPhone: '+1 555-0124',
        programId: '1',
        programName: 'Retail Rewards Plus',
        currentTier: 'Silver',
        points: 750,
        lifetimePoints: 950,
        totalSpent: 850.00,
        joinDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        id: '3',
        cardNumber: 'RC100003',
        barcode: '3456789012345',
        qrCode: 'RC100003',
        customerId: '3',
        customerName: 'Mike Davis',
        customerEmail: 'mike.davis@email.com',
        customerPhone: '+1 555-0125',
        programId: '1',
        programName: 'Retail Rewards Plus',
        currentTier: 'Bronze',
        points: 150,
        lifetimePoints: 200,
        totalSpent: 180.00,
        joinDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        status: 'active'
      }
    ]

    const mockTransactions: LoyaltyTransaction[] = [
      {
        id: '1',
        cardId: '1',
        cardNumber: 'RC100001',
        customerName: 'John Smith',
        type: 'earned',
        points: 50,
        description: 'Purchase - Order #1234',
        orderId: '1234',
        amount: 50.00,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        balance: 2350
      },
      {
        id: '2',
        cardId: '1',
        cardNumber: 'RC100001',
        customerName: 'John Smith',
        type: 'redeemed',
        points: 200,
        description: 'Redeemed for $10 discount',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        balance: 2300
      },
      {
        id: '3',
        cardId: '2',
        cardNumber: 'RC100002',
        customerName: 'Sarah Johnson',
        type: 'earned',
        points: 25,
        description: 'Purchase - Order #1235',
        orderId: '1235',
        amount: 25.00,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        balance: 750
      }
    ]

    const mockRewards: Reward[] = [
      {
        id: '1',
        name: '$5 Discount',
        description: 'Get $5 off your next purchase',
        pointsRequired: 250,
        type: 'discount',
        value: 5.00,
        isActive: true,
        usageLimit: 1000,
        timesUsed: 45
      },
      {
        id: '2',
        name: 'Free Coffee',
        description: 'Redeem for a free coffee of any size',
        pointsRequired: 150,
        type: 'free_item',
        value: 4.50,
        isActive: true,
        usageLimit: 500,
        timesUsed: 120
      },
      {
        id: '3',
        name: '10% Cashback',
        description: 'Get 10% cashback on your next purchase',
        pointsRequired: 500,
        type: 'cashback',
        value: 10,
        isActive: true,
        usageLimit: 100,
        timesUsed: 15
      }
    ]

    setPrograms(mockPrograms)
    setCards(mockCards)
    setTransactions(mockTransactions)
    setRewards(mockRewards)
    setSelectedProgram(mockPrograms[0]?.id || '')
  }, [])

  const handleCreateCard = () => {
    if (!newCard.customerName || !newCard.programId) return

    const program = programs.find(p => p.id === newCard.programId)
    if (!program) return

    const cardNumber = `RC${String(Math.floor(Math.random() * 900000) + 100000)}`
    const barcode = String(Math.floor(Math.random() * 10000000000000))

    const card: LoyaltyCard = {
      id: Date.now().toString(),
      cardNumber,
      barcode,
      qrCode: cardNumber,
      customerId: Date.now().toString(),
      customerName: newCard.customerName,
      customerEmail: newCard.customerEmail,
      customerPhone: newCard.customerPhone,
      programId: newCard.programId,
      programName: program.name,
      currentTier: 'Bronze',
      points: 0,
      lifetimePoints: 0,
      totalSpent: 0,
      joinDate: new Date(),
      lastActivity: new Date(),
      status: 'active',
      notes: newCard.notes
    }

    setCards(prev => [card, ...prev])
    setNewCard({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      programId: '',
      notes: ''
    })
    setIsCreateCardOpen(false)
  }

  const handleScanCard = (barcode: string) => {
    const card = cards.find(c => c.barcode === barcode || c.cardNumber === barcode)
    if (card) {
      // Show card details or perform action
      console.log('Card found:', card)
    } else {
      // Card not found, offer to create new one
      console.log('Card not found:', barcode)
    }
    setIsScanMode(false)
  }

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.cardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProgram = !selectedProgram || card.programId === selectedProgram
    const matchesTier = !selectedTier || card.currentTier === selectedTier
    
    return matchesSearch && matchesProgram && matchesTier
  })

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'Bronze': return <Award className="h-4 w-4 text-amber-600" />
      case 'Silver': return <Award className="h-4 w-4 text-gray-400" />
      case 'Gold': return <Crown className="h-4 w-4 text-yellow-500" />
      case 'Platinum': return <Crown className="h-4 w-4 text-purple-400" />
      default: return <Star className="h-4 w-4" />
    }
  }

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'Bronze': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'Silver': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'Gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Platinum': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'earned': return 'text-green-600'
      case 'redeemed': return 'text-red-600'
      case 'adjusted': return 'text-blue-600'
      case 'expired': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const stats = {
    totalCards: cards.length,
    activeCards: cards.filter(c => c.status === 'active').length,
    totalPoints: cards.reduce((sum, card) => sum + card.points, 0),
    avgPointsPerCard: cards.length > 0 ? cards.reduce((sum, card) => sum + card.points, 0) / cards.length : 0
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loyalty Cards</h1>
          <p className="text-muted-foreground">Manage customer loyalty programs and rewards</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setIsScanMode(true)}
          >
            <Barcode className="mr-2 h-4 w-4" />
            Scan Card
          </Button>
          <Dialog open={isCreateCardOpen} onOpenChange={setIsCreateCardOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Card
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Loyalty Card</DialogTitle>
                <DialogDescription>
                  Register a new customer for the loyalty program
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={newCard.customerName}
                    onChange={(e) => setNewCard(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Full name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={newCard.customerEmail}
                      onChange={(e) => setNewCard(prev => ({ ...prev, customerEmail: e.target.value }))}
                      placeholder="Email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone</Label>
                    <Input
                      id="customerPhone"
                      value={newCard.customerPhone}
                      onChange={(e) => setNewCard(prev => ({ ...prev, customerPhone: e.target.value }))}
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="programId">Loyalty Program</Label>
                  <Select value={newCard.programId} onValueChange={(value) => setNewCard(prev => ({ ...prev, programId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.filter(p => p.isActive).map(program => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={newCard.notes}
                    onChange={(e) => setNewCard(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional notes..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleCreateCard} className="w-full">
                  Create Loyalty Card
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCards}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cards</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeCards}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.totalPoints.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Points</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.avgPointsPerCard.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      {isScanMode && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Scan Loyalty Card</CardTitle>
            <CardDescription className="text-blue-600">
              Scan a barcode or enter card number to look up customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter barcode or card number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleScanCard(searchTerm)
                  }
                }}
                className="flex-1"
              />
              <Button onClick={() => handleScanCard(searchTerm)}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button variant="outline" onClick={() => setIsScanMode(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="cards">Loyalty Cards</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Cards</CardTitle>
              <CardDescription>Manage customer loyalty cards and view their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, card number, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Programs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Programs</SelectItem>
                    {programs.map(program => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Tiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Tiers</SelectItem>
                    <SelectItem value="Bronze">Bronze</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCards.map(card => (
                  <Card key={card.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{card.customerName}</CardTitle>
                          <CardDescription>{card.cardNumber}</CardDescription>
                        </div>
                        <Badge variant="outline" className={getTierColor(card.currentTier)}>
                          {getTierIcon(card.currentTier)}
                          <span className="ml-1">{card.currentTier}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Points</span>
                          <span className="font-semibold text-lg">{card.points.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Lifetime Points</span>
                          <span className="font-medium">{card.lifetimePoints.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Spent</span>
                          <span className="font-medium">${card.totalSpent.toFixed(2)}</span>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{card.customerEmail}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{card.customerPhone}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Barcode className="mr-2 h-4 w-4" />
                            Scan
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredCards.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="mx-auto h-12 w-12 mb-4" />
                  <p>No loyalty cards found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Transactions</CardTitle>
              <CardDescription>View all points transactions and history</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Card</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map(transaction => (
                    <TableRow key={transaction.id}>
                      <TableCell>{format(transaction.createdAt, 'MMM dd, HH:mm')}</TableCell>
                      <TableCell className="font-medium">{transaction.cardNumber}</TableCell>
                      <TableCell>{transaction.customerName}</TableCell>
                      <TableCell>
                        <span className={getTransactionTypeColor(transaction.type)}>
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className={getTransactionTypeColor(transaction.type)}>
                        {transaction.type === 'earned' ? '+' : '-'}{Math.abs(transaction.points)}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.balance.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Rewards</CardTitle>
              <CardDescription>Manage rewards that customers can redeem with points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rewards.map(reward => (
                  <Card key={reward.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{reward.name}</CardTitle>
                        <Gift className="h-5 w-5 text-purple-600" />
                      </div>
                      <CardDescription>{reward.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Points Required</span>
                          <span className="font-semibold text-purple-600">{reward.pointsRequired.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Value</span>
                          <span className="font-medium">
                            {reward.type === 'discount' && `$${reward.value.toFixed(2)} off`}
                            {reward.type === 'free_item' && `Free item ($${reward.value.toFixed(2)})`}
                            {reward.type === 'cashback' && `${reward.value}% cashback`}
                            {reward.type === 'experience' && `Experience`}
                          </span>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {reward.usageLimit && (
                            <div>Used {reward.timesUsed} of {reward.usageLimit} times</div>
                          )}
                          {reward.expiryDate && (
                            <div>Expires: {format(reward.expiryDate, 'MMM dd, yyyy')}</div>
                          )}
                        </div>

                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          disabled={!reward.isActive}
                        >
                          {reward.isActive ? 'Redeem' : 'Unavailable'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Programs</CardTitle>
              <CardDescription>Configure loyalty programs and tier structures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {programs.map(program => (
                  <div key={program.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{program.name}</h3>
                        <p className="text-muted-foreground">{program.description}</p>
                      </div>
                      <Badge variant={program.isActive ? "default" : "secondary"}>
                        {program.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3 mb-6">
                      <div>
                        <div className="text-sm text-muted-foreground">Points per $1</div>
                        <div className="font-semibold">{program.pointsPerCurrency}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Points Expiry</div>
                        <div className="font-semibold">{program.pointsExpiryDays} days</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Total Tiers</div>
                        <div className="font-semibold">{program.tiers.length}</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Membership Tiers</h4>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                        {program.tiers.map(tier => (
                          <div key={tier.id} className="border rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-lg">{tier.icon}</span>
                              <span className="font-medium">{tier.name}</span>
                            </div>
                            <div className="text-sm text-muted-foreground mb-1">
                              {tier.pointsRequired.toLocaleString()} points
                            </div>
                            <div className="text-sm font-medium text-green-600 mb-2">
                              {tier.discountPercentage > 0 ? `${tier.discountPercentage}% discount` : 'No discount'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {tier.benefits.slice(0, 2).join(', ')}
                              {tier.benefits.length > 2 && '...'}
                            </div>
                          </div>
                        ))}
                      </div>
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