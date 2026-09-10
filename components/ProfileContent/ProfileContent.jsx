'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './style.module.css';
import LogoutButton from '../LogoutButton/logoutButton';

export default function ProfileContent({ user }) {
    const { t } = useTranslation();

    return (
        <>
            <div className={styles.bloks}>
                <div className={styles.blok}>
                    <h1>{t('profile_title')}</h1>
                    <p>{t('profile_description')}</p>
                </div>
                <div className={styles.buttons}>
                    <Link href='/profile/user/orders' className={styles.linkbt}>{t('orders')}</Link>
                    <Link href='/catalog' className={styles.linkbt}>{t('to_catalog')}</Link>
                </div>
            </div>
            <div className={styles.containers}>
                <div className={styles.information}>
                    <div className={styles.container}>
                        <div className={styles.items}>
                            <div className={styles.head}>
                                <div className={styles.name}>
                                    <p>{user.name?.split(' ')[0] || t('user_default')}</p>
                                    <p>{user.name?.split(' ')[1] || ''}</p>
                                </div>
                                <Link href="/profile/user/settings" className={styles.setings}>
                                    {t('settings')}
                                </Link>
                            </div>
                            <div className={styles.email}>
                                <p>{user.email}</p>
                                <p>{user.phone || t('phone_not_specified')}</p>
                            </div>
                            <div className={styles.status}>
                                <div>{t('account_active')}</div>
                                <div>ID: {user.id}</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.container}>
                        <div className={styles.items}>
                            <div className={styles.head}>
                                <div className={styles.name}>
                                    <p>{t('contacts')}</p>
                                </div>
                            </div>
                            <div className={styles.contents}>
                                <div className={styles.content}>
                                    <h3>{t('email')}</h3>
                                    <p>{user.email}</p>
                                </div>
                                <div className={styles.content}>
                                    <h3>{t('phone')}</h3>
                                    <p>{user.phone || t('not_specified')}</p>
                                </div>
                            </div>
                            <p className={styles.subtitle}>{t('settings_note')}</p>
                        </div>
                    </div>
                </div>
                <div className={styles.actions}>
                    <div className={styles.action}>
                        <h2>{t('quick_actions')}</h2>
                        <Link href='/profile/user/orders' className={styles.link}>{t('my_orders')}</Link>
                        <Link href='/cart/' className={styles.link}>{t('go_to_cart')}</Link>
                        <Link href='/contacts/' className={styles.link}>{t('contact_us')}</Link>
                        <LogoutButton />
                        <div className={styles.clue}>
                            <div className={styles.title}>{t('hint')}</div>
                            <p>{t('order_hint')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}