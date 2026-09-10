'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './style.module.css';
import Filter from '../../components/Filter/filter';
import ProductPopularCard from '../../components/ProductPopularCard/productPopularCard';
import { useTranslation } from '@/hooks/useTranslation';
import ModalFilter from '../../components/ModalFilter/modalFilter';

export default function Catalog() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('search') || '';
    const categoryParam = searchParams.get('category');

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    
    // Состояния пагинации
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const itemsPerPage = 12;

    // Активные фильтры (для API)
    const [activeFilters, setActiveFilters] = useState({
        category: categoryParam || 'all',
        minPrice: '',
        maxPrice: '',
        sort: 'all',
        inStock: false
    });

    // Локальное состояние для полей ввода (для плавного ввода)
    const [localPriceMin, setLocalPriceMin] = useState('');
    const [localPriceMax, setLocalPriceMax] = useState('');
    
    // Состояние для модального окна фильтров
    const [isModalFilterOpen, setIsModalFilterOpen] = useState(false);
    
    const priceTimerRef = useRef(null);

    // Обновление URL
    const updateUrl = () => {
        const url = new URL(window.location.href);
        if (activeFilters.category && activeFilters.category !== 'all') {
            url.searchParams.set('category', activeFilters.category);
        } else {
            url.searchParams.delete('category');
        }
        if (activeFilters.minPrice) url.searchParams.set('priceMin', activeFilters.minPrice);
        else url.searchParams.delete('priceMin');
        if (activeFilters.maxPrice) url.searchParams.set('priceMax', activeFilters.maxPrice);
        else url.searchParams.delete('priceMax');
        if (activeFilters.sort && activeFilters.sort !== 'all') url.searchParams.set('sort', activeFilters.sort);
        else url.searchParams.delete('sort');
        if (activeFilters.inStock) url.searchParams.set('inStock', 'true');
        else url.searchParams.delete('inStock');
        window.history.pushState({}, '', url);
    };

    // Загрузка товаров
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let url = `/api/products?page=${currentPage}&limit=${itemsPerPage}`;
                
                if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
                if (activeFilters.category !== 'all') url += `&category=${activeFilters.category}`;
                if (activeFilters.minPrice) url += `&minPrice=${activeFilters.minPrice}`;
                if (activeFilters.maxPrice) url += `&maxPrice=${activeFilters.maxPrice}`;
                if (activeFilters.inStock) url += `&inStock=true`;
                if (activeFilters.sort === 'price_asc') url += `&sort=price_asc`;
                else if (activeFilters.sort === 'price_desc') url += `&sort=price_desc`;
                else if (activeFilters.sort === 'popular') url += `&type=popular`;
                else if (activeFilters.sort === 'new') url += `&type=new`;

                const res = await fetch(url);
                const data = await res.json();

                if (data.products && Array.isArray(data.products)) {
                    setProducts(data.products);
                    setTotalPages(data.pagination?.totalPages || 1);
                    setTotalProducts(data.pagination?.total || 0);
                } else {
                    const productsArray = Array.isArray(data) ? data : [];
                    setProducts(productsArray);
                    setTotalPages(Math.ceil(productsArray.length / itemsPerPage));
                    setTotalProducts(productsArray.length);
                }
            } catch (error) {
                console.error('Ошибка загрузки:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [searchQuery, currentPage, activeFilters]);

    // Загрузка категорий (один раз)
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                const data = await res.json();
                setCategories(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Ошибка загрузки категорий:', error);
            }
        };
        fetchCategories();
    }, []);

    // Синхронизация локальных полей с активными фильтрами при загрузке
    useEffect(() => {
        setLocalPriceMin(activeFilters.minPrice);
        setLocalPriceMax(activeFilters.maxPrice);
    }, [activeFilters.minPrice, activeFilters.maxPrice]);

    // Блокируем скролл при открытом модальном окне
    useEffect(() => {
        if (isModalFilterOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isModalFilterOpen]);

    const handleCategoryChange = (categoryId) => {
        setActiveFilters(prev => ({ ...prev, category: categoryId }));
        setCurrentPage(1);
        setTimeout(() => updateUrl(), 0);
        setIsModalFilterOpen(false); // Закрываем модалку после выбора
    };

    const handlePriceMinChange = (value) => {
        setLocalPriceMin(value);
        
        if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
        priceTimerRef.current = setTimeout(() => {
            setActiveFilters(prev => ({ ...prev, minPrice: value }));
            setCurrentPage(1);
            updateUrl();
        }, 500);
    };

    const handlePriceMaxChange = (value) => {
        setLocalPriceMax(value);
        
        if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
        priceTimerRef.current = setTimeout(() => {
            setActiveFilters(prev => ({ ...prev, maxPrice: value }));
            setCurrentPage(1);
            updateUrl();
        }, 500);
    };

    const handleSortChange = (sortType) => {
        setActiveFilters(prev => ({ ...prev, sort: sortType }));
        setCurrentPage(1);
        setTimeout(() => updateUrl(), 0);
        setIsModalFilterOpen(false); // Закрываем модалку после выбора
    };

    const handleStockChange = (checked) => {
        setActiveFilters(prev => ({ ...prev, inStock: checked }));
        setCurrentPage(1);
        setTimeout(() => updateUrl(), 0);
    };

    const resetFilters = () => {
        setActiveFilters({
            category: 'all',
            minPrice: '',
            maxPrice: '',
            sort: 'all',
            inStock: false
        });
        setLocalPriceMin('');
        setLocalPriceMax('');
        setCurrentPage(1);
        setIsModalFilterOpen(false); // Закрываем модалку после сброса
        
        const url = new URL(window.location.href);
        url.searchParams.delete('category');
        url.searchParams.delete('priceMin');
        url.searchParams.delete('priceMax');
        url.searchParams.delete('sort');
        url.searchParams.delete('inStock');
        if (searchQuery) {
            url.searchParams.delete('search');
            window.location.href = url.toString();
            return;
        }
        window.history.pushState({}, '', url);
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) pages.push(i);
        return pages;
    };

    const openModalFilter = () => {
        setIsModalFilterOpen(true);
    };

    const closeModalFilter = () => {
        setIsModalFilterOpen(false);
    };

    if (loading && products.length === 0) {
        return <div className={styles.loading}>{t('loading') || 'Загрузка товаров...'}</div>;
    }

    return (
        <div className={styles.catalog}>
            <h1>{t('catalog_title')}</h1>
            {searchQuery && (
                <div className={styles.searchInfo}>
                    <p>{t('search_results')}: <strong>«{searchQuery}»</strong></p>
                    <button onClick={resetFilters} className={styles.clearSearchBtn}>
                        ✕ {t('clear_search')}
                    </button>
                </div>
            )}
            <div className={styles.container}>
                <div className={styles.filter}>
                    <Filter
                        categories={categories}
                        selectedCategory={activeFilters.category}
                        onCategoryChange={handleCategoryChange}
                        priceRange={{ min: localPriceMin, max: localPriceMax }}
                        onPriceChange={(type, value) => {
                            if (type === 'min') handlePriceMinChange(value);
                            else handlePriceMaxChange(value);
                        }}
                        sortBy={activeFilters.sort}
                        onSortChange={handleSortChange}
                        onlyInStock={activeFilters.inStock}
                        onStockChange={handleStockChange}
                        onReset={resetFilters}
                    />
                </div>
                <div className={styles.products}>
                    <div className={styles.bloks}>
                        <div className={styles.title}>
                            <p>{t('found')}: {totalProducts}</p>
                            <div className={styles.filterBtn} onClick={openModalFilter}>
                                Фильтры
                            </div>
                        </div>
                        <div className={styles.items}>
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <ProductPopularCard
                                        key={product.id}
                                        id={product.id}
                                        image={product.image}
                                        text={product.name}
                                        textAm={product.nameAm}
                                        price={product.price}
                                        isOnOrder={product.isOnOrder}
                                        unit={product.unit}
                                    />
                                ))
                            ) : (
                                <div className={styles.noProducts}>
                                    <p>😔 {t('not_found')}</p>
                                    {searchQuery && (
                                        <button onClick={resetFilters} className={styles.clearFiltersBtn}>
                                            {t('clear_search')}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {totalPages > 1 && (
                            <div className={styles.pagination}>
                                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className={styles.pageBtn}>←</button>
                                {getPageNumbers().map(page => (
                                    <button key={page} onClick={() => goToPage(page)} className={`${styles.pageBtn} ${currentPage === page ? styles.activePage : ''}`}>
                                        {page}
                                    </button>
                                ))}
                                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className={styles.pageBtn}>→</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Модальное окно с фильтрами */}
            {isModalFilterOpen && (
                <ModalFilter 
                    categories={categories}
                    selectedCategory={activeFilters.category}
                    onCategoryChange={handleCategoryChange}
                    priceRange={{ min: localPriceMin, max: localPriceMax }}
                    onPriceChange={(type, value) => {
                        if (type === 'min') handlePriceMinChange(value);
                        else handlePriceMaxChange(value);
                    }}
                    sortBy={activeFilters.sort}
                    onSortChange={handleSortChange}
                    onlyInStock={activeFilters.inStock}
                    onStockChange={handleStockChange}
                    onReset={resetFilters}
                    onClose={closeModalFilter}
                />
            )}
        </div>
    );
}