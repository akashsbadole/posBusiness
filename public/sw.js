const CACHE_NAME = 'restaurant-pos-v1';
const API_CACHE_NAME = 'restaurant-pos-api-v1';
const STATIC_CACHE_NAME = 'restaurant-pos-static-v1';

// URLs to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints that can be cached
const CACHEABLE_API_ENDPOINTS = [
  '/api/menu-items',
  '/api/categories',
  '/api/customers',
  '/api/tables',
  '/api/staff'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && 
              cacheName !== API_CACHE_NAME && 
              cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - handle requests with offline support
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    // For GET requests to cacheable endpoints
    if (event.request.method === 'GET' && 
        CACHEABLE_API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))) {
      event.respondWith(
        caches.open(API_CACHE_NAME)
          .then((cache) => cache.match(event.request))
          .then((response) => {
            if (response) {
              // Return cached response and update in background
              fetchAndCacheAPI(event.request);
              return response;
            }
            
            // If not in cache, fetch from network
            return fetchAndCacheAPI(event.request);
          })
          .catch(() => {
            // If both cache and network fail, return offline response
            return new Response(JSON.stringify({ error: 'Offline', data: [] }), {
              headers: { 'Content-Type': 'application/json' }
            });
          })
      );
    } else {
      // For non-cacheable API requests (POST, PUT, DELETE, etc.)
      event.respondWith(
        fetch(event.request).catch(() => {
          // Store failed requests for later sync
          storeOfflineRequest(event.request);
          return new Response(JSON.stringify({ 
            error: 'Offline', 
            message: 'Request stored for sync when online',
            offline: true 
          }), {
            headers: { 'Content-Type': 'application/json' },
            status: 202 // Accepted
          });
        })
      );
    }
    return;
  }
  
  // Handle static assets
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          // Cache new static assets
          if (event.request.method === 'GET' && 
              (event.request.url.startsWith('http://') || 
               event.request.url.startsWith('https://'))) {
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
            });
          }
          return response;
        });
      })
      .catch(() => {
        // Return offline fallback for HTML pages
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/');
        }
      })
  );
});

// Helper function to fetch and cache API responses
function fetchAndCacheAPI(request) {
  return fetch(request).then((response) => {
    if (response.status === 200) {
      const responseClone = response.clone();
      caches.open(API_CACHE_NAME).then((cache) => {
        cache.put(request, responseClone);
      });
    }
    return response;
  });
}

// Helper function to store offline requests
function storeOfflineRequest(request) {
  return request.clone().json().then((requestData) => {
    const offlineRequest = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: requestData,
      timestamp: Date.now()
    };
    
    // Store in IndexedDB
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('OfflineDB', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['offlineRequests'], 'readwrite');
        const store = transaction.objectStore('offlineRequests');
        
        store.add(offlineRequest);
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('offlineRequests')) {
          db.createObjectStore('offlineRequests', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  });
}

// Sync event - triggered when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-requests') {
    event.waitUntil(syncOfflineRequests());
  }
});

// Function to sync offline requests
async function syncOfflineRequests() {
  try {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('OfflineDB', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    
    const transaction = db.transaction(['offlineRequests'], 'readwrite');
    const store = transaction.objectStore('offlineRequests');
    const requests = await new Promise((resolve, reject) => {
      const getRequest = store.getAll();
      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = () => reject(getRequest.error);
    });
    
    // Process each offline request
    for (const offlineRequest of requests) {
      try {
        const response = await fetch(offlineRequest.url, {
          method: offlineRequest.method,
          headers: offlineRequest.headers,
          body: JSON.stringify(offlineRequest.body)
        });
        
        if (response.ok) {
          // Remove successfully synced request
          await new Promise((resolve, reject) => {
            const deleteRequest = store.delete(offlineRequest.id);
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
          });
          
          // Notify clients about successful sync
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_SUCCESS',
              requestId: offlineRequest.id,
              url: offlineRequest.url
            });
          });
        }
      } catch (error) {
        console.error('Failed to sync request:', error);
      }
    }
  } catch (error) {
    console.error('Error syncing offline requests:', error);
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Restaurant POS', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});