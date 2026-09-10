'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeaderBlokAdmin from '../../../../components/HeaderBlokAdmin/headerBlokAdmin';
import styles from './style.module.css';

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [isPeriodOpen, setIsPeriodOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        stats: {
            totalOrders: 0,
            totalRevenue: 0,
            totalCustomers: 0,
            totalProducts: 0,
            averageCheck: 0,
        },
        ordersByStatus: {
            new: 0,
            processing: 0,
            shipping: 0,
            delivered: 0,
            completed: 0,
            cancelled: 0,
        },
        recentOrders: [],
        topProducts: [],
        salesByDay: {
            mon: 0,
            tue: 0,
            wed: 0,
            thu: 0,
            fri: 0,
            sat: 0,
            sun: 0,
        },
    });

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                const user = data.user;
                
                if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
                    router.push('/profile/admin/login');
                } else if (user.role === 'manager' && !user.canViewDashboard) {
                    router.push('/profile/admin/dashboard');
                }
            } catch (error) {
                console.error('Ошибка проверки:', error);
                router.push('/profile/admin/login');
            }
        };
        checkAccess();
    }, [router]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch('/api/admin/dashboard');
                const data = await res.json();
                setDashboardData(data);
            } catch (error) {
                console.error('Ошибка загрузки дашборда:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const periods = [
        { value: 'day', label: 'За день' },
        { value: 'week', label: 'За неделю' },
        { value: 'month', label: 'За месяц' },
        { value: 'year', label: 'За год' },
    ];

    const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU').format(price);
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'new':
                return <span className={`${styles.statusBadge} ${styles.statusNew}`}>🆕 Новый</span>;
            case 'processing':
                return <span className={`${styles.statusBadge} ${styles.statusProcessing}`}>⚙️ В обработке</span>;
            case 'shipping':
                return <span className={`${styles.statusBadge} ${styles.statusShipping}`}>🚚 В доставке</span>;
            case 'delivered':
                return <span className={`${styles.statusBadge} ${styles.statusDelivered}`}>✅ Доставлен</span>;
            case 'completed':
                return <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>✔️ Завершён</span>;
            case 'cancelled':
                return <span className={`${styles.statusBadge} ${styles.statusCancelled}`}>❌ Отменён</span>;
            default:
                return <span className={styles.statusBadge}>❔ Неизвестно</span>;
        }
    };

    const getSelectedPeriodLabel = () => {
        const period = periods.find(p => p.value === selectedPeriod);
        return period ? period.label : 'За неделю';
    };

    const maxSales = Math.max(...Object.values(dashboardData.salesByDay));
    const daysMap = {
        mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт', sat: 'Сб', sun: 'Вс'
    };

    if (loading) {
        return <div className={styles.loading}>Загрузка...</div>;
    }

    return (
        <div className={styles.dashboardPage}>
            <div className={styles.head}>
                <HeaderBlokAdmin title='Обзор' subtitle='Статистика и аналитика магазина.' />
            </div>
            
            <div className={styles.container}>
                <div className={styles.periodSelector}>
                    <label className={styles.periodLabel}>Период:</label>
                    <div className={styles.categoryWrapper}>
                        <div 
                            className={styles.categoryInput}
                            onClick={() => setIsPeriodOpen(!isPeriodOpen)}
                        >
                            <span>{getSelectedPeriodLabel()}</span>
                            <span className={styles.arrow}>{isPeriodOpen ? '▲' : '▼'}</span>
                        </div>
                        {isPeriodOpen && (
                            <div className={styles.categoryDropdown}>
                                {periods.map(period => (
                                    <div
                                        key={period.value}
                                        className={`${styles.categoryItem} ${selectedPeriod === period.value ? styles.activeCategory : ''}`}
                                        onClick={() => {
                                            setSelectedPeriod(period.value);
                                            setIsPeriodOpen(false);
                                        }}
                                    >
                                        <span>{period.label}</span>
                                        {selectedPeriod === period.value && <span className={styles.checkmark}>✓</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>📦</div>
                        <div className={styles.statValue}>{dashboardData.stats.totalOrders}</div>
                        <div className={styles.statLabel}>Всего заказов</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>💰</div>
                        <div className={styles.statValue}>{formatPrice(dashboardData.stats.totalRevenue)} ₽</div>
                        <div className={styles.statLabel}>Выручка</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>👥</div>
                        <div className={styles.statValue}>{dashboardData.stats.totalCustomers}</div>
                        <div className={styles.statLabel}>Клиентов</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>🛒</div>
                        <div className={styles.statValue}>{dashboardData.stats.totalProducts}</div>
                        <div className={styles.statLabel}>Товаров</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>💳</div>
                        <div className={styles.statValue}>{formatPrice(dashboardData.stats.averageCheck)} ₽</div>
                        <div className={styles.statLabel}>Средний чек</div>
                    </div>
                </div>

                <div className={styles.chartSection}>
                    <h3 className={styles.sectionTitle}>Продажи по дням</h3>
                    <div className={styles.chartContainer}>
                        {Object.entries(dashboardData.salesByDay).map(([day, value]) => (
                            <div key={day} className={styles.chartBar}>
                                <div className={styles.barLabel}>{daysMap[day]}</div>
                                <div 
                                    className={styles.barFill}
                                    style={{ height: maxSales > 0 ? `${(value / maxSales) * 100}%` : '0%' }}
                                >
                                    <span className={styles.barValue}>{formatPrice(value)} ₽</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.statusSection}>
                    <h3 className={styles.sectionTitle}>Статусы заказов</h3>
                    <div className={styles.statusGrid}>
                        <div className={styles.statusCard}>
                            <div className={styles.statusIcon}>🆕</div>
                            <div className={styles.statusCount}>{dashboardData.ordersByStatus.new}</div>
                            <div className={styles.statusLabel}>Новые</div>
                        </div>
                        <div className={styles.statusCard}>
                            <div className={styles.statusIcon}>⚙️</div>
                            <div className={styles.statusCount}>{dashboardData.ordersByStatus.processing}</div>
                            <div className={styles.statusLabel}>В обработке</div>
                        </div>
                        <div className={styles.statusCard}>
                            <div className={styles.statusIcon}>🚚</div>
                            <div className={styles.statusCount}>{dashboardData.ordersByStatus.shipping}</div>
                            <div className={styles.statusLabel}>В доставке</div>
                        </div>
                        <div className={styles.statusCard}>
                            <div className={styles.statusIcon}>✅</div>
                            <div className={styles.statusCount}>{dashboardData.ordersByStatus.delivered}</div>
                            <div className={styles.statusLabel}>Доставлены</div>
                        </div>
                        <div className={styles.statusCard}>
                            <div className={styles.statusIcon}>✔️</div>
                            <div className={styles.statusCount}>{dashboardData.ordersByStatus.completed}</div>
                            <div className={styles.statusLabel}>Завершены</div>
                        </div>
                        <div className={styles.statusCard}>
                            <div className={styles.statusIcon}>❌</div>
                            <div className={styles.statusCount}>{dashboardData.ordersByStatus.cancelled}</div>
                            <div className={styles.statusLabel}>Отменены</div>
                        </div>
                    </div>
                </div>

                <div className={styles.twoColumns}>
                    <div className={styles.recentOrders}>
                        <div className={styles.columnHeader}>
                            <h3 className={styles.sectionTitle}>Последние заказы</h3>
                            <button className={styles.viewAllBtn} onClick={() => router.push('/profile/admin/orders')}>
                                Все заказы →
                            </button>
                        </div>
                        <div className={styles.tableWrapper}>
                            <table className={styles.ordersTable}>
                                <thead>
                                    <tr>
                                        <th>№ заказа</th>
                                        <th>Клиент</th>
                                        <th>Дата</th>
                                        <th>Сумма</th>
                                        <th>Статус</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboardData.recentOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td className={styles.orderId}>#{order.id}</td>
                                            <td>{order.user?.name || 'Неизвестно'}</td>
                                            <td>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</td>
                                            <td className={styles.orderTotal}>{formatPrice(order.total)} ₽</td>
                                            <td>{getStatusBadge(order.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className={styles.topProducts}>
                        <div className={styles.columnHeader}>
                            <h3 className={styles.sectionTitle}>Топ товары</h3>
                            <button className={styles.viewAllBtn} onClick={() => router.push('/profile/admin/products')}>
                                Все товары →
                            </button>
                        </div>
                        <div className={styles.productsList}>
                            {dashboardData.topProducts.map((product, index) => (
                                <div key={index} className={styles.productItem}>
                                    <div className={styles.productRank}>#{index + 1}</div>
                                    <div className={styles.productInfo}>
                                        <div className={styles.productName}>{product.name}</div>
                                        <div className={styles.productStats}>
                                            <span>📦 {product.sales} шт</span>
                                            <span>💰 {formatPrice(product.revenue)} ₽</span>
                                        </div>
                                    </div>
                                    <div 
                                        className={styles.productBar}
                                        style={{ width: dashboardData.topProducts[0]?.sales ? `${(product.sales / dashboardData.topProducts[0].sales) * 100}%` : '0%' }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.quickActions}>
                    <h3 className={styles.sectionTitle}>Быстрые действия</h3>
                    <div className={styles.actionsGrid}>
                        <button className={styles.actionBtn} onClick={() => router.push('/profile/admin/orders')}>
                            <span className={styles.actionIcon}>📦</span>
                            <span>Заказы</span>
                        </button>
                        <button className={styles.actionBtn} onClick={() => router.push('/profile/admin/products')}>
                            <span className={styles.actionIcon}>🛒</span>
                            <span>Товары</span>
                        </button>
                        <button className={styles.actionBtn} onClick={() => router.push('/profile/admin/categories')}>
                            <span className={styles.actionIcon}>📁</span>
                            <span>Категории</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}