const CACHE_NAME = 'revizrlearn-v1.0.0';
const urlsToCache = [
  // HTML files
  '/Revizrlearn/',
  '/Revizrlearn/index.html',
  '/Revizrlearn/dashboard.html',
  '/Revizrlearn/flashcards_editor.html',
  '/Revizrlearn/flashcards.html',
  '/Revizrlearn/study_mode.html',

  // CSS files
  '/Revizrlearn/css/index.css',
  '/Revizrlearn/css/dashboard.css',
  '/Revizrlearn/css/flashcards_editor.css',
  '/Revizrlearn/css/flashcards.css',
  '/Revizrlearn/css/study_mode.css',

  // JavaScript files
  '/Revizrlearn/script/index.js',
  '/Revizrlearn/script/dashboard.js',
  '/Revizrlearn/script/flashcards_editor.js',
  '/Revizrlearn/script/flashcards.js',
  '/Revizrlearn/script/study_mode.js',

  // Icons
  '/Revizrlearn/assets/icons/icon-192.png',
  '/Revizrlearn/assets/icons/icon-512.png',

  // Images (list each file you want to cache!)
  // Example files – add more as needed:
  '/Revizrlearn/assets/images/logo.png',
  '/Revizrlearn/assets/images/example1.png',
  '/Revizrlearn/assets/images/example2.jpg'
];

// Install event - cache all files
self.addEventListener('install', function(event) {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('Service Worker: All files cached');
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.log('Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          // Delete old caches that don't match current version
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache first, fallback to network
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return response;
        }
        console.log('Service Worker: Fetching from network', event.request.url);
        return fetch(event.request)
          .then(function(response) {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
            return response;
          })
          .catch(function() {
            console.log('Service Worker: Both cache and network failed for', event.request.url);
            if (event.request.destination === 'document') {
              return caches.match('/Revizrlearn/index.html');
            }
          });
      })
  );
});

// Handle service worker updates - notify user when new version is available
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    // Handle any background sync tasks here
  }
});

self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      }
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/Revizrlearn/')
  );
});
