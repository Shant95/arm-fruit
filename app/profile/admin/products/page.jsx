'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeaderBlokAdmin from '../../../../components/HeaderBlokAdmin/headerBlokAdmin';
import ProductCard from '../../../../components/ProductCard/productCard';
import ProductModal from '../../../../components/ProductModal/productModal';
import styles from './style.module.css';

export default function AdminProducts() {
    const router = useRouter();
    const [pageLoading, setPageLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [formData, setFormData] = useState({
        name: '',
        nameAm: '',
        description: '',
        descriptionAm: '',
        price: '',
        quantity: '',
        image: '',
        categoryId: '',
        isPopular: false,
        isNew: false,
        isOnOrder: false,
        unit: 'kg'
    });

    // Проверка прав доступа для менеджера
    useEffect(() => {
        const checkAccess = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                const user = data.user;
                
                if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
                    router.push('/profile/admin/login');
                } else if (user.role === 'manager' && !user.canViewProducts) {
                    router.push('/profile/admin/dashboard');
                }
            } catch (error) {
                console.error('Ошибка проверки:', error);
                router.push('/profile/admin/login');
            } finally {
                setPageLoading(false);
            }
        };
        checkAccess();
    }, [router]);

    // Загрузка категорий
    useEffect(() => {
        if (!pageLoading) {
            const fetchCategories = async () => {
                try {
                    const res = await fetch('/api/categories');
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setCategories(data);
                        if (data.length > 0) {
                            setFormData(prev => ({ ...prev, categoryId: data[0].id.toString() }));
                        }
                    } else {
                        setCategories([]);
                    }
                } catch (error) {
                    console.error('Ошибка загрузки категорий:', error);
                    setCategories([]);
                }
            };
            fetchCategories();
        }
    }, [pageLoading]);

    // Загрузка товаров из базы (limit=0 - все товары)
    useEffect(() => {
        if (!pageLoading) {
            const fetchProducts = async () => {
                try {
                    const res = await fetch('/api/products?limit=0');
                    const data = await res.json();
                    // Проверяем формат ответа
                    if (Array.isArray(data)) {
                        setProducts(data);
                    } else if (data.products && Array.isArray(data.products)) {
                        setProducts(data.products);
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
            fetchProducts();
        }
    }, [pageLoading]);

    // Список категорий для фильтра
    const filterCategories = [
        { value: 'all', label: 'Все категории', icon: '📋' },
        ...(Array.isArray(categories) ? categories.map(c => ({ value: c.id.toString(), label: c.name, icon: '📁' })) : [])
    ];

    const handleOpenAddModal = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({ 
            name: '', 
            nameAm: '',
            description: '',
            descriptionAm: '',
            price: '', 
            quantity: '', 
            image: '', 
            categoryId: categories[0]?.id.toString() || '',
            isPopular: false,
            isNew: false,
            isOnOrder: false,
            unit: 'kg'
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (product) => {
        setIsEditing(true);
        setEditingId(product.id);
        setFormData({
            name: product.name,
            nameAm: product.nameAm || '',
            description: product.description || '',
            descriptionAm: product.descriptionAm || '',
            price: product.price.toString(),
            quantity: product.quantity.toString(),
            image: product.image,
            categoryId: product.categoryId.toString(),
            isPopular: product.isPopular || false,
            isNew: product.isNew || false,
            isOnOrder: product.isOnOrder || false,
            unit: product.unit || 'kg'
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setEditingId(null);
    };

    const handleSaveProduct = async () => {
        if (!formData.name.trim() || !formData.price.trim()) {
            alert('Заполните название и цену');
            return;
        }

        try {
            const url = '/api/products';
            const method = isEditing ? 'PUT' : 'POST';
            const body = {
                name: formData.name,
                nameAm: formData.nameAm || null,
                description: formData.description,
                descriptionAm: formData.descriptionAm || null,
                price: parseInt(formData.price),
                quantity: parseInt(formData.quantity) || 0,
                image: formData.image,
                categoryId: parseInt(formData.categoryId),
                isPopular: formData.isPopular,
                isNew: formData.isNew,
                isOnOrder: formData.isOnOrder,
                unit: formData.unit
            };
            if (isEditing) body.id = editingId;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                alert(isEditing ? 'Товар обновлён' : 'Товар создан');
                const productsRes = await fetch('/api/products?limit=0');
                const productsData = await productsRes.json();
                if (Array.isArray(productsData)) {
                    setProducts(productsData);
                } else if (productsData.products && Array.isArray(productsData.products)) {
                    setProducts(productsData.products);
                } else {
                    setProducts([]);
                }
                handleCloseModal();
            } else {
                const error = await res.json();
                alert(error.error || 'Ошибка сохранения');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка сервера');
        }
    };

    const handleDeleteProduct = async (id, name) => {
        if (confirm(`Удалить товар "${name}"?`)) {
            try {
                const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
                if (res.ok) {
                    alert('Товар удалён');
                    setProducts(products.filter(p => p.id !== id));
                } else {
                    alert('Ошибка удаления');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Ошибка сервера');
            }
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.categoryId.toString() === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getSelectedCategoryLabel = () => {
        if (selectedCategory === 'all') return 'Все категории';
        const cat = categories.find(c => c.id.toString() === selectedCategory);
        return cat ? `📁 ${cat.name}` : 'Все категории';
    };

    if (pageLoading) {
        return <div className={styles.loading}>Загрузка...</div>;
    }

    if (loading) {
        return <div className={styles.loading}>Загрузка товаров...</div>;
    }

    return (
        <div className={styles.productsPage}>
            <div className={styles.head}>
                <HeaderBlokAdmin title='Товары' subtitle='Управляйте товарами каталога.' />
            </div>
            <div className={styles.container}>
                <div className={styles.topBlok}>
                    <div className={styles.title}>
                        <h2>Список товаров</h2>
                        <p>Показано: {filteredProducts.length} из {products.length}</p>
                    </div>
                    <button className={styles.addBtn} onClick={handleOpenAddModal}>
                        + Создать товар
                    </button>
                </div>
                
                <div className={styles.inputs}>
                    <div className={styles.search}>
                        <input 
                            className={styles.input} 
                            placeholder='🔍 Поиск товаров...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className={styles.categories}>
                        <label className={styles.label}>Категория</label>
                        <div className={styles.categoryWrapper}>
                            <div 
                                className={styles.categoryInput}
                                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                            >
                                <span>{getSelectedCategoryLabel()}</span>
                                <span className={styles.arrow}>{isCategoryOpen ? '▲' : '▼'}</span>
                            </div>
                            {isCategoryOpen && (
                                <div className={styles.categoryDropdown}>
                                    {Array.isArray(filterCategories) && filterCategories.map(cat => (
                                        <div
                                            key={cat.value}
                                            className={`${styles.categoryItem} ${selectedCategory === cat.value ? styles.activeCategory : ''}`}
                                            onClick={() => {
                                                setSelectedCategory(cat.value);
                                                setIsCategoryOpen(false);
                                            }}
                                        >
                                            <span>{cat.icon}</span>
                                            <span>{cat.label}</span>
                                            {selectedCategory === cat.value && <span className={styles.checkmark}>✓</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className={styles.items}>
                    {filteredProducts.length > 0 ? (
                        <div className={styles.productsGrid}>
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onEdit={handleOpenEditModal}
                                    onDelete={handleDeleteProduct}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noProducts}>
                            <span>😔</span>
                            <p>Товары не найдены</p>
                            <button 
                                className={styles.clearFilters}
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('all');
                                }}
                            >
                                Очистить фильтры
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                isEditing={isEditing}
                formData={formData}
                setFormData={setFormData}
                onSave={handleSaveProduct}
                categories={Array.isArray(categories) ? categories.map(c => ({ value: c.id.toString(), label: c.name, icon: '📁' })) : []}
            />
        </div>
    );
}