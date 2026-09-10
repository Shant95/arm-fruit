'use client';

import { useState, useEffect } from 'react';
import HeaderBlokAdmin from '../../../../components/HeaderBlokAdmin/headerBlokAdmin';
import styles from './style.module.css';

export default function AdminClients() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    // Загрузка клиентов из базы данных
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await fetch('/api/admin/clients');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setClients(data);
                } else {
                    setClients([]);
                }
            } catch (error) {
                console.error('Ошибка загрузки клиентов:', error);
                setClients([]);
            } finally {
                setLoading(false);
            }
        };
        fetchClients();
    }, []);

    // Статистика
    const stats = {
        total: clients.length,
        active: clients.filter(c => c.status === 'active' || c.isActive === true).length,
        inactive: clients.filter(c => c.status === 'inactive' || (c.isActive === false && c.status !== 'blocked')).length,
        blocked: clients.filter(c => c.status === 'blocked').length,
    };

    // Список статусов для фильтра
    const statuses = [
        { value: 'all', label: 'Все статусы', icon: '📋' },
        { value: 'active', label: 'Активные', icon: '🟢' },
        { value: 'inactive', label: 'Неактивные', icon: '⚪' },
        { value: 'blocked', label: 'Заблокированные', icon: '🔴' },
    ];

    // Фильтрация клиентов
    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             client.phone?.includes(searchTerm);
        const clientStatus = client.status === 'blocked' ? 'blocked' : (client.isActive ? 'active' : 'inactive');
        const matchesStatus = selectedStatus === 'all' || clientStatus === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const getSelectedStatusLabel = () => {
        if (selectedStatus === 'all') return 'Все статусы';
        const status = statuses.find(s => s.value === selectedStatus);
        return status ? `${status.icon} ${status.label}` : 'Все статусы';
    };

    const getStatusBadge = (client) => {
        if (client.status === 'blocked') {
            return <span className={`${styles.statusBadge} ${styles.statusBlocked}`}>🔴 Заблокирован</span>;
        }
        if (client.isActive) {
            return <span className={`${styles.statusBadge} ${styles.statusActive}`}>🟢 Активен</span>;
        }
        return <span className={`${styles.statusBadge} ${styles.statusInactive}`}>⚪ Не активен</span>;
    };

    const handleBlockClient = async (id, name, currentStatus) => {
        const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
        
        if (confirm(`${currentStatus === 'blocked' ? 'Разблокировать' : 'Заблокировать'} клиента "${name}"?`)) {
            try {
                const res = await fetch('/api/admin/clients', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, status: newStatus })
                });
                
                if (res.ok) {
                    setClients(clients.map(client => 
                        client.id === id ? { ...client, status: newStatus === 'blocked' ? 'blocked' : undefined, isActive: newStatus === 'active' } : client
                    ));
                } else {
                    alert('Ошибка обновления статуса');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Ошибка сервера');
            }
        }
    };

    const handleDeleteClient = async (id, name) => {
        if (confirm(`Удалить клиента "${name}"? Это действие нельзя отменить.`)) {
            try {
                const res = await fetch(`/api/admin/clients?id=${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setClients(clients.filter(client => client.id !== id));
                } else {
                    alert('Ошибка удаления');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Ошибка сервера');
            }
        }
    };

    if (loading) {
        return <div className={styles.loading}>Загрузка...</div>;
    }

    return (
        <div className={styles.clientsPage}>
            <div className={styles.head}>
                <HeaderBlokAdmin title='Клиенты' subtitle='Управляйте клиентами и пользователями.' />
            </div>
            <div className={styles.container}>
                <div className={styles.topBlok}>
                    <div className={styles.title}>
                        <h2>Список клиентов</h2>
                        <p>Показано: {filteredClients.length} из {clients.length}</p>
                    </div>
                </div>
                
                {/* Фильтры */}
                <div className={styles.inputs}>
                    <div className={styles.search}>
                        <input 
                            className={styles.input} 
                            placeholder='🔍 Поиск по имени, email или телефону...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className={styles.categories}>
                        <label className={styles.label}>Статус</label>
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

                {/* Статистика */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.total}</div>
                        <div className={styles.statLabel}>Всего клиентов</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.active}</div>
                        <div className={styles.statLabel}>Активные</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.inactive}</div>
                        <div className={styles.statLabel}>Неактивные</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.blocked}</div>
                        <div className={styles.statLabel}>Заблокированные</div>
                    </div>
                </div>
                
                {/* Таблица клиентов */}
                <div className={styles.items}>
                    {filteredClients.length > 0 ? (
                        <div className={styles.tableWrapper}>
                            <table className={styles.clientTable}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>ФИО</th>
                                        <th>Email</th>
                                        <th>Телефон</th>
                                        <th>Заказов</th>
                                        <th>Дата регистрации</th>
                                        <th>Статус</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredClients.map((client) => (
                                        <tr key={client.id}>
                                            <td>{client.id}</td>
                                            <td className={styles.clientName}>{client.name || 'Не указан'}</td>
                                            <td>{client.email}</td>
                                            <td>{client.phone || 'Не указан'}</td>
                                            <td className={styles.ordersCount}>{client._count?.orders || 0}</td>
                                            <td>{new Date(client.createdAt).toLocaleDateString('ru-RU')}</td>
                                            <td>{getStatusBadge(client)}</td>
                                            <td className={styles.actions}>
                                                <button 
                                                    className={styles.viewBtn}
                                                    title="Просмотреть"
                                                    onClick={() => alert(`Клиент: ${client.name}\nEmail: ${client.email}\nТелефон: ${client.phone || 'Не указан'}\nЗаказов: ${client._count?.orders || 0}\nСтатус: ${client.isActive ? 'Активен' : 'Не активен'}`)}
                                                >
                                                    👁️
                                                </button>
                                                <button 
                                                    className={styles.editBtn}
                                                    title="Редактировать"
                                                    onClick={() => alert(`Редактирование клиента "${client.name}" (функция в разработке)`)}
                                                >
                                                    ✏️
                                                </button>
                                                <button 
                                                    className={client.status === 'blocked' ? styles.unblockBtn : styles.blockBtn}
                                                    title={client.status === 'blocked' ? 'Разблокировать' : 'Заблокировать'}
                                                    onClick={() => handleBlockClient(client.id, client.name, client.status === 'blocked' ? 'blocked' : (client.isActive ? 'active' : 'inactive'))}
                                                >
                                                    {client.status === 'blocked' ? '🔓' : '🔒'}
                                                </button>
                                                <button 
                                                    className={styles.deleteBtn}
                                                    title="Удалить"
                                                    onClick={() => handleDeleteClient(client.id, client.name)}
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
                            <p>Клиенты не найдены</p>
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
        </div>
    );
}