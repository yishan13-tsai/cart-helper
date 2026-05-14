import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TIcon } from '../components/TIcon';
import { useListStore } from '../store/list';
import { useCartStore } from '../store/cart';
import { parseListText, type ParsedListItem } from '../lib/vaultsage/prompts/list';

export function ListPage() {
  const { t, i18n } = useTranslation();
  const { items, addItem, toggleItem, removeItem, checkByName, clearChecked } = useListStore();
  const cartItems = useCartStore((s) => s.items);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // AI panel state
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<ParsedListItem[] | null>(null);
  const [aiError, setAiError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  // Auto-tick list items when cart items are added
  useEffect(() => {
    for (const ci of cartItems) {
      checkByName(ci.name);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

  function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed) return;
    addItem(trimmed);
    setInput('');
    inputRef.current?.focus();
  }

  async function handleAiParse() {
    const text = aiText.trim();
    if (!text) return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setAiLoading(true);
    setAiError('');
    setAiResults(null);
    try {
      const parsed = await parseListText(text, i18n.language, abortRef.current.signal);
      if (parsed.length === 0) {
        setAiError(t('list.ai.empty'));
      } else {
        setAiResults(parsed);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setAiError(t('list.ai.error'));
    } finally {
      setAiLoading(false);
    }
  }

  function handleAddAll() {
    if (!aiResults) return;
    for (const item of aiResults) {
      for (let i = 0; i < (item.quantity ?? 1); i++) {
        addItem(item.name);
      }
    }
    setAiResults(null);
    setAiText('');
    setShowAiPanel(false);
  }

  function handleAiCancel() {
    abortRef.current?.abort();
    setAiResults(null);
    setAiError('');
    setAiText('');
    setShowAiPanel(false);
  }

  const checkedCount = items.filter((i) => i.checked).length;
  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);

  return (
    <div className="flex h-full flex-col overflow-x-hidden bg-bg text-ink">
      {/* Header */}
      <div className="shrink-0 px-5 pb-2 pt-5">
        <h1 className="text-2xl font-bold tracking-tight">{t('list.title')}</h1>
        <p className="mt-0.5 text-sm text-ink-60">{t('list.subtitle')}</p>
      </div>

      {/* Input row */}
      <div className="shrink-0 px-4 pb-3 pt-1">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={t('list.add.placeholder')}
            className="min-w-0 flex-1 rounded-xl border border-ink-10 bg-white px-3.5 py-2.5 text-sm font-medium text-ink placeholder:text-ink-30 focus:border-page/40 focus:outline-none focus:ring-2 focus:ring-page/20"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!input.trim()}
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-page text-white shadow-sm disabled:opacity-40 active:scale-95"
          >
            <TIcon name="plus" size={20} strokeWidth={2.2} />
          </button>
          {/* AI parse toggle */}
          <button
            type="button"
            onClick={() => setShowAiPanel((v) => !v)}
            className={`flex h-[42px] shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold shadow-sm transition-colors active:scale-95 ${
              showAiPanel
                ? 'bg-page text-white'
                : 'border border-page bg-white text-page'
            }`}
          >
            <TIcon name="sparkle" size={15} strokeWidth={2} />
            {t('list.ai.toggle')}
          </button>
        </div>
      </div>

      {/* AI Panel */}
      {showAiPanel && (
        <div className="shrink-0 mx-4 mb-3 min-w-0 rounded-2xl border border-page/20 bg-white p-3.5 shadow-sm">
          <textarea
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            placeholder={t('list.ai.placeholder')}
            rows={3}
            className="w-full resize-none rounded-xl border border-ink-10 bg-bg px-3 py-2.5 text-sm font-medium text-ink placeholder:text-ink-30 focus:border-page/40 focus:outline-none focus:ring-2 focus:ring-page/20"
          />

          {/* Error */}
          {aiError && (
            <p className="mt-2 text-xs text-alert">{aiError}</p>
          )}

          {/* Parsed results confirmation */}
          {aiResults && aiResults.length > 0 && (
            <div className="mt-2.5 flex flex-col gap-1">
              <p className="text-xs font-semibold text-ink-60">
                {t('list.ai.confirm', { n: aiResults.length })}
              </p>
              <div className="flex flex-col gap-0.5">
                {aiResults.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-surface px-3 py-2"
                  >
                    <span className="text-sm font-medium text-ink">{item.name}</span>
                    {item.quantity > 1 && (
                      <span className="text-xs text-ink-60">×{item.quantity}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-3 flex gap-2">
            {aiResults ? (
              <>
                <button
                  type="button"
                  onClick={handleAiCancel}
                  className="flex-1 rounded-xl border border-ink-10 py-2.5 text-sm font-semibold text-ink-60 active:bg-ink-10/40"
                >
                  {t('list.ai.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleAddAll}
                  className="flex-1 rounded-xl bg-page py-2.5 text-sm font-semibold text-white shadow-sm active:scale-95"
                >
                  {t('list.ai.addAll')}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleAiParse}
                disabled={!aiText.trim() || aiLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-page py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-40 active:scale-95"
              >
                {aiLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {t('list.ai.parsing')}
                  </>
                ) : (
                  <>
                    <TIcon name="sparkle" size={15} strokeWidth={2} />
                    {t('list.ai.parse')}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-32">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-page">
              <TIcon name="list" size={28} strokeWidth={1.6} />
            </div>
            <p className="text-sm text-ink-60">{t('list.empty.subtitle')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {unchecked.map((item) => (
              <ItemRow
                key={item.id}
                name={item.name}
                checked={false}
                onToggle={() => toggleItem(item.id)}
                onRemove={() => removeItem(item.id)}
              />
            ))}

            {unchecked.length > 0 && checked.length > 0 && (
              <div className="my-1 border-t border-ink-10" />
            )}

            {checked.map((item) => (
              <ItemRow
                key={item.id}
                name={item.name}
                checked
                onToggle={() => toggleItem(item.id)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Clear checked footer */}
      {checkedCount > 0 && (
        <div className="shrink-0 px-4 pb-6 pt-2">
          <button
            type="button"
            onClick={clearChecked}
            className="w-full rounded-2xl border border-ink-10 bg-white py-3 text-sm font-semibold text-ink-60 active:bg-ink-10/40"
          >
            {t('list.clearDone', { n: checkedCount })}
          </button>
        </div>
      )}
    </div>
  );
}

function ItemRow({
  name,
  checked,
  onToggle,
  onRemove,
}: {
  name: string;
  checked: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3">
      <button
        type="button"
        onClick={onToggle}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          checked
            ? 'border-page bg-page text-white'
            : 'border-ink-30 bg-transparent text-transparent'
        }`}
        aria-label={checked ? 'uncheck' : 'check'}
      >
        <TIcon name="check" size={13} strokeWidth={2.8} />
      </button>
      <span
        className={`flex-1 text-sm font-medium transition-colors ${
          checked ? 'text-ink-60 line-through decoration-ink-60' : 'text-ink'
        }`}
      >
        {name}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-30 active:bg-ink-10/40 active:text-alert"
        aria-label="remove"
      >
        <TIcon name="x" size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
