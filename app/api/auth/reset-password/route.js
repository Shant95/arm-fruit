import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { resetCodes } from '@/lib/reset-codes';

export async function POST(request) {
  try {
    const { email, code, newPassword } = await request.json();
    
    const stored = resetCodes.get(email);
    
    if (!stored || stored.code !== code) {
      return Response.json({ error: 'Неверный код' }, { status: 400 });
    }
    
    if (Date.now() > stored.expiresAt) {
      resetCodes.delete(email);
      return Response.json({ error: 'Код истек' }, { status: 400 });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
    
    resetCodes.delete(email);
    
    return Response.json({ success: true, message: 'Пароль изменен' });
    
  } catch {
    return Response.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}