/* 酒店筹建地图 - Service Worker：缓存应用外壳，离线也能打开 */
const CACHE = 'hotel-map-v20';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable.png',
  './apple-touch-icon.png',
  './vendor/leaflet.js',
  './vendor/leaflet.css'
];

self.addEventListener('install', (e) => {
  // 单个资源失败不能让整个 SW 安装失败：否则旧 SW 会继续控制页面，旧缓存永远刷不掉
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(ASSETS.map((u) => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function fallbackHtml() {
  return new Response(
    '<!doctype html><meta charset="utf-8"><title>酒店筹建地图</title>' +
    '<body style="font:16px/1.7 -apple-system,BlinkMacSystemFont,sans-serif;padding:32px;color:#333">' +
    '<h2>暂时无法加载地图</h2>' +
    '<p>网络不可用，且本机还没有可用的缓存页面。请连网后刷新，或打开应急离线版文件。</p>' +
    '<p><a href="./index.html">重试打开地图</a></p></body>',
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // 地图瓦片 / 外部 CDN 依赖一律走网络，不进缓存
  if (url.origin !== location.origin) return;

  if (e.request.mode === 'navigate') {
    // 网络优先；失败回退缓存首页；连缓存都没有也必须返回一个可读页面。
    // 旧版在这里直接 respondWith(caches.match(...))，匹配不到会得到 undefined
    // → 浏览器显示「整页全白」，这是本次白屏的根因。
    e.respondWith(
      fetch(e.request)
        .then((r) => {
          if (!r || !r.ok) throw new Error('bad response');
          const cp = r.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', cp)).catch(() => {});
          return r;
        })
        .catch(async () => {
          const hit = (await caches.match('./index.html')) || (await caches.match('./'));
          return hit || fallbackHtml();
        })
    );
    return;
  }

  // 其余同源资源同样网络优先，避免 vendor/leaflet.js 等被旧缓存钉死在旧版本
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (!r || !r.ok) throw new Error('bad response');
        const cp = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, cp)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || Response.error()))
  );
});
