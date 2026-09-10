'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './style.module.css';

export default function Item() {
    const { id } = useParams();
    const router = useRouter();
    const { t, lang } = useTranslation();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const descriptionRef = useRef(null);

    useEffect(() => {
        if (!id) return;
        
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${id}`);
                const data = await res.json();
                if (res.ok) {
                    setProduct(data);
                } else {
                    router.push('/catalog');
                }
            } catch (error) {
                console.error('Ошибка загрузки товара:', error);
                router.push('/catalog');
            } finally {
                setLoading(false);
            }
        };
        
        fetchProduct();
    }, [id, router]);

    const handleOpenModal = () => {
        setIsOpen(true);
    };

    const handleCloseModal = () => {
        setIsOpen(false);
    };

    const handleToggleDescription = () => {
        setIsExpanded(!isExpanded);
        
        if (!isExpanded) {
            setTimeout(() => {
                descriptionRef.current?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 100);
        }
    };

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
    };

    // Получаем название товара в зависимости от языка
    const getProductName = () => {
        if (!product) return '';
        if (lang === 'am' && product.nameAm) {
            return product.nameAm;
        }
        return product.name;
    };

    // Получаем описание товара в зависимости от языка
    const getProductDescription = () => {
        if (!product) return t('no_description');
        if (lang === 'am' && product.descriptionAm) {
            return product.descriptionAm;
        }
        return product.description || t('no_description');
    };

    const addToCart = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                nameAm: product.nameAm,
                price: product.price,
                image: product.image || '📦',
                quantity: 1,
                isOnOrder: product.isOnOrder || false
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        if (window.showAddToCartNotification) {
            window.showAddToCartNotification(getProductName());
        }
        
        window.dispatchEvent(new Event('cartUpdated'));
        setShowSuccessModal(true);
    };

    if (loading) {
        return <div className={styles.loading}>{t('loading')}</div>;
    }

    if (!product) {
        return <div className={styles.notFound}>{t('not_found')}</div>;
    }

    const fullDescription = getProductDescription();
    const shortDescription = fullDescription.slice(0, 200) + '...';
    const isOnOrder = product.isOnOrder;
    const displayName = getProductName();

    const getUnitText = () => {
        if (product.unit === 'box') return t('box');
        return t('kg');
    };

    return (
        <>
            <div className={styles.item}>
                <div className={styles.container}>
                    <div className={styles.containerimage}>
                        <div className={styles.images} onClick={handleOpenModal}>
                            <Image 
                                className={styles.image} 
                                src={product.image} 
                                alt={displayName} 
                                width={400} 
                                height={400}
                            />
                        </div>
                    </div>
                    <div className={styles.containerInform}>
                        <div className={styles.name}>{displayName}</div>
                        
                        {/* Блок с ценой */}
                        <div className={styles.productInfoBlock}>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>{t('price')}:</span>
                                <span className={styles.infoValue}>
                                    {isOnOrder ? t('price_on_request') : `${product.price} ₽ / ${getUnitText()}`}
                                </span>
                            </div>
                        </div>
                        
                        {/* Блок информации о заказе - только для товаров "Под заказ" */}
                        {isOnOrder && (
                            <div className={styles.onOrderInfo}>
                                <div className={styles.onOrderLeft}>
                                    <span className={styles.onOrderLabel}>{t('on_order')}</span>
                                </div>
                                <div className={styles.onOrderRight}>
                                    <p className={styles.onOrderPrice}>{t('price_on_request')}</p>
                                    <p className={styles.onOrderText}>{t('on_order_info_text')}</p>
                                </div>
                            </div>
                        )}

                        <div className={styles.description} ref={descriptionRef}>
                            <h2>{t('description')}</h2>
                            <p className={styles.descriptionText}>
                                {isExpanded ? fullDescription : shortDescription}
                            </p>
                            {fullDescription.length > 200 && (
                                <button 
                                    className={styles.showMoreBtn} 
                                    onClick={handleToggleDescription}
                                >
                                    {isExpanded ? t('hide') : t('read_more')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className={styles.blok}>
                    <div className={styles.price}>
                        <h3>{t('price')}</h3>
                        <p>{isOnOrder ? t('price_on_request') : `${product.price} ₽`}</p>
                    </div>
                    <button className={styles.addButton} onClick={addToCart}>
                        {isOnOrder ? t('preorder') : t('add_to_cart')}
                    </button>
                    <Link className={styles.button} href='/cart'>{t('go_to_cart')}</Link>
                    <div className={styles.inform}>
                        <h2>{t('need_help')}</h2>
                        <p>{t('help_text')}</p>
                        <p>8(9057777390)</p>
                        <p>shantabrahamyan777@gmail.com</p>
                    </div>
                </div>

                {isOpen && (
                    <div className={styles.modalImage} onClick={handleCloseModal}>
                        <button className={styles.close} onClick={handleCloseModal}>✕</button>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <Image 
                                className={styles.modalImg} 
                                src={product.image} 
                                alt={displayName}
                                width={800}
                                height={800}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Модальное окно успеха */}
            {showSuccessModal && (
                <div className={styles.modalOverlay} onClick={closeSuccessModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalIcon}>✅</div>
                        <h2 className={styles.modalTitle}>{t('product_added')}</h2>
                        <p className={styles.modalMessage}>
                            {displayName} {t('to_cart')}
                        </p>
                        <div className={styles.modalButtons}>
                            <button className={styles.modalCancelBtn} onClick={closeSuccessModal}>
                                {t('continue_shopping')}
                            </button>
                            <button className={styles.modalConfirmBtn} onClick={() => router.push('/cart')}>
                                {t('go_to_cart')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}