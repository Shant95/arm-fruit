'use client';

import { useState } from 'react';
import styles from './style.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';

export default function ForgotPassword() {
  const router = useRouter();
  const { t } = useTranslation();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(t('code_sent'));
        setStep('code');
      } else {
        setError(data.error || t('error'));
      }
    } catch {
      setError(t('connection_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError(t('passwords_not_match'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('password_min_length'));
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(t('password_changed'));
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(data.error || t('error'));
      }
    } catch {
      setError(t('connection_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.forgotPassword}>
      <div className={styles.form}>
        <h2>{t('forgot_password')}</h2>

        {step === 'email' && (
          <form onSubmit={handleSendCode}>
            <p>{t('forgot_instruction')}</p>
            <label className={styles.email}>{t('email')}</label>
            <div className={styles.input}>
              <input
                type="email"
                className={styles.emailInput}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {message && <div className={styles.successMessage}>{message}</div>}
            {error && <div className={styles.errorMessage}>{error}</div>}
            <div className={styles.cloudFlare}></div>
            <button type="submit" className={styles.send} disabled={loading}>
              {loading ? t('sending') : t('send_code')}
            </button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleResetPassword}>
            <p>{t('enter_code_and_password')}</p>
            
            <label className={styles.email}>{t('code_from_email')}</label>
            <div className={styles.input}>
              <input
                type="text"
                className={styles.emailInput}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            <label className={styles.email}>{t('new_password')} ({t('min_6_chars')})</label>
            <div className={styles.input}>
              <input
                type="password"
                className={styles.emailInput}
                placeholder={t('new_password')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <label className={styles.email}>{t('confirm_password')}</label>
            <div className={styles.input}>
              <input
                type="password"
                className={styles.emailInput}
                placeholder={t('repeat_password')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {message && <div className={styles.successMessage}>{message}</div>}
            {error && <div className={styles.errorMessage}>{error}</div>}
            <div className={styles.cloudFlare}></div>
            <button type="submit" className={styles.send} disabled={loading}>
              {loading ? t('saving') : t('change_password')}
            </button>
          </form>
        )}

        <div className={styles.buttons}>
          <Link className={styles.back} href="/login/">{t('back_to_login')}</Link>
          <Link className={styles.register} href="/register/">{t('register')}</Link>
        </div>
        <p>{t('forgot_note')}</p>
      </div>
    </div>
  );
}