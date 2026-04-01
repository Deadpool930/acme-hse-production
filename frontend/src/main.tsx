import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import ErrorBoundary from './components/ui/ErrorBoundary'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)

// TODO: Re-enable Service Worker for PWA/Offline Sync in Production
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/service-worker.ts')
//       .then(reg => console.log('Senior EHS Sync: Service Worker Registered', reg.scope))
//       .catch(err => console.error('Senior EHS Sync: Registration Failed', err));
//   });
// }
