'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeaderBlokAdmin from '../../../../components/HeaderBlokAdmin/headerBlokAdmin';
import styles from './style.module.css';

export default function AdminOrders() {
    const router = useRouter();
    const [pageLoading, setPageLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Проверка прав доступа для менеджера
    useEffect(() => {
        const checkAccess = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                const user = data.user;
                
                if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
                    router.push('/profile/admin/login');
                } else if (user.role === 'manager' && !user.canViewOrders) {
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

    // Загрузка заказов из базы
    useEffect(() => {
        if (!pageLoading) {
            const fetchOrders = async () => {
                try {
                    const res = await fetch('/api/admin/orders');
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setOrders(data);
                    } else {
                        setOrders([]);
                    }
                } catch (error) {
                    console.error('Ошибка загрузки заказов:', error);
                    setOrders([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchOrders();
        }
    }, [pageLoading]);

    const statuses = [
        { value: 'all', label: 'Все статусы', icon: '📋' },
        { value: 'new', label: 'Новые', icon: '🆕' },
        { value: 'processing', label: 'В обработке', icon: '⚙️' },
        { value: 'shipping', label: 'Доставка', icon: '🚚' },
        { value: 'delivered', label: 'Доставлен', icon: '✅' },
        { value: 'completed', label: 'Завершён', icon: '✔️' },
        { value: 'cancelled', label: 'Отменён', icon: '❌' },
    ];

    const stats = {
        total: orders.length,
        new: orders.filter(o => o.status === 'new').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipping: orders.filter(o => o.status === 'shipping').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toString().includes(searchTerm) ||
                             order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             order.user?.phone?.includes(searchTerm);
        const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const getSelectedStatusLabel = () => {
        if (selectedStatus === 'all') return 'Все статусы';
        const status = statuses.find(s => s.value === selectedStatus);
        return status ? `${status.icon} ${status.label}` : 'Все статусы';
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

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });
            
            if (res.ok) {
                setOrders(orders.map(order => 
                    order.id === id ? { ...order, status: newStatus } : order
                ));
            } else {
                alert('Ошибка обновления статуса');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка сервера');
        }
    };

    const handleDeleteOrder = async (id) => {
        if (confirm(`Удалить заказ №${id}?`)) {
            try {
                const res = await fetch(`/api/admin/orders?id=${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setOrders(orders.filter(order => order.id !== id));
                } else {
                    alert('Ошибка удаления');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Ошибка сервера');
            }
        }
    };

    const openOrderDetails = (order) => {
        setSelectedOrder(order);
        setIsDetailModalOpen(true);
    };

    const closeOrderDetails = () => {
        setSelectedOrder(null);
        setIsDetailModalOpen(false);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU').format(price);
    };

    if (pageLoading) {
        return <div className={styles.loading}>Загрузка...</div>;
    }

    if (loading) {
        return <div className={styles.loading}>Загрузка заказов...</div>;
    }

    return (
        <div className={styles.ordersPage}>
            <div className={styles.head}>
                <HeaderBlokAdmin title='Заказы' subtitle='Управляйте заказами клиентов.' />
            </div>
            <div className={styles.container}>
                <div className={styles.topBlok}>
                    <div className={styles.title}>
                        <h2>Список заказов</h2>
                        <p>Показано: {filteredOrders.length} из {orders.length}</p>
                    </div>
                </div>
                
                <div className={styles.inputs}>
                    <div className={styles.search}>
                        <input 
                            className={styles.input} 
                            placeholder='🔍 Поиск...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className={styles.categories}>
                        <label className={styles.label}>Статус заказа</label>
                        <div className={styles.categoryWrapper}>
                            <div 
                                className={styles.categoryInput}
                                onClick={() => setIsStatusOpen(!isStatusOpen)}
                            >
                                <span>{getSelectedStatusLabel()}</span>
                                <span className={styles.arrow}>{isStatusOpen ? '▲' : '▼'}</span>
                            </div>
                            {isStatusOpen && (
                                <div className={styles.categoryDropdown}>
                                    {statuses.map(status => (
                                        <div
                                            key={status.value}
                                            className={`${styles.categoryItem} ${selectedStatus === status.value ? styles.activeCategory : ''}`}
                                            onClick={() => {
                                                setSelectedStatus(status.value);
                                                setIsStatusOpen(false);
                                            }}
                                        >
                                            <span>{status.icon}</span>
                                            <span>{status.label}</span>
                                            {selectedStatus === status.value && <span className={styles.checkmark}>✓</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.total}</div>
                        <div className={styles.statLabel}>Всего заказов</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.new}</div>
                        <div className={styles.statLabel}>Новые</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.processing}</div>
                        <div className={styles.statLabel}>В обработке</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.shipping}</div>
                        <div className={styles.statLabel}>В доставке</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.delivered + stats.completed}</div>
                        <div className={styles.statLabel}>Выполнено</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.cancelled}</div>
                        <div className={styles.statLabel}>Отменено</div>
                    </div>
                </div>
                
                <div className={styles.items}>
                    {filteredOrders.length > 0 ? (
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
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td className={styles.orderId}>#{order.id}</td>
                                            <td className={styles.clientName}>{order.user?.name || 'Неизвестно'}</td>
                                            <td>{order.user?.phone || 'Не указан'}</td>
                                            <td>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</td>
                                            <td className={styles.orderTotal}>{formatPrice(order.total)} ₽</td>
                                            <td>{getStatusBadge(order.status)}</td>
                                            <td className={styles.actions}>
                                                <button 
                                                    className={styles.viewBtn}
                                                    onClick={() => openOrderDetails(order)}
                                                >
                                                    👁️
                                                </button>
                                                <select 
                                                    className={styles.statusSelect}
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                >
                                                    {statuses.filter(s => s.value !== 'all').map(status => (
                                                        <option key={status.value} value={status.value}>
                                                            {status.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button 
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDeleteOrder(order.id)}
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className={styles.noProducts}>
                            <span>😔</span>
                            <p>Заказы не найдены</p>
                            <button 
                                className={styles.clearFilters}
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedStatus('all');
                                }}
                            >
                                Очистить фильтры
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isDetailModalOpen && selectedOrder && (
                <div className={styles.modalOverlay} onClick={closeOrderDetails}>
                    <div className={styles.modalWrapper} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Заказ #{selectedOrder.id}</h2>
                            <button className={styles.closeModalBtn} onClick={closeOrderDetails}>✕</button>
                        </div>
                        
                        <div className={styles.modalBody}>
                            <div className={styles.orderInfo}>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Клиент:</span>
                                    <span className={styles.infoValue}>{selectedOrder.user?.name || 'Неизвестно'}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Телефон:</span>
                                    <span className={styles.infoValue}>{selectedOrder.user?.phone || 'Не указан'}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Email:</span>
                                    <span className={styles.infoValue}>{selectedOrder.user?.email || 'Не указан'}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Дата заказа:</span>
                                    <span className={styles.infoValue}>{new Date(selectedOrder.createdAt).toLocaleDateString('ru-RU')}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Статус:</span>
                                    <span className={styles.infoValue}>{getStatusBadge(selectedOrder.status)}</span>
                                </div>
                            </div>

                            <div className={styles.orderItems}>
                                <h3>Товары в заказе</h3>
                                <table className={styles.itemsTable}>
                                    <thead>
                                        <tr>
                                            <th>Товар</th>
                                            <th>Кол-во</th>
                                            <th>Цена</th>
                                            <th>Сумма</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items?.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.name}</td>
                                                <td>{item.quantity} кг</td>
                                                <td>{formatPrice(item.price)} ₽</td>
                                                <td>{formatPrice(item.price * item.quantity)} ₽</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className={styles.totalRow}>
                                            <td colSpan="3">Итого:</td>
                                            <td className={styles.totalAmount}>{formatPrice(selectedOrder.total)} ₽</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={closeOrderDetails}>Закрыть</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}