import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { signSessionId, createFingerprint } from '@/lib/security';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return Response.json({ error: 'Неверный email или пароль' }, { status: 401 });
    }
    
    if (user.role === 'admin') {
      return Response.json({ error: 'Используйте страницу входа для администратора' }, { status: 403 });
    }
    
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return Response.json({ error: 'Неверный email или пароль' }, { status: 401 });
    }
    
    const fingerprint = await createFingerprint();
    const sessionId = uuidv4();
    const signature = signSessionId(sessionId);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);  // 1 день
    
    await prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        signature,
        fingerprint,
        expiresAt
      }
    });
    
    const cookieStore = await cookies();
    cookieStore.set('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,  // 1 день в секундах
      path: '/'
    });
    
    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt
    };
    
    return Response.json({ user: userWithoutPassword });
    
  } catch (error) {
    console.error('Ошибка входа:', error);
    return Response.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}