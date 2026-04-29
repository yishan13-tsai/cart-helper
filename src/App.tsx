import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EnvBanner } from './components/EnvBanner';
import { TIcon, type TIconName } from './components/TIcon';
import { useCartStore } from './store/cart';

// 5-tab nav with the middle slot reserved for an elevated SCAN action button.
// The middle is a *button*, not a link to a page — it triggers the scan flow.
type SideTab = {
  to: string;
  labelKey: 'nav.history' | 'nav.list' | 'nav.cart' | 'nav.settings';
  icon: TIconName;
};

const LEFT_TABS: ReadonlyArray<SideTab> = [
  { to: '/history', labelKey: 'nav.history', icon: 'history' },
  { to: '/list', labelKey: 'nav.list', icon: 'list' },
];
const RIGHT_TABS: ReadonlyArray<SideTab> = [
  { to: '/cart', labelKey: 'nav.cart', icon: 'cart' },
  { to: '/settings', labelKey: 'nav.settings', icon: 'gear' },
];

export function App() {
  const { pathname } = useLocation();
  const tripActive = useCartStore((s) => s.startedAt > 0 || s.items.length > 0);
  // Hide nav only when the camera UI is actually live. The TripGate uses /scan
  // too but should keep the nav so users aren't trapped.
  const isFullscreen =
    (pathname === '/scan' && tripActive) || pathname.startsWith('/receipt/');
  return (
    <div className="flex h-full flex-col">
      <EnvBanner />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      {!isFullscreen && <BottomNav />}
    </div>
  );
}

function BottomNav() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <nav className="relative shrink-0 bg-white/95 backdrop-blur shadow-nav">
      {/* Notch carve-out for the elevated middle button */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
        <button
          type="button"
          onClick={() => navigate('/scan')}
          aria-label={/* TODO i18n */ '掃描'}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-page text-white shadow-cta ring-4 ring-bg active:scale-95"
        >
          <TIcon name="scan" size={28} strokeWidth={2.2} />
        </button>
      </div>

      <ul className="flex items-stretch">
        {LEFT_TABS.map((tab) => (
          <NavTab key={tab.to} tab={tab} pathname={pathname} t={t} />
        ))}
        {/* spacer for the elevated button */}
        <li className="flex-1" aria-hidden />
        {RIGHT_TABS.map((tab) => (
          <NavTab key={tab.to} tab={tab} pathname={pathname} t={t} />
        ))}
      </ul>
    </nav>
  );
}

function NavTab({
  tab,
  pathname,
  t,
}: {
  tab: SideTab;
  pathname: string;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const active = pathname === tab.to;
  return (
    <li className="flex-1">
      <Link
        to={tab.to}
        className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] transition ${
          active ? 'text-page font-bold' : 'text-ink-30'
        }`}
      >
        <TIcon name={tab.icon} size={20} strokeWidth={active ? 2.2 : 1.8} />
        <span>{t(tab.labelKey)}</span>
        {active && (
          <span className="absolute top-0 h-0.5 w-8 rounded-b-full bg-page" />
        )}
      </Link>
    </li>
  );
}
