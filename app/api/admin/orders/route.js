import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// GET - получить все заказы
export async function GET() {
  try {
    // Проверка авторизации (админ или менеджер с правом canViewOrders)
    const auth = await requireAuth(null, ['canViewOrders']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Ошибка GET /api/admin/orders:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// PUT - обновить статус заказа
export async function PUT(request) {
  try {
    // Проверка авторизации (админ или менеджер с правом canManageOrders)
    const auth = await requireAuth(null, ['canManageOrders']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const { id, status } = await request.json();
    
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: 'ID заказа обязателен' }, { status: 400 });
    }
    
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status }
    });
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Ошибка PUT /api/admin/orders:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// DELETE - удалить заказ (только админ)
export async function DELETE(request) {
  try {
    // Проверка авторизации (только админ)
    const auth = await requireAuth('admin');
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));
    
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: 'ID заказа обязателен' }, { status: 400 });
    }
    
    await prisma.order.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка DELETE /api/admin/orders:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}