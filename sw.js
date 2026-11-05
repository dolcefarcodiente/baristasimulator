// Service worker: кладёт игру в кэш, чтобы она работала без интернета.
const CACHE = 'bellanotte-v34';
const FILES = [
  './', 'index.html', 'css/style.css', 'manifest.webmanifest',
  'js/i18n.js', 'js/sprites.js', 'js/data.js', 'js/icons.js', 'js/save.js', 'js/audio.js', 'js/progress.js', 'js/art.js', 'js/events.js', 'js/rating.js', 'js/talk.js', 'js/shift.js', 'js/bar.js', 'js/story.js', 'js/story/prologue.js', 'js/story/ch1.js', 'js/story/ch2.js', 'js/story/ch3.js', 'js/story/ch4.js', 'js/ui.js', 'js/main.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png',
  'fonts/pressstart-latin.woff2', 'fonts/pressstart-latin-ext.woff2', 'fonts/pressstart-cyrillic.woff2', 'fonts/pressstart-cyrillic-ext.woff2',
  ...['tony', 'rosa', 'gina', 'sal', 'marco', 'sofia', 'leo', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'cat', 'pastry', 'tipjar', 'register', 'machine', 'candle', 'city-day', 'city-night', 'bg-wide', 'bg-tall',
    'decor-succulents', 'decor-hangplant', 'decor-catbed', 'decor-neon', 'decor-books', 'decor-gramophone', 'critic', 'tourists', 'bk-wide', 'bk-tall', 'fa-wide', 'fa-tall',
    'cg-outside-wide', 'cg-outside-tall', 'cg-photo-opening'].map((n) => `img/${n}.png`),
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Сначала сеть (чтобы обновления доходили), при офлайне — кэш.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
