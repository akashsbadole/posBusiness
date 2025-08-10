import { paymentGatewayManager } from '../payment-gateway'
import { RazorpayGateway } from './razorpay'
import { PaytmGateway } from './paytm'
import { PayUGateway } from './payu'

export function initializePaymentGateways() {
  // Initialize Razorpay gateway
  const razorpayConfig = {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'test_secret',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret',
    environment: (process.env.NODE_ENV === 'production' ? 'production' : 'test') as 'test' | 'production'
  }

  const razorpayGateway = new RazorpayGateway(razorpayConfig)
  paymentGatewayManager.registerGateway(razorpayGateway)

  // Initialize Paytm gateway
  const paytmConfig = {
    merchantId: process.env.PAYTM_MERCHANT_ID || 'test_merchant',
    merchantKey: process.env.PAYTM_MERCHANT_KEY || 'test_key',
    industryType: process.env.PAYTM_INDUSTRY_TYPE || 'Retail',
    website: process.env.PAYTM_WEBSITE || 'WEBSTAGING',
    channelId: process.env.PAYTM_CHANNEL_ID || 'WEB',
    environment: (process.env.NODE_ENV === 'production' ? 'production' : 'test') as 'test' | 'production'
  }

  const paytmGateway = new PaytmGateway(paytmConfig)
  paymentGatewayManager.registerGateway(paytmGateway)

  // Initialize PayU gateway
  const payuConfig = {
    merchantKey: process.env.PAYU_MERCHANT_KEY || 'test_key',
    merchantSalt: process.env.PAYU_MERCHANT_SALT || 'test_salt',
    authHeader: process.env.PAYU_AUTH_HEADER || 'test_auth',
    environment: (process.env.NODE_ENV === 'production' ? 'production' : 'test') as 'test' | 'production'
  }

  const payuGateway = new PayUGateway(payuConfig)
  paymentGatewayManager.registerGateway(payuGateway)

  console.log('Payment gateways initialized successfully')
}

export { paymentGatewayManager }
export { RazorpayGateway } from './razorpay'
export { PaytmGateway } from './paytm'
export { PayUGateway } from './payu'