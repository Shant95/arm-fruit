'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '../../../components/Sidebar/sidebar';
import styles from './style.module.css';

export default function ManagerLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isManager, setIsManager] = useState(null);
    
    const hideSidebar = pathname?.includes('/login');
    
    useEffect(() => {
        const checkManager = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                
                if (!data.user || (data.user.role !== 'manager' && data.user.role !== 'admin')) {
                    router.push('/profile/admin/login');
                } else {
                    setIsManager(true);
                }
            } catch {
                router.push('/profile/admin/login');
            }
        };
        
        if (!hideSidebar) {
            checkManager();
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsManager(true);
        }
    }, [router, hideSidebar]);
    
    if (hideSidebar) {
        return <>{children}</>;
    }
    
    if (isManager === null) {
        return <div className={styles.loading}>Загрузка...</div>;
    }
    
    return (
        <div className={styles.managerLayout}>
            <Sidebar />
            <div className={styles.container}>
                {children}
            </div>
        </div>
    );
}