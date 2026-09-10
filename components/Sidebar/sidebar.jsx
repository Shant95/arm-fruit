'use client';

import { useState, useEffect } from 'react';
import styles from './style.module.css';
import Logo from '../../public/images/logo.png';
import Image from 'next/image';
import AdminButton from '../Adminbutton/adminPanel';

const Sidebar = () => {
    const [userRole, setUserRole] = useState(null);
    const [permissions, setPermissions] = useState({
        canViewDashboard: false,
        canViewOrders: false,
        canManageOrders: false,
        canViewProducts: false,
        canManageProducts: false,
        canViewCustomers: false,
        canManageCustomers: false,
        canViewCategories: false,
        canManageCategories: false,
    });

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                const user = data.user;
                setUserRole(user?.role);
                if (user?.role === 'manager') {
                    setPermissions({
                        canViewDashboard: user.canViewDashboard || false,
                        canViewOrders: user.canViewOrders || false,
                        canManageOrders: user.canManageOrders || false,
                        canViewProducts: user.canViewProducts || false,
                        canManageProducts: user.canManageProducts || false,
                        canViewCustomers: user.canViewCustomers || false,
                        canManageCustomers: user.canManageCustomers || false,
                        canViewCategories: user.canViewCategories || false,
                        canManageCategories: user.canManageCategories || false,
                    });
                } else {
                    // Для админа все права true
                    setPermissions({
                        canViewDashboard: true,
                        canViewOrders: true,
                        canManageOrders: true,
                        canViewProducts: true,
                        canManageProducts: true,
                        canViewCustomers: true,
                        canManageCustomers: true,
                        canViewCategories: true,
                        canManageCategories: true,
                    });
                }
            });
    }, []);

    // Если админ - показываем все кнопки
    if (userRole === 'admin') {
        return (
            <div className={styles.sidebar}>
                <div className={styles.header}>
                    <div className={styles.image}>
                        <Image className={styles.img} src={Logo} alt='logo' width={110} height={130} />
                    </div>
                    <div className={styles.title}>
                        <p>Arm Food</p>
                        <p>City</p>
                    </div>
                </div>
                <div className={styles.buttons}>
                    <AdminButton title='Обзор' href='/profile/admin/dashboard' />
                    <AdminButton title='Категории' href='/profile/admin/categories' />
                    <AdminButton title='Товары' href='/profile/admin/products' />
                    <AdminButton title='Клиенты' href='/profile/admin/clients' />
                    <AdminButton title='Заказы' href='/profile/admin/orders' />
                    <AdminButton title='Менеджеры' href='/profile/admin/managers' />
                </div>
            </div>
        );
    }

    // Если менеджер - показываем только разрешённые кнопки
    return (
        <div className={styles.sidebar}>
            <div className={styles.header}>
                <div className={styles.image}>
                    <Image className={styles.img} src={Logo} alt='logo' width={110} height={130} />
                </div>
                <div className={styles.title}>
                    <p>Arm Food</p>
                    <p>City</p>
                </div>
            </div>
            <div className={styles.buttons}>
                {permissions.canViewDashboard && <AdminButton title='Обзор' href='/profile/admin/dashboard' />}
                {permissions.canViewOrders && <AdminButton title='Заказы' href='/profile/admin/orders' />}
                {permissions.canViewProducts && <AdminButton title='Товары' href='/profile/admin/products' />}
                {permissions.canViewCategories && <AdminButton title='Категории' href='/profile/admin/categories' />}
            </div>
        </div>
    );
};

export default Sidebar;