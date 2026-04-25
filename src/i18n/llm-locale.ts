import i18n from './index';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from './resources';

export interface LlmLocaleHint {
  code: SupportedLocale;
  name: string;
  currency: string;
}

const LOCALE_NAME: Record<SupportedLocale, string> = {
  'zh-TW': 'Traditional Chinese (zh-TW)',
  en: 'English (en)',
  ko: 'Korean (ko)',
  ja: 'Japanese (ja)',
};

const LOCALE_CURRENCY: Record<SupportedLocale, string> = {
  'zh-TW': 'TWD',
  en: 'USD',
  ko: 'KRW',
  ja: 'JPY',
};

function normalize(raw: string | undefined): SupportedLocale {
  if (!raw) return DEFAULT_LOCALE;
  if ((SUPPORTED_LOCALES as readonly string[]).includes(raw)) {
    return raw as SupportedLocale;
  }
  const base = raw.split('-')[0]?.toLowerCase();
  if (base === 'zh') return 'zh-TW';
  if (base === 'en') return 'en';
  if (base === 'ko') return 'ko';
  if (base === 'ja') return 'ja';
  return DEFAULT_LOCALE;
}

export function getLocaleForLLM(): LlmLocaleHint {
  const code = normalize(i18n.resolvedLanguage ?? i18n.language);
  return {
    code,
    name: LOCALE_NAME[code],
    currency: LOCALE_CURRENCY[code],
  };
}

export function defaultCurrencyFor(locale: SupportedLocale): string {
  return LOCALE_CURRENCY[locale];
}
