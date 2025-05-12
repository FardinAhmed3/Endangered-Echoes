const CACHE_NAME = 'endangered-echoes-v1';
const ASSETS_TO_CACHE = [
  'endangered-echoes/',
  'endangered-echoes/index.html',
  'endangered-echoes/promo.html',
  'endangered-echoes/style.css',
  'endangered-echoes/app.js',
  'endangered-echoes/manifest.json',
  'endangered-echoes/data.json',
  'endangered-echoes/assets/icons/icon-192x192.png',
  'endangered-echoes/assets/icons/icon-512x512.png',
  'endangered-echoes/assets/icons/apple-touch-icon.png',
  'endangered-echoes/assets/images/cheetah.jpg',
  'endangered-echoes/assets/images/tiger.jpg',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('cdn.jsdelivr.net')) {
    return;
  }

  if (event.request.url.includes('data.json')) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            fetch(event.request)
              .then(response => {
                if (response.ok) {
                  const clonedResponse = response.clone();
                  caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, clonedResponse);
                  });
                }
              })
              .catch(() => {});
            return cachedResponse;
          }
          
          return fetch(event.request)
            .then(response => {
              if (response.ok) {
                const clonedResponse = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, clonedResponse);
                });
              }
              return response;
            })
            .catch(() => {
              return new Response(JSON.stringify([]), {
                headers: {'Content-Type': 'application/json'}
              });
            });
        })
    );
    return;
  }

  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/');
            }
            
            console.error('Fetch failed:', error);
            throw error;
          });
      })
  );
});

self.addEventListener('push', event => {
  const title = 'Endangered Echoes';
  const options = {
    body: event.data ? event.data.text() : 'New content available',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-192x192.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});