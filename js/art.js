// Отрисовка сцены: кофейня, гости, облачка заказов, кот, частицы.

const Art = (() => {
  const cv = document.getElementById('scene');
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  let bg = null, counter = null;
  let time = 0, shake = 0;
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
  function resize() {
    const r = cv.parentElement.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2.5);
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    L.counterTop = Math.round(H - clamp(H * 0.15, 46, 100));
    const ww = Math.round(Math.min(W * 0.36, 280));
    L.win = { x: Math.round(W * 0.05), y: Math.round(H * 0.1), w: ww, h: Math.round(Math.min(H * 0.4, ww * 1.35)) };
    const bw = Math.round(Math.min(W * 0.3, 220));
    L.board = { w: bw, h: Math.round(Math.min(H * 0.25, bw * 0.8)) };
    L.board.x = Math.round(W * 0.95 - L.board.w); L.board.y = Math.round(H * 0.1);
    invalidate();
  }
  function invalidate() { bg = null; counter = null; }

  function slotW(cap) { return (W * 0.92) / cap; }
  function slotX(i, cap) { return W * 0.04 + (i + 0.5) * slotW(cap); }
  function personR(cap) { return clamp(Math.min(slotW(cap) / 4.2, (L.counterTop - 40) / 7), 12, 32); }

  // ---------- фон ----------
  function makeLayer() {
    const c = document.createElement('canvas');
    c.width = cv.width; c.height = cv.height;
    const g = c.getContext('2d'); g.scale(DPR, DPR);
    return [c, g];
  }

  function buildBg() {
    const [c, g] = makeLayer();
    const ct = L.counterTop;
    // стена
    const wall = g.createLinearGradient(0, 0, 0, ct);
    wall.addColorStop(0, '#f3dcbd'); wall.addColorStop(1, '#ecd0aa');
    g.fillStyle = wall; g.fillRect(0, 0, W, ct + 10);
    g.fillStyle = 'rgba(160,110,70,.06)';
    for (let x = 0; x < W; x += 28) g.fillRect(x, 0, 12, ct);
    // деревянная панель
    const wy = Math.round(ct - Math.max(40, H * 0.2));
    g.fillStyle = '#c48b5f'; g.fillRect(0, wy, W, ct - wy + 10);
    g.fillStyle = '#a8714a'; g.fillRect(0, wy, W, 6);
    g.strokeStyle = 'rgba(90,50,25,.35)'; g.lineWidth = 2;
    for (let x = 10; x < W; x += 70) { rr(g, x, wy + 14, 56, ct - wy - 18, 6); g.stroke(); }

    // окно (стекло вырезаем — небо рисуется каждый кадр)
    const w = L.win;
    g.fillStyle = '#7a4e33'; rr(g, w.x - 8, w.y - 8, w.w + 16, w.h + 16, 10); g.fill();
    g.clearRect(w.x, w.y, w.w, w.h);
    g.fillStyle = '#7a4e33';
    g.fillRect(w.x + w.w / 2 - 3, w.y, 6, w.h);
    g.fillRect(w.x, w.y + w.h * 0.45 - 3, w.w, 6);
    g.fillStyle = '#a8714a'; rr(g, w.x - 14, w.y + w.h + 4, w.w + 28, 10, 4); g.fill();
    // горшок на подоконнике
    plant(g, w.x + w.w * 0.82, w.y + w.h + 4, Math.min(1, W / 600) * 0.9, 1);

    // меловая доска
    const b = L.board;
    g.fillStyle = '#8a5a3c'; rr(g, b.x - 6, b.y - 6, b.w + 12, b.h + 12, 8); g.fill();
    g.fillStyle = '#2f3b36'; rr(g, b.x, b.y, b.w, b.h, 4); g.fill();
    g.fillStyle = '#f5efe4'; g.textAlign = 'center'; g.textBaseline = 'top';
    const fs = clamp(b.w / 9, 10, 18);
    g.font = `900 ${fs}px Nunito, ui-rounded, system-ui, sans-serif`;
    g.fillText('МЕНЮ', b.x + b.w / 2, b.y + 6);
    g.font = `700 ${fs * 0.72}px Nunito, ui-rounded, system-ui, sans-serif`;
    const rec = S.recipes.slice(-4).reverse();
    const lineH = Math.min(fs * 0.95, (b.h - fs * 1.8) / 4);
    rec.forEach((id, i) => {
      const y = b.y + fs * 1.6 + i * lineH;
      if (y + lineH > b.y + b.h) return;
      g.textAlign = 'left'; g.fillText(RECIPE[id].name, b.x + 8, y);
      g.textAlign = 'right'; g.fillText(Math.round(RECIPE[id].price * Stats.priceMult()), b.x + b.w - 8, y);
    });

    // полки
    const shY = b.y + b.h + Math.max(16, H * 0.05);
    const shX = b.x - 4, shW = b.w + 8;
    const rnd = seeded(7);
    for (let k = 0; k < 2; k++) {
      const y = shY + k * Math.max(34, H * 0.1);
      if (y > wy - 10) break;
      let x = shX + 6;
      while (x < shX + shW - 22) {
        const t = rnd();
        const s = clamp(H / 420, 0.6, 1.1);
        if (t < 0.35) { jar(g, x, y, s, rnd); x += 22 * s + 6; }
        else if (t < 0.6) { cupStack(g, x, y, s); x += 24 * s + 6; }
        else { plant(g, x + 10 * s, y, s * 0.7, rnd() * 3 | 0); x += 24 * s + 6; }
      }
      g.fillStyle = '#7a4e33'; g.fillRect(shX, y, shW, 6);
      g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(shX, y + 6, shW, 4);
    }

    // вывеска
    const signW = Math.min(W * 0.3, 200), sx = W / 2 - signW / 2, sy = H * 0.04;
    if (upLevel('sign') > 0) {
      g.save();
      g.font = `900 ${signW / 4.2}px Nunito, ui-rounded, system-ui, sans-serif`;
      g.textAlign = 'center'; g.textBaseline = 'top';
      g.shadowColor = '#ff6fa3'; g.shadowBlur = 18;
      g.fillStyle = '#ffd1e3'; g.fillText('Пенка', W / 2, sy);
      g.shadowBlur = 6; g.fillText('Пенка', W / 2, sy);
      g.restore();
    } else {
      g.fillStyle = '#a8714a'; rr(g, sx + signW * 0.15, sy, signW * 0.7, signW / 4.4, 8); g.fill();
      g.fillStyle = '#fff3df'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = `900 ${signW / 6.5}px Nunito, ui-rounded, system-ui, sans-serif`;
      g.fillText('Пенка', W / 2, sy + signW / 8.8);
    }

    // подарки от постоянных гостей
    const giftY = sy + signW / 3.2 + 6;
    if (regState('alisa').hearts >= MAX_HEARTS) painting(g, W / 2 - signW * 0.42, giftY, signW * 0.36);
    if (regState('lev').hearts >= MAX_HEARTS) starMap(g, W / 2 + signW * 0.06, giftY, signW * 0.36);
    if (regState('vera').hearts >= MAX_HEARTS) scarf(g, w.x + w.w + 18, w.y + 10);
    bg = c;
  }

  function jar(g, x, y, s, rnd) {
    const w = 20 * s, h = 26 * s;
    g.fillStyle = 'rgba(255,255,255,.55)'; rr(g, x, y - h, w, h, 5 * s); g.fill();
    g.strokeStyle = '#3b2a22'; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = rnd() < 0.5 ? '#6b4128' : '#a8643a';
    rr(g, x + 2, y - h * 0.65, w - 4, h * 0.62, 4 * s); g.fill();
    g.fillStyle = '#c9a227'; g.fillRect(x - 1, y - h - 4 * s, w + 2, 5 * s);
  }
  function cupStack(g, x, y, s) {
    for (let i = 0; i < 3; i++) {
      const cy = y - (i + 1) * 9 * s;
      g.fillStyle = ['#fff', '#e07a5f', '#81b29a'][i];
      g.beginPath(); g.moveTo(x + 2 * s, cy); g.lineTo(x + 22 * s, cy); g.lineTo(x + 19 * s, cy + 9 * s); g.lineTo(x + 5 * s, cy + 9 * s); g.closePath();
      g.fill(); g.strokeStyle = '#3b2a22'; g.lineWidth = 1.5; g.stroke();
    }
  }
  function plant(g, x, y, s, kind) {
    g.fillStyle = '#5f9a5c';
    const leaves = kind === 1 ? 7 : 5;
    for (let i = 0; i < leaves; i++) {
      const a = -Math.PI / 2 + (i - (leaves - 1) / 2) * 0.42;
      g.save(); g.translate(x, y - 16 * s); g.rotate(a + Math.PI / 2);
      g.beginPath(); g.ellipse(0, -12 * s, 5 * s, 13 * s, 0, 0, Math.PI * 2);
      g.fillStyle = i % 2 ? '#6fae6a' : '#4f8a4c'; g.fill(); g.restore();
    }
    g.fillStyle = kind === 2 ? '#81b29a' : '#e07a5f';
    g.beginPath(); g.moveTo(x - 11 * s, y - 18 * s); g.lineTo(x + 11 * s, y - 18 * s); g.lineTo(x + 8 * s, y); g.lineTo(x - 8 * s, y); g.closePath();
    g.fill(); g.strokeStyle = '#3b2a22'; g.lineWidth = 1.5; g.stroke();
  }
  function painting(g, x, y, w) {
    const h = w * 0.7;
    g.fillStyle = '#c9a227'; rr(g, x, y, w, h, 3); g.fill();
    g.fillStyle = '#bfe3f5'; g.fillRect(x + 4, y + 4, w - 8, h - 8);
    g.fillStyle = '#81b29a'; g.beginPath(); g.moveTo(x + 4, y + h - 4); g.quadraticCurveTo(x + w * 0.4, y + h * 0.35, x + w - 4, y + h - 4); g.fill();
    g.fillStyle = '#f4c542'; g.beginPath(); g.arc(x + w * 0.75, y + h * 0.3, w * 0.08, 0, 7); g.fill();
  }
  function starMap(g, x, y, w) {
    const h = w * 0.7;
    g.fillStyle = '#5a3a2a'; rr(g, x, y, w, h, 3); g.fill();
    g.fillStyle = '#26305a'; g.fillRect(x + 4, y + 4, w - 8, h - 8);
    const r = seeded(3);
    g.fillStyle = '#fff';
    for (let i = 0; i < 12; i++) g.fillRect(x + 6 + r() * (w - 12), y + 6 + r() * (h - 12), 1.6, 1.6);
    g.fillStyle = '#e07a5f'; g.beginPath(); g.arc(x + w / 2, y + h / 2, w * 0.08, 0, 7); g.fill();
  }
  function scarf(g, x, y) {
    g.fillStyle = '#7a4e33'; g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill();
    g.fillStyle = '#b5556a';
    g.fillRect(x - 6, y, 12, 46);
    g.fillStyle = '#f2cc8f';
    for (let i = 0; i < 4; i++) g.fillRect(x - 6, y + 6 + i * 10, 12, 3);
  }

  function buildCounter() {
    const [c, g] = makeLayer();
    const ct = L.counterTop;
    const front = g.createLinearGradient(0, ct, 0, H);
    front.addColorStop(0, '#8a5a3c'); front.addColorStop(1, '#5e3a27');
    g.fillStyle = front; g.fillRect(0, ct, W, H - ct);
    g.strokeStyle = 'rgba(40,20,10,.25)'; g.lineWidth = 2;
    for (let x = 30; x < W; x += 48) { g.beginPath(); g.moveTo(x, ct + 16); g.lineTo(x, H); g.stroke(); }
    g.fillStyle = '#f0d0a8'; rr(g, -10, ct - 8, W + 20, 18, 6); g.fill();
    g.fillStyle = '#d9ad80'; g.fillRect(0, ct + 4, W, 6);
    g.strokeStyle = '#3b2a22'; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(0, ct - 8); g.lineTo(W, ct - 8); g.stroke();
    if (H - ct > 40) {
      g.fillStyle = 'rgba(255,240,220,.18)';
      g.font = `900 ${clamp(W / 26, 12, 22)}px Nunito, ui-rounded, system-ui, sans-serif`;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('ПЕНКА · кофе с любовью', W / 2, ct + (H - ct) / 2 + 6);
    }
    counter = c;
  }

  // ---------- небо за окном ----------
  const SKY = [
    [0, '#ffc89a', '#ffe8c7'], [0.25, '#86c6ee', '#d7f0ff'], [0.6, '#7fbfe8', '#ffe2b8'],
    [0.8, '#ee8a5f', '#f9c98b'], [1, '#34356a', '#86699f'],
  ];
  function skyAt(p) {
    for (let i = 0; i < SKY.length - 1; i++) {
      const a = SKY[i], b = SKY[i + 1];
      if (p <= b[0]) { const t = (p - a[0]) / (b[0] - a[0]); return [mix(a[1], b[1], t), mix(a[2], b[2], t)]; }
    }
    return [SKY[4][1], SKY[4][2]];
  }
  function drawSky(p) {
    const w = L.win;
    const [top, bot] = skyAt(p);
    const gr = ctx.createLinearGradient(0, w.y, 0, w.y + w.h);
    gr.addColorStop(0, top); gr.addColorStop(1, bot);
    ctx.fillStyle = gr; ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.save(); ctx.beginPath(); ctx.rect(w.x, w.y, w.w, w.h); ctx.clip();
    const dark = clamp((p - 0.7) / 0.3, 0, 1);
    // солнце / луна
    const sx = w.x + w.w * lerp(0.15, 0.9, p), sy = w.y + w.h * (0.75 - Math.sin(p * Math.PI) * 0.5);
    ctx.fillStyle = dark > 0.6 ? '#f6f1d5' : '#ffe08a';
    ctx.beginPath(); ctx.arc(sx, sy, Math.min(w.w, w.h) * 0.09, 0, 7); ctx.fill();
    if (dark > 0.3) {
      ctx.fillStyle = `rgba(255,255,255,${dark * 0.8})`;
      const r = seeded(11);
      for (let i = 0; i < 14; i++) ctx.fillRect(w.x + r() * w.w, w.y + r() * w.h * 0.5, 1.5, 1.5);
    }
    // облака
    ctx.fillStyle = `rgba(255,255,255,${0.7 - dark * 0.5})`;
    for (let i = 0; i < 2; i++) {
      const cx = w.x + ((time * 6 + i * w.w * 0.6) % (w.w + 80)) - 40, cy = w.y + w.h * (0.2 + i * 0.15);
      ctx.beginPath(); ctx.ellipse(cx, cy, 22, 8, 0, 0, 7); ctx.ellipse(cx + 14, cy - 5, 14, 8, 0, 0, 7); ctx.fill();
    }
    // крыши домов
    const city = mix('#c9a98a', '#2d2a48', dark);
    ctx.fillStyle = city;
    const r = seeded(5);
    let x = w.x;
    while (x < w.x + w.w) {
      const bw = 24 + r() * 30, bh = w.h * (0.18 + r() * 0.22);
      ctx.fillRect(x, w.y + w.h - bh, bw - 3, bh);
      if (dark > 0.2) {
        ctx.fillStyle = `rgba(255,214,120,${dark})`;
        for (let k = 0; k < 3; k++) if (r() < 0.6) ctx.fillRect(x + 5 + k * 7, w.y + w.h - bh + 8 + (k % 2) * 10, 4, 5);
        ctx.fillStyle = city;
      } else { r(); r(); r(); }
      x += bw;
    }
    ctx.restore();
    return dark;
  }

  function drawLamps(dark) {
    const xs = [W * 0.3, W * 0.7];
    const len = H * 0.07;
    for (const x of xs) {
      ctx.strokeStyle = '#3b2a22'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, len); ctx.stroke();
      const glow = 0.25 + dark * 0.5 + Math.sin(time * 3 + x) * 0.02;
      const gr = ctx.createRadialGradient(x, len + 10, 4, x, len + 10, H * 0.35);
      gr.addColorStop(0, `rgba(255,214,140,${glow})`); gr.addColorStop(1, 'rgba(255,214,140,0)');
      ctx.fillStyle = gr; ctx.fillRect(x - H * 0.35, 0, H * 0.7, H * 0.5);
      ctx.fillStyle = '#e07a5f';
      ctx.beginPath(); ctx.moveTo(x - 16, len + 12); ctx.quadraticCurveTo(x, len - 8, x + 16, len + 12); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(x, len + 13, 5, 0, Math.PI); ctx.fill();
    }
  }

  // ---------- персонажи ----------
  function drawPerson(c, look, x, hy, r, mood, blink, bottom) {
    const ink = '#3b2a22';
    c.lineWidth = Math.max(1.6, r * 0.09); c.strokeStyle = ink; c.lineJoin = 'round'; c.lineCap = 'round';
    const acc = look.acc || [];
    const sy = hy + r * 0.82;
    // шея
    c.fillStyle = shade(look.skin, -0.08);
    c.fillRect(x - r * 0.28, hy + r * 0.6, r * 0.56, r * 0.4);
    // тело
    c.fillStyle = look.shirt;
    rr(c, x - r * 1.35, sy, r * 2.7, bottom - sy + r, r * 0.95); c.fill(); c.stroke();
    c.fillStyle = shade(look.shirt, -0.18);
    c.beginPath(); c.moveTo(x - r * 0.4, sy + 1); c.lineTo(x, sy + r * 0.45); c.lineTo(x + r * 0.4, sy + 1); c.closePath(); c.fill();
    if (acc.includes('scarf')) {
      c.fillStyle = '#e9c46a'; rr(c, x - r * 0.9, hy + r * 0.72, r * 1.8, r * 0.42, r * 0.2); c.fill(); c.stroke();
      rr(c, x + r * 0.25, hy + r * 0.95, r * 0.4, r * 0.9, r * 0.15); c.fill(); c.stroke();
    }
    // волосы сзади
    c.fillStyle = look.hair;
    if (look.style === 'long') { rr(c, x - r * 1.12, hy - r * 0.6, r * 2.24, r * 2.0, r * 0.9); c.fill(); c.stroke(); }
    if (look.style === 'bob') { rr(c, x - r * 1.16, hy - r * 0.7, r * 2.32, r * 1.6, r * 0.7); c.fill(); c.stroke(); }
    if (look.style === 'ponytail') { c.beginPath(); c.ellipse(x + r * 1.0, hy + r * 0.1, r * 0.32, r * 0.75, -0.3, 0, 7); c.fill(); c.stroke(); }
    if (look.style === 'bun') { c.beginPath(); c.arc(x, hy - r * 1.08, r * 0.42, 0, 7); c.fill(); c.stroke(); }
    // уши и голова
    c.fillStyle = look.skin;
    for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * r * 0.98, hy + r * 0.1, r * 0.22, 0, 7); c.fill(); c.stroke(); }
    c.beginPath(); c.arc(x, hy, r, 0, 7); c.fill(); c.stroke();
    // волосы спереди
    c.fillStyle = look.hair;
    const cap = () => {
      c.beginPath();
      c.arc(x, hy, r * 1.04, Math.PI + 0.12, -0.12);
      c.quadraticCurveTo(x + r * 0.75, hy - r * 0.32, x + r * 0.35, hy - r * 0.5);
      c.quadraticCurveTo(x - r * 0.05, hy - r * 0.28, x - r * 0.45, hy - r * 0.55);
      c.quadraticCurveTo(x - r * 0.85, hy - r * 0.35, x - r * 1.01, hy - r * 0.12);
      c.closePath(); c.fill(); c.stroke();
    };
    switch (look.style) {
      case 'bald':
        for (const s of [-1, 1]) { c.beginPath(); c.ellipse(x + s * r * 0.86, hy - r * 0.18, r * 0.2, r * 0.32, 0, 0, 7); c.fill(); }
        break;
      case 'curly':
        for (let i = 0; i < 8; i++) {
          const a = Math.PI + 0.1 + (i / 7) * (Math.PI - 0.2);
          c.beginPath(); c.arc(x + Math.cos(a) * r * 0.92, hy + Math.sin(a) * r * 0.92, r * 0.34, 0, 7); c.fill(); c.stroke();
        }
        c.beginPath(); c.arc(x, hy - r * 0.35, r * 0.75, Math.PI, 0); c.fill();
        break;
      case 'spiky':
        c.beginPath(); c.moveTo(x - r * 1.0, hy - r * 0.2);
        for (let i = 0; i <= 5; i++) {
          const a = Math.PI + (i / 5) * Math.PI;
          c.lineTo(x + Math.cos(a - 0.2) * r * 1.35, hy + Math.sin(a - 0.2) * r * 1.35);
          c.lineTo(x + Math.cos(a + 0.12) * r * 0.95, hy + Math.sin(a + 0.12) * r * 0.95);
        }
        c.lineTo(x + r * 1.0, hy - r * 0.2); c.quadraticCurveTo(x, hy - r * 0.6, x - r * 1.0, hy - r * 0.2);
        c.closePath(); c.fill(); c.stroke();
        break;
      case 'bob':
        c.beginPath(); c.arc(x, hy, r * 1.06, Math.PI + 0.05, -0.05); c.lineTo(x + r * 0.9, hy - r * 0.32); c.lineTo(x - r * 0.9, hy - r * 0.32); c.closePath(); c.fill(); c.stroke();
        break;
      case 'cap':
        cap();
        c.fillStyle = look.hat || '#e07a5f';
        c.beginPath(); c.arc(x, hy - r * 0.2, r * 1.02, Math.PI, 0); c.closePath(); c.fill(); c.stroke();
        c.beginPath(); c.ellipse(x + r * 0.9, hy - r * 0.22, r * 0.75, r * 0.18, 0, 0, 7); c.fill(); c.stroke();
        break;
      case 'beanie':
        c.fillStyle = look.hat || '#81b29a';
        c.beginPath(); c.arc(x, hy - r * 0.25, r * 1.02, Math.PI, 0); c.closePath(); c.fill(); c.stroke();
        rr(c, x - r * 1.08, hy - r * 0.42, r * 2.16, r * 0.38, r * 0.15); c.fill(); c.stroke();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(x, hy - r * 1.3, r * 0.25, 0, 7); c.fill(); c.stroke();
        break;
      default:
        cap();
    }
    // лицо
    const ey = hy + r * 0.08, ex = r * 0.36;
    c.fillStyle = 'rgba(240,110,110,.32)';
    for (const s of [-1, 1]) { c.beginPath(); c.ellipse(x + s * r * 0.6, hy + r * 0.38, r * 0.17, r * 0.1, 0, 0, 7); c.fill(); }
    c.fillStyle = ink;
    if (mood === 'joy') {
      c.lineWidth = Math.max(1.6, r * 0.09);
      for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * ex, ey + r * 0.05, r * 0.12, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    } else {
      for (const s of [-1, 1]) {
        c.beginPath(); c.ellipse(x + s * ex, ey, r * 0.1, Math.max(0.6, r * 0.13 * blink), 0, 0, 7); c.fill();
        if (blink > 0.5) { c.fillStyle = '#fff'; c.beginPath(); c.arc(x + s * ex + r * 0.03, ey - r * 0.04, r * 0.035, 0, 7); c.fill(); c.fillStyle = ink; }
      }
    }
    if (mood === 'angry' || mood === 'worried') {
      c.lineWidth = Math.max(1.4, r * 0.08);
      for (const s of [-1, 1]) {
        c.beginPath();
        const inner = mood === 'angry' ? r * 0.1 : -r * 0.06;
        c.moveTo(x + s * r * 0.2, ey - r * 0.22 + inner); c.lineTo(x + s * r * 0.52, ey - r * 0.3 - inner * 0.4);
        c.stroke();
      }
    }
    if (acc.includes('beard')) {
      c.fillStyle = look.hair;
      c.beginPath(); c.moveTo(x - r * 0.88, hy + r * 0.2);
      c.quadraticCurveTo(x - r * 0.7, hy + r * 1.25, x, hy + r * 1.28);
      c.quadraticCurveTo(x + r * 0.7, hy + r * 1.25, x + r * 0.88, hy + r * 0.2);
      c.quadraticCurveTo(x, hy + r * 0.62, x - r * 0.88, hy + r * 0.2); c.fill(); c.stroke();
    }
    const my = hy + r * 0.48;
    c.lineWidth = Math.max(1.6, r * 0.09);
    c.beginPath();
    if (mood === 'joy') {
      c.fillStyle = '#8a3a2a';
      c.arc(x, my - r * 0.06, r * 0.24, 0, Math.PI); c.closePath(); c.fill(); c.stroke();
    } else if (mood === 'happy') { c.arc(x, my - r * 0.14, r * 0.22, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke(); }
    else if (mood === 'worried') { c.ellipse(x, my, r * 0.09, r * 0.07, 0, 0, 7); c.stroke(); }
    else if (mood === 'angry') { c.arc(x, my + r * 0.16, r * 0.2, 1.2 * Math.PI, 1.8 * Math.PI); c.stroke(); }
    else { c.moveTo(x - r * 0.13, my); c.lineTo(x + r * 0.13, my); c.stroke(); }
    // аксессуары
    if (acc.includes('glasses')) {
      c.lineWidth = Math.max(1.4, r * 0.07);
      for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * ex, ey, r * 0.21, 0, 7); c.stroke(); }
      c.beginPath(); c.moveTo(x - ex + r * 0.21, ey); c.lineTo(x + ex - r * 0.21, ey); c.stroke();
    }
    if (acc.includes('headphones')) {
      c.lineWidth = r * 0.16; c.strokeStyle = '#3d405b';
      c.beginPath(); c.arc(x, hy - r * 0.05, r * 1.12, Math.PI + 0.25, -0.25); c.stroke();
      c.strokeStyle = ink; c.lineWidth = Math.max(1.6, r * 0.09); c.fillStyle = '#e07a5f';
      for (const s of [-1, 1]) { rr(c, x + s * r * 1.05 - r * 0.2, hy - r * 0.2, r * 0.4, r * 0.6, r * 0.15); c.fill(); c.stroke(); }
    }
    if (acc.includes('beret')) {
      c.fillStyle = '#3d405b';
      c.beginPath(); c.ellipse(x - r * 0.15, hy - r * 0.82, r * 0.95, r * 0.38, -0.18, 0, 7); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(x - r * 0.1, hy - r * 1.2); c.lineTo(x - r * 0.05, hy - r * 1.38); c.stroke();
    }
    if (acc.includes('helmet')) {
      c.fillStyle = '#e63946';
      c.beginPath(); c.arc(x, hy - r * 0.12, r * 1.12, Math.PI, 0); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#fff'; c.fillRect(x - r * 0.12, hy - r * 1.22, r * 0.24, r * 1.08);
    }
    if (acc.includes('headband')) {
      c.strokeStyle = '#e07a5f'; c.lineWidth = r * 0.2;
      c.beginPath(); c.arc(x, hy + r * 0.1, r * 0.98, Math.PI * 1.12, Math.PI * 1.88); c.stroke();
      c.strokeStyle = ink;
    }
    if (acc.includes('pencil')) {
      c.save(); c.translate(x + r * 0.55, hy - r * 0.95); c.rotate(0.7);
      c.fillStyle = '#f4c542'; c.fillRect(-r * 0.08, -r * 0.6, r * 0.16, r * 1.0); c.strokeRect(-r * 0.08, -r * 0.6, r * 0.16, r * 1.0);
      c.restore();
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

  function drawCustomer(cu, cap) {
    const r = personR(cap);
    cu.r = r;
    const walking = Math.abs(cu.tx - cu.x) > 1 || cu.state === 'leave';
    let hy = L.counterTop - r * 2.55;
    if (walking) hy -= Math.abs(Math.sin(time * 9 + cu.phase)) * r * 0.18;
    else hy += Math.sin(time * 2 + cu.phase) * r * 0.04;
    if (cu.jumpT > 0) hy -= Math.sin((1 - cu.jumpT) * Math.PI) * r * 0.5;
    let x = cu.x;
    if (cu.shakeT > 0) x += Math.sin(time * 70) * r * 0.15 * cu.shakeT;
    const blinkPhase = (time + cu.phase * 3) % 3.6;
    const blink = blinkPhase < 0.12 ? 0.1 : 1;
    drawPerson(ctx, cu.look, x, hy, r, moodOf(cu), blink, L.counterTop);
    cu.hy = hy; cu.dx = x;
    cu.hit = { x0: x - r * 1.5, y0: hy - r * 1.3, x1: x + r * 1.5, y1: L.counterTop + 10 };
  }

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
      fitText(hidden ? 'Как обычно!' : rec.name, bw - 10, nameS);
      ctx.fillText(hidden ? 'Как обычно!' : rec.name, bx + bw / 2, y);
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
    const col = f > 0.5 ? '#81b29a' : f > 0.25 ? '#f2b84b' : '#e07a5f';
    const blinkLow = f < 0.2 && Math.sin(time * 14) > 0;
    ctx.fillStyle = blinkLow ? '#c4473a' : col;
    rr(ctx, bx + 7, barY, Math.max(6, barW * f), 6, 3); ctx.fill();
    // имя постоянного гостя
    if (cu.reg) {
      const reg = REGULAR[cu.reg];
      const st = regState(cu.reg);
      const label = `${reg.name}  ♥${st.hearts}`;
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
  function drawCounterItems() {
    const ct = L.counterTop - 8;
    const s = clamp(H / 420, 0.6, 1.1);
    if (upLevel('pastry') > 0) {
      const w = 54 * s, h = 34 * s, x = 8, y = ct - h;
      ctx.fillStyle = 'rgba(220,240,250,.55)'; rr(ctx, x, y, w, h, 6); ctx.fill();
      ctx.strokeStyle = '#3b2a22'; ctx.lineWidth = 2; ctx.stroke();
      const n = upLevel('pastry') + 1;
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = '#e8a64a';
        ctx.beginPath(); ctx.ellipse(x + 12 * s + i * 14 * s, y + h - 9 * s, 7 * s, 5 * s, 0, Math.PI, 0); ctx.fill(); ctx.stroke();
      }
    }
    if (upLevel('tipjar') > 0) {
      const w = 26 * s, h = 32 * s, x = W - w - 10, y = ct - h;
      ctx.fillStyle = 'rgba(230,245,250,.6)'; rr(ctx, x, y, w, h, 7 * s); ctx.fill();
      const fill = 0.25 + upLevel('tipjar') * 0.2;
      ctx.fillStyle = '#f4c542'; rr(ctx, x + 3, y + h * (1 - fill), w - 6, h * fill - 3, 4 * s); ctx.fill();
      ctx.strokeStyle = '#3b2a22'; ctx.lineWidth = 2; rr(ctx, x, y, w, h, 7 * s); ctx.stroke();
    }
  }

  function drawCat(cat) {
    if (!cat) return;
    const s = clamp(H / 420, 0.6, 1.1);
    const x = cat.x, y = L.counterTop - 8;
    const sit = cat.state === 'sit';
    const bob = sit ? Math.sin(time * 2) * 1 : Math.abs(Math.sin(time * 10)) * 2;
    ctx.save(); ctx.translate(x, y - bob); ctx.scale(s * (cat.dir || 1), s);
    ctx.strokeStyle = '#3b2a22'; ctx.lineWidth = 2.2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const fur = '#f2a541';
    // хвост
    ctx.strokeStyle = fur; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-14, -6); ctx.quadraticCurveTo(-30, -10 + Math.sin(time * 3) * 6, -24, -30); ctx.stroke();
    ctx.strokeStyle = '#3b2a22'; ctx.lineWidth = 2.2;
    // тело
    ctx.fillStyle = fur;
    ctx.beginPath(); ctx.ellipse(0, -14, 18, sit ? 15 : 11, 0, 0, 7); ctx.fill(); ctx.stroke();
    // голова
    ctx.beginPath(); ctx.moveTo(4, -30); ctx.lineTo(7, -46); ctx.lineTo(13, -36); ctx.lineTo(21, -36); ctx.lineTo(27, -46); ctx.lineTo(30, -30);
    ctx.quadraticCurveTo(32, -16, 17, -16); ctx.quadraticCurveTo(2, -16, 4, -30); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#3b2a22';
    const happy = cat.petT > 0;
    if (happy) {
      ctx.beginPath(); ctx.arc(11, -27, 2.5, Math.PI, 0); ctx.stroke();
      ctx.beginPath(); ctx.arc(23, -27, 2.5, Math.PI, 0); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(11, -27, 2, 0, 7); ctx.arc(23, -27, 2, 0, 7); ctx.fill();
    }
    ctx.fillStyle = '#e07a5f'; ctx.beginPath(); ctx.arc(17, -23, 1.8, 0, 7); ctx.fill();
    ctx.restore();
    cat.hit = { x0: x - 34 * s, y0: y - 50 * s, x1: x + 36 * s, y1: y + 4 };
  }

  // ---------- частицы и тексты ----------
  function burst(x, y, kind, n = 10, color) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), sp = rand(60, 220);
      particles.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, life: rand(0.6, 1.1), max: 1,
        kind, color: color || pick(['#e07a5f', '#81b29a', '#f2cc8f', '#f19aa8', '#8fd0f5']), size: rand(4, 8), rot: rand(0, 6), vr: rand(-8, 8),
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
      p.vy += (p.kind === 'heart' ? -60 : 420) * dt;
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
      if (p.kind === 'heart') {
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
    if (!bg) buildBg();
    if (!counter) buildCounter();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    if (shake > 0) ctx.translate(rand(-1, 1) * shake * 6, rand(-1, 1) * shake * 6);
    const dark = drawSky(state.sky);
    ctx.drawImage(bg, 0, 0, W, H);
    drawLamps(dark);
    const cap = state.cap || 3;
    for (const cu of state.customers) drawCustomer(cu, cap);
    ctx.drawImage(counter, 0, 0, W, H);
    drawCounterItems();
    drawCat(state.cat);
    for (const cu of state.customers) drawBubble(cu, cap);
    drawPointer(state.pointer);
    drawFx();
    if (dark > 0) { ctx.fillStyle = `rgba(60,30,60,${dark * 0.12})`; ctx.fillRect(0, 0, W, H); }
    ctx.restore();
  }

  // Портрет гостя для экрана «Гости»
  function drawPortrait(canvas, look, locked) {
    const size = 72, d = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = size * d; canvas.height = size * d;
    canvas.style.width = size + 'px'; canvas.style.height = size + 'px';
    const c = canvas.getContext('2d');
    c.setTransform(d, 0, 0, d, 0, 0);
    c.fillStyle = locked ? '#d8c8b4' : '#f2cc8f';
    c.beginPath(); c.arc(size / 2, size / 2, size / 2, 0, 7); c.fill();
    c.save(); c.beginPath(); c.arc(size / 2, size / 2, size / 2 - 1, 0, 7); c.clip();
    const l = locked ? { ...look, skin: '#a8927c', hair: '#8f7a65', shirt: '#9c8670', acc: [] } : look;
    drawPerson(c, l, size / 2, size * 0.45, size * 0.24, locked ? 'ok' : 'happy', 1, size + 10);
    c.restore();
  }

  return {
    resize, invalidate, render, updateFx, burst, floatText, flyCoin, addShake, drawPortrait,
    slotX, personR, get W() { return W; }, get H() { return H; }, get counterTop() { return L.counterTop; },
  };
})();
