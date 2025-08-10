import { NextRequest, NextResponse } from 'next/server'
import EncryptionService from './encryption'

export function withEncryption(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Clone the request to read the body
      const reqClone = req.clone()
      
      // Only process POST/PUT/PATCH requests with JSON body
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          try {
            const body = await reqClone.json()
            
            // Encrypt sensitive data in the request body
            const encryptedBody = EncryptionService.encryptSensitiveObject(body)
            
            // Create a new request with the encrypted body
            const encryptedRequest = new NextRequest(req.url, {
              method: req.method,
              headers: req.headers,
              body: JSON.stringify(encryptedBody)
            })
            
            // Call the original handler with the encrypted request
            const response = await handler(encryptedRequest)
            
            // Clone the response to modify it
            const responseClone = response.clone()
            
            // Only process JSON responses
            const responseContentType = response.headers.get('content-type')
            if (responseContentType?.includes('application/json')) {
              try {
                const responseBody = await responseClone.json()
                
                // Decrypt sensitive data in the response
                const decryptedBody = EncryptionService.decryptSensitiveObject(responseBody)
                
                // Create a new response with the decrypted body
                return new NextResponse(JSON.stringify(decryptedBody), {
                  status: response.status,
                  statusText: response.statusText,
                  headers: response.headers
                })
              } catch (error) {
                console.warn('Failed to decrypt response body:', error)
                // Return original response if decryption fails
                return response
              }
            }
            
            return response
          } catch (error) {
            console.warn('Failed to process request body:', error)
            // Call original handler if body processing fails
            return await handler(req)
          }
        }
      }
      
      // For non-JSON requests or other methods, call the original handler
      return await handler(req)
    } catch (error) {
      console.error('Encryption middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

export function sanitizeResponseData(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const response = await handler(req)
      
      // Clone the response to modify it
      const responseClone = response.clone()
      
      // Only process JSON responses
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        try {
          const responseBody = await responseClone.json()
          
          // Sanitize sensitive data in the response
          const sanitizedBody = EncryptionService.sanitizeSensitiveData(responseBody)
          
          // Create a new response with the sanitized body
          return new NextResponse(JSON.stringify(sanitizedBody), {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          })
        } catch (error) {
          console.warn('Failed to sanitize response body:', error)
          // Return original response if sanitization fails
          return response
        }
      }
      
      return response
    } catch (error) {
      console.error('Sanitization middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}