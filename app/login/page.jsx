'use client';

import LoginForm from '../../components/LoginForm/loginForm';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './style.module.css';

export default function Login() {
    const { t } = useTranslation();

    return (
        <div className={styles.login}>
            <div className={styles.title}>
                <h2>{t('login_title')}</h2>
                <p>{t('login_description')}</p>
            </div>
            <div className={styles.form}>
                <LoginForm />
            </div>
            <div className={styles.subtitle}>
                <p>{t('login_note')}</p>
            </div>
        </div>
    );
}