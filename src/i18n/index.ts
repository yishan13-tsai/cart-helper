import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  defaultNS,
  resources,
} from './resources';

export const LOCALE_STORAGE_KEY = 'app.locale';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    load: 'currentOnly',
    defaultNS,
    ns: [defaultNS],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LOCALE_STORAGE_KEY,
      caches: ['localStorage'],
    },
    returnNull: false,
  });

if (import.meta.env.DEV) {
  (window as unknown as { __i18n: typeof i18n }).__i18n = i18n;
}

export default i18n;
