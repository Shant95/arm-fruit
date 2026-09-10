import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { log } from '@/lib/logger';

// Схема для создания/обновления товара
const productSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  nameAm: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  descriptionAm: z.string().optional().nullable(),
  price: z.number().min(0, 'Цена не может быть отрицательной'),
  quantity: z.number().min(0).optional().default(0),
  image: z.string().optional(),
  categoryId: z.number().int().positive('Категория обязательна'),
  isPopular: z.boolean().optional().default(false),
  isNew: z.boolean().optional().default(false),
  isOnOrder: z.boolean().optional().default(false),
  unit: z.enum(['kg', 'box']).optional().default('kg')
});

// GET - получить все товары или по типу (доступно всем)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const searchQuery = searchParams.get('search');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort');
    const inStock = searchParams.get('inStock') === 'true';
    
    // Для админки: если limit = 0, возвращаем все товары без пагинации
    const limitParam = searchParams.get('limit');
    const isAdminAll = limitParam === '0';
    
    let page = parseInt(searchParams.get('page') || '1');
    let limit = parseInt(limitParam || '12');
    let skip = (page - 1) * limit;

    let where = {};

    // Фильтр по типу (популярные/новые)
    if (type === 'popular') {
      where.isPopular = true;
    } else if (type === 'new') {
      where.isNew = true;
    }

    // Фильтр по категории
    if (category && category !== 'all') {
      where.categoryId = parseInt(category);
    }

    // Фильтр по цене
    if (minPrice) {
      where.price = { ...where.price, gte: parseInt(minPrice) };
    }
    if (maxPrice) {
      where.price = { ...where.price, lte: parseInt(maxPrice) };
    }

    // Фильтр по наличию (только товары в наличии, НЕ под заказ)
    if (inStock) {
      where.quantity = { gt: 0 };
    }

    // Поиск по первым буквам
    if (searchQuery && searchQuery.trim().length > 0) {
      where.name = {
        startsWith: searchQuery,
        mode: 'insensitive'
      };
    }
    
    // Определяем сортировку
    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    }
    
    const total = await prisma.product.count({ where });
    
    let products;
    
    if (isAdminAll) {
      // Для админки - без пагинации
      products = await prisma.product.findMany({
        where,
        include: { category: true },
        orderBy
      });
      return Response.json(products);
    }
    
    // Для клиентской части - с пагинацией
    products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      take: limit,
      skip: skip
    });
    
    return Response.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Ошибка GET /api/products:', error);
    return Response.json({ error: 'Ошибка загрузки товаров' }, { status: 500 });
  }
}

// POST - создать товар (без изменений)
export async function POST(request) {
  try {
    const auth = await requireAuth(null, ['canManageProducts']);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const body = await request.json();
    
    const validation = productSchema.safeParse({
      name: body.name,
      nameAm: body.nameAm,
      description: body.description,
      descriptionAm: body.descriptionAm,
      price: typeof body.price === 'string' ? parseInt(body.price) : body.price,
      quantity: typeof body.quantity === 'string' ? parseInt(body.quantity) : body.quantity,
      categoryId: typeof body.categoryId === 'string' ? parseInt(body.categoryId) : body.categoryId,
      image: body.image,
      isPopular: body.isPopular,
      isNew: body.isNew,
      isOnOrder: body.isOnOrder,
      unit: body.unit
    });
    
    if (!validation.success) {
      return Response.json({ 
        error: 'Ошибка валидации', 
        details: validation.error.errors 
      }, { status: 400 });
    }
    
    const data = validation.data;
    
    const product = await prisma.product.create({
      data: {
        name: data.name,
        nameAm: data.nameAm || null,
        description: data.description || null,
        descriptionAm: data.descriptionAm || null,
        price: data.price,
        quantity: data.isOnOrder ? 0 : data.quantity,
        image: data.image || '📦',
        categoryId: data.categoryId,
        isPopular: data.isPopular,
        isNew: data.isNew,
        isOnOrder: data.isOnOrder,
        unit: data.unit
      },
      include: {
        category: true
      }
    });
    
    await log(auth.user.id, 'create_product', { 
      product_id: product.id, 
      product_name: product.name,
      price: product.price,
      category_id: product.categoryId
    }, ip);
    
    return Response.json(product, { status: 201 });
    
  } catch (error) {
    console.error('Ошибка создания:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// PUT - обновить товар (без изменений)
export async function PUT(request) {
  try {
    const auth = await requireAuth(null, ['canManageProducts']);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const body = await request.json();
    
    if (!body.id) {
      return Response.json({ error: 'ID товара обязателен' }, { status: 400 });
    }
    
    const oldProduct = await prisma.product.findUnique({
      where: { id: body.id }
    });
    
    const validation = productSchema.safeParse({
      name: body.name,
      nameAm: body.nameAm,
      description: body.description,
      descriptionAm: body.descriptionAm,
      price: typeof body.price === 'string' ? parseInt(body.price) : body.price,
      quantity: typeof body.quantity === 'string' ? parseInt(body.quantity) : body.quantity,
      categoryId: typeof body.categoryId === 'string' ? parseInt(body.categoryId) : body.categoryId,
      image: body.image,
      isPopular: body.isPopular,
      isNew: body.isNew,
      isOnOrder: body.isOnOrder,
      unit: body.unit
    });
    
    if (!validation.success) {
      return Response.json({ 
        error: 'Ошибка валидации', 
        details: validation.error.errors 
      }, { status: 400 });
    }
    
    const data = validation.data;
    
    const product = await prisma.product.update({
      where: { id: body.id },
      data: {
        name: data.name,
        nameAm: data.nameAm || null,
        description: data.description || null,
        descriptionAm: data.descriptionAm || null,
        price: data.price,
        quantity: data.isOnOrder ? 0 : data.quantity,
        image: data.image,
        categoryId: data.categoryId,
        isPopular: data.isPopular,
        isNew: data.isNew,
        isOnOrder: data.isOnOrder,
        unit: data.unit
      },
      include: {
        category: true
      }
    });
    
    await log(auth.user.id, 'update_product', {
      product_id: product.id,
      changes: {
        name: oldProduct?.name !== product.name ? { old: oldProduct?.name, new: product.name } : undefined,
        price: oldProduct?.price !== product.price ? { old: oldProduct?.price, new: product.price } : undefined,
        quantity: oldProduct?.quantity !== product.quantity ? { old: oldProduct?.quantity, new: product.quantity } : undefined
      }
    }, ip);
    
    return Response.json(product);
    
  } catch (error) {
    console.error('Ошибка обновления:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - удалить товар (только админ)
export async function DELETE(request) {
  try {
    const auth = await requireAuth('admin');
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));
    
    if (!id || isNaN(id)) {
      return Response.json({ error: 'ID не указан или некорректен' }, { status: 400 });
    }
    
    const deletedProduct = await prisma.product.findUnique({
      where: { id }
    });
    
    await prisma.product.delete({ where: { id } });
    
    await log(auth.user.id, 'delete_product', {
      product_id: id,
      product_name: deletedProduct?.name
    }, ip);
    
    return Response.json({ success: true });
    
  } catch (error) {
    console.error('Ошибка удаления:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}