'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './OrdersContent.module.css';

export default function OrdersContent({ orders }) {
    const { t, lang } = useTranslation();

    const statusMap = {
        'new': '🆕 ' + t('status_new'),
        'processing': '⚙️ ' + t('status_processing'),
        'shipping': '🚚 ' + t('status_shipping'),
        'delivered': '✅ ' + t('status_delivered'),
        'completed': '✔️ ' + t('status_completed'),
        'cancelled': '❌ ' + t('status_cancelled')
    };

    return (
        <div className={styles.ordersPage}>
            <div className={styles.header}>
                <h1>{t('my_orders')}</h1>
                <Link href="/profile/user" className={styles.backLink}>← {t('back_to_profile')}</Link>
            </div>

            {orders.length === 0 ? (
                <div className={styles.emptyOrders}>
                    <p>{t('no_orders')}</p>
                    <Link href="/catalog" className={styles.catalogLink}>{t('to_catalog')}</Link>
                </div>
            ) : (
                <div className={styles.ordersList}>
                    {orders.map((order) => {
                        const hasOnOrderItems = Array.isArray(order.items) && order.items.some(item => item.isOnOrder);
                        const regularTotal = Array.isArray(order.items)
                            ? order.items.filter(item => !item.isOnOrder).reduce((sum, item) => sum + (item.price * item.quantity), 0)
                            : 0;

                        return (
                            <div key={order.id} className={styles.orderCard}>
                                <div className={styles.orderHeader}>
                                    <span className={styles.orderId}>{t('order')} №{order.id}</span>
                                    <span className={`${styles.orderStatus} ${styles[order.status]}`}>
                                        {statusMap[order.status] || order.status}
                                    </span>
                                </div>
                                <div className={styles.orderDate}>
                                    {t('date')}: {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                                </div>
                                <div className={styles.orderItems}>
                                    <h3>{t('products')}:</h3>
                                    {Array.isArray(order.items) && order.items.map((item, index) => (
                                        <div key={index} className={styles.orderItem}>
                                            <div className={styles.orderItemImage}>
                                                {item.image ? (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        width={50}
                                                        height={50}
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div className={styles.imagePlaceholder}>📦</div>
                                                )}
                                            </div>
                                            <div className={styles.orderItemInfo}>
                                                <div className={styles.orderItemName}>
                                                    {lang === 'am' && item.nameAm ? item.nameAm : item.name}
                                                </div>
                                                {item.isOnOrder ? (
                                                    <div className={styles.orderItemDetails}>
                                                        {item.quantity} {t('pcs')} × {t('price_on_request')}
                                                    </div>
                                                ) : (
                                                    <div className={styles.orderItemDetails}>
                                                        {item.quantity} {t('kg')} × {item.price} ₽
                                                    </div>
                                                )}
                                            </div>
                                            <div className={styles.orderItemTotal}>
                                                {item.isOnOrder ? (
                                                    <span className={styles.priceOnOrder}>{t('price_on_request')}</span>
                                                ) : (
                                                    `${item.quantity * item.price} ₽`
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.orderTotal}>
                                    <strong>{t('total')}:</strong>{' '}
                                    {hasOnOrderItems ? (
                                        <>
                                            {regularTotal > 0 && `${regularTotal} ₽ + `}
                                            <span className={styles.priceOnOrder}>{t('price_on_request_on_order')}</span>
                                        </>
                                    ) : (
                                        `${order.total} ₽`
                                    )}
                                </div>

                                {hasOnOrderItems && (
                                    <div className={styles.onOrderInfo}>
                                        <p>📦 {t('on_order_info_text')}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}