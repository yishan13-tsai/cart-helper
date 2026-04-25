import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CartItem, Currency } from '../types';

interface Props {
  open: boolean;
  items: CartItem[];
  currency: Currency;
  onCancel: () => void;
  onConfirm: (items: CartItem[]) => void;
}

const LOW_CONFIDENCE = 0.7;

export function OcrConfirmModal({
  open,
  items,
  currency,
  onCancel,
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<CartItem[]>(items);

  useEffect(() => {
    setDraft(items);
  }, [items, open]);

  if (!open) return null;

  function patch(idx: number, change: Partial<CartItem>) {
    setDraft((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, ...change } : item)),
    );
  }

  function remove(idx: number) {
    setDraft((prev) => prev.filter((_, i) => i !== idx));
  }

  const total = draft.reduce(
    (sum, item) => sum + (item.unitPrice ?? 0) * item.quantity,
    0,
  );
  const symbol = t(`common.currency.${currency}`);

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-neutral-900/60"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-t-2xl bg-neutral-0 shadow-2xl">
        <header className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
          <h2 className="text-base font-bold text-secondary-500">
            {t('ocr.confirm.title', { count: draft.length })}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-neutral-700"
          >
            {t('ocr.confirm.cancel')}
          </button>
        </header>

        <div className="flex-1 overflow-auto px-4 py-2">
          {draft.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-700">
              {t('ocr.confirm.empty')}
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {draft.map((item, idx) => {
                const lowConf =
                  item.confidence != null && item.confidence < LOW_CONFIDENCE;
                return (
                  <li key={idx} className="flex flex-col gap-2 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        className="flex-1 rounded-md border border-neutral-100 bg-neutral-100 px-2 py-1 text-sm"
                        value={item.name}
                        aria-label={t('ocr.confirm.name')}
                        onChange={(e) => patch(idx, { name: e.target.value })}
                      />
                      <button
                        type="button"
                        aria-label="remove"
                        className="text-sm text-danger-500"
                        onClick={() => remove(idx)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-700">
                      <label className="flex flex-1 items-center gap-1">
                        {symbol}
                        <input
                          type="number"
                          inputMode="decimal"
                          className="w-full rounded-md border border-neutral-100 bg-neutral-100 px-2 py-1 font-mono text-sm"
                          value={item.unitPrice ?? ''}
                          aria-label={t('ocr.confirm.unitPrice')}
                          onChange={(e) => {
                            const v = e.target.value;
                            patch(idx, {
                              unitPrice: v === '' ? null : Number(v),
                            });
                          }}
                        />
                      </label>
                      <label className="flex w-24 items-center gap-1">
                        ×
                        <input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          className="w-full rounded-md border border-neutral-100 bg-neutral-100 px-2 py-1 font-mono text-sm"
                          value={item.quantity}
                          aria-label={t('ocr.confirm.quantity')}
                          onChange={(e) =>
                            patch(idx, {
                              quantity: Math.max(1, Number(e.target.value) || 1),
                            })
                          }
                        />
                      </label>
                    </div>
                    {lowConf && (
                      <p className="text-2xs text-warning-500">
                        ⚠ {t('ocr.confirm.lowConfidence')}
                      </p>
                    )}
                    {item.unitPrice == null && (
                      <p className="text-2xs text-warning-500">
                        ⚠ {t('ocr.confirm.unknownPrice')}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="border-t border-neutral-100 px-4 py-3">
          <button
            type="button"
            disabled={draft.length === 0}
            onClick={() => onConfirm(draft)}
            className="flex w-full items-center justify-between rounded-xl bg-primary-500 px-4 py-3 text-neutral-0 disabled:opacity-40"
          >
            <span className="text-sm font-bold">{t('ocr.confirm.add')}</span>
            <span className="font-mono text-base">
              {symbol} {total.toLocaleString()}
            </span>
          </button>
        </footer>
      </div>
    </div>
  );
}
