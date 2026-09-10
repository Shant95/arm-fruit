import { prisma } from '../../../lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { log } from '@/lib/logger';

// Схема для создания/обновления категории
const categorySchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100, 'Слишком длинное название'),
  nameAm: z.string().optional().nullable(),
  description: z.string().max(500, 'Описание слишком длинное').optional().nullable(),
  descriptionAm: z.string().max(500, 'Описание слишком длинное').optional().nullable(),
  image: z.string().optional().nullable()
});

// GET - получить все категории (доступно всем)
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Ошибка GET /api/categories:', error);
    return NextResponse.json(
      { error: 'Ошибка загрузки категорий' },
      { status: 500 }
    );
  }
}

// POST - создать новую категорию
export async function POST(request) {
  try {
    const auth = await requireAuth(null, ['canManageCategories']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const body = await request.json();
    const { name, nameAm, description, descriptionAm, image } = body;
    
    const validation = categorySchema.safeParse({ name, nameAm, description, descriptionAm, image });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const existing = await prisma.category.findUnique({
      where: { name }
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'Категория с таким названием уже существует' },
        { status: 400 }
      );
    }
    
    const category = await prisma.category.create({
      data: {
        name,
        nameAm: nameAm || null,
        description: description || null,
        descriptionAm: descriptionAm || null,
        image: image || null
      }
    });
    
    // Логируем создание категории
    await log(auth.user.id, 'create_category', {
      category_id: category.id,
      category_name: category.name
    }, ip);
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Ошибка POST /api/categories:', error);
    return NextResponse.json(
      { error: 'Ошибка создания категории' },
      { status: 500 }
    );
  }
}

// PUT - обновить категорию
export async function PUT(request) {
  try {
    const auth = await requireAuth(null, ['canManageCategories']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const body = await request.json();
    const { id, name, nameAm, description, descriptionAm, image } = body;
    
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: 'ID категории обязателен' }, { status: 400 });
    }
    
    // Получаем старые данные для лога
    const oldCategory = await prisma.category.findUnique({
      where: { id }
    });
    
    const validation = categorySchema.safeParse({ name, nameAm, description, descriptionAm, image });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const existing = await prisma.category.findFirst({
      where: {
        name,
        NOT: { id }
      }
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'Категория с таким названием уже существует' },
        { status: 400 }
      );
    }
    
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        nameAm: nameAm || null,
        description: description || null,
        descriptionAm: descriptionAm || null,
        image: image || null
      }
    });
    
    // Логируем обновление категории
    await log(auth.user.id, 'update_category', {
      category_id: category.id,
      changes: {
        name: oldCategory?.name !== category.name ? { old: oldCategory?.name, new: category.name } : undefined
      }
    }, ip);
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Ошибка PUT /api/categories:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления категории' },
      { status: 500 }
    );
  }
}

// DELETE - удалить категорию (только админ)
export async function DELETE(request) {
  try {
    const auth = await requireAuth('admin');
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));
    
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: 'ID категории обязателен' }, { status: 400 });
    }
    
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    
    if (!category) {
      return NextResponse.json({ error: 'Категория не найдена' }, { status: 404 });
    }
    
    if (category._count.products > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить категорию, в которой есть товары' },
        { status: 400 }
      );
    }
    
    await prisma.category.delete({ where: { id } });
    
    // Логируем удаление категории
    await log(auth.user.id, 'delete_category', {
      category_id: id,
      category_name: category.name
    }, ip);
    
    return NextResponse.json({ message: 'Категория удалена' });
  } catch (error) {
    console.error('Ошибка DELETE /api/categories:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления категории' },
      { status: 500 }
    );
  }
}