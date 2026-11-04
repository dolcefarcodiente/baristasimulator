// «Тихая ночь»: гости приходят по одному, как в Coffee Talk, а весь кофе варишь сам —
// зерно, помол, доза на весах, темпер, шот по секундомеру, молоко по термометру, чайник, пуровер.

const BEANS = [
  { id: 'bean1', name: { ru: 'Бразилия Сантос', en: 'Brazil Santos' }, note: { ru: 'орех и шоколад', en: 'nutty, chocolate' } },
  { id: 'bean2', name: { ru: 'Домашняя смесь', en: 'House blend' }, note: { ru: 'баланс и карамель', en: 'balanced, caramel' } },
  { id: 'bean3', name: { ru: 'Суматра, тёмная', en: 'Sumatra dark' }, note: { ru: 'плотно и землисто', en: 'bold, earthy' } },
];
const MILKS = {
  whole: { name: { ru: 'Цельное', en: 'Whole milk' }, ideal: [58, 65] },
  oat: { name: { ru: 'Овсяное', en: 'Oat milk' }, ideal: [55, 62] },
};
const CUPS = {
  demi: { name: { ru: 'Демитас', en: 'Demitasse' } },
  cup: { name: { ru: 'Чашка капучино', en: 'Cappuccino cup' } },
  glass: { name: { ru: 'Стакан латте', en: 'Latte glass' } },
  mug: { name: { ru: 'Кружка', en: 'Mug' } },
};
const EXTRA_IDS = ['vanilla', 'caramel', 'chocolate', 'cinnamon', 'cream', 'ice', 'gelato'];
// в какой посуде подают
const CUP_OF = {
  espresso: 'demi', ristretto: 'demi', doppio: 'demi', macchiato: 'demi', conpanna: 'demi', shakerato: 'glass',
  cappuccino: 'cup', flatwhite: 'cup', marocchino: 'cup', affogato: 'cup',
  latte: 'glass', vanillalatte: 'glass', caramelmacchiato: 'glass', icedlatte: 'glass', mocha: 'glass', pumpkinlatte: 'glass', gingerlatte: 'glass',
  americano: 'mug', lungo: 'mug', drip: 'mug', cioccolata: 'mug', amore: 'mug',
};
// окна времени шота: ристретто, эспрессо, лунго
const SHOT_WIN = { ristretto: [15, 22], espresso: [24, 30], lungo: [28, 36] };

// Как гости просят напиток, если не называют его прямо (угадай сам)
const HINTS = {
  espresso: { en: 'Something small and strong. Just to wake up.', ru: 'Что-нибудь маленькое и крепкое. Просто проснуться.' },
  americano: { en: 'Coffee, but long. Something I can sip slowly.', ru: 'Кофе, но побольше. Чтобы пить медленно.' },
  latte: { en: 'Something soft and milky. Not too strong.', ru: 'Что-нибудь мягкое, молочное. Не слишком крепкое.' },
  doppio: { en: 'Double the strength, no milk. Long night ahead.', ru: 'Двойная крепость, без молока. Впереди длинная ночь.' },
  ristretto: { en: 'The shortest, most intense coffee you can make.', ru: 'Самый короткий и насыщенный кофе, какой умеешь.' },
  cappuccino: { en: 'Something with a thick cloud of foam. The Italian classic.', ru: 'С густым облаком пены. Итальянская классика.' },
  macchiato: { en: 'A shot with just a spoon of foam on top.', ru: 'Шот и ложка пены сверху.' },
  lungo: { en: 'An espresso, but let it run long.', ru: 'Эспрессо, но пусть течёт подольше.' },
  cioccolata: { en: 'No coffee tonight. Something like a warm hug.', ru: 'Сегодня без кофе. Что-нибудь как тёплые объятия.' },
  drip: { en: 'Plain black coffee, slow-brewed, like at home.', ru: 'Просто чёрный кофе, медленно заваренный, как дома.' },
  flatwhite: { en: 'Strong, with silky milk and barely any foam.', ru: 'Крепко, бархатное молоко, почти без пены.' },
  conpanna: { en: 'A shot with a little cloud of cream.', ru: 'Шот с облачком сливок.' },
  mocha: { en: 'Coffee and chocolate. I deserve it today.', ru: 'Кофе и шоколад. Я сегодня заслужил.' },
  vanillalatte: { en: 'Something milky and sweet, with vanilla.', ru: 'Что-нибудь молочное и сладкое, с ванилью.' },
  caramelmacchiato: { en: 'Sweet and foamy, with caramel.', ru: 'Сладкое, с пеной и карамелью.' },
  icedlatte: { en: 'Something cold with milk. I am overheated.', ru: 'Что-нибудь холодное с молоком. Я перегрелся.' },
  affogato: { en: 'Dessert and coffee in one cup.', ru: 'Десерт и кофе в одной чашке.' },
  marocchino: { en: 'Chocolate, foam and a hint of spice. Surprise me.', ru: 'Шоколад, пена и капля пряности. Удиви.' },
};
const REACT = {
  perfect: { en: ['This… this is exactly it.', 'Perfect. How did you know?', 'I could cry. In a good way.'], ru: ['Это… именно то, что нужно.', 'Идеально. Как ты догадался?', 'Я сейчас расплачусь. В хорошем смысле.'] },
  great: { en: ['Really good. Thank you.', 'Mm. That hits the spot.'], ru: ['Очень вкусно. Спасибо.', 'М-м. То, что надо.'] },
  good: { en: ['It’s fine. Warm, at least.', 'Not bad. A bit off, maybe.'], ru: ['Нормально. Хотя бы тёплый.', 'Неплохо. Чуть не то, может быть.'] },
  wrong: { en: ['That’s… not what I meant. But thanks.', 'Hm. Interesting choice.'], ru: ['Это… не совсем то, что я имел в виду. Но спасибо.', 'Хм. Интересный выбор.'] },
};
const QB = {
  ask: { en: (d) => `A ${d}, please.`, ru: (d) => `${d}, пожалуйста.` },
  usual: { en: 'The usual, if you remember.', ru: 'Как обычно, если помнишь.' },
};

const Brew = (() => {
  let night = null;      // { guests, i, phase, earned, served, perfects, stories, lines, ... }
  let cup = null, pf = null, v60 = null, pitcher = null, kettle = null, pull = null, tamping = null;
  let bean = 'bean2', milkKind = 'whole', grind = 3, dest = 'pf', air = false, holding = null, pourHold = 0;
  let lastShot = null;
  const $ = (s) => document.querySelector(s);
  const L = (o) => (o ? o[LANG] || o.en : '');

  // ---------- модель напитка ----------
  const newCup = (type) => ({ type, shots: [], milk: { ml: 0, foam: 0, heat: 0, kind: null, bubbles: 0, art: null }, water: { ml: 0, heat: 0 }, filter: null, extras: {} });
  const shotKind = (ml) => (ml < 24 ? 'ristretto' : ml <= 45 ? 'espresso' : 'lungo');

  // Что получилось в чашке — набор ингредиентов, как у рецептов в меню
  function itemsOf(c) {
    const items = c.shots.map((s) => shotKind(s.ml));
    if (c.filter && c.filter.ml >= 120) items.push('filter');
    if (c.water.ml >= 60) items.push('water');
    const m = c.milk, ff = m.ml ? m.foam / m.ml : 0;
    if (m.ml >= 60) { items.push('milk'); if (ff >= 0.3) items.push('foam'); }
    else if (m.ml >= 10) items.push(ff >= 0.3 ? 'foam' : 'milk');
    for (const e of EXTRA_IDS) if (c.extras[e]) items.push(e);
    return items;
  }
  function detect(c) {
    const items = itemsOf(c);
    if (!items.length) return null;
    return Object.values(RECIPE).find((r) => sameSet(r.ings, items)) || null;
  }

  // Оценка 0–100: шоты, молоко, вода, фильтр, посуда, латте-арт
  function grade(c, rec) {
    const parts = [], notes = [];
    for (const s of c.shots) { parts.push(s.q); if (s.taste !== 'balanced') notes.push(t('b_' + s.taste)); }
    const ings = rec.ings;
    if (c.milk.ml > 0) {
      const m = c.milk, ff = m.foam / m.ml, cold = ings.includes('ice');
      let q = 100;
      if (cold) { if (m.heat > 15) { q -= 50; notes.push(t('b_warmMilk')); } }
      else {
        const [lo, hi] = MILKS[m.kind || 'whole'].ideal;
        if (m.heat > 72) { q -= 45; notes.push(t('b_scorched')); }
        else if (m.heat < lo) { q -= (lo - m.heat) * 3; notes.push(t('b_coolMilk')); }
        else if (m.heat > hi) q -= (m.heat - hi) * 4;
      }
      const [flo, fhi] = ings.includes('foam') && ings.includes('milk') ? [0.3, 0.6] : ings.includes('foam') ? [0.5, 1] : rec.id === 'flatwhite' ? [0.03, 0.18] : cold ? [0, 0.2] : [0.05, 0.28];
      if (ff < flo) { q -= (flo - ff) * 150; notes.push(t('b_flat')); }
      if (ff > fhi) { q -= (ff - fhi) * 150; notes.push(t('b_foamy')); }
      q -= Math.min(30, m.bubbles * 25);
      if (m.bubbles > 0.4) notes.push(t('b_bubbles'));
      parts.push(clamp(q, 0, 100));
    }
    if (c.water.ml > 0) {
      let q = 100 - Math.max(0, 88 - c.water.heat) * 4 - Math.max(0, c.water.heat - 97) * 4;
      if (c.water.ml < 70 || c.water.ml > 200) q -= 15;
      parts.push(clamp(q, 0, 100));
    }
    if (c.filter) parts.push(c.filter.q);
    let q = parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : 60;
    if (CUP_OF[rec.id] && c.type !== CUP_OF[rec.id]) { q -= 15; notes.push(t('b_wrongCup', L(CUPS[CUP_OF[rec.id]].name))); }
    if (c.milk.art && c.shots.length) q += 8;
    return { q: clamp(Math.round(q), 0, 100), notes: [...new Set(notes)] };
  }

  // Шот: время относительно окна для его вида, доза 18 г, темпер
  function shotScore(s) {
    const kind = shotKind(s.ml), [lo, hi] = SHOT_WIN[kind];
    let q = 100;
    if (s.t < lo) q -= (lo - s.t) * 7;
    if (s.t > hi) q -= (s.t - hi) * 7;
    q -= Math.max(0, Math.abs(s.grams - 18) - 1) * 6;
    q -= s.tamp == null ? 30 : (1 - s.tamp) * 20;
    return { q: clamp(Math.round(q), 0, 100), taste: s.t < lo ? 'sour' : s.t > hi ? 'bitter' : 'balanced', kind };
  }

  // ---------- ночь и гости ----------
  function start() {
    const regs = REGULARS.filter((r) => S.day >= r.minDay && S.recipes.includes(r.fav)).sort(() => Math.random() - 0.5).slice(0, 3);
    const guests = regs.map((r) => ({ reg: r.id }));
    while (guests.length < 4) guests.push({ reg: null, look: randomLook() });
    guests.sort(() => Math.random() - 0.5);
    night = { guests, i: -1, earned: 0, served: 0, perfects: 0, stories: [], lines: [], line: null, shown: 0, phase: 'idle', cu: null, t: 0 };
    cup = null; pf = null; v60 = null; pull = null; tamping = null; lastShot = null;
    pitcher = { ml: 0, heat: 5, foam: 0, bubbles: 0 };
    kettle = { heat: 22, target: 94, v60ml: 0 };
    buildBench();
    nextGuest();
  }

  function nextGuest() {
    night.i++;
    if (night.i >= night.guests.length) { finish(); return; }
    const g = night.guests[night.i];
    const W = Art.W;
    UI.updateBrewHud();
    night.cu = { id: night.i, x: -80, tx: W / 2, state: 'enter', look: g.reg ? REGULAR[g.reg].look : g.look, reg: g.reg, kind: null,
      phase: rand(0, 6), jumpT: 0, shakeT: 0, joyT: 0, wiggleT: 0, pat: 1, patMax: 1, happy: true, big: 1.45 };
    // что просит: постоянные — своё «как обычно» или загадку, случайные гости — загадку или прямо
    const owned = S.recipes.filter((id) => RECIPE[id] && HINTS[id]);
    let target, ask;
    if (g.reg) {
      const st = regState(g.reg);
      target = st.hearts >= 3 && Math.random() < 0.5 ? pick(owned) : REGULAR[g.reg].fav;
      ask = target === REGULAR[g.reg].fav ? (st.visits > 0 ? L(QB.usual) : (QB.ask[LANG] || QB.ask.en)(T(RECIPE[target].name))) : L(HINTS[target]);
    } else {
      target = pick(owned);
      ask = Math.random() < 0.7 ? L(HINTS[target]) : (QB.ask[LANG] || QB.ask.en)(T(RECIPE[target].name));
    }
    g.target = target;
    const greet = g.reg ? pick(lines(TALK.greet[g.reg])) : TALK.sprite[g.look.sprite] && Math.random() < 0.6 ? pick(lines(TALK.sprite[g.look.sprite])) : pick(lines(TALK.night));
    night.phase = 'enter';
    const ord = $('#brew .b-order'); if (ord) ord.classList.add('hidden');
    night.queue = [greet, ask];
    night.ask = ask;
    Sound.play('door');
  }
  const lines = (set) => set[LANG] || set.en;
  const nameOf = (g) => (g.reg ? T(REGULAR[g.reg].name) : t('guestName'));

  // Реплики по одной; тап по рамке — дальше
  function say(text, then) {
    night.line = { text, then, shown: 0 };
    const box = $('#qtalk');
    box.classList.remove('hidden');
    box.querySelector('.who').textContent = nameOf(night.guests[night.i]);
    box.querySelector('.say').textContent = '';
    box.querySelector('.choices').innerHTML = '';
  }
  function advance() {
    const ln = night && night.line;
    if (!ln) return;
    if (ln.shown < ln.text.length) { ln.shown = ln.text.length; return; } // сначала допечатать
    if (ln.choice) return;
    night.line = null;
    ln.then && ln.then();
  }
  function talkQueue(list, done) {
    if (!list.length) { done && done(); return; }
    say(list[0], () => talkQueue(list.slice(1), done));
  }

  // Подали напиток
  function serve() {
    if (!night || night.phase !== 'brew' || !cup) return;
    const g = night.guests[night.i], cu = night.cu;
    const rec = detect(cup), target = RECIPE[g.target];
    const ok = rec && rec.id === g.target;
    const { q, notes } = ok ? grade(cup, rec) : { q: 0, notes: [] };
    const tier = !ok ? 'wrong' : q >= 85 ? 'perfect' : q >= 65 ? 'great' : 'good';
    const pay = Math.round(drinkPrice(target.id) * (ok ? 0.6 + q / 100 : 0.4) * Stats.franchiseMult());
    S.coins += pay; night.earned += pay; night.served++;
    if (tier === 'perfect') night.perfects++;
    S.stats.drinks[target.id] = (S.stats.drinks[target.id] || 0) + (ok ? 1 : 0);
    Art.floatText(cu.x, cu.hy - cu.r * 2, '+' + pay, '#f2c46a', 22);
    if (ok && tier !== 'good') Art.floatText(cu.x, cu.hy - cu.r * 3.2, t(tier === 'perfect' ? 'perfect' : 'great'), tier === 'perfect' ? '#ffd76a' : '#9fd3ff', 18);
    Sound.play(ok ? 'ding' : 'wrong');
    if (ok) { cu.joyT = 1.5; cu.jumpT = 1; Art.burst(cu.x, cu.hy, 'heart', 3); } else cu.shakeT = 1;
    cup = null;
    const after = [pick(lines(REACT[tier]))];
    if (notes.length && tier !== 'perfect') after.push(`(${notes.slice(0, 2).join(' · ')})`);
    // постоянные: сердечки и, если дошли до порога, новый кусочек их истории
    if (g.reg && ok) {
      const st = regState(g.reg), before = st.hearts;
      st.hearts = Math.min(MAX_HEARTS, before + (tier === 'perfect' ? 2 : 1));
      st.visits++;
      STORY_HEARTS.forEach((h, idx) => { if (before < h && st.hearts >= h) { after.push(T(REGULAR[g.reg].story)[idx]); night.stories.push({ id: g.reg, idx }); } });
    } else if (g.reg) regState(g.reg).visits++;
    night.phase = 'react';
    persist();
    UI.updateBrewHud();
    talkQueue(after, () => maybeAsk(g));
  }

  // Иногда постоянный гость задаёт вопрос (те же, что в обычной смене) — ответ по душе даёт сердце
  function maybeAsk(g) {
    const pool = g.reg && ASK[g.reg];
    const done = g.reg ? regState(g.reg).asked || [] : [];
    const idx = pool ? pool.findIndex((_, k) => !done.includes(k)) : -1;
    if (idx < 0 || Math.random() > 0.6) { leave(); return; }
    const qd = pool[idx];
    say(L(qd.q), null);
    night.line.choice = true;
    night.line.onChoice = (i) => {
      const st = regState(g.reg);
      st.asked = [...(st.asked || []), idx];
      if (i === qd.good) { st.hearts = Math.min(MAX_HEARTS, st.hearts + 1); Art.burst(night.cu.x, night.cu.hy, 'heart', 3); Sound.play('story'); }
      persist();
      night.line = null;
      say(L(qd.r[i]), leave);
    };
    night.line.answers = qd.a.map(L);
  }

  function leave() {
    night.phase = 'leave';
    night.cu.state = 'leave';
    night.cu.tx = Art.W + 120;
    $('#qtalk').classList.add('hidden');
  }

  function finish() {
    const result = {
      day: S.day, earned: night.earned, target: Math.max(1, night.guests.length * 22), stars: night.perfects >= 3 ? 3 : night.served >= 4 ? 2 : 1,
      bonus: 0, record: false, served: night.served, maxCombo: night.perfects, missed: 0, stories: night.stories, events: [t('b_quietDone')], perfects: night.perfects,
    };
    S.stats.quiet = (S.stats.quiet || 0) + 1;
    night = null;
    $('#qtalk').classList.add('hidden');
    Progress.check();
    persist();
    UI.endBrew(result);
  }

  // ---------- кадр ----------
  function update(dt) {
    if (!night) return;
    night.t += dt;
    const cu = night.cu;
    if (cu) {
      const d = cu.tx - cu.x;
      cu.x += Math.sign(d) * Math.min(Math.abs(d), 260 * dt);
      cu.jumpT = Math.max(0, cu.jumpT - dt * 2); cu.shakeT = Math.max(0, cu.shakeT - dt * 2); cu.joyT = Math.max(0, cu.joyT - dt);
      if (night.phase === 'enter' && Math.abs(d) < 1) {
        cu.state = 'sit';
        night.phase = 'talk';
        talkQueue(night.queue, () => { night.phase = 'brew'; showOrder(); });
      }
      if (night.phase === 'leave' && cu.x >= Art.W + 100) { night.cu = null; nextGuest(); }
      if (night.phase !== 'leave' && night.phase !== 'enter') cu.tx = Art.W / 2;
    }
    // печать текущей реплики
    const ln = night.line;
    if (ln) {
      const before = Math.floor(ln.shown);
      ln.shown = Math.min(ln.text.length, ln.shown + dt * 40);
      const n = Math.floor(ln.shown), box = $('#qtalk');
      if (n !== before) { box.querySelector('.say').textContent = ln.text.slice(0, n); if (n % 3 === 0) Sound.play('blip'); }
      if (ln.shown >= ln.text.length && !box.querySelector('.caret, .choice')) {
        if (ln.choice) box.querySelector('.choices').innerHTML = ln.answers.map((a, i) => `<button class="choice" data-qchoice="${i}">${a}</button>`).join('');
        else box.querySelector('.say').insertAdjacentHTML('beforeend', '<span class="caret"></span>');
      }
    }
    tick(dt);
  }

  // ---------- оборудование ----------
  function tick(dt) {
    // чайник сам греется до заданной температуры
    kettle.heat += clamp(kettle.target - kettle.heat, -dt * 2, dt * 9);
    if (holding === 'grind') {
      const into = dest === 'pf' ? (pf = pf || { grams: 0, bean, grind, tamp: null }) : (v60 = v60 || { grams: 0, bean, grind });
      if (into === pf && pull) { /* нельзя молоть во время пролива */ } else {
        into.grams = Math.min(30, into.grams + dt * 4.2); into.grind = grind; into.bean = bean;
        if (into === pf) into.tamp = null;
        if (Math.random() < dt * 8) Sound.play('grind');
      }
    }
    if (pull) {
      pull.t += dt; pull.ml += pull.flow * dt;
      if (pull.t > 60) stopPull();
    }
    if (tamping) tamping.k = (tamping.k + dt * 1.4) % 2;
    if (holding === 'milk') pitcher.ml = Math.min(350, pitcher.ml + dt * 70), pitcher.heat = Math.min(pitcher.heat, 6);
    if (holding === 'steam' && pitcher.ml > 0) {
      pitcher.heat += dt * 7 * Math.sqrt(160 / Math.max(80, pitcher.ml));
      if (air) { pitcher.foam += dt * 0.16 * (1 - pitcher.foam); if (pitcher.heat > 40) pitcher.bubbles += dt * 0.5; }
      if (Math.random() < dt * 6) Sound.play('steam');
    }
    if (holding === 'pourMilk' && cup && pitcher.ml > 0) {
      const d = Math.min(pitcher.ml, dt * 50), m = cup.milk;
      const total = m.ml + d;
      m.heat = (m.heat * m.ml + pitcher.heat * d) / total;
      m.foam += d * pitcher.foam; m.ml = total; m.kind = milkKind;
      m.bubbles = Math.max(m.bubbles, pitcher.bubbles);
      pitcher.ml -= d;
      pourHold += dt;
      // латте-арт: долгий ровный пролив бархатного молока прямо в эспрессо
      if (!m.art && pourHold > 1.4 && cup.shots.length && pitcher.foam > 0.06 && pitcher.foam < 0.4 && pitcher.heat < 70 && pitcher.bubbles < 0.4) m.art = pourHold > 2.6 && pitcher.foam < 0.25 ? 'rosetta' : 'heart';
      if (pitcher.ml <= 0) Object.assign(pitcher, { ml: 0, foam: 0, bubbles: 0, heat: 5 });
    } else pourHold = holding === 'pourMilk' ? pourHold : 0;
    if (holding === 'water' && cup) {
      const d = dt * 45, w = cup.water;
      w.heat = (w.heat * w.ml + kettle.heat * d) / (w.ml + d); w.ml += d;
    }
    if (holding === 'pourover' && v60 && v60.grams > 0) {
      kettle.v60ml += dt * 40;
      v60.heatSum = (v60.heatSum || 0) + kettle.heat * dt; v60.pourT = (v60.pourT || 0) + dt;
    }
    renderBench();
  }

  function startPull() {
    if (!pf || pf.grams < 4 || pull) return;
    const flow = 0.42 * pf.grind * Math.pow(18 / Math.max(6, pf.grams), 0.6) * (pf.tamp == null ? 1.5 : 1);
    pull = { t: 0, ml: 0, flow };
    Sound.play('grind');
  }
  function stopPull() {
    if (!pull) return;
    const s = { t: pull.t, ml: pull.ml, grams: pf.grams, grind: pf.grind, tamp: pf.tamp, bean: pf.bean };
    Object.assign(s, shotScore(s));
    lastShot = s;
    if (cup) cup.shots.push(s);
    pull = null; pf = null;
    Sound.play('brewDone');
  }
  function brewV60() {
    if (!v60 || !cup || kettle.v60ml < 40) return;
    const ml = kettle.v60ml, heat = (v60.heatSum || 0) / Math.max(0.1, v60.pourT || 1);
    let q = 100;
    if (v60.grind < 6) q -= (6 - v60.grind) * 9; if (v60.grind > 9) q -= (v60.grind - 9) * 9;
    if (v60.grams < 14) q -= (14 - v60.grams) * 5; if (v60.grams > 21) q -= (v60.grams - 21) * 5;
    if (heat < 90) q -= (90 - heat) * 3; if (heat > 97) q -= (heat - 97) * 3;
    if (ml < 180) q -= (180 - ml) * 0.4; if (ml > 280) q -= (ml - 280) * 0.4;
    cup.filter = { ml, q: clamp(Math.round(q), 0, 100) };
    v60 = null; kettle.v60ml = 0;
    Sound.play('pour');
  }

  // ---------- верстак ----------
  const IMG = (n, cls = '') => `<img class="inv-img ${cls}" src="img/${n}.png" alt="">`;
  function buildBench() {
    const shelf = [
      ...BEANS.map((b) => `<button class="inv" data-b="bean" data-id="${b.id}">${IMG('inv-' + b.id)}<span>${T(b.name)}</span></button>`),
      ...Object.keys(MILKS).map((k) => `<button class="inv" data-b="milkKind" data-id="${k}">${IMG('inv-' + k)}<span>${T(MILKS[k].name)}</span></button>`),
      ...Object.keys(CUPS).map((k) => `<button class="inv" data-b="cup" data-id="${k}">${IMG('inv-' + k)}<span>${T(CUPS[k].name)}</span></button>`),
      ...EXTRA_IDS.map((e) => `<button class="inv" data-b="extra" data-id="${e}">${IMG('inv-' + e)}<span>${T(INGREDIENTS[e].name)}</span></button>`),
    ].join('');
    $('#brew').innerHTML = `
      <div class="b-order hidden"><span class="b-order-who"></span><span class="b-order-text"></span></div>
      <div class="shelf">${shelf}</div>
      <div class="bench">
        <div class="tcard"><div class="thead">${IMG('inv-grinder', 'tiny')}<b>${t('b_grinder')}</b></div>
          <div class="trow"><span class="lbl">${t('b_grind')}</span><button class="bbtn sm" data-b="grind-">−</button><b class="val" id="b-grindv"></b><button class="bbtn sm" data-b="grind+">+</button></div>
          <small class="hint" id="b-grindh"></small>
          <div class="trow seg"><button class="bbtn sm" data-b="dest" data-id="pf">${t('b_toPf')}</button><button class="bbtn sm" data-b="dest" data-id="v60">V60</button></div>
          <div class="lcd" id="b-scale">0.0 g</div>
          <div class="trow"><button class="bbtn hold" data-hold="grind">${t('b_holdGrind')}</button><button class="bbtn sm ghost" data-b="dump">${t('b_dump')}</button></div>
        </div>
        <div class="tcard"><div class="thead">${IMG('machine', 'tiny')}<b>${t('b_machine')}</b></div>
          <small class="hint" id="b-pf"></small>
          <div class="meter" id="b-tampm"><i class="zone" style="left:45%;width:20%"></i><i class="needle"></i></div>
          <div class="trow"><button class="bbtn" data-b="tamp">${t('b_tamp')}</button><button class="bbtn" data-b="pull" id="b-pullbtn">${t('b_pull')}</button></div>
          <div class="lcd" id="b-shot">— s · — ml</div>
          <div class="meter" id="b-shotm"><i class="zone r"></i><i class="zone e"></i><i class="zone l"></i><i class="needle"></i></div>
          <small class="hint" id="b-shotres"></small>
        </div>
        <div class="tcard"><div class="thead">${IMG('inv-pitcher', 'tiny')}<b>${t('b_milk')}</b></div>
          <small class="hint" id="b-milkk"></small>
          <div class="trow"><button class="bbtn hold sm" data-hold="milk">${t('b_pourIn')}</button><button class="bbtn sm" data-b="air" id="b-air"></button></div>
          <div class="lcd" id="b-temp">5 °C · 0 ml</div>
          <div class="meter" id="b-tempm"><i class="zone"></i><i class="needle"></i></div>
          <div class="meter foam" id="b-foamm"><i class="needle"></i></div>
          <small class="hint">${t('b_foamScale')}</small>
          <div class="trow"><button class="bbtn hold" data-hold="steam">${t('b_steam')}</button><button class="bbtn hold" data-hold="pourMilk">${t('b_pourCup')}</button></div>
          <button class="bbtn sm ghost" data-b="emptyPitcher">${t('b_empty')}</button>
        </div>
        <div class="tcard"><div class="thead">${IMG('inv-kettle', 'tiny')}<b>${t('b_kettle')}</b></div>
          <div class="trow"><button class="bbtn sm" data-b="kt-">−</button><b class="val" id="b-kt"></b><button class="bbtn sm" data-b="kt+">+</button></div>
          <div class="lcd" id="b-kheat"></div>
          <button class="bbtn hold" data-hold="water">${t('b_water')}</button>
          <div class="thead sub">${IMG('inv-v60', 'tiny')}<b>V60</b></div>
          <small class="hint" id="b-v60"></small>
          <div class="trow"><button class="bbtn hold sm" data-hold="pourover">${t('b_pourover')}</button><button class="bbtn sm" data-b="v60cup">${t('b_v60cup')}</button></div>
        </div>
        <div class="tcard cupcard"><div class="thead"><b>${t('b_cup')}</b></div>
          <canvas id="b-cupcv" width="96" height="80"></canvas>
          <small class="hint" id="b-contents"></small>
          <b class="b-detect" id="b-detect"></b>
          <div class="trow"><button class="bbtn primary" data-b="serve">${t('b_serve')}</button><button class="bbtn sm ghost" data-b="trash">${t('b_trash')}</button></div>
        </div>
      </div>`;
  }

  function showOrder() {
    const g = night.guests[night.i];
    $('#brew .b-order-who').textContent = nameOf(g) + ':';
    $('#brew .b-order-text').textContent = '«' + night.ask + '»';
    $('#brew .b-order').classList.remove('hidden');
    $('#qtalk').classList.add('hidden');
  }

  const setText = (id, v) => { const e = document.getElementById(id); if (e && e.textContent !== v) e.textContent = v; };
  const needle = (id, k) => { const e = document.querySelector(`#${id} .needle`); if (e) e.style.left = clamp(k, 0, 1) * 100 + '%'; };
  function renderBench() {
    if (!$('#b-scale')) return;
    document.querySelectorAll('#brew [data-b="bean"]').forEach((b) => b.classList.toggle('on', b.dataset.id === bean));
    document.querySelectorAll('#brew [data-b="milkKind"]').forEach((b) => b.classList.toggle('on', b.dataset.id === milkKind));
    document.querySelectorAll('#brew [data-b="cup"]').forEach((b) => b.classList.toggle('on', !!cup && b.dataset.id === cup.type));
    document.querySelectorAll('#brew [data-b="dest"]').forEach((b) => b.classList.toggle('on', b.dataset.id === dest));
    document.querySelectorAll('#brew [data-hold]').forEach((b) => b.classList.toggle('down', b.dataset.hold === holding));
    setText('b-grindv', String(grind));
    setText('b-grindh', (grind <= 2 ? t('b_fine') : grind <= 5 ? t('b_medium') : t('b_coarse')) + ' · ' + t('b_grindHint') + ' · ' + T(BEANS.find((b) => b.id === bean).note));
    const into = dest === 'pf' ? pf : v60;
    setText('b-scale', `${(into ? into.grams : 0).toFixed(1)} g`);
    setText('b-pf', pf ? `${t('b_pfState', pf.grams.toFixed(1), pf.grind)} · ${pf.tamp == null ? t('b_notTamped') : t('b_tamped', Math.round(pf.tamp * 100))}` : t('b_pfEmpty'));
    const tm = document.getElementById('b-tampm'); tm.classList.toggle('live', !!tamping);
    needle('b-tampm', tamping ? (tamping.k > 1 ? 2 - tamping.k : tamping.k) : 0);
    setText('b-pullbtn', pull ? t('b_stop') : t('b_pull'));
    document.getElementById('b-pullbtn').classList.toggle('primary', !!pull);
    if (pull) { setText('b-shot', `${pull.t.toFixed(1)} s · ${pull.ml.toFixed(0)} ml`); needle('b-shotm', pull.t / 40); }
    else if (lastShot) { setText('b-shot', `${lastShot.t.toFixed(1)} s · ${lastShot.ml.toFixed(0)} ml`); needle('b-shotm', lastShot.t / 40); }
    setText('b-shotres', lastShot && !pull ? `${T(INGREDIENTS[lastShot.kind].name)} · ${t('b_' + lastShot.taste)} · ${lastShot.q}` : t('b_shotHint'));
    setText('b-milkk', T(MILKS[milkKind].name) + ' · ' + t('b_idealT', ...MILKS[milkKind].ideal));
    setText('b-air', air ? t('b_airOn') : t('b_airOff'));
    document.getElementById('b-air').classList.toggle('on', air);
    setText('b-temp', `${Math.round(pitcher.heat)} °C · ${Math.round(pitcher.ml)} ml`);
    const z = document.querySelector('#b-tempm .zone'), [lo, hi] = MILKS[milkKind].ideal;
    z.style.left = (lo / 90) * 100 + '%'; z.style.width = ((hi - lo) / 90) * 100 + '%';
    needle('b-tempm', pitcher.heat / 90);
    needle('b-foamm', pitcher.foam / 0.8);
    setText('b-kt', `${kettle.target} °C`);
    setText('b-kheat', `${t('b_now')} ${Math.round(kettle.heat)} °C`);
    setText('b-v60', v60 ? t('b_v60State', v60.grams.toFixed(1), v60.grind, Math.round(kettle.v60ml)) : t('b_v60Empty'));
    // чашка
    const rec = cup && detect(cup);
    setText('b-contents', cup ? describe(cup) : t('b_noCup'));
    setText('b-detect', cup ? (rec ? t('b_looksLike', T(rec.name)) : t('custom')) : '');
    drawCup();
  }

  function describe(c) {
    const parts = [T(CUPS[c.type].name)];
    for (const s of c.shots) parts.push(`${T(INGREDIENTS[shotKind(s.ml)].name)} ${Math.round(s.ml)} ml`);
    if (c.filter) parts.push(`${t('b_filter')} ${Math.round(c.filter.ml)} ml`);
    if (c.water.ml) parts.push(`${t('b_waterShort')} ${Math.round(c.water.ml)} ml`);
    if (c.milk.ml) parts.push(`${T(MILKS[c.milk.kind || 'whole'].name)} ${Math.round(c.milk.ml)} ml · ${Math.round(c.milk.heat)}°C · ${t('b_foamPct', Math.round((c.milk.foam / c.milk.ml) * 100))}${c.milk.art ? ' · ♥' : ''}`);
    for (const e of EXTRA_IDS) if (c.extras[e]) parts.push(T(INGREDIENTS[e].name) + (c.extras[e] > 1 ? ` ×${c.extras[e]}` : ''));
    return parts.join(' · ');
  }

  // Чашка в разрезе, крупными пикселями: слои эспрессо, воды, молока и пены, латте-арт
  function drawCup() {
    const cv = document.getElementById('b-cupcv');
    if (!cv) return;
    const g = cv.getContext('2d'); g.clearRect(0, 0, 96, 80);
    if (!cup) { g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(30, 30, 36, 30); return; }
    const shape = { demi: [34, 44, 28, 22], cup: [24, 34, 48, 32], glass: [32, 10, 32, 60], mug: [26, 22, 44, 48] }[cup.type];
    const [x, y, w, h] = shape, cap = { demi: 80, cup: 220, glass: 320, mug: 350 }[cup.type];
    g.fillStyle = cup.type === 'glass' ? 'rgba(220,235,245,.25)' : '#f4ece0'; g.fillRect(x - 2, y, w + 4, h + 2);
    const inner = (ml) => (Math.min(ml, cap) / cap) * (h - 2);
    let level = 0;
    const layer = (ml, col) => { const hh = inner(ml); if (hh <= 0) return; g.fillStyle = col; g.fillRect(x, y + h - level - hh, w, hh); level += hh; };
    if (cup.extras.gelato) layer(40, '#fff3d6');
    if (cup.extras.ice) layer(30, '#dff4fc');
    for (const e of ['chocolate', 'caramel', 'vanilla']) if (cup.extras[e]) layer(10 * cup.extras[e], INGREDIENTS[e].color);
    for (const s of cup.shots) layer(s.ml, s.taste === 'sour' ? '#8a5a2a' : s.taste === 'bitter' ? '#2a160c' : '#4a2a16');
    if (cup.filter) layer(cup.filter.ml, '#6a3e22');
    if (cup.water.ml) layer(cup.water.ml, cup.shots.length ? '#7a4a2a' : '#cbe7f4');
    if (cup.milk.ml) { layer(cup.milk.ml - cup.milk.foam, cup.shots.length ? '#d8b48a' : '#f7efe1'); layer(cup.milk.foam, '#fffdf8'); }
    if (cup.extras.cream) layer(25, '#fff6e6');
    if (cup.extras.cinnamon) { g.fillStyle = '#9b5a2e'; for (let i = 0; i < 6; i++) g.fillRect(x + 3 + i * (w / 6), y + h - level - 1, 2, 1); }
    if (cup.milk.art) {
      g.fillStyle = '#8a5a3a'; const cx = x + w / 2, cy = y + h - level + 3;
      for (const [dx, dy] of [[-3, 0], [-2, 0], [2, 0], [3, 0], [-3, 1], [-2, 1], [-1, 1], [1, 1], [2, 1], [3, 1], [-2, 2], [-1, 2], [0, 2], [1, 2], [2, 2], [-1, 3], [0, 3], [1, 3], [0, 4]]) g.fillRect(cx + dx, cy + dy, 1, 1);
    }
    g.fillStyle = '#2a1a24'; g.fillRect(x - 2, y + h + 2, w + 4, 2);
    if (cup.type !== 'glass') { g.fillStyle = '#f4ece0'; g.fillRect(x + w + 2, y + 4, 4, 3); g.fillRect(x + w + 5, y + 4, 2, h * 0.5); g.fillRect(x + w + 2, y + 4 + h * 0.5, 5, 3); }
    if (cup.type === 'demi' || cup.type === 'cup') { g.fillStyle = '#e9dccb'; g.fillRect(x - 8, y + h + 4, w + 16, 3); }
  }

  // ---------- ввод ----------
  function onDown(e) {
    const qc = e.target.closest('[data-qchoice]');
    if (qc && night && night.line && night.line.onChoice) { e.stopPropagation(); night.line.onChoice(+qc.dataset.qchoice); return; }
    const hb = e.target.closest('[data-hold]');
    if (hb) { e.preventDefault(); holding = hb.dataset.hold; pourHold = 0; if (hb.setPointerCapture) hb.setPointerCapture(e.pointerId); return; }
    const b = e.target.closest('[data-b]');
    if (!b) return;
    const id = b.dataset.id;
    Sound.play('tap');
    switch (b.dataset.b) {
      case 'bean': bean = id; break;
      case 'milkKind': milkKind = id; break;
      case 'cup': if (!cup || (!cup.shots.length && !cup.milk.ml && !cup.water.ml && !cup.filter && !Object.keys(cup.extras).length)) cup = newCup(id); else UI.toast(t('b_cupBusy')); break;
      case 'extra':
        if (!cup) { UI.toast(t('b_needCup')); break; }
        cup.extras[id] = (cup.extras[id] || 0) + 1; Sound.play(INGREDIENTS[id].sfx || 'plop'); break;
      case 'grind-': grind = Math.max(1, grind - 1); break;
      case 'grind+': grind = Math.min(10, grind + 1); break;
      case 'dest': dest = id; break;
      case 'dump': if (dest === 'pf') pf = null; else v60 = null; break;
      case 'tamp':
        if (!pf) break;
        if (!tamping) tamping = { k: 0 };
        else { const k = tamping.k > 1 ? 2 - tamping.k : tamping.k; pf.tamp = clamp(1 - Math.abs(k - 0.55) / 0.45, 0, 1); tamping = null; Sound.play('plop'); }
        break;
      case 'pull': if (pull) stopPull(); else startPull(); break;
      case 'air': air = !air; break;
      case 'emptyPitcher': Object.assign(pitcher, { ml: 0, foam: 0, bubbles: 0, heat: 5 }); break;
      case 'kt-': kettle.target = Math.max(80, kettle.target - 1); break;
      case 'kt+': kettle.target = Math.min(100, kettle.target + 1); break;
      case 'v60cup': if (!cup) UI.toast(t('b_needCup')); else brewV60(); break;
      case 'serve':
        if (!cup) { UI.toast(t('b_needCup')); break; }
        if (!night || night.phase !== 'brew') { UI.toast(t('b_waitGuest')); break; }
        serve(); break;
      case 'trash': cup = null; Sound.play('trash'); break;
    }
  }
  function onUp() { if (holding === 'pourover' && v60) Sound.play('pour'); holding = null; }

  function init() {
    const bench = document.getElementById('brew');
    bench.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    const box = document.getElementById('qtalk');
    box.addEventListener('pointerdown', (e) => { if (e.target.closest('[data-qchoice]')) { onDown(e); return; } advance(); });
  }

  return {
    init, start, update,
    get active() { return !!night; },
    get customers() { return night && night.cu ? [night.cu] : []; },
    sky: () => (night ? clamp((night.i + (night.phase === 'leave' ? 1 : 0.5)) / night.guests.length, 0, 1) : 0),
    progress: () => (night ? { i: night.i + 1, n: night.guests.length, earned: night.earned } : null),
    quit() { if (night) finish(); },
  };
})();
