'use client';

import { useState, useEffect } from 'react';
import HeaderBlokAdmin from '../../../../components/HeaderBlokAdmin/headerBlokAdmin';
import styles from './style.module.css';

export default function AdminManagers() {
    const [searchTerm, setSearchTerm] = useState('');
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'manager',
        canViewDashboard: true,
        canViewOrders: false,
        canManageOrders: false,
        canViewProducts: false,
        canManageProducts: false,
        canViewCustomers: false,
        canManageCustomers: false,
        canViewCategories: false,
        canManageCategories: false
    });

    useEffect(() => {
        fetchManagers();
    }, []);

    useEffect(() => {
        if (isModalOpen && !isEditing) {
            setFormData({
                name: '',
                email: '',
                phone: '',
                password: '',
                role: 'manager',
                canViewDashboard: true,
                canViewOrders: false,
                canManageOrders: false,
                canViewProducts: false,
                canManageProducts: false,
                canViewCustomers: false,
                canManageCustomers: false,
                canViewCategories: false,
                canManageCategories: false
            });
        }
    }, [isModalOpen, isEditing]);

    const fetchManagers = async () => {
        try {
            const res = await fetch('/api/admin/managers');
            const data = await res.json();
            if (Array.isArray(data)) {
                setManagers(data);
            }
        } catch (error) {
            console.error('Ошибка:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            password: '',
            role: 'manager',
            canViewDashboard: true,
            canViewOrders: false,
            canManageOrders: false,
            canViewProducts: false,
            canManageProducts: false,
            canViewCustomers: false,
            canManageCustomers: false,
            canViewCategories: false,
            canManageCategories: false
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (manager) => {
        setIsEditing(true);
        setEditingId(manager.id);
        setFormData({
            name: manager.name || '',
            email: manager.email || '',
            phone: manager.phone || '',
            password: '',
            role: manager.role || 'manager',
            canViewDashboard: manager.canViewDashboard || false,
            canViewOrders: manager.canViewOrders || false,
            canManageOrders: manager.canManageOrders || false,
            canViewProducts: manager.canViewProducts || false,
            canManageProducts: manager.canManageProducts || false,
            canViewCustomers: manager.canViewCustomers || false,
            canManageCustomers: manager.canManageCustomers || false,
            canViewCategories: manager.canViewCategories || false,
            canManageCategories: manager.canManageCategories || false
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setEditingId(null);
    };

    const handleSaveManager = async () => {
        if (!formData.name || !formData.email) {
            alert('Заполните имя и email');
            return;
        }

        if (!isEditing && !formData.password) {
            alert('Введите пароль');
            return;
        }

        try {
            const url = '/api/admin/managers';
            const method = isEditing ? 'PUT' : 'POST';
            const body = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                canViewDashboard: formData.canViewDashboard,
                canViewOrders: formData.canViewOrders,
                canManageOrders: formData.canManageOrders,
                canViewProducts: formData.canViewProducts,
                canManageProducts: formData.canManageProducts,
                canViewCustomers: formData.canViewCustomers,
                canManageCustomers: formData.canManageCustomers,
                canViewCategories: formData.canViewCategories,
                canManageCategories: formData.canManageCategories
            };
            if (!isEditing) body.password = formData.password;
            if (isEditing) body.id = editingId;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                alert(isEditing ? 'Менеджер обновлён' : 'Менеджер создан');
                await fetchManagers();
                handleCloseModal();
            } else {
                const error = await res.json();
                alert(error.error || 'Ошибка');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка сервера');
        }
    };

    const handleDeleteManager = async (id, name) => {
        if (confirm(`Удалить менеджера "${name}"?`)) {
            try {
                const res = await fetch(`/api/admin/managers?id=${id}`, { method: 'DELETE' });
                if (res.ok) {
                    await fetchManagers();
                } else {
                    alert('Ошибка удаления');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Ошибка сервера');
            }
        }
    };

    const filteredManagers = managers.filter(manager =>
        manager.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className={styles.loading}>Загрузка...</div>;
    }

    return (
        <div className={styles.managersPage}>
            <div className={styles.head}>
                <HeaderBlokAdmin title='Менеджеры' subtitle='Управление сотрудниками и правами.' />
            </div>
            <div className={styles.container}>
                <div className={styles.topBlok}>
                    <div className={styles.title}>
                        <h2>Менеджеры</h2>
                        <p>Всего: {managers.length}</p>
                    </div>
                    <div className={styles.topRight}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="🔍 Поиск..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className={styles.addBtn} onClick={handleOpenAddModal}>
                            + Добавить
                        </button>
                    </div>
                </div>

                <div className={styles.cardsGrid}>
                    {filteredManagers.length > 0 ? (
                        filteredManagers.map((manager) => (
                            <div key={manager.id} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.avatar}>
                                        {manager.name?.[0] || 'М'}
                                    </div>
                                    <div className={styles.cardInfo}>
                                        <h3>{manager.name || 'Без имени'}</h3>
                                        <p>{manager.email}</p>
                                    </div>
                                </div>
                                <div className={styles.cardDetails}>
                                    <div className={styles.detailRow}>
                                        <span>📞 Телефон:</span>
                                        <span>{manager.phone || '—'}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>👔 Роль:</span>
                                        <span className={styles.roleBadge}>
                                            {manager.role === 'manager' ? 'Менеджер' : manager.role}
                                        </span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>📅 Регистрация:</span>
                                        <span>{new Date(manager.createdAt).toLocaleDateString('ru-RU')}</span>
                                    </div>
                                </div>
                                <div className={styles.cardActions}>
                                    <button className={styles.editBtn} onClick={() => handleOpenEditModal(manager)}>
                                        ✏️ Редактировать
                                    </button>
                                    <button className={styles.deleteBtn} onClick={() => handleDeleteManager(manager.id, manager.name)}>
                                        🗑️ Удалить
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <span>😔</span>
                            <p>Менеджеры не найдены</p>
                            <button className={styles.emptyBtn} onClick={handleOpenAddModal}>
                                + Добавить менеджера
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={handleCloseModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2>{isEditing ? 'Редактировать' : 'Добавить менеджера'}</h2>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Имя *</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Иван Иванов" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email *</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="manager@armfruit.ru" />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Телефон</label>
                                <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+7 (999) 123-45-67" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Роль</label>
                                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                                    <option value="manager">Менеджер</option>
                                </select>
                            </div>
                        </div>

                        {!isEditing && (
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Пароль *</label>
                                    <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="******" />
                                </div>
                                <div className={styles.formGroup}></div>
                            </div>
                        )}

                        <div className={styles.permissionsRow}>
                            <div className={styles.permissionGroup}>
                                <h4>📊 Дашборд</h4>
                                <label><input type="checkbox" checked={formData.canViewDashboard} onChange={(e) => setFormData({...formData, canViewDashboard: e.target.checked})} /> Просмотр дашборда</label>
                            </div>

                            <div className={styles.permissionGroup}>
                                <h4>📦 Заказы</h4>
                                <label><input type="checkbox" checked={formData.canViewOrders} onChange={(e) => setFormData({...formData, canViewOrders: e.target.checked})} /> Просмотр</label>
                                <label><input type="checkbox" checked={formData.canManageOrders} onChange={(e) => setFormData({...formData, canManageOrders: e.target.checked})} /> Управление</label>
                            </div>

                            <div className={styles.permissionGroup}>
                                <h4>🛒 Товары</h4>
                                <label><input type="checkbox" checked={formData.canViewProducts} onChange={(e) => setFormData({...formData, canViewProducts: e.target.checked})} /> Просмотр</label>
                                <label><input type="checkbox" checked={formData.canManageProducts} onChange={(e) => setFormData({...formData, canManageProducts: e.target.checked})} /> Управление</label>
                            </div>

                            <div className={styles.permissionGroup}>
                                <h4>👥 Клиенты</h4>
                                <label><input type="checkbox" checked={formData.canViewCustomers} onChange={(e) => setFormData({...formData, canViewCustomers: e.target.checked})} /> Просмотр</label>
                                <label><input type="checkbox" checked={formData.canManageCustomers} onChange={(e) => setFormData({...formData, canManageCustomers: e.target.checked})} /> Управление</label>
                            </div>

                            <div className={styles.permissionGroup}>
                                <h4>📁 Категории</h4>
                                <label><input type="checkbox" checked={formData.canViewCategories} onChange={(e) => setFormData({...formData, canViewCategories: e.target.checked})} /> Просмотр категорий</label>
                                <label><input type="checkbox" checked={formData.canManageCategories} onChange={(e) => setFormData({...formData, canManageCategories: e.target.checked})} /> Управление категориями</label>
                            </div>
                        </div>

                        <div className={styles.modalButtons}>
                            <button className={styles.cancelBtn} onClick={handleCloseModal}>Отмена</button>
                            <button className={styles.saveBtn} onClick={handleSaveManager}>Сохранить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}