import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// We use the JWT_SECRET to derive a secure 32-byte key for encryption
const SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev_mode';

// Derive a 32-byte key
const KEY = crypto.scryptSync(SECRET, 'salt', 32);

export function encrypt(text: string): string {
  if (!text) return '';
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Format: iv:authTag:encryptedText
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  
  // Not in encrypted format (no colons) → plain text
  if (!encryptedText.includes(':')) return encryptedText;

  try {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
    if (!ivHex || !authTagHex || !encrypted) return encryptedText;

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return ''
  }
}
