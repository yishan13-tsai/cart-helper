import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App } from './App';
import { CameraPage } from './pages/CameraPage';
import { CartPage } from './pages/CartPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { ReceiptCapturePage } from './pages/ReceiptCapturePage';
import { ComparisonResultPage } from './pages/ComparisonResultPage';
import { ListPage } from './pages/ListPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Root → Scan. CameraPage itself shows the trip-start gate when no
      // active trip exists, so we don't need a separate Home page.
      { index: true, element: <Navigate to="/scan" replace /> },
      { path: 'scan', element: <CameraPage /> },
      { path: 'list', element: <ListPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'receipt/capture', element: <ReceiptCapturePage /> },
      { path: 'receipt/comparison/:id', element: <ComparisonResultPage /> },
    ],
  },
]);
