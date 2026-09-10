'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './style.module.css';

const ProductPopularCard = ({ image, text, textAm, price, id, isPopular, isNew, isOnOrder, unit }) => {
    const { t, lang } = useTranslation();
    const [quantity, setQuantity] = useState(0);

    // Выбираем название в зависимости от языка
    const displayName = lang === 'am' && textAm ? textAm : text;

    // Функция для получения количества из корзины (обёрнута в useCallback)
    const getQuantityFromCart = useCallback(() => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const item = cart.find(item => item.id === id);
        return item?.quantity || 0;
    }, [id]);

    // Загружаем количество из корзины при монтировании и при изменении id
    useEffect(() => {
        setQuantity(getQuantityFromCart());
    }, [getQuantityFromCart]);

    // Обновляем количество при изменении корзины
    useEffect(() => {
        const handleCartUpdate = () => {
            setQuantity(getQuantityFromCart());
        };

        window.addEventListener('cartUpdated', handleCartUpdate);
        window.addEventListener('storage', handleCartUpdate);
        
        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
            window.removeEventListener('storage', handleCartUpdate);
        };
    }, [getQuantityFromCart]);

    const updateCart = (newQuantity) => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        if (newQuantity <= 0) {
            const updatedCart = cart.filter(item => item.id !== id);
            localStorage.setItem('cart', JSON.stringify(updatedCart));
            setQuantity(0);
        } else {
            const existingItem = cart.find(item => item.id === id);
            if (existingItem) {
                existingItem.quantity = newQuantity;
            } else {
                cart.push({
                    id: id,
                    name: text,
                    nameAm: textAm || null,
                    price: price,
                    image: image || '📦',
                    quantity: newQuantity,
                    isOnOrder: isOnOrder || false,
                    unit: unit || 'kg'
                });
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            setQuantity(newQuantity);
        }
        
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const addToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!id) {
            alert(t('product_id_error'));
            return;
        }
        
        const newQuantity = quantity + 1;
        updateCart(newQuantity);
        
        if (window.showAddToCartNotification) {
            window.showAddToCartNotification(displayName, t('product_added'), t('to_cart'));
        }
    };

    const increaseQuantity = (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateCart(quantity + 1);
    };

    const decreaseQuantity = (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateCart(quantity - 1);
    };

    const getImageSrc = () => {
        if (!image || typeof image !== 'string') {
            return '/images/placeholder.jpg';
        }
        if (image.startsWith('data:') || image.startsWith('http') || image.startsWith('/')) {
            return image;
        }
        return '/images/placeholder.jpg';
    };

    const isEmoji = (str) => {
        if (!str || typeof str !== 'string') return false;
        return str.length <= 2 && /[\u{1F300}-\u{1F9FF}]/u.test(str);
    };

    const imageSrc = getImageSrc();

    const getUnitText = () => {
        if (unit === 'box') return t('box');
        return t('kg');
    };

    return (
        <div className={styles.card}>
            <Link href={`/item/${id}`}>
                {isPopular && <div className={styles.typePopular}>{t('popular')}</div>}
                {isNew && <div className={styles.typeNew}>{t('new')}</div>}
                <div className={styles.image}>
                    {isEmoji(image) ? (
                        <div className={styles.emojiImage}>{image}</div>
                    ) : (
                        <Image 
                            src={imageSrc} 
                            alt={displayName || 'product'} 
                            width={200} 
                            height={150}
                            onError={(e) => {
                                e.target.src = '/images/placeholder.jpg';
                            }}
                        />
                    )}
                </div>
                <div className={styles.container}>
                    <p className={styles.name}>{displayName}</p>
                    {isOnOrder && <span className={styles.onOrderBadge}>{t('on_order')}</span>}
                    {isOnOrder ? (
                        <p className={styles.priceOnOrder}>{t('price_on_request')}</p>
                    ) : (
                        <p className={styles.price}>{price} ₽ / 1 {getUnitText()}</p>
                    )}
                </div>
            </Link>
            
            {quantity > 0 ? (
                <div className={styles.quantityControl}>
                    <button 
                        className={styles.quantityBtn}
                        onClick={decreaseQuantity}
                    >
                        −
                    </button>
                    <span className={styles.quantityValue}>
                        {quantity} {isOnOrder ? t('pcs') : getUnitText()}
                    </span>
                    <button 
                        className={styles.quantityBtn}
                        onClick={increaseQuantity}
                    >
                        +
                    </button>
                </div>
            ) : (
                <div className={styles.button} onClick={addToCart}>
                    {t('add_to_cart')}
                </div>
            )}
        </div>
    );
};

export default ProductPopularCard;