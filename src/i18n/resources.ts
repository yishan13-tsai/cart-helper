import zhTWCommon from '../locales/zh-TW/common.json';
import enCommon from '../locales/en/common.json';
import koCommon from '../locales/ko/common.json';
import jaCommon from '../locales/ja/common.json';

export const SUPPORTED_LOCALES = ['zh-TW', 'en', 'ko', 'ja'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'zh-TW';

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  'zh-TW': '繁體中文',
  en: 'English',
  ko: '한국어',
  ja: '日本語',
};

export const resources = {
  'zh-TW': { common: zhTWCommon },
  en: { common: enCommon },
  ko: { common: koCommon },
  ja: { common: jaCommon },
} as const;

export const defaultNS = 'common';
