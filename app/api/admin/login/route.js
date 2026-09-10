import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { log } from '@/lib/logger';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // Получаем IP адрес
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      await log(null, 'admin_login_failed', { email, reason: 'user_not_found_or_wrong_role' }, ip);
      return Response.json({ error: 'Доступ запрещён' }, { status: 401 });
    }
    
    if (!user.isActive) {
      await log(user.id, 'admin_login_failed', { reason: 'account_inactive' }, ip);
      return Response.json({ error: 'Аккаунт деактивирован' }, { status: 401 });
    }
    
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      await log(user.id, 'admin_login_failed', { reason: 'wrong_password' }, ip);
      return Response.json({ error: 'Неверный пароль' }, { status: 401 });
    }
    
    const sessionId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);
    
    await prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        signature: 'admin-session',
        fingerprint: 'admin',
        expiresAt
      }
    });
    
    const cookieStore = await cookies();
    cookieStore.set('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/'
    });
    
    // Логируем успешный вход
    await log(user.id, 'admin_login_success', { email }, ip);
    
    return Response.json({ success: true, role: user.role });
    
  } catch (error) {
    console.error('Ошибка входа:', error);
    return Response.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}