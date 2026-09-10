import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProfileContent from '@/components/ProfileContent/ProfileContent';
import styles from './style.module.css';

export default async function Profile() {
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

  return (
    <div className={styles.profile}>
      <ProfileContent user={user} />
    </div>
  );
}