'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './style.module.css';

const RegisterForm = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    lastName: '',
    name: '',
    patronymic: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeChecked, setAgreeChecked] = useState(false); // 👈 НОВОЕ состояние

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async () => {
    // Валидация
    if (!formData.email || !formData.password || !formData.name) {
      setError(t('fill_required_fields'));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t('passwords_not_match'));
      return;
    }
    if (formData.password.length < 6) {
      setError(t('password_min_length'));
      return;
    }
    if (!formData.phone) {
      setError(t('phone_required'));
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // 1. Регистрация
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          lastName: formData.lastName,
          phone: formData.phone
        })
      });

      const regData = await regRes.json();

      if (!regRes.ok) {
        setError(regData.error || t('registration_error'));
        setLoading(false);
        return;
      }

      // 2. Автоматический вход после регистрации
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (!loginRes.ok) {
        setError(t('account_created_login_error'));
        router.push('/login');
        return;
      }

      // 3. Успешный вход – перенаправляем
      router.push('/');
      router.refresh();

    } catch (err) {
      setError(t('connection_error'));
    } finally {
      setLoading(false);
    }
  };

  // 👈 Проверка, можно ли нажать кнопку
  const isFormValid = () => {
    return (
      formData.email.trim() !== '' &&
      formData.password.trim() !== '' &&
      formData.name.trim() !== '' &&
      formData.phone.trim() !== '' &&
      formData.password === formData.confirmPassword &&
      formData.password.length >= 6 &&
      agreeChecked === true
    );
  };

  return (
    <div className={styles.registerForm}>
      <div className={styles.inputs}>
        <div className={styles.bloks}>
          <div className={styles.blok}>
            <label>{t('last_name')}</label>
            <input 
              placeholder={t('last_name')} 
              name="lastName" 
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          <div className={styles.blok}>
            <label>{t('name')} *</label>
            <input 
              placeholder={t('name')} 
              name="name" 
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.blok}>
            <label>{t('patronymic')}</label>
            <input 
              placeholder={t('patronymic')} 
              name="patronymic" 
              value={formData.patronymic}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className={styles.bloks}>
          <div className={styles.blok}>
            <label>{t('email')} *</label>
            <input 
              placeholder='example@mail.ru' 
              name="email" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.blok}>
            <label>{t('phone')} *</label>
            <input 
              placeholder='+7...' 
              name="phone" 
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className={styles.bloks}>
          <div className={styles.blok}>
            <label>{t('password')} *</label>
            <div className={styles.passwordWrapper}>
              <input 
                placeholder={t('password')} 
                type={showPassword ? 'text' : 'password'} 
                name="password" 
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  {showPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
          <div className={styles.blok}>
            <label>{t('confirm_password')} *</label>
            <div className={styles.passwordWrapper}>
              <input 
                placeholder={t('confirm_password')} 
                type={showConfirmPassword ? 'text' : 'password'} 
                name="confirmPassword" 
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  {showConfirmPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && <div style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{error}</div>}

      <div className={styles.conditions}>
        <input 
          type='checkbox' 
          checked={agreeChecked}
          onChange={(e) => setAgreeChecked(e.target.checked)}
          required 
        />
        <p>{t('agree_terms')}</p>
        <Link href='/terms-and-conditions' className={styles.conditionsbt}>{t('terms_link')}</Link>
        <p>{t('and_processing')}</p>
      </div>

      <div className={styles.cloudFlare}></div>
      
      <button 
        className={`${styles.create} ${!isFormValid() ? styles.createDisabled : ''}`}
        onClick={handleSubmit} 
        disabled={!isFormValid() || loading}
      >
        {loading ? t('loading') : t('register')}
      </button>

      <div className={styles.have}>
        <p>{t('no_account')}</p>
        <Link href='/login' className={styles.loginpage}>{t('login_title')}</Link>
      </div>
    </div>
  );
};

export default RegisterForm;