import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')

class EncryptionService {
  private static getKey(): Buffer {
    // Ensure the key is exactly 32 bytes for AES-256
    const key = Buffer.from(ENCRYPTION_KEY, 'hex')
    if (key.length !== 32) {
      throw new Error('Encryption key must be 32 bytes (64 hex characters)')
    }
    return key
  }

  static encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    try {
      const iv = crypto.randomBytes(16) // Initialization vector
      const key = this.getKey()
      
      const cipher = crypto.createCipher(ALGORITHM, key)
      cipher.setAAD(Buffer.from('restaurant-pos', 'utf8')) // Additional authenticated data
      
      let encrypted = cipher.update(text, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      const tag = cipher.getAuthTag()
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      }
    } catch (error) {
      console.error('Encryption failed:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  static decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    try {
      const { encrypted, iv, tag } = encryptedData
      const key = this.getKey()
      
      const decipher = crypto.createDecipher(ALGORITHM, key)
      decipher.setAAD(Buffer.from('restaurant-pos', 'utf8'))
      decipher.setAuthTag(Buffer.from(tag, 'hex'))
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  static hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex')
  }

  static verifyPassword(password: string, hash: string): boolean {
    const passwordHash = this.hashPassword(password)
    return crypto.timingSafeEqual(
      Buffer.from(passwordHash, 'hex'),
      Buffer.from(hash, 'hex')
    )
  }

  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  static sanitizeSensitiveData(data: any): any {
    const sensitiveFields = [
      'password', 'passwordHash', 'creditCard', 'cvv', 'expiry',
      'bankAccount', 'ifsc', 'pan', 'aadhar', 'passport'
    ]

    const sanitized = { ...data }
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***'
      }
    }

    return sanitized
  }

  static encryptSensitiveObject(obj: any): any {
    const encrypted = { ...obj }
    
    const sensitiveFields = [
      'password', 'creditCard', 'cvv', 'expiry', 'bankAccount', 
      'ifsc', 'pan', 'aadhar', 'passport', 'phone', 'email'
    ]

    for (const field of sensitiveFields) {
      if (encrypted[field] && typeof encrypted[field] === 'string') {
        const encryptedData = this.encrypt(encrypted[field])
        encrypted[field] = JSON.stringify(encryptedData)
      }
    }

    return encrypted
  }

  static decryptSensitiveObject(obj: any): any {
    const decrypted = { ...obj }
    
    const sensitiveFields = [
      'password', 'creditCard', 'cvv', 'expiry', 'bankAccount', 
      'ifsc', 'pan', 'aadhar', 'passport', 'phone', 'email'
    ]

    for (const field of sensitiveFields) {
      if (decrypted[field] && typeof decrypted[field] === 'string') {
        try {
          const encryptedData = JSON.parse(decrypted[field])
          decrypted[field] = this.decrypt(encryptedData)
        } catch (error) {
          // If decryption fails, keep the original value
          console.warn(`Failed to decrypt field ${field}:`, error)
        }
      }
    }

    return decrypted
  }
}

export default EncryptionService