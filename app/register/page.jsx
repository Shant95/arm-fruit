'use client';

import { useTranslation } from '@/hooks/useTranslation';
import styles from './style.module.css';
import RegisterForm from '../../components/RegisterForm/registerForm';

export default function Register() {
    const { t } = useTranslation();

    return (
        <div className={styles.register}>
            <div className={styles.title}>
                <h2>{t('register_title')}</h2>
                <p>{t('register_description')}</p>
            </div>
            <div className={styles.form}>
                <RegisterForm />
            </div>
            <div className={styles.subtitle}>
                <p>{t('register_note')}</p>
            </div>
        </div>
    );
}