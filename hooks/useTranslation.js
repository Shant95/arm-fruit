/* eslint-disable react-hooks/set-state-in-effect */

'use client';

import { useState, useEffect } from 'react';
import { t, getCurrentLanguage } from '@/lib/i18n';

export function useTranslation() {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState('ru');

  useEffect(() => {
    setLang(getCurrentLanguage());
    setMounted(true);
  }, []);

  const translate = (key) => {
    // На сервере возвращаем ключ (будет показан как есть)
    if (!mounted) {
      return key;
    }
    // На клиенте используем перевод из i18n
    return t(key);
  };

  return { t: translate, lang, mounted };
}