// Режим «История»: главы-ночи из сценария (js/story/*.js), реплики по одной, выборы и простая варка в три шага.
// Как писать главы — .claude/skills/salem-story/SKILL.md.

const STORY_CH = {};
const STORY_ORDER = ['prologue', 'ch1'];
const CAST = {
  eli: { en: 'Eli', ru: 'Илай' },
  junie: { en: 'Junie', ru: 'Джуни' },
};

// Три шага варки: основа + долить + добавка. Напиток узнаётся по точному набору.
const SB = {
  base: [
    { id: 'espresso', img: 'inv-portafilter', name: { en: 'Espresso', ru: 'Эспрессо' }, sfx: 'brewDone' },
    { id: 'double', img: 'inv-portafilter', x2: true, name: { en: 'Double shot', ru: 'Двойной' }, sfx: 'brewDone' },
    { id: 'none', img: 'inv-cup', name: { en: 'No coffee', ru: 'Без кофе' }, sfx: 'plop' },
  ],
  top: [
    { id: 'water', img: 'inv-kettle', name: { en: 'Hot water', ru: 'Кипяток' }, sfx: 'pour' },
    { id: 'milk', img: 'inv-whole', name: { en: 'Steamed milk', ru: 'Горячее молоко' }, sfx: 'steam' },
    { id: 'foam', img: 'inv-pitcher', name: { en: 'Milk foam', ru: 'Пена' }, sfx: 'steam' },
    { id: 'cold', img: 'inv-ice', name: { en: 'Cold milk', ru: 'Холодное молоко' }, sfx: 'ice' },
  ],
  extra: ['vanilla', 'caramel', 'chocolate', 'cinnamon', 'cream', 'gelato'].map((id) => ({ id, img: 'inv-' + id, name: INGREDIENTS[id].name, sfx: INGREDIENTS[id].sfx || 'plop' })),
};
// напиток: [основа, долить, добавка, посуда]
const STORY_DRINKS = {
  espresso: ['espresso', '', '', 'demi'],
  doppio: ['double', '', '', 'demi'],
  americano: ['espresso', 'water', '', 'mug'],
  latte: ['espresso', 'milk', '', 'glass'],
  cappuccino: ['espresso', 'foam', '', 'cup'],
  flatwhite: ['double', 'milk', '', 'cup'],
  icedlatte: ['espresso', 'cold', '', 'glass'],
  conpanna: ['espresso', '', 'cream', 'demi'],
  affogato: ['espresso', '', 'gelato', 'cup'],
  mocha: ['espresso', 'milk', 'chocolate', 'glass'],
  vanillalatte: ['espresso', 'milk', 'vanilla', 'glass'],
  caramelmacchiato: ['espresso', 'foam', 'caramel', 'glass'],
  marocchino: ['espresso', 'foam', 'chocolate', 'cup'],
  cioccolata: ['none', 'milk', 'chocolate', 'mug'],
};

const Story = (() => {
  let run = null;
  const $ = (s) => document.querySelector(s);
  const L = (o) => (o ? o[LANG] || o.en : '');
  const nameOf = (id) => T(CAST[id] || (REGULAR[id] && REGULAR[id].name) || id);
  const drinkName = (id) => (id && RECIPE[id] ? T(RECIPE[id].name) : t('custom2'));

  // ---------- глава ----------
  function start(id) {
    const ch = STORY_CH[id];
    const st = S.story;
    // переигрываешь главу — выборы считаются с того, что было до неё
    const from = (st.snap && st.snap[id]) || { flags: st.flags, aff: st.aff };
    run = {
      id, ch, from, stack: [{ list: ch.nodes, i: 0 }], flags: { ...from.flags }, aff: { ...from.aff },
      cu: null, wait: null, line: null, cg: null, phone: [], served: null, cup: { base: '', top: '', extra: '' },
    };
    hideAll();
    while (ch.nodes[run.stack[0].i] && ch.nodes[run.stack[0].i].cg !== undefined) setCg(ch.nodes[run.stack[0].i++].cg);
    showTitle();
  }

  function showTitle() {
    run.wait = 'title';
    const el = $('#stitle');
    el.innerHTML = `<small>${L(run.ch.num)}</small><b>${L(run.ch.title)}</b>`;
    el.classList.remove('hidden', 'out');
    run.titleT = setTimeout(endTitle, 2600);
  }
  function endTitle() {
    if (!run || run.wait !== 'title') return;
    clearTimeout(run.titleT);
    $('#stitle').classList.add('out');
    run.wait = 'fade';
    setTimeout(() => { $('#stitle').classList.add('hidden'); if (run && run.wait === 'fade') { run.wait = null; next(); } }, 650);
  }

  const test = (cond) => (cond[0] === '!' ? !run.flags[cond.slice(1)] : !!run.flags[cond]);
  const push = (list) => { if (list && list.length) run.stack.push({ list, i: 0 }); };

  function next() {
    while (run) {
      const top = run.stack[run.stack.length - 1];
      if (!top) { finish(); return; }
      if (top.i >= top.list.length) { run.stack.pop(); continue; }
      if (exec(top.list[top.i++])) return;
    }
  }

  // Узел сценария; true — ждём игрока или анимацию
  function exec(n) {
    if (!n.phone && run.phone.length) hidePhone();
    if (n.cg !== undefined) { setCg(n.cg); return false; }
    if (n.sfx) { Sound.play(n.sfx); return false; }
    if (n.set) { run.flags[n.set] = true; return false; }
    if (n.if) { push(test(n.if) ? n.then : n.else); return false; }
    if (n.enter) { enter(n.enter); return true; }
    if (n.leave) { leave(); return false; }
    if (n.nar) { say({ kind: 'nar', text: L(n.nar) }); return true; }
    if (n.who) { say({ kind: n.who === 'think' ? 'think' : 'say', who: n.who === 'think' ? '' : nameOf(n.who), text: L(n) }); return true; }
    if (n.phone) { phone(n); return true; }
    if (n.note) { card(`<div class="s-note">${esc(L(n.note)).replace(/\n/g, '<br>')}</div>`); return true; }
    if (n.photo) { card(`<figure class="s-photo"><img src="img/cg-photo-${n.photo}.png" alt=""><figcaption>${esc(L(n.caption))}</figcaption></figure>`); return true; }
    if (n.choice) { choose(n.choice); return true; }
    if (n.brew) { openBrew(n); return true; }
    if (n.diary) { diary(n.diary); return true; }
    return false;
  }
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

  // ---------- реплики ----------
  function say({ kind, who = '', text }) {
    text = text.replace('{drink}', run.served ? drinkName(run.served).toLowerCase() : '');
    run.wait = 'line';
    run.line = { text, shown: 0, kind };
    const box = $('#sbox');
    box.className = 'k-' + kind;
    box.querySelector('.who').textContent = who;
    box.querySelector('.say').textContent = '';
    box.querySelector('.choices').innerHTML = '';
  }
  function tap() {
    if (!run) return;
    if (run.wait === 'title') { endTitle(); return; }
    if (run.wait === 'line') {
      const ln = run.line;
      if (ln.shown < ln.text.length) { ln.shown = ln.text.length; return; }
      run.wait = null; next(); return;
    }
    if (run.wait === 'phone' || run.wait === 'card') {
      if (run.wait === 'card') $('#scard').classList.add('hidden');
      run.wait = null; next(); return;
    }
    if (run.wait === 'diary') { $('#scard').classList.add('hidden'); run.wait = null; done(); }
  }

  function choose(opts) {
    run.wait = 'choice';
    const box = $('#sbox');
    if (box.classList.contains('hidden') || !run.line) { box.className = 'k-choice'; box.querySelector('.who').textContent = ''; box.querySelector('.say').textContent = ''; }
    box.querySelector('.say').textContent = run.line ? run.line.text : '';
    box.querySelector('.choices').innerHTML = opts.map((o, i) => `<button class="choice" data-schoice="${i}"><i>${i + 1}</i>${esc(L(o))}</button>`).join('');
    run.opts = opts;
  }
  function pick(i) {
    const o = run && run.wait === 'choice' && run.opts[i];
    if (!o) return;
    Sound.play('ui');
    if (o.set) run.flags[o.set] = true;
    for (const [id, v] of Object.entries(o.aff || {})) {
      run.aff[id] = (run.aff[id] || 0) + v;
      UI.toast(t('remember', nameOf(id)));
    }
    run.wait = null; run.line = null;
    $('#sbox .choices').innerHTML = '';
    push(o.then);
    next();
  }

  function phone(n) {
    run.wait = 'phone';
    $('#sbox').className = 'hidden';
    const out = n.phone === 'eli';
    if (!out) run.phoneFrom = n.phone;
    run.phone = [...run.phone, { out, text: L(n) }].slice(-4);
    const el = $('#sphone');
    el.classList.remove('hidden');
    el.innerHTML = `<div class="ph-head"><i></i>${esc(nameOf(run.phoneFrom || 'junie'))}</div>` +
      run.phone.map((m, k) => `<p class="${m.out ? 'out' : 'in'}${k === run.phone.length - 1 ? ' new' : ''}">${esc(m.text)}</p>`).join('') +
      `<small class="s-tap">${t('tapOn')}</small>`;
    Sound.play(out ? 'tap' : 'coin');
  }
  function hidePhone() { run.phone = []; run.phoneFrom = null; $('#sphone').classList.add('hidden'); }

  function card(html) {
    run.wait = 'card';
    $('#sbox').className = 'hidden';
    const el = $('#scard');
    el.innerHTML = html + `<small class="s-tap">${t('tapOn')}</small>`;
    el.classList.remove('hidden');
    Sound.play('ui');
  }
  function diary(lines) {
    run.wait = 'diary';
    $('#sbox').className = 'hidden';
    const rows = lines.filter((l) => !l.if || test(l.if)).map((l, i) => (i ? `<p>${esc(L(l))}</p>` : `<h3>${esc(L(l))}</h3>`)).join('');
    const el = $('#scard');
    el.innerHTML = `<div class="s-diary"><small>${t('diaryTitle')}</small>${rows}</div><small class="s-tap">${t('tapOn')}</small>`;
    el.classList.remove('hidden');
    Sound.play('story');
  }

  function setCg(id) {
    run.cg = id;
    const el = $('#scg');
    if (id) { el.dataset.cg = id; el.classList.remove('off'); } else el.classList.add('off');
  }

  // ---------- гость у стойки ----------
  function enter(id) {
    $('#sbox').className = 'hidden';
    run.wait = 'enter';
    run.cu = { id: 0, x: -80, tx: Art.W / 2, state: 'enter', look: REGULAR[id] ? REGULAR[id].look : null, reg: id, kind: null,
      phase: 0, jumpT: 0, shakeT: 0, joyT: 0, wiggleT: 0, pat: 1, patMax: 1, happy: true, big: 1.45 };
  }
  function leave() {
    if (!run.cu) return;
    run.cu.state = 'leave';
    run.cu.tx = Art.W + 140;
  }

  // ---------- варка в три шага ----------
  function openBrew(n) {
    run.wait = 'brew';
    run.brew = n;
    run.cup = { base: '', top: '', extra: '' };
    $('#sbox').className = 'hidden';
    const b = n.brew;
    const chip = (step, o) => `<button class="sb-chip${o.id === 'none' ? ' nocof' : ''}" data-sstep="${step}" data-id="${o.id}"><span class="sb-img"><img src="img/${o.img}.png" alt="">${o.x2 ? '<i>×2</i>' : ''}</span><span>${esc(T(o.name))}</span></button>`;
    const row = (step, n) => `<div class="sb-row"><span class="sb-lbl"><i>${n}</i>${t('sb_' + step)}</span><div class="sb-opts">${SB[step].map((o) => chip(step, o)).join('')}</div></div>`;
    const el = $('#sbrew');
    el.innerHTML = `
      <div class="sb-order"><b>${esc(nameOf(b.by))}:</b> ${LANG === 'ru' ? '«' : '“'}${esc(L(b.order))}${LANG === 'ru' ? '»' : '”'}<button class="sb-book" data-sbrew="book">${t('sb_book')}</button></div>
      ${b.tutorial && !S.story.tutDone ? `<p class="sb-tip">${t('sb_tip')}</p>` : ''}
      <div class="sb-main">
        <div class="sb-steps">${row('base', 1)}${row('top', 2)}${row('extra', 3)}</div>
        <div class="sb-cup"><canvas id="sb-cv" width="48" height="40"></canvas><b id="sb-name"></b>
          <div class="sb-btns"><button class="btn primary" data-sbrew="serve">${t('sb_serve')}</button><button class="btn small ghost" data-sbrew="reset">${t('sb_reset')}</button></div></div>
      </div>`;
    UI.setMode('story-brew');
    renderBrew();
  }

  function detect(c) {
    if (!c.base) return null;
    return Object.keys(STORY_DRINKS).find((id) => { const d = STORY_DRINKS[id]; return d[0] === c.base && d[1] === c.top && d[2] === c.extra; }) || null;
  }

  function onBrew(e) {
    const chip = e.target.closest('[data-sstep]');
    if (chip) {
      const step = chip.dataset.sstep, id = chip.dataset.id;
      run.cup[step] = run.cup[step] === id && step !== 'base' ? '' : id;
      if (run.cup[step]) Sound.play(SB[step].find((o) => o.id === id).sfx); else Sound.play('tap');
      renderBrew();
      return;
    }
    const b = e.target.closest('[data-sbrew]');
    if (!b) return;
    if (b.dataset.sbrew === 'reset') { run.cup = { base: '', top: '', extra: '' }; Sound.play('trash'); renderBrew(); }
    if (b.dataset.sbrew === 'book') { Sound.play('ui'); showBook(); }
    if (b.dataset.sbrew === 'serve') serve();
  }

  function renderBrew() {
    document.querySelectorAll('#sbrew [data-sstep]').forEach((c) => c.classList.toggle('on', run.cup[c.dataset.sstep] === c.dataset.id));
    const id = detect(run.cup);
    const nm = $('#sb-name');
    nm.textContent = !run.cup.base ? t('sb_pick') : id ? drinkName(id) : t('custom2');
    nm.classList.toggle('muted', !id);
    $('#sbrew [data-sbrew="serve"]').disabled = !run.cup.base;
    drawCup(id);
  }

  // Чашка крупными пикселями: слои кофе, воды, молока и пены
  function drawCup(id) {
    const cv = $('#sb-cv'), g = cv.getContext('2d'), c = run.cup;
    g.clearRect(0, 0, 48, 40);
    const type = id ? STORY_DRINKS[id][3] : c.top === 'milk' || c.top === 'cold' ? 'glass' : c.top ? 'cup' : 'demi';
    const [x, y, w, h] = { demi: [17, 22, 14, 11], cup: [12, 17, 24, 16], glass: [16, 5, 16, 30], mug: [13, 11, 22, 24] }[type];
    g.fillStyle = type === 'glass' ? 'rgba(220,235,245,.28)' : '#f4ece0'; g.fillRect(x - 1, y, w + 2, h + 1);
    let level = 0;
    const layer = (k, col) => { const hh = Math.round(k * (h - 1)); if (hh <= 0) return; g.fillStyle = col; g.fillRect(x, y + h - level - hh, w, hh); level += hh; };
    if (c.extra === 'gelato') layer(0.3, '#fff3d6');
    if (c.top === 'cold') layer(0.2, '#dff4fc');
    if (c.extra && ['chocolate', 'caramel', 'vanilla'].includes(c.extra)) layer(0.12, INGREDIENTS[c.extra].color);
    if (c.base === 'espresso' || c.base === 'double') layer(c.top ? (c.base === 'double' ? 0.3 : 0.22) : c.base === 'double' ? 0.75 : 0.6, '#4a2a16');
    if (c.top === 'water') layer(0.6, '#6a3e22');
    if (c.top === 'milk' || c.top === 'cold') layer(0.45, c.base === 'none' ? '#f7efe1' : '#d8b48a');
    if (c.top === 'foam') { layer(0.25, '#d8b48a'); layer(0.3, '#fffdf8'); }
    if (c.extra === 'cream') layer(0.18, '#fff6e6');
    if (c.extra === 'cinnamon') { g.fillStyle = '#9b5a2e'; for (let i = 0; i < 5; i++) g.fillRect(x + 2 + i * (w / 5), y + h - level - 1, 1, 1); }
    g.fillStyle = '#2a1a24'; g.fillRect(x - 1, y + h + 1, w + 2, 1);
    if (type !== 'glass') { g.fillStyle = '#f4ece0'; g.fillRect(x + w + 1, y + 2, 2, 2); g.fillRect(x + w + 3, y + 2, 1, Math.round(h * 0.5)); g.fillRect(x + w + 1, y + 2 + Math.round(h * 0.5), 3, 2); }
    if (type === 'demi' || type === 'cup') { g.fillStyle = '#e9dccb'; g.fillRect(x - 4, y + h + 2, w + 8, 2); }
  }

  function showBook() {
    const step = (s, id) => (id ? T(SB[s].find((o) => o.id === id).name) : '');
    const rows = Object.entries(STORY_DRINKS).map(([id, d]) =>
      `<li><b>${drinkName(id)}</b><span>${[step('base', d[0]), step('top', d[1]), step('extra', d[2])].filter(Boolean).join(' + ')}</span></li>`).join('');
    UI.openModal(`<h2>${t('sb_book')}</h2><p class="muted">${t('sb_bookIntro')}</p><ul class="s-book">${rows}</ul>
      <button class="btn primary" data-act="close-modal">${t('storyOk')}</button>`);
  }

  function serve() {
    if (!run.cup.base) return;
    const n = run.brew, id = detect(run.cup), want = n.brew.want, cu = run.cu;
    run.served = id;
    const ok = id === want;
    if (n.brew.tutorial) S.story.tutDone = true;
    Sound.play(ok ? 'ding' : 'wrong');
    if (cu) { if (ok) { cu.joyT = 1.5; cu.jumpT = 1; Art.burst(cu.x, cu.hy, 'heart', 3); } else cu.shakeT = 1; }
    UI.setMode('story');
    run.wait = null;
    push(ok ? n.ok : (n.also && n.also[id]) || n.wrong);
    setTimeout(next, 450);
  }

  // ---------- конец главы ----------
  function finish() { done(); }
  function done() {
    if (!run) return;
    const st = S.story;
    st.snap = { ...st.snap, [run.id]: run.from };
    st.flags = run.flags; st.aff = run.aff;
    if (!st.done.includes(run.id)) st.done.push(run.id);
    const id = run.id;
    cleanup();
    persist();
    UI.endStory(id);
  }
  function cleanup() {
    if (run) clearTimeout(run.titleT);
    run = null;
    hideAll();
  }
  function hideAll() {
    $('#sbox').className = 'hidden';
    ['#sphone', '#scard', '#stitle'].forEach((s) => $(s).classList.add('hidden'));
    $('#scg').classList.add('off');
  }

  // ---------- кадр ----------
  function update(dt) {
    if (!run) return;
    const cu = run.cu;
    if (cu) {
      const d = cu.tx - cu.x;
      cu.x += Math.sign(d) * Math.min(Math.abs(d), 260 * dt);
      cu.jumpT = Math.max(0, cu.jumpT - dt * 2); cu.shakeT = Math.max(0, cu.shakeT - dt * 2); cu.joyT = Math.max(0, cu.joyT - dt);
      if (cu.state === 'enter' && Math.abs(d) < 1) { cu.state = 'sit'; if (run.wait === 'enter') { run.wait = null; next(); } }
      if (cu.state === 'sit') cu.tx = Art.W / 2;
      if (cu.state === 'leave' && cu.x >= Art.W + 120) run.cu = null;
    }
    const ln = run.line;
    if (run.wait === 'line' && ln) {
      const before = Math.floor(ln.shown);
      ln.shown = Math.min(ln.text.length, ln.shown + dt * (ln.kind === 'nar' ? 55 : 42));
      const k = Math.floor(ln.shown), box = $('#sbox');
      if (k !== before) { box.querySelector('.say').textContent = ln.text.slice(0, k); if (ln.kind === 'say' && k % 3 === 0) Sound.play('blip'); }
      if (ln.shown >= ln.text.length && !box.querySelector('.caret')) box.querySelector('.say').insertAdjacentHTML('beforeend', '<span class="caret"></span>');
    }
  }

  function init() {
    const onTap = (e) => {
      if (!run) return;
      const ch = e.target.closest('[data-schoice]');
      if (ch) { e.stopPropagation(); pick(+ch.dataset.schoice); return; }
      if (e.target.closest('#shud') || run.wait === 'choice') return;
      tap();
    };
    $('#scene-wrap').addEventListener('pointerdown', onTap);
    $('#sdock').addEventListener('pointerdown', onTap);
    $('#scard').addEventListener('pointerdown', onTap);
    $('#sbrew').addEventListener('click', onBrew);
    document.addEventListener('keydown', (e) => {
      if (!run || e.repeat || UI.modalOpen) return;
      if (run.wait === 'choice') { const m = /^Digit([1-3])$/.exec(e.code); if (m) pick(+m[1] - 1); return; }
      if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); tap(); }
    }, true);
  }

  // Какая глава следующая: первая непройденная, у которой уже есть сценарий
  const nextId = () => STORY_ORDER.find((id) => !S.story.done.includes(id));

  return {
    init, start, update, nextId,
    get active() { return !!run; },
    get customers() { return run && run.cu ? [run.cu] : []; },
    quit() { cleanup(); },
  };
})();
