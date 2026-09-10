import crypto from 'crypto';
import { headers } from 'next/headers';

// Секретный ключ из .env
const SECRET = process.env.SESSION_SECRET;

// Создание подписи для sessionId
export function signSessionId(sessionId) {
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(sessionId)
    .digest('hex');
  return signature;
}

// Проверка подписи
export function verifySessionId(sessionId, signature) {
  const expectedSignature = signSessionId(sessionId);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Создание fingerprint (отпечаток браузера)
export async function createFingerprint() {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';
  
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${ip}|${userAgent}`)
    .digest('hex');
  
  return fingerprint;
}

// Проверка fingerprint
export function verifyFingerprint(storedFingerprint, currentFingerprint) {
  return crypto.timingSafeEqual(
    Buffer.from(storedFingerprint),
    Buffer.from(currentFingerprint)
  );
}