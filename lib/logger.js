// lib/logger.js
import { prisma } from './prisma';

export async function log(userId, action, details = {}, ip = null) {
  try {
    await prisma.log.create({
      data: {
        userId: userId || null,
        action,
        details,
        ip: ip || null
      }
    });
  } catch (error) {
    console.error('Ошибка логирования:', error);
  }
}