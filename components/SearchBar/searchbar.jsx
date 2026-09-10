'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './style.module.css';

const SearchBar = () => {
    const router = useRouter();
    const { t, lang } = useTranslation();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Поиск при вводе букв
    useEffect(() => {
        if (query.trim().length < 1) {
            setResults([]);
            setShowDropdown(false);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
                const data = await res.json();
                // Проверяем формат ответа (с пагинацией или без)
                let products = [];
                if (data.products && Array.isArray(data.products)) {
                    products = data.products;
                } else if (Array.isArray(data)) {
                    products = data;
                }
                setResults(products.slice(0, 5));
                setShowDropdown(true);
            } catch (error) {
                console.error('Ошибка поиска:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    // Закрыть dropdown при клике вне
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                inputRef.current && !inputRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Переход на страницу каталога с поиском
    const handleSearch = () => {
        if (query.trim()) {
            setShowDropdown(false);
            router.push(`/catalog?search=${encodeURIComponent(query.trim())}`);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSelectProduct = (productId) => {
        setShowDropdown(false);
        setQuery('');
        router.push(`/item/${productId}`);
    };

    // Функция для отображения названия товара в зависимости от языка
    const getProductName = (product) => {
        if (lang === 'am' && product.nameAm) {
            return product.nameAm;
        }
        return product.name;
    };

    return (
        <div className={styles.searchContainer}>
            <div className={styles.searchBar}>
                <input
                    ref={inputRef}
                    type='text'
                    className={styles.input}
                    placeholder={t('search')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onFocus={() => query.trim() && results.length > 0 && setShowDropdown(true)}
                />
                <div className={styles.icon} onClick={handleSearch}>
                    🔍
                </div>
            </div>

            {/* Выпадающий блок с результатами */}
            {showDropdown && (
                <div className={styles.dropdown} ref={dropdownRef}>
                    {loading ? (
                        <div className={styles.loadingResult}>{t('search')}...</div>
                    ) : results.length > 0 ? (
                        <>
                            {results.map((product) => (
                                <div
                                    key={product.id}
                                    className={styles.resultItem}
                                    onClick={() => handleSelectProduct(product.id)}
                                >
                                    <div className={styles.resultImage}>
                                        {product.image && (product.image === '🍎' || product.image === '🍌' || product.image === '🍇' || product.image === '🍊') ? (
                                            <span className={styles.emojiImage}>{product.image}</span>
                                        ) : (
                                            <Image
                                                src={product.image || '/images/placeholder.jpg'}
                                                alt={getProductName(product)}
                                                width={40}
                                                height={40}
                                                className={styles.resultImg}
                                                onError={(e) => {
                                                    e.target.src = '/images/placeholder.jpg';
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className={styles.resultInfo}>
                                        <div className={styles.resultName}>{getProductName(product)}</div>
                                        {product.isOnOrder ? (
                                            <div className={styles.resultPriceOnOrder}>{t('price_on_request')}</div>
                                        ) : (
                                            <div className={styles.resultPrice}>{product.price} ₽ / {product.unit === 'box' ? t('box') : t('kg')}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div className={styles.viewAll} onClick={handleSearch}>
                                🔍 {t('show_all')} ({results.length}+)
                            </div>
                        </>
                    ) : query.trim().length > 0 ? (
                        <div className={styles.noResults}>
                            <span>😔</span>
                            <p>{t('not_found')}</p>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default SearchBar;