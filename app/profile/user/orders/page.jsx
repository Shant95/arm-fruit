import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import OrdersContent from '@/components/OrdersContent/OrdersContent';
import styles from './style.module.css';

export default async function Orders() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('sessionId')?.value;
  
  if (!sessionId) {
    redirect('/login');
  }
  
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true }
  });
  
  if (!session || session.expiresAt < new Date()) {
    redirect('/login');
  }
  
  const user = session.user;
  
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });
  
  return (
    <div className={styles.ordersPage}>
      <OrdersContent orders={orders} />
    </div>
  );
}