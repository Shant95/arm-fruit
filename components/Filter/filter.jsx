"use client";

import styles from './style.module.css';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

const Filter = ({ 
    categories, 
    selectedCategory, 
    onCategoryChange,
    priceRange,
    onPriceChange,
    sortBy,
    onSortChange,
    onlyInStock,
    onStockChange,
    onReset 
}) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleSelectOption = (option) => {
        onSortChange(option);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getSortLabel = () => {
        switch(sortBy) {
            case 'popular': return t('popular');
            case 'new': return t('new');
            case 'price_asc': return t('price_asc');
            case 'price_desc': return t('price_desc');
            default: return t('all');
        }
    };

    // Функция для перевода названия категории
    const getCategoryName = (categoryName) => {
        // Пробуем получить перевод по ключу category_ + название категории
        const translated = t(`category_${categoryName.toLowerCase()}`);
        // Если перевод не найден (возвращается тот же ключ), показываем оригинальное название
        if (translated === `category_${categoryName.toLowerCase()}`) {
            return categoryName;
        }
        return translated;
    };

    return (
        <div className={styles.filter}>
            <div className={styles.container}>
                <div className={styles.sorting}>
                    <div className={styles.title}>
                        <p>{t('sort').toUpperCase()}</p>
                    </div>
                    <div className={styles.bloks} ref={dropdownRef}>
                        <div className={styles.all} onClick={toggleDropdown}>
                            <p>{getSortLabel()}</p>
                            <p>{isOpen ? '▲' : '▼'}</p>
                        </div>

                        {isOpen && (
                            <div className={styles.contents}>
                                <div
                                    className={`${styles.content} ${sortBy === 'all' ? styles.active : ''}`}
                                    onClick={() => handleSelectOption('all')}
                                >
                                    {t('all')}
                                </div>
                                <div
                                    className={`${styles.content} ${sortBy === 'popular' ? styles.active : ''}`}
                                    onClick={() => handleSelectOption('popular')}
                                >
                                    {t('popular')}
                                </div>
                                <div
                                    className={`${styles.content} ${sortBy === 'new' ? styles.active : ''}`}
                                    onClick={() => handleSelectOption('new')}
                                >
                                    {t('new')}
                                </div>
                                <div
                                    className={`${styles.content} ${sortBy === 'price_asc' ? styles.active : ''}`}
                                    onClick={() => handleSelectOption('price_asc')}
                                >
                                    {t('price_asc')}
                                </div>
                                <div
                                    className={`${styles.content} ${sortBy === 'price_desc' ? styles.active : ''}`}
                                    onClick={() => handleSelectOption('price_desc')}
                                >
                                    {t('price_desc')}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className={styles.prise}>
                    <h2>{t('price').toUpperCase()}</h2>
                    <div className={styles.inputs}>
                        <input 
                            className={styles.input} 
                            placeholder={t('from')}
                            value={priceRange.min}
                            onChange={(e) => onPriceChange('min', e.target.value)}
                            type="number"
                        />
                        <input 
                            className={styles.input} 
                            placeholder={t('to')}
                            value={priceRange.max}
                            onChange={(e) => onPriceChange('max', e.target.value)}
                            type="number"
                        />
                    </div>
                </div>
                <div className={styles.categories}>
                    <h2>{t('category').toUpperCase()}</h2>
                    <div className={styles.items}>
                        <div className={styles.item}>
                            <input 
                                type='checkbox' 
                                checked={selectedCategory === 'all'}
                                onChange={() => onCategoryChange('all')}
                            />
                            <p>{t('all_categories')}</p>
                        </div>
                        {categories.map((cat) => (
                            <div key={cat.id} className={styles.item}>
                                <input 
                                    type='checkbox' 
                                    checked={selectedCategory === cat.id.toString()}
                                    onChange={() => onCategoryChange(cat.id.toString())}
                                />
                                <p>{getCategoryName(cat.name)}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.availability}>
                    <p>{t('in_stock_only')}</p>
                    <input 
                        type='checkbox' 
                        checked={onlyInStock}
                        onChange={(e) => onStockChange(e.target.checked)}
                    />
                </div>
            </div>
            <div className={styles.reset} onClick={onReset}>
                <p>{t('reset_filters')}</p>
            </div>
        </div>
    );
};

export default Filter;