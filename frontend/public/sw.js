const CACHE_NAME = '63motorsport-pwa-v5';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Não intercepta documentos HTML, scripts JS/CSS ou chamadas ao Supabase/API
// para garantir que o aplicativo sempre carregue a versão mais recente sem travar
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;

  // Apenas ícones e manifest usam cache de fallback
  const isStaticIcon =
    request.url.endsWith('.png') ||
    request.url.endsWith('.svg') ||
    request.url.endsWith('.webmanifest');

  if (!isStaticIcon) return;

  event.respondWith(
    fetch(request).catch(() =>
      caches.match(request).then((res) => res || new Response('', { status: 404 }))
    )
  );
});
