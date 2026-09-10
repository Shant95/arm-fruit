import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  // Создаем администратора
  const admin = await prisma.user.upsert({
    where: { email: 'admin@armfruit.ru' },
    update: {
      role: 'admin',
      password: hashedPassword,
      name: 'Admin Armfruit'
    },
    create: {
      email: 'admin@armfruit.ru',
      password: hashedPassword,
      name: 'Admin Armfruit',
      phone: '+7 (999) 123-45-67',
      role: 'admin'
    }
  });
  
  console.log('✅ Администратор создан:', admin.email);
  console.log('🔑 Пароль: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });