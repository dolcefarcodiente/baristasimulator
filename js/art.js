// Отрисовка сцены: кофейня, гости, облачка заказов, кот, частицы.

const Art = (() => {
  const cv = document.getElementById('scene');
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  let bg = null, counter = null;
  let time = 0, shake = 0;
  let safeTop = 0; // отступ под чёлку/статус-бар телефона
  const particles = [];
  const texts = [];
  const flyers = [];
  const L = {}; // раскладка

  // ---------- помощники ----------
  function rr(c, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  function hex(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function mix(a, b, t) {
    const x = hex(a), y = hex(b);
    return `rgb(${Math.round(lerp(x[0], y[0], t))},${Math.round(lerp(x[1], y[1], t))},${Math.round(lerp(x[2], y[2], t))})`;
  }
  function shade(h, amt) {
    const [r, g, b] = hex(h);
    const f = (v) => clamp(Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt), 0, 255);
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  }
  function seeded(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

  // ---------- раскладка ----------
  // Фон — нарисованная картинка; выбираем вертикальную или широкую по пропорциям экрана
  function bgName() { return W / H < 1.05 ? 'bg-tall' : 'bg-wide'; }
  function resize() {
    const r = cv.parentElement.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2.5);
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    const name = bgName(), im = Sprites.get(name), m = Sprites.meta(name);
    const iw = (im && im.naturalWidth) || (name === 'bg-wide' ? 1280 : 896), ih = (im && im.naturalHeight) || (name === 'bg-wide' ? 720 : 1344);
    // картинка покрывает сцену целиком и прижата к низу: стойка всегда на месте
    const scale = Math.max(W / iw, H / ih);
    const dw = iw * scale, dh = ih * scale;
    L.bg = { name, x: (W - dw) / 2, y: H - dh, w: dw, h: dh, scale };
    const X = (fx) => L.bg.x + fx * dw, Y = (fy) => L.bg.y + fy * dh;
    L.counterTop = Math.round(Y(m.counter));
    L.mw = 0; L.ax0 = W * 0.03; L.aw = W * 0.94;
    const wn = m.win || { x0: 0.05, y0: 0.1, x1: 0.6, y1: 0.7 };
    L.win = { x: Math.round(X(wn.x0)), y: Math.round(Y(wn.y0)), w: Math.round((wn.x1 - wn.x0) * dw), h: Math.round((wn.y1 - wn.y0) * dh) };
    L.board = { x: X(m.board.x0), y: Y(m.board.y0), w: (m.board.x1 - m.board.x0) * dw, h: (m.board.y1 - m.board.y0) * dh };
    L.lamps = m.lamps.map(([fx, fy]) => [X(fx), Y(fy)]);
    L.bulbs = m.bulbs.map(([fx, fy]) => [X(fx), Y(fy)]);
    L.clock = null;
    invalidate();
  }
  function invalidate() { bg = null; counter = null; grain = null; }

  function slotW(cap) { return L.aw / cap; }
  function slotX(i, cap) { return L.ax0 + (i + 0.5) * slotW(cap); }
  function personR(cap) { return clamp(Math.min(slotW(cap) / 4.2, (L.counterTop - 40) / 7), 12, 32); }

  // ---------- слои фона ----------
  function makeLayer() {
    const c = document.createElement('canvas');
    c.width = cv.width; c.height = cv.height;
    const g = c.getContext('2d'); g.scale(DPR, DPR);
    return [c, g];
  }

  // ---------- рисование «от руки» ----------
  // Контуры чуть дрожат, как нарисованные пером: ни одной идеально ровной линии.
  const INKC = '#3a2434';
  const wob = (rnd, k) => (rnd() - 0.5) * k;
  // Гладкая кривая через точки с лёгким дрожанием (закрытая или открытая)
  function hpath(g, pts, closed, rnd, k = 1) {
    const n = pts.length;
    const p = pts.map(([x, y]) => [x + wob(rnd, k), y + wob(rnd, k)]);
    g.beginPath();
    if (closed) {
      g.moveTo((p[n - 1][0] + p[0][0]) / 2, (p[n - 1][1] + p[0][1]) / 2);
      for (let i = 0; i < n; i++) { const a = p[i], b = p[(i + 1) % n]; g.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }
      g.closePath();
    } else {
      g.moveTo(p[0][0], p[0][1]);
      for (let i = 1; i < n - 1; i++) { const a = p[i], b = p[i + 1]; g.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }
      g.lineTo(p[n - 1][0], p[n - 1][1]);
    }
  }
  // Прямоугольник со скруглёнными углами, слегка кривой
  function hrect(g, x, y, w, h, r, rnd, k = 1) {
    r = Math.min(r, w / 2, h / 2);
    const pts = [[x + r, y], [x + w / 2, y], [x + w - r, y], [x + w, y + r], [x + w, y + h / 2], [x + w, y + h - r], [x + w - r, y + h], [x + w / 2, y + h], [x + r, y + h], [x, y + h - r], [x, y + h / 2], [x, y + r]];
    if (r < 1) { // острые углы: дублируем угловые точки
      hpath(g, [[x, y], [x + w / 2, y], [x + w, y], [x + w, y + h / 2], [x + w, y + h], [x + w / 2, y + h], [x, y + h], [x, y + h / 2]], true, rnd, k);
      return;
    }
    hpath(g, pts, true, rnd, k);
  }
  // Овал от руки
  function hellipse(g, cx, cy, rx, ry, rnd, k = 1) {
    const pts = [];
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
    hpath(g, pts, true, rnd, k);
  }
  const ink = (g, w = 1.6) => { g.strokeStyle = INKC; g.lineWidth = w; g.lineJoin = 'round'; g.lineCap = 'round'; };
  // Трапеция-горшок / стакан: низ уже верха
  function tub(g, x, y, wTop, wBot, h, rnd, k = 1) {
    hpath(g, [[x - wTop / 2, y - h], [x + wTop / 2, y - h], [x + wBot / 2, y], [x - wBot / 2, y]], true, rnd, k);
  }

  // ---------- предметы ----------
  // Банки: 0 — зёрна с латунной крышкой, 1 — сахар с пробкой, 2 — бутылка амаретто, 3 — красная жестянка
  function propJar(g, x, y, s, rnd, v) {
    ink(g, 1.5);
    if (v === 0) {
      const w = 20 * s, h = 27 * s;
      g.fillStyle = 'rgba(235,245,250,.7)'; hrect(g, x, y - h, w, h, 5 * s, rnd); g.fill(); g.stroke();
      g.fillStyle = '#5a3422'; hrect(g, x + 2, y - h * 0.68, w - 4, h * 0.64, 3 * s, rnd, 0.6); g.fill();
      g.fillStyle = '#7a4a30'; for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(x + 4 + rnd() * (w - 8), y - h * 0.55 + rnd() * h * 0.45, 1.6 * s, 1.1 * s, rnd() * 3, 0, 7); g.fill(); }
      g.fillStyle = '#fff6e6'; hrect(g, x + 3, y - h * 0.5, w - 6, 7 * s, 1, rnd, 0.5); g.fill(); g.stroke();
      g.strokeStyle = '#8a5634'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 5, y - h * 0.5 + 3.5 * s); g.lineTo(x + w - 5, y - h * 0.5 + 3.5 * s); g.stroke();
      ink(g, 1.5); g.fillStyle = '#c9a227'; hrect(g, x - 1, y - h - 4 * s, w + 2, 5 * s, 1.5, rnd, 0.6); g.fill(); g.stroke();
    } else if (v === 1) {
      const w = 24 * s, h = 20 * s;
      g.fillStyle = 'rgba(235,245,250,.7)'; hrect(g, x, y - h, w, h, 7 * s, rnd); g.fill(); g.stroke();
      g.fillStyle = '#fffaf0'; hrect(g, x + 2, y - h * 0.6, w - 4, h * 0.56, 5 * s, rnd, 0.6); g.fill();
      g.fillStyle = '#d9b27a'; hrect(g, x + 6 * s, y - h - 5 * s, w - 12 * s, 7 * s, 2, rnd, 0.6); g.fill(); g.stroke();
      g.fillStyle = '#e07a5f'; g.beginPath(); g.arc(x + w / 2, y - h * 0.3, 3 * s, 0, 7); g.fill();
    } else if (v === 2) {
      const w = 13 * s, h = 34 * s;
      g.fillStyle = '#b5651d';
      hpath(g, [[x + w * 0.3, y - h], [x + w * 0.7, y - h], [x + w * 0.7, y - h * 0.72], [x + w, y - h * 0.6], [x + w, y], [x, y], [x, y - h * 0.6], [x + w * 0.3, y - h * 0.72]], true, rnd, 0.7);
      g.fill(); g.stroke();
      g.fillStyle = INKC; hrect(g, x + w * 0.25, y - h - 3 * s, w * 0.5, 4 * s, 1, rnd, 0.4); g.fill();
      g.fillStyle = '#fff6e6'; hrect(g, x + 2, y - h * 0.45, w - 4, h * 0.26, 1, rnd, 0.4); g.fill(); g.stroke();
      g.strokeStyle = '#8a5634'; g.lineWidth = 0.9; for (let i = 0; i < 2; i++) { g.beginPath(); g.moveTo(x + 4, y - h * 0.38 + i * 3.5 * s); g.lineTo(x + w - 4, y - h * 0.38 + i * 3.5 * s); g.stroke(); }
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + 3, y - h * 0.55); g.lineTo(x + 3, y - 5); g.stroke();
    } else {
      const w = 18 * s, h = 26 * s;
      g.fillStyle = '#b85c5c'; hrect(g, x, y - h, w, h, 2 * s, rnd); g.fill(); g.stroke();
      g.fillStyle = '#f3e3c8'; hrect(g, x, y - h * 0.68, w, h * 0.34, 0, rnd, 0.5); g.fill();
      ink(g, 1.2); g.beginPath(); g.moveTo(x + w * 0.3, y - h * 0.45); g.lineTo(x + w * 0.7, y - h * 0.45); g.lineTo(x + w * 0.64, y - h * 0.36); g.lineTo(x + w * 0.36, y - h * 0.36); g.closePath(); g.stroke();
      g.beginPath(); g.moveTo(x + w * 0.7, y - h * 0.43); g.quadraticCurveTo(x + w * 0.85, y - h * 0.42, x + w * 0.68, y - h * 0.38); g.stroke();
      g.fillStyle = '#d5dee3'; ink(g, 1.5); hellipse(g, x + w / 2, y - h, w / 2, 2.5 * s, rnd, 0.5); g.fill(); g.stroke();
    }
  }
  function pot(g, x, y, w, h, rnd, color) {
    ao(g, x, y, w * 0.7);
    ink(g, 1.5); g.fillStyle = color;
    tub(g, x, y, w, w * 0.78, h, rnd); g.fill(); g.stroke();
    g.fillStyle = shade(color, -0.2); hrect(g, x - w / 2 - 1.5, y - h, w + 3, h * 0.22, 1.5, rnd, 0.6); g.fill(); g.stroke();
  }
  // Растения: 0 — монстера, 1 — суккулент, 2 — потос со свисающими плетями, 3 — кактус с цветком
  function propPlant(g, x, y, s, rnd, kind) {
    if (kind === 0) {
      pot(g, x, y, 18 * s, 15 * s, rnd, '#c47a5a');
      const leaf = (ang, len, flip) => {
        g.save(); g.translate(x, y - 14 * s); g.rotate(ang);
        g.fillStyle = flip ? '#6b7a3e' : '#8a9a55'; ink(g, 1.3);
        hpath(g, [[0, 0], [-len * 0.35, -len * 0.3], [-len * 0.42, -len * 0.7], [-len * 0.15, -len * 0.62], [0, -len], [len * 0.15, -len * 0.62], [len * 0.42, -len * 0.7], [len * 0.35, -len * 0.3]], true, rnd, 0.8);
        g.fill(); g.stroke();
        g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -len * 0.9); g.stroke();
        g.restore();
      };
      leaf(-0.55, 24 * s, false); leaf(0.5, 22 * s, true); leaf(-0.05, 28 * s, false);
    } else if (kind === 1) {
      pot(g, x, y, 16 * s, 12 * s, rnd, '#fff6e6');
      ink(g, 1.2);
      for (let ring = 2; ring >= 0; ring--) {
        const n = 5 + ring * 2, rad = (4 + ring * 4) * s;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + ring * 0.4;
          g.fillStyle = ring === 0 ? '#c2c47a' : ring === 1 ? '#a0a858' : '#8a9a55';
          hpath(g, [[x, y - 12 * s], [x + Math.cos(a + 0.35) * rad * 0.6, y - 12 * s + Math.sin(a + 0.35) * rad * 0.6 - 3 * s], [x + Math.cos(a) * rad, y - 12 * s + Math.sin(a) * rad * 0.7 - 4 * s], [x + Math.cos(a - 0.35) * rad * 0.6, y - 12 * s + Math.sin(a - 0.35) * rad * 0.6 - 3 * s]], true, rnd, 0.5);
          g.fill(); g.stroke();
        }
      }
    } else if (kind === 2) {
      pot(g, x, y, 17 * s, 13 * s, rnd, '#8a7a9a');
      ink(g, 1.2);
      for (const dir of [-1, 1]) {
        const len = (26 + rnd() * 14) * s;
        g.strokeStyle = '#6b7a3e'; g.lineWidth = 1.4;
        g.beginPath(); g.moveTo(x + dir * 5 * s, y - 12 * s); g.quadraticCurveTo(x + dir * 14 * s, y - 8 * s, x + dir * 11 * s, y + len); g.stroke();
        for (let i = 0; i < 4; i++) {
          const tt = 0.25 + i * 0.22, px = x + dir * (5 + 9 * tt) * s + dir * (i % 2 ? 4 : -4) * s, py = y - 12 * s + (len + 12 * s) * tt;
          g.fillStyle = i % 2 ? '#a3ad5f' : '#6b7a3e'; ink(g, 1.1);
          hpath(g, [[px, py], [px + dir * 5 * s, py - 2 * s], [px + dir * 7 * s, py + 4 * s], [px + dir * 2 * s, py + 6 * s]], true, rnd, 0.5); g.fill(); g.stroke();
        }
      }
      g.fillStyle = '#8a9a55'; ink(g, 1.2); hellipse(g, x, y - 15 * s, 9 * s, 4 * s, rnd, 0.6); g.fill(); g.stroke();
    } else {
      pot(g, x, y, 15 * s, 12 * s, rnd, '#f2cc8f');
      g.fillStyle = '#d98a5a'; for (let i = 0; i < 3; i++) g.fillRect(x - 7 * s + i * 5 * s, y - 9 * s, 2 * s, 7 * s);
      g.fillStyle = '#6b7a3e'; ink(g, 1.3);
      hrect(g, x - 5 * s, y - 30 * s, 10 * s, 20 * s, 5 * s, rnd); g.fill(); g.stroke();
      hrect(g, x - 11 * s, y - 25 * s, 6 * s, 9 * s, 3 * s, rnd); g.fill(); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x - 4 * s + i * 2.6 * s, y - 27 * s); g.lineTo(x - 4 * s + i * 2.6 * s, y - 14 * s); g.stroke(); }
      g.fillStyle = '#f19aa8'; ink(g, 1); for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; g.beginPath(); g.ellipse(x + Math.cos(a) * 2.5 * s, y - 31 * s + Math.sin(a) * 2.5 * s, 2 * s, 1.4 * s, a, 0, 7); g.fill(); }
      g.fillStyle = '#f4c542'; g.beginPath(); g.arc(x, y - 31 * s, 1.3 * s, 0, 7); g.fill();
    }
  }
  // Стопка кружек разных цветов, чуть покосившаяся
  function propCups(g, x, y, s, rnd) {
    const cols = ['#f3e3c8', '#d98a5a', '#8a7a9a', '#e9c48a', '#b07a8a'];
    const n = 3 + (rnd() * 2 | 0);
    for (let i = 0; i < n; i++) {
      const cy = y - (i + 1) * 8 * s, dx = (i - n / 2) * 0.8 * s;
      const col = cols[(rnd() * cols.length) | 0];
      g.fillStyle = col; ink(g, 1.4);
      hpath(g, [[x + 2 * s + dx, cy], [x + 22 * s + dx, cy], [x + 19.5 * s + dx, cy + 8 * s], [x + 4.5 * s + dx, cy + 8 * s]], true, rnd, 0.6); g.fill(); g.stroke();
      if (rnd() < 0.5) { g.fillStyle = shade(col, -0.25); g.fillRect(x + 4 * s + dx, cy + 3 * s, 16 * s, 1.6 * s); }
      g.beginPath(); g.arc(x + 23 * s + dx, cy + 4 * s, 2.6 * s, -Math.PI / 2, Math.PI / 2); g.stroke();
    }
  }
  // Книги рецептов, прислонённые друг к другу
  function propBooks(g, x, y, s, rnd) {
    const cols = ['#b85c5c', '#6b5a7a', '#4a3450', '#d9a25a'];
    let bx = x;
    for (let i = 0; i < 3; i++) {
      const w = (5 + rnd() * 3) * s, h = (20 + rnd() * 8) * s, lean = i === 2 ? -0.18 : 0;
      g.save(); g.translate(bx + w / 2, y); g.rotate(lean);
      g.fillStyle = cols[(rnd() * cols.length) | 0]; ink(g, 1.3);
      hrect(g, -w / 2, -h, w, h, 1, rnd, 0.5); g.fill(); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -h + 4 * s); g.lineTo(0, -h + 9 * s); g.stroke();
      g.restore(); bx += w + 1;
    }
  }
  // Радиоприёмник
  function propRadio(g, x, y, s, rnd) {
    const w = 30 * s, h = 18 * s;
    g.fillStyle = '#e9c48a'; ink(g, 1.5); hrect(g, x, y - h, w, h, 4 * s, rnd); g.fill(); g.stroke();
    g.fillStyle = '#3a2434'; hrect(g, x + 3 * s, y - h + 4 * s, w * 0.45, h - 8 * s, 2 * s, rnd, 0.4); g.fill();
    g.strokeStyle = '#f2cc8f'; g.lineWidth = 1; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x + 5 * s, y - h + 6 * s + i * 2.5 * s); g.lineTo(x + 3 * s + w * 0.45 - 2 * s, y - h + 6 * s + i * 2.5 * s); g.stroke(); }
    ink(g, 1.3); g.fillStyle = '#fff6e6'; g.beginPath(); g.arc(x + w * 0.74, y - h / 2, 4 * s, 0, 7); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(x + w * 0.74, y - h / 2); g.lineTo(x + w * 0.74 + 2.5 * s, y - h / 2 - 2 * s); g.stroke();
    g.beginPath(); g.moveTo(x + w * 0.85, y - h); g.lineTo(x + w * 0.95, y - h - 9 * s); g.stroke();
  }
  // Мешок зёрен
  function propSack(g, x, y, s, rnd) {
    g.fillStyle = '#c9a97a'; ink(g, 1.5);
    hpath(g, [[x - 13 * s, y], [x - 12 * s, y - 20 * s], [x - 8 * s, y - 27 * s], [x + 8 * s, y - 27 * s], [x + 12 * s, y - 20 * s], [x + 13 * s, y]], true, rnd, 1.2); g.fill(); g.stroke();
    g.strokeStyle = '#8a6a3a'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 9 * s, y - 24 * s); g.quadraticCurveTo(x, y - 21 * s, x + 9 * s, y - 24 * s); g.stroke();
    ink(g, 1.2); g.fillStyle = '#5a3422';
    for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(x - 6 * s + rnd() * 12 * s, y - 27 * s + rnd() * 3 * s, 1.8 * s, 1.2 * s, rnd() * 3, 0, 7); g.fill(); }
    g.fillStyle = '#c8372d'; hrect(g, x - 7 * s, y - 15 * s, 14 * s, 7 * s, 1, rnd, 0.4); g.fill(); g.stroke();
    g.strokeStyle = '#fff6e6'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 4 * s, y - 11.5 * s); g.lineTo(x + 4 * s, y - 11.5 * s); g.stroke();
  }
  // Настенные часы с настоящим временем
  function propClock(g, x, y, r, rnd) {
    g.save(); g.shadowColor = 'rgba(60,30,20,.3)'; g.shadowBlur = 8; g.shadowOffsetY = 4;
    g.fillStyle = '#c9a227'; ink(g, 1.6); hellipse(g, x, y, r, r, rnd, 0.7); g.fill(); g.restore(); g.stroke();
    g.fillStyle = '#fff8ee'; hellipse(g, x, y, r * 0.82, r * 0.82, rnd, 0.5); g.fill();
    g.fillStyle = INKC;
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; const big = i % 3 === 0; g.beginPath(); g.arc(x + Math.cos(a) * r * 0.66, y + Math.sin(a) * r * 0.66, big ? r * 0.07 : r * 0.04, 0, 7); g.fill(); }
    L.clock = { x, y, r }; // стрелки рисуются каждый кадр
  }
  // Постер в рамке на верёвочке: 0 — «CAFFÈ» с чашкой, 1 — акварель Джины, 2 — звёздная карта Сала
  function propFrame(g, x, y, w, rnd, kind) {
    const h = w * 1.25;
    ink(g, 1.3); g.beginPath(); g.moveTo(x + w * 0.15, y); g.lineTo(x + w / 2, y - w * 0.22); g.lineTo(x + w * 0.85, y); g.stroke();
    g.fillStyle = INKC; g.beginPath(); g.arc(x + w / 2, y - w * 0.22, 1.6, 0, 7); g.fill();
    g.fillStyle = kind === 2 ? '#5a3a2a' : '#c9a227'; ink(g, 1.6); hrect(g, x, y, w, h, 2, rnd, 0.8); g.fill(); g.stroke();
    const ix = x + w * 0.1, iy = y + w * 0.1, iw = w * 0.8, ih = h - w * 0.2;
    if (kind === 0) {
      g.fillStyle = '#f4e1c8'; g.fillRect(ix, iy, iw, ih);
      g.fillStyle = '#c8372d'; g.fillRect(ix, iy + ih * 0.72, iw, ih * 0.28);
      g.fillStyle = '#fff6e6'; g.font = `900 ${iw * 0.22}px Nunito, ui-rounded, system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('CAFFÈ', ix + iw / 2, iy + ih * 0.86);
      g.fillStyle = '#3b2a22'; ink(g, 1.2);
      hpath(g, [[ix + iw * 0.25, iy + ih * 0.3], [ix + iw * 0.7, iy + ih * 0.3], [ix + iw * 0.62, iy + ih * 0.62], [ix + iw * 0.33, iy + ih * 0.62]], true, rnd, 0.5); g.fill();
      g.beginPath(); g.arc(ix + iw * 0.74, iy + ih * 0.42, iw * 0.08, -Math.PI / 2, Math.PI / 2); g.stroke();
      g.strokeStyle = '#3b2a22'; g.lineWidth = 1.2; for (let i = 0; i < 2; i++) { g.beginPath(); g.moveTo(ix + iw * (0.4 + i * 0.15), iy + ih * 0.24); g.quadraticCurveTo(ix + iw * (0.35 + i * 0.15), iy + ih * 0.17, ix + iw * (0.42 + i * 0.15), iy + ih * 0.1); g.stroke(); }
    } else if (kind === 1) {
      g.fillStyle = '#bfe3f5'; g.fillRect(ix, iy, iw, ih);
      g.fillStyle = '#8a7a9a'; g.beginPath(); g.moveTo(ix, iy + ih); g.quadraticCurveTo(ix + iw * 0.4, iy + ih * 0.45, ix + iw, iy + ih); g.fill();
      g.fillStyle = '#f4c542'; g.beginPath(); g.arc(ix + iw * 0.72, iy + ih * 0.3, iw * 0.1, 0, 7); g.fill();
      g.fillStyle = '#c8372d'; g.fillRect(ix + iw * 0.2, iy + ih * 0.55, iw * 0.3, ih * 0.25);
    } else {
      g.fillStyle = '#26305a'; g.fillRect(ix, iy, iw, ih);
      g.fillStyle = '#fff'; for (let i = 0; i < 14; i++) g.fillRect(ix + 2 + rnd() * (iw - 4), iy + 2 + rnd() * (ih - 4), 1.5, 1.5);
      g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(ix + iw * 0.2, iy + ih * 0.3); g.lineTo(ix + iw * 0.5, iy + ih * 0.5); g.lineTo(ix + iw * 0.75, iy + ih * 0.35); g.stroke();
      g.fillStyle = '#e07a5f'; g.beginPath(); g.arc(ix + iw * 0.5, iy + ih * 0.5, iw * 0.08, 0, 7); g.fill();
    }
  }
  // Шаль от Розы на крючке
  function propShawl(g, x, y, rnd) {
    g.fillStyle = INKC; g.beginPath(); g.arc(x, y, 2.5, 0, 7); g.fill();
    g.fillStyle = '#b5556a'; ink(g, 1.4);
    hpath(g, [[x - 7, y + 2], [x + 7, y + 2], [x + 9, y + 30], [x + 4, y + 48], [x - 4, y + 48], [x - 9, y + 30]], true, rnd, 1); g.fill(); g.stroke();
    g.fillStyle = '#f2cc8f'; for (let i = 0; i < 4; i++) g.fillRect(x - 7 + i * 0.3, y + 8 + i * 10, 14 - i * 0.6, 2.5);
    g.strokeStyle = '#b5556a'; g.lineWidth = 1.2; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(x - 4 + i * 2, y + 48); g.lineTo(x - 5 + i * 2.2, y + 54); g.stroke(); }
  }
  // Кассовый аппарат (латунь, кнопки, чековая лента)
  function propRegister(g, x, y, s, rnd) {
    const w = 42 * s, h = 36 * s;
    g.fillStyle = '#b8902a'; ink(g, 1.6);
    hpath(g, [[x, y], [x, y - h * 0.55], [x + w * 0.15, y - h * 0.62], [x + w * 0.2, y - h * 0.95], [x + w * 0.8, y - h * 0.95], [x + w * 0.85, y - h * 0.62], [x + w, y - h * 0.55], [x + w, y]], true, rnd, 0.9); g.fill(); g.stroke();
    g.fillStyle = '#d9b64a'; hrect(g, x + w * 0.1, y - h * 0.5, w * 0.8, h * 0.42, 2, rnd, 0.5); g.fill();
    g.fillStyle = '#fff8ee'; for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { g.beginPath(); g.arc(x + w * 0.22 + c * w * 0.19, y - h * 0.42 + r * h * 0.12, 2 * s, 0, 7); g.fill(); g.stroke(); }
    g.fillStyle = '#2b2430'; hrect(g, x + w * 0.28, y - h * 0.88, w * 0.44, h * 0.2, 1.5, rnd, 0.4); g.fill(); g.stroke();
    g.fillStyle = '#c2c47a'; g.font = `700 ${h * 0.14}px Nunito, ui-rounded, system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(fmt(S.coins), x + w / 2, y - h * 0.78);
    g.fillStyle = '#fff8ee'; hrect(g, x + w * 0.62, y - h * 1.18, w * 0.22, h * 0.26, 1, rnd, 0.6); g.fill(); g.stroke();
    g.strokeStyle = '#bfb8ad'; g.lineWidth = 1; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x + w * 0.66, y - h * 1.12 + i * 3 * s); g.lineTo(x + w * 0.8, y - h * 1.12 + i * 3 * s); g.stroke(); }
    ink(g, 1.3); g.beginPath(); g.moveTo(x + w, y - h * 0.5); g.quadraticCurveTo(x + w * 1.18, y - h * 0.5, x + w * 1.15, y - h * 0.22); g.stroke();
    g.fillStyle = INKC; g.beginPath(); g.arc(x + w * 1.15, y - h * 0.2, 2.4 * s, 0, 7); g.fill();
  }
  // Витрина: стеклянный колпак на подставке с канноли, круассаном и бискотти
  function propPastry(g, x, y, s, rnd, n) {
    const w = 58 * s, h = 36 * s;
    ink(g, 1.5); g.fillStyle = '#fff8ee';
    hellipse(g, x + w / 2, y - 3 * s, w * 0.56, 4 * s, rnd, 0.6); g.fill(); g.stroke();
    g.fillStyle = '#d5dee3'; hrect(g, x + w * 0.44, y - 7 * s, w * 0.12, 5 * s, 1, rnd, 0.4); g.fill(); g.stroke();
    const py = y - 8 * s;
    const items = ['cannolo', 'croissant', 'biscotti', 'cannolo'];
    for (let i = 0; i < Math.min(n, 4); i++) {
      const ix = x + w * 0.18 + i * w * 0.2, kind = items[i];
      if (kind === 'cannolo') {
        g.fillStyle = '#e8a64a'; ink(g, 1.3); hrect(g, ix - 7 * s, py - 7 * s, 14 * s, 7 * s, 3.5 * s, rnd, 0.6); g.fill(); g.stroke();
        g.fillStyle = '#fff6e6'; for (const e of [-1, 1]) { g.beginPath(); g.arc(ix + e * 7 * s, py - 3.5 * s, 2.6 * s, 0, 7); g.fill(); g.stroke(); }
        g.fillStyle = '#5a3422'; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(ix - 5 * s + k * 5 * s, py - 4 * s + (k % 2) * 1.5 * s, 0.8 * s, 0, 7); g.fill(); }
      } else if (kind === 'croissant') {
        g.fillStyle = '#e8a64a'; ink(g, 1.3);
        hpath(g, [[ix - 8 * s, py - 2 * s], [ix - 5 * s, py - 8 * s], [ix, py - 9 * s], [ix + 5 * s, py - 8 * s], [ix + 8 * s, py - 2 * s], [ix + 5 * s, py], [ix - 5 * s, py]], true, rnd, 0.6); g.fill(); g.stroke();
        g.strokeStyle = '#b5702a'; g.lineWidth = 1; for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(ix + k * 3 * s, py - 8 * s); g.lineTo(ix + k * 4.5 * s, py - 1 * s); g.stroke(); }
      } else {
        g.fillStyle = '#d9a86a'; ink(g, 1.2);
        for (let k = 0; k < 3; k++) { g.save(); g.translate(ix + (k - 1) * 3 * s, py - 1 * s); g.rotate(-0.9); hrect(g, -2 * s, -7 * s, 4 * s, 14 * s, 1.5 * s, rnd, 0.4); g.fill(); g.stroke(); g.restore(); }
      }
    }
    g.fillStyle = 'rgba(215,240,250,.35)'; ink(g, 1.5);
    hpath(g, [[x + 2 * s, py + 1 * s], [x + 2 * s, py - h * 0.45], [x + w * 0.2, py - h * 0.9], [x + w * 0.8, py - h * 0.9], [x + w - 2 * s, py - h * 0.45], [x + w - 2 * s, py + 1 * s]], true, rnd, 0.6); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 7 * s, py - h * 0.3); g.lineTo(x + 7 * s, py - h * 0.5); g.quadraticCurveTo(x + 9 * s, py - h * 0.72, x + w * 0.25, py - h * 0.8); g.stroke();
    g.fillStyle = '#c9a227'; ink(g, 1.3); g.beginPath(); g.arc(x + w / 2, py - h * 0.92, 2.5 * s, 0, 7); g.fill(); g.stroke();
  }
  // Банка для чаевых с монетами и надписью от руки
  function propTipJar(g, x, y, s, rnd, fill) {
    const w = 26 * s, h = 32 * s;
    g.fillStyle = 'rgba(230,245,250,.65)'; ink(g, 1.5); hrect(g, x, y - h, w, h, 6 * s, rnd); g.fill();
    g.fillStyle = '#f4c542';
    for (let i = 0; i < Math.round(fill * 14); i++) { g.beginPath(); g.ellipse(x + 4 + rnd() * (w - 8), y - 3 - (i * 1.9 * s), 4 * s, 1.6 * s, (rnd() - 0.5) * 0.8, 0, 7); g.fill(); g.strokeStyle = '#c99a16'; g.lineWidth = 0.8; g.stroke(); }
    ink(g, 1.5); hrect(g, x, y - h, w, h, 6 * s, rnd); g.stroke();
    g.fillStyle = '#d5dee3'; hrect(g, x - 1, y - h - 3 * s, w + 2, 4 * s, 1.5, rnd, 0.5); g.fill(); g.stroke();
    g.fillStyle = '#fff6e6'; hrect(g, x + 3 * s, y - h * 0.72, w - 6 * s, 8 * s, 1, rnd, 0.5); g.fill(); g.stroke();
    g.fillStyle = INKC; g.font = `900 ${4.4 * s}px Nunito, ui-rounded, system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('GRAZIE', x + w / 2, y - h * 0.72 + 4 * s);
  }
  // Табличка OPEN на верёвочке в окне
  function propOpenSign(g, x, y, s, rnd) {
    ink(g, 1.2); g.beginPath(); g.moveTo(x - 12 * s, y); g.lineTo(x - 9 * s, y + 10 * s); g.moveTo(x + 12 * s, y); g.lineTo(x + 9 * s, y + 10 * s); g.stroke();
    g.fillStyle = '#b85c5c'; ink(g, 1.4); hrect(g, x - 15 * s, y + 10 * s, 30 * s, 13 * s, 2, rnd, 0.6); g.fill(); g.stroke();
    g.fillStyle = '#fff6e6'; g.font = `900 ${8 * s}px Nunito, ui-rounded, system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('OPEN', x, y + 16.8 * s);
  }
  // Кронштейн полки
  function bracket(g, x, y, s, rnd) {
    g.fillStyle = '#6a4a4a'; ink(g, 1.3);
    hpath(g, [[x, y], [x + 10 * s, y], [x, y + 11 * s]], true, rnd, 0.5); g.fill(); g.stroke();
  }

  // ---------- фон ----------
  // Сам фон нарисован художником (img/bg-*.png); кодом дописывается только меню мелом на доске.
  function buildBg() {
    const [c, g] = makeLayer();
    const b = L.board;
    bg = c;
    if (b.y < safeTop + 54) return; // доска ушла под панель со счётом (телефон в смене) — текст не рисуем
    const pad = Math.max(6, b.w * 0.05);
    g.fillStyle = '#f0e8da'; g.textAlign = 'center'; g.textBaseline = 'top';
    const fs = clamp(b.w / 9, 10, 20);
    g.font = `900 ${fs}px Nunito, ui-rounded, system-ui, sans-serif`;
    g.fillText(LANG === 'en' ? 'MENU' : 'МЕНЮ', b.x + b.w / 2, b.y + pad);
    g.strokeStyle = 'rgba(240,232,218,.8)'; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(b.x + b.w * 0.3, b.y + pad + fs * 1.25); g.quadraticCurveTo(b.x + b.w * 0.5, b.y + pad + fs * 1.05, b.x + b.w * 0.7, b.y + pad + fs * 1.25); g.stroke();
    const rec = S.recipes.slice(-4).reverse();
    const lineH = Math.min(fs * 0.95, (b.h - pad * 2 - fs * 1.7) / 4);
    rec.forEach((id, i) => {
      const y = b.y + pad + fs * 1.55 + i * lineH;
      if (y + lineH > b.y + b.h - pad * 0.5) return;
      const price = String(Math.round(RECIPE[id].price * Stats.priceMult()));
      const fsz = fs * 0.7;
      g.font = `700 ${fsz}px Nunito, ui-rounded, system-ui, sans-serif`;
      g.fillStyle = '#f0e8da';
      g.textAlign = 'right'; g.fillText(price, b.x + b.w - pad, y);
      const pw = g.measureText(price).width;
      const room = b.w - pad * 2 - pw - 8;
      let nsz = fsz;
      while (nsz > 7 && (g.font = `700 ${nsz}px Nunito, ui-rounded, system-ui, sans-serif`, g.measureText(T(RECIPE[id].name)).width > room)) nsz -= 0.5;
      g.textAlign = 'left'; g.fillText(T(RECIPE[id].name), b.x + pad, y);
      const nw = g.measureText(T(RECIPE[id].name)).width;
      g.fillStyle = 'rgba(240,232,218,.4)';
      for (let dx = b.x + pad + nw + 4; dx < b.x + b.w - pad - pw - 4; dx += 4) g.fillRect(dx, y + fsz * 0.75, 1.5, 1.5);
    });
  }
  function buildCounter() { counter = true; } // стойка — часть нарисованного фона

  // ---------- время суток ----------
  // Смена — это целый день: рассвет, утро, полдень, золотой час, сумерки, ночь. Палитра — закатный lo-fi.
  const SKY = [
    [0, '#c98ba8', '#f7d9b0'], [0.18, '#9fb8d8', '#f3e3c8'], [0.45, '#8fb0d6', '#fbe9cf'],
    [0.66, '#e9a07a', '#ffd99a'], [0.82, '#8a5a8a', '#e8a07c'], [1, '#2d2140', '#5a3d66'],
  ];
  function skyAt(p) {
    for (let i = 0; i < SKY.length - 1; i++) {
      const a = SKY[i], b = SKY[i + 1];
      if (p <= b[0]) { const t = (p - a[0]) / (b[0] - a[0]); return [mix(a[1], b[1], t), mix(a[2], b[2], t)]; }
    }
    return [SKY[SKY.length - 1][1], SKY[SKY.length - 1][2]];
  }
  // Оттенок освещения комнаты: [момент, цвет, сила]
  const LIGHT = [[0, '#f0c4c0', 0.26], [0.2, '#ffffff', 0], [0.5, '#ffffff', 0], [0.7, '#f2b07a', 0.3], [0.85, '#7a66a0', 0.5], [1, '#5a4a8a', 0.58]];
  function lightAt(p) {
    for (let i = 0; i < LIGHT.length - 1; i++) {
      const a = LIGHT[i], b = LIGHT[i + 1];
      if (p <= b[0]) { const t = (p - a[0]) / (b[0] - a[0]); return [mix(a[1], b[1], t), lerp(a[2], b[2], t)]; }
    }
    return [LIGHT[LIGHT.length - 1][1], LIGHT[LIGHT.length - 1][2]];
  }
  const darkAt = (p) => clamp((p - 0.62) / 0.3, 0, 1);
  const sunAt = (p) => clamp(Math.sin(clamp((p - 0.05) / 0.6, 0, 1) * Math.PI), 0, 1);

  // Силуэт ряда домов (случайные ширины и высоты по сиду)
  function skyline(seed, x0, x1, base, hMin, hMax, color, lit, winCol) {
    const r = seeded(seed);
    ctx.fillStyle = color;
    let x = x0;
    while (x < x1) {
      const bw = 14 + r() * 26, bh = hMin + r() * (hMax - hMin);
      ctx.fillRect(x, base - bh, bw - 2, bh);
      if (r() < 0.3) ctx.fillRect(x + bw * 0.3, base - bh - 6, bw * 0.3, 6); // надстройка
      if (lit > 0) {
        ctx.fillStyle = winCol;
        for (let wy = base - bh + 6; wy < base - 6; wy += 9) for (let wx = x + 3; wx < x + bw - 6; wx += 7) if (r() < 0.45 * lit) ctx.fillRect(wx, wy, 3, 4);
        ctx.fillStyle = color;
      } else for (let k = 0; k < 6; k++) r();
      x += bw;
    }
  }

  function drawSky(p) {
    const w = L.win;
    const [top, bot] = skyAt(p);
    const gr = ctx.createLinearGradient(0, w.y, 0, w.y + w.h * 0.7);
    gr.addColorStop(0, top); gr.addColorStop(1, bot);
    ctx.fillStyle = gr; ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.save(); ctx.beginPath(); ctx.rect(w.x, w.y, w.w, w.h); ctx.clip();
    const dark = darkAt(p);
    const lit = clamp((p - 0.55) / 0.25, 0, 1);
    const horizon = w.y + w.h * 0.62;
    // солнце большое и мягкое, ночью — луна
    const r = w.h * 0.17;
    let sunX = w.x + w.w * 0.5, sunY = horizon;
    if (p < 0.8) {
      const k = p / 0.8;
      sunX = w.x + w.w * lerp(0.2, 0.78, k); sunY = horizon + r * 0.3 - Math.sin(k * Math.PI) * w.h * 0.42;
      const halo = ctx.createRadialGradient(sunX, sunY, r * 0.6, sunX, sunY, r * 3.2);
      halo.addColorStop(0, 'rgba(255,230,170,.55)'); halo.addColorStop(1, 'rgba(255,230,170,0)');
      ctx.fillStyle = halo; ctx.fillRect(sunX - r * 3.2, sunY - r * 3.2, r * 6.4, r * 6.4);
      ctx.fillStyle = p > 0.6 ? '#ffe29a' : '#fff1c4';
      ctx.beginPath(); ctx.arc(sunX, sunY, r, 0, 7); ctx.fill();
    }
    if (p > 0.74) {
      const k = clamp((p - 0.74) / 0.2, 0, 1);
      const mx = w.x + w.w * lerp(0.9, 0.72, k), my = w.y + w.h * lerp(0.5, 0.16, k);
      ctx.fillStyle = `rgba(250,236,200,${k})`; ctx.beginPath(); ctx.arc(mx, my, r * 0.55, 0, 7); ctx.fill();
      ctx.fillStyle = skyAt(p)[0]; ctx.beginPath(); ctx.arc(mx + r * 0.3, my - r * 0.2, r * 0.45, 0, 7); ctx.fill();
      sunX = mx; sunY = my;
    }
    // плоские полосы облаков
    ctx.fillStyle = p < 0.18 ? 'rgba(255,214,214,.75)' : p > 0.6 ? `rgba(255,190,150,${0.7 - dark * 0.55})` : 'rgba(255,255,255,.7)';
    for (let i = 0; i < 4; i++) {
      const cw = w.w * (0.18 + (i % 3) * 0.1), cx = w.x + ((time * (3 + i) + i * w.w * 0.37) % (w.w + cw)) - cw, cy = w.y + w.h * (0.1 + i * 0.1);
      rr(ctx, cx, cy, cw, 5 + (i % 2) * 2, 3); ctx.fill();
      rr(ctx, cx + cw * 0.2, cy - 5, cw * 0.5, 5, 3); ctx.fill();
    }
    if (dark > 0.3) {
      const sr = seeded(11);
      for (let i = 0; i < 24; i++) { const tw = 0.5 + 0.5 * Math.sin(time * 2 + i); ctx.fillStyle = `rgba(255,255,255,${(dark - 0.3) * tw})`; ctx.fillRect(w.x + sr() * w.w, w.y + sr() * w.h * 0.45, 1.5, 1.5); }
    }
    // город в три плана: дальний светлее, ближний темнее, окна зажигаются к вечеру
    const far = mix(bot, '#6a4a6e', 0.55 + dark * 0.3), mid = mix('#7a5272', '#2e2040', dark), near = mix('#4a3050', '#201528', dark);
    skyline(31, w.x - 20, w.x + w.w + 20, horizon + 2, w.h * 0.14, w.h * 0.42, far, 0, '');
    skyline(37, w.x - 20, w.x + w.w + 20, horizon + 8, w.h * 0.08, w.h * 0.26, mid, lit * 0.6, 'rgba(255,214,120,.8)');
    // река с отражением заката
    const ry0 = horizon + 8, ry1 = w.y + w.h * 0.86;
    const rg = ctx.createLinearGradient(0, ry0, 0, ry1);
    rg.addColorStop(0, mix(bot, '#7a5a7a', 0.35 + dark * 0.4)); rg.addColorStop(1, mix('#5a3f5e', '#241a30', dark));
    ctx.fillStyle = rg; ctx.fillRect(w.x, ry0, w.w, ry1 - ry0);
    const refl = p < 0.8 ? (p > 0.6 ? 'rgba(255,220,150,' : 'rgba(255,245,210,') : 'rgba(250,236,200,';
    for (let i = 0; i < 7; i++) {
      const yy = ry0 + 4 + i * ((ry1 - ry0) / 7), wv = Math.sin(time * 1.5 + i) * 4;
      const ww2 = r * (1.6 - i * 0.12) + wv;
      ctx.fillStyle = refl + (0.35 - i * 0.04) + ')'; ctx.fillRect(sunX - ww2 / 2 + wv, yy, ww2, 2.2);
    }
    // мост через реку
    ctx.strokeStyle = near; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(w.x, ry0 + 10); ctx.lineTo(w.x + w.w, ry0 + 10); ctx.stroke();
    for (let x = w.x + 8; x < w.x + w.w; x += 26) { ctx.beginPath(); ctx.arc(x + 11, ry0 + 10, 10, Math.PI, 0); ctx.stroke(); }
    // ближний берег: тёмные деревья и кусты с россыпью листьев
    const br = seeded(43);
    const bushCol = mix('#5a6a3a', '#1f2a1e', dark), leafCol = mix('#d98a5a', '#4a3040', dark);
    for (let x = w.x - 10; x < w.x + w.w + 10; x += 22) {
      const bh = w.h * (0.12 + br() * 0.14);
      ctx.fillStyle = br() < 0.5 ? bushCol : shade(bushCol, -0.18);
      ctx.beginPath(); ctx.ellipse(x + 11, w.y + w.h - bh * 0.4, 18, bh, 0, 0, 7); ctx.fill();
      ctx.fillStyle = leafCol;
      for (let k = 0; k < 4; k++) if (br() < 0.7) ctx.fillRect(x + br() * 22, w.y + w.h - bh * 0.9 + br() * bh, 2.5, 2);
    }
    skyline(41, w.x - 10, w.x + w.w * 0.32, w.y + w.h * 0.72, w.h * 0.1, w.h * 0.22, near, lit, 'rgba(255,214,120,.9)');
    skyline(47, w.x + w.w * 0.72, w.x + w.w + 10, w.y + w.h * 0.74, w.h * 0.1, w.h * 0.2, near, lit, 'rgba(255,214,120,.9)');
    // опадающие листья
    const lr = seeded(53);
    for (let i = 0; i < 9; i++) {
      const sx = w.x + lr() * w.w, sp = 8 + lr() * 10, ph = lr() * 6, col = ['#d98a5a', '#9aa35a', '#b8703f', '#c9a05a'][(lr() * 4) | 0];
      const yy = w.y + ((time * sp + ph * 40) % (w.h + 20)) - 10, xx = sx + Math.sin(time * 1.3 + ph) * 12;
      ctx.save(); ctx.translate(xx, yy); ctx.rotate(time * 2 + ph);
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, 4, 2.2, 0, 0, 7); ctx.fill(); ctx.restore();
    }
    ctx.restore();
    return dark;
  }

  // Освещение комнаты: тёплый или синий оттенок поверх всего, лужицы света от ламп, луч солнца из окна
  function drawDaylight(p, dark) {
    const [col, a] = lightAt(p);
    const sun = sunAt(p);
    // луч солнца из окна на стену и стойку
    if (sun > 0.05) {
      const w = L.win;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const slant = lerp(-0.6, 0.6, clamp(p / 0.7, 0, 1)) * w.w;
      ctx.fillStyle = `rgba(255,236,190,${0.09 * sun})`;
      ctx.beginPath(); ctx.moveTo(w.x, w.y + w.h * 0.1); ctx.lineTo(w.x + w.w, w.y + w.h * 0.1);
      ctx.lineTo(w.x + w.w + slant + w.w * 0.5, L.counterTop + 60); ctx.lineTo(w.x + slant - w.w * 0.1, L.counterTop + 60); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    if (a > 0.01) {
      ctx.save(); ctx.globalCompositeOperation = 'multiply';
      const [r, g, b] = hex(col);
      ctx.fillStyle = `rgba(${r},${g},${b},${a})`; ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
    if (dark > 0.05) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const [x, ly] of L.lamps) {
        const flick = 1 + Math.sin(time * 7 + x) * 0.03;
        const gr = ctx.createRadialGradient(x, ly + 12, 6, x, ly + 12, H * 0.5);
        gr.addColorStop(0, `rgba(255,190,110,${0.28 * dark * flick})`); gr.addColorStop(0.5, `rgba(255,170,90,${0.1 * dark})`); gr.addColorStop(1, 'rgba(255,170,90,0)');
        ctx.fillStyle = gr; ctx.fillRect(x - H * 0.5, 0, H, H);
      }
      if (L.bulbs) for (const [bx, by] of L.bulbs) {
        const gr = ctx.createRadialGradient(bx, by, 1, bx, by, 11);
        gr.addColorStop(0, `rgba(255,220,150,${0.42 * dark})`); gr.addColorStop(1, 'rgba(255,220,150,0)');
        ctx.fillStyle = gr; ctx.fillRect(bx - 11, by - 11, 22, 22);
      }
      ctx.restore();
    }
  }

  // Стрелки настенных часов: во время смены идёт игровой день (7:00 → 22:00), в меню — настоящее время
  function drawClockHands(p, inShift) {
    const c = L.clock;
    if (!c) return;
    let hours;
    if (inShift) hours = 7 + p * 15;
    else { const d = new Date(); hours = d.getHours() + d.getMinutes() / 60; }
    const hA = ((hours % 12) / 12) * Math.PI * 2 - Math.PI / 2, mA = (hours % 1) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = INKC; ctx.lineCap = 'round';
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x + Math.cos(hA) * c.r * 0.42, c.y + Math.sin(hA) * c.r * 0.42); ctx.stroke();
    ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x + Math.cos(mA) * c.r * 0.62, c.y + Math.sin(mA) * c.r * 0.62); ctx.stroke();
    ctx.fillStyle = '#c8372d'; ctx.beginPath(); ctx.arc(c.x, c.y, c.r * 0.07, 0, 7); ctx.fill();
  }

  // Лампочки гирлянды: днём просто стекляшки, ночью горят
  function drawBulbs(dark) {
    if (!L.bulbs) return;
    for (const [bx, by] of L.bulbs) {
      ctx.fillStyle = dark > 0.2 ? '#ffe9a8' : 'rgba(255,245,220,.8)'; ctx.strokeStyle = INKC; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.ellipse(bx, by, 2.6, 3.6, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c9a227'; ctx.fillRect(bx - 1.8, by - 5.5, 3.6, 2.5);
    }
  }

  // Свеча на стойке — зажигается к вечеру
  function drawCandle(dark) {
    if (dark < 0.08) return;
    const s = clamp(H / 420, 0.6, 1.1);
    const x = L.mw ? L.mw + 26 * s : W * 0.5 + 40 * s, y = L.counterTop - 8;
    const k = clamp((dark - 0.08) / 0.3, 0, 1);
    const fl = 1 + Math.sin(time * 11) * 0.12 + Math.sin(time * 23) * 0.06;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createRadialGradient(x, y - 14 * s, 2, x, y - 14 * s, 60 * s);
    gr.addColorStop(0, `rgba(255,200,120,${0.35 * k * fl})`); gr.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = gr; ctx.fillRect(x - 60 * s, y - 74 * s, 120 * s, 120 * s);
    ctx.restore();
    ctx.fillStyle = 'rgba(230,245,250,.55)'; ctx.strokeStyle = INKC; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(x - 6 * s, y - 11 * s); ctx.lineTo(x + 6 * s, y - 11 * s); ctx.lineTo(x + 5 * s, y); ctx.lineTo(x - 5 * s, y); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff3d6'; ctx.fillRect(x - 3.5 * s, y - 9 * s, 7 * s, 8 * s);
    ctx.strokeStyle = INKC; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y - 9 * s); ctx.lineTo(x, y - 12 * s); ctx.stroke();
    ctx.fillStyle = `rgba(255,170,60,${k})`; ctx.beginPath(); ctx.ellipse(x, y - 15 * s * fl, 2.2 * s, 4 * s * fl, 0, 0, 7); ctx.fill();
    ctx.fillStyle = `rgba(255,240,180,${k})`; ctx.beginPath(); ctx.ellipse(x, y - 14 * s * fl, 1.1 * s, 2 * s, 0, 0, 7); ctx.fill();
  }

  // Бумажная зернистость поверх всей сцены — чтобы заливки не выглядели пластиковыми
  let grain = null;
  function buildGrain() {
    const n = 160, c = document.createElement('canvas'); c.width = n; c.height = n;
    const g = c.getContext('2d'); const img = g.createImageData(n, n); const d = img.data;
    const r = seeded(99);
    for (let i = 0; i < n * n; i++) { const v = 215 + r() * 40; d[i * 4] = v; d[i * 4 + 1] = v - 4; d[i * 4 + 2] = v - 10; d[i * 4 + 3] = 255; }
    g.putImageData(img, 0, 0);
    grain = ctx.createPattern(c, 'repeat');
  }
  function drawGrain() {
    if (!grain) buildGrain();
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.16;
    ctx.fillStyle = grain; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // ---------- ещё предметы ----------
  // Мягкая тень под предметом на полке
  function ao(g, cx, y, rx) {
    g.fillStyle = 'rgba(60,30,20,.16)'; g.beginPath(); g.ellipse(cx, y + 1, rx, rx * 0.22, 0, 0, 7); g.fill();
  }
  // Гейзерная кофеварка «мока» — восьмигранная, алюминиевая
  function propMoka(g, x, y, s, rnd) {
    const w = 18 * s, h = 30 * s;
    ao(g, x + w / 2, y, w * 0.7);
    ink(g, 1.6); g.fillStyle = '#d9dee2';
    hpath(g, [[x + 3 * s, y], [x + w - 3 * s, y], [x + w, y - h * 0.42], [x + w - 1.5 * s, y - h * 0.46], [x + w - 2.5 * s, y - h * 0.9], [x + w / 2, y - h], [x + 2.5 * s, y - h * 0.9], [x + 1.5 * s, y - h * 0.46], [x, y - h * 0.42]], true, rnd, 0.6); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1; for (const k of [0.3, 0.5, 0.7]) { g.beginPath(); g.moveTo(x + w * k, y - 2); g.lineTo(x + w * k + (k - 0.5) * 2 * s, y - h * 0.42); g.moveTo(x + w * k, y - h * 0.46); g.lineTo(x + w * k + (k - 0.5) * 1.5 * s, y - h * 0.9); g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x + 4 * s, y - h * 0.84); g.lineTo(x + 5 * s, y - h * 0.5); g.stroke();
    g.fillStyle = INKC; ink(g, 1.4); hrect(g, x + w - 1 * s, y - h * 0.82, 6 * s, 7 * s, 2 * s, rnd, 0.4); g.fill();
    g.fillStyle = INKC; g.beginPath(); g.arc(x + w / 2, y - h - 1.5 * s, 2 * s, 0, 7); g.fill();
    g.beginPath(); g.moveTo(x + 2 * s, y - h * 0.7); g.lineTo(x - 2 * s, y - h * 0.78); g.lineTo(x + 1.5 * s, y - h * 0.62); g.closePath(); g.fillStyle = '#d9dee2'; g.fill(); g.stroke();
  }
  // Ваза с тремя цветками
  function propVase(g, x, y, s, rnd) {
    ao(g, x, y, 9 * s);
    g.fillStyle = '#8a6a9a'; ink(g, 1.5);
    hpath(g, [[x - 4 * s, y - 20 * s], [x + 4 * s, y - 20 * s], [x + 7 * s, y - 12 * s], [x + 6 * s, y], [x - 6 * s, y], [x - 7 * s, y - 12 * s]], true, rnd, 0.6); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(x - 4 * s, y - 14 * s); g.lineTo(x - 3.5 * s, y - 4 * s); g.stroke();
    const flowers = [[-5, -34, '#d98a5a'], [1, -40, '#e9c48a'], [6, -32, '#d08a98']];
    for (const [dx, dy, col] of flowers) {
      g.strokeStyle = '#6b7a3e'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(x, y - 19 * s); g.quadraticCurveTo(x + dx * s * 0.5, y + dy * s * 0.6, x + dx * s, y + dy * s); g.stroke();
      g.fillStyle = '#8a9a55'; g.beginPath(); g.ellipse(x + dx * s * 0.6, y + dy * s * 0.6, 3 * s, 1.4 * s, dx > 0 ? -0.6 : 0.6, 0, 7); g.fill();
      g.fillStyle = col; ink(g, 1);
      for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; g.beginPath(); g.ellipse(x + dx * s + Math.cos(a) * 2.6 * s, y + dy * s + Math.sin(a) * 2.6 * s, 2.2 * s, 1.5 * s, a, 0, 7); g.fill(); g.stroke(); }
      g.fillStyle = '#f4c542'; g.beginPath(); g.arc(x + dx * s, y + dy * s, 1.4 * s, 0, 7); g.fill();
    }
  }
  // Старое фото в рамке: двое у кофейни, сепия
  function propPhoto(g, x, y, w, rnd) {
    const h = w * 0.8;
    g.save(); g.shadowColor = 'rgba(60,30,20,.3)'; g.shadowBlur = 6; g.shadowOffsetY = 3;
    g.fillStyle = '#5a3a2a'; ink(g, 1.5); hrect(g, x, y, w, h, 2, rnd, 0.7); g.fill(); g.restore(); g.stroke();
    g.fillStyle = '#e8d4b4'; g.fillRect(x + w * 0.1, y + h * 0.12, w * 0.8, h * 0.76);
    g.fillStyle = '#b89a78';
    for (const dx of [0.38, 0.62]) { g.beginPath(); g.arc(x + w * dx, y + h * 0.45, w * 0.08, 0, 7); g.fill(); g.beginPath(); g.ellipse(x + w * dx, y + h * 0.75, w * 0.12, h * 0.2, 0, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x + w * 0.1, y + h * 0.12, w * 0.8, h * 0.12);
  }
  // Пучок сухого эвкалипта вниз головой
  function propHerbs(g, x, y, s, rnd) {
    g.strokeStyle = '#8a6a3a'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 6 * s); g.stroke();
    for (const dir of [-1, 0, 1]) {
      g.strokeStyle = '#7a9a6a'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y + 6 * s); g.quadraticCurveTo(x + dir * 4 * s, y + 20 * s, x + dir * 7 * s, y + 34 * s); g.stroke();
      for (let i = 0; i < 5; i++) {
        const tt = 0.25 + i * 0.17, px = x + dir * 5 * s * tt + (i % 2 ? 3 : -3) * s, py = y + 6 * s + 28 * s * tt;
        g.fillStyle = i % 2 ? '#a9c4a0' : '#8fb08a'; g.strokeStyle = '#5f7a5a'; g.lineWidth = 0.9;
        g.beginPath(); g.ellipse(px, py, 3 * s, 2.2 * s, 0, 0, 7); g.fill(); g.stroke();
      }
    }
    g.fillStyle = '#c8372d'; g.beginPath(); g.ellipse(x, y + 7 * s, 3 * s, 2 * s, 0, 0, 7); g.fill();
  }

  function drawLamps(dark) {
    for (const [x, y] of L.lamps) {
      const glow = 0.16 + dark * 0.42 + Math.sin(time * 3 + x) * 0.02;
      const gr = ctx.createRadialGradient(x, y + 10, 4, x, y + 10, H * 0.35);
      gr.addColorStop(0, `rgba(255,214,140,${glow})`); gr.addColorStop(1, 'rgba(255,214,140,0)');
      ctx.fillStyle = gr; ctx.fillRect(x - H * 0.35, y - H * 0.35, H * 0.7, H * 0.7);
    }
  }

  // ---------- персонажи ----------
  // Плоская иллюстрация: ровные заливки без градиентов, одна тень справа, толстые брови,
  // разные формы голов, носов и телосложения, узоры на одежде, усы и морщинки.
  const SHADE = 'rgba(70, 35, 20, .14)';

  function headPath(c, look, x, hy, r) {
    c.beginPath();
    switch (look.head) {
      case 'oval': c.ellipse(x, hy, r * 0.92, r * 1.12, 0, 0, 7); break;
      case 'square': rr(c, x - r * 0.98, hy - r * 1.02, r * 1.96, r * 2.1, r * 0.55); break;
      case 'long': c.ellipse(x, hy + r * 0.04, r * 0.86, r * 1.2, 0, 0, 7); break;
      default: c.ellipse(x, hy, r, r * 1.03, 0, 0, 7);
    }
  }

  function drawPerson(c, look, x, hy, r, mood, blink, bottom) {
    const acc = look.acc || [];
    const lw = Math.max(1.3, r * 0.07);
    const line = (col, k = 1) => { c.strokeStyle = col; c.lineWidth = lw * k; };
    c.lineJoin = 'round'; c.lineCap = 'round';
    const skin = look.skin, skinD = shade(skin, -0.45);
    const hair = look.hair, hairD = shade(hair, -0.4);
    const shirt = look.shirt, shirtD = shade(shirt, -0.45), shirt2 = look.shirt2 || '#fff8ee';
    const outfit = look.outfit || 'tee', style = look.style, pattern = look.pattern || 'none';
    const build = look.build || 1, old = look.age === 'old';
    const headR = look.head === 'oval' || look.head === 'long' ? r * 0.9 : r;
    const sy = hy + r * (look.head === 'long' ? 1.0 : 0.88); // линия плеч
    const bw = r * 1.32 * build;
    const shadeRight = (pathFn, x0, w, y0, y1) => { c.save(); pathFn(); c.clip(); c.fillStyle = SHADE; c.fillRect(x0 + w * 0.28, y0, w, y1 - y0); c.restore(); };

    // ----- волосы сзади -----
    c.fillStyle = hair; line(hairD);
    if (style === 'long' || style === 'wavy') {
      c.beginPath(); c.moveTo(x - r * 1.08, hy - r * 0.3);
      c.quadraticCurveTo(x - r * 1.22, hy + r * 1.1, x - r * 0.95, hy + r * 1.55);
      if (style === 'wavy') for (let i = 0; i < 4; i++) c.quadraticCurveTo(x - r * 0.95 + (i + 0.5) * r * 0.475, hy + r * (i % 2 ? 1.4 : 1.75), x - r * 0.95 + (i + 1) * r * 0.475, hy + r * 1.55);
      else c.lineTo(x + r * 0.95, hy + r * 1.55);
      c.quadraticCurveTo(x + r * 1.22, hy + r * 1.1, x + r * 1.08, hy - r * 0.3);
      c.closePath(); c.fill(); c.stroke();
    }
    if (style === 'bob') { rr(c, x - r * 1.15, hy - r * 0.7, r * 2.3, r * 1.62, r * 0.75); c.fill(); c.stroke(); }
    if (style === 'big') {
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; c.beginPath(); c.arc(x + Math.cos(a) * r * 1.08, hy - r * 0.05 + Math.sin(a) * r * 1.12, r * 0.34, 0, 7); c.fill(); c.stroke(); }
      c.beginPath(); c.ellipse(x, hy - r * 0.05, r * 1.1, r * 1.15, 0, 0, 7); c.fill();
    }
    if (style === 'ponytail') { c.beginPath(); c.ellipse(x + r * 0.95, hy + r * 0.05, r * 0.3, r * 0.78, -0.35, 0, 7); c.fill(); c.stroke(); }
    if (style === 'bun') { c.beginPath(); c.arc(x, hy - r * 1.1, r * 0.4, 0, 7); c.fill(); c.stroke(); }

    // ----- капюшон -----
    if (outfit === 'hoodie') { c.fillStyle = shade(shirt, -0.12); line(shirtD); rr(c, x - r, sy - r * 0.32, r * 2, r * 0.8, r * 0.38); c.fill(); c.stroke(); }

    // ----- шея -----
    c.fillStyle = shade(skin, -0.1);
    c.fillRect(x - r * 0.26, hy + r * 0.6, r * 0.52, r * 0.55);

    // ----- тело -----
    const body = () => {
      c.beginPath();
      c.moveTo(x - bw, bottom + r); c.lineTo(x - bw, sy + r * 0.5);
      c.quadraticCurveTo(x - bw, sy, x - bw * 0.55, sy); c.lineTo(x + bw * 0.55, sy);
      c.quadraticCurveTo(x + bw, sy, x + bw, sy + r * 0.5); c.lineTo(x + bw, bottom + r); c.closePath();
    };
    const base = outfit === 'vest' ? shirt2 : shirt;
    body(); c.fillStyle = base; c.fill();
    c.save(); body(); c.clip();
    if (pattern === 'stripes' && outfit !== 'vest') { c.fillStyle = shirt2; for (let yy = sy + r * 0.35; yy < bottom + r; yy += r * 0.42) c.fillRect(x - bw, yy, bw * 2, r * 0.14); }
    if (pattern === 'dots' && outfit !== 'vest') { c.fillStyle = shirt2; for (let yy = sy + r * 0.3; yy < bottom + r; yy += r * 0.36) for (let xx = x - bw + r * 0.15; xx < x + bw; xx += r * 0.36) { c.beginPath(); c.arc(xx + ((yy / (r * 0.36)) % 2) * r * 0.18, yy, r * 0.05, 0, 7); c.fill(); } }
    if (pattern === 'check' && outfit !== 'vest') { c.strokeStyle = shade(shirt, -0.25); c.lineWidth = lw * 0.8; for (let yy = sy + r * 0.3; yy < bottom + r; yy += r * 0.4) { c.beginPath(); c.moveTo(x - bw, yy); c.lineTo(x + bw, yy); c.stroke(); } for (let xx = x - bw + r * 0.2; xx < x + bw; xx += r * 0.4) { c.beginPath(); c.moveTo(xx, sy); c.lineTo(xx, bottom + r); c.stroke(); } }
    if (outfit === 'sweater') { c.fillStyle = shade(shirt, -0.2); c.fillRect(x - bw, sy + r * 0.95, bw * 2, r * 0.12); c.fillRect(x - bw, sy + r * 1.25, bw * 2, r * 0.12); }
    if (outfit === 'cardigan') {
      c.fillStyle = shirt2; c.beginPath(); c.moveTo(x - r * 0.42, sy - 1); c.lineTo(x + r * 0.42, sy - 1); c.lineTo(x + r * 0.14, bottom + r); c.lineTo(x - r * 0.14, bottom + r); c.closePath(); c.fill();
      c.strokeStyle = shirtD; c.lineWidth = lw; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * r * 0.42, sy); c.lineTo(x + s * r * 0.14, bottom + r); c.stroke(); }
      c.fillStyle = shade(shirt, -0.35); for (let i = 0; i < 2; i++) { c.beginPath(); c.arc(x + r * 0.3 - i * r * 0.06, sy + r * 0.6 + i * r * 0.42, r * 0.055, 0, 7); c.fill(); }
    }
    if (outfit === 'vest') {
      c.fillStyle = shirt; line(shirtD);
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * bw, sy + r * 0.1); c.lineTo(x + s * r * 0.5, sy + r * 0.05); c.lineTo(x + s * r * 0.2, sy + r * 1.1); c.lineTo(x + s * r * 0.2, bottom + r); c.lineTo(x + s * bw, bottom + r); c.closePath(); c.fill(); c.stroke(); }
      c.fillStyle = shirtD; for (let i = 0; i < 2; i++) { c.beginPath(); c.arc(x + r * 0.26, sy + r * 1.2 + i * r * 0.32, r * 0.05, 0, 7); c.fill(); }
    }
    if (outfit === 'apron') {
      c.fillStyle = shirt2; line(shade(shirt2, -0.35));
      c.beginPath(); c.moveTo(x - r * 0.55, sy + r * 0.45); c.lineTo(x + r * 0.55, sy + r * 0.45); c.lineTo(x + bw * 0.8, bottom + r); c.lineTo(x - bw * 0.8, bottom + r); c.closePath(); c.fill(); c.stroke();
      c.lineWidth = lw * 1.2; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * r * 0.5, sy + r * 0.45); c.lineTo(x + s * r * 0.3, sy - r * 0.05); c.stroke(); }
      c.fillStyle = shade(shirt2, -0.15); c.fillRect(x - r * 0.3, sy + r * 0.9, r * 0.6, r * 0.5);
    }
    // руки вдоль тела
    c.strokeStyle = outfit === 'apron' || outfit === 'vest' ? shade(base, -0.3) : shade(shirt, -0.3); c.lineWidth = lw;
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * bw * 0.72, sy + r * 0.5); c.lineTo(x + s * bw * 0.76, bottom + r); c.stroke(); }
    c.restore();
    shadeRight(body, x - bw, bw * 2, sy, bottom + r);
    body(); line(outfit === 'vest' ? shade(shirt2, -0.4) : shirtD); c.stroke();

    // ворот
    if (outfit === 'tee' || outfit === 'sweater' || outfit === 'hoodie' || outfit === 'apron') {
      c.fillStyle = shade(skin, -0.1); c.beginPath(); c.arc(x, sy - 1, r * 0.36, 0, Math.PI); c.fill();
      c.strokeStyle = shade(shirt, -0.3); c.lineWidth = lw * (outfit === 'sweater' ? 2.2 : 1.5);
      c.beginPath(); c.arc(x, sy - 1, r * 0.38, 0.05 * Math.PI, 0.95 * Math.PI); c.stroke();
    }
    if (outfit === 'hoodie') { c.strokeStyle = shirt2; c.lineWidth = lw; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * r * 0.2, sy + r * 0.3); c.lineTo(x + s * r * 0.24, sy + r * 0.95); c.stroke(); } }
    if (outfit === 'collar' || outfit === 'vest') {
      c.fillStyle = shade(skin, -0.1); c.beginPath(); c.moveTo(x - r * 0.3, sy - 1); c.lineTo(x, sy + r * 0.45); c.lineTo(x + r * 0.3, sy - 1); c.closePath(); c.fill();
      const col = outfit === 'vest' ? shirt2 : shirt2; c.fillStyle = col; line(shade(col, -0.4));
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * r * 0.42, sy - r * 0.08); c.lineTo(x + s * r * 0.03, sy + r * 0.45); c.lineTo(x + s * r * 0.5, sy + r * 0.32); c.closePath(); c.fill(); c.stroke(); }
      if (outfit === 'collar') { c.fillStyle = shirtD; for (let i = 0; i < 2; i++) { c.beginPath(); c.arc(x, sy + r * 0.72 + i * r * 0.38, r * 0.05, 0, 7); c.fill(); } }
    }
    if (outfit === 'cardigan') { c.fillStyle = shade(skin, -0.1); c.beginPath(); c.arc(x, sy - 1, r * 0.3, 0, Math.PI); c.fill(); }
    if (outfit === 'turtleneck') { c.fillStyle = shade(shirt, -0.06); line(shirtD); rr(c, x - r * 0.44, hy + r * 0.6, r * 0.88, r * 0.55, r * 0.22); c.fill(); c.stroke(); }
    if (acc.includes('tie')) { c.fillStyle = '#c8372d'; line('#6b1c16'); c.beginPath(); c.moveTo(x - r * 0.1, sy + r * 0.4); c.lineTo(x + r * 0.1, sy + r * 0.4); c.lineTo(x + r * 0.16, sy + r * 1.4); c.lineTo(x, sy + r * 1.55); c.lineTo(x - r * 0.16, sy + r * 1.4); c.closePath(); c.fill(); c.stroke(); }
    if (acc.includes('bowtie')) { c.fillStyle = '#c8372d'; line('#6b1c16'); c.beginPath(); c.moveTo(x, sy + r * 0.42); c.lineTo(x - r * 0.4, sy + r * 0.22); c.lineTo(x - r * 0.4, sy + r * 0.62); c.closePath(); c.moveTo(x, sy + r * 0.42); c.lineTo(x + r * 0.4, sy + r * 0.22); c.lineTo(x + r * 0.4, sy + r * 0.62); c.closePath(); c.fill(); c.stroke(); }
    if (acc.includes('scarf')) {
      c.fillStyle = '#e9c46a'; line(shade('#e9c46a', -0.45));
      rr(c, x - r * 0.9, hy + r * 0.74, r * 1.8, r * 0.42, r * 0.2); c.fill(); c.stroke();
      rr(c, x + r * 0.22, hy + r * 0.98, r * 0.4, r * 0.95, r * 0.15); c.fill(); c.stroke();
      c.fillStyle = '#c8372d'; c.fillRect(x + r * 0.24, hy + r * 1.38, r * 0.36, r * 0.1); c.fillRect(x + r * 0.24, hy + r * 1.62, r * 0.36, r * 0.1);
    }

    // ----- уши -----
    c.fillStyle = skin; line(skinD);
    for (const s of [-1, 1]) {
      c.beginPath(); c.ellipse(x + s * headR * 0.98, hy + r * 0.12, r * 0.18, r * 0.24, 0, 0, 7); c.fill(); c.stroke();
      if (look.earring) { c.fillStyle = '#f4c542'; c.beginPath(); c.arc(x + s * headR * 1.0, hy + r * 0.4, r * 0.07, 0, 7); c.fill(); c.fillStyle = skin; }
    }

    // ----- голова -----
    const head = () => headPath(c, look, x, hy, r);
    head(); c.fillStyle = skin; c.fill();
    shadeRight(head, x - r, r * 2, hy - r * 1.3, hy + r * 1.3);
    head(); line(skinD); c.stroke();

    // ----- волосы спереди -----
    c.fillStyle = hair; line(hairD);
    const fringe = () => {
      c.beginPath();
      c.arc(x, hy, headR * 1.05, Math.PI + 0.12, -0.12);
      c.quadraticCurveTo(x + r * 0.78, hy - r * 0.3, x + r * 0.36, hy - r * 0.5);
      c.quadraticCurveTo(x - r * 0.02, hy - r * 0.26, x - r * 0.42, hy - r * 0.56);
      c.quadraticCurveTo(x - r * 0.86, hy - r * 0.36, x - headR * 1.02, hy - r * 0.12);
      c.closePath(); c.fill(); c.stroke();
    };
    switch (style) {
      case 'bald':
        for (const s of [-1, 1]) { c.beginPath(); c.ellipse(x + s * headR * 0.88, hy - r * 0.1, r * 0.2, r * 0.34, 0, 0, 7); c.fill(); c.stroke(); }
        break;
      case 'buzz':
        c.beginPath(); c.arc(x, hy, headR * 1.02, Math.PI + 0.2, -0.2); c.quadraticCurveTo(x, hy - r * 0.62, x - headR * 0.98, hy - r * 0.2); c.fill();
        break;
      case 'slick': {
        c.beginPath(); c.arc(x, hy, headR * 1.05, Math.PI + 0.1, -0.1); c.quadraticCurveTo(x, hy - r * 0.5, x - headR * 1.02, hy - r * 0.2); c.closePath(); c.fill(); c.stroke();
        c.strokeStyle = hairD; c.lineWidth = lw * 0.7;
        for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(x + i * r * 0.22, hy - r * 0.45); c.quadraticCurveTo(x + i * r * 0.26, hy - r * 0.85, x + i * r * 0.2, hy - r * 1.05); c.stroke(); }
        break;
      }
      case 'curly':
        for (let i = 0; i < 9; i++) { const a = Math.PI + 0.05 + (i / 8) * (Math.PI - 0.1); c.beginPath(); c.arc(x + Math.cos(a) * headR * 0.92, hy + Math.sin(a) * headR * 0.92, r * 0.32, 0, 7); c.fill(); c.stroke(); }
        c.beginPath(); c.arc(x, hy - r * 0.38, headR * 0.76, Math.PI, 0); c.fill();
        break;
      case 'big':
        fringe();
        for (let i = 0; i < 7; i++) { const a = Math.PI + 0.1 + (i / 6) * (Math.PI - 0.2); c.beginPath(); c.arc(x + Math.cos(a) * headR * 1.12, hy + Math.sin(a) * headR * 1.05, r * 0.3, 0, 7); c.fill(); c.stroke(); }
        break;
      case 'bob':
        c.beginPath(); c.arc(x, hy, headR * 1.07, Math.PI + 0.05, -0.05); c.lineTo(x + r * 0.9, hy - r * 0.3); c.lineTo(x - r * 0.9, hy - r * 0.3); c.closePath(); c.fill(); c.stroke();
        break;
      case 'wavy':
        fringe();
        for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * headR, hy - r * 0.2); c.quadraticCurveTo(x + s * r * 1.15, hy + r * 0.3, x + s * r * 0.95, hy + r * 0.7); c.lineTo(x + s * r * 0.82, hy + r * 0.1); c.closePath(); c.fill(); }
        break;
      case 'cap': {
        fringe(); const hat = look.hat || '#c8372d'; c.fillStyle = hat; line(shade(hat, -0.45));
        c.beginPath(); c.arc(x, hy - r * 0.2, headR * 1.03, Math.PI, 0); c.closePath(); c.fill(); c.stroke();
        c.beginPath(); c.ellipse(x + r * 0.85, hy - r * 0.22, r * 0.78, r * 0.18, 0, 0, 7); c.fill(); c.stroke();
        break;
      }
      case 'beanie': {
        const hat = look.hat || '#2f6b4f'; c.fillStyle = hat; line(shade(hat, -0.45));
        c.beginPath(); c.arc(x, hy - r * 0.25, headR * 1.03, Math.PI, 0); c.closePath(); c.fill(); c.stroke();
        rr(c, x - headR * 1.08, hy - r * 0.42, headR * 2.16, r * 0.38, r * 0.15); c.fill(); c.stroke();
        c.fillStyle = '#fff8ee'; c.beginPath(); c.arc(x, hy - r * 1.3, r * 0.26, 0, 7); c.fill(); c.stroke();
        break;
      }
      default: fringe();
    }
    if (acc.includes('flatcap')) {
      const hat = '#5a4a3c'; c.fillStyle = hat; line(shade(hat, -0.5));
      c.beginPath(); c.moveTo(x - headR * 1.1, hy - r * 0.3); c.quadraticCurveTo(x - r * 1.0, hy - r * 1.4, x + r * 0.2, hy - r * 1.32); c.quadraticCurveTo(x + r * 1.1, hy - r * 1.2, x + headR * 1.05, hy - r * 0.35); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = shade(hat, -0.25); c.lineWidth = lw * 0.7;
      for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(x + i * r * 0.35, hy - r * 0.35); c.lineTo(x + i * r * 0.25, hy - r * 1.25); c.stroke(); }
      c.fillStyle = shade(hat, -0.3); line(shade(hat, -0.5));
      c.beginPath(); c.ellipse(x + headR * 0.72, hy - r * 0.33, r * 0.62, r * 0.13, -0.08, 0, 7); c.fill(); c.stroke();
    }

    // ----- лицо -----
    const ey = hy + r * 0.1, ex = r * 0.36;
    // румянец и веснушки
    c.fillStyle = 'rgba(230,110,110,.22)';
    for (const s of [-1, 1]) { c.beginPath(); c.ellipse(x + s * r * 0.58, hy + r * 0.42, r * 0.17, r * 0.1, 0, 0, 7); c.fill(); }
    if (look.freckles) { c.fillStyle = shade(skin, -0.3); for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(x + s * (r * 0.48 + i * r * 0.1), hy + r * 0.32 + (i % 2) * r * 0.07, r * 0.025, 0, 7); c.fill(); } }
    // брови
    c.strokeStyle = style === 'bald' || style === 'buzz' ? shade(hair, -0.2) : hairD; c.lineWidth = r * (old ? 0.07 : 0.1); c.lineCap = 'round';
    for (const s of [-1, 1]) {
      const bx = x + s * ex, by = ey - r * 0.28;
      const tilt = mood === 'angry' ? r * 0.1 : mood === 'worried' ? -r * 0.08 : 0;
      c.beginPath(); c.moveTo(bx - s * r * 0.14, by + tilt); c.lineTo(bx + s * r * 0.14, by - tilt * 0.4); c.stroke();
    }
    // глаза
    if (mood === 'joy') {
      c.strokeStyle = '#2b1d16'; c.lineWidth = r * 0.085;
      for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * ex, ey + r * 0.06, r * 0.12, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
    } else {
      const eh = Math.max(0.6, r * (old ? 0.11 : 0.15) * blink);
      for (const s of [-1, 1]) {
        const cx = x + s * ex;
        c.fillStyle = '#2b1d16'; c.beginPath(); c.ellipse(cx, ey, r * (old ? 0.09 : 0.11), eh, 0, 0, 7); c.fill();
        if (blink > 0.5) { c.fillStyle = '#fff'; c.beginPath(); c.arc(cx + r * 0.035, ey - eh * 0.4, r * 0.035, 0, 7); c.fill(); }
        if (look.lash && blink > 0.5) { c.strokeStyle = '#2b1d16'; c.lineWidth = r * 0.05; c.beginPath(); c.moveTo(cx + s * r * 0.09, ey - eh * 0.6); c.lineTo(cx + s * r * 0.17, ey - eh * 0.95); c.stroke(); }
      }
    }
    if (old) { // морщинки
      c.strokeStyle = skinD; c.lineWidth = lw * 0.7;
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * r * 0.58, ey - r * 0.02); c.lineTo(x + s * r * 0.72, ey - r * 0.08); c.moveTo(x + s * r * 0.58, ey + r * 0.06); c.lineTo(x + s * r * 0.72, ey + r * 0.12); c.stroke(); }
      c.beginPath(); c.moveTo(x - r * 0.3, hy - r * 0.6); c.quadraticCurveTo(x, hy - r * 0.68, x + r * 0.3, hy - r * 0.6); c.stroke();
    }
    // нос
    c.strokeStyle = skinD; c.lineWidth = lw * 0.95;
    const ny = hy + r * 0.2;
    c.beginPath();
    switch (look.nose) {
      case 'small': c.arc(x + r * 0.02, ny + r * 0.1, r * 0.06, 0.2 * Math.PI, 0.9 * Math.PI); break;
      case 'long': c.moveTo(x + r * 0.02, ny - r * 0.08); c.lineTo(x + r * 0.1, ny + r * 0.28); c.quadraticCurveTo(x + r * 0.06, ny + r * 0.36, x - r * 0.06, ny + r * 0.32); break;
      case 'hook': c.moveTo(x, ny - r * 0.1); c.quadraticCurveTo(x + r * 0.22, ny + r * 0.05, x + r * 0.12, ny + r * 0.3); c.quadraticCurveTo(x + r * 0.04, ny + r * 0.38, x - r * 0.06, ny + r * 0.3); break;
      default: c.arc(x, ny + r * 0.12, r * 0.1, 0.15 * Math.PI, 0.85 * Math.PI);
    }
    c.stroke();
    // усы и борода
    if (look.mustache) {
      c.fillStyle = style === 'bald' ? '#8d8d8d' : hair; line(hairD);
      c.beginPath(); c.moveTo(x, hy + r * 0.5);
      c.quadraticCurveTo(x - r * 0.25, hy + r * 0.32, x - r * 0.5, hy + r * 0.52); c.quadraticCurveTo(x - r * 0.25, hy + r * 0.62, x, hy + r * 0.56);
      c.quadraticCurveTo(x + r * 0.25, hy + r * 0.62, x + r * 0.5, hy + r * 0.52); c.quadraticCurveTo(x + r * 0.25, hy + r * 0.32, x, hy + r * 0.5);
      c.closePath(); c.fill(); c.stroke();
    }
    if (acc.includes('beard')) {
      c.fillStyle = hair; line(hairD);
      c.beginPath(); c.moveTo(x - headR * 0.9, hy + r * 0.2); c.quadraticCurveTo(x - r * 0.72, hy + r * 1.3, x, hy + r * 1.32); c.quadraticCurveTo(x + r * 0.72, hy + r * 1.3, x + headR * 0.9, hy + r * 0.2);
      c.quadraticCurveTo(x + r * 0.4, hy + r * 0.66, x, hy + r * 0.62); c.quadraticCurveTo(x - r * 0.4, hy + r * 0.66, x - headR * 0.9, hy + r * 0.2); c.fill(); c.stroke();
    }
    // рот
    const my = hy + r * (look.mustache ? 0.72 : 0.58);
    c.strokeStyle = acc.includes('beard') ? '#f6e7d6' : shade(skin, -0.55); c.lineWidth = lw * 1.05;
    c.beginPath();
    if (mood === 'joy' || mood === 'happy') {
      const w = mood === 'joy' ? r * 0.24 : r * 0.17, d = mood === 'joy' ? r * 0.26 : r * 0.14;
      c.fillStyle = '#7a2e2a'; c.moveTo(x - w, my - r * 0.03); c.quadraticCurveTo(x, my + d, x + w, my - r * 0.03); c.closePath(); c.fill(); c.stroke();
    } else if (mood === 'ok') { c.moveTo(x - r * 0.14, my); c.quadraticCurveTo(x, my + r * 0.08, x + r * 0.14, my); c.stroke(); }
    else if (mood === 'worried') { c.moveTo(x - r * 0.14, my + r * 0.03); c.quadraticCurveTo(x, my - r * 0.06, x + r * 0.14, my + r * 0.03); c.stroke(); }
    else { c.moveTo(x - r * 0.15, my + r * 0.07); c.quadraticCurveTo(x, my - r * 0.08, x + r * 0.15, my + r * 0.07); c.stroke(); }

    // ----- аксессуары -----
    if (acc.includes('glasses')) {
      c.strokeStyle = '#3b2a22'; c.lineWidth = Math.max(1.3, r * 0.065); c.fillStyle = 'rgba(200,230,255,.15)';
      for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * ex, ey, r * 0.22, 0, 7); c.fill(); c.stroke(); }
      c.beginPath(); c.moveTo(x - ex + r * 0.22, ey - r * 0.02); c.lineTo(x + ex - r * 0.22, ey - r * 0.02); c.stroke();
    }
    if (acc.includes('headphones')) {
      c.lineWidth = r * 0.17; c.strokeStyle = '#3d405b'; c.beginPath(); c.arc(x, hy - r * 0.05, headR * 1.12, Math.PI + 0.25, -0.25); c.stroke();
      c.fillStyle = '#c8372d'; line('#6b1c16'); for (const s of [-1, 1]) { rr(c, x + s * headR * 1.05 - r * 0.2, hy - r * 0.22, r * 0.4, r * 0.62, r * 0.16); c.fill(); c.stroke(); }
    }
    if (acc.includes('beret')) { c.fillStyle = '#3d405b'; line('#1f2133'); c.beginPath(); c.ellipse(x - r * 0.15, hy - r * 0.82, r * 0.98, r * 0.38, -0.18, 0, 7); c.fill(); c.stroke(); }
    if (acc.includes('helmet')) {
      c.fillStyle = '#e63946'; line('#7a1d24'); c.beginPath(); c.arc(x, hy - r * 0.12, headR * 1.12, Math.PI, 0); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#fff'; c.fillRect(x - r * 0.12, hy - r * 1.22, r * 0.24, r * 1.08);
    }
    if (acc.includes('headband')) { c.strokeStyle = '#c8372d'; c.lineWidth = r * 0.2; c.beginPath(); c.arc(x, hy + r * 0.1, headR * 0.98, Math.PI * 1.12, Math.PI * 1.88); c.stroke(); }
    if (acc.includes('pencil')) {
      c.save(); c.translate(x + r * 0.55, hy - r * 0.95); c.rotate(0.7); c.fillStyle = '#f4c542'; line('#8a6a12');
      c.fillRect(-r * 0.08, -r * 0.6, r * 0.16, r * 1.0); c.strokeRect(-r * 0.08, -r * 0.6, r * 0.16, r * 1.0); c.fillStyle = '#f19aa8'; c.fillRect(-r * 0.08, -r * 0.72, r * 0.16, r * 0.12); c.restore();
    }
  }

  function moodOf(cu) {
    if (cu.state === 'leave') return cu.happy ? 'joy' : 'angry';
    if (cu.joyT > 0) return 'joy';
    const f = cu.pat / cu.patMax;
    if (cu.shakeT > 0) return 'angry';
    if (f > 0.6) return 'happy';
    if (f > 0.3) return 'ok';
    return 'worried';
  }

  // Стаканчик навынос в руке у довольного гостя
  function takeaway(x, y, r, skin) {
    const w = r * 0.55, h = r * 0.75;
    ctx.lineWidth = Math.max(1.3, r * 0.07); ctx.strokeStyle = '#3b2a22';
    ctx.fillStyle = '#fffaf2';
    ctx.beginPath(); ctx.moveTo(x - w / 2, y - h / 2); ctx.lineTo(x + w / 2, y - h / 2); ctx.lineTo(x + w * 0.38, y + h / 2); ctx.lineTo(x - w * 0.38, y + h / 2); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2f6b4f'; ctx.fillRect(x - w * 0.44, y - h * 0.05, w * 0.88, h * 0.3);
    ctx.fillStyle = '#c8372d'; rr(ctx, x - w * 0.58, y - h / 2 - r * 0.14, w * 1.16, r * 0.16, r * 0.06); ctx.fill(); ctx.stroke();
    ctx.fillStyle = skin; ctx.strokeStyle = shade(skin, -0.45);
    ctx.beginPath(); ctx.ellipse(x - w * 0.42, y + h * 0.12, r * 0.2, r * 0.26, 0.3, 0, 7); ctx.fill(); ctx.stroke();
  }

  // Анимешные значки настроения рядом с головой
  function moodMark(cu, x, hy, r) {
    const mood = moodOf(cu);
    const mx = x + r * 1.25, my = hy - r * 1.2;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (mood === 'joy') {
      for (let i = 0; i < 2; i++) {
        const hx = mx + i * r * 0.5, hyy = my - ((time * 20 + i * 11) % 14) - i * r * 0.3, s = r * 0.16;
        ctx.fillStyle = '#f17c8f'; ctx.strokeStyle = '#7a2e3a'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(hx, hyy + s); ctx.bezierCurveTo(hx - s * 2.2, hyy - s * 0.6, hx - s, hyy - s * 2, hx, hyy - s * 0.8);
        ctx.bezierCurveTo(hx + s, hyy - s * 2, hx + s * 2.2, hyy - s * 0.6, hx, hyy + s); ctx.fill(); ctx.stroke();
      }
    } else if (mood === 'angry') {
      ctx.strokeStyle = '#e63946'; ctx.lineWidth = Math.max(2, r * 0.12);
      for (let k = 0; k < 4; k++) {
        const a = k * Math.PI / 2 + Math.PI / 4;
        ctx.beginPath(); ctx.arc(mx + Math.cos(a) * r * 0.28, my + Math.sin(a) * r * 0.28, r * 0.22, a + Math.PI * 0.6, a + Math.PI * 1.4); ctx.stroke();
      }
    } else if (mood === 'worried') {
      const dy = (time * 10) % 6;
      ctx.fillStyle = '#9fd3ea'; ctx.strokeStyle = '#3a5a7a'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(mx, my + dy); ctx.quadraticCurveTo(mx + r * 0.3, my + r * 0.5 + dy, mx, my + r * 0.6 + dy);
      ctx.quadraticCurveTo(mx - r * 0.3, my + r * 0.5 + dy, mx, my + dy); ctx.fill(); ctx.stroke();
    }
  }

  function drawCustomer(cu, cap) {
    const r = personR(cap);
    cu.r = r;
    const name = cu.reg || (cu.look && cu.look.sprite) || 'g1';
    const im = Sprites.get(name);
    const walking = Math.abs(cu.tx - cu.x) > 1 || cu.state === 'leave';
    let bob = walking ? Math.abs(Math.sin(time * 9 + cu.phase)) * r * 0.2 : -Math.sin(time * 2 + cu.phase) * r * 0.05;
    if (cu.jumpT > 0) bob += Math.sin((1 - cu.jumpT) * Math.PI) * r * 0.5;
    let x = cu.x;
    if (cu.shakeT > 0) x += Math.sin(time * 70) * r * 0.15 * cu.shakeT;
    const hgt = r * 5.2;
    const asp = im && im.naturalWidth ? im.naturalWidth / im.naturalHeight : 1;
    const wdt = hgt * asp;
    const bottom = L.counterTop + r * 1.0 - bob; // низ бюста уходит за стойку
    const hy = bottom - hgt + r * 1.05;          // примерно центр головы
    if (Sprites.ready(name)) {
      ctx.save();
      if (cu.state === 'leave' && !cu.happy) ctx.filter = 'saturate(.7)';
      ctx.drawImage(im, x - wdt / 2, bottom - hgt, wdt, hgt);
      ctx.restore();
    } else {
      ctx.fillStyle = '#5a3f5e'; ctx.beginPath(); ctx.ellipse(x, bottom - hgt * 0.55, r * 1.3, hgt * 0.45, 0, 0, 7); ctx.fill();
    }
    moodMark(cu, x, hy, r);
    cu.hy = hy; cu.dx = x;
    cu.hit = { x0: x - r * 1.6, y0: hy - r * 1.4, x1: x + r * 1.6, y1: L.counterTop + 10 };
  }

  function drawHands() {} // руки нарисованы на самих бюстах

  // ---------- облачко заказа ----------
  function fitText(text, maxW, size, weight = 800) {
    let s = size;
    ctx.font = `${weight} ${s}px Nunito, ui-rounded, system-ui, sans-serif`;
    while (s > 8 && ctx.measureText(text).width > maxW) {
      s -= 0.5; ctx.font = `${weight} ${s}px Nunito, ui-rounded, system-ui, sans-serif`;
    }
    return s;
  }

  function drawBubble(cu, cap) {
    if (cu.state !== 'wait' || cu.bubbleT <= 0) return;
    const r = cu.r;
    const sw = slotW(cap);
    const bw = clamp(sw - 8, 74, 150);
    const icon = clamp(r * 0.8, 15, 22);
    const nameS = clamp(r * 0.48, 10, 13);
    const pad = 6;
    const rowH = nameS + 3 + icon + 4;
    const rows = cu.orders.length;
    const bh = pad + rows * rowH + 7 + pad - 2;
    const bx = clamp(cu.dx - bw / 2, 4, W - bw - 4);
    const by = cu.hy - r * 1.35 - 10 - bh;
    const k = Math.min(1, cu.bubbleT * 4);
    const sc = 0.6 + 0.4 * (1 - Math.pow(1 - k, 3)) + Math.sin(k * Math.PI) * 0.08;
    ctx.save();
    ctx.translate(cu.dx, by + bh);
    ctx.scale(sc, sc);
    ctx.translate(-cu.dx, -(by + bh));
    if (cu.wiggleT > 0) ctx.translate(Math.sin(time * 50) * 3 * cu.wiggleT, 0);
    // тень и тело
    ctx.fillStyle = 'rgba(59,42,34,.18)'; rr(ctx, bx + 2, by + 4, bw, bh, 12); ctx.fill();
    ctx.fillStyle = '#fffdf8'; ctx.strokeStyle = '#3b2a22'; ctx.lineWidth = 2.5;
    rr(ctx, bx, by, bw, bh, 12); ctx.fill(); ctx.stroke();
    const tx = clamp(cu.dx, bx + 14, bx + bw - 14);
    ctx.beginPath(); ctx.moveTo(tx - 7, by + bh - 1); ctx.lineTo(tx, by + bh + 8); ctx.lineTo(tx + 7, by + bh - 1); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fffdf8'; ctx.fillRect(tx - 6, by + bh - 4, 12, 4);
    // строки заказа
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    cu.orders.forEach((rid, i) => {
      const y = by + pad + i * rowH;
      const rec = RECIPE[rid];
      const hidden = cu.hidden && !cu.revealed;
      ctx.fillStyle = '#3b2a22';
      const label = hidden ? t('usual') : T(rec.name);
      fitText(label, bw - 10, nameS);
      ctx.fillText(label, bx + bw / 2, y);
      const iy = y + nameS + 3;
      if (hidden) {
        ctx.fillStyle = '#f2cc8f'; ctx.beginPath(); ctx.arc(bx + bw / 2, iy + icon / 2, icon / 2 + 1, 0, 7); ctx.fill();
        ctx.strokeStyle = '#3b2a22'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#3b2a22'; ctx.font = `900 ${icon * 0.8}px Nunito, ui-rounded, system-ui, sans-serif`;
        ctx.textBaseline = 'middle'; ctx.fillText('?', bx + bw / 2, iy + icon / 2 + 1); ctx.textBaseline = 'top';
      } else {
        const n = rec.ings.length;
        const gap = 2;
        const isz = Math.min(icon, (bw - 10 - gap * (n - 1)) / n);
        const total = n * isz + (n - 1) * gap;
        rec.ings.forEach((ing, j) => {
          const img = ICON_IMG[ing];
          if (img && img.complete) ctx.drawImage(img, bx + bw / 2 - total / 2 + j * (isz + gap), iy + (icon - isz) / 2, isz, isz);
        });
      }
    });
    // терпение
    const f = clamp(cu.pat / cu.patMax, 0, 1);
    const barY = by + bh - pad - 5, barW = bw - 14;
    ctx.fillStyle = '#eadfce'; rr(ctx, bx + 7, barY, barW, 6, 3); ctx.fill();
    const col = f > 0.5 ? '#8a7a9a' : f > 0.25 ? '#f2b84b' : '#e07a5f';
    const blinkLow = f < 0.2 && Math.sin(time * 14) > 0;
    ctx.fillStyle = blinkLow ? '#c4473a' : col;
    rr(ctx, bx + 7, barY, Math.max(6, barW * f), 6, 3); ctx.fill();
    // имя постоянного гостя
    if (cu.reg) {
      const reg = REGULAR[cu.reg];
      const st = regState(cu.reg);
      const label = `${T(reg.name)}  ♥${st.hearts}`;
      ctx.font = `900 ${nameS - 1}px Nunito, ui-rounded, system-ui, sans-serif`;
      const lw = Math.min(bw + 10, ctx.measureText(label).width + 14);
      const lx = clamp(cu.dx - lw / 2, 4, W - lw - 4), ly = by - nameS - 6;
      ctx.fillStyle = '#e07a5f'; rr(ctx, lx, ly, lw, nameS + 5, 8); ctx.fill();
      ctx.strokeStyle = '#3b2a22'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#fff'; fitText(label, lw - 8, nameS - 1, 900);
      ctx.textBaseline = 'middle'; ctx.fillText(label, lx + lw / 2, ly + (nameS + 5) / 2 + 0.5);
    }
    ctx.restore();
    cu.bub = { x0: bx, y0: by - (cu.reg ? nameS + 6 : 0), x1: bx + bw, y1: by + bh + 8 };
  }

  // ---------- предметы на стойке и кот ----------
  function drawCounterItems() {} // стойка нарисована художником; покупки пока не отображаются

  // Полосатый кот: идёт по стойке, садится, машет хвостом, жмурится, когда гладят
  // Нарисованный кот: идёт по стойке, садится, мурчит, когда гладят
  function drawCat(cat) {
    if (!cat || !Sprites.ready('cat')) return;
    const im = Sprites.get('cat');
    const s = clamp(H / 420, 0.6, 1.1);
    const h = 62 * s, w = h * im.naturalWidth / im.naturalHeight;
    const y = L.counterTop + 4;
    const walk = cat.state !== 'sit';
    const bob = walk ? Math.abs(Math.sin(time * 10)) * 2.5 : Math.sin(time * 1.8) * 0.8;
    ctx.save(); ctx.translate(cat.x, y - bob);
    if ((cat.dir || 1) === 1) ctx.scale(-1, 1); // картинка смотрит влево
    ctx.drawImage(im, -w / 2, -h, w, h);
    ctx.restore();
    if (cat.petT > 0) {
      ctx.fillStyle = '#f17c8f'; ctx.font = `900 ${12 * s}px Nunito, ui-rounded, system-ui, sans-serif`; ctx.textAlign = 'center';
      ctx.fillText('♥', cat.x + w * 0.3, y - h - 4 - Math.sin(time * 6) * 3);
    }
    cat.hit = { x0: cat.x - w / 2 - 4, y0: y - h - 6, x1: cat.x + w / 2 + 4, y1: y + 4 };
  }

  // Рычажная эспрессо-машина и кофемолка на стойке (широкие экраны). Оживают, когда бариста работает.
  function drawMachine(busy) {
    if (!L.mw) return;
    const s = L.mw / 150;
    const base = L.counterTop - 8;
    const mx = 12, w = 100 * s, h = 78 * s;
    const top = base - h;
    const working = busy.espresso > 0;
    const rnd = seeded(17);
    // ----- кофемолка: бункер с зёрнами, корпус, дозатор -----
    const gx = mx + w + 10 * s, gw = 28 * s, shakeX = working ? Math.sin(time * 60) * 0.8 : 0;
    ctx.save(); ctx.translate(shakeX, 0);
    ctx.fillStyle = '#4a3450'; ink(ctx, 1.8); hrect(ctx, gx, base - 44 * s, gw, 44 * s, 4 * s, rnd, 0.8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#b85c5c'; hrect(ctx, gx + 4 * s, base - 30 * s, gw - 8 * s, 12 * s, 2 * s, rnd, 0.5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#d5dee3'; hrect(ctx, gx + gw * 0.3, base - 16 * s, gw * 0.4, 5 * s, 1, rnd, 0.4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(225,242,250,.8)';
    hpath(ctx, [[gx - 3 * s, base - 74 * s], [gx + gw + 3 * s, base - 74 * s], [gx + gw - 5 * s, base - 44 * s], [gx + 5 * s, base - 44 * s]], true, rnd, 0.7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#5a3422';
    hpath(ctx, [[gx + 1 * s, base - 64 * s], [gx + gw - 1 * s, base - 64 * s], [gx + gw - 6 * s, base - 45 * s], [gx + 6 * s, base - 45 * s]], true, rnd, 0.5); ctx.fill();
    ctx.fillStyle = '#7a4a30'; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.ellipse(gx + 5 * s + rnd() * (gw - 10 * s), base - 62 * s + rnd() * 14 * s, 1.6 * s, 1.1 * s, rnd() * 3, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#3d405b'; hellipse(ctx, gx + gw / 2, base - 74 * s, gw / 2 + 3 * s, 2.5 * s, rnd, 0.4); ctx.fill(); ctx.stroke();
    ctx.restore();
    // ----- машина: хромированная плита, красная эмаль, манометр, рычаги -----
    ctx.fillStyle = '#d5dee3'; ink(ctx, 2); hrect(ctx, mx - 4, top - 9 * s, w + 8, 10 * s, 3, rnd, 0.8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff6e6'; ink(ctx, 1.5);
    for (let i = 0; i < 3; i++) { hpath(ctx, [[mx + 9 * s + i * 24 * s, top - 20 * s], [mx + 23 * s + i * 24 * s, top - 20 * s], [mx + 21 * s + i * 24 * s, top - 10 * s], [mx + 11 * s + i * 24 * s, top - 10 * s]], true, rnd, 0.5); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = '#b85c5c'; ink(ctx, 2); hrect(ctx, mx, top, w, h * 0.78, 6 * s, rnd, 1); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.14)'; hrect(ctx, mx + 5 * s, top + 5 * s, w * 0.12, h * 0.6, 3 * s, rnd, 0.5); ctx.fill();
    ctx.fillStyle = '#d5dee3'; ink(ctx, 1.6); hrect(ctx, mx + w * 0.3, top + 6 * s, w * 0.4, h * 0.2, 3 * s, rnd, 0.5); ctx.fill(); ctx.stroke();
    // манометр
    ctx.fillStyle = '#fff8ee'; hellipse(ctx, mx + w * 0.5, top + h * 0.16, 7 * s, 7 * s, rnd, 0.4); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#b85c5c'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(mx + w * 0.5, top + h * 0.16, 5 * s, -0.6, 0.4); ctx.stroke();
    ink(ctx, 1.4); ctx.save(); ctx.translate(mx + w * 0.5, top + h * 0.16); ctx.rotate(working ? -1.2 + Math.sin(time * 5) * 0.2 : -2.6);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(5 * s, 0); ctx.stroke(); ctx.restore();
    // рычаги по группам
    const groups = Stats.groups();
    for (let i = 0; i < groups; i++) {
      const gxi = mx + w * ((i + 1) / (groups + 1));
      const down = i < busy.espresso;
      ctx.save(); ctx.translate(gxi, top + h * 0.5); ctx.rotate(down ? 0.35 + Math.sin(time * 3) * 0.05 : -0.85);
      ctx.strokeStyle = '#9aa7ae'; ctx.lineWidth = 4.5 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -26 * s); ctx.stroke();
      ink(ctx, 1.6); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -26 * s); ctx.stroke();
      ctx.fillStyle = INKC; ctx.beginPath(); ctx.ellipse(0, -28 * s, 4 * s, 6 * s, 0, 0, 7); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#d5dee3'; ink(ctx, 1.6); hellipse(ctx, gxi, top + h * 0.5, 5 * s, 5 * s, rnd, 0.3); ctx.fill(); ctx.stroke();
    }
    // группы и холдеры
    for (let i = 0; i < groups; i++) {
      const gxi = mx + w * ((i + 1) / (groups + 1));
      ctx.fillStyle = '#d5dee3'; ink(ctx, 1.6); hrect(ctx, gxi - 10 * s, top + h * 0.78 - 2, 20 * s, 7 * s, 2, rnd, 0.4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#3b2a22'; hrect(ctx, gxi - 8 * s, top + h * 0.78 + 5 * s, 16 * s, 5 * s, 2, rnd, 0.3); ctx.fill();
      ctx.strokeStyle = INKC; ctx.lineWidth = 4 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(gxi + 6 * s, top + h * 0.78 + 7 * s); ctx.lineTo(gxi + 20 * s, top + h * 0.78 + 9 * s); ctx.stroke();
      if (i < busy.espresso) {
        ctx.strokeStyle = '#5a3422'; ctx.lineWidth = 2;
        for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(gxi + k * 3 * s, top + h * 0.78 + 10 * s); ctx.quadraticCurveTo(gxi + k * 3 * s + Math.sin(time * 15) * 0.7, base - 16 * s, gxi + k * 2 * s, base - 12 * s); ctx.stroke(); }
      }
      ctx.fillStyle = '#fff6e6'; ink(ctx, 1.5);
      hpath(ctx, [[gxi - 7 * s, base - 14 * s], [gxi + 7 * s, base - 14 * s], [gxi + 5.5 * s, base - 4 * s], [gxi - 5.5 * s, base - 4 * s]], true, rnd, 0.4); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(gxi + 8 * s, base - 9 * s, 2.5 * s, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    }
    // поддон с решёткой и паровая трубка
    ctx.fillStyle = '#d5dee3'; ink(ctx, 1.6); hrect(ctx, mx - 4, base - 5 * s, w + 8, 6 * s, 2, rnd, 0.5); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1; for (let x = mx; x < mx + w; x += 5 * s) { ctx.beginPath(); ctx.moveTo(x, base - 4 * s); ctx.lineTo(x, base - 1 * s); ctx.stroke(); }
    ctx.strokeStyle = INKC; ctx.lineWidth = 4.5 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(mx + w - 4 * s, top + 26 * s); ctx.lineTo(mx + w + 5 * s, top + 36 * s); ctx.lineTo(mx + w + 5 * s, top + h * 0.75); ctx.stroke();
    ctx.strokeStyle = '#9aa7ae'; ctx.lineWidth = 2.5 * s;
    ctx.beginPath(); ctx.moveTo(mx + w - 4 * s, top + 26 * s); ctx.lineTo(mx + w + 5 * s, top + 36 * s); ctx.lineTo(mx + w + 5 * s, top + h * 0.75); ctx.stroke();
    ctx.fillStyle = INKC; ctx.beginPath(); ctx.arc(mx + w - 4 * s, top + 24 * s, 3.5 * s, 0, 7); ctx.fill();
    if (busy.frother > 0 && Math.random() < 0.5) {
      particles.push({ x: mx + w + 5 * s, y: top + h * 0.75, vx: rand(-15, 15), vy: rand(-50, -30), life: 1.2, kind: 'steam', size: rand(4, 7) * s, rot: 0, vr: 0 });
    }
    if (working && Math.random() < 0.15) {
      particles.push({ x: mx + w * 0.5, y: top - 12 * s, vx: rand(-6, 6), vy: -25, life: 1.4, kind: 'steam', size: 4 * s, rot: 0, vr: 0 });
    }
  }

  // ---------- частицы и тексты ----------
  function burst(x, y, kind, n = 10, color) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), sp = rand(60, 220);
      particles.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, life: rand(0.6, 1.1), max: 1,
        kind, color: color || pick(['#e07a5f', '#8a7a9a', '#f2cc8f', '#f19aa8', '#8fd0f5']), size: rand(4, 8), rot: rand(0, 6), vr: rand(-8, 8),
      });
    }
  }
  function floatText(x, y, text, color = '#3b2a22', size = 18) {
    texts.push({ x, y, text, color, size, life: 1.2 });
  }
  function flyCoin(x, y, tx, ty, onArrive, delay = 0) {
    flyers.push({ x0: x, y0: y, tx, ty, t: -delay, dur: 0.6, onArrive, cx: x + rand(-60, 60), cy: Math.min(y, ty) - rand(30, 90) });
  }
  function addShake(v) { shake = Math.max(shake, v); }

  function updateFx(dt) {
    time += dt;
    shake = Math.max(0, shake - dt * 2.5);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      if (p.kind === 'steam') { p.size += dt * 10; p.vx *= 0.98; }
      else p.vy += (p.kind === 'heart' ? -60 : 420) * dt;
      if (p.kind === 'heart') { p.vx *= 0.96; p.vy = Math.max(p.vy, -90); }
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    }
    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i];
      t.life -= dt; t.y -= 40 * dt;
      if (t.life <= 0) texts.splice(i, 1);
    }
    for (let i = flyers.length - 1; i >= 0; i--) {
      const f = flyers[i];
      f.t += dt;
      if (f.t >= f.dur) { flyers.splice(i, 1); f.onArrive && f.onArrive(); }
    }
  }

  function drawFx() {
    for (const p of particles) {
      ctx.globalAlpha = clamp(p.life * 1.5, 0, 1);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      if (p.kind === 'steam') {
        ctx.globalAlpha = clamp(p.life * 0.45, 0, 0.5); ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(0, 0, p.size, 0, 7); ctx.fill();
      } else if (p.kind === 'heart') {
        const s = p.size * 0.18;
        ctx.scale(s, s); ctx.fillStyle = '#f17c8f';
        ctx.beginPath(); ctx.moveTo(0, 6); ctx.bezierCurveTo(-14, -4, -6, -14, 0, -6); ctx.bezierCurveTo(6, -14, 14, -4, 0, 6); ctx.fill();
      } else if (p.kind === 'spark') {
        ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    const coin = ICON_IMG.coin;
    for (const f of flyers) {
      if (f.t < 0) continue;
      const k = f.t / f.dur, e = k * k;
      const x = (1 - e) * (1 - e) * f.x0 + 2 * (1 - e) * e * f.cx + e * e * f.tx;
      const y = (1 - e) * (1 - e) * f.y0 + 2 * (1 - e) * e * f.cy + e * e * f.ty;
      const s = 18 * (1 - k * 0.3);
      if (coin.complete) ctx.drawImage(coin, x - s / 2, y - s / 2, s, s);
    }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const t of texts) {
      const a = clamp(t.life * 2, 0, 1);
      const pop = 1 + Math.max(0, t.life - 1) * 2;
      ctx.globalAlpha = a;
      ctx.font = `900 ${t.size * pop}px Nunito, ui-rounded, system-ui, sans-serif`;
      ctx.lineWidth = 5; ctx.strokeStyle = '#fffdf8'; ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color; ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }

  function drawPointer(cu) {
    if (!cu || !cu.hit) return;
    const x = cu.dx + cu.r * 1.6, y = cu.hy + cu.r * 0.4 + Math.sin(time * 6) * 6;
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.5);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#3b2a22'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10, 22); ctx.lineTo(4, 20); ctx.lineTo(4, 34); ctx.lineTo(-4, 34); ctx.lineTo(-4, 20); ctx.lineTo(-10, 22); ctx.closePath();
    ctx.fill(); ctx.stroke(); ctx.restore();
  }

  // ---------- кадр ----------
  function render(state) {
    const name = L.bg.name, im = Sprites.get(name);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (!Sprites.ready(name)) { ctx.fillStyle = '#3a2838'; ctx.fillRect(0, 0, W, H); return; }
    if (!bg) buildBg();
    ctx.save();
    if (shake > 0) ctx.translate(rand(-1, 1) * shake * 6, rand(-1, 1) * shake * 6);
    const dark = drawSky(state.sky);
    ctx.drawImage(im, L.bg.x, L.bg.y, L.bg.w, L.bg.h);
    ctx.drawImage(bg, 0, 0, W, H);
    drawLamps(dark);
    const cap = state.cap || 3;
    for (const cu of state.customers) drawCustomer(cu, cap);
    // стойка поверх гостей — нижняя полоса той же картинки
    const ct = L.counterTop, sy = (ct - L.bg.y) / L.bg.scale;
    ctx.drawImage(im, 0, sy, im.naturalWidth, im.naturalHeight - sy, L.bg.x, ct, L.bg.w, L.bg.h - (ct - L.bg.y));
    drawCandle(dark);
    drawCat(state.cat);
    drawDaylight(state.sky, dark);
    drawGrain();
    for (const cu of state.customers) drawBubble(cu, cap);
    drawPointer(state.pointer);
    drawFx();
    ctx.restore();
  }

  // Портрет гостя для экрана «Гости»
  function drawPortrait(canvas, id, locked) {
    const size = 72, d = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = size * d; canvas.height = size * d;
    canvas.style.width = size + 'px'; canvas.style.height = size + 'px';
    const c = canvas.getContext('2d');
    c.setTransform(d, 0, 0, d, 0, 0);
    c.fillStyle = locked ? '#d8c8b4' : '#f2cc8f';
    c.beginPath(); c.arc(size / 2, size / 2, size / 2, 0, 7); c.fill();
    const im = Sprites.get(id);
    if (!Sprites.ready(id)) return;
    c.save(); c.beginPath(); c.arc(size / 2, size / 2, size / 2 - 1, 0, 7); c.clip();
    if (locked) { c.filter = 'grayscale(1)'; c.globalAlpha = 0.5; }
    const h = size * 1.15, w = h * im.naturalWidth / im.naturalHeight;
    c.drawImage(im, size / 2 - w / 2, size * 0.02, w, h);
    c.restore();
  }

  return {
    resize, invalidate, render, updateFx, setSafeTop(v) { safeTop = v; resize(); }, burst, floatText, flyCoin, addShake, drawPortrait, drawPerson,
    slotX, personR, get W() { return W; }, get H() { return H; }, get counterTop() { return L.counterTop; },
  };
})();
