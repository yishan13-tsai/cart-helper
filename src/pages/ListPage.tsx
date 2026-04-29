import { TIcon } from '../components/TIcon';

/**
 * Pre-trip shopping list — placeholder for v1. Planned: user lists items
 * before going to store; scanned items auto-tick the list. Powered by chat v2
 * to parse free-form pasted lists into structured items.
 */
export function ListPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-bg px-8 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface text-page">
        <TIcon name="list" size={36} strokeWidth={1.6} />
      </div>
      <h2 className="text-xl font-bold text-ink">
        {/* TODO i18n */}購物清單
      </h2>
      <p className="mt-2 max-w-xs text-sm text-ink-60">
        {/* TODO i18n */}
        即將推出 — 出門前先列要買的，掃到自動勾掉。
      </p>
    </div>
  );
}
