import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';

// Схема для товара в заказе
const orderItemSchema = z.object({
  name: z.string().min(1, 'Название товара обязательно'),
  nameAm: z.string().optional().nullable(),
  quantity: z.number().min(1, 'Количество должно быть больше 0'),
  price: z.number().min(0, 'Цена не может быть отрицательной'),
  isOnOrder: z.boolean().optional().default(false),
  unit: z.string().optional()
});

// Схема для заказа
const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Заказ не может быть пустым'),
  total: z.number().min(0, 'Сумма не может быть отрицательной')
});

export async function POST(request) {
  try {
    // Проверка авторизации (любой авторизованный пользователь)
    const auth = await requireAuth();
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const body = await request.json();
    
    // Валидация данных
    const validation = orderSchema.safeParse({
      items: body.items,
      total: body.total
    });
    
    if (!validation.success) {
      return Response.json({ 
        error: 'Ошибка валидации', 
        details: validation.error.errors 
      }, { status: 400 });
    }
    
    const { items, total } = validation.data;
    
    // Добавляем изображения и армянские названия к товарам в заказе
    const itemsWithImages = await Promise.all(items.map(async (item) => {
      // Пробуем найти товар в базе, чтобы получить изображение и армянское название
      const product = await prisma.product.findFirst({
        where: { name: item.name },
        select: { image: true, unit: true, nameAm: true }
      });
      
      return {
        name: item.name,
        nameAm: product?.nameAm || item.nameAm || null,
        quantity: item.quantity,
        price: item.price,
        isOnOrder: item.isOnOrder || false,
        image: product?.image || item.image || '📦',
        unit: product?.unit || item.unit || 'kg'
      };
    }));
    
    const order = await prisma.order.create({
      data: {
        userId: auth.user.id,
        items: itemsWithImages,
        total: total,
        status: 'new'
      }
    });
    
    return Response.json(order);
  } catch (error) {
    console.error('Ошибка создания заказа:', error);
    return Response.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}