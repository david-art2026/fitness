const CACHE_NAME = 'fitness-pwa-v2';
const urlsToCache = ['/', '/index.html', '/manifest.json'];

// 安装阶段：强制抓取文件存入本地硬盘
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// 激活阶段：清理旧版本缓存，接管页面
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => {
        if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
      })
    )).then(() => self.clients.claim())
  );
});

// 抓取阶段：缓存优先策略（解决白屏核心）
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // 如果本地硬盘有缓存，直接光速返回，不等待网络
      if (response) return response;
      // 只有在没有缓存时，才去网络请求
      return fetch(event.request);
    }).catch(() => {
      // 应对极端断网情况的保底机制
      return caches.match('/index.html');
    })
  );
});
