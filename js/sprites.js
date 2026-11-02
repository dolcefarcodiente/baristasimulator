// Нарисованные ассеты: фон кофейни (стёкла прозрачные — туда рисуется небо), гости, кот.
// Раскладка фона описана долями от размера картинки, чтобы работать на любом экране.

const Sprites = (() => {
  const imgs = {};
  const NAMES = ['tony', 'rosa', 'gina', 'sal', 'marco', 'sofia', 'leo', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'cat', 'pastry', 'tipjar', 'register', 'machine', 'candle', 'city-day', 'city-night', 'bg-wide', 'bg-tall'];
  const GUESTS = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'];

  // Доли: где на картинке стойка, доска, лампы и лампочки гирлянды
  const BG = {
    'bg-wide': {
      counter: 0.885, counterFront: 0.96,
      board: { x0: 0.714, y0: 0.158, x1: 0.934, y1: 0.368 },
      lamps: [[0.16, 0.2], [0.664, 0.197]],
      bulbs: [[0.27, 0.052], [0.345, 0.093], [0.43, 0.081], [0.53, 0.075], [0.609, 0.046], [0.729, 0.058], [0.824, 0.087], [0.954, 0.07]],
      win: null, // прозрачная область считается при загрузке
    },
    'bg-tall': {
      counter: 0.866, counterFront: 0.95,
      board: { x0: 0.635, y0: 0.244, x1: 0.952, y1: 0.427 },
      lamps: [[0.693, 0.195]],
      bulbs: [[0.596, 0.03], [0.796, 0.072], [0.908, 0.088], [0.982, 0.065]],
      win: null,
    },
  };

  let onReady = null;
  function load(cb) {
    onReady = cb;
    for (const n of NAMES) {
      const im = new Image();
      im.onload = () => { if (n.startsWith('bg-')) measureWindow(n, im); if (onReady) onReady(n); };
      im.src = `img/${n}.png`;
      imgs[n] = im;
    }
  }

  // Находим прозрачные стёкла окна: ограничивающий прямоугольник пикселей с нулевой альфой
  function measureWindow(name, im) {
    const c = document.createElement('canvas');
    const sw = 256, sh = Math.round(256 * im.height / im.width);
    c.width = sw; c.height = sh;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(im, 0, 0, sw, sh);
    const d = g.getImageData(0, 0, sw, sh).data;
    let x0 = sw, y0 = sh, x1 = 0, y1 = 0;
    for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
      if (d[(y * sw + x) * 4 + 3] < 40) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
    }
    BG[name].win = x1 > x0 ? { x0: x0 / sw, y0: y0 / sh, x1: (x1 + 1) / sw, y1: (y1 + 1) / sh } : { x0: 0.05, y0: 0.1, x1: 0.6, y1: 0.7 };
  }

  const get = (n) => imgs[n];
  const ready = (n) => !!(imgs[n] && imgs[n].complete && imgs[n].naturalWidth > 0);
  const meta = (n) => BG[n];
  return { load, get, ready, meta, GUESTS };
})();
