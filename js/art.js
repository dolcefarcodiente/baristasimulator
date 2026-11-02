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
    // На широких экранах на стойке стоит эспрессо-машина с кофемолкой
    L.mw = W >= 560 ? Math.round(clamp(W * 0.17, 110, 160)) : 0;
    L.ax0 = W * 0.03 + L.mw;
    L.aw = W * 0.94 - L.mw;
    const ww = Math.round(Math.min(W * 0.36, 280));
    L.win = { x: Math.round(W * 0.05), y: Math.round(H * 0.1), w: ww, h: Math.round(Math.min(H * 0.4, ww * 1.35)) };
    const bw = Math.round(Math.min(W * 0.3, 220));
    L.board = { w: bw, h: Math.round(Math.min(H * 0.25, bw * 0.8)) };
    L.board.x = Math.round(W * 0.95 - L.board.w); L.board.y = Math.round(H * 0.1);
    invalidate();
  }
  function invalidate() { bg = null; counter = null; }

  function slotW(cap) { return L.aw / cap; }
  function slotX(i, cap) { return L.ax0 + (i + 0.5) * slotW(cap); }
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
    // белая плитка «метро» с тёплой затиркой
    g.fillStyle = '#e9e1d4'; g.fillRect(0, 0, W, ct + 10);
    const tw = 44, th = 20;
    g.fillStyle = '#f7f2ea'; g.strokeStyle = '#ddd3c5'; g.lineWidth = 1;
    for (let row = 0, y = -th; y < ct; y += th, row++) {
      for (let x = (row % 2 ? -tw / 2 : 0); x < W; x += tw) { rr(g, x + 1.5, y + 1.5, tw - 3, th - 3, 2.5); g.fill(); g.stroke(); }
    }
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, 0, W, ct * 0.3);
    // зелёные деревянные панели понизу
    const wy = Math.round(ct - Math.max(40, H * 0.2));
    g.fillStyle = '#2f6b4f'; g.fillRect(0, wy, W, ct - wy + 10);
    g.fillStyle = '#c9a227'; g.fillRect(0, wy, W, 4);
    g.fillStyle = '#245640'; g.fillRect(0, wy + 4, W, 4);
    g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 2;
    for (let x = 10; x < W; x += 70) { rr(g, x, wy + 16, 56, ct - wy - 20, 4); g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,.12)';
    for (let x = 10; x < W; x += 70) { rr(g, x + 5, wy + 21, 46, ct - wy - 30, 3); g.stroke(); }

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
    g.fillText(LANG === 'en' ? 'MENU' : 'МЕНЮ', b.x + b.w / 2, b.y + 6);
    g.font = `700 ${fs * 0.72}px Nunito, ui-rounded, system-ui, sans-serif`;
    const rec = S.recipes.slice(-4).reverse();
    const lineH = Math.min(fs * 0.95, (b.h - fs * 1.8) / 4);
    rec.forEach((id, i) => {
      const y = b.y + fs * 1.6 + i * lineH;
      if (y + lineH > b.y + b.h) return;
      const price = String(Math.round(RECIPE[id].price * Stats.priceMult()));
      const fsz = fs * 0.72;
      g.font = `700 ${fsz}px Nunito, ui-rounded, system-ui, sans-serif`;
      g.textAlign = 'right'; g.fillText(price, b.x + b.w - 8, y);
      const room = b.w - 22 - g.measureText(price).width;
      let nsz = fsz;
      while (nsz > 7 && (g.font = `700 ${nsz}px Nunito, ui-rounded, system-ui, sans-serif`, g.measureText(T(RECIPE[id].name)).width > room)) nsz -= 0.5;
      g.textAlign = 'left'; g.fillText(T(RECIPE[id].name), b.x + 8, y);
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
      g.fillStyle = '#ffd1e3'; g.fillText(t('brand'), W / 2, sy);
      g.shadowBlur = 6; g.fillText(t('brand'), W / 2, sy);
      g.restore();
    } else {
      g.fillStyle = '#a8714a'; rr(g, sx + signW * 0.15, sy, signW * 0.7, signW / 4.4, 8); g.fill();
      g.fillStyle = '#fff3df'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = `900 ${signW / 6.5}px Nunito, ui-rounded, system-ui, sans-serif`;
      g.fillText(t('brand'), W / 2, sy + signW / 8.8);
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
    front.addColorStop(0, '#6e4530'); front.addColorStop(1, '#4a2d1e');
    g.fillStyle = front; g.fillRect(0, ct, W, H - ct);
    g.strokeStyle = 'rgba(40,20,10,.3)'; g.lineWidth = 2;
    for (let x = 30; x < W; x += 48) { g.beginPath(); g.moveTo(x, ct + 16); g.lineTo(x, H); g.stroke(); }
    // мраморная столешница с прожилками
    g.fillStyle = '#ece6dc'; rr(g, -10, ct - 8, W + 20, 18, 6); g.fill();
    const vr = seeded(21);
    g.strokeStyle = 'rgba(120,120,135,.28)'; g.lineWidth = 1.2;
    for (let i = 0; i < W / 60; i++) {
      const vx = vr() * W, vy = ct - 6 + vr() * 12;
      g.beginPath(); g.moveTo(vx, vy); g.bezierCurveTo(vx + 20, vy - 4, vx + 35, vy + 6, vx + 60 + vr() * 30, vy - 2 + vr() * 6); g.stroke();
    }
    g.fillStyle = '#c9a227'; g.fillRect(0, ct + 4, W, 3);
    g.fillStyle = '#3b2a22'; g.fillRect(0, ct + 7, W, 3);
    g.strokeStyle = '#3b2a22'; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(0, ct - 8); g.lineTo(W, ct - 8); g.stroke();
    if (H - ct > 40) {
      g.fillStyle = 'rgba(255,240,220,.18)';
      g.font = `900 ${clamp(W / 26, 12, 22)}px Nunito, ui-rounded, system-ui, sans-serif`;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(LANG === 'en' ? 'SÄLEM · coffee with love' : 'SÄLEM · кофе с любовью', W / 2, ct + (H - ct) / 2 + 6);
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
      ctx.fillStyle = '#2f6b4f';
      ctx.beginPath(); ctx.moveTo(x - 16, len + 12); ctx.quadraticCurveTo(x, len - 8, x + 16, len + 12); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(x, len + 13, 5, 0, Math.PI); ctx.fill();
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
    if (cu.state === 'leave' && cu.happy) takeaway(x + r * 1.0, hy + r * 1.75, r, cu.look.skin);
    cu.hy = hy; cu.dx = x;
    cu.hit = { x0: x - r * 1.5, y0: hy - r * 1.3, x1: x + r * 1.5, y1: L.counterTop + 10 };
  }

  // Руки ждущих гостей лежат на стойке
  function drawHands(cu) {
    if (cu.state !== 'wait' || !cu.r) return;
    const r = cu.r, y = L.counterTop - 7;
    const lift = cu.wiggleT > 0 || cu.shakeT > 0 ? r * 0.15 : 0;
    const sleeve = cu.look.outfit === 'vest' ? cu.look.shirt2 || '#fff' : cu.look.shirt;
    ctx.lineWidth = Math.max(1.3, r * 0.07);
    for (const s of [-1, 1]) {
      const hx = cu.dx + s * r * 0.82 * (cu.look.build || 1);
      ctx.fillStyle = sleeve; ctx.strokeStyle = shade(sleeve, -0.42);
      rr(ctx, hx - r * 0.27, y - r * 0.2 - lift, r * 0.54, r * 0.24, r * 0.1); ctx.fill(); ctx.stroke();
      ctx.fillStyle = cu.look.skin; ctx.strokeStyle = shade(cu.look.skin, -0.45);
      ctx.beginPath(); ctx.ellipse(hx + s * r * 0.05, y - r * 0.08 - lift, r * 0.26, r * 0.17, 0, 0, 7); ctx.fill(); ctx.stroke();
    }
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
    const col = f > 0.5 ? '#81b29a' : f > 0.25 ? '#f2b84b' : '#e07a5f';
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
  function drawCounterItems() {
    const ct = L.counterTop - 8;
    const s = clamp(H / 420, 0.6, 1.1);
    if (upLevel('pastry') > 0) {
      const w = 54 * s, h = 34 * s, x = L.mw ? W - w - 46 * s : 8, y = ct - h;
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

  // Полосатый кот: идёт по стойке, садится, машет хвостом, жмурится, когда гладят
  function drawCat(cat) {
    if (!cat) return;
    const s = clamp(H / 420, 0.6, 1.1);
    const x = cat.x, y = L.counterTop - 8;
    const sit = cat.state === 'sit';
    const walk = sit ? 0 : time * 11;
    const bob = sit ? Math.sin(time * 1.8) * 0.8 : Math.abs(Math.sin(walk)) * 1.5;
    const fur = '#e39a4b', furD = '#b9672a', white = '#fff6ea', ink = '#3b2a22';
    ctx.save(); ctx.translate(x, y - bob); ctx.scale(s * (cat.dir || 1), s);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // хвост
    const sw = Math.sin(time * 2.4) * 8;
    ctx.strokeStyle = ink; ctx.lineWidth = 7.5;
    ctx.beginPath(); ctx.moveTo(-16, -12); ctx.quadraticCurveTo(-32, -6 + sw, -26, -34 + sw * 0.5); ctx.stroke();
    ctx.strokeStyle = fur; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-16, -12); ctx.quadraticCurveTo(-32, -6 + sw, -26, -34 + sw * 0.5); ctx.stroke();
    ctx.strokeStyle = furD; ctx.lineWidth = 5; ctx.setLineDash([3, 5]);
    ctx.beginPath(); ctx.moveTo(-20, -13); ctx.quadraticCurveTo(-32, -8 + sw, -26, -34 + sw * 0.5); ctx.stroke(); ctx.setLineDash([]);
    // задние лапы
    ctx.fillStyle = fur; ctx.strokeStyle = ink; ctx.lineWidth = 2;
    const legs = sit ? [[-6, 0], [12, 0]] : [[-8, Math.sin(walk) * 5], [12, Math.sin(walk + Math.PI) * 5]];
    for (const [lx, dx] of legs) { rr(ctx, lx + dx - 3.5, -14, 7, 14, 3.5); ctx.fill(); ctx.stroke(); }
    // тело
    ctx.fillStyle = fur;
    ctx.beginPath(); ctx.ellipse(0, -18, 21, sit ? 14 : 11, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = furD; // полоски на спине
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(-10 + i * 8, -25, 2.2, 5 + (i % 2) * 2, 0.15, 0, 7); ctx.fill(); }
    ctx.fillStyle = white; ctx.beginPath(); ctx.ellipse(13, -14, 7, 7, 0, 0, 7); ctx.fill(); // грудка
    // передние лапы
    ctx.fillStyle = fur;
    const fl = sit ? [[14, 0], [20, 0]] : [[14, Math.sin(walk + Math.PI) * 5], [20, Math.sin(walk) * 5]];
    for (const [lx, dx] of fl) { rr(ctx, lx + dx - 3.5, -16, 7, 16, 3.5); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = white; for (const [lx, dx] of fl) { ctx.beginPath(); ctx.ellipse(lx + dx, -1.5, 3.5, 2, 0, 0, 7); ctx.fill(); }
    // голова
    const hx = 19, hy = -33;
    ctx.fillStyle = fur; ctx.strokeStyle = ink; ctx.lineWidth = 2;
    for (const e of [-1, 1]) { // уши
      ctx.beginPath(); ctx.moveTo(hx + e * 4, hy - 8); ctx.lineTo(hx + e * 10, hy - 20); ctx.lineTo(hx + e * 12, hy - 4); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f3a9b0'; ctx.beginPath(); ctx.moveTo(hx + e * 6, hy - 8); ctx.lineTo(hx + e * 9.5, hy - 16); ctx.lineTo(hx + e * 10.5, hy - 6); ctx.closePath(); ctx.fill(); ctx.fillStyle = fur;
    }
    ctx.beginPath(); ctx.ellipse(hx, hy, 13, 11.5, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = furD; // полоски на лбу
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.ellipse(hx + i * 4, hy - 8, 1.4, 3.2, 0, 0, 7); ctx.fill(); }
    ctx.fillStyle = white; ctx.beginPath(); ctx.ellipse(hx, hy + 5, 7.5, 5, 0, 0, 7); ctx.fill(); // мордочка
    // глаза
    const happy = cat.petT > 0, blink = (time % 4) < 0.12;
    if (happy || blink) {
      ctx.strokeStyle = ink; ctx.lineWidth = 1.8;
      for (const e of [-1, 1]) { ctx.beginPath(); ctx.arc(hx + e * 5.5, hy - 1.5, 2.6, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
    } else {
      for (const e of [-1, 1]) {
        ctx.fillStyle = '#9ccf6a'; ctx.beginPath(); ctx.ellipse(hx + e * 5.5, hy - 1.5, 3.2, 3.6, 0, 0, 7); ctx.fill();
        ctx.fillStyle = ink; ctx.beginPath(); ctx.ellipse(hx + e * 5.5, hy - 1.5, 1.2, 3.2, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hx + e * 5.5 + 1, hy - 3, 0.8, 0, 7); ctx.fill();
      }
    }
    // нос, рот, усы
    ctx.fillStyle = '#e8868f'; ctx.beginPath(); ctx.moveTo(hx - 2, hy + 2.5); ctx.lineTo(hx + 2, hy + 2.5); ctx.lineTo(hx, hy + 5); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = ink; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(hx, hy + 5); ctx.lineTo(hx, hy + 6.5); ctx.moveTo(hx - 3, hy + 8); ctx.quadraticCurveTo(hx, hy + 9.5, hx + 3, hy + 8); ctx.stroke();
    ctx.lineWidth = 1;
    for (const e of [-1, 1]) for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(hx + e * 6, hy + 4 + i * 1.5); ctx.lineTo(hx + e * 15, hy + 2 + i * 3.5); ctx.stroke(); }
    ctx.restore();
    cat.hit = { x0: x - 36 * s, y0: y - 58 * s, x1: x + 36 * s, y1: y + 4 };
  }

  // Эспрессо-машина и кофемолка на стойке (широкие экраны). Оживают, когда бариста работает.
  function drawMachine(busy) {
    if (!L.mw) return;
    const s = L.mw / 150;
    const base = L.counterTop - 8;
    const mx = 12, w = 100 * s, h = 78 * s;
    const top = base - h;
    const working = busy.espresso > 0;
    ctx.lineWidth = 2.2; ctx.strokeStyle = '#3b2a22'; ctx.lineJoin = 'round';
    // кофемолка
    const gx = mx + w + 8 * s, gw = 30 * s, shakeX = working ? Math.sin(time * 60) * 0.8 : 0;
    ctx.fillStyle = '#3d405b';
    rr(ctx, gx + shakeX, base - 46 * s, gw, 46 * s, 5 * s); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(230,245,250,.75)';
    ctx.beginPath(); ctx.moveTo(gx - 3 * s + shakeX, base - 72 * s); ctx.lineTo(gx + gw + 3 * s + shakeX, base - 72 * s); ctx.lineTo(gx + gw - 5 * s + shakeX, base - 46 * s); ctx.lineTo(gx + 5 * s + shakeX, base - 46 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#5a3422';
    ctx.beginPath(); ctx.moveTo(gx + 1 * s + shakeX, base - 62 * s); ctx.lineTo(gx + gw - 1 * s + shakeX, base - 62 * s); ctx.lineTo(gx + gw - 6 * s + shakeX, base - 47 * s); ctx.lineTo(gx + 6 * s + shakeX, base - 47 * s); ctx.closePath(); ctx.fill();
    // корпус машины
    ctx.fillStyle = '#d5dee3'; rr(ctx, mx - 3, top - 8 * s, w + 6, 9 * s, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; for (let i = 0; i < 3; i++) { rr(ctx, mx + 10 * s + i * 22 * s, top - 18 * s, 14 * s, 10 * s, 3); ctx.fill(); ctx.stroke(); }
    const body = ctx.createLinearGradient(mx, 0, mx + w, 0);
    body.addColorStop(0, '#ec9278'); body.addColorStop(1, '#c9654b');
    ctx.fillStyle = body; rr(ctx, mx, top, w, h * 0.78, 8 * s); ctx.fill(); ctx.stroke();
    for (const k of [0.26, 0.74]) {
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(mx + w * k, top + 16 * s, 8 * s, 0, 7); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.translate(mx + w * k, top + 16 * s); ctx.rotate(working ? Math.sin(time * 4) * 0.3 + 0.6 : -0.4);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -6 * s); ctx.stroke(); ctx.restore();
    }
    // группы и холдеры
    const groups = Stats.groups();
    for (let i = 0; i < groups; i++) {
      const gxi = mx + w * ((i + 1) / (groups + 1));
      ctx.fillStyle = '#d5dee3'; rr(ctx, gxi - 9 * s, top + h * 0.78 - 2, 18 * s, 7 * s, 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#3b2a22'; rr(ctx, gxi - 8 * s, top + h * 0.78 + 5 * s, 16 * s, 5 * s, 2); ctx.fill();
      ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(gxi + 6 * s, top + h * 0.78 + 7 * s); ctx.lineTo(gxi + 20 * s, top + h * 0.78 + 9 * s); ctx.stroke(); ctx.lineWidth = 2.2;
      if (i < busy.espresso) {
        ctx.strokeStyle = '#5a3422'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(gxi, top + h * 0.78 + 10 * s); ctx.lineTo(gxi, base - 12 * s); ctx.stroke();
        ctx.strokeStyle = '#3b2a22'; ctx.lineWidth = 2.2;
      }
      ctx.fillStyle = '#fff'; rr(ctx, gxi - 6 * s, base - 14 * s, 12 * s, 10 * s, 2 * s); ctx.fill(); ctx.stroke();
    }
    // поддон и паровая трубка
    ctx.fillStyle = '#d5dee3'; rr(ctx, mx - 4, base - 5 * s, w + 8, 6 * s, 2); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 3 * s; ctx.strokeStyle = '#9aa7ae';
    ctx.beginPath(); ctx.moveTo(mx + w - 4 * s, top + 26 * s); ctx.lineTo(mx + w + 4 * s, top + 34 * s); ctx.lineTo(mx + w + 4 * s, top + h * 0.75); ctx.stroke();
    ctx.lineWidth = 2.2; ctx.strokeStyle = '#3b2a22';
    if (busy.frother > 0 && Math.random() < 0.5) {
      particles.push({ x: mx + w + 4 * s, y: top + h * 0.75, vx: rand(-15, 15), vy: rand(-50, -30), life: 1.2, kind: 'steam', size: rand(4, 7) * s, rot: 0, vr: 0 });
    }
    if (working && Math.random() < 0.15) {
      particles.push({ x: mx + w * 0.5, y: top - 10 * s, vx: rand(-6, 6), vy: -25, life: 1.4, kind: 'steam', size: 4 * s, rot: 0, vr: 0 });
    }
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
    for (const cu of state.customers) drawHands(cu);
    drawCounterItems();
    drawMachine(state.busy || {});
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
    resize, invalidate, render, updateFx, burst, floatText, flyCoin, addShake, drawPortrait, drawPerson,
    slotX, personR, get W() { return W; }, get H() { return H; }, get counterTop() { return L.counterTop; },
  };
})();
