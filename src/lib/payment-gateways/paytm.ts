import { PaymentGateway, PaymentData, PaymentResult, RefundData, RefundResult, PaymentStatus, PaytmConfig } from '../payment-gateway'

export class PaytmGateway implements PaymentGateway {
  name = 'Paytm'
  id = 'paytm'
  enabled = false
  config: PaytmConfig

  constructor(config: PaytmConfig) {
    this.config = config
    this.enabled = true
  }

  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // Generate transaction ID
      const orderId = paymentData.orderId
      const transactionId = `PAYTM_${Date.now()}`
      
      const paytmParams = {
        body: {
          requestType: 'Payment',
          mid: this.config.merchantId,
          websiteName: this.config.website,
          orderId: orderId,
          callbackUrl: paymentData.callbackUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/paytm/callback`,
          txnAmount: {
            value: paymentData.amount.toString(),
            currency: paymentData.currency || 'INR'
          },
          userInfo: {
            custId: paymentData.customerPhone || 'CUST_001',
            email: paymentData.customerEmail || '',
            firstName: paymentData.customerName?.split(' ')[0] || '',
            lastName: paymentData.customerName?.split(' ')[1] || '',
            mobile: paymentData.customerPhone || ''
          }
        }
      }

      // Simulate Paytm transaction token generation
      const response = await this.simulatePaytmTransaction(paytmParams)
      
      return {
        success: true,
        transactionId: transactionId,
        paymentId: response.txnToken,
        status: 'PENDING',
        message: 'Payment initiated successfully',
        gatewayResponse: response,
        redirectUrl: response.redirectUrl,
        amount: paymentData.amount,
        currency: paymentData.currency || 'INR',
        mid: this.config.merchantId,
        orderId: orderId
      }
    } catch (error) {
      console.error('Paytm payment error:', error)
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
        body: {
          mid: this.config.merchantId,
          txnId: refundData.transactionId,
          refundAmount: refundData.amount.toString(),
          extraParamsMap: {
            REFUND_REASON: refundData.reason || 'Customer requested refund'
          }
        }
      }

      const refundResponse = await this.simulatePaytmRefund(refundParams)
      
      return {
        success: true,
        refundId: refundResponse.refundId,
        status: 'PENDING',
        message: 'Refund initiated successfully',
        gatewayResponse: refundResponse
      }
    } catch (error) {
      console.error('Paytm refund error:', error)
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
        body: {
          mid: this.config.merchantId,
          txnId: transactionId
        }
      }

      const statusResponse = await this.simulatePaytmStatus(statusParams)
      
      return {
        status: this.mapPaytmStatus(statusResponse.resultInfo.status),
        amount: parseFloat(statusResponse.txnAmount?.value || '0'),
        transactionId: statusResponse.txnId,
        gatewayResponse: statusResponse
      }
    } catch (error) {
      console.error('Paytm status check error:', error)
      return {
        status: 'FAILED',
        message: error instanceof Error ? error.message : 'Status check failed'
      }
    }
  }

  private mapPaytmStatus(paytmStatus: string): 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' {
    const statusMap: { [key: string]: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' } = {
      'PENDING': 'PENDING',
      'TXN_SUCCESS': 'COMPLETED',
      'TXN_FAILURE': 'FAILED',
      'CLOSED': 'CANCELLED',
      'SUCCESS': 'COMPLETED',
      'FAILURE': 'FAILED'
    }
    
    return statusMap[paytmStatus] || 'PENDING'
  }

  private async simulatePaytmTransaction(params: any) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    return {
      head: {
        responseTimestamp: Date.now().toString(),
        version: 'v1'
      },
      body: {
        txnToken: `paytm_txn_${Date.now()}`,
        isPromo: false,
        redirectUrl: `https://securegw.paytm.in/order/process?orderId=${params.body.orderId}&token=${Date.now()}`,
        callbackUrl: params.body.callbackUrl
      }
    }
  }

  private async simulatePaytmRefund(params: any) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1800))
    
    return {
      head: {
        responseTimestamp: Date.now().toString(),
        version: 'v1'
      },
      body: {
        refundId: `refund_${Date.now()}`,
        resultInfo: {
          resultStatus: 'SUCCESS',
          resultCode: '000',
          resultMsg: 'Refund initiated successfully'
        }
      }
    }
  }

  private async simulatePaytmStatus(params: any) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const statuses = ['PENDING', 'TXN_SUCCESS', 'TXN_FAILURE']
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    
    return {
      head: {
        responseTimestamp: Date.now().toString(),
        version: 'v1'
      },
      body: {
        orderId: params.body.txnId,
        txnId: params.body.txnId,
        resultInfo: {
          resultStatus: randomStatus,
          resultCode: randomStatus === 'TXN_SUCCESS' ? '000' : '001',
          resultMsg: randomStatus === 'TXN_SUCCESS' ? 'Transaction successful' : 'Transaction failed'
        },
        txnAmount: {
          value: '100.00',
          currency: 'INR'
        },
        status: randomStatus
      }
    }
  }

  // Verify Paytm checksum
  verifyChecksum(params: any, checksum: string): boolean {
    try {
      // In a real implementation, you would verify the checksum using Paytm's library
      // For simulation, we'll just return true
      return true
    } catch (error) {
      console.error('Checksum verification failed:', error)
      return false
    }
  }

  // Generate checksum for Paytm requests
  generateChecksum(params: any): string {
    try {
      // In a real implementation, you would generate checksum using Paytm's library
      // For simulation, we'll return a dummy checksum
      return `checksum_${Date.now()}`
    } catch (error) {
      console.error('Checksum generation failed:', error)
      return ''
    }
  }
}