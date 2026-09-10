"use client";

import { usePathname } from "next/navigation";
import Logo from '../Logo/logo';
import NavButton from '../NavButton/NavButton';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './style.module.css';

const Footer = () => {
    const pathname = usePathname();
    const { t } = useTranslation();

    if (pathname?.includes('/profile/admin') || pathname?.includes('/profile/manager')) {
        return null;
    }

    return (
        <div className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.blok}>
                    <Logo />
                    <p className={styles.blokText}>ИП <span>Абраамян Шант Абраамович</span></p>
                    <p className={styles.blokText}>ИНН: <span>614310496678</span></p>
                    <p className={styles.blokText}>ОГРНИП: <span>324508100278647</span></p>
                    <p className={styles.blokText}>Адрес: <span>140125, Россия, г. Москва, Алтуфевское шоссе, д.85.</span></p>
                </div>
                <div className={styles.blok}>
                    <NavButton text={t('about')} href='/about/' />
                    <NavButton text={t('catalog')} href='/catalog/' />
                    <NavButton text={t('contacts')} href='/contacts/'  />
                    <NavButton text={t('terms')} href='/terms-and-conditions' />  
                 <h4>+79169487314</h4>
                    <h4>shantabrahamyan7@gmail.com</h4>
                
                </div>
                <div className={styles.blok}>
                    <h3>+79169487314</h3>
                    <h3>shantabrahamyan7@gmail.com</h3>
                </div>
            </div>
            <div className={styles.text}>
                <p>© Arm Food City. {t('all_rights')}</p>
            </div>
        </div>
    )
}

export default Footer;