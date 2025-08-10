'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  Gift, 
  Trophy, 
  Users, 
  TrendingUp, 
  Plus,
  Settings,
  Award,
  Target,
  Calendar,
  Percent,
  ShoppingCart
} from 'lucide-react';

interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  type: 'points' | 'tiered' | 'cashback' | 'stamps';
  status: 'active' | 'inactive' | 'draft';
  pointsPerRupee: number;
  minRedemptionPoints: number;
  redemptionRate: number;
  tiers: LoyaltyTier[];
  rewards: LoyaltyReward[];
  customerCount: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
}

interface LoyaltyTier {
  id: string;
  name: string;
  description: string;
  minPoints: number;
  maxPoints?: number;
  benefits: string[];
  color: string;
  icon: string;
}

interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  type: 'discount' | 'free_item' | 'cashback' | 'experience';
  pointsRequired: number;
  value: number;
  isRedeemable: boolean;
  redemptionCount: number;
  expiryDays?: number;
}

interface CustomerLoyalty {
  customerId: string;
  customerName: string;
  currentPoints: number;
  lifetimePoints: number;
  tier: string;
  joinDate: string;
  lastActivity: string;
  redemptionCount: number;
}

const ComprehensiveLoyaltySystem = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);

  // Mock data - in real app, this would come from API
  const loyaltyPrograms: LoyaltyProgram[] = [
    {
      id: '1',
      name: 'Spice Rewards',
      description: 'Earn points with every purchase and redeem exciting rewards',
      type: 'tiered',
      status: 'active',
      pointsPerRupee: 1,
      minRedemptionPoints: 100,
      redemptionRate: 1,
      customerCount: 1250,
      totalPointsIssued: 245000,
      totalPointsRedeemed: 89000,
      tiers: [
        {
          id: 'bronze',
          name: 'Bronze',
          description: 'Starting your journey with us',
          minPoints: 0,
          maxPoints: 999,
          benefits: ['1 point per ₹10 spent', 'Birthday discount'],
          color: '#CD7F32',
          icon: '🥉'
        },
        {
          id: 'silver',
          name: 'Silver',
          description: 'Valued customer status',
          minPoints: 1000,
          maxPoints: 4999,
          benefits: ['1.5 points per ₹10 spent', '10% birthday discount', 'Priority seating'],
          color: '#C0C0C0',
          icon: '🥈'
        },
        {
          id: 'gold',
          name: 'Gold',
          description: 'Premium member benefits',
          minPoints: 5000,
          maxPoints: 9999,
          benefits: ['2 points per ₹10 spent', '15% birthday discount', 'Free delivery', 'Exclusive events'],
          color: '#FFD700',
          icon: '🥇'
        },
        {
          id: 'platinum',
          name: 'Platinum',
          description: 'Our most valued customers',
          minPoints: 10000,
          benefits: ['3 points per ₹10 spent', '20% birthday discount', 'Free delivery', 'Exclusive events', 'Personal manager'],
          color: '#E5E4E2',
          icon: '💎'
        }
      ],
      rewards: [
        {
          id: 'r1',
          name: '10% Discount',
          description: 'Get 10% off on your next order',
          type: 'discount',
          pointsRequired: 100,
          value: 10,
          isRedeemable: true,
          redemptionCount: 245,
          expiryDays: 30
        },
        {
          id: 'r2',
          name: 'Free Garlic Naan',
          description: 'Complimentary garlic naan with any main course',
          type: 'free_item',
          pointsRequired: 150,
          value: 50,
          isRedeemable: true,
          redemptionCount: 189
        },
        {
          id: 'r3',
          name: '₹100 Cashback',
          description: 'Get ₹100 cashback on your order',
          type: 'cashback',
          pointsRequired: 200,
          value: 100,
          isRedeemable: true,
          redemptionCount: 156
        }
      ]
    }
  ];

  const customerLoyaltyData: CustomerLoyalty[] = [
    {
      customerId: 'c1',
      customerName: 'Rahul Sharma',
      currentPoints: 2450,
      lifetimePoints: 3200,
      tier: 'Silver',
      joinDate: '2023-06-15',
      lastActivity: '2024-01-10',
      redemptionCount: 8
    },
    {
      customerId: 'c2',
      customerName: 'Priya Patel',
      currentPoints: 6800,
      lifetimePoints: 7200,
      tier: 'Gold',
      joinDate: '2023-03-20',
      lastActivity: '2024-01-12',
      redemptionCount: 12
    },
    {
      customerId: 'c3',
      customerName: 'Amit Kumar',
      currentPoints: 12500,
      lifetimePoints: 15800,
      tier: 'Platinum',
      joinDate: '2022-11-10',
      lastActivity: '2024-01-11',
      redemptionCount: 25
    }
  ];

  const programStats = {
    totalCustomers: 1250,
    activeCustomers: 980,
    averagePointsPerCustomer: 196,
    redemptionRate: 36.3,
    customerRetention: 78.5
  };

  const getTierColor = (tierName: string) => {
    const tier = loyaltyPrograms[0]?.tiers.find(t => t.name.toLowerCase() === tierName.toLowerCase());
    return tier?.color || '#6B7280';
  };

  const getTierIcon = (tierName: string) => {
    const tier = loyaltyPrograms[0]?.tiers.find(t => t.name.toLowerCase() === tierName.toLowerCase());
    return tier?.icon || '⭐';
  };

  const renderProgramCard = (program: LoyaltyProgram) => (
    <Card 
      key={program.id} 
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedProgram === program.id ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => setSelectedProgram(program.id)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <CardTitle>{program.name}</CardTitle>
          </div>
          <Badge variant={program.status === 'active' ? 'default' : 'secondary'}>
            {program.status}
          </Badge>
        </div>
        <CardDescription>{program.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Customers</p>
            <p className="font-semibold">{program.customerCount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Points Issued</p>
            <p className="font-semibold">{program.totalPointsIssued.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Points Redeemed</p>
            <p className="font-semibold">{program.totalPointsRedeemed.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Redemption Rate</p>
            <p className="font-semibold">
              {((program.totalPointsRedeemed / program.totalPointsIssued) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Trophy className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Loyalty Programs</h2>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsCreatingProgram(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Program
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Program Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-lg font-bold">{programStats.totalCustomers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Customers</p>
                <p className="text-lg font-bold">{programStats.activeCustomers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Points/Customer</p>
                <p className="text-lg font-bold">{programStats.averagePointsPerCustomer}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Gift className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Redemption Rate</p>
                <p className="text-lg font-bold">{programStats.redemptionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Retention Rate</p>
                <p className="text-lg font-bold">{programStats.customerRetention}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Programs</TabsTrigger>
          <TabsTrigger value="tiers">Tiers & Benefits</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loyaltyPrograms.map(renderProgramCard)}
          </div>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-6">
          {loyaltyPrograms.map(program => (
            <Card key={program.id}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>{program.name} - Tiers</span>
                </CardTitle>
                <CardDescription>Customer tiers and their benefits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {program.tiers.map(tier => (
                    <Card key={tier.id} className="relative overflow-hidden">
                      <div 
                        className="absolute inset-0 opacity-10"
                        style={{ backgroundColor: tier.color }}
                      />
                      <CardHeader className="relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{tier.icon}</span>
                            <CardTitle className="text-lg">{tier.name}</CardTitle>
                          </div>
                        </div>
                        <CardDescription>{tier.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Points Range: </span>
                            <span className="font-medium">
                              {tier.minPoints.toLocaleString()} - {tier.maxPoints ? tier.maxPoints.toLocaleString() : '∞'}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Benefits:</p>
                            <ul className="text-sm space-y-1">
                              {tier.benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center space-x-1">
                                  <span className="w-1 h-1 bg-current rounded-full" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          {loyaltyPrograms.map(program => (
            <Card key={program.id}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gift className="h-5 w-5" />
                  <span>{program.name} - Rewards</span>
                </CardTitle>
                <CardDescription>Available rewards for redemption</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {program.rewards.map(reward => (
                    <Card key={reward.id} className="relative">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {reward.type === 'discount' && <Percent className="h-4 w-4 text-blue-600" />}
                            {reward.type === 'free_item' && <ShoppingCart className="h-4 w-4 text-green-600" />}
                            {reward.type === 'cashback' && <TrendingUp className="h-4 w-4 text-purple-600" />}
                            {reward.type === 'experience' && <Star className="h-4 w-4 text-yellow-600" />}
                            <CardTitle className="text-lg">{reward.name}</CardTitle>
                          </div>
                          <Badge variant={reward.isRedeemable ? 'default' : 'secondary'}>
                            {reward.isRedeemable ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                        <CardDescription>{reward.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Points Required:</span>
                            <span className="font-semibold">{reward.pointsRequired}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Value:</span>
                            <span className="font-semibold">₹{reward.value}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Redeemed:</span>
                            <span className="font-semibold">{reward.redemptionCount} times</span>
                          </div>
                          {reward.expiryDays && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Expires in:</span>
                              <span className="font-semibold">{reward.expiryDays} days</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Loyalty Overview</CardTitle>
              <CardDescription>Top customers and their loyalty status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerLoyaltyData.map(customer => (
                  <div key={customer.customerId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getTierIcon(customer.tier)}</span>
                        <div>
                          <p className="font-medium">{customer.customerName}</p>
                          <p className="text-sm text-gray-600">
                            Member since {new Date(customer.joinDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Current Points</p>
                        <p className="font-semibold">{customer.currentPoints.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Lifetime Points</p>
                        <p className="font-semibold">{customer.lifetimePoints.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Tier</p>
                        <Badge 
                          variant="outline" 
                          style={{ 
                            borderColor: getTierColor(customer.tier),
                            color: getTierColor(customer.tier)
                          }}
                        >
                          {customer.tier}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Redemptions</p>
                        <p className="font-semibold">{customer.redemptionCount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Points Distribution</CardTitle>
                <CardDescription>How points are earned and redeemed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Points Earned</span>
                    <span className="font-semibold">245,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Points Redeemed</span>
                    <span className="font-semibold">89,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Points Expired</span>
                    <span className="font-semibold">12,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Points</span>
                    <span className="font-semibold">144,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Redemption Trends</CardTitle>
                <CardDescription>Popular rewards and redemption patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Most Popular Reward</span>
                    <span className="font-semibold">10% Discount</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Avg Points per Redemption</span>
                    <span className="font-semibold">165</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Redemption Frequency</span>
                    <span className="font-semibold">2.3/month</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Customer Satisfaction</span>
                    <span className="font-semibold">4.8/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveLoyaltySystem;