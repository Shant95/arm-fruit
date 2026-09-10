import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    // Проверка авторизации (админ или менеджер с правом canViewDashboard)
    const auth = await requireAuth(null, ['canViewDashboard']);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    // Статистика
    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
      _sum: { total: true }
    });
    const totalCustomers = await prisma.user.count({ where: { role: 'user' } });
    const totalProducts = await prisma.product.count();
    const averageCheck = totalOrders > 0 ? (totalRevenue._sum.total || 0) / totalOrders : 0;
    
    // Заказы по статусам
    const ordersByStatus = {
      new: await prisma.order.count({ where: { status: 'new' } }),
      processing: await prisma.order.count({ where: { status: 'processing' } }),
      shipping: await prisma.order.count({ where: { status: 'shipping' } }),
      delivered: await prisma.order.count({ where: { status: 'delivered' } }),
      completed: await prisma.order.count({ where: { status: 'completed' } }),
      cancelled: await prisma.order.count({ where: { status: 'cancelled' } }),
    };
    
    // Последние заказы
    const recentOrders = await prisma.order.findMany({
      take: 5,
      include: {
        user: {
          select: { name: true, email: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Топ товары (из заказов)
    const allOrders = await prisma.order.findMany({
      select: { items: true }
    });
    
    const productSales = {};
    allOrders.forEach(order => {
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (productSales[item.name]) {
            productSales[item.name].sales += item.quantity;
            productSales[item.name].revenue += item.price * item.quantity;
          } else {
            productSales[item.name] = {
              name: item.name,
              sales: item.quantity,
              revenue: item.price * item.quantity
            };
          }
        });
      }
    });
    
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Продажи по дням (за текущую неделю)
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const salesByDay = {
      mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0
    };
    
    const weekOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startOfWeek }
      }
    });
    
    weekOrders.forEach(order => {
      const dayIndex = order.createdAt.getDay();
      const dayMap = { 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat', 0: 'sun' };
      const day = dayMap[dayIndex];
      salesByDay[day] += order.total;
    });
    
    return Response.json({
      stats: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalCustomers,
        totalProducts,
        averageCheck: Math.round(averageCheck),
      },
      ordersByStatus,
      recentOrders,
      topProducts,
      salesByDay,
    });
  } catch (error) {
    console.error('Ошибка GET /api/admin/dashboard:', error);
    return Response.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}