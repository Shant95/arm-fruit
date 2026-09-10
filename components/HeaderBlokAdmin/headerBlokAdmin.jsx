'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './style.module.css';

const HeaderBlokAdmin = ({ title, subtitle }) => {
    const router = useRouter();
    const [isOpen, setIsopen] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const modalRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => setUserRole(data.user?.role));
    }, []);

    const handleToggleLogout = () => {
        setIsopen(!isOpen);
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/profile/admin/login');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && 
                !modalRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)) {
                setIsopen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isOpen]);

    const roleName = userRole === 'admin' ? 'Администратор' : 'Менеджер';
    const profileLink = '/profile/admin/account';  // ← Одинаково для всех

    return (
        <div className={styles.headerBlokAdmin}>
            <div className={styles.title}>
                <h1>{title}</h1>
                <p>{subtitle}</p>
            </div>
            <div className={styles.login} onClick={handleToggleLogout} ref={buttonRef}>
                Выход
            </div>
            {isOpen && (
                <div className={styles.modalBlok} ref={modalRef}>
                    <div className={styles.name}>
                        <h2>Аккаунт</h2>
                        <p>{roleName}</p>
                    </div>
                    <div className={styles.cabinet} onClick={() => router.push(profileLink)}>
                        Личный кабинет
                    </div>
                    <div className={styles.loginBtn} onClick={handleLogout}>
                        Выход
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeaderBlokAdmin;