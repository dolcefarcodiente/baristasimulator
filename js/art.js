// Отрисовка сцены в пиксель-арте: мир рисуется в маленький буфер и растягивается без сглаживания,
// поверх — чёткие облачка заказов, меню мелом и всплывающие надписи пиксельным шрифтом.

const Art = (() => {
  const cv = document.getElementById('scene');
  const mctx = cv.getContext('2d');
  const lo = document.createElement('canvas');      // буфер мира в «игровых пикселях»
  const lctx = lo.getContext('2d');
  let ctx = lctx;                                    // текущий холст для функций рисования
  let W = 0, H = 0, DPR = 1, PX = 2, LP = 1;         // PX — пикселей экрана на игровой пиксель, LP — то же в CSS-пикселях
  let bg = null;
  let time = 0, shake = 0, flash = 0;
  let safeTop = 0; // отступ под чёлку/статус-бар телефона
  const particles = [];
  const texts = [];
  const flyers = [];
  const L = {}; // раскладка
  const FONT = '"Pixelify Sans", ui-monospace, monospace';
  const INK = '#1e1420';

  // ---------- помощники ----------
  function hex(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function mix(a, b, t) {
    const x = hex(a), y = hex(b);
    return `rgb(${Math.round(lerp(x[0], y[0], t))},${Math.round(lerp(x[1], y[1], t))},${Math.round(lerp(x[2], y[2], t))})`;
  }
  function seeded(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
  const snap = (v, u = LP) => Math.round(v / u) * u;

  // Маленькие пиксельные значки: строки из «#» и «.»
  const BMP = {
    heart: ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'],
    anger: ['.#...#.', '##...##', '.......', '.......', '##...##', '.#...#.'],
    drop: ['..#..', '.###.', '#####', '#####', '.###.'],
    z: ['####', '..#.', '.#..', '####'],
    arrow: ['..###..', '..###..', '..###..', '#######', '.#####.', '..###..', '...#...'],
  };
  function pix(rows, x, y, s, color, outline) {
    x = snap(x); y = snap(y);
    const draw = (ox, oy) => rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === '#') ctx.fillRect(x + ox + i * s, y + oy + j * s, s, s); });
    if (outline) { ctx.fillStyle = outline; for (const [ox, oy] of [[-s, 0], [s, 0], [0, -s], [0, s]]) draw(ox, oy); }
    ctx.fillStyle = color; draw(0, 0);
  }
  // Пиксельная рамка со срезанными углами и жёсткой тенью
  function pbox(c, x, y, w, h, u, fill, edge, shadow) {
    x = snap(x, u); y = snap(y, u); w = snap(w, u); h = snap(h, u);
    const notch = (x0, y0) => { c.fillRect(x0 + u, y0, w - 2 * u, h); c.fillRect(x0, y0 + u, w, h - 2 * u); };
    if (shadow) { c.fillStyle = shadow; notch(x + u, y + u); }
    c.fillStyle = edge; notch(x, y);
    c.fillStyle = fill; c.fillRect(x + u, y + u, w - 2 * u, h - 2 * u);
    return { x, y, w, h };
  }

  // ---------- раскладка ----------
  // Фон — нарисованная картинка; выбираем вертикальную или широкую по пропорциям экрана
  function bgName() { return W / H < 1.05 ? 'bg-tall' : 'bg-wide'; }
  function resize() {
    const r = cv.parentElement.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2.5);
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    // размер игрового пикселя: полтора CSS-пикселя на телефоне, до трёх на большом экране
    PX = Math.max(2, Math.round(clamp(W / 500, 1.5, 3) * DPR));
    LP = PX / DPR;
    lo.width = Math.ceil(cv.width / PX); lo.height = Math.ceil(cv.height / PX);
    const name = bgName(), im = Sprites.get(name), m = Sprites.meta(name);
    const iw = (im && im.naturalWidth) || (name === 'bg-wide' ? 1280 : 896), ih = (im && im.naturalHeight) || (name === 'bg-wide' ? 720 : 1344);
    // картинка покрывает сцену целиком и прижата к низу: стойка всегда на месте
    const scale = Math.max(W / iw, H / ih);
    const dw = iw * scale, dh = ih * scale;
    L.bg = { name, x: (W - dw) / 2, y: H - dh, w: dw, h: dh, scale };
    const X = (fx) => L.bg.x + fx * dw, Y = (fy) => L.bg.y + fy * dh;
    L.counterTop = Math.round(Y(m.counter));
    L.counterMid = Y(m.counter + (m.counterFront - m.counter) * 0.55); // линия, на которой стоят предметы
    // На широких экранах слева на стойке стоит кофемашина, гости встают правее неё
    L.mw = W >= 560 ? Math.round(clamp(W * 0.16, 100, 150)) : 0;
    L.ax0 = W * 0.03 + L.mw; L.aw = W * 0.94 - L.mw;
    const wn = m.win || { x0: 0.05, y0: 0.1, x1: 0.6, y1: 0.7 };
    L.win = { x: Math.round(X(wn.x0)), y: Math.round(Y(wn.y0)), w: Math.round((wn.x1 - wn.x0) * dw), h: Math.round((wn.y1 - wn.y0) * dh) };
    L.board = { x: X(m.board.x0), y: Y(m.board.y0), w: (m.board.x1 - m.board.x0) * dw, h: (m.board.y1 - m.board.y0) * dh };
    L.lamps = m.lamps.map(([fx, fy]) => [X(fx), Y(fy)]);
    L.bulbs = m.bulbs.map(([fx, fy]) => [X(fx), Y(fy)]);
    invalidate();
  }
  function invalidate() { bg = null; }

  function slotW(cap) { return L.aw / cap; }
  function slotX(i, cap) { return L.ax0 + (i + 0.5) * slotW(cap); }
  function personR(cap) { return clamp(Math.min(slotW(cap) / 4.2, (L.counterTop - 40) / 7), 12, 32); }

  // ---------- меню мелом на доске ----------
  // Рисуется в полном разрешении поверх пиксельного мира, чтобы буквы читались
  function buildBg() {
    const c = document.createElement('canvas');
    c.width = cv.width; c.height = cv.height;
    const g = c.getContext('2d'); g.scale(DPR, DPR);
    bg = c;
    const b = L.board;
    if (b.y < safeTop + 54 || b.w < 60) return; // доска под панелью со счётом или слишком мала
    const pad = Math.max(6, b.w * 0.08);
    const chalk = '#ece3d0';
    g.fillStyle = chalk; g.textAlign = 'center'; g.textBaseline = 'top';
    const fs = Math.round(clamp(b.w / 7, 11, 22));
    g.font = `700 ${fs}px ${FONT}`;
    g.fillText(LANG === 'en' ? 'MENU' : 'МЕНЮ', b.x + b.w / 2, b.y + pad);
    const u = Math.max(1, Math.round(LP));
    for (let x = b.x + b.w * 0.28; x < b.x + b.w * 0.72; x += u * 3) g.fillRect(snap(x, u), b.y + pad + fs * 1.2, u * 2, u);
    const rec = S.recipes.slice(-5).reverse();
    const fsz = Math.round(clamp(fs * 0.62, 9, 14));
    const lineH = fsz * 1.55;
    const tall = b.h > b.w * 1.3; // высокая доска: цена под названием
    rec.forEach((id, i) => {
      const step = tall ? lineH * 2 : lineH;
      const y = b.y + pad + fs * 1.8 + i * step;
      if (y + step > b.y + b.h - pad * 0.5) return;
      const price = String(Math.round(RECIPE[id].price * Stats.priceMult()));
      const name = T(RECIPE[id].name);
      let nsz = fsz;
      const room = tall ? b.w - pad * 2 : b.w - pad * 2 - fsz * 2.2;
      while (nsz > 8 && (g.font = `500 ${nsz}px ${FONT}`, g.measureText(name).width > room)) nsz -= 1;
      g.fillStyle = chalk; g.textAlign = 'left'; g.fillText(name, b.x + pad, y);
      g.font = `700 ${fsz}px ${FONT}`; g.fillStyle = '#f2c46a'; g.textAlign = 'right';
      g.fillText('$' + price, b.x + b.w - pad, tall ? y + lineH * 0.85 : y);
    });
  }

  // ---------- вечер и ночь за окном ----------
  // Смена идёт с заката до глубокой ночи (18:00 → 02:00), за окном всё время дождь.
  const SKY = [
    [0, '#5a4a8a', '#f09a6a'], [0.18, '#3e3a72', '#b0708a'], [0.4, '#222a52', '#463c6a'], [1, '#0e1228', '#252a4e'],
  ];
  function skyAt(p) {
    for (let i = 0; i < SKY.length - 1; i++) {
      const a = SKY[i], b = SKY[i + 1];
      if (p <= b[0]) { const t = (p - a[0]) / (b[0] - a[0]); return [mix(a[1], b[1], t), mix(a[2], b[2], t)]; }
    }
    return [SKY[SKY.length - 1][1], SKY[SKY.length - 1][2]];
  }
  // Оттенок комнаты: [момент, цвет, сила] — закатное золото, потом ночная синева
  const LIGHT = [[0, '#ffb070', 0.16], [0.25, '#b08ab0', 0.24], [0.5, '#7a6aa8', 0.34], [1, '#5a4a8a', 0.42]];
  function lightAt(p) {
    for (let i = 0; i < LIGHT.length - 1; i++) {
      const a = LIGHT[i], b = LIGHT[i + 1];
      if (p <= b[0]) { const t = (p - a[0]) / (b[0] - a[0]); return [mix(a[1], b[1], t), lerp(a[2], b[2], t)]; }
    }
    return [LIGHT[LIGHT.length - 1][1], LIGHT[LIGHT.length - 1][2]];
  }
  const darkAt = (p) => clamp(0.35 + p * 1.4, 0, 1);
  // Сила дождя меняется от дня к дню: где-то морось, где-то ливень с грозой
  function rainK() {
    const v = Math.sin((S.day || 1) * 12.9898) * 43758.5453;
    return 0.4 + 0.6 * (v - Math.floor(v));
  }

  function drawWindow(p) {
    const w = L.win;
    const [top, bot] = skyAt(p);
    // видимая часть окна: верх может прятаться под панелью со счётом
    const vt = Math.max(w.y, safeTop + 48), vh = Math.max(40, w.y + w.h - vt);
    const gr = ctx.createLinearGradient(0, vt, 0, vt + vh * 0.6);
    gr.addColorStop(0, top); gr.addColorStop(1, bot);
    ctx.fillStyle = gr; ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.save(); ctx.beginPath(); ctx.rect(w.x, w.y, w.w, w.h); ctx.clip();
    // тяжёлые дождевые облака — ступенчатые пиксельные полосы
    const cr = seeded(23);
    for (let i = 0; i < 6; i++) {
      const cw = w.w * (0.25 + cr() * 0.3), ch = Math.max(LP * 3, vh * (0.03 + cr() * 0.03));
      const cx = w.x + ((time * (2 + i * 0.7) + cr() * w.w * 2) % (w.w + cw)) - cw, cy = vt + vh * (0.02 + i * 0.05);
      ctx.fillStyle = `rgba(${p < 0.2 ? '120,90,130' : '40,40,70'},${0.55 - i * 0.05})`;
      ctx.fillRect(snap(cx), snap(cy), snap(cw), snap(ch));
      ctx.fillRect(snap(cx + cw * 0.15), snap(cy - ch * 0.6), snap(cw * 0.5), snap(ch * 0.6));
    }
    drawCity(p, vt, vh);
    // вспышка молнии
    if (flash > 0) { ctx.fillStyle = `rgba(220,225,255,${flash * 0.55})`; ctx.fillRect(w.x, w.y, w.w, w.h); }
    // струи дождя
    const rk = rainK();
    const n = Math.round(rk * w.w * vh / 700);
    const rr = seeded(71);
    ctx.fillStyle = `rgba(175,195,240,${0.25 + rk * 0.2})`;
    for (let i = 0; i < n; i++) {
      const sx = rr() * (w.w + 40), sp = 240 + rr() * 160, len = snap(LP * (3 + rr() * 5)), ph = rr();
      const y = vt + ((time * sp + ph * vh * 7) % (vh + len)) - len;
      const x = w.x + sx - 20 - (y - vt) * 0.15;
      ctx.fillRect(snap(x), snap(y), LP, len);
    }
    // капли на стекле медленно сползают вниз
    const dr = seeded(97);
    for (let i = 0; i < 16; i++) {
      const dx = w.x + dr() * w.w, sp = 4 + dr() * 14, ph = dr() * 50, sz = dr() < 0.3 ? 2 : 1;
      const dy = w.y + ((time * sp + ph * 9) % (w.h + 20)) - 10;
      ctx.fillStyle = 'rgba(190,210,255,.18)'; ctx.fillRect(snap(dx), snap(dy - LP * 6), LP, LP * 6);
      ctx.fillStyle = 'rgba(200,220,255,.55)'; ctx.fillRect(snap(dx), snap(dy), LP * sz, LP * (sz + 1));
      ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(snap(dx), snap(dy), LP, LP);
    }
    // брызги на подоконнике
    const sr = seeded(131);
    ctx.fillStyle = 'rgba(200,215,255,.5)';
    for (let i = 0; i < 10; i++) { const sx = w.x + sr() * w.w, k = (time * (1.5 + sr()) + sr()) % 1; if (k < 0.25) ctx.fillRect(snap(sx), snap(w.y + w.h - LP * (2 + k * 8)), LP, LP); }
    ctx.restore();
  }

  // Город за окном: сначала сумеречная картинка, к ночи перетекает в ночную
  let cityCv = null, cityG = null;
  function drawCity(p, vt, vh) {
    if (!Sprites.ready('city-day')) return;
    const w = L.win, day = Sprites.get('city-day');
    const k = DPR / PX;
    const pw = Math.max(1, Math.ceil(w.w * k)), ph = Math.max(1, Math.ceil(vh * k));
    if (!cityCv || cityCv.width !== pw || cityCv.height !== ph) {
      cityCv = document.createElement('canvas'); cityCv.width = pw; cityCv.height = ph; cityG = cityCv.getContext('2d');
    }
    const g = cityG;
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, pw, ph);
    const sc = Math.max(pw / day.naturalWidth, ph / day.naturalHeight);
    const dw = day.naturalWidth * sc, dh = day.naturalHeight * sc, dx = (pw - dw) / 2, dy = (ph - dh) * 0.35;
    g.drawImage(day, dx, dy, dw, dh);
    // к ночи сумеречный город синеет (только по самому городу: красим, потом возвращаем маску неба)
    const ta = clamp(p / 0.35, 0, 1) * 0.45;
    if (ta > 0.01) {
      g.globalCompositeOperation = 'multiply'; g.fillStyle = mix('#ffffff', '#4a4a8a', ta); g.fillRect(0, 0, pw, ph);
      g.globalCompositeOperation = 'destination-in'; g.drawImage(day, dx, dy, dw, dh);
    }
    const nk = clamp((p - 0.15) / 0.3, 0, 1);
    if (nk > 0 && Sprites.ready('city-night')) {
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = nk;
      g.drawImage(Sprites.get('city-night'), dx, dy, dw, dh); g.globalAlpha = 1;
    }
    ctx.drawImage(cityCv, w.x, vt, w.w, vh);
  }

  // Свет в комнате: оттенок времени поверх всего, тёплые лужицы от ламп, гирлянды и свечи
  function drawLight(p, dark) {
    const [col, a] = lightAt(p);
    ctx.save(); ctx.globalCompositeOperation = 'multiply';
    const [r, g, b] = hex(col);
    ctx.fillStyle = `rgba(${r},${g},${b},${a})`; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (const [x, ly] of L.lamps) {
      const flick = 1 + Math.sin(time * 7 + x) * 0.03;
      const gr = ctx.createRadialGradient(x, ly + 12, 6, x, ly + 12, H * 0.5);
      gr.addColorStop(0, `rgba(255,190,110,${0.3 * dark * flick})`); gr.addColorStop(0.5, `rgba(255,170,90,${0.1 * dark})`); gr.addColorStop(1, 'rgba(255,170,90,0)');
      ctx.fillStyle = gr; ctx.fillRect(x - H * 0.5, 0, H, H);
    }
    for (const [bx, by] of L.bulbs) {
      const gr = ctx.createRadialGradient(bx, by, 1, bx, by, 12);
      gr.addColorStop(0, `rgba(255,220,150,${0.45 * dark})`); gr.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.fillStyle = gr; ctx.fillRect(bx - 12, by - 12, 24, 24);
    }
    if (L.candle) {
      const { x, y } = L.candle, fl = 1 + Math.sin(time * 11) * 0.12 + Math.sin(time * 23) * 0.06;
      const gr = ctx.createRadialGradient(x, y, 2, x, y, 70);
      gr.addColorStop(0, `rgba(255,200,120,${0.4 * dark * fl})`); gr.addColorStop(1, 'rgba(255,200,120,0)');
      ctx.fillStyle = gr; ctx.fillRect(x - 70, y - 70, 140, 140);
    }
    ctx.restore();
  }
  function drawLamps(dark) {
    for (const [x, y] of L.lamps) {
      const glow = 0.12 + dark * 0.3 + Math.sin(time * 3 + x) * 0.02;
      const gr = ctx.createRadialGradient(x, y + 10, 4, x, y + 10, H * 0.35);
      gr.addColorStop(0, `rgba(255,214,140,${glow})`); gr.addColorStop(1, 'rgba(255,214,140,0)');
      ctx.fillStyle = gr; ctx.fillRect(x - H * 0.35, y - H * 0.35, H * 0.7, H * 0.7);
    }
  }
  // Затемнённые края кадра — уютная рамка
  function drawVignette() {
    const gr = ctx.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.35, W / 2, H * 0.55, Math.max(W, H) * 0.75);
    gr.addColorStop(0, 'rgba(14,8,24,0)'); gr.addColorStop(1, 'rgba(14,8,24,.45)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  }

  // ---------- гости ----------
  function moodOf(cu) {
    if (cu.state === 'leave') return cu.happy ? 'joy' : 'angry';
    if (cu.joyT > 0) return 'joy';
    const f = cu.pat / cu.patMax;
    if (cu.shakeT > 0) return 'angry';
    if (f > 0.6) return 'happy';
    if (f > 0.3) return 'ok';
    return 'worried';
  }

  // Пиксельные значки настроения рядом с головой
  function moodMark(cu) {
    const mood = moodOf(cu), r = cu.r;
    const s = LP * Math.max(1, Math.round(r / (12 * LP)));
    const mx = cu.dx + r * 1.15, my = cu.hy - r * 1.3;
    if (mood === 'joy') {
      for (let i = 0; i < 2; i++) pix(BMP.heart, mx + i * r * 0.5, my - ((time * 20 + i * 11) % 14) - i * r * 0.3, s, '#ff6b8a', INK);
    } else if (mood === 'angry') {
      pix(BMP.anger, mx, my, s, '#ff4a4a', INK);
    } else if (mood === 'worried') {
      pix(BMP.drop, mx, my + (time * 10) % 6, s, '#9fd3ff', INK);
    }
  }

  function drawCustomer(cu, cap) {
    const r = personR(cap);
    cu.r = r;
    const name = cu.reg || (cu.look && cu.look.sprite) || 'g1';
    const im = Sprites.get(name);
    const walking = Math.abs(cu.tx - cu.x) > 1 || cu.state === 'leave';
    // походка — ступеньками, как в старых играх
    let bob = walking ? (Math.sin(time * 9 + cu.phase) > 0 ? r * 0.12 : 0) : (Math.sin(time * 2 + cu.phase) > 0.6 ? -LP : 0);
    if (cu.jumpT > 0) bob += Math.sin((1 - cu.jumpT) * Math.PI) * r * 0.5;
    let x = cu.x;
    if (cu.shakeT > 0) x += (Math.sin(time * 70) > 0 ? 1 : -1) * r * 0.12 * cu.shakeT;
    const hgt = r * 5.2;
    const asp = im && im.naturalWidth ? im.naturalWidth / im.naturalHeight : 1;
    const wdt = hgt * asp;
    const bottom = L.counterTop + r * 1.0 - bob; // низ бюста уходит за стойку
    const hy = bottom - hgt + r * 1.05;          // примерно центр головы
    if (Sprites.ready(name)) {
      ctx.save();
      if (cu.state === 'leave' && !cu.happy) ctx.filter = 'saturate(.7)';
      ctx.drawImage(im, snap(x - wdt / 2), snap(bottom - hgt), wdt, hgt);
      ctx.restore();
    } else {
      ctx.fillStyle = '#5a3f5e'; ctx.fillRect(x - r * 1.3, bottom - hgt, r * 2.6, hgt);
    }
    cu.hy = hy; cu.dx = x;
    cu.hit = { x0: x - r * 1.6, y0: hy - r * 1.4, x1: x + r * 1.6, y1: L.counterTop + 10 };
  }

  // ---------- облачко заказа ----------
  function fitText(c, text, maxW, size, weight = 600) {
    let s = size;
    c.font = `${weight} ${s}px ${FONT}`;
    while (s > 8 && c.measureText(text).width > maxW) { s -= 0.5; c.font = `${weight} ${s}px ${FONT}`; }
    return s;
  }

  function drawBubble(cu, cap) {
    if (cu.state !== 'wait' || cu.bubbleT <= 0) return;
    const c = mctx, u = Math.max(1, LP), r = cu.r;
    const sw = slotW(cap);
    const bw = clamp(sw - 8, 78, 156);
    const icon = clamp(r * 0.8, 15, 22);
    const nameS = clamp(r * 0.5, 11, 14);
    const pad = 7;
    const rowH = nameS + 4 + icon + 4;
    const rows = cu.orders.length;
    const bh = pad + rows * rowH + 8 + pad - 2;
    const bx = clamp(cu.dx - bw / 2, 4, W - bw - 4);
    const by = cu.hy - r * 1.35 - 12 - bh;
    // появляется ступенчато: 3 кадра вместо плавного масштаба
    const k = Math.min(1, cu.bubbleT * 5);
    if (k < 0.34) return;
    c.save();
    if (k < 1) { c.globalAlpha = 0.6; }
    if (cu.wiggleT > 0) c.translate(snap(Math.sin(time * 50) * 3 * cu.wiggleT, u), 0);
    const box = pbox(c, bx, by, bw, bh, u * 2, '#fbf1dc', INK, 'rgba(14,8,24,.45)');
    // хвостик — ступеньки вниз к голове
    const tx = snap(clamp(cu.dx, box.x + 16, box.x + box.w - 16), u);
    const ty = box.y + box.h;
    for (let i = 0; i < 3; i++) {
      const hw = (3 - i) * u * 2, yy = ty - u * 2 + i * u * 2;
      c.fillStyle = INK; c.fillRect(tx - hw - u * 2, yy, hw * 2 + u * 4, u * 2);
      c.fillStyle = '#fbf1dc'; c.fillRect(tx - hw, yy, hw * 2, u * 2);
    }
    c.fillStyle = INK; c.fillRect(tx - u * 2, ty + u * 4, u * 4, u * 2);
    // строки заказа
    c.textAlign = 'center'; c.textBaseline = 'top';
    cu.orders.forEach((rid, i) => {
      const y = by + pad + i * rowH;
      const rec = RECIPE[rid];
      const hidden = cu.hidden && !cu.revealed;
      c.fillStyle = '#3a2434';
      const label = hidden ? t('usual') : T(rec.name);
      fitText(c, label, bw - 12, nameS);
      c.fillText(label, bx + bw / 2, y);
      const iy = y + nameS + 4;
      if (hidden) {
        pbox(c, bx + bw / 2 - icon / 2, iy, icon, icon, u * 2, '#f2c46a', INK);
        c.fillStyle = INK; c.font = `700 ${icon * 0.8}px ${FONT}`;
        c.textBaseline = 'middle'; c.fillText('?', bx + bw / 2, iy + icon / 2 + 1); c.textBaseline = 'top';
      } else {
        const n = rec.ings.length, gap = 2;
        const isz = Math.min(icon, (bw - 12 - gap * (n - 1)) / n);
        const total = n * isz + (n - 1) * gap;
        rec.ings.forEach((ing, j) => {
          const img = ICON_IMG[ing];
          if (img && img.complete) c.drawImage(img, bx + bw / 2 - total / 2 + j * (isz + gap), iy + (icon - isz) / 2, isz, isz);
        });
      }
    });
    // терпение — сегментами
    const f = clamp(cu.pat / cu.patMax, 0, 1);
    const segs = 8, barY = snap(by + bh - pad - 6, u), segW = (bw - 18) / segs;
    const col = f > 0.5 ? '#7fc28a' : f > 0.25 ? '#f2b84b' : '#e0604f';
    const blinkLow = f < 0.2 && Math.sin(time * 14) > 0;
    for (let i = 0; i < segs; i++) {
      c.fillStyle = i < Math.ceil(f * segs) ? (blinkLow ? '#ff3b3b' : col) : '#e3d3b6';
      c.fillRect(snap(bx + 9 + i * segW, u), barY, Math.max(u, snap(segW - u * 2, u)), u * 3);
    }
    // имя постоянного гостя — табличка сверху
    if (cu.reg) {
      const reg = REGULAR[cu.reg];
      const st = regState(cu.reg);
      const label = `${T(reg.name)} ♥${st.hearts}`;
      c.font = `700 ${nameS - 1}px ${FONT}`;
      const lw = Math.min(bw + 10, c.measureText(label).width + 16);
      const lx = clamp(cu.dx - lw / 2, 4, W - lw - 4), ly = by - nameS - 10;
      pbox(c, lx, ly, lw, nameS + 8, u * 2, '#7a3a5a', INK);
      c.fillStyle = '#fbf1dc'; fitText(c, label, lw - 10, nameS - 1, 700);
      c.textBaseline = 'middle'; c.fillText(label, lx + lw / 2, ly + (nameS + 8) / 2 + 1);
    }
    c.restore();
    cu.bub = { x0: bx, y0: by - (cu.reg ? nameS + 10 : 0), x1: bx + bw, y1: by + bh + 8 };
  }

  // ---------- предметы на стойке и кот ----------
  function drawSprite(name, x, bottom, h, anchor = 'left') {
    const im = Sprites.get(name);
    if (!Sprites.ready(name)) return 0;
    const w = h * im.naturalWidth / im.naturalHeight;
    const left = anchor === 'right' ? x - w : anchor === 'center' ? x - w / 2 : x;
    ctx.drawImage(im, snap(left), snap(bottom - h), w, h);
    return w;
  }
  function drawCounterItems(busy) {
    const base = L.counterMid;
    const s = clamp(H / 420, 0.6, 1.1);
    const wide = W >= 480;
    let right = W - 8;
    if (upLevel('tipjar') > 0) right -= drawSprite('tipjar', right, base, 40 * s, 'right') + 8;
    if (wide) right -= drawSprite('register', right, base, 52 * s, 'right') + 10;
    if (upLevel('pastry') > 0) {
      if (wide) right -= drawSprite('pastry', right, base, 54 * s, 'right') + 8;
      else drawSprite('pastry', 6, base, 46 * s);
    }
    if (L.mw && Sprites.ready('machine')) {
      const im = Sprites.get('machine');
      const mw = L.mw - 6, mh = mw * im.naturalHeight / im.naturalWidth, mx = 8, top = base - mh;
      ctx.drawImage(im, snap(mx), snap(top), mw, mh);
      // пар: из группы, когда варится эспрессо; из трубки слева, когда взбивается молоко
      if (busy.espresso > 0 && Math.random() < 0.2) particles.push({ x: mx + mw * rand(0.3, 0.7), y: top + mh * 0.35, vx: rand(-6, 6), vy: -25, life: 1.3, kind: 'steam', size: 4 * s, rot: 0, vr: 0 });
      if (busy.frother > 0 && Math.random() < 0.5) particles.push({ x: mx + mw * 0.08, y: top + mh * 0.6, vx: rand(-14, 14), vy: rand(-50, -30), life: 1.1, kind: 'steam', size: rand(4, 7) * s, rot: 0, vr: 0 });
    }
  }

  // Свеча в бутылке кьянти — горит всю ночную смену
  function drawCandle() {
    const s = clamp(H / 420, 0.6, 1.1);
    const x = L.mw ? L.mw + 22 * s : W * 0.5 + 40 * s, y = L.counterMid, h = 50 * s;
    drawSprite('candle', x, y, h, 'center');
    // живой огонёк поверх нарисованного
    const fy = y - h * 0.95, fl = Math.sin(time * 13) > 0 ? LP : 0;
    ctx.fillStyle = '#ffe9a0'; ctx.fillRect(snap(x - LP), snap(fy - fl - LP * 2), LP * 2, LP * 2);
    L.candle = { x, y: fy };
  }

  // Рыжий кот: появляется на стойке, сворачивается клубком и спит, мурчит, когда гладят
  function drawCat(cat) {
    if (!cat || !Sprites.ready('cat')) return;
    const im = Sprites.get('cat');
    const s = clamp(H / 420, 0.6, 1.1);
    const h = 34 * s, w = h * im.naturalWidth / im.naturalHeight;
    if (cat.sx == null && cat.state !== 'in') cat.sx = cat.x;
    let x, a;
    if (cat.state === 'in') { x = cat.tx; a = 1 - clamp(Math.abs(cat.tx - cat.x) / 160, 0, 1); }
    else if (cat.state === 'out') { x = cat.sx; a = clamp(1 - (cat.x - cat.sx) / 120, 0, 1); }
    else { x = cat.x; a = 1; }
    const y = L.counterMid + 2;
    const breathe = Math.sin(time * 1.8) > 0 ? LP : 0;
    ctx.save(); ctx.globalAlpha = a;
    if ((cat.dir || 1) === 1) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); }
    ctx.drawImage(im, snap(x - w / 2), snap(y - h - breathe), w, h + breathe);
    ctx.restore();
    if (cat.state === 'sit' && a > 0.9) {
      const zs = LP * Math.max(1, Math.round(s * 1.5));
      const k = (time * 0.6) % 1;
      ctx.globalAlpha = 1 - k; pix(BMP.z, x + w * 0.3 + k * 10, y - h - 6 - k * 18, zs, '#fbf1dc', INK); ctx.globalAlpha = 1;
    }
    if (cat.petT > 0) pix(BMP.heart, x - w * 0.1, y - h - 10 - (Math.sin(time * 6) > 0 ? LP * 2 : 0), LP * 2, '#ff6b8a', INK);
    cat.hit = { x0: x - w / 2 - 6, y0: y - h - 10, x1: x + w / 2 + 6, y1: y + 6 };
  }

  // ---------- частицы и тексты ----------
  function burst(x, y, kind, n = 10, color) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), sp = rand(60, 220);
      particles.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, life: rand(0.6, 1.1), max: 1,
        kind, color: color || pick(['#e07a5f', '#b58adf', '#f2cc8f', '#f19aa8', '#8fd0f5']), size: rand(4, 8), rot: 0, vr: 0,
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
    // гроза в сильный дождь: редкие вспышки и раскат грома
    flash = Math.max(0, flash - dt * 3);
    if (rainK() > 0.8 && Math.random() < dt * 0.04) { flash = 1; setTimeout(() => Sound.play('thunder'), rand(300, 1200)); }
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

  // Частицы — в пиксельном мире
  function drawParticles() {
    for (const p of particles) {
      ctx.globalAlpha = clamp(p.life * 1.5, 0, 1);
      if (p.kind === 'steam') {
        ctx.globalAlpha = clamp(p.life * 0.45, 0, 0.5); ctx.fillStyle = '#fff';
        const sz = snap(p.size);
        ctx.fillRect(snap(p.x - sz / 2), snap(p.y - sz / 4), sz, sz / 2); ctx.fillRect(snap(p.x - sz / 4), snap(p.y - sz / 2), sz / 2, sz);
      } else if (p.kind === 'heart') {
        pix(BMP.heart, p.x, p.y, LP * Math.max(1, Math.round(p.size / 6)), '#ff6b8a');
      } else {
        ctx.fillStyle = p.color; const sz = Math.max(LP, snap(p.size * 0.7)); ctx.fillRect(snap(p.x), snap(p.y), sz, p.kind === 'spark' ? sz : Math.max(LP, sz / 2));
      }
    }
    ctx.globalAlpha = 1;
  }
  // Монетки и надписи — чётко, поверх
  function drawOverlayFx() {
    const c = mctx;
    const coin = ICON_IMG.coin;
    for (const f of flyers) {
      if (f.t < 0) continue;
      const k = f.t / f.dur, e = k * k;
      const x = (1 - e) * (1 - e) * f.x0 + 2 * (1 - e) * e * f.cx + e * e * f.tx;
      const y = (1 - e) * (1 - e) * f.y0 + 2 * (1 - e) * e * f.cy + e * e * f.ty;
      const s = 18 * (1 - k * 0.3);
      if (coin.complete) c.drawImage(coin, x - s / 2, y - s / 2, s, s);
    }
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'miter';
    for (const t of texts) {
      c.globalAlpha = clamp(t.life * 2, 0, 1);
      const pop = t.life > 1 ? 1.25 : 1; // короткий «прыжок» без плавности
      c.font = `700 ${Math.round(t.size * pop)}px ${FONT}`;
      c.lineWidth = 4; c.strokeStyle = INK; c.strokeText(t.text, t.x, t.y);
      c.fillStyle = t.color === '#3b2a22' ? '#fbf1dc' : t.color; c.fillText(t.text, t.x, t.y);
    }
    c.globalAlpha = 1;
  }

  function drawPointer(cu) {
    if (!cu || !cu.hit) return;
    const s = LP * 2;
    pix(BMP.arrow, cu.dx - s * 3.5, cu.hy - cu.r * 2.6 + (Math.sin(time * 6) > 0 ? s : 0), s, '#fbf1dc', INK);
  }

  // ---------- кадр ----------
  function render(state) {
    const name = L.bg.name, im = Sprites.get(name);
    mctx.setTransform(1, 0, 0, 1, 0, 0);
    if (!Sprites.ready(name)) { mctx.fillStyle = '#1e1420'; mctx.fillRect(0, 0, cv.width, cv.height); return; }
    if (!bg) buildBg();
    // ----- мир в маленьком буфере -----
    ctx = lctx;
    const k = DPR / PX;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'medium';
    if (shake > 0) ctx.translate(snap(rand(-1, 1) * shake * 6), snap(rand(-1, 1) * shake * 6));
    const p = state.sky, dark = darkAt(p);
    ctx.fillStyle = '#1e1420'; ctx.fillRect(-20, -20, W + 40, H + 40);
    drawWindow(p);
    ctx.drawImage(im, L.bg.x, L.bg.y, L.bg.w, L.bg.h);
    drawLamps(dark);
    const cap = state.cap || 3;
    for (const cu of state.customers) drawCustomer(cu, cap);
    // стойка поверх гостей — нижняя полоса той же картинки
    const ct = L.counterTop, sy = (ct - L.bg.y) / L.bg.scale;
    ctx.drawImage(im, 0, sy, im.naturalWidth, im.naturalHeight - sy, L.bg.x, ct, L.bg.w, L.bg.h - (ct - L.bg.y));
    drawCounterItems(state.busy || {});
    drawCandle();
    drawCat(state.cat);
    drawLight(p, dark);
    drawVignette();
    for (const cu of state.customers) if (cu.r && cu.state !== 'enter') moodMark(cu);
    drawPointer(state.pointer);
    drawParticles();
    // ----- растягиваем без сглаживания -----
    mctx.imageSmoothingEnabled = false;
    mctx.drawImage(lo, 0, 0, lo.width * PX, lo.height * PX);
    // ----- чёткий слой: меню мелом, облачка, надписи -----
    ctx = mctx;
    mctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    mctx.imageSmoothingEnabled = true;
    mctx.globalAlpha = 0.85; mctx.drawImage(bg, 0, 0, W, H); mctx.globalAlpha = 1;
    for (const cu of state.customers) drawBubble(cu, cap);
    drawOverlayFx();
  }

  // Портрет гостя для экрана «Гости»: уменьшенный и растянутый без сглаживания — как в старых играх
  const portraitLo = document.createElement('canvas');
  function drawPortrait(canvas, id, locked) {
    const size = 72, d = Math.min(window.devicePixelRatio || 1, 2.5), n = 40;
    canvas.width = size * d; canvas.height = size * d;
    canvas.style.width = size + 'px'; canvas.style.height = size + 'px';
    const c = canvas.getContext('2d');
    portraitLo.width = n; portraitLo.height = n;
    const g = portraitLo.getContext('2d');
    g.fillStyle = locked ? '#3a3040' : '#4a2f4a'; g.fillRect(0, 0, n, n);
    g.fillStyle = locked ? '#2a2230' : '#5e3b5a'; g.fillRect(0, n * 0.7, n, n * 0.3);
    if (Sprites.ready(id)) {
      const im = Sprites.get(id);
      g.save();
      if (locked) { g.filter = 'grayscale(1) brightness(.5)'; }
      const h = n * 1.1, w = h * im.naturalWidth / im.naturalHeight;
      g.drawImage(im, n / 2 - w / 2, n * 0.04, w, h);
      g.restore();
    }
    c.imageSmoothingEnabled = false;
    c.drawImage(portraitLo, 0, 0, canvas.width, canvas.height);
  }

  return {
    resize, invalidate, render, updateFx, setSafeTop(v) { safeTop = v; resize(); }, burst, floatText, flyCoin, addShake, drawPortrait,
    slotX, personR, get W() { return W; }, get H() { return H; }, get counterTop() { return L.counterTop; },
  };
})();
