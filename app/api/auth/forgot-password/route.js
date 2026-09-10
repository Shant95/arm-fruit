import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { resetCodes } from '@/lib/reset-codes';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return Response.json({ success: true, message: 'Если email существует, код отправлен' });
    }
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    resetCodes.set(email, {
      code: code,
      expiresAt: Date.now() + 15 * 60 * 1000
    });
    
    await transporter.sendMail({
      from: `"Armfruit" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Код восстановления пароля',
      html: `<h2>Ваш код: ${code}</h2><p>Код действителен 15 минут.</p>`,
    });
    
    return Response.json({ success: true, message: 'Код отправлен' });
    
  } catch {
    return Response.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}