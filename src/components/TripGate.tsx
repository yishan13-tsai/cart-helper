import { useState } from 'react';
import { useCartStore } from '../store/cart';
import { Btn } from './Btn';
import { BagIllus } from './illustrations';

/**
 * Pre-trip gate. Renders an illustrated "start shopping" prompt with an
 * optional store-name field. When the user confirms, calls `startTrip(store)`
 * and invokes `onStarted` so the parent can swap to the actual scan UI.
 *
 * Used by CameraPage so a user without an active trip is forced to open one
 * before any photo is taken — keeps history records clean.
 */
export function TripGate({ onStarted }: { onStarted: () => void }) {
  const startTrip = useCartStore((s) => s.startTrip);
  const [storeName, setStoreName] = useState('');

  const handleStart = () => {
    startTrip(storeName);
    onStarted();
  };

  return (
    <div className="flex h-full flex-col bg-bg px-5 pt-12 pb-32">
      <div className="flex items-center justify-center pb-3">
        <span className="text-[11px] font-bold uppercase tracking-[4px] text-ink-60">
          CART HELPER
        </span>
      </div>

      <div className="mx-1 flex flex-1 flex-col items-center justify-center rounded-[28px] bg-surface px-5 py-10">
        <BagIllus size={180} />
        <p className="mt-4 text-center text-2xl font-bold leading-tight text-ink">
          {/* TODO i18n */}
          準備出發？<br />
          按下開始記錄這次購物
        </p>
        <input
          type="text"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="店家（選填）" /* TODO i18n */
          className="mt-5 w-full rounded-full border border-ink/10 bg-white px-5 py-3 text-center text-sm font-medium text-ink placeholder:text-ink-30 focus:border-page focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleStart();
          }}
        />
        <div className="mt-3 w-full">
          <Btn icon="cart" onClick={handleStart}>
            {/* TODO i18n */}開始購物
          </Btn>
        </div>
      </div>
    </div>
  );
}
