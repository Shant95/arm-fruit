'use client';

import styles from './home.module.css';
import Catalog from '../components/Catalog/catalog';
import Products from '../components/Products/products';
import { useTranslation } from '@/hooks/useTranslation';

export default function Home() {
    const { t } = useTranslation();

    return (
        <div className={styles.home}>
            <div className={styles.container}>
                <Catalog />
                <Products 
                    title={t('popular_title')}
                    subtitle={t('popular_subtitle')}
                    type='popular'
                />
                <Products 
                    title={t('new_title')}
                    subtitle={t('new_subtitle')}
                    type='new'
                />
            </div>
        </div>
    );
}