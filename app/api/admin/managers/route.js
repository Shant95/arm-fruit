import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { requireAuth } from '@/lib/auth';

// GET - получить всех менеджеров
export async function GET() {
  try {
    // Проверка авторизации (только админ)
    const auth = await requireAuth('admin');
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const managers = await prisma.user.findMany({
      where: {
        role: 'manager'
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return Response.json(managers);
  } catch (error) {
    console.error('Ошибка GET:', error);
    return Response.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// POST - создать менеджера
export async function POST(request) {
  try {
    // Проверка авторизации (только админ)
    const auth = await requireAuth('admin');
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const { 
      name, email, phone, password, role,
      canViewDashboard, canViewOrders, canManageOrders,
      canViewProducts, canManageProducts, canViewCustomers, canManageCustomers,
      canViewCategories, canManageCategories
    } = await request.json();
    
    if (!password) {
      return Response.json({ error: 'Пароль обязателен' }, { status: 400 });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const manager = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: role || 'manager',
        isActive: true,
        canViewDashboard: canViewDashboard || false,
        canViewOrders: canViewOrders || false,
        canManageOrders: canManageOrders || false,
        canViewProducts: canViewProducts || false,
        canManageProducts: canManageProducts || false,
        canViewCustomers: canViewCustomers || false,
        canManageCustomers: canManageCustomers || false,
        canViewCategories: canViewCategories || false,
        canManageCategories: canManageCategories || false,
      }
    });
    
    return Response.json(manager);
  } catch (error) {
    console.error('Ошибка POST:', error);
    return Response.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// PUT - обновить менеджера
export async function PUT(request) {
  try {
    // Проверка авторизации (только админ)
    const auth = await requireAuth('admin');
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const { 
      id, name, email, phone, role,
      canViewDashboard, canViewOrders, canManageOrders,
      canViewProducts, canManageProducts, canViewCustomers, canManageCustomers,
      canViewCategories, canManageCategories
    } = await request.json();
    
    if (!id || isNaN(id)) {
      return Response.json({ error: 'ID менеджера обязателен' }, { status: 400 });
    }
    
    const manager = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        phone: phone || null,
        role: role || 'manager',
        canViewDashboard: canViewDashboard || false,
        canViewOrders: canViewOrders || false,
        canManageOrders: canManageOrders || false,
        canViewProducts: canViewProducts || false,
        canManageProducts: canManageProducts || false,
        canViewCustomers: canViewCustomers || false,
        canManageCustomers: canManageCustomers || false,
        canViewCategories: canViewCategories || false,
        canManageCategories: canManageCategories || false,
      }
    });
    
    return Response.json(manager);
  } catch (error) {
    console.error('Ошибка PUT:', error);
    return Response.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// DELETE - удалить менеджера
export async function DELETE(request) {
  try {
    // Проверка авторизации (только админ)
    const auth = await requireAuth('admin');
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));
    
    if (!id || isNaN(id)) {
      return Response.json({ error: 'ID менеджера обязателен' }, { status: 400 });
    }
    
    await prisma.user.delete({ where: { id } });
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Ошибка DELETE:', error);
    return Response.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}