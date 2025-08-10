"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Star,
  Clock,
  User,
  Tag,
  Filter,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  FileText
} from 'lucide-react'
import { usePOSStore } from '@/store'

interface KnowledgeArticle {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  type: 'howto' | 'troubleshooting' | 'faq' | 'bestpractice'
  author: string
  createdAt: Date
  updatedAt: Date
  views: number
  helpful: number
  isFeatured: boolean
  relatedArticles?: string[]
}

export default function KnowledgeBase() {
  const { currentRestaurant } = usePOSStore()
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [filteredArticles, setFilteredArticles] = useState<KnowledgeArticle[]>([])
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    difficulty: 'beginner' as const,
    type: 'howto' as const
  })

  // Initialize sample knowledge base articles
  useEffect(() => {
    const sampleArticles: KnowledgeArticle[] = [
      {
        id: '1',
        title: 'Getting Started with POSBiz Dashboard',
        content: `# Getting Started with POSBiz Dashboard

Welcome to POSBiz! This guide will help you navigate the main dashboard and understand its key features.

## Dashboard Overview
The main dashboard provides a comprehensive view of your business operations with real-time metrics and quick access to essential functions.

### Key Sections:
- **Revenue Metrics**: View today's revenue, total orders, and customer count
- **Quick Actions**: Access frequently used features like creating orders and managing inventory
- **Recent Activity**: Monitor recent orders, customer interactions, and system notifications
- **Performance Charts**: Visual representations of sales trends and business performance

### Navigation Tips:
- Use the sidebar to switch between different modules
- Each tab provides specialized functionality for specific business areas
- Search functionality helps you quickly find what you need

## Best Practices:
1. **Daily Check**: Review dashboard metrics at the start of each day
2. **Set Goals**: Use the trending data to set daily and weekly targets
3. **Monitor Alerts**: Pay attention to system notifications and alerts
4. **Regular Updates**: Keep your business information updated for accurate reporting

For more detailed information on specific features, check out our other knowledge base articles.`,
        category: 'Getting Started',
        tags: ['dashboard', 'navigation', 'overview', 'basics'],
        difficulty: 'beginner',
        type: 'howto',
        author: 'POSBiz Team',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        views: 1250,
        helpful: 45,
        isFeatured: true
      },
      {
        id: '2',
        title: 'Troubleshooting Payment Gateway Issues',
        content: `# Troubleshooting Payment Gateway Issues

Payment gateway problems can disrupt your business operations. This guide helps you identify and resolve common payment issues.

## Common Issues and Solutions

### 1. Transaction Failures
**Symptoms**: Customers report failed payments, error messages during checkout

**Solutions**:
- Check your internet connection
- Verify payment gateway credentials in settings
- Ensure your subscription is active
- Contact your payment provider if issues persist

### 2. Razorpay Integration Problems
**Symptoms**: Razorpay payments not processing, webhook failures

**Solutions**:
- Verify API keys are correctly entered
- Check webhook URL configuration
- Ensure your server IP is whitelisted
- Test with Razorpay's sandbox environment

### 3. Refund Processing Delays
**Symptoms**: Refunds taking longer than expected to process

**Solutions**:
- Check refund processing timeframes (typically 5-7 business days)
- Verify customer bank details
- Contact payment provider for status updates

## Prevention Tips:
- Regularly monitor payment gateway status
- Keep backup payment methods available
- Train staff on common payment issues
- Maintain updated contact information for payment providers

## When to Contact Support:
- Persistent payment failures affecting multiple customers
- Security-related concerns
- Integration issues with third-party services
- Unusual transaction patterns

For immediate assistance, use the chat system to connect with our support team.`,
        category: 'Payment & Billing',
        tags: ['payment', 'troubleshooting', 'razorpay', 'gateway', 'refund'],
        difficulty: 'intermediate',
        type: 'troubleshooting',
        author: 'Sarah Chen',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        views: 890,
        helpful: 38,
        isFeatured: false
      },
      {
        id: '3',
        title: 'Inventory Management Best Practices',
        content: `# Inventory Management Best Practices

Effective inventory management is crucial for business success. This guide covers best practices for maintaining optimal inventory levels.

## Key Principles

### 1. Regular Stock Monitoring
- **Daily Checks**: Review high-value items
- **Weekly Audits**: Complete inventory counts
- **Monthly Reconciliation**: Compare physical vs. system counts

### 2. Setting Up Alerts
- **Low Stock Alerts**: Set reorder points for critical items
- **Expiry Notifications**: Monitor perishable items
- **Overstock Warnings**: Prevent excess inventory buildup

### 3. Categorization Strategy
- **ABC Analysis**: Categorize items by value and turnover
- **Fast vs. Slow Moving**: Identify items needing special attention
- **Seasonal Items**: Plan for seasonal demand fluctuations

## Advanced Features

### Multi-Location Management
- **Centralized Control**: Manage inventory across all locations
- **Transfer Tracking**: Monitor stock movements between locations
- **Location-Specific Settings**: Customize reorder points per location

### Integration with Suppliers
- **Automated Reordering**: Set up automatic purchase orders
- **Supplier Performance**: Track delivery times and quality
- **Price Comparison**: Monitor supplier pricing trends

## Reporting and Analytics
- **Inventory Turnover**: Calculate how quickly items sell
- **Stock Value Analysis**: Monitor total inventory value
- **Shrinkage Tracking**: Identify and reduce losses

## Common Pitfalls to Avoid:
1. **Overstocking**: Ties up capital and increases storage costs
2. **Understocking**: Leads to lost sales and customer dissatisfaction
3. **Poor Data Quality**: Inaccurate counts lead to ordering errors
4. **Ignoring Trends**: Failing to adapt to changing demand patterns

## Tools and Features:
- **Barcode Scanning**: Use barcode scanners for quick inventory updates
- **Mobile App**: Manage inventory on-the-go
- **Reports**: Generate detailed inventory reports
- **Alerts**: Receive notifications for critical inventory events

For specific questions about inventory features, consult our other articles or contact support.`,
        category: 'Inventory',
        tags: ['inventory', 'management', 'bestpractices', 'stock', 'optimization'],
        difficulty: 'advanced',
        type: 'bestpractice',
        author: 'Mike Johnson',
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        views: 654,
        helpful: 29,
        isFeatured: true
      },
      {
        id: '4',
        title: 'Customer Management and Loyalty Programs',
        content: `# Customer Management and Loyalty Programs

Building strong customer relationships is essential for business growth. This guide covers customer management and loyalty program features.

## Customer Management Basics

### Customer Profiles
- **Information Storage**: Store customer contact details, preferences, and order history
- **Segmentation**: Group customers by purchase behavior, location, or preferences
- **Communication**: Send targeted messages and promotions

### Order History
- **Complete Records**: View all customer orders and transactions
- **Purchase Patterns**: Identify buying habits and preferences
- **Return Management**: Handle returns and exchanges efficiently

## Loyalty Programs

### Setting Up Loyalty Programs
1. **Choose Program Type**: Points-based, tiered, or subscription-based
2. **Define Rewards**: Determine what customers earn and how they redeem
3. **Set Rules**: Establish earning rates and redemption conditions
4. **Configure Tiers**: Create different membership levels with increasing benefits

### Program Features
- **Points System**: Customers earn points for purchases
- **Tier Levels**: Bronze, Silver, Gold, Platinum with increasing benefits
- **Birthday Rewards**: Special offers on customer birthdays
- **Referral Bonuses**: Rewards for bringing in new customers

### Managing Loyalty Programs
- **Performance Tracking**: Monitor program effectiveness
- **Customer Engagement**: Track participation rates and redemption
- **ROI Analysis**: Measure return on investment for loyalty initiatives

## Advanced Features

### Personalized Marketing
- **Targeted Offers**: Send promotions based on customer behavior
- **Automated Campaigns**: Set up automated email/SMS campaigns
- **A/B Testing**: Test different offers and messages

### Analytics and Reporting
- **Customer Lifetime Value**: Calculate total value per customer
- **Retention Rates**: Track customer retention over time
- **Program Effectiveness**: Measure loyalty program impact on sales

## Best Practices:
1. **Keep it Simple**: Easy-to-understand programs work best
2. **Communicate Clearly**: Ensure customers understand how to earn and redeem
3. **Offer Value**: Provide rewards that customers actually want
4. **Monitor and Adjust**: Regularly review program performance and make improvements

## Integration with Other Systems:
- **POS Integration**: Automatically track purchases and award points
- **Email Marketing**: Sync with email marketing platforms
- **Mobile App**: Allow customers to check balances and redeem rewards

For help setting up your loyalty program, contact our support team or check out our setup guides.`,
        category: 'Customer Management',
        tags: ['customer', 'loyalty', 'marketing', 'retention', 'programs'],
        difficulty: 'intermediate',
        type: 'howto',
        author: 'Emily Davis',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        views: 432,
        helpful: 19,
        isFeatured: false
      },
      {
        id: '5',
        title: 'Frequently Asked Questions (FAQ)',
        content: `# Frequently Asked Questions (FAQ)

Here are answers to the most common questions about POSBiz.

## General Questions

### Q: What is POSBiz?
A: POSBiz is a comprehensive business management system that includes point-of-sale, inventory management, customer relationship management, and analytics tools.

### Q: How much does POSBiz cost?
A: POSBiz offers flexible pricing plans based on your business size and needs. Contact our sales team for a customized quote.

### Q: What types of businesses can use POSBiz?
A: POSBiz is designed for restaurants, retail stores, service businesses, and multi-location operations.

### Q: Is POSBiz cloud-based?
A: Yes, POSBiz is a cloud-based solution that you can access from anywhere with an internet connection.

## Technical Questions

### Q: What are the system requirements?
A: POSBiz works on any modern web browser. For mobile apps, iOS 12+ and Android 8+ are supported.

### Q: How do I integrate with my existing systems?
A: POSBiz offers APIs and integrations with popular accounting, payment, and marketing systems.

### Q: Is my data secure?
A: Yes, we use industry-standard encryption and security measures to protect your data.

### Q: Can I work offline?
A: Yes, POSBiz supports offline mode with automatic sync when you reconnect.

## Account and Billing

### Q: How do I update my billing information?
A: Go to Settings > Billing > Payment Methods to update your billing information.

### Q: Can I change my subscription plan?
A: Yes, you can upgrade or downgrade your plan at any time from the billing section.

### Q: What payment methods do you accept?
A: We accept all major credit cards, debit cards, and bank transfers.

### Q: Do you offer refunds?
A: We offer a 30-day money-back guarantee for new customers.

## Support and Training

### Q: How do I get help?
A: You can contact support through the chat system, email, or phone. We also have extensive documentation and video tutorials.

### Q: Do you offer training?
A: Yes, we provide online training sessions, video tutorials, and documentation.

### Q: What are your support hours?
A: Our support team is available 24/7 for critical issues and during business hours for general inquiries.

### Q: How do I report a bug?
A: Use the chat system to report bugs or create a support ticket in the system.

## Features and Functionality

### Q: Can I customize the system?
A: Yes, POSBiz offers extensive customization options for invoices, reports, and workflows.

### Q: Does POSBiz support multiple locations?
A: Yes, you can manage multiple locations from a single dashboard.

### Q: Can I export my data?
A: Yes, you can export data in various formats including CSV, Excel, and PDF.

### Q: How often is the system updated?
A: We release regular updates with new features and improvements. Updates are automatic.

## Getting Started

### Q: How long does setup take?
A: Basic setup can be completed in under an hour. Full implementation typically takes 1-3 days.

### Q: Do I need technical skills to use POSBiz?
A: No, POSBiz is designed to be user-friendly. We provide comprehensive training and support.

### Q: Can I import my existing data?
A: Yes, we provide tools and assistance for importing data from other systems.

### Q: What if I need help during setup?
A: Our onboarding team will guide you through the entire setup process.

For more specific questions, please contact our support team or browse our knowledge base articles.`,
        category: 'General',
        tags: ['faq', 'general', 'questions', 'support', 'gettingstarted'],
        difficulty: 'beginner',
        type: 'faq',
        author: 'POSBiz Team',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        views: 2105,
        helpful: 87,
        isFeatured: true
      }
    ]
    setArticles(sampleArticles)
    setFilteredArticles(sampleArticles)
  }, [])

  // Filter articles based on search and filters
  useEffect(() => {
    let filtered = articles

    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory)
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(article => article.type === selectedType)
    }

    setFilteredArticles(filtered)
  }, [articles, searchQuery, selectedCategory, selectedType])

  const handleCreateArticle = () => {
    if (!newArticle.title || !newArticle.content) return

    const article: KnowledgeArticle = {
      id: Date.now().toString(),
      title: newArticle.title,
      content: newArticle.content,
      category: newArticle.category || 'General',
      tags: newArticle.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      difficulty: newArticle.difficulty,
      type: newArticle.type,
      author: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      helpful: 0,
      isFeatured: false
    }

    setArticles(prev => [article, ...prev])
    setNewArticle({
      title: '',
      content: '',
      category: '',
      tags: '',
      difficulty: 'beginner',
      type: 'howto'
    })
    setIsCreateDialogOpen(false)
  }

  const handleMarkHelpful = (articleId: string) => {
    setArticles(prev => prev.map(article =>
      article.id === articleId
        ? { ...article, helpful: article.helpful + 1 }
        : article
    ))
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'howto': return <FileText className="w-4 h-4" />
      case 'troubleshooting': return <AlertTriangle className="w-4 h-4" />
      case 'faq': return <HelpCircle className="w-4 h-4" />
      case 'bestpractice': return <Star className="w-4 h-4" />
      default: return <BookOpen className="w-4 h-4" />
    }
  }

  const categories = ['all', ...Array.from(new Set(articles.map(a => a.category)))]
  const types = ['all', 'howto', 'troubleshooting', 'faq', 'bestpractice']

  return (
    <div className="flex h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-blue-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Knowledge Base
                </h1>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Self-help resources and guides
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Article
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Article</DialogTitle>
                    <DialogDescription>
                      Add a new knowledge base article to help users.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <Input
                        value={newArticle.title}
                        onChange={(e) => setNewArticle(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter article title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Content</label>
                      <textarea
                        className="w-full min-h-[200px] p-3 border border-gray-300 rounded-md resize-none"
                        value={newArticle.content}
                        onChange={(e) => setNewArticle(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Enter article content (supports Markdown)"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <Input
                          value={newArticle.category}
                          onChange={(e) => setNewArticle(prev => ({ ...prev, category: e.target.value }))}
                          placeholder="e.g., Getting Started"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                        <Input
                          value={newArticle.tags}
                          onChange={(e) => setNewArticle(prev => ({ ...prev, tags: e.target.value }))}
                          placeholder="e.g., setup, tutorial, basics"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Difficulty</label>
                        <select
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={newArticle.difficulty}
                          onChange={(e) => setNewArticle(prev => ({ ...prev, difficulty: e.target.value as any }))}
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={newArticle.type}
                          onChange={(e) => setNewArticle(prev => ({ ...prev, type: e.target.value as any }))}
                        >
                          <option value="howto">How-to Guide</option>
                          <option value="troubleshooting">Troubleshooting</option>
                          <option value="faq">FAQ</option>
                          <option value="bestpractice">Best Practice</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateArticle}>
                        Create Article
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-800 border-b border-blue-200 dark:border-slate-700 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Articles List */}
          <div className={`${selectedArticle ? 'hidden lg:block lg:w-1/2' : 'w-full'} border-r border-blue-200 dark:border-slate-700`}>
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {filteredArticles.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No articles found matching your search.</p>
                  </div>
                ) : (
                  filteredArticles.map(article => (
                    <Card 
                      key={article.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getTypeIcon(article.type)}
                              <CardTitle className="text-lg">{article.title}</CardTitle>
                              {article.isFeatured && (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                  <Star className="w-3 h-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="text-sm">
                              {article.category} • {article.author}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{article.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{article.createdAt.toLocaleDateString()}</span>
                          </div>
                          <Badge className={getDifficultyColor(article.difficulty)}>
                            {article.difficulty}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {article.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {article.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{article.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Article Detail */}
          {selectedArticle && (
            <div className="w-full lg:w-1/2 bg-white dark:bg-slate-800">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(selectedArticle.type)}
                      <h1 className="text-2xl font-bold">{selectedArticle.title}</h1>
                      {selectedArticle.isFeatured && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{selectedArticle.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{selectedArticle.createdAt.toLocaleDateString()}</span>
                      </div>
                      <Badge className={getDifficultyColor(selectedArticle.difficulty)}>
                        {selectedArticle.difficulty}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {selectedArticle.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="w-2 h-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div dangerouslySetInnerHTML={{ __html: selectedArticle.content.replace(/\n/g, '<br>') }} />
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{selectedArticle.views} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>{selectedArticle.helpful} found this helpful</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkHelpful(selectedArticle.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Helpful
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}