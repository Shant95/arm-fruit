'use client';

import { useTranslation } from '@/hooks/useTranslation';
import styles from './style.module.css';

export default function Contacts() {
    const { t } = useTranslation();

    return (
        <div className={styles.contact}>
            <div className={styles.title}>
                <h1>{t('contacts_title')}</h1>
            </div>
            <div className={styles.container}>
                <div className={styles.blok}>
                    <div className={styles.subtitle}>
                        <h2>{t('phone_label')}</h2>
                    </div>
                    <div className={styles.text}>
                        <p>+7 (916) 711-08-60</p>
                    </div>
                </div>
                <div className={styles.blok}>
                    <div className={styles.subtitle}>
                        <h2>{t('email_label')}</h2>
                    </div>
                    <div className={styles.text}>
                        <p>shantabrahamyan7@gmail.com</p>  
                    </div>
                </div>
                <div className={styles.blok}>
                    <div className={styles.subtitle}>
                        <h2>{t('address_label')}</h2>
                    </div>
                    <div className={styles.text}>
                        <p>{t('address_text')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}