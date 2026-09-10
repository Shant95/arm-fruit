import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = '$2b$10$asUTMy92d2xZ9JYuvLFVXeADzz8dINcpD9BY6FhjkF5afoSGEwi3m';
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@armfruit.ru',
      password: hashedPassword,
      name: 'Admin',
      role: 'admin'
    }
  });
  console.log('Админ создан:', admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());