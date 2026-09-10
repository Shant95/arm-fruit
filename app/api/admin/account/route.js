import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { requireAuth } from '@/lib/auth';

export async function PUT(request) {
  try {
    // Проверка авторизации (админ или менеджер)
    const auth = await requireAuth();
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    // Проверка, что пользователь имеет роль admin или manager
    if (auth.user.role !== 'admin' && auth.user.role !== 'manager') {
      return Response.json({ error: 'Доступ запрещён' }, { status: 403 });
    }
    
    const { name, lastName, phone, currentPassword, newPassword } = await request.json();
    
    // Подготовка данных для обновления
    const updateData = {
      name: name || null,
      lastName: lastName || null,
      phone: phone || null
    };
    
    // Если передан новый пароль - проверяем текущий и обновляем
    if (newPassword) {
      if (!currentPassword) {
        return Response.json({ error: 'Введите текущий пароль' }, { status: 400 });
      }
      
      // Проверяем текущий пароль
      const isPasswordValid = await bcrypt.compare(currentPassword, auth.user.password);
      if (!isPasswordValid) {
        return Response.json({ error: 'Неверный текущий пароль' }, { status: 400 });
      }
      
      // Хешируем новый пароль
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }
    
    const user = await prisma.user.update({
      where: { id: auth.user.id },
      data: updateData
    });
    
    return Response.json({
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
  } catch (error) {
    console.error('Ошибка обновления:', error);
    return Response.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}