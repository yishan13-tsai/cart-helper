import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EnvBanner } from './components/EnvBanner';

const NAV_ITEMS = [
  { to: '/', labelKey: 'nav.camera' },
  { to: '/cart', labelKey: 'nav.cart' },
  { to: '/history', labelKey: 'nav.history' },
  { to: '/settings', labelKey: 'nav.settings' },
] as const;

export function App() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const isCamera = pathname === '/' || pathname.startsWith('/receipt/');
  return (
    <div className="flex h-full flex-col">
      <EnvBanner />
      {!isCamera && (
        <header className="bg-secondary-500 text-neutral-0 px-4 py-3">
          <h1 className="text-xl font-bold">{t('app.name')}</h1>
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
    <nav className="bg-neutral-0 border-t border-neutral-100 flex">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex-1 py-3 text-center text-sm ${
              active ? 'text-primary-500 font-bold' : 'text-neutral-700'
            }`}
          >
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
