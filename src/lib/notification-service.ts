interface NotificationRecipient {
  id: string
  name: string
  email?: string
  phone?: string
  preferences: {
    email: boolean
    sms: boolean
    whatsapp: boolean
  }
}

interface NotificationTemplate {
  id: string
  name: string
  type: 'email' | 'sms' | 'whatsapp'
  subject?: string
  content: string
  variables: string[]
}

interface NotificationPayload {
  recipient: NotificationRecipient
  template: NotificationTemplate
  variables: { [key: string]: any }
  priority?: 'low' | 'normal' | 'high'
}

interface NotificationResult {
  success: boolean
  messageId?: string
  error?: string
  channel: string
}

export class NotificationService {
  private emailService: EmailService
  private smsService: SMSService
  private whatsappService: WhatsAppService

  constructor() {
    this.emailService = new EmailService()
    this.smsService = new SMSService()
    this.whatsappService = new WhatsAppService()
  }

  async sendNotification(payload: NotificationPayload): Promise<NotificationResult[]> {
    const results: NotificationResult[] = []
    const { recipient, template, variables, priority = 'normal' } = payload

    // Replace template variables
    const processedContent = this.processTemplate(template.content, variables)
    const processedSubject = template.subject ? this.processTemplate(template.subject, variables) : undefined

    // Send based on recipient preferences and template type
    if (template.type === 'email' && recipient.preferences.email && recipient.email) {
      const emailResult = await this.emailService.sendEmail({
        to: recipient.email,
        subject: processedSubject || 'Notification',
        content: processedContent,
        priority
      })
      results.push(emailResult)
    }

    if (template.type === 'sms' && recipient.preferences.sms && recipient.phone) {
      const smsResult = await this.smsService.sendSMS({
        to: recipient.phone,
        content: processedContent,
        priority
      })
      results.push(smsResult)
    }

    if (template.type === 'whatsapp' && recipient.preferences.whatsapp && recipient.phone) {
      const whatsappResult = await this.whatsappService.sendWhatsApp({
        to: recipient.phone,
        content: processedContent,
        priority
      })
      results.push(whatsappResult)
    }

    return results
  }

  async sendBulkNotifications(
    recipients: NotificationRecipient[],
    template: NotificationTemplate,
    variablesList: { [key: string]: any }[]
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = []

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i]
      const variables = variablesList[i] || {}

      try {
        const notificationResults = await this.sendNotification({
          recipient,
          template,
          variables,
          priority: 'normal'
        })
        results.push(...notificationResults)
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          channel: template.type
        })
      }
    }

    return results
  }

  private processTemplate(template: string, variables: { [key: string]: any }): string {
    let processed = template

    // Replace {{variable}} placeholders
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      processed = processed.replace(regex, String(variables[key]))
    })

    // Replace conditional blocks {% if condition %}...{% endif %}
    processed = processed.replace(/{% if (\w+) %}([\s\S]*?){% endif %}/g, (match, condition, content) => {
      return variables[condition] ? content.trim() : ''
    })

    return processed
  }
}

class EmailService {
  async sendEmail(params: {
    to: string
    subject: string
    content: string
    priority?: 'low' | 'normal' | 'high'
  }): Promise<NotificationResult> {
    try {
      // In a real implementation, you would use services like:
      // - SendGrid
      // - AWS SES
      // - NodeMailer with SMTP
      // - Resend
      
      // For demonstration, we'll simulate the email sending
      console.log(`Sending email to ${params.to}:`, {
        subject: params.subject,
        content: params.content,
        priority: params.priority
      })

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock successful response
      return {
        success: true,
        messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        channel: 'email'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
        channel: 'email'
      }
    }
  }
}

class SMSService {
  async sendSMS(params: {
    to: string
    content: string
    priority?: 'low' | 'normal' | 'high'
  }): Promise<NotificationResult> {
    try {
      // In a real implementation, you would use services like:
      // - Twilio
      // - AWS SNS
      // - MSG91
      // - Exotel
      // - Indian SMS services like Karix, Knowlarity, etc.

      console.log(`Sending SMS to ${params.to}:`, {
        content: params.content,
        priority: params.priority
      })

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mock successful response
      return {
        success: true,
        messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        channel: 'sms'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send SMS',
        channel: 'sms'
      }
    }
  }
}

class WhatsAppService {
  async sendWhatsApp(params: {
    to: string
    content: string
    priority?: 'low' | 'normal' | 'high'
  }): Promise<NotificationResult> {
    try {
      // In a real implementation, you would use services like:
      // - Twilio WhatsApp API
      // - WhatsApp Business API
      // - Gupshup
      // - Karix
      // - Other Indian WhatsApp Business API providers

      console.log(`Sending WhatsApp message to ${params.to}:`, {
        content: params.content,
        priority: params.priority
      })

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200))

      // Mock successful response
      return {
        success: true,
        messageId: `whatsapp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        channel: 'whatsapp'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send WhatsApp message',
        channel: 'whatsapp'
      }
    }
  }
}

// Predefined notification templates for Indian POS system
export const notificationTemplates: { [key: string]: NotificationTemplate } = {
  // Order notifications
  order_confirmation: {
    id: 'order_confirmation',
    name: 'Order Confirmation',
    type: 'email',
    subject: 'Order Confirmation - {{orderNumber}}',
    content: `
Dear {{customerName}},

Thank you for your order at {{restaurantName}}!

Order Details:
- Order Number: {{orderNumber}}
- Order Type: {{orderType}}
- Total Amount: ₹{{totalAmount}}
- Estimated Delivery/Pickup Time: {{estimatedTime}}

Order Items:
{% for item in orderItems %}
- {{item.quantity}}x {{item.name}} - ₹{{item.total}}
{% endfor %}

You can track your order status here: {{trackingUrl}}

Thank you for choosing us!

{{restaurantName}}
{{restaurantPhone}}
{{restaurantAddress}}
    `,
    variables: ['customerName', 'restaurantName', 'orderNumber', 'orderType', 'totalAmount', 'estimatedTime', 'orderItems', 'trackingUrl', 'restaurantPhone', 'restaurantAddress']
  },

  order_ready_sms: {
    id: 'order_ready_sms',
    name: 'Order Ready SMS',
    type: 'sms',
    content: `Hi {{customerName}}, your order #{{orderNumber}} from {{restaurantName}} is ready for {{orderType}}! Total: ₹{{totalAmount}}. {{restaurantPhone}}`,
    variables: ['customerName', 'orderNumber', 'restaurantName', 'orderType', 'totalAmount', 'restaurantPhone']
  },

  order_delivered_whatsapp: {
    id: 'order_delivered_whatsapp',
    name: 'Order Delivered WhatsApp',
    type: 'whatsapp',
    content: `Hi {{customerName}}! 🎉 Your order #{{orderNumber}} from {{restaurantName}} has been delivered successfully! We hope you enjoyed your meal. Rate your experience: {{ratingUrl}}. Thank you! 🙏`,
    variables: ['customerName', 'orderNumber', 'restaurantName', 'ratingUrl']
  },

  // Payment notifications
  payment_success: {
    id: 'payment_success',
    name: 'Payment Success',
    type: 'email',
    subject: 'Payment Successful - Order #{{orderNumber}}',
    content: `
Dear {{customerName}},

Your payment for Order #{{orderNumber}} has been successfully processed.

Payment Details:
- Order Number: {{orderNumber}}
- Amount Paid: ₹{{amount}}
- Payment Method: {{paymentMethod}}
- Transaction ID: {{transactionId}}
- Payment Date: {{paymentDate}}

Thank you for your payment!

{{restaurantName}}
    `,
    variables: ['customerName', 'orderNumber', 'amount', 'paymentMethod', 'transactionId', 'paymentDate', 'restaurantName']
  },

  payment_failed: {
    id: 'payment_failed',
    name: 'Payment Failed',
    type: 'sms',
    content: `Hi {{customerName}}, your payment of ₹{{amount}} for order #{{orderNumber}} failed. Please try again or contact us at {{restaurantPhone}}. {{restaurantName}}`,
    variables: ['customerName', 'amount', 'orderNumber', 'restaurantPhone', 'restaurantName']
  },

  // Promotional notifications
  promotion_email: {
    id: 'promotion_email',
    name: 'Promotional Email',
    type: 'email',
    subject: 'Special Offer - {{discount}}% off your next order!',
    content: `
Hi {{customerName}},

Exclusive offer just for you! Get {{discount}}% off your next order at {{restaurantName}}.

Offer Details:
- Discount: {{discount}}% off
- Valid Until: {{validUntil}}
- Use Code: {{promoCode}}
- Minimum Order: ₹{{minOrderAmount}}

Terms and conditions apply. Visit us at {{restaurantWebsite}} or call {{restaurantPhone}}.

Don't miss out on this delicious deal!

{{restaurantName}}
{{restaurantAddress}}
    `,
    variables: ['customerName', 'discount', 'restaurantName', 'validUntil', 'promoCode', 'minOrderAmount', 'restaurantWebsite', 'restaurantPhone', 'restaurantAddress']
  },

  festival_offer_sms: {
    id: 'festival_offer_sms',
    name: 'Festival Offer SMS',
    type: 'sms',
    content: `🎉 {{festival}} wishes from {{restaurantName}}! Get {{discount}}% off on all orders today. Use code {{promoCode}}. Valid till {{validTime}}. Order now: {{orderUrl}}. {{restaurantPhone}}`,
    variables: ['festival', 'restaurantName', 'discount', 'promoCode', 'validTime', 'orderUrl', 'restaurantPhone']
  },

  // Loyalty program notifications
  loyalty_points_earned: {
    id: 'loyalty_points_earned',
    name: 'Loyalty Points Earned',
    type: 'sms',
    content: `Hi {{customerName}}, you've earned {{points}} loyalty points on your recent order! Current balance: {{totalPoints}} points. Redeem for exciting rewards. {{restaurantName}}`,
    variables: ['customerName', 'points', 'totalPoints', 'restaurantName']
  },

  loyalty_reward_available: {
    id: 'loyalty_reward_available',
    name: 'Loyalty Reward Available',
    type: 'whatsapp',
    content: `🎁 Congratulations {{customerName}}! You have enough points to redeem {{rewardName}}. Visit {{restaurantName}} to claim your reward. Your points balance: {{totalPoints}}. Redeem now!`,
    variables: ['customerName', 'rewardName', 'restaurantName', 'totalPoints']
  },

  // Staff notifications
  staff_schedule_reminder: {
    id: 'staff_schedule_reminder',
    name: 'Staff Schedule Reminder',
    type: 'sms',
    content: `Hi {{staffName}}, this is a reminder for your shift tomorrow at {{restaurantName}}. Time: {{shiftTime}}. Please be on time. {{managerPhone}}`,
    variables: ['staffName', 'restaurantName', 'shiftTime', 'managerPhone']
  },

  low_stock_alert: {
    id: 'low_stock_alert',
    name: 'Low Stock Alert',
    type: 'email',
    subject: 'Low Stock Alert - {{itemName}}',
    content: `
Hi {{managerName}},

This is to inform you that the following item is running low on stock:

Item Details:
- Item Name: {{itemName}}
- Current Stock: {{currentStock}} {{unit}}
- Minimum Stock: {{minStock}} {{unit}}
- Reorder Level: {{reorderLevel}} {{unit}}

Please reorder soon to avoid stockouts.

{{restaurantName}}
Inventory Management System
    `,
    variables: ['managerName', 'itemName', 'currentStock', 'unit', 'minStock', 'reorderLevel', 'restaurantName']
  }
}

// Create a singleton instance
export const notificationService = new NotificationService()