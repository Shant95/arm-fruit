// lib/auth.js
import { cookies } from 'next/headers';
import { prisma } from './prisma';

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('sessionId')?.value;
  
  if (!sessionId) return null;
  
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true }
  });
  
  if (!session || session.expiresAt < new Date()) return null;
  
  // Продлеваем сессию
  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + 1);
  
  await prisma.session.update({
    where: { id: sessionId },
    data: { expiresAt: newExpiresAt }
  });
  
  return session;
}

export async function requireAuth(requiredRole = null, requiredPermissions = []) {
  const session = await getSession();
  
  if (!session) {
    return { error: 'Неавторизован', status: 401 };
  }
  
  const user = session.user;
  
  // Проверка роли
  if (requiredRole && user.role !== requiredRole) {
    return { error: 'Доступ запрещён', status: 403 };
  }
  
  // Проверка прав для менеджера
  if (user.role === 'manager' && requiredPermissions.length > 0) {
    const hasPermissions = requiredPermissions.every(perm => user[perm] === true);
    if (!hasPermissions) {
      return { error: 'Доступ запрещён', status: 403 };
    }
  }
  
  return { user, session };
}