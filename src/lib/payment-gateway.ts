import { PaymentMethod } from '@prisma/client'

export interface PaymentGateway {
  name: string
  id: string
  enabled: boolean
  config: PaymentGatewayConfig
  processPayment: (paymentData: PaymentData) => Promise<PaymentResult>
  refundPayment: (refundData: RefundData) => Promise<RefundResult>
  getStatus: (transactionId: string) => Promise<PaymentStatus>
}

export interface PaymentGatewayConfig {
  apiKey?: string
  secretKey?: string
  merchantId?: string
  environment: 'test' | 'production'
  webhookSecret?: string
  [key: string]: any
}

export interface PaymentData {
  amount: number
  currency: string
  orderId: string
  customerEmail?: string
  customerPhone?: string
  customerName?: string
  description?: string
  callbackUrl?: string
  [key: string]: any
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  paymentId?: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  message?: string
  gatewayResponse?: any
  redirectUrl?: string
  [key: string]: any
}

export interface RefundData {
  transactionId: string
  amount: number
  reason?: string
  [key: string]: any
}

export interface RefundResult {
  success: boolean
  refundId?: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  message?: string
  [key: string]: any
}

export interface PaymentStatus {
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  amount?: number
  transactionId?: string
  gatewayResponse?: any
}

export interface RazorpayConfig extends PaymentGatewayConfig {
  keyId: string
  keySecret: string
  webhookSecret: string
}

export interface PaytmConfig extends PaymentGatewayConfig {
  merchantId: string
  merchantKey: string
  industryType: string
  website: string
  channelId: string
}

export interface PayUConfig extends PaymentGatewayConfig {
  merchantKey: string
  merchantSalt: string
  authHeader: string
}

export class PaymentGatewayManager {
  private gateways: Map<string, PaymentGateway> = new Map()

  registerGateway(gateway: PaymentGateway) {
    this.gateways.set(gateway.id, gateway)
  }

  getGateway(gatewayId: string): PaymentGateway | undefined {
    return this.gateways.get(gatewayId)
  }

  getEnabledGateways(): PaymentGateway[] {
    return Array.from(this.gateways.values()).filter(gateway => gateway.enabled)
  }

  async processPayment(gatewayId: string, paymentData: PaymentData): Promise<PaymentResult> {
    const gateway = this.getGateway(gatewayId)
    if (!gateway) {
      throw new Error(`Payment gateway ${gatewayId} not found`)
    }
    return await gateway.processPayment(paymentData)
  }

  async refundPayment(gatewayId: string, refundData: RefundData): Promise<RefundResult> {
    const gateway = this.getGateway(gatewayId)
    if (!gateway) {
      throw new Error(`Payment gateway ${gatewayId} not found`)
    }
    return await gateway.refundPayment(refundData)
  }

  async getPaymentStatus(gatewayId: string, transactionId: string): Promise<PaymentStatus> {
    const gateway = this.getGateway(gatewayId)
    if (!gateway) {
      throw new Error(`Payment gateway ${gatewayId} not found`)
    }
    return await gateway.getStatus(transactionId)
  }
}

export const paymentGatewayManager = new PaymentGatewayManager()