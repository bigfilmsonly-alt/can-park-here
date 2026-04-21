// Service Worker for Park PWA
// https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API

const CACHE_VERSION = 'park-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const SYNC_TAG = 'sync-community-reports';

// Critical app shell resources to pre-cache on install
const APP_SHELL = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/offline.html',
];

// ──────────────────────────────────────────────
// Install: pre-cache the app shell
// ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  // Activate immediately instead of waiting for existing clients to close
  self.skipWaiting();
});

// ──────────────────────────────────────────────
// Activate: clean up old caches
// ──────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// ──────────────────────────────────────────────
// Fetch: route requests to the right strategy
// ──────────────────────────────────────────────

function isStaticAsset(url) {
  return (
    /\.(?:css|js|woff2?|ttf|otf|eot|png|jpe?g|gif|svg|webp|avif|ico)(\?.*)?$/i.test(url.pathname) ||
    url.pathname.startsWith('/_next/static/')
  );
}

function isApiRoute(url) {
  return url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/data/');
}

function isNavigation(request) {
  return (
    request.mode === 'navigate' ||
    (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'))
  );
}

// Cache-first: serve from cache, fall back to network and cache the response.
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Network-first: try network, fall back to cache, then a JSON error.
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    return new Response(
      JSON.stringify({ error: 'You are offline', offline: true }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Navigation handler: network-first with offline.html fallback.
async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    return caches.match('/offline.html');
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request));
  } else if (isApiRoute(url)) {
    event.respondWith(networkFirst(event.request));
  } else if (isNavigation(event.request)) {
    event.respondWith(handleNavigation(event.request));
  } else {
    event.respondWith(networkFirst(event.request));
  }
});

// ──────────────────────────────────────────────
// Background Sync: queue offline community reports
// ──────────────────────────────────────────────
//
// Client-side usage:
//   1. When a POST to /api/community/reports fails, store the payload
//      in IndexedDB under the 'pending-reports' store.
//   2. Register sync:
//        const reg = await navigator.serviceWorker.ready;
//        await reg.sync.register('sync-community-reports');
//
// The sync event below replays those queued requests when connectivity
// returns.

function openSyncDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('park-sync', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('pending-reports')) {
        db.createObjectStore('pending-reports', { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbGetAll(store) {
  return new Promise((resolve, reject) => {
    const r = store.getAll();
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(replayQueuedReports());
  }
});

async function replayQueuedReports() {
  const db = await openSyncDB();
  const tx = db.transaction('pending-reports', 'readonly');
  const reports = await idbGetAll(tx.objectStore('pending-reports'));

  for (const report of reports) {
    try {
      const response = await fetch('/api/community/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report.data),
      });
      if (response.ok) {
        const deleteTx = db.transaction('pending-reports', 'readwrite');
        deleteTx.objectStore('pending-reports').delete(report.id);
      }
    } catch {
      // Still offline -- browser will retry sync later
      break;
    }
  }

  db.close();
}

// ──────────────────────────────────────────────
// Push Notifications
// ──────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'Park', body: 'You have a new notification.' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-72x72.png',
    tag: data.tag || 'park-notification',
    renotify: !!data.tag,
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
    actions: data.actions || [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if (new URL(client.url).origin === self.location.origin && 'focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        return self.clients.openWindow(targetUrl);
      })
  );
});
