// История — отдельный режим: каждая ночь — глава. Дорога до смены, сюжетный гость посреди смены (смена замирает
// на сцену), закрытие с Розой и дневник после. Глава играется в «песочнице» (enterSandbox): напитки и сложность
// задаёт сценарий, свободная игра не затрагивается. Сценарий — в js/story/*.js, как писать — .claude/skills/salem-story/SKILL.md.

const STORY_CH = {};
const STORY_ORDER = ['prologue', 'ch1', 'ch2', 'ch3', 'ch4'];
const CAST = {
  eli: { en: 'Eli', ru: 'Илай' },
  junie: { en: 'Junie', ru: 'Джуни' },
  mom: { en: 'Mom', ru: 'Мама' },
  kyle: { en: 'Kyle', ru: 'Кайл' },
  nico: { en: 'Nico', ru: 'Нико' },
};

const Story = (() => {
  let night = null; // глава, которая идёт этой ночью: выборы, симпатии, что подали
  let run = null;   // сцена, которая сейчас на экране
  const $ = (s) => document.querySelector(s);
  const L = (o) => (o ? o[LANG] || o.en : '');
  const nameOf = (id) => T(CAST[id] || (REGULAR[id] && REGULAR[id].name) || id);
  const drinkName = (id) => (id && RECIPE[id] ? T(RECIPE[id].name) : t('custom2'));
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

  // ---------- ночь ----------
  // Глава с узлами nodes (пролог) идёт целиком сценой; обычная глава — дорога, смена с сюжетным гостем, закрытие
  function begin(id) {
    const ch = STORY_CH[id], st = S.story;
    // переигрываешь главу — выборы считаются с того, что было до неё
    const from = (st.snap && st.snap[id]) || { flags: st.flags, aff: st.aff };
    night = { id, ch, from, flags: { ...from.flags }, aff: { ...from.aff }, served: null };
    enterSandbox(ch.bar);
    Art.resize(); Art.invalidate();
    const list = ch.nodes || ch.road || [];
    scene(list, { layout: 'story', title: true, sky: ch.nodes ? 0.97 : 0.02, onDone: ch.nodes ? done : () => openShift(ch) });
  }

  // Смена главы; новый напиток, которому Роза научила в дороге, — подсказкой с составом
  function openShift(ch) {
    UI.startShift({ beat: ch.beat, story: true });
    const r = ch.bar && ch.bar.teach && RECIPE[ch.bar.teach];
    if (r) setTimeout(() => UI.toast(r.ings.length > 1 ? t('teachDrink', T(r.name), r.ings.map((i) => T(INGREDIENTS[i].name).toLowerCase()).join(' + ')) : t('newRecipe', T(r.name)), 'long'), 1600);
  }

  // Сюжетный гость дошёл до стойки: короткая завязка, потом смена идёт дальше, пока ему не подадут
  function arrived(cu) {
    const b = night && night.ch.beat;
    if (!b || !b.intro) return;
    Shift.paused = true;
    scene(b.intro, { layout: 'beat', onDone: () => { Shift.paused = false; UI.setMode('shift'); } });
  }

  // Подали сюжетному гостю: в прологе — обратно в сцену, в смене — сцена поверх замершей смены
  function served(cu, rid, ok) {
    night.served = rid;
    if (run && run.wait === 'bar') {
      const b = run.brew;
      Shift.endSolo();
      cu.state = 'sit';
      run.cu = cu;
      run.wait = null;
      UI.setMode('story');
      if (b.brew.tutorial) { S.tips.basics = true; persist(); }
      push(ok ? b.ok : (b.also && b.also[rid]) || b.wrong);
      setTimeout(next, 500);
      return;
    }
    const b = night.ch.beat;
    if (ok) night.flags.beatOk = true;
    scene(ok ? b.ok : (b.also && b.also[rid]) || b.wrong, { layout: 'beat', delay: 450, onDone: () => { Shift.beatDone(cu); UI.setMode('shift'); } });
  }

  // Смена закончилась: закрытие с Розой по звёздам и дневник, потом обычный итог
  function afterShift(result) {
    if (!night || night.ch.nodes) return false;
    // before — общее начало, good/ok/bad — по звёздам, after — общее продолжение (может быть целой сценой)
    const c = night.ch.close || {};
    const byStars = (result.stars >= 3 ? c.good : result.stars === 2 ? c.ok : c.bad) || [];
    const list = [...(c.before || []), ...byStars, ...(c.after || []), ...(night.ch.diary ? [{ diary: night.ch.diary }] : [])];
    const ch = night.ch;
    scene(list, { layout: 'story', sky: 1, onDone: () => { done(); UI.showSummary({ ...result, chapter: ch }); } });
    return true;
  }

  function done() {
    if (!night) return;
    const st = S.story;
    st.snap = { ...st.snap, [night.id]: night.from };
    st.flags = night.flags; st.aff = night.aff;
    if (!st.done.includes(night.id)) st.done.push(night.id);
    const id = night.id;
    night = null;
    leaveSandbox();
    Art.resize(); Art.invalidate();
    persist();
    if (STORY_CH[id].nodes) { UI.setMode('menu'); UI.showMenu(); }
  }

  // ---------- сцена ----------
  function scene(list, opts) {
    run = { stack: [{ list, i: 0 }], opts, wait: null, line: null, phone: [], cu: run && opts.layout === 'story' ? run.cu : null };
    hideAll();
    Talk.clear();
    $('#banner').className = ''; // «Последние заказы!» и прочее от смены не висят поверх сцены
    UI.setMode(opts.layout);
    // иллюстрация в начале главы появляется сразу, под названием
    while (list[run.stack[0].i] && list[run.stack[0].i].cg !== undefined) setCg(list[run.stack[0].i++].cg);
    if (opts.title) showTitle();
    else if (opts.delay) { run.wait = 'fade'; setTimeout(() => { if (run && run.wait === 'fade') { run.wait = null; next(); } }, opts.delay); } else next();
  }
  function endScene() {
    const r = run;
    run = null;
    hideAll();
    r.opts.onDone && r.opts.onDone();
  }

  function showTitle() {
    run.wait = 'title';
    const el = $('#stitle'), ch = night.ch;
    el.innerHTML = `<small>${L(ch.num)}</small><b>${L(ch.title)}</b>`;
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

  const test = (cond) => (cond[0] === '!' ? !night.flags[cond.slice(1)] : !!night.flags[cond]);
  const push = (list) => { if (list && list.length) run.stack.push({ list, i: 0 }); };

  function next() {
    while (run) {
      const top = run.stack[run.stack.length - 1];
      if (!top) { endScene(); return; }
      if (top.i >= top.list.length) { run.stack.pop(); continue; }
      if (exec(top.list[top.i++])) return;
    }
  }

  // Узел сценария; true — ждём игрока или анимацию
  function exec(n) {
    if (!n.phone && run.phone.length) hidePhone();
    if (n.cg !== undefined) { setCg(n.cg); return false; }
    if (n.sfx) { Sound.play(n.sfx); return false; }
    if (n.set) { night.flags[n.set] = true; return false; }
    if (n.if) { push(test(n.if) ? n.then : n.else); return false; }
    if (n.enter) { enter(n.enter); return true; }
    if (n.leave) { leave(); return false; }
    if (n.nar) { say({ kind: 'nar', text: L(n.nar) }); return true; }
    if (n.who) { say({ kind: n.who === 'think' ? 'think' : 'say', who: n.who === 'think' ? '' : nameOf(n.who), text: L(n) }); return true; }
    if (n.phone) { phone(n); return true; }
    if (n.note) { card(`<div class="s-note">${esc(L(n.note)).replace(/\n/g, '<br>')}</div>`); return true; }
    if (n.photo) { card(`<figure class="s-photo"><img src="img/cg-photo-${n.photo}.png" alt=""><figcaption>${esc(L(n.caption))}</figcaption></figure>`); return true; }
    if (n.choice) { choose(n.choice); return true; }
    if (n.brew) { bar(n); return true; }
    if (n.diary) { diary(n.diary); return true; }
    return false;
  }

  // ---------- реплики ----------
  function say({ kind, who = '', text }) {
    text = text.replace('{drink}', night.served ? drinkName(night.served).toLowerCase() : '');
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
    if (run.wait === 'phone' || run.wait === 'card' || run.wait === 'diary') {
      if (run.wait !== 'phone') $('#scard').classList.add('hidden');
      run.wait = null; next();
    }
  }

  function choose(opts) {
    run.wait = 'choice';
    const box = $('#sbox');
    if (box.classList.contains('hidden') || !run.line) { box.className = 'k-choice'; box.querySelector('.who').textContent = ''; }
    box.querySelector('.say').textContent = run.line ? run.line.text : '';
    box.querySelector('.choices').innerHTML = opts.map((o, i) => `<button class="choice" data-schoice="${i}"><i>${i + 1}</i>${esc(L(o))}</button>`).join('');
    run.opts.choices = opts;
  }
  function pick(i) {
    const o = run && run.wait === 'choice' && run.opts.choices[i];
    if (!o) return;
    Sound.play('ui');
    if (o.set) night.flags[o.set] = true;
    for (const [id, v] of Object.entries(o.aff || {})) {
      night.aff[id] = (night.aff[id] || 0) + v;
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
    const el = $('#scg');
    if (id) { el.dataset.cg = id; el.classList.remove('off'); } else el.classList.add('off');
  }

  // ---------- гость у стойки (сцены до и после смены) ----------
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

  // Варка в прологе: настоящий бар, один гость, подсказки по шагам
  function bar(n) {
    run.wait = 'bar';
    run.brew = n;
    $('#sbox').className = 'hidden';
    Shift.start({ solo: { cu: run.cu, want: n.brew.want } });
    run.cu = null;
    UI.buildStation();
    UI.setMode('story-bar');
  }

  function hideAll() {
    $('#sbox').className = 'hidden';
    ['#sphone', '#scard', '#stitle'].forEach((s) => $(s).classList.add('hidden'));
    $('#scg').classList.add('off');
  }

  // Выйти посреди главы: прогресс ночи не сохраняется
  function quit() {
    if (run) clearTimeout(run.titleT);
    if (Shift.active) Shift.endSolo();
    run = null; night = null;
    hideAll();
    leaveSandbox();
    Art.resize(); Art.invalidate();
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
      if (cu.state === 'leave' && cu.x >= Art.W + 120 && run) run.cu = null;
    }
    const ln = run && run.line;
    if (run && run.wait === 'line' && ln) {
      ln.shown = Math.min(ln.text.length, ln.shown + dt * (ln.kind === 'nar' ? 55 : 42));
      const k = Math.floor(ln.shown), box = $('#sbox');
      // сколько букв уже на экране — отдельно: тап может допечатать реплику сразу
      if (k !== ln.drawn) { box.querySelector('.say').textContent = ln.text.slice(0, k); if (ln.kind === 'say' && k > (ln.drawn || 0) && k % 3 === 0) Sound.play('blip'); ln.drawn = k; }
      if (ln.shown >= ln.text.length && !box.querySelector('.caret')) box.querySelector('.say').insertAdjacentHTML('beforeend', '<span class="caret"></span>');
    }
  }

  function init() {
    const onTap = (e) => {
      if (!run) return;
      const ch = e.target.closest('[data-schoice]');
      if (ch) { e.stopPropagation(); pick(+ch.dataset.schoice); return; }
      if (e.target.closest('#shud') || run.wait === 'choice' || run.wait === 'bar') return;
      tap();
    };
    $('#scene-wrap').addEventListener('pointerdown', onTap);
    $('#sdock').addEventListener('pointerdown', onTap);
    $('#scard').addEventListener('pointerdown', onTap);
    document.addEventListener('keydown', (e) => {
      if (!run || e.repeat || UI.modalOpen || run.wait === 'bar') return;
      if (run.wait === 'choice') { const m = /^Digit([1-3])$/.exec(e.code); if (m) pick(+m[1] - 1); return; }
      if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); tap(); }
    }, true);
  }

  // Какая глава следующая: первая непройденная, у которой уже есть сценарий
  const nextId = () => STORY_ORDER.find((id) => !S.story.done.includes(id) && STORY_CH[id]) || null;

  return {
    init, begin, arrived, served, afterShift, quit, update, nextId,
    get active() { return !!run; },
    get inNight() { return !!night; },
    get customers() { return run && run.cu ? [run.cu] : []; },
    get sky() { return run ? run.opts.sky ?? 0.5 : 0.97; },
  };
})();
