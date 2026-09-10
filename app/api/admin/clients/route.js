import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// GET - получить всех клиентов (только role = 'user')
export async function GET() {
  try {
    // Проверка авторизации (только админ)
    const auth = await requireAuth('admin');
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const clients = await prisma.user.findMany({
      where: { role: 'user' },
      include: {
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Ошибка GET /api/admin/clients:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// PUT - обновить статус клиента
export async function PUT(request) {
  try {
    // Проверка авторизации (только админ)
    const auth = await requireAuth('admin');
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const { id, status } = await request.json();
    
    let updateData = {};
    if (status === 'blocked') {
      updateData = { isActive: false, status: 'blocked' };
    } else if (status === 'active') {
      updateData = { isActive: true, status: null };
    } else {
      updateData = { isActive: false, status: null };
    }
    
    const client = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    return NextResponse.json(client);
  } catch (error) {
    console.error('Ошибка PUT /api/admin/clients:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// DELETE - удалить клиента
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
      return NextResponse.json({ error: 'ID не указан или некорректен' }, { status: 400 });
    }
    
    await prisma.user.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка DELETE /api/admin/clients:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}