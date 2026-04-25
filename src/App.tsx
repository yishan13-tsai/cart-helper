import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EnvBanner } from './components/EnvBanner';

const NAV_ITEMS = [
  { to: '/', labelKey: 'nav.camera', icon: '📷' },
  { to: '/cart', labelKey: 'nav.cart', icon: '🛒' },
  { to: '/history', labelKey: 'nav.history', icon: '📋' },
  { to: '/settings', labelKey: 'nav.settings', icon: '⚙️' },
] as const;

export function App() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const isCamera = pathname === '/' || pathname.startsWith('/receipt/');
  return (
    <div className="flex h-full flex-col">
      <EnvBanner />
      {!isCamera && (
        <header className="bg-primary-gradient px-4 py-4 text-neutral-0 shadow-hero">
          <h1 className="text-xl font-bold tracking-tight">{t('app.name')}</h1>
        </header>
      )}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

function BottomNav() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  return (
    <nav className="bg-neutral-0/95 flex border-t border-neutral-100 backdrop-blur shadow-nav">
      {NAV_ITEMS.map((item) => {
        const active =
          item.to === '/'
            ? pathname === '/' || pathname.startsWith('/receipt/')
            : pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-2xs transition ${
              active ? 'text-primary-500' : 'text-neutral-400'
            }`}
          >
            <span className="text-base" aria-hidden>
              {item.icon}
            </span>
            <span className={active ? 'font-bold' : ''}>{t(item.labelKey)}</span>
            {active && (
              <span className="absolute top-0 h-0.5 w-8 rounded-b-full bg-primary-500" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
