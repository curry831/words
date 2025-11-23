const CACHE_NAME = 'word-record-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap',
  'https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.15.0/firebase-database-compat.js',
  'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth-compat.js'
];

// 安装Service Worker并缓存资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 拦截网络请求，使用缓存或网络
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 缓存命中，返回缓存资源
        if (response) {
          return response;
        }
        
        // 对于Firebase请求，直接从网络获取
        if (event.request.url.includes('firebaseio.com') || 
            event.request.url.includes('googleapis.com') ||
            event.request.url.includes('firebase')) {
          return fetch(event.request);
        }
        
        // 其他请求，先尝试网络，失败则使用缓存
        return fetch(event.request).catch(() => {
          // 如果是导航请求，返回index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// 激活新的Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});