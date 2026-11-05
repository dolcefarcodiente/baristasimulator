// Логика смены: гости, заказы, оборудование, чашки, оплата и комбо.

// «Золотое окно» в конце работы машины: тапни чашку в этот момент — слой выйдет идеальным
const perfectWindow = (j) => Math.max(0.5, j.dur * 0.22);
const inPerfectWindow = (j) => j.t >= j.dur - perfectWindow(j);

const NICO_CD = 18;

const Shift = {
  active: false,
  paused: false,
  t: 0, len: SHIFT_BASE,
  closing: false, endT: 0,
  customers: [],
  cups: [],
  sel: 0,
  jobs: { espresso: [], frother: [], filter: [] },
  combo: 0, maxCombo: 0,
  earned: 0, served: 0, missed: 0, wrongs: 0,
  stories: [],
  regPlan: [],
  nextSpawn: 0,
  cat: null, catTime: Infinity,
  tutorial: false, pointer: null,
  uid: 0,
  solo: null, beat: null, cap: 1,

  // opts.solo — один сюжетный гость без таймера (обучение в прологе);
  // opts.beat — сюжетный гость посреди обычной смены: { by, want, at }
  start(opts = {}) {
    Object.assign(this, {
      active: true, paused: false, t: 0, len: Stats.shiftLen(), closing: false, endT: 0,
      customers: [], sel: 0, jobs: { espresso: [], frother: [], filter: [] },
      combo: 0, maxCombo: 0, earned: 0, served: 0, missed: 0, wrongs: 0, stories: [], perfects: 0,
      nextSpawn: 1.2, cat: null, pointer: null,
      solo: opts.solo || null, beat: opts.beat ? { at: 0.35, ...opts.beat, spawned: false } : null,
    });
    this.cap = this.solo ? 1 : Stats.capacity();
    this.cups = Array.from({ length: Stats.cups() }, () => ({ layers: [] }));
    Talk.clear();
    if (this.solo) {
      this.tutorial = false; this.nico = null; this.regPlan = []; this.catTime = Infinity;
      this.customers = [this.storyGuest(this.solo.cu, this.solo.want, 0)];
      return;
    }
    // в истории никаких случайных событий и постоянных гостей — только сюжетный гость
    this.story = !!opts.story;
    if (!this.tutorial && !this.story) Events.roll(this.len);
    this.rating0 = Rating.value();
    // нанятый бариста Нико сам варит простые напитки (до двух ингредиентов), раз в NICO_CD секунд
    this.nico = S.biz >= 1 && !this.tutorial ? { t: 12, cd: NICO_CD } : null;
    Art.invalidate(); // доска с меню: сезонный напиток
    this.tutorial = !S.tips.basics;
    // Постоянные гости на эту смену: новые приходят обязательно, знакомые — с шансом.
    this.regPlan = REGULARS.filter((r) => atHome() && regularEligible(r) && !this.story)
      .filter((r) => regState(r.id).visits === 0 || Math.random() < 0.55)
      .map((r) => ({ id: r.id, time: rand(0.08, 0.8) * this.len, done: false }));
    this.catTime = !atHome() ? Infinity : hasDecor('catbed') ? rand(10, this.len * 0.5) : S.day >= 2 && Math.random() < 0.6 ? rand(25, this.len - 30) : Infinity;
    if (this.tutorial) this.spawn(null, 'latte');
    if (this.cups.length > 1 && !S.tips.cups) {
      S.tips.cups = true;
      setTimeout(() => UI.toast(t('cupsTip'), 'long'), 1500);
    }
  },

  // ---------- гости ----------
  freeSlot() {
    const cap = this.cap;
    const used = new Set(this.customers.filter((c) => c.state !== 'leave').map((c) => c.slot));
    const free = [];
    for (let i = 0; i < cap; i++) if (!used.has(i)) free.push(i);
    return free.length ? pick(free) : -1;
  },

  pickRecipe() {
    const season = Events.drinkId();
    if (season && Math.random() < 0.3) return season;
    const pool = S.recipes;
    const w = pool.map((id) => 1 + RECIPE[id].index * 0.25);
    let x = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < pool.length; i++) { x -= w[i]; if (x <= 0) return pool[i]; }
    return pool[pool.length - 1];
  },

  spawn(regId, forced, kind) {
    if (regId && this.customers.some((c) => c.reg === regId)) return true;
    const slot = this.freeSlot();
    if (slot < 0) return false;
    let orders, look, hidden = false;
    if (regId) {
      const reg = REGULAR[regId];
      orders = [reg.fav];
      look = reg.look;
      hidden = regState(regId).visits > 0;
      if (hidden && !S.tips.regular) {
        S.tips.regular = true;
        UI.toast(t('regularTip'), 'long');
      }
    } else if (kind) {
      // особые гости: критик просит самое сложное, туристы — три напитка, полуночник — два
      if (kind === 'critic') {
        const pool = [...S.recipes, Events.drinkId()].filter(Boolean).sort((a, b) => RECIPE[b].ings.length - RECIPE[a].ings.length);
        orders = [pick(pool.slice(0, 3))];
      } else orders = Array.from({ length: kind === 'tourists' ? 3 : 2 }, () => this.pickRecipe());
      look = SPECIAL[kind].sprite ? { sprite: SPECIAL[kind].sprite } : randomLook();
    } else {
      orders = [forced || this.pickRecipe()];
      if (!forced && Math.random() < multiDrinkChance(S.day)) orders.push(this.pickRecipe());
      look = randomLook();
    }
    const complexity = orders.reduce((a, id) => a + RECIPE[id].ings.length, 0);
    const patMax = (basePatience(S.day) + complexity * 2.5) * Stats.patienceMult() * (orders.length > 1 ? 1.35 : 1)
      * Events.patienceMult() * (kind ? SPECIAL[kind].patience : 1);
    this.customers.push({
      id: ++this.uid, slot, x: -60, tx: 0, state: 'enter', look, orders, reg: regId || null, hidden, revealed: false,
      firstOrder: orders[0], kind: kind || null, payMult: kind ? SPECIAL[kind].pay : 1,
      pat: patMax, patMax, phase: rand(0, 6), bubbleT: 0, jumpT: 0, shakeT: 0, wiggleT: 0, joyT: 0, happy: false,
      frozen: this.tutorial,
    });
    Sound.play('door');
    return true;
  },

  // Сюжетный гость ждёт сколько угодно и принимает любой напиток — дальше решает сцена
  storyGuest(cu, want, slot) {
    return Object.assign(cu, {
      id: ++this.uid, slot, orders: [want], firstOrder: want, kind: null, payMult: 1, hidden: false, revealed: false,
      pat: 1, patMax: 1, frozen: true, story: true, bubbleT: 0, jumpT: 0, shakeT: 0, wiggleT: 0, joyT: 0, happy: false, q: null,
      state: cu.state === 'sit' ? 'wait' : 'enter',
    });
  },
  spawnStory(regId, want) {
    const slot = this.freeSlot();
    if (slot < 0) return false;
    this.customers.push(this.storyGuest({ x: -60, tx: 0, look: REGULAR[regId].look, reg: regId, phase: rand(0, 6) }, want, slot));
    Sound.play('door');
    return true;
  },
  // Подали сюжетному гостю: смена замирает, дальше — сцена
  serveStory(cu) {
    const ready = (i) => this.cupReady(this.cups[i]);
    const ci = ready(this.sel) ? this.sel : this.cups.findIndex((_, i) => ready(i));
    if (ci < 0) {
      cu.wiggleT = 1; Sound.play('busy');
      UI.toast(t(this.cups[this.sel].layers.length ? 'stillBrewing' : 'makeFirst'));
      return;
    }
    const items = this.cupItems(this.cups[ci]);
    const rid = Object.keys(RECIPE).find((id) => sameSet(RECIPE[id].ings, items)) || null;
    const ok = rid === cu.orders[0];
    if (ok) this.success(cu, ci, 0);
    else { this.cups[ci].layers = []; UI.renderCup(ci); cu.shakeT = 1; Sound.play('wrong'); }
    this.paused = true;
    this.pointer = null;
    UI.hint(null);
    Story.served(cu, rid, ok);
  },
  beatDone(cu) {
    if (cu && cu.state !== 'leave') this.leave(cu, true);
    this.paused = false;
  },
  endSolo() {
    this.active = false; this.paused = false; this.solo = null; this.pointer = null;
    this.customers = []; this.jobs = { espresso: [], frother: [], filter: [] };
    UI.hint(null);
  },

  leave(cu, happy) {
    cu.state = 'leave';
    cu.happy = happy;
  },

  // ---------- чашки и ингредиенты ----------
  cupItems(cup) { return cup.layers.map((l) => l.ing); },
  cupReady(cup) { return cup.layers.length > 0 && cup.layers.every((l) => !l.job); },

  addIngredient(id) {
    if (!this.active || this.paused) return;
    const cup = this.cups[this.sel];
    const ing = INGREDIENTS[id];
    if (cup.layers.length >= CUP_CAPACITY) {
      UI.shakeIng(id); Sound.play('busy');
      UI.toast(t('cupFull'));
      return;
    }
    if (ing.machine) {
      const jobs = this.jobs[ing.machine];
      if (jobs.length >= Stats.slots(ing.machine)) { UI.shakeIng(id); Sound.play('busy'); return; }
      const job = { ing: id, cup: this.sel, t: 0, dur: Stats.duration(id) };
      jobs.push(job);
      cup.layers.push({ ing: id, job });
      Sound.play({ espresso: 'grind', frother: 'steam', filter: 'drip' }[ing.machine]);
    } else {
      cup.layers.push({ ing: id, job: null });
      Sound.play(ing.sfx || 'plop');
    }
    UI.pressIng(id);
    UI.renderCup(this.sel);
    vibrate(8);
  },

  selectCup(i) {
    if (!this.active || i < 0 || i >= this.cups.length) return;
    // попал в золотое окно — шот/молоко/фильтр получаются идеальными
    const hits = this.cups[i].layers.filter((l) => l.job && !l.perfect && inPerfectWindow(l.job));
    if (hits.length && !this.paused) {
      hits.forEach((l) => { l.perfect = true; });
      Bar.perfect(i);
      Sound.play('perfect');
      vibrate(12);
    }
    this.sel = i;
    Sound.play('tap');
    UI.renderCups();
  },

  trash() {
    if (!this.active || this.paused) return;
    const cup = this.cups[this.sel];
    if (!cup.layers.length) return;
    for (const l of cup.layers) {
      if (!l.job) continue;
      for (const k of Object.keys(this.jobs)) {
        const i = this.jobs[k].indexOf(l.job);
        if (i >= 0) this.jobs[k].splice(i, 1);
      }
    }
    cup.layers = [];
    Sound.play('trash');
    UI.renderCup(this.sel);
  },

  // ---------- касания сцены ----------
  tap(x, y) {
    if (!this.active || this.paused) return;
    const inR = (r) => r && x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;
    const catHit = this.cat && this.cat.state !== 'out' && inR(this.cat.hit);
    // кот на стойке — впереди гостей; кот в корзинке на подоконнике — позади, гости важнее
    const catBehind = hasDecor('catbed');
    if (catHit && !catBehind) { this.petCat(); return; }
    const waiting = this.customers.filter((c) => c.state === 'wait');
    for (const cu of waiting) {
      if (inR(cu.bub)) {
        if (cu.hidden && !cu.revealed && !this.cupReady(this.cups[this.sel])) { this.reveal(cu); return; }
        this.serveTo(cu); return;
      }
    }
    for (const cu of waiting) if (inR(cu.hit)) { this.serveTo(cu); return; }
    if (catHit) this.petCat();
  },

  serveSlot(slot) {
    const cu = this.customers.find((c) => c.state === 'wait' && c.slot === slot);
    if (cu) this.serveTo(cu);
  },

  reveal(cu) {
    cu.revealed = true;
    cu.bubbleT = 0.001;
    Sound.play('ui');
  },

  serveTo(cu) {
    if (cu.story) { this.serveStory(cu); return; }
    const match = (cup) => cu.orders.findIndex((rid) => sameSet(RECIPE[rid].ings, this.cupItems(cup)));
    const sel = this.cups[this.sel];
    let ci = -1, oi = -1;
    if (this.cupReady(sel) && (oi = match(sel)) >= 0) ci = this.sel;
    else {
      for (let i = 0; i < this.cups.length; i++) {
        if (!this.cupReady(this.cups[i])) continue;
        const m = match(this.cups[i]);
        if (m >= 0) { ci = i; oi = m; break; }
      }
    }
    if (ci < 0) {
      if (!sel.layers.length) {
        if (cu.hidden && !cu.revealed) { this.reveal(cu); return; }
        cu.wiggleT = 1; Sound.play('busy');
        UI.toast(t('makeFirst'));
        return;
      }
      if (!this.cupReady(sel)) { cu.wiggleT = 1; Sound.play('busy'); UI.toast(t('stillBrewing')); return; }
      this.wrongServe(cu, this.sel);
      return;
    }
    this.success(cu, ci, oi);
  },

  // Нико подаёт гостю, который ждёт дольше всех, простой напиток из его заказа (не критику — тот ждёт хозяина)
  nicoServe() {
    const cands = this.customers
      .filter((c) => c.state === 'wait' && c.kind !== 'critic' && !(c.hidden && !c.revealed))
      .map((c) => ({ c, oi: c.orders.findIndex((id) => RECIPE[id].ings.length <= 2) }))
      .filter((x) => x.oi >= 0)
      .sort((a, b) => a.c.pat / a.c.patMax - b.c.pat / b.c.patMax);
    if (!cands.length) return false;
    const { c, oi } = cands[0];
    Talk.nico(T(RECIPE[c.orders[oi]].name));
    this.success(c, -1, oi, true);
    return true;
  },

  success(cu, ci, oi, byNico) {
    const rid = cu.orders[oi];
    const rec = RECIPE[rid];
    cu.orders.splice(oi, 1);
    // качество: сколько слоёв из-под машин вышли идеальными
    const mach = ci >= 0 ? this.cups[ci].layers.filter((l) => INGREDIENTS[l.ing].machine) : [];
    const perf = mach.filter((l) => l.perfect).length;
    const q = mach.length && perf === mach.length ? 'perfect' : perf > 0 ? 'great' : 'good';
    if (!cu.q || q === 'good' || (q === 'great' && cu.q === 'perfect')) cu.q = q; // худшее из заказа
    if (ci >= 0) { this.cups[ci].layers = []; UI.renderCup(ci); }
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    S.stats.bestCombo = Math.max(S.stats.bestCombo, this.combo);
    const memory = cu.hidden && !cu.revealed;
    const price = drinkPrice(rid);
    const mBefore = masteryOf(rid);
    const f = clamp(cu.pat / cu.patMax, 0, 1);
    const tip = price * (0.15 + 0.45 * f) * Stats.tipMult() * ({ perfect: 1.6, great: 1.25, good: 1 }[q]);
    const cm = comboMult(this.combo);
    const pay = Math.round((price + tip * cm * (memory ? 2 : 1)) * cu.payMult * Stats.franchiseMult());
    this.earned += pay;
    S.coins += pay;
    S.stats.drinks[rid] = (S.stats.drinks[rid] || 0) + 1;
    if (masteryOf(rid) > mBefore) setTimeout(() => { UI.toast(t('masteryUp', T(rec.name), starsText(masteryOf(rid))), 'gold'); Sound.play('story'); }, 600);
    if (q === 'perfect') { this.perfects++; S.stats.perfect = (S.stats.perfect || 0) + 1; }

    const x = cu.dx, y = cu.hy;
    Art.floatText(x, y - cu.r * 2.2, '+' + pay, '#f2c46a', 22);
    if (memory) Art.floatText(x, y - cu.r * 3.4, t('remembered'), '#e07a5f', 15);
    else if (f > 0.75) Art.floatText(x, y - cu.r * 3.4, t('speedy'), '#7fc28a', 14);
    if (byNico) Art.floatText(x, y - cu.r * 4.5, t('nicoTag'), '#9fd3ff', 15);
    if (q !== 'good') Art.floatText(x, y - cu.r * 4.5, t(q), q === 'perfect' ? '#ffd76a' : '#9fd3ff', q === 'perfect' ? 20 : 16);
    const tgt = UI.coinTarget();
    const n = Math.min(6, 1 + Math.floor(pay / 8));
    for (let i = 0; i < n; i++) {
      Art.flyCoin(x, y, tgt.x, tgt.y, () => { UI.bumpCoins(); if (i === 0) Sound.play('coin'); }, i * 0.06);
    }
    Art.burst(x, y, 'spark', 8);
    Sound.play('ding');
    vibrate(15);

    if (COMBO_STEPS.includes(this.combo)) {
      UI.banner(t('combo', comboMult(this.combo)), 'combo');
      Sound.play('combo', COMBO_STEPS.indexOf(this.combo));
      Art.burst(Art.W / 2, Art.H * 0.35, 'confetti', 30);
      Art.addShake(0.5);
    }

    const done = cu.orders.length === 0;
    if (done) {
      if (!cu.story) {
        this.leave(cu, true);
        Rating.add(cu, true);
        Talk.thanks(cu);
        this.specialDone(cu, true);
      }
      cu.jumpT = 1;
      for (let i = 0; i < 4; i++) Art.burst(x, y - cu.r, 'heart', 1);
      this.served++;
      S.stats.served++;
      if (cu.reg && !cu.story) this.regularServed(cu, memory);
    } else {
      cu.joyT = 0.8;
      cu.pat = Math.min(cu.patMax, cu.pat + cu.patMax * 0.2);
    }
    Progress.onServe({ recipe: rid, guestDone: done, regular: done && !!cu.reg, memory, earned: this.earned, combo: this.combo });

    if (this.tutorial) {
      this.tutorial = false;
      S.tips.basics = true;
      this.pointer = null;
      this.nextSpawn = 2;
      UI.hint(t('tutDone'), null, 4500);
      persist();
    }
    UI.updateHUD();
  },

  // Итог особого гостя: строчка в итогах смены, у критика — ещё и рецензия
  specialDone(cu, ok) {
    if (!cu.kind) return;
    if (cu.kind === 'critic') {
      // критику мало просто кофе: нужен хотя бы один идеальный слой
      const verdict = !ok ? 'Bad' : cu.q === 'good' ? 'Meh' : 'Good';
      if (verdict === 'Good') S.buzz = 1;
      setTimeout(() => UI.toast(t('critic' + verdict), verdict === 'Good' ? 'gold' : ''), 900);
      Events.log(t(verdict === 'Meh' ? 'ev_critic_meh' : `ev_critic_${ok ? 'ok' : 'fail'}`));
      return;
    }
    Events.log(t(`ev_${cu.kind}_${ok ? 'ok' : 'fail'}`));
  },

  regularServed(cu, memory) {
    const reg = REGULAR[cu.reg];
    const st = regState(cu.reg);
    const before = st.hearts;
    st.hearts = Math.min(MAX_HEARTS, before + (memory ? 2 : 1) + (cu.bonusHeart || 0));
    st.visits++;
    S.stats.regularServes++;
    if (memory) S.stats.memory++;
    STORY_HEARTS.forEach((h, i) => {
      if (before < h && st.hearts >= h) {
        this.stories.push({ id: cu.reg, idx: i });
        setTimeout(() => { UI.toast(t('storyToast', T(reg.name))); Sound.play('story'); }, 400);
      }
    });
    if (before < MAX_HEARTS && st.hearts >= MAX_HEARTS) {
      setTimeout(() => UI.toast(t('giftToast', T(reg.name), T(reg.perk.text)), 'long'), 1400);
      Art.invalidate();
    }
  },

  wrongServe(cu, ci) {
    this.cups[ci].layers = [];
    UI.renderCup(ci);
    this.breakCombo();
    cu.pat -= cu.patMax * 0.25;
    cu.shakeT = 1;
    this.wrongs++;
    Art.floatText(cu.dx, cu.hy - cu.r * 2.2, t('wrong'), '#ff6b6b', 17);
    Sound.play('wrong');
    vibrate([30, 40, 30]);
  },

  breakCombo() {
    if (this.combo >= 3) Art.floatText(Art.W / 2, Art.H * 0.25, t('comboLost'), '#d8c3d2', 15);
    this.combo = 0;
    UI.updateHUD();
  },

  petCat() {
    const cat = this.cat;
    cat.petT = 1.5;
    const cx = cat.cx ?? cat.x, cy = cat.cy ?? Art.counterTop - 40;
    Art.burst(cx, cy, 'heart', 3);
    Sound.play('meow');
    if (cat.petted) return;
    cat.petted = true;
    const coins = (10 + S.day * 3) * (hasDecor('catbed') ? 2 : 1);
    S.coins += coins;
    this.earned += coins;
    S.stats.catPets++;
    Art.floatText(cx, cy - 30, t('purr', coins), '#e07a5f', 17);
    Progress.check();
    UI.updateHUD();
  },

  // ---------- кадр ----------
  update(dt) {
    if (!this.active || this.paused) return;
    const cap = this.cap;
    const W = Art.W;

    if (!this.tutorial && !this.closing && !this.solo) {
      this.t += dt;
      for (const p of this.regPlan) if (!p.done && this.t >= p.time && this.spawn(p.id)) p.done = true;
      // сюжетный гость — когда в очереди немного народу (или уже пора в любом случае)
      const b = this.beat, waiting = this.customers.filter((c) => c.state !== 'leave').length;
      if (b && !b.spawned && this.t >= b.at * this.len && (waiting <= 2 || this.t >= (b.at + 0.2) * this.len)) b.spawned = this.spawnStory(b.by, b.want);
      const ev = Events.night;
      for (const k of ['critic', 'tourists']) if (ev && ev[k] && !ev[k].done && this.t >= ev[k].time && this.spawn(null, null, k)) ev[k].done = true;
      this.nextSpawn -= dt;
      const present = this.customers.filter((c) => c.state !== 'leave').length;
      if (present === 0) this.nextSpawn = Math.min(this.nextSpawn, 0.8);
      if (this.nextSpawn <= 0) {
        this.nextSpawn = this.spawn() ? (baseSpawn(S.day) / Stats.spawnMult() / Events.spawnMult()) * rand(0.75, 1.25) : 0.5;
      }
      if (this.t >= this.len) {
        this.t = this.len;
        this.closing = true;
        UI.banner(t('closing'));
        Sound.play('close');
      }
    }

    // Нико
    if (this.nico && !this.closing) {
      this.nico.t -= dt;
      if (this.nico.t <= 0) this.nico.t = this.nicoServe() ? this.nico.cd : 1;
    }

    // оборудование
    for (const key of Object.keys(this.jobs)) {
      const jobs = this.jobs[key];
      for (let i = jobs.length - 1; i >= 0; i--) {
        const j = jobs[i];
        j.t += dt;
        if (!S.tips.perfect && !this.tutorial && inPerfectWindow(j)) { S.tips.perfect = true; UI.toast(t('perfectTip'), 'long'); }
        if (j.t < j.dur) continue;
        jobs.splice(i, 1);
        const layer = this.cups[j.cup].layers.find((l) => l.job === j);
        if (layer) layer.job = null;
        Sound.play({ espresso: 'brewDone', frother: 'steamDone', filter: 'brewDone' }[key]);
        UI.renderCup(j.cup);
      }
    }

    // гости
    const speed = Math.max(220, W * 0.6);
    for (let i = this.customers.length - 1; i >= 0; i--) {
      const cu = this.customers[i];
      if (cu.state === 'leave') cu.tx = W + 90;
      else cu.tx = Art.slotX(cu.slot, cap);
      const d = cu.tx - cu.x;
      cu.x += Math.sign(d) * Math.min(Math.abs(d), speed * dt);
      cu.jumpT = Math.max(0, cu.jumpT - dt * 2.2);
      cu.shakeT = Math.max(0, cu.shakeT - dt * 2);
      cu.wiggleT = Math.max(0, cu.wiggleT - dt * 3);
      cu.joyT = Math.max(0, cu.joyT - dt);
      if (cu.state === 'enter' && Math.abs(d) < 1) {
        cu.state = 'wait'; cu.bubbleT = 0.001;
        if (cu.story) Story.arrived(cu); else Talk.greet(cu);
        if (this.paused) return;
      }
      if (cu.state === 'wait') {
        cu.bubbleT += dt;
        if (!cu.frozen) cu.pat -= dt * (this.closing ? 1.6 : 1);
        if (cu.pat <= 0) {
          this.leave(cu, false);
          Rating.add(cu, false);
          Talk.upset(cu);
          this.specialDone(cu, false);
          this.missed++;
          this.breakCombo();
          Sound.play('leave');
          Art.floatText(cu.dx || cu.x, (cu.hy || Art.H * 0.5) - 30, t('leftGuest'), '#d8c3d2', 14);
        }
      }
      if (cu.state === 'leave' && cu.x >= W + 80) this.customers.splice(i, 1);
    }

    // кот
    if (!this.cat && this.t >= this.catTime && !this.closing) {
      this.cat = { state: 'in', x: W + 40, tx: W * rand(0.3, 0.7), dir: -1, t: 0, petT: 0, petted: false };
      this.catTime = Infinity;
      Sound.play('meow');
    }
    if (this.cat) {
      const cat = this.cat;
      cat.petT = Math.max(0, cat.petT - dt);
      if (cat.state === 'sit') {
        cat.t += dt;
        if (cat.t > 10 || this.closing) { cat.state = 'out'; cat.tx = W + 60; cat.dir = 1; }
      } else {
        const d = cat.tx - cat.x;
        cat.x += Math.sign(d) * Math.min(Math.abs(d), 90 * dt);
        if (Math.abs(d) < 1) {
          if (cat.state === 'in') cat.state = 'sit';
          else this.cat = null;
        }
      }
    }

    // обучение; под конец смены — напоминание про сюжетного гостя
    if (this.tutorial || this.solo) this.tutorialHint();
    else if (this.closing) {
      const sg = this.customers.find((c) => c.story && c.state === 'wait');
      if (sg) UI.hint(t('beatWait', T(REGULAR[sg.reg].name)));
    }

    // полуночник стучится, когда уже закрываемся
    const ev = Events.night;
    if (this.closing && ev && ev.owl && !ev.owl.done && this.spawn(null, null, 'owl')) ev.owl.done = true;

    if (this.closing && this.customers.length === 0) {
      this.endT += dt;
      if (this.endT > 1.0) this.end();
    }
  },

  tutorialHint() {
    const cu = this.customers.find((c) => c.state === 'wait');
    this.pointer = null;
    if (!cu) { UI.hint(this.solo ? null : t('tutWait')); return; }
    const cup = this.cups[this.sel];
    const want = cu.orders[0] || 'latte', dn = T(RECIPE[want].name), solo = !!this.solo;
    const need = [...RECIPE[want].ings];
    let extra = false;
    for (const i of this.cupItems(cup)) {
      const k = need.indexOf(i);
      if (k < 0) { extra = true; break; }
      need.splice(k, 1);
    }
    if (extra) UI.hint(solo ? t('tutOopsX', dn) : t('tutOops'), '#btn-trash');
    else if (need.length) UI.hint(solo ? t('tutAddX', dn, T(INGREDIENTS[need[0]].name)) : t('tutAdd', T(INGREDIENTS[need[0]].name)), `[data-ing="${need[0]}"]`);
    else if (!this.cupReady(cup)) UI.hint(t('tutBrewing'));
    else { UI.hint(solo ? t('tutServeX', T(REGULAR[cu.reg].name)) : t('tutServe')); this.pointer = cu; }
  },

  quit() {
    for (const cu of this.customers) if (cu.state !== 'leave') this.leave(cu, false);
    this.customers = [];
    this.end();
  },

  end() {
    if (!this.active) return;
    this.active = false;
    this.paused = false;
    this.pointer = null;
    this.cat = null;
    UI.hint(null);
    Talk.clear();
    const target = dayTarget(S.day);
    const ratio = this.earned / target;
    const stars = ratio >= 1 ? 3 : ratio >= 0.7 ? 2 : ratio >= 0.4 ? 1 : 0;
    const bonus = Math.round(this.earned * stars * 0.1);
    S.coins += bonus;
    const record = this.earned > S.stats.bestShift && S.stats.shifts > 0;
    S.stats.bestShift = Math.max(S.stats.bestShift, this.earned);
    S.stats.shifts++;
    S.stats.stars += stars;
    if (stars === 3) S.stats.threeStars++;
    Progress.onShiftEnd({ earned: this.earned, missed: this.missed, served: this.served, stars });
    const branches = Stats.bizIncome();
    S.coins += branches;
    const result = {
      branches,
      day: S.day, earned: this.earned, target, stars, bonus, record,
      served: this.served, maxCombo: this.maxCombo, missed: this.missed, stories: this.stories.slice(),
      events: Events.night ? Events.night.log.slice() : [], perfects: this.perfects,
      rating0: this.rating0, rating1: Rating.value(),
    };
    S.day++;
    Events.clear();
    Art.invalidate();
    persist();
    if (!Story.afterShift(result)) UI.showSummary(result);
  },
};
