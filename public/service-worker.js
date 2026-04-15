const CACHE_NAME = 'vayu-edge-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

async function notifyClients(type, url, status) {
  const allClients = await clients.matchAll();
  allClients.forEach(client => {
    client.postMessage({
      type: 'EDGE_EVENT',
      event: type,
      url: url,
      status: status,
      timestamp: Date.now()
    });
  });
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Intercept requests to Puter hosting domains
  if (url.hostname.endsWith('.puter.site')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const response = await cache.match(event.request);
        if (response) {
          // Cache Hit
          notifyClients('CACHE_HIT', event.request.url, 200);
          return response;
        }

        // Cache Miss
        notifyClients('CACHE_MISS', event.request.url, 'FETCHING');
        
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
            notifyClients('CACHE_STORED', event.request.url, networkResponse.status);
          }
          return networkResponse;
        } catch (error) {
          notifyClients('CACHE_ERROR', event.request.url, 'NETWORK_FAIL');
          return new Response('Network error', { status: 408 });
        }
      })
    );
  }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        event.source.postMessage({ type: 'CACHE_CLEARED' });
      })
    );
  }

  if (event.data.type === 'LIST_CACHE') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(async (cache) => {
        const keys = await cache.keys();
        const urls = keys.map(request => request.url);
        event.source.postMessage({ type: 'CACHE_LIST', urls });
      })
    );
  }

  if (event.data.type === 'DELETE_CACHE_ITEM') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(async (cache) => {
        await cache.delete(event.data.url);
        event.source.postMessage({ type: 'CACHE_ITEM_DELETED', url: event.data.url });
      })
    );
  }
});
