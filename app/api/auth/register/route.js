import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Схема для регистрации
const registerSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов').max(50, 'Пароль слишком длинный'),
  name: z.string().min(1, 'Имя обязательно').max(100, 'Имя слишком длинное').optional().nullable(),
  phone: z.string().regex(/^[\d\s\+\(\)\-]+$/, 'Неверный формат телефона').optional().nullable(),
  role: z.string().optional().default('user')
});

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Валидация данных
    const validation = registerSchema.safeParse({
      email: body.email,
      password: body.password,
      name: body.name,
      phone: body.phone,
      role: body.role
    });
    
    if (!validation.success) {
      return Response.json({ 
        error: 'Ошибка валидации', 
        details: validation.error.errors 
      }, { status: 400 });
    }
    
    const { email, password, name, phone } = validation.data;
    
    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return Response.json({ error: 'Пользователь с таким email уже существует' }, { status: 400 });
    }
    
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Создаём пользователя (роль всегда user, даже если передали другую)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        phone: phone || null,
        role: 'user'
      }
    });
    
    return Response.json({ success: true });
    
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    return Response.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}