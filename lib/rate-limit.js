// lib/rate-limit.js

// Хранилище запросов в памяти
const requests = new Map();

// Очистка старых записей каждые 15 минут
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requests.entries()) {
    if (now > data.resetTime) {
      requests.delete(ip);
    }
  }
}, 15 * 60 * 1000);

export function rateLimit(ip, options = {}) {
  const {
    maxRequests = 10,        // максимум запросов
    windowMs = 15 * 60 * 1000 // 15 минут
  } = options;
  
  const now = Date.now();
  const record = requests.get(ip);
  
  // Первый запрос или истекло время
  if (!record || now > record.resetTime) {
    requests.set(ip, {
      count: 1,
      resetTime: now + windowMs
    });
    return { success: true, limit: maxRequests, remaining: maxRequests - 1 };
  }
  
  // Превышен лимит
  if (record.count >= maxRequests) {
    const waitTime = Math.ceil((record.resetTime - now) / 1000);
    return { 
      success: false, 
      limit: maxRequests, 
      remaining: 0, 
      resetTime: record.resetTime,
      waitTime 
    };
  }
  
  // Увеличиваем счетчик
  record.count++;
  requests.set(ip, record);
  return { 
    success: true, 
    limit: maxRequests, 
    remaining: maxRequests - record.count 
  };
}