import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Garante que o body nunca inicie com overflow bloqueado
document.body.style.overflow = '';
document.body.style.touchAction = '';

// Atualiza o Service Worker e limpa caches antigos (v1-v4) automaticamente no celular
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if ('caches' in window) {
      caches
        .keys()
        .then((keys) => {
          keys.forEach((key) => {
            if (key !== '63motorsport-pwa-v5') {
              caches.delete(key);
            }
          });
        })
        .catch(() => {});
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        reg.update().catch(() => {});
      })
      .catch((err) => console.warn('Aviso ao registrar Service Worker PWA:', err));
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
