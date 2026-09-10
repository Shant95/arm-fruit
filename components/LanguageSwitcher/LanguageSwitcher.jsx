/* eslint-disable react-hooks/set-state-in-effect */

'use client';

import { useState, useEffect } from 'react';
import { setLanguage } from '@/lib/i18n';
import styles from './LanguageSwitcher.module.css';

export default function LanguageSwitcher() {
  const [lang, setLang] = useState('ru');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'ru' || saved === 'am') {
      setLang(saved);
    }
    setMounted(true);
  }, []);

  const switchLanguage = (newLang) => {
    setLanguage(newLang);
    setLang(newLang);
    localStorage.setItem('language', newLang);
    window.location.reload();
  };

  if (!mounted) {
    return (
      <div className={styles.switcher}>
        <button className={styles.langBtn}>🇷🇺 RU</button>
        <button className={styles.langBtn}>🇦🇲 AM</button>
      </div>
    );
  }

  return (
    <div className={styles.switcher}>
      <button
        className={`${styles.langBtn} ${lang === 'ru' ? styles.active : ''}`}
        onClick={() => switchLanguage('ru')}
      >
        🇷🇺 RU
      </button>
      <button
        className={`${styles.langBtn} ${lang === 'am' ? styles.active : ''}`}
        onClick={() => switchLanguage('am')}
      >
        🇦🇲 AM
      </button>
    </div>
  );
}