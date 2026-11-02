// Нарисованные ассеты: фон кофейни (стёкла прозрачные — туда рисуется небо), гости, кот.
// Раскладка фона описана долями от размера картинки, чтобы работать на любом экране.

const Sprites = (() => {
  const imgs = {};
  const NAMES = ['tony', 'rosa', 'gina', 'sal', 'marco', 'sofia', 'leo', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'cat', 'pastry', 'tipjar', 'register', 'machine', 'candle', 'city-day', 'city-night', 'bg-wide', 'bg-tall'];
  const GUESTS = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'];

  // Доли: где на картинке стойка, доска, лампы и лампочки гирлянды
  const BG = {
    'bg-wide': {
      counter: 0.846, counterFront: 0.962,
      board: { x0: 0.573, y0: 0.259, x1: 0.698, y1: 0.646 },
      lamps: [[0.194, 0.158], [0.767, 0.158]],
      bulbs: [[0.050, 0.065], [0.122, 0.055], [0.176, 0.030], [0.236, 0.030], [0.300, 0.065], [0.373, 0.085], [0.453, 0.085], [0.529, 0.065], [0.589, 0.032], [0.647, 0.061], [0.712, 0.069], [0.802, 0.079], [0.867, 0.075], [0.924, 0.079], [0.989, 0.055]],
      win: null, // прозрачная область считается при загрузке
    },
    'bg-tall': {
      counter: 0.813, counterFront: 0.906,
      board: { x0: 0.663, y0: 0.227, x1: 0.96, y1: 0.378 },
      lamps: [[0.8, 0.167]],
      bulbs: [[0.025, 0.036], [0.130, 0.050], [0.253, 0.058], [0.385, 0.051], [0.517, 0.047], [0.623, 0.032], [0.708, 0.011], [0.875, 0.031], [0.963, 0.051]],
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
