'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './style.module.css';
import ProductPopularCard from '../ProductPopularCard/productPopularCard';
import Link from 'next/link';

const Products = ({ title, subtitle, type }) => {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`/api/products?type=${type}`);
                const data = await res.json();
                // Проверяем формат ответа (с пагинацией или без)
                if (data.products && Array.isArray(data.products)) {
                    setProducts(data.products);
                } else if (Array.isArray(data)) {
                    setProducts(data);
                } else {
                    setProducts([]);
                }
            } catch (error) {
                console.error('Ошибка загрузки товаров:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        
        if (type) {
            fetchProducts();
        }
    }, [type]);

    if (loading) {
        return (
            <div className={styles.products}>
                <div className={styles.title}>
                    <h3>{title}</h3>
                    <p>{subtitle}</p>
                </div>
                <div className={styles.items}>
                    <div className={styles.loading}>{t('loading')}</div>
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <div className={styles.products}>
            <div className={styles.title}>
                <h3>{title}</h3>
                <p>{subtitle}</p>
            </div>
            <Link className={styles.catalogBtn} href='/catalog/'>{t('to_catalog')}</Link>
            <div className={styles.items}>
                {products.map((product) => (
                    <ProductPopularCard
                        key={product.id}
                        id={product.id}
                        image={product.image}
                        text={product.name}
                        textAm={product.nameAm}
                        price={product.price}
                        isPopular={product.isPopular}
                        isNew={product.isNew}
                        isOnOrder={product.isOnOrder}
                        unit={product.unit}
                    />
                ))}
            </div>
        </div>
    );
};

export default Products;