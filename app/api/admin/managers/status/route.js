import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    console.log('1. Начало POST запроса');
    
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('sessionId')?.value;
    console.log('2. Session ID:', sessionId);
    
    if (!sessionId) {
      console.log('3. Нет sessionId');
      return Response.json({ error: 'Неавторизован' }, { status: 401 });
    }
    
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true }
    });
    console.log('4. Session найден:', !!session);
    
    if (!session) {
      console.log('5. Сессия не найдена');
      return Response.json({ error: 'Неавторизован' }, { status: 401 });
    }
    
    console.log('6. Роль пользователя:', session.user?.role);
    
    if (session.user?.role !== 'admin') {
      console.log('7. Не админ');
      return Response.json({ error: 'Доступ запрещён' }, { status: 403 });
    }
    
    const body = await request.json();
    console.log('8. Тело запроса:', body);
    
    const { name, email, phone, password, role } = body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('9. Пароль захэширован');
    
    const manager = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: role || 'manager',
        isActive: true
      }
    });
    console.log('10. Менеджер создан:', manager.id);
    
    return Response.json(manager);
  } catch (error) {
    console.error('ОШИБКА POST:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}