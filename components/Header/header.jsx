"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styles from './style.module.css';
import Logo from '../Logo/logo';
import NavButton from '../NavButton/NavButton';
import SearchBar from '../SearchBar/searchbar';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';

const Header = () => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState('');
  const [toastTitle, setToastTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Загрузка пользователя
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        
        // Проверка на успешный ответ
        if (!res.ok) {
          console.log('API вернул ошибку:', res.status);
          setUser(null);
          return;
        }
        
        // Проверка, что ответ - JSON
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.log('Ответ не JSON, пропускаем');
          setUser(null);
          return;
        }
        
        const data = await res.json();
        setUser(data.user || null);
      } catch (error) {
        console.error('Ошибка загрузки пользователя:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [pathname]);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCartCount(count);
    };

    updateCartCount();

    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('storage', updateCartCount);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  // Функция для показа уведомления с переводами
  const showAddToCartNotification = (productName, title, message) => {
    setLastAddedProduct(productName);
    setToastTitle(title || t('product_added'));
    setToastMessage(message ? `${productName} ${message}` : `${productName} ${t('to_cart')}`);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Добавляем глобальную функцию для вызова из других компонентов
  useEffect(() => {
    window.showAddToCartNotification = showAddToCartNotification;
    return () => {
      delete window.showAddToCartNotification;
    };
  }, [t]);

  // Закрыть меню при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest(`.${styles.mobileMenu}`) && !event.target.closest(`.${styles.menuBtn}`)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Блокируем скролл при открытом меню
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  // Закрытие меню
  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (pathname?.includes('/profile/admin') || pathname?.includes('/profile/manager')) {
    return null;
  }

  return (
    <>
      <div className={styles.header}>
        <div className={styles.container}>
          <Logo />
          <div className={styles.bloks}>
            <div className={styles.blok}>
              <div className={styles.numbers}>
                <p>+79169487314</p>
              </div>
              <div className={styles.buttonsWrapper}>
                <div className={styles.cartWrapper}>
                  <NavButton text={t('cart')} href='/cart' />
                  {cartCount > 0 && (
                    <span className={styles.cartBadge}>{cartCount}</span>
                  )}
                </div>
                {!loading && user ? (
                  <NavButton text={t('profile')} href='/profile/user' />
                ) : (
                  <NavButton text={t('login')} href='/login' />
                )}
              </div>
              <div className={styles.menuBtn} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <div className={styles.div}></div>
                <div className={styles.div}></div>
                <div className={styles.div}></div>
              </div>
            </div>
            <div className={styles.blok}>
              <div className={styles.searchWrapper}>
                <SearchBar />
              </div>
            </div>
            <div className={styles.blok}>
              <NavButton text={t('main')} href='/' />
              <NavButton text={t('catalog')} href='/catalog' />
              <NavButton text={t('about')} href='/about' />
              <NavButton text={t('contacts')} href='/contacts' />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu} onClick={closeMenu}>
          <div className={styles.mobileMenuContent}>
            <div className={styles.head}>
              <h2>Меню</h2>
              <div className={styles.close} onClick={closeMenu}>✕</div>
            </div>
            <NavButton text={t('main')} href='/' onClick={closeMenu} />
            <NavButton text={t('catalog')} href='/catalog' onClick={closeMenu} />
            <NavButton text={t('about')} href='/about' onClick={closeMenu} />
            <NavButton text={t('contacts')} href='/contacts' onClick={closeMenu} />
            <LanguageSwitcher />
            <hr className={styles.mobileMenuDivider} />
            {!loading && user ? (
              <NavButton text={t('profile')} href='/profile/user' onClick={closeMenu} />
            ) : (
              <NavButton text={t('login')} href='/login' onClick={closeMenu} />
            )}
            <NavButton text={t('cart')} href='/cart' onClick={closeMenu} />
          </div>
        </div>
      )}

      {/* Toast уведомление */}
      {showToast && (
        <div className={styles.toast}>
          <div className={styles.toastContent}>
            <span className={styles.toastIcon}>✅</span>
            <div>
              <p className={styles.toastTitle}>{toastTitle}</p>
              <p className={styles.toastMessage}>{toastMessage}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;