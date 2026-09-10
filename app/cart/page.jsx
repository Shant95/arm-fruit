'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './style.module.css';

export default function Cart() {
    const { t, lang } = useTranslation();
    const router = useRouter();
    const [cartItems, setCartItems] = useState([]);
    const [isMounted, setIsMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('cart', JSON.stringify(cartItems));
            window.dispatchEvent(new Event('cartUpdated'));
        }
    }, [cartItems, isMounted]);

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(id);
        } else {
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.id === id ? { ...item, quantity: newQuantity } : item
                )
            );
        }
    };

    const removeFromCart = (id) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const clearCart = () => {
        setShowClearModal(true);
    };

    const confirmClearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));
        setShowClearModal(false);
    };

    const cancelClearCart = () => {
        setShowClearModal(false);
    };

    const handleSubmitOrder = async () => {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        
        if (!data.user) {
            localStorage.setItem('redirectAfterLogin', '/cart');
            localStorage.setItem('pendingCart', JSON.stringify(cartItems));
            router.push('/login');
            return;
        }
        
        if (cartItems.length === 0) {
            alert(t('cart_empty'));
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const orderItems = cartItems.map(item => ({
                name: item.name,
                nameAm: item.nameAm,
                quantity: item.quantity,
                price: item.price,
                isOnOrder: item.isOnOrder || false
            }));
            
            const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: orderItems,
                    total: totalPrice,
                    status: 'new'
                })
            });
            
            if (response.ok) {
                setShowSuccessModal(true);
                setCartItems([]);
                localStorage.removeItem('cart');
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
                const error = await response.json();
                alert(error.error || 'Ошибка при оформлении заказа');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при оформлении заказа');
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setShowSuccessModal(false);
        router.push('/profile/user/orders');
    };

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const hasItems = cartItems.length > 0;
    const hasOnOrderItems = cartItems.some(i => i.isOnOrder);
    const hasRegularItems = cartItems.some(i => !i.isOnOrder);
    
    const regularTotalPrice = cartItems
        .filter(i => !i.isOnOrder)
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Функция для отображения названия товара на выбранном языке
    const getProductName = (item) => {
        if (lang === 'am' && item.nameAm) {
            return item.nameAm;
        }
        return item.name;
    };

    if (!isMounted) {
        return (
            <div className={styles.cart}>
                <h1 className={styles.title}>{t('cart_title')}</h1>
                <p className={styles.subtitle}>{t('cart_subtitle')}</p>
                <div className={styles.container}>
                    <div className={styles.products} style={{ width: '100%' }}>
                        <div className={styles.emptyCart}>
                            <p>{t('loading')}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={styles.cart}>
                <h1 className={styles.title}>{t('cart_title')}</h1>
                <p className={styles.subtitle}>{t('cart_subtitle')}</p>

                <div className={styles.container}>
                    <div 
                        className={styles.products} 
                        style={{ width: cartItems.length === 0 ? '100%' : '65%' }}
                    >
                        {hasItems && (
                            <div className={styles.productsTopButtons}>
                                <Link href='/catalog' className={styles.productsCatalogBtn}>
                                    ← {t('to_catalog')}
                                </Link>
                                <button className={styles.productsClearBtn} onClick={clearCart}>
                                    🗑️ {t('clear_cart')}
                                </button>
                            </div>
                        )}

                        {cartItems.length === 0 ? (
                            <div className={styles.emptyCart}>
                                <p>🛒 {t('cart_empty')}</p>
                                <Link href='/catalog' className={styles.emptyBtn}>{t('to_catalog')}</Link>
                            </div>
                        ) : (
                            cartItems.map((item, index) => (
                                <div key={item.id || index} className={styles.productCard}>
                                    <div className={styles.productImage}>
                                        <Image src={item.image || '/images/placeholder.jpg'} alt={getProductName(item)} width={100} height={100} />
                                    </div>
                                    <div className={styles.productInfo}>
                                        <h3 className={styles.productName}>{getProductName(item)}</h3>
                                        {item.isOnOrder ? (
                                            <p className={styles.productPriceOnOrder}>{t('on_order')}</p>
                                        ) : (
                                            <p className={styles.productPrice}>{item.price} ₽ / {item.unit === 'box' ? t('box') : t('kg')}</p>
                                        )}
                                    </div>
                                    <div className={styles.productQuantity}>
                                        <button onClick={() => updateQuantity(item.id || index, item.quantity - 1)}>-</button>
                                        <span>{item.quantity} {item.isOnOrder ? t('pcs') : (item.unit === 'box' ? t('box') : t('kg'))}</span>
                                        <button onClick={() => updateQuantity(item.id || index, item.quantity + 1)}>+</button>
                                    </div>
                                    <div className={styles.productTotal}>
                                        {item.isOnOrder ? (
                                            <p className={styles.totalOnOrder}>{t('price_on_request')}</p>
                                        ) : (
                                            <p>{item.price * item.quantity} ₽</p>
                                        )}
                                    </div>
                                    <button className={styles.removeBtn} onClick={() => removeFromCart(item.id || index)}>
                                        🗑️
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {hasItems && (
                        <div className={styles.total}>
                            <div className={styles.totalBlok}>
                                <h3>{t('total')}</h3>
                                <p>{totalItems} {t('pcs')}</p>
                            </div>
                            <div className={styles.priceBlok}>
                                <h3>{t('total_sum')}</h3>
                                {hasRegularItems ? (
                                    <p>{regularTotalPrice} ₽</p>
                                ) : (
                                    <p className={styles.priceOnOrderTotal}>—</p>
                                )}
                                <p>{t('total_note')}</p>
                            </div>
                            
                            {hasOnOrderItems && (
                                <div className={styles.onOrderInfo}>
                                    <p>📦 {t('on_order_info')}</p>
                                </div>
                            )}
                            
                            <button 
                                className={styles.orderBtn} 
                                onClick={handleSubmitOrder}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? t('loading') : t('checkout')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showSuccessModal && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalIcon}>✅</div>
                        <h2 className={styles.modalTitle}>{t('order_sent')}</h2>
                        <p className={styles.modalMessage}>
                            {t('order_sent_message')}
                        </p>
                        <button className={styles.modalButton} onClick={closeModal}>
                            {t('ok')}
                        </button>
                    </div>
                </div>
            )}

            {showClearModal && (
                <div className={styles.modalOverlay} onClick={cancelClearCart}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalIcon}>🗑️</div>
                        <h2 className={styles.modalTitle}>{t('clear_cart_title')}</h2>
                        <p className={styles.modalMessage}>
                            {t('clear_cart_message')}
                        </p>
                        <div className={styles.modalButtons}>
                            <button className={styles.modalCancelBtn} onClick={cancelClearCart}>
                                {t('cancel')}
                            </button>
                            <button className={styles.modalConfirmBtn} onClick={confirmClearCart}>
                                {t('confirm_clear')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}