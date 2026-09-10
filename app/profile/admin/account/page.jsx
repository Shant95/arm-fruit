'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeaderBlokAdmin from '../../../../components/HeaderBlokAdmin/headerBlokAdmin';
import styles from './style.module.css';

export default function AdminAccount() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        phone: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                
                if (!data.user || (data.user.role !== 'admin' && data.user.role !== 'manager')) {
                    router.push('/profile/admin/login');
                } else {
                    setUser(data.user);
                    setFormData({
                        name: data.user.name || '',
                        lastName: data.user.lastName || '',
                        phone: data.user.phone || ''
                    });
                }
            } catch (error) {
                console.error('Ошибка:', error);
                router.push('/profile/admin/login');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [router]);

    const handleEdit = (e) => {
        e.preventDefault();
        setIsEditing(true);
        setMessage('');
    };

    const handleCancel = (e) => {
        e.preventDefault();
        setIsEditing(false);
        setIsChangingPassword(false);
        setFormData({
            name: user?.name || '',
            lastName: user?.lastName || '',
            phone: user?.phone || ''
        });
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const res = await fetch('/api/admin/account', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setUser({ ...user, ...formData });
                setMessage({ type: 'success', text: 'Данные успешно обновлены' });
                setIsEditing(false);
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage({ type: 'error', text: data.error || 'Ошибка обновления' });
            }
        } catch (error) {
            console.error('Ошибка:', error);
            setMessage({ type: 'error', text: 'Ошибка сервера' });
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Новые пароли не совпадают' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Пароль должен быть не менее 6 символов' });
            return;
        }

        try {
            const res = await fetch('/api/admin/account', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Пароль успешно изменён' });
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setIsChangingPassword(false);
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage({ type: 'error', text: data.error || 'Ошибка смены пароля' });
            }
        } catch (error) {
            console.error('Ошибка:', error);
            setMessage({ type: 'error', text: 'Ошибка сервера' });
        }
    };

    if (loading) {
        return <div className={styles.loading}>Загрузка...</div>;
    }

    return (
        <div className={styles.accountPage}>
            <div className={styles.head}>
                <HeaderBlokAdmin title='Личный кабинет' subtitle='Управление личными данными.' />
            </div>
            <div className={styles.container}>
                <div className={styles.formCard}>
                    <h2>Личные данные</h2>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label>Имя</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Ваше имя"
                                />
                            ) : (
                                <p className={styles.value}>{user?.name || 'Не указано'}</p>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Фамилия</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Ваша фамилия"
                                />
                            ) : (
                                <p className={styles.value}>{user?.lastName || 'Не указана'}</p>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Email</label>
                            <p className={styles.value}>{user?.email}</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Телефон</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+7 (999) 123-45-67"
                                />
                            ) : (
                                <p className={styles.value}>{user?.phone || 'Не указан'}</p>
                            )}
                        </div>

                        {message && (
                            <div className={`${styles.message} ${styles[message.type]}`}>
                                {message.text}
                            </div>
                        )}

                        <div className={styles.buttons}>
                            {isEditing ? (
                                <>
                                    <button type="submit" className={styles.saveBtn}>Сохранить</button>
                                    <button type="button" className={styles.cancelBtn} onClick={handleCancel}>Отмена</button>
                                </>
                            ) : (
                                <>
                                    <button type="button" className={styles.editBtn} onClick={handleEdit}>Редактировать</button>
                                    {!isChangingPassword && (
                                        <button type="button" className={styles.changePasswordBtn} onClick={() => setIsChangingPassword(true)}>
                                            Сменить пароль
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </form>

                    {/* Форма смены пароля */}
                    {isChangingPassword && (
                        <form onSubmit={handlePasswordSubmit} className={styles.passwordForm}>
                            <h3>Смена пароля</h3>
                            <div className={styles.formGroup}>
                                <label>Текущий пароль *</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Введите текущий пароль"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Новый пароль *</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Минимум 6 символов"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Подтвердите новый пароль *</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Повторите новый пароль"
                                />
                            </div>
                            <div className={styles.buttons}>
                                <button type="submit" className={styles.saveBtn}>Сменить пароль</button>
                                <button type="button" className={styles.cancelBtn} onClick={handleCancel}>Отмена</button>
                            </div>
                        </form>
                    )}
                </div>

                <div className={styles.infoCard}>
                    <h3>Информация</h3>
                    <div className={styles.infoRow}>
                        <span>Роль:</span>
                        <span className={styles.role}>{user?.role === 'admin' ? 'Администратор' : 'Менеджер'}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>ID:</span>
                        <span>{user?.id}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>Дата регистрации:</span>
                        <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : '-'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}