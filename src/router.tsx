import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { CameraPage } from './pages/CameraPage';
import { CartPage } from './pages/CartPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { ReceiptCapturePage } from './pages/ReceiptCapturePage';
import { ComparisonResultPage } from './pages/ComparisonResultPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <CameraPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'receipt/capture', element: <ReceiptCapturePage /> },
      { path: 'receipt/comparison/:id', element: <ComparisonResultPage /> },
    ],
  },
]);
