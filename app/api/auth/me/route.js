import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    // Используем getSession для получения сессии
    const session = await getSession();
    
    if (!session) {
      return Response.json({ user: null });
    }
    
    // Продлеваем сессию на 1 день
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 1);
    
    await prisma.session.update({
      where: { id: session.id },
      data: { expiresAt: newExpiresAt }
    });
    
    const { password, ...userWithoutPassword } = session.user;
    return Response.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Ошибка:', error);
    return Response.json({ user: null });
  }
}