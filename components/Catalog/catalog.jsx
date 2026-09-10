'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './style.module.css';
import CatalogItem from '../CatalogItem/catalogItem';

const Catalog = () => {
    const { t, lang } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                const data = await res.json();
                console.log('Загруженные категории:', data);
                setCategories(data);
            } catch (error) {
                console.error('Ошибка загрузки категорий:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // Функция для получения названия категории в зависимости от языка
    const getCategoryName = (category) => {
        if (lang === 'am' && category.nameAm) {
            return category.nameAm;
        }
        return category.name;
    };

    if (loading) {
        return (
            <div className={styles.Catalog}>
                <div className={styles.title}>
                    <h3>{t('loading')}</h3>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.Catalog}>
            <div className={styles.title}>
                <h3>{t('categories_title')}</h3>
            </div>
            <div className={styles.items}>
                {categories.map((category) => (
                    <CatalogItem
                        key={category.id}
                        text={getCategoryName(category)}
                        image={category.image}
                        href={`/catalog?category=${category.id}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Catalog;