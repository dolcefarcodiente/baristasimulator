// Нарисованные ассеты: фон кофейни (стёкла прозрачные — туда рисуется небо), гости, кот.
// Раскладка фона описана долями от размера картинки, чтобы работать на любом экране.

const Sprites = (() => {
  const imgs = {};
  const NAMES = ['tony', 'rosa', 'gina', 'sal', 'marco', 'sofia', 'leo', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'cat', 'pastry', 'tipjar', 'register', 'machine', 'candle', 'city-day', 'city-night', 'bg-wide', 'bg-tall',
    'decor-succulents', 'decor-hangplant', 'decor-catbed', 'decor-neon', 'decor-books', 'decor-gramophone', 'critic', 'tourists',
    'bk-wide', 'bk-tall', 'fa-wide', 'fa-tall'];
  const GUESTS = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'];

  // Доли: где на картинке стойка, доска, лампы и лампочки гирлянды
  const BG = {
    'bg-wide': {
      counter: 0.846, counterFront: 0.962,
      board: { x0: 0.573, y0: 0.259, x1: 0.698, y1: 0.646 },
      lamps: [[0.194, 0.158], [0.767, 0.158]],
      bulbs: [[0.050, 0.065], [0.122, 0.055], [0.176, 0.030], [0.236, 0.030], [0.300, 0.065], [0.373, 0.085], [0.453, 0.085], [0.529, 0.065], [0.589, 0.032], [0.647, 0.061], [0.712, 0.069], [0.802, 0.079], [0.867, 0.075], [0.924, 0.079], [0.989, 0.055]],
      // подоконник (верх) и места для уюта — доли ширины окна
      sill: 0.682, spots: { succulents: 0.3, catbed: 0.5, books: 0.68, gramophone: 0.88, hangplant: 0.16, neon: 0.5 },
      win: null, // прозрачная область считается при загрузке
    },
    'bg-tall': {
      counter: 0.813, counterFront: 0.906,
      board: { x0: 0.663, y0: 0.227, x1: 0.96, y1: 0.378 },
      lamps: [[0.8, 0.167]],
      bulbs: [[0.025, 0.036], [0.130, 0.050], [0.253, 0.058], [0.385, 0.051], [0.517, 0.047], [0.623, 0.032], [0.708, 0.011], [0.875, 0.031], [0.963, 0.051]],
      // на телефоне левый край окна за экраном — предметы ближе к центру и крупнее (окно узкое)
      sill: 0.59, dscale: 1.3, spots: { succulents: 0.29, catbed: 0.47, books: 0.67, gramophone: 0.87, hangplant: 0.31, neon: 0.72 },
      win: null,
    },
    // филиалы: окна прозрачные, доска есть, уюта и подоконника нет
    'bk-wide': { counter: 0.7, counterFront: 0.81, board: { x0: 0.531, y0: 0.192, x1: 0.739, y1: 0.593 },
      lamps: [[0.191, 0.174], [0.728, 0.174]], bulbs: [[0.037, 0.059], [0.120, 0.059], [0.242, 0.063], [0.342, 0.063], [0.442, 0.059], [0.531, 0.063], [0.614, 0.063], [0.784, 0.063], [0.860, 0.063], [0.936, 0.059]], win: null },
    'bk-tall': { counter: 0.672, counterFront: 0.828, board: { x0: 0.555, y0: 0.189, x1: 0.962, y1: 0.361 },
      lamps: [[0.803, 0.144]], bulbs: [[0.131, 0.095], [0.169, 0.079], [0.231, 0.079], [0.253, 0.103], [0.742, 0.095], [0.767, 0.079], [0.828, 0.079], [0.858, 0.095]], win: null },
    'fa-wide': { counter: 0.688, counterFront: 0.84, board: { x0: 0.539, y0: 0.207, x1: 0.717, y1: 0.589 },
      lamps: [[0.191, 0.12], [0.8, 0.12], [0.039, 0.316]], bulbs: [[0.060, 0.056], [0.337, 0.053], [0.553, 0.072], [0.705, 0.069], [0.947, 0.061]], win: null },
    'fa-tall': { counter: 0.6, counterFront: 0.767, board: { x0: 0.603, y0: 0.167, x1: 0.975, y1: 0.344 },
      lamps: [[0.812, 0.111], [0.03, 0.267]], bulbs: [[0.658, 0.067], [0.700, 0.050], [0.755, 0.044], [0.867, 0.044], [0.922, 0.050], [0.962, 0.067]], win: null },
  };

  const isBg = (n) => /-(wide|tall)$/.test(n);
  let onReady = null;
  function load(cb) {
    onReady = cb;
    for (const n of NAMES) {
      const im = new Image();
      im.onload = () => { if (isBg(n)) measureWindow(n, im); if (onReady) onReady(n); };
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
  return { load, get, ready, meta, isBg, GUESTS };
})();
