import AdminLoginForm from '../../../../components/AdminLoginForm/adminLoginForm';
import styles from './style.module.css';

export const metadata = {
    title: "Вход в админ-панель | Armfruit",
    description: "Вход в панель управления интернет-магазина Armfruit",
    robots: "noindex, nofollow",
};

export default function AdminLogin() {
    return (
        <div className={styles.adminLogin}>
            <div className={styles.container}>
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>🛒</span>
                    <h1>ARM FOOD CITY</h1>
                    <p>Админ-панель</p>
                </div>
                <div className={styles.form}>
                    <AdminLoginForm />
                </div>
            </div>
        </div>
    );
}