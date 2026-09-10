'use client';

import { useRouter } from 'next/navigation';
import styles from './style.module.css';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <button onClick={handleLogout} className={styles.link}>
      Выйти
    </button>
  );
}