// Backward-compat shim around i18next so legacy call sites that
// import { t, currencySymbol } keep working until they migrate to
// useTranslation(). New code should prefer useTranslation('common').

import i18n from './index';

export function t(key: string, params?: Record<string, string | number>): string {
  // Cast intentional: we expose a string-keyed signature so existing
  // call sites built before resource typings landed keep compiling.
  const translate = i18n.t as unknown as (
    key: string,
    options?: Record<string, unknown>,
  ) => string;
  return translate(key, params);
}

export function currencySymbol(code: string): string {
  return t(`common.currency.${code}`);
}
