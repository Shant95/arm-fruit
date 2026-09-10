'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './style.module.css';

const AdminLoginForm = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                // Перенаправление по роли
                if (data.role === 'admin') {
                    router.push('/profile/admin/dashboard');
                } else if (data.role === 'manager') {
                    router.push('/profile/admin/dashboard');
                }
            } else {
                setError(data.error || 'Ошибка входа');
            }
        } catch (err) {
            setError('Ошибка соединения с сервером');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className={styles.adminLoginForm} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
                <label>Email</label>
                <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>📧</span>
                    <input
                        type="email"
                        name="email"
                        placeholder="admin@armfruit.ru"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
            </div>
            
            <div className={styles.inputGroup}>
                <label>Пароль</label>
                <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>🔒</span>
                    <input
                        type="password"
                        name="password"
                        placeholder="Введите пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.cloudFlare}></div>
            
            <button type="submit" className={styles.button} disabled={loading}>
                {loading ? 'Вход...' : 'Войти'}
            </button>
        </form>
    );
};

export default AdminLoginForm;