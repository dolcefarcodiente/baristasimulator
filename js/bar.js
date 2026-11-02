// Барная стойка: чашки на canvas и живая анимация приготовления —
// холдер льёт эспрессо, питчер взбивает молоко под паровой трубкой и наливает, чайник, помпы сиропов, лёд.

const Bar = (() => {
  const cv = document.getElementById('bar');
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, DPR = 1, time = 0;
  const born = new WeakMap(); // слой → момент добавления (рост слоя для мгновенных ингредиентов)
  let pulses = [];            // короткие анимации: чайник, помпа, лёд, сливки, джелато, корица
  const INK = '#3b2a22';
  const STEEL = '#cfd8dd', STEEL_D = '#8f9ca3';
  const hover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
  const CUP_KEYS = ['Z', 'X', 'C'];

  function rr(x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  const ease = (k) => 1 - Math.pow(1 - clamp(k, 0, 1), 3);

  function resize() {
    const r = cv.parentElement.getBoundingClientRect();
    if (r.width < 2) return;
    DPR = Math.min(window.devicePixelRatio || 1, 2.5);
    W = r.width; H = r.height;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  }

  // ---------- геометрия ----------
  function slot(i) {
    const n = Shift.cups.length;
    const sw = W / n;
    const cw = clamp(sw * 0.36, 34, 46), ch = cw * 1.08;
    const cx = sw * (i + 0.5) - cw * 0.12;
    const cy = H - 25 - ch; // верх чашки
    return { sw, x0: sw * i, cx, cy, cw, ch };
  }

  function init() {
    cv.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const r = cv.getBoundingClientRect();
      const i = Math.floor(((e.clientX - r.left) / r.width) * Shift.cups.length);
      Shift.selectCup(clamp(i, 0, Shift.cups.length - 1));
    });
  }

  // Shift положил слой в чашку: запоминаем момент и запускаем короткую анимацию
  function touch(i) {
    const cup = Shift.cups[i];
    const l = cup && cup.layers[cup.layers.length - 1];
    if (!l || born.has(l)) return;
    born.set(l, time);
    if (!l.job) pulses.push({ cup: i, ing: l.ing, t: 0, dur: 0.8 });
  }

  // ---------- чашка ----------
  function cupPath(x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x + w, y);
    ctx.lineTo(x + w * 0.9, y + h - w * 0.3);
    ctx.quadraticCurveTo(x + w * 0.88, y + h, x + w * 0.6, y + h);
    ctx.lineTo(x + w * 0.4, y + h);
    ctx.quadraticCurveTo(x + w * 0.12, y + h, x + w * 0.1, y + h - w * 0.3);
    ctx.closePath();
  }

  // Высота слоя с учётом того, что он ещё наливается
  function layerFill(l, cupIdx) {
    const ing = INGREDIENTS[l.ing];
    const full = ing.h / 52;
    if (l.job) {
      const p = clamp(l.job.t / l.job.dur, 0, 1);
      if (ing.machine === 'frother') return full * ease((p - 0.62) / 0.38); // сначала взбиваем, потом льём
      return full * p;
    }
    const b = born.get(l);
    if (b === undefined) return full;
    return full * ease((time - b - 0.3) / 0.4);
  }

  function drawCup(i, sel) {
    const s = slot(i);
    const { cx, cy, cw, ch } = s;
    const cup = Shift.cups[i];
    const lw = Math.max(1.4, cw * 0.045);
    // подставка-блюдце
    ctx.fillStyle = sel ? '#f1e6d6' : '#d9ccb9';
    ctx.beginPath(); ctx.ellipse(cx + cw / 2, cy + ch + 1, cw * 0.78, cw * 0.14, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.stroke();
    // ручка
    ctx.lineWidth = lw * 2.6; ctx.strokeStyle = INK;
    ctx.beginPath(); ctx.arc(cx + cw, cy + ch * 0.42, cw * 0.22, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    ctx.lineWidth = lw * 1.2; ctx.strokeStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx + cw, cy + ch * 0.42, cw * 0.22, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    // корпус
    cupPath(cx, cy, cw, ch);
    ctx.fillStyle = '#fffaf2'; ctx.fill();
    // слои
    ctx.save(); cupPath(cx, cy, cw, ch); ctx.clip();
    const inner = ch - 4;
    let level = 0;
    const tops = [];
    cup.layers.forEach((l) => {
      const ing = INGREDIENTS[l.ing];
      const hh = layerFill(l, i) * inner;
      const y1 = cy + ch - 2 - level, y0 = y1 - hh;
      if (hh > 0.2) drawLayer(ing, cx, y0, cw, hh, l);
      tops.push({ ing, y: y0, ready: !l.job && hh >= ing.h / 52 * inner - 0.3 });
      level += hh;
    });
    // латте-арт: молоко, налитое поверх эспрессо
    const top = tops[tops.length - 1];
    if (top && top.ready && top.ing === INGREDIENTS.milk && tops.length > 1 && INGREDIENTS[cup.layers[cup.layers.length - 2].ing].machine === 'espresso') {
      latteArt(cx + cw / 2, top.y + 1, cw * 0.22);
    }
    // тень внутри чашки
    ctx.fillStyle = 'rgba(60,30,20,.1)'; ctx.fillRect(cx + cw * 0.7, cy, cw * 0.3, ch);
    ctx.restore();
    cupPath(cx, cy, cw, ch); ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.beginPath(); ctx.ellipse(cx + cw / 2, cy + 0.5, cw / 2, cw * 0.08, 0, 0, 7); ctx.fill();
    // подпись
    const rec = recipeFor(Shift.cupItems(cup));
    let label = '', col = '#f3dfc8';
    if (!cup.layers.length) label = Shift.cups.length > 1 && sel ? t('selected') : '';
    else if (!Shift.cupReady(cup)) label = t('brewing');
    else if (rec && S.recipes.includes(rec.id)) { label = T(rec.name) + ' ✓'; col = '#b7f0c8'; }
    else label = t('custom');
    ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    let fs = 11;
    ctx.font = `800 ${fs}px Nunito, ui-rounded, system-ui, sans-serif`;
    while (fs > 8 && ctx.measureText(label).width > s.sw - 8) { fs -= 0.5; ctx.font = `800 ${fs}px Nunito, ui-rounded, system-ui, sans-serif`; }
    ctx.fillText(label, s.x0 + s.sw / 2, H - 4);
    if (hover && Shift.cups.length > 1) {
      ctx.fillStyle = 'rgba(255,245,230,.45)'; ctx.font = '900 10px Nunito, ui-rounded, system-ui, sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(CUP_KEYS[i] || '', s.x0 + s.sw - 5, 11);
    }
  }

  function drawLayer(ing, x, y, w, h, l) {
    ctx.fillStyle = ing.color;
    ctx.fillRect(x, y, w, h + 0.5);
    switch (ing.kind) {
      case 'foam':
        ctx.beginPath(); ctx.ellipse(x + w / 2, y, w * 0.52, h * 0.5, 0, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#e8dccb';
        for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(x + w * (0.2 + k * 0.2), y + h * (0.3 + (k % 2) * 0.35), w * 0.03, 0, 7); ctx.fill(); }
        break;
      case 'ice':
        ctx.fillStyle = '#fff';
        for (let k = 0; k < 3; k++) {
          ctx.save(); ctx.translate(x + w * (0.22 + k * 0.28), y + h * 0.5); ctx.rotate(k * 0.5 - 0.4);
          ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillRect(-w * 0.1, -h * 0.3, w * 0.2, h * 0.6);
          ctx.strokeStyle = '#9fd3ea'; ctx.lineWidth = 1; ctx.strokeRect(-w * 0.1, -h * 0.3, w * 0.2, h * 0.6);
          ctx.restore();
        }
        break;
      case 'cream':
        ctx.fillStyle = ing.color;
        for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(x + w / 2, y + h * (0.25 + k * 0.28), w * (0.42 - k * 0.1), h * 0.2, 0, 0, 7); ctx.fill(); }
        ctx.beginPath(); ctx.ellipse(x + w / 2, y + h * 0.08, w * 0.12, h * 0.12, 0, 0, 7); ctx.fill();
        break;
      case 'gelato':
        ctx.fillStyle = ing.color;
        ctx.beginPath(); ctx.arc(x + w / 2, y + h * 0.55, w * 0.36, 0, 7); ctx.fill();
        ctx.fillStyle = '#8a5634';
        for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(x + w * (0.35 + (k % 2) * 0.3), y + h * (0.35 + Math.floor(k / 2) * 0.35), w * 0.03, 0, 7); ctx.fill(); }
        break;
      case 'sprinkle':
        ctx.fillStyle = ing.color;
        for (let k = 0; k < 9; k++) { ctx.beginPath(); ctx.arc(x + w * (0.1 + (k * 0.37) % 0.8), y + h * ((k * 0.53) % 1), 1.1, 0, 7); ctx.fill(); }
        break;
      default:
        if (l.job) { // кофе льётся — крема пузырится сверху
          ctx.fillStyle = 'rgba(255,230,190,.35)';
          for (let k = 0; k < 3; k++) { const px = x + w * (0.25 + k * 0.25) + Math.sin(time * 6 + k) * 2; ctx.beginPath(); ctx.arc(px, y + 2, 1.5, 0, 7); ctx.fill(); }
        }
    }
  }

  function latteArt(x, y, r) {
    ctx.fillStyle = '#b07a52';
    ctx.beginPath();
    ctx.moveTo(x, y + r * 0.9);
    ctx.bezierCurveTo(x - r * 1.3, y - r * 0.1, x - r * 0.5, y - r * 1.0, x, y - r * 0.3);
    ctx.bezierCurveTo(x + r * 0.5, y - r * 1.0, x + r * 1.3, y - r * 0.1, x, y + r * 0.9);
    ctx.fill();
    ctx.strokeStyle = '#f7efe1'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y - r * 0.6); ctx.lineTo(x, y + r * 0.9); ctx.stroke();
  }

  // ---------- оборудование над чашкой ----------
  function stream(x0, y0, x1, y1, width, color, wobble = 1) {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(x0 + Math.sin(time * 18) * wobble, (y0 + y1) / 2, x1, y1); ctx.stroke();
  }
  function puff(x, y, r, a) {
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }

  function drawPortafilter(s, job) {
    const { cx, cy, cw } = s;
    const p = clamp(job.t / job.dur, 0, 1);
    const w = cw * 0.9, x = cx + cw / 2 - w / 2, y = cy - cw * 0.55;
    const ing = INGREDIENTS[job.ing];
    // группа над холдером
    ctx.fillStyle = STEEL; ctx.strokeStyle = INK; ctx.lineWidth = 1.4;
    rr(x - 3, y - cw * 0.26, w + 6, cw * 0.14, 3); ctx.fill(); ctx.stroke();
    // корзина холдера и ручка
    ctx.fillStyle = STEEL_D; rr(x, y - cw * 0.12, w, cw * 0.16, 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = INK; rr(x + w * 0.1, y + cw * 0.04, w * 0.8, cw * 0.08, 2); ctx.fill();
    ctx.lineWidth = cw * 0.11; ctx.strokeStyle = INK; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x + w, y - cw * 0.03); ctx.lineTo(x + w + cw * 0.5, y + cw * 0.02); ctx.stroke();
    // два носика и струйки в чашку
    const cupTop = cy + 3;
    for (const k of [-1, 1]) {
      const sx = cx + cw / 2 + k * cw * 0.14;
      ctx.fillStyle = STEEL_D; ctx.fillRect(sx - 2, y + cw * 0.1, 4, cw * 0.08);
      if (p < 0.96) stream(sx, y + cw * 0.18, sx + k * cw * 0.04, cupTop + cw * 0.3, 1.6 + Math.sin(time * 9) * 0.3, ing.color, 0.6);
    }
    // лёгкий пар от группы
    if (p > 0.1) puff(x + w * 0.5 + Math.sin(time * 2) * 3, y - cw * 0.4 - ((time * 12) % 8), 3, 0.35);
  }

  function drawPitcher(s, job) {
    const { cx, cy, cw, ch } = s;
    const p = clamp(job.t / job.dur, 0, 1);
    const ing = INGREDIENTS[job.ing];
    const pw = cw * 0.52, ph = cw * 0.62;
    const restX = cx + cw * 1.25, restY = cy + ch * 0.5 - ph; // стоит справа, под паровой трубкой
    const pourX = cx + cw * 0.95, pourY = cy - ph * 0.6;
    const k = ease((p - 0.55) / 0.12);                // подняли и наклонили
    const px = lerp(restX, pourX, k), py = lerp(restY, pourY, k);
    const tilt = lerp(0, -1.05, k);
    const shake = p < 0.55 ? Math.sin(time * 40) * 0.6 : 0;
    // паровая трубка (только пока взбиваем)
    if (p < 0.6) {
      ctx.strokeStyle = STEEL_D; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(restX + pw * 0.6, cy - ch * 0.5); ctx.lineTo(restX + pw * 0.45, restY + ph * 0.5); ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const tt = (time * 1.6 + i * 0.25) % 1;
        puff(restX + pw * 0.5 + Math.sin(tt * 6 + i) * 4, restY - 2 - tt * cw * 0.5, 2 + tt * 4, 0.5 * (1 - tt));
      }
    }
    ctx.save(); ctx.translate(px + pw / 2 + shake, py + ph); ctx.rotate(tilt); ctx.translate(-pw / 2, -ph);
    ctx.fillStyle = STEEL; ctx.strokeStyle = INK; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(pw, 0); ctx.lineTo(pw * 0.88, ph); ctx.lineTo(pw * 0.12, ph); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-pw * 0.18, -pw * 0.1); ctx.lineTo(pw * 0.12, 0); ctx.fill(); ctx.stroke(); // носик
    ctx.beginPath(); ctx.moveTo(pw, ph * 0.2); ctx.quadraticCurveTo(pw * 1.45, ph * 0.5, pw * 0.92, ph * 0.8); ctx.stroke(); // ручка
    // молоко внутри
    ctx.fillStyle = ing.color;
    const lvl = p < 0.55 ? 0.45 + Math.sin(time * 30) * 0.03 : 0.45;
    ctx.beginPath(); ctx.moveTo(pw * 0.04, ph * (1 - lvl)); ctx.lineTo(pw * 0.96, ph * (1 - lvl)); ctx.lineTo(pw * 0.86, ph * 0.97); ctx.lineTo(pw * 0.14, ph * 0.97); ctx.closePath(); ctx.fill();
    ctx.restore();
    // струя в чашку
    if (p >= 0.62 && p < 0.98) {
      const sx = px + pw * 0.08 + Math.cos(tilt) * 2, sy = py + ph * 0.1;
      stream(sx, sy, cx + cw * 0.45, cy + 6, ing.kind === 'foam' ? 4 : 2.6, ing.color, 1.2);
    }
  }

  function drawCarafe(s, job) {
    const { cx, cy, cw } = s;
    const p = clamp(job.t / job.dur, 0, 1);
    const w = cw * 0.75, h = cw * 0.7, x = cx + cw * 0.62, y = cy - h - 4;
    ctx.save(); ctx.translate(x, y + h); ctx.rotate(-0.55); ctx.translate(-w / 2, -h);
    ctx.fillStyle = 'rgba(215,235,245,.8)'; ctx.strokeStyle = INK; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w, 0); ctx.lineTo(w * 0.9, h); ctx.lineTo(w * 0.1, h); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#8a5634';
    ctx.beginPath(); ctx.moveTo(w * 0.03, h * (0.85 - p * 0.5)); ctx.lineTo(w * 0.97, h * (0.85 - p * 0.5)); ctx.lineTo(w * 0.88, h * 0.97); ctx.lineTo(w * 0.12, h * 0.97); ctx.closePath(); ctx.fill();
    ctx.fillStyle = INK; rr(-2, -4, w + 4, 5, 2); ctx.fill();
    ctx.restore();
    if (p < 0.97) stream(x - w * 0.42, y + h * 0.15, cx + cw * 0.5, cy + 6, 2.4, '#8a5634', 0.8);
  }

  // ---------- короткие анимации ----------
  function drawPulse(s, pu) {
    const { cx, cy, cw } = s;
    const k = pu.t / pu.dur;
    const ing = INGREDIENTS[pu.ing];
    const mid = cx + cw / 2;
    ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.lineJoin = 'round';
    switch (pu.ing) {
      case 'water': {
        const tilt = -0.9 * Math.sin(Math.min(1, k * 1.3) * Math.PI);
        const kw = cw * 0.7, kh = cw * 0.5, x = cx - cw * 0.45, y = cy - kh - 6;
        ctx.save(); ctx.translate(x + kw, y + kh); ctx.rotate(tilt); ctx.translate(-kw, -kh);
        ctx.fillStyle = '#5c6370';
        ctx.beginPath(); ctx.moveTo(0, kh * 0.25); ctx.lineTo(kw, kh * 0.25); ctx.lineTo(kw * 0.9, kh); ctx.lineTo(kw * 0.1, kh); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(kw / 2, kh * 0.25, kw * 0.4, kh * 0.14, 0, 0, 7); ctx.fill(); ctx.stroke();
        ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(kw, kh * 0.45); ctx.quadraticCurveTo(kw * 1.4, kh * 0.2, kw * 1.3, -kh * 0.1); ctx.stroke();
        ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(kw * 0.25, kh * 0.2); ctx.quadraticCurveTo(kw * 0.5, -kh * 0.3, kw * 0.75, kh * 0.2); ctx.stroke();
        ctx.restore();
        if (k > 0.2 && k < 0.7) stream(x + kw * 1.3 + 2, y + kh * 0.3, mid, cy + 6, 2.2, '#9fd3ea', 1);
        break;
      }
      case 'caramel': case 'vanilla': case 'chocolate': {
        const bw = cw * 0.32, bh = cw * 0.6, x = mid - bw / 2, y = cy - bh - 10;
        const press = Math.sin(clamp((k - 0.1) / 0.4, 0, 1) * Math.PI) * cw * 0.1;
        ctx.fillStyle = ing.color; rr(x, y, bw, bh, 3); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fff3dd'; rr(x + 3, y + bh * 0.4, bw - 6, bh * 0.3, 2); ctx.fill();
        ctx.fillStyle = INK; ctx.fillRect(mid - 2, y - cw * 0.22 + press, 4, cw * 0.22 - press + 2);
        ctx.fillRect(mid - 2, y - cw * 0.22 + press, bw * 0.7, 3);
        if (k > 0.35 && k < 0.75) {
          const dy = ease((k - 0.35) / 0.4);
          ctx.fillStyle = ing.color; ctx.beginPath(); ctx.ellipse(x + bw * 1.2, lerp(y - cw * 0.1, cy + 4, dy), 2.5, 3.5, 0, 0, 7); ctx.fill();
        }
        break;
      }
      case 'ice':
        for (let i = 0; i < 3; i++) {
          const kk = clamp((k - i * 0.15) / 0.5, 0, 1);
          if (kk >= 1) continue;
          const y = lerp(cy - cw * 0.9, cy + 4, ease(kk)), x = mid + (i - 1) * cw * 0.22;
          ctx.save(); ctx.translate(x, y); ctx.rotate(kk * 2 + i);
          ctx.fillStyle = 'rgba(230,246,252,.95)'; rr(-4, -4, 8, 8, 1.5); ctx.fill(); ctx.strokeStyle = '#9fd3ea'; ctx.stroke();
          ctx.restore();
        }
        break;
      case 'cream': {
        const x = mid + cw * 0.1, y = cy - cw * 0.75;
        ctx.save(); ctx.translate(x, y); ctx.rotate(0.6 + Math.sin(k * Math.PI) * 0.15);
        ctx.fillStyle = '#e63946'; rr(-cw * 0.12, -cw * 0.3, cw * 0.24, cw * 0.55, 3); ctx.fill(); ctx.strokeStyle = INK; ctx.stroke();
        ctx.fillStyle = '#fff'; rr(-cw * 0.06, -cw * 0.42, cw * 0.12, cw * 0.14, 2); ctx.fill(); ctx.stroke();
        ctx.restore();
        if (k > 0.15 && k < 0.7) {
          for (let i = 0; i < 3; i++) puff(mid - 4 + i * 4 + Math.sin(time * 20 + i) * 2, lerp(y - 2, cy + 4, (k - 0.15) / 0.55) - i * 3, 3, 0.9);
        }
        break;
      }
      case 'gelato': {
        const dip = Math.sin(clamp(k / 0.7, 0, 1) * Math.PI);
        const y = cy - cw * 0.7 + dip * cw * 0.6, x = mid + cw * 0.05;
        ctx.strokeStyle = STEEL_D; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x + cw * 0.3, y - cw * 0.55); ctx.lineTo(x + cw * 0.08, y - cw * 0.15); ctx.stroke();
        ctx.fillStyle = STEEL; ctx.strokeStyle = INK; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(x, y, cw * 0.2, 0.2, Math.PI - 0.2); ctx.fill(); ctx.stroke();
        if (k < 0.5) { ctx.fillStyle = ing.color; ctx.beginPath(); ctx.arc(x, y - 1, cw * 0.17, 0, 7); ctx.fill(); ctx.stroke(); }
        break;
      }
      case 'cinnamon': {
        const x = mid + Math.sin(time * 30) * 3, y = cy - cw * 0.75;
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI + Math.sin(time * 30) * 0.25);
        ctx.fillStyle = '#fff8ec'; rr(-cw * 0.13, -cw * 0.3, cw * 0.26, cw * 0.5, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#9b5a2e'; rr(-cw * 0.11, -cw * 0.1, cw * 0.22, cw * 0.26, 3); ctx.fill();
        ctx.fillStyle = STEEL; rr(-cw * 0.13, -cw * 0.4, cw * 0.26, cw * 0.1, 2); ctx.fill(); ctx.stroke();
        ctx.restore();
        ctx.fillStyle = '#9b5a2e';
        for (let i = 0; i < 6; i++) {
          const kk = ((k * 2.2 + i * 0.17) % 1);
          ctx.beginPath(); ctx.arc(mid - 8 + i * 3.2 + Math.sin(i * 3) * 2, lerp(y + cw * 0.2, cy + 4, kk), 1.1, 0, 7); ctx.fill();
        }
        break;
      }
    }
  }

  // ---------- кадр ----------
  function render(dt) {
    time += dt;
    if (W < 2) resize();
    if (W < 2) return;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const n = Shift.cups.length;
    for (let i = 0; i < n; i++) {
      const s = slot(i), sel = i === Shift.sel;
      if (sel && n > 1) {
        ctx.fillStyle = 'rgba(255,240,215,.1)'; rr(s.x0 + 2, 2, s.sw - 4, H - 4, 12); ctx.fill();
        ctx.strokeStyle = 'rgba(242,204,143,.7)'; ctx.lineWidth = 2; ctx.stroke();
      }
    }
    for (let i = 0; i < n; i++) drawCup(i, i === Shift.sel);
    // оборудование поверх чашек
    for (let i = 0; i < n; i++) {
      const s = slot(i);
      for (const l of Shift.cups[i].layers) {
        if (!l.job) continue;
        const m = INGREDIENTS[l.ing].machine;
        if (m === 'espresso') drawPortafilter(s, l.job);
        else if (m === 'frother') drawPitcher(s, l.job);
        else if (m === 'filter') drawCarafe(s, l.job);
      }
    }
    for (let i = pulses.length - 1; i >= 0; i--) {
      const pu = pulses[i];
      pu.t += dt;
      if (pu.t >= pu.dur) { pulses.splice(i, 1); continue; }
      drawPulse(slot(pu.cup), pu);
    }
  }

  function reset() { pulses = []; }

  return { init, resize, render, touch, reset };
})();
