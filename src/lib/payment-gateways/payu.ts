import { PaymentGateway, PaymentData, PaymentResult, RefundData, RefundResult, PaymentStatus, PayUConfig } from '../payment-gateway'

export class PayUGateway implements PaymentGateway {
  name = 'PayU'
  id = 'payu'
  enabled = false
  config: PayUConfig

  constructor(config: PayUConfig) {
    this.config = config
    this.enabled = true
  }

  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      const transactionId = `PAYU_${Date.now()}`
      
      const payuParams = {
        key: this.config.merchantKey,
        txnid: transactionId,
        amount: paymentData.amount.toString(),
        productinfo: paymentData.description || 'Payment for order',
        firstname: paymentData.customerName?.split(' ')[0] || '',
        lastname: paymentData.customerName?.split(' ')[1] || '',
        email: paymentData.customerEmail || '',
        phone: paymentData.customerPhone || '',
        surl: paymentData.callbackUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/payu/success`,
        furl: paymentData.callbackUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/payu/failure`,
        curl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/payu/cancel`,
        hash: this.generateHash({
          key: this.config.merchantKey,
          txnid: transactionId,
          amount: paymentData.amount.toString(),
          productinfo: paymentData.description || 'Payment for order',
          firstname: paymentData.customerName?.split(' ')[0] || '',
          email: paymentData.customerEmail || '',
          udf1: '',
          udf2: '',
          udf3: '',
          udf4: '',
          udf5: ''
        }),
        service_provider: 'payu_paisa'
      }

      // Simulate PayU payment initiation
      const response = await this.simulatePayUPayment(payuParams)
      
      return {
        success: true,
        transactionId: transactionId,
        paymentId: response.mihpayid,
        status: 'PENDING',
        message: 'Payment initiated successfully',
        gatewayResponse: response,
        redirectUrl: response.redirectUrl,
        amount: paymentData.amount,
        currency: paymentData.currency || 'INR',
        hash: payuParams.hash
      }
    } catch (error) {
      console.error('PayU payment error:', error)
      return {
        success: false,
        status: 'FAILED',
        message: error instanceof Error ? error.message : 'Payment processing failed'
      }
    }
  }

  async refundPayment(refundData: RefundData): Promise<RefundResult> {
    try {
      const refundParams = {
        key: this.config.merchantKey,
        command: 'cancel_refund_transaction',
        var1: refundData.transactionId,
        var2: refundData.amount.toString(),
        var3: refundData.reason || 'Customer requested refund',
        hash: this.generateRefundHash({
          key: this.config.merchantKey,
          command: 'cancel_refund_transaction',
          var1: refundData.transactionId,
          var2: refundData.amount.toString()
        })
      }

      const refundResponse = await this.simulatePayURefund(refundParams)
      
      return {
        success: true,
        refundId: refundResponse.request_id,
        status: 'PENDING',
        message: 'Refund initiated successfully',
        gatewayResponse: refundResponse
      }
    } catch (error) {
      console.error('PayU refund error:', error)
      return {
        success: false,
        status: 'FAILED',
        message: error instanceof Error ? error.message : 'Refund processing failed'
      }
    }
  }

  async getStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      const statusParams = {
        key: this.config.merchantKey,
        command: 'verify_payment',
        var1: transactionId,
        hash: this.generateStatusHash({
          key: this.config.merchantKey,
          command: 'verify_payment',
          var1: transactionId
        })
      }

      const statusResponse = await this.simulatePayUStatus(statusParams)
      
      return {
        status: this.mapPayUStatus(statusResponse.status),
        amount: parseFloat(statusResponse.amount || '0'),
        transactionId: statusResponse.txnid,
        gatewayResponse: statusResponse
      }
    } catch (error) {
      console.error('PayU status check error:', error)
      return {
        status: 'FAILED',
        message: error instanceof Error ? error.message : 'Status check failed'
      }
    }
  }

  private mapPayUStatus(payuStatus: string): 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' {
    const statusMap: { [key: string]: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' } = {
      'pending': 'PENDING',
      'success': 'COMPLETED',
      'failure': 'FAILED',
      'cancelled': 'CANCELLED',
      'in progress': 'PENDING',
      'bounced': 'FAILED',
      'dropped': 'CANCELLED'
    }
    
    return statusMap[payuStatus.toLowerCase()] || 'PENDING'
  }

  private generateHash(params: any): string {
    try {
      // In a real implementation, you would generate hash using SHA512
      // For simulation, we'll return a dummy hash
      const hashString = `${params.key}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|${params.udf1}|${params.udf2}|${params.udf3}|${params.udf4}|${params.udf5}||||||${this.config.merchantSalt}`
      return `hash_${Buffer.from(hashString).toString('base64').substring(0, 20)}`
    } catch (error) {
      console.error('Hash generation failed:', error)
      return ''
    }
  }

  private generateRefundHash(params: any): string {
    try {
      const hashString = `${params.key}|${params.command}|${params.var1}|${params.var2}||||||${this.config.merchantSalt}`
      return `refund_hash_${Buffer.from(hashString).toString('base64').substring(0, 20)}`
    } catch (error) {
      console.error('Refund hash generation failed:', error)
      return ''
    }
  }

  private generateStatusHash(params: any): string {
    try {
      const hashString = `${params.key}|${params.command}|${params.var1}|${this.config.merchantSalt}`
      return `status_hash_${Buffer.from(hashString).toString('base64').substring(0, 20)}`
    } catch (error) {
      console.error('Status hash generation failed:', error)
      return ''
    }
  }

  private async simulatePayUPayment(params: any) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      mihpayid: `payu_${Date.now()}`,
      redirectUrl: `https://secure.payu.in/_payment?payment_gateway=${params.key}&transaction_id=${params.txnid}`,
      status: 'pending',
      message: 'Payment initiated successfully'
    }
  }

  private async simulatePayURefund(params: any) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1600))
    
    return {
      request_id: `refund_${Date.now()}`,
      status: 'pending',
      message: 'Refund initiated successfully',
      refund_amount: params.var2
    }
  }

  private async simulatePayUStatus(params: any) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const statuses = ['pending', 'success', 'failure']
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    
    return {
      status: randomStatus,
      txnid: params.var1,
      amount: '100.00',
      addedon: new Date().toISOString(),
      productinfo: 'Payment for order',
      firstname: 'Customer',
      lastname: 'Name',
      email: 'customer@example.com',
      phone: '9999999999',
      mihpayid: `payu_${Date.now()}`,
      mode: 'UPI'
    }
  }

  // Verify PayU response hash
  verifyResponseHash(params: any, hash: string): boolean {
    try {
      // In a real implementation, you would verify the hash
      // For simulation, we'll just return true
      return true
    } catch (error) {
      console.error('Response hash verification failed:', error)
      return false
    }
  }

  // Parse PayU webhook response
  parseWebhookResponse(response: any) {
    return {
      transactionId: response.txnid,
      status: this.mapPayUStatus(response.status),
      amount: parseFloat(response.amount || '0'),
      paymentId: response.mihpayid,
      mode: response.mode,
      gatewayResponse: response
    }
  }
}