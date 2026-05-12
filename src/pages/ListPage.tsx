import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TIcon } from '../components/TIcon';
import { useListStore } from '../store/list';
import { useCartStore } from '../store/cart';

export function ListPage() {
  const { t } = useTranslation();
  const { items, addItem, toggleItem, removeItem, checkByName, clearChecked } = useListStore();
  const cartItems = useCartStore((s) => s.items);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-tick list items when cart items are added
  useEffect(() => {
    for (const ci of cartItems) {
      checkByName(ci.name);
    }
  // We only want to run this when cartItems changes, not on every checkByName reference change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

  function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed) return;
    addItem(trimmed);
    setInput('');
    inputRef.current?.focus();
  }

  const checkedCount = items.filter((i) => i.checked).length;
  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);

  return (
    <div className="flex h-full flex-col bg-bg text-ink">
      {/* Header */}
      <div className="shrink-0 px-5 pb-2 pt-5">
        <h1 className="text-2xl font-bold tracking-tight">{t('list.title')}</h1>
        <p className="mt-0.5 text-sm text-ink-60">{t('list.subtitle')}</p>
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 pb-3 pt-1">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={t('list.add.placeholder')}
            className="flex-1 rounded-xl border border-ink-10 bg-white px-3.5 py-2.5 text-sm font-medium text-ink placeholder:text-ink-30 focus:border-page/40 focus:outline-none focus:ring-2 focus:ring-page/20"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!input.trim()}
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-page text-white shadow-sm disabled:opacity-40 active:scale-95"
          >
            <TIcon name="plus" size={20} strokeWidth={2.2} />
          </button>
        </div>
      </div>

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
            {/* Unchecked items first */}
            {unchecked.map((item) => (
              <ItemRow
                key={item.id}
                name={item.name}
                checked={false}
                onToggle={() => toggleItem(item.id)}
                onRemove={() => removeItem(item.id)}
              />
            ))}

            {/* Divider when both groups exist */}
            {unchecked.length > 0 && checked.length > 0 && (
              <div className="my-1 border-t border-ink-10" />
            )}

            {/* Checked items */}
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
