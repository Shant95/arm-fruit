'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './style.module.css';

const LoginForm = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                if (data.user?.role === 'admin') {
                    setError(t('use_admin_login'));
                    setLoading(false);
                    return;
                }

                const redirectUrl = localStorage.getItem('redirectAfterLogin');
                const pendingCart = localStorage.getItem('pendingCart');

                if (pendingCart) {
                    localStorage.setItem('cart', pendingCart);
                    localStorage.removeItem('pendingCart');
                }

                localStorage.removeItem('redirectAfterLogin');

                if (redirectUrl) {
                    router.push(redirectUrl);
                } else {
                    router.push('/');
                }
            } else {
                setError(data.error || t('login_error'));
            }
        } catch (err) {
            setError(t('connection_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginForm}>
            <form onSubmit={handleSubmit} className={styles.container}>
                <div className={styles.email}>
                    <label>{t('email')}</label>
                    <input
                        type="email"
                        placeholder='example@mail.ru'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.login}>
                    <label>{t('password')}</label>
                    <div className={styles.passwordWrapper}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder={t('enter_password')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className={styles.eyeButton}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <svg 
                                width="20" 
                                height="20" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                {showPassword ? (
                                    <>
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                    </>
                                ) : (
                                    <>
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </>
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
                {error && <div className={styles.error}>{error}</div>}
                <Link className={styles.forgotLogin} href='/forgot-password'>
                    <p>{t('forgot_password')}</p>
                </Link>
                <div className={styles.cloudFlare}></div>

                <button type="submit" className={styles.button} disabled={loading}>
                    {loading ? t('loading') : t('login_title')}
                </button>
            </form>
            <div className={styles.register}>
                <p>{t('no_account')}</p>
                <Link href='/register/' className={styles.registerbt}>{t('register')}</Link>
            </div>
        </div>
    );
};

export default LoginForm;