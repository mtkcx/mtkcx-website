// Enhanced Service Worker for offline capabilities and performance
const CACHE_VERSION = 'v2.1';
const CACHE_NAME = `mtkcx-${CACHE_VERSION}`;
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const PRODUCTS_CACHE = `products-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// Critical assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/mobile',
  '/manifest.json',
  '/lovable-uploads/c9035b98-872b-42aa-ba81-c7d2d01c27ef.png', // Updated MTKCx Logo
  '/lovable-uploads/3f627a82-3732-49c8-9927-8736394acebc.png', // Hero banner
];

// API endpoints to cache for offline access
const CACHEABLE_APIS = [
  '/api/products',
  '/api/categories',
  '/rest/v1/products',
  '/rest/v1/categories'
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('SW: Installing enhanced service worker');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(IMAGE_CACHE),
      caches.open(PRODUCTS_CACHE),
      caches.open(API_CACHE),
      caches.open(CACHE_NAME)
    ])
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('SW: Activating enhanced service worker');
  event.waitUntil(
    Promise.all([
      // Cleanup old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![CACHE_NAME, STATIC_CACHE, IMAGE_CACHE, PRODUCTS_CACHE, API_CACHE].includes(cacheName)) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Preload critical product data
      preloadCriticalData()
    ])
  );
  self.clients.claim();
});

// Enhanced fetch event with intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isProductRequest(url)) {
    event.respondWith(handleProductRequest(request));
  } else {
    event.respondWith(handleStaticRequest(request));
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'product-sync') {
    event.waitUntil(syncProductData());
  }
});

// Push notifications for mobile app
self.addEventListener('push', (event) => {
  console.log('SW: Push notification received');
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/lovable-uploads/c9035b98-872b-42aa-ba81-c7d2d01c27ef.png',
      badge: '/lovable-uploads/c9035b98-872b-42aa-ba81-c7d2d01c27ef.png',
      vibrate: [100, 50, 100],
      data: data.data,
      actions: [
        {
          action: 'view',
          title: 'View'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification clicked');
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/mobile')
    );
  }
});

// Utility functions
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') || 
         url.pathname.startsWith('/rest/v1/') ||
         url.hostname.includes('supabase');
}

function isProductRequest(url) {
  return url.pathname.includes('/products') || 
         url.pathname.includes('/categories');
}

// Preload critical data for offline access
async function preloadCriticalData() {
  try {
    console.log('SW: Preloading critical data');
    const cache = await caches.open(PRODUCTS_CACHE);
    
    // Cache popular product images
    const criticalImages = [
      '/lovable-uploads/e91b8d4d-6296-4f40-9156-b6b791a8858f.png',
      '/lovable-uploads/5888e030-a950-4019-a5ea-9d9287fbdcc7.png'
    ];
    
    await Promise.all(
      criticalImages.map(async (url) => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (error) {
          console.log('SW: Failed to preload image:', url);
        }
      })
    );
    
    console.log('SW: Critical data preloaded');
  } catch (error) {
    console.log('SW: Failed to preload critical data:', error);
  }
}

// Background sync for product data
async function syncProductData() {
  try {
    console.log('SW: Syncing product data in background');
    // This will be called when the device comes back online
    // Implementation would sync any pending offline actions
  } catch (error) {
    console.log('SW: Product sync failed:', error);
  }
}

// Enhanced image handling with progressive loading
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);
    
    // Return cached version immediately
    if (cachedResponse) {
      // Optionally fetch fresh version in background
      fetch(request).then(response => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      }).catch(() => {
        // Ignore background fetch errors
      });
      
      return cachedResponse;
    }

    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SW: Image fetch failed:', error);
    
    // Return placeholder for failed images
    const cache = await caches.open(STATIC_CACHE);
    const placeholder = await cache.match('/placeholder.svg');
    return placeholder || new Response('', { status: 404 });
  }
}

// Handle product-specific requests with cache-first strategy
async function handleProductRequest(request) {
  try {
    const cache = await caches.open(PRODUCTS_CACHE);
    const cachedResponse = await cache.match(request);
    
    // Return cached data for better offline experience
    if (cachedResponse) {
      // Update cache in background if online
      if (navigator.onLine) {
        fetch(request).then(response => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
        }).catch(() => {
          // Ignore background update errors
        });
      }
      
      return cachedResponse;
    }

    // Fetch from network if not cached
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SW: Product request failed:', error);
    
    // Return offline response
    return new Response(JSON.stringify({
      error: 'Offline - Please check your internet connection',
      cached: false
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle API requests with network-first strategy for real-time data
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first for real-time data
    const networkResponse = await fetch(request, {
      timeout: 3000 // 3 second timeout
    });
    
    if (networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SW: API request failed, checking cache:', error);
    
    // Fallback to cache if network fails
    const cache = await caches.open(API_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Add offline indicator header
      const response = cachedResponse.clone();
      response.headers.set('X-Served-From', 'cache');
      return response;
    }
    
    // Return offline error
    return new Response(JSON.stringify({
      error: 'No internet connection and no cached data available',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  const url = new URL(request.url);
  
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    // Return cached version if available
    if (cachedResponse) {
      // Update cache in background for HTML pages
      if (url.pathname === '/' || url.pathname === '/mobile') {
        fetch(request).then(response => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
        }).catch(() => {
          // Ignore background update errors
        });
      }
      
      return cachedResponse;
    }

    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SW: Static request failed:', error);
    
    // Return cached fallback page
    const cache = await caches.open(STATIC_CACHE);
    const fallback = await cache.match('/');
    
    if (fallback) {
      return fallback;
    }
    
    // Return basic offline page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - MTKCX</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .offline { color: #666; }
          </style>
        </head>
        <body>
          <h1>You're Offline</h1>
          <p class="offline">Please check your internet connection and try again.</p>
          <button onclick="window.location.reload()">Retry</button>
        </body>
      </html>
    `, {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}