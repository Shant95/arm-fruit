'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HeaderBlokAdmin from '../../../../components/HeaderBlokAdmin/headerBlokAdmin';
import styles from './style.module.css';

export default function ManagerDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalOrders: 0,
        newOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        totalCustomers: 0,
        totalRevenue: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, ordersRes] = await Promise.all([
                    fetch('/api/manager/stats'),
                    fetch('/api/manager/orders?limit=5')
                ]);
                
                const statsData = await statsRes.json();
                const ordersData = await ordersRes.json();
                
                setStats(statsData);
                setRecentOrders(ordersData);
            } catch (error) {
                console.error('Ошибка загрузки:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    const getStatusBadge = (status) => {
        switch(status) {
            case 'new': return <span className={`${styles.statusBadge} ${styles.statusNew}`}>🆕 Новый</span>;
            case 'processing': return <span className={`${styles.statusBadge} ${styles.statusProcessing}`}>⚙️ В обработке</span>;
            case 'shipping': return <span className={`${styles.statusBadge} ${styles.statusShipping}`}>🚚 В доставке</span>;
            case 'delivered': return <span className={`${styles.statusBadge} ${styles.statusDelivered}`}>✅ Доставлен</span>;
            case 'completed': return <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>✔️ Завершён</span>;
            case 'cancelled': return <span className={`${styles.statusBadge} ${styles.statusCancelled}`}>❌ Отменён</span>;
            default: return <span className={styles.statusBadge}>❔ Неизвестно</span>;
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU').format(price);
    };

    if (loading) {
        return <div className={styles.loading}>Загрузка...</div>;
    }

    return (
        <div className={styles.dashboardPage}>
            <div className={styles.head}>
                <HeaderBlokAdmin title='Панель менеджера' subtitle='Управление заказами и клиентами.' />
            </div>
            <div className={styles.container}>
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>📦</div>
                        <div className={styles.statValue}>{stats.totalOrders}</div>
                        <div className={styles.statLabel}>Всего заказов</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>🆕</div>
                        <div className={styles.statValue}>{stats.newOrders}</div>
                        <div className={styles.statLabel}>Новых заказов</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>⚙️</div>
                        <div className={styles.statValue}>{stats.processingOrders}</div>
                        <div className={styles.statLabel}>В обработке</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>🚚</div>
                        <div className={styles.statValue}>{stats.shippedOrders}</div>
                        <div className={styles.statLabel}>В доставке</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>👥</div>
                        <div className={styles.statValue}>{stats.totalCustomers}</div>
                        <div className={styles.statLabel}>Клиентов</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>💰</div>
                        <div className={styles.statValue}>{formatPrice(stats.totalRevenue)} ₽</div>
                        <div className={styles.statLabel}>Выручка</div>
                    </div>
                </div>

                <div className={styles.recentSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Последние заказы</h2>
                        <button className={styles.viewAllBtn} onClick={() => router.push('/profile/manager/orders')}>
                            Все заказы →
                        </button>
                    </div>
                    <div className={styles.tableWrapper}>
                        <table className={styles.ordersTable}>
                            <thead>
                                <tr>
                                    <th>№ заказа</th>
                                    <th>Клиент</th>
                                    <th>Телефон</th>
                                    <th>Дата</th>
                                    <th>Сумма</th>
                                    <th>Статус</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td className={styles.orderId}>#{order.id}</td>
                                        <td>{order.user?.name || 'Неизвестно'}</td>
                                        <td>{order.user?.phone || '—'}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</td>
                                        <td className={styles.orderTotal}>{formatPrice(order.total)} ₽</td>
                                        <td>{getStatusBadge(order.status)}</td>
                                        <td>
                                            <button 
                                                className={styles.viewBtn}
                                                onClick={() => router.push(`/profile/manager/orders/${order.id}`)}
                                            >
                                                👁️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={styles.quickActions}>
                    <h3>Быстрые действия</h3>
                    <div className={styles.actionsGrid}>
                        <button className={styles.actionBtn} onClick={() => router.push('/profile/manager/orders')}>
                            <span className={styles.actionIcon}>📦</span>
                            <span>Заказы</span>
                        </button>
                        <button className={styles.actionBtn} onClick={() => router.push('/profile/manager/customers')}>
                            <span className={styles.actionIcon}>👥</span>
                            <span>Клиенты</span>
                        </button>
                        <button className={styles.actionBtn} onClick={() => router.push('/profile/manager/account')}>
                            <span className={styles.actionIcon}>👤</span>
                            <span>Профиль</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}