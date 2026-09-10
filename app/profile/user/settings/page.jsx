'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './style.module.css';

export default function UserSettings() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  
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
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        
        if (!data.user) {
          router.push('/login');
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
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [router]);

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

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/user/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setUser({ ...user, ...formData });
        setMessage({ type: 'success', text: t('data_updated') });
        setIsEditing(false);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || t('update_error') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('server_error') });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: t('passwords_not_match') });
      setSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: t('password_min_length') });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/user/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: t('password_changed') });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsChangingPassword(false);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || t('password_change_error') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('server_error') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>{t('loading')}</div>;
  }

  return (
    <div className={styles.settingsPage}>
      <div className={styles.header}>
        <h1>{t('profile_settings')}</h1>
        <Link href="/profile/user" className={styles.backLink}>← {t('back_to_profile')}</Link>
      </div>

      <div className={styles.container}>
        {/* Личные данные */}
        <div className={styles.card}>
          <h2>{t('personal_data')}</h2>
          <form onSubmit={handleSubmitProfile}>
            <div className={styles.formGroup}>
              <label>{t('name')} *</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('your_name')}
                  required
                />
              ) : (
                <p className={styles.value}>{user?.name || t('not_specified')}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>{t('last_name')}</label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder={t('your_last_name')}
                />
              ) : (
                <p className={styles.value}>{user?.lastName || t('not_specified')}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>{t('email')}</label>
              <p className={styles.value}>{user?.email}</p>
            </div>

            <div className={styles.formGroup}>
              <label>{t('phone')}</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+7 (999) 123-45-67"
                />
              ) : (
                <p className={styles.value}>{user?.phone || t('not_specified')}</p>
              )}
            </div>

            {message && (
              <div className={`${styles.message} ${styles[message.type]}`}>
                {message.text}
              </div>
            )}

            <div className={styles.buttonGroup}>
              {!isEditing && !isChangingPassword && (
                <button type="button" className={styles.editBtn} onClick={() => setIsEditing(true)}>
                  {t('edit')}
                </button>
              )}
              {!isEditing && !isChangingPassword && (
                <button type="button" className={styles.changePasswordBtn} onClick={() => setIsChangingPassword(true)}>
                  {t('change_password')}
                </button>
              )}
              {isEditing && (
                <>
                  <button type="submit" className={styles.saveBtn} disabled={saving}>
                    {saving ? t('saving') : t('save')}
                  </button>
                  <button type="button" className={styles.cancelBtn} onClick={() => setIsEditing(false)}>
                    {t('cancel')}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* Смена пароля */}
        {isChangingPassword && (
          <div className={styles.card}>
            <h2>{t('change_password')}</h2>
            <form onSubmit={handleSubmitPassword}>
              <div className={styles.formGroup}>
                <label>{t('current_password')} *</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder={t('enter_current_password')}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>{t('new_password')} *</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder={t('min_6_chars')}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>{t('confirm_password')} *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder={t('repeat_password')}
                  required
                />
              </div>

              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? t('saving') : t('change_password')}
                </button>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsChangingPassword(false)}>
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}