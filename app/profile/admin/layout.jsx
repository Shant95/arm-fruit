'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '../../../components/Sidebar/sidebar';
import styles from './style.module.css';

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(null);
    
    // Скрываем Sidebar на странице логина
    const hideSidebar = pathname?.includes('/login');
    
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                const user = data.user;
                
                // Разрешаем доступ админу И менеджеру
                if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
                    router.push('/profile/admin/login');
                } else {
                    setIsAuthorized(true);
                }
            } catch (error) {
                console.error('Ошибка проверки:', error);
                router.push('/profile/admin/login');
            }
        };
        
        if (!hideSidebar) {
            checkAuth();
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsAuthorized(true);
        }
    }, [router, hideSidebar]);
    
    if (hideSidebar) {
        return <>{children}</>;
    }
    
    if (isAuthorized === null) {
        return <div className={styles.loading}>Загрузка...</div>;
    }
    
    return (
        <div className={styles.adminLayout}>
            <Sidebar />
            <div className={styles.container}>
                {children}
            </div>
        </div>
    );
}