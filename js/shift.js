// Логика смены: гости, заказы, оборудование, чашки, оплата и комбо.

const Shift = {
  active: false,
  paused: false,
  t: 0, len: SHIFT_BASE,
  closing: false, endT: 0,
  customers: [],
  cups: [],
  sel: 0,
  jobs: { espresso: [], frother: [] },
  combo: 0, maxCombo: 0,
  earned: 0, served: 0, missed: 0, wrongs: 0,
  stories: [],
  regPlan: [],
  nextSpawn: 0,
  cat: null, catTime: Infinity,
  tutorial: false, pointer: null,
  uid: 0,

  start() {
    Object.assign(this, {
      active: true, paused: false, t: 0, len: Stats.shiftLen(), closing: false, endT: 0,
      customers: [], sel: 0, jobs: { espresso: [], frother: [] },
      combo: 0, maxCombo: 0, earned: 0, served: 0, missed: 0, wrongs: 0, stories: [],
      nextSpawn: 1.2, cat: null, pointer: null,
    });
    this.cups = Array.from({ length: Stats.cups() }, () => ({ layers: [] }));
    this.tutorial = !S.tips.basics;
    // Постоянные гости на эту смену: новые приходят обязательно, знакомые — с шансом.
    this.regPlan = REGULARS.filter(regularEligible)
      .filter((r) => regState(r.id).visits === 0 || Math.random() < 0.55)
      .map((r) => ({ id: r.id, time: rand(0.08, 0.8) * this.len, done: false }));
    this.catTime = S.day >= 2 && Math.random() < 0.6 ? rand(25, this.len - 30) : Infinity;
    if (this.tutorial) this.spawn(null, 'latte');
    if (this.cups.length > 1 && !S.tips.cups) {
      S.tips.cups = true;
      setTimeout(() => UI.toast('Теперь чашек несколько — нажми на чашку, чтобы выбрать её', 'long'), 1500);
    }
  },

  // ---------- гости ----------
  freeSlot() {
    const cap = Stats.capacity();
    const used = new Set(this.customers.filter((c) => c.state !== 'leave').map((c) => c.slot));
    const free = [];
    for (let i = 0; i < cap; i++) if (!used.has(i)) free.push(i);
    return free.length ? pick(free) : -1;
  },

  pickRecipe() {
    const pool = S.recipes;
    const w = pool.map((id) => 1 + RECIPE[id].index * 0.25);
    let x = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < pool.length; i++) { x -= w[i]; if (x <= 0) return pool[i]; }
    return pool[pool.length - 1];
  },

  spawn(regId, forced) {
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
        UI.toast('Постоянный гость! Вспомни его любимый напиток — чаевые ×2. Не помнишь? Нажми на облачко.', 'long');
      }
    } else {
      orders = [forced || this.pickRecipe()];
      if (!forced && Math.random() < multiDrinkChance(S.day)) orders.push(this.pickRecipe());
      look = randomLook();
    }
    const complexity = orders.reduce((a, id) => a + RECIPE[id].ings.length, 0);
    const patMax = (basePatience(S.day) + complexity * 2.5) * Stats.patienceMult() * (orders.length > 1 ? 1.35 : 1);
    this.customers.push({
      id: ++this.uid, slot, x: -60, tx: 0, state: 'enter', look, orders, reg: regId || null, hidden, revealed: false,
      pat: patMax, patMax, phase: rand(0, 6), bubbleT: 0, jumpT: 0, shakeT: 0, wiggleT: 0, joyT: 0, happy: false,
      frozen: this.tutorial,
    });
    Sound.play('door');
    return true;
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
      UI.toast('Чашка полная — вылей её 🗑');
      return;
    }
    if (ing.machine) {
      const slots = ing.machine === 'espresso' ? Stats.groups() : Stats.pitchers();
      const jobs = this.jobs[ing.machine];
      if (jobs.length >= slots) { UI.shakeIng(id); Sound.play('busy'); return; }
      const dur = ing.machine === 'espresso' ? Stats.brewTime() : Stats.frothTime();
      const job = { ing: id, cup: this.sel, t: 0, dur };
      jobs.push(job);
      cup.layers.push({ ing: id, job });
      Sound.play(ing.machine === 'espresso' ? 'grind' : 'steam');
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
      for (const k of ['espresso', 'frother']) {
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
    if (this.cat && this.cat.state !== 'out' && inR(this.cat.hit)) { this.petCat(); return; }
    const waiting = this.customers.filter((c) => c.state === 'wait');
    for (const cu of waiting) {
      if (inR(cu.bub)) {
        if (cu.hidden && !cu.revealed && !this.cupReady(this.cups[this.sel])) { this.reveal(cu); return; }
        this.serveTo(cu); return;
      }
    }
    for (const cu of waiting) if (inR(cu.hit)) { this.serveTo(cu); return; }
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
        UI.toast('Сначала приготовь напиток');
        return;
      }
      if (!this.cupReady(sel)) { cu.wiggleT = 1; Sound.play('busy'); UI.toast('Напиток ещё готовится…'); return; }
      this.wrongServe(cu, this.sel);
      return;
    }
    this.success(cu, ci, oi);
  },

  success(cu, ci, oi) {
    const rid = cu.orders[oi];
    const rec = RECIPE[rid];
    cu.orders.splice(oi, 1);
    this.cups[ci].layers = [];
    UI.renderCup(ci);
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    S.stats.bestCombo = Math.max(S.stats.bestCombo, this.combo);
    const memory = cu.hidden && !cu.revealed;
    const price = rec.price * Stats.priceMult();
    const f = clamp(cu.pat / cu.patMax, 0, 1);
    const tip = price * (0.15 + 0.45 * f) * Stats.tipMult();
    const cm = comboMult(this.combo);
    const pay = Math.round(price + tip * cm * (memory ? 2 : 1));
    this.earned += pay;
    S.coins += pay;
    S.stats.drinks[rid] = (S.stats.drinks[rid] || 0) + 1;

    const x = cu.dx, y = cu.hy;
    Art.floatText(x, y - cu.r * 2.2, '+' + pay, '#b8860b', 22);
    if (memory) Art.floatText(x, y - cu.r * 3.4, 'Запомнил! ×2', '#e07a5f', 15);
    else if (f > 0.75) Art.floatText(x, y - cu.r * 3.4, 'Быстро!', '#5f927a', 14);
    const tgt = UI.coinTarget();
    const n = Math.min(6, 1 + Math.floor(pay / 8));
    for (let i = 0; i < n; i++) {
      Art.flyCoin(x, y, tgt.x, tgt.y, () => { UI.bumpCoins(); if (i === 0) Sound.play('coin'); }, i * 0.06);
    }
    Art.burst(x, y, 'spark', 8);
    Sound.play('ding');
    vibrate(15);

    if (COMBO_STEPS.includes(this.combo)) {
      UI.banner(`Комбо ×${comboMult(this.combo)}!`, 'combo');
      Sound.play('combo', COMBO_STEPS.indexOf(this.combo));
      Art.burst(Art.W / 2, Art.H * 0.35, 'confetti', 30);
      Art.addShake(0.5);
    }

    const done = cu.orders.length === 0;
    if (done) {
      this.leave(cu, true);
      cu.jumpT = 1;
      for (let i = 0; i < 4; i++) Art.burst(x, y - cu.r, 'heart', 1);
      this.served++;
      S.stats.served++;
      if (cu.reg) this.regularServed(cu, memory);
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
      UI.hint('Отлично! Быстрее — больше чаевых, без ошибок — комбо 🔥', null, 4500);
      persist();
    }
    UI.updateHUD();
  },

  regularServed(cu, memory) {
    const reg = REGULAR[cu.reg];
    const st = regState(cu.reg);
    const before = st.hearts;
    st.hearts = Math.min(MAX_HEARTS, before + (memory ? 2 : 1));
    st.visits++;
    S.stats.regularServes++;
    if (memory) S.stats.memory++;
    STORY_HEARTS.forEach((h, i) => {
      if (before < h && st.hearts >= h) {
        this.stories.push({ id: cu.reg, idx: i });
        setTimeout(() => { UI.toast(`💌 Новая история: ${reg.name}`); Sound.play('story'); }, 400);
      }
    });
    if (before < MAX_HEARTS && st.hearts >= MAX_HEARTS) {
      setTimeout(() => UI.toast(`🎁 Подарок от ${reg.name}: ${reg.perk.text}`, 'long'), 1400);
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
    Art.floatText(cu.dx, cu.hy - cu.r * 2.2, 'Это не то!', '#c4473a', 17);
    Sound.play('wrong');
    vibrate([30, 40, 30]);
  },

  breakCombo() {
    if (this.combo >= 3) Art.floatText(Art.W / 2, Art.H * 0.25, 'Комбо сброшено', '#8a6b5a', 15);
    this.combo = 0;
    UI.updateHUD();
  },

  petCat() {
    const cat = this.cat;
    cat.petT = 1.5;
    Art.burst(cat.x, Art.counterTop - 40, 'heart', 3);
    Sound.play('meow');
    if (cat.petted) return;
    cat.petted = true;
    const coins = 10 + S.day * 3;
    S.coins += coins;
    this.earned += coins;
    S.stats.catPets++;
    Art.floatText(cat.x, Art.counterTop - 70, `Мурр! +${coins}`, '#e07a5f', 17);
    Progress.check();
    UI.updateHUD();
  },

  // ---------- кадр ----------
  update(dt) {
    if (!this.active || this.paused) return;
    const cap = Stats.capacity();
    const W = Art.W;

    if (!this.tutorial && !this.closing) {
      this.t += dt;
      for (const p of this.regPlan) if (!p.done && this.t >= p.time && this.spawn(p.id)) p.done = true;
      this.nextSpawn -= dt;
      const present = this.customers.filter((c) => c.state !== 'leave').length;
      if (present === 0) this.nextSpawn = Math.min(this.nextSpawn, 0.8);
      if (this.nextSpawn <= 0) {
        this.nextSpawn = this.spawn() ? (baseSpawn(S.day) / Stats.spawnMult()) * rand(0.75, 1.25) : 0.5;
      }
      if (this.t >= this.len) {
        this.t = this.len;
        this.closing = true;
        UI.banner('Закрываемся!');
        Sound.play('close');
      }
    }

    // оборудование
    for (const key of ['espresso', 'frother']) {
      const jobs = this.jobs[key];
      for (let i = jobs.length - 1; i >= 0; i--) {
        const j = jobs[i];
        j.t += dt;
        if (j.t < j.dur) continue;
        jobs.splice(i, 1);
        const layer = this.cups[j.cup].layers.find((l) => l.job === j);
        if (layer) layer.job = null;
        Sound.play(key === 'espresso' ? 'brewDone' : 'steamDone');
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
      if (cu.state === 'enter' && Math.abs(d) < 1) { cu.state = 'wait'; cu.bubbleT = 0.001; }
      if (cu.state === 'wait') {
        cu.bubbleT += dt;
        if (!cu.frozen) cu.pat -= dt * (this.closing ? 1.6 : 1);
        if (cu.pat <= 0) {
          this.leave(cu, false);
          this.missed++;
          this.breakCombo();
          Sound.play('leave');
          Art.floatText(cu.dx || cu.x, (cu.hy || Art.H * 0.5) - 30, 'Ушёл без кофе…', '#8a6b5a', 14);
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

    // обучение
    if (this.tutorial) this.tutorialHint();

    if (this.closing && this.customers.length === 0) {
      this.endT += dt;
      if (this.endT > 1.0) this.end();
    }
  },

  tutorialHint() {
    const cu = this.customers.find((c) => c.state === 'wait');
    this.pointer = null;
    if (!cu) { UI.hint('Встречай первого гостя…'); return; }
    const cup = this.cups[this.sel];
    const need = [...RECIPE.latte.ings];
    let extra = false;
    for (const i of this.cupItems(cup)) {
      const k = need.indexOf(i);
      if (k < 0) { extra = true; break; }
      need.splice(k, 1);
    }
    if (extra) UI.hint('Ой, это не латте. Вылей чашку', '#btn-trash');
    else if (need.length) UI.hint(`Латте = эспрессо + молоко. Нажми «${INGREDIENTS[need[0]].name}»`, `[data-ing="${need[0]}"]`);
    else if (!this.cupReady(cup)) UI.hint('Готовится… секунду');
    else { UI.hint('Готово! Нажми на гостя, чтобы отдать латте'); this.pointer = cu; }
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
    const result = {
      day: S.day, earned: this.earned, target, stars, bonus, record,
      served: this.served, maxCombo: this.maxCombo, missed: this.missed, stories: this.stories.slice(),
    };
    S.day++;
    Art.invalidate();
    persist();
    UI.showSummary(result);
  },
};
