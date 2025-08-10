'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  ShoppingCart, 
  Users, 
  Bell, 
  Star, 
  CreditCard,
  QrCode,
  MapPin,
  Clock
} from 'lucide-react';

interface MobileFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'beta' | 'planned';
  endpoint: string;
  methods: string[];
}

const mobileFeatures: MobileFeature[] = [
  {
    id: 'orders',
    title: 'Mobile Ordering',
    description: 'Place and track orders from mobile devices with real-time updates',
    icon: <ShoppingCart className="h-5 w-5" />,
    status: 'active',
    endpoint: '/api/mobile/orders',
    methods: ['GET', 'POST', 'PATCH']
  },
  {
    id: 'menu',
    title: 'Digital Menu',
    description: 'Browse menu items with categories, search, and filtering options',
    icon: <QrCode className="h-5 w-5" />,
    status: 'active',
    endpoint: '/api/mobile/menu',
    methods: ['GET']
  },
  {
    id: 'customers',
    title: 'Customer Management',
    description: 'Customer registration, profile management, and order history',
    icon: <Users className="h-5 w-5" />,
    status: 'active',
    endpoint: '/api/mobile/customers',
    methods: ['GET', 'POST']
  },
  {
    id: 'loyalty',
    title: 'Loyalty Program',
    description: 'Track loyalty points, tiers, and rewards through mobile app',
    icon: <Star className="h-5 w-5" />,
    status: 'active',
    endpoint: '/api/mobile/loyalty',
    methods: ['GET']
  },
  {
    id: 'notifications',
    title: 'Push Notifications',
    description: 'Real-time notifications for order updates, promotions, and offers',
    icon: <Bell className="h-5 w-5" />,
    status: 'active',
    endpoint: '/api/mobile/notifications',
    methods: ['GET', 'POST', 'PATCH']
  },
  {
    id: 'payments',
    title: 'Mobile Payments',
    description: 'UPI, credit/debit card, and wallet integration for mobile payments',
    icon: <CreditCard className="h-5 w-5" />,
    status: 'beta',
    endpoint: '/api/mobile/payments',
    methods: ['POST']
  },
  {
    id: 'locations',
    title: 'Location Services',
    description: 'Find nearby restaurants, check availability, and get directions',
    icon: <MapPin className="h-5 w-5" />,
    status: 'planned',
    endpoint: '/api/mobile/locations',
    methods: ['GET']
  },
  {
    id: 'delivery',
    title: 'Delivery Tracking',
    description: 'Real-time delivery tracking with estimated time of arrival',
    icon: <Clock className="h-5 w-5" />,
    status: 'planned',
    endpoint: '/api/mobile/delivery',
    methods: ['GET', 'POST']
  }
];

export default function MobileIntegrationDashboard() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const getStatusBadge = (status: 'active' | 'beta' | 'planned') => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'beta':
        return <Badge variant="secondary">Beta</Badge>;
      case 'planned':
        return <Badge variant="outline">Planned</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Smartphone className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Mobile App Integration APIs</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mobileFeatures.map((feature) => (
          <Card 
            key={feature.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedFeature === feature.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedFeature(feature.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {feature.icon}
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
                {getStatusBadge(feature.status)}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-3">
                {feature.description}
              </CardDescription>
              <div className="space-y-2 text-sm">
                <div className="font-mono bg-muted p-2 rounded">
                  {feature.endpoint}
                </div>
                <div className="flex flex-wrap gap-1">
                  {feature.methods.map((method) => (
                    <Badge key={method} variant="outline" className="text-xs">
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedFeature && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {mobileFeatures.find(f => f.id === selectedFeature)?.icon}
              <span>{mobileFeatures.find(f => f.id === selectedFeature)?.title} API Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <p>
                  {mobileFeatures.find(f => f.id === selectedFeature)?.description}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Status</h4>
                    {getStatusBadge(mobileFeatures.find(f => f.id === selectedFeature)?.status || 'planned')}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Authentication</h4>
                    <Badge variant="outline">JWT Required</Badge>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="endpoints" className="space-y-4">
                <div className="space-y-3">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        GET {mobileFeatures.find(f => f.id === selectedFeature)?.endpoint}
                      </code>
                      <Badge variant="outline">Retrieve</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Fetch data with optional query parameters for filtering and pagination
                    </p>
                  </div>
                  {mobileFeatures.find(f => f.id === selectedFeature)?.methods.includes('POST') && (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          POST {mobileFeatures.find(f => f.id === selectedFeature)?.endpoint}
                        </code>
                        <Badge variant="outline">Create</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Create new records with JSON payload
                      </p>
                    </div>
                  )}
                  {mobileFeatures.find(f => f.id === selectedFeature)?.methods.includes('PATCH') && (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          PATCH {mobileFeatures.find(f => f.id === selectedFeature)?.endpoint}/:id
                        </code>
                        <Badge variant="outline">Update</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Update existing records with partial data
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="examples" className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">cURL Example</h4>
                  <pre className="text-sm overflow-x-auto">
                    <code>{`curl -X GET "${mobileFeatures.find(f => f.id === selectedFeature)?.endpoint}" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json"`}</code>
                  </pre>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">JavaScript Example</h4>
                  <pre className="text-sm overflow-x-auto">
                    <code>{`const response = await fetch('${mobileFeatures.find(f => f.id === selectedFeature)?.endpoint}', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();`}</code>
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}