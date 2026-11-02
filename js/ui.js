// Интерфейс: рабочая станция, HUD, меню, магазин, гости, задания, итоги смены, всплывашки.

const UI = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const el = {};
  const ING_KEYS = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D'];
  const CUP_KEYS = ['Z', 'X', 'C'];
  let shopTab = 'up';
  let hintState = { text: undefined, sel: null, timer: null };
  const popupQueue = [];
  let modalOpen = false;

  function init() {
    Object.assign(el, {
      app: $('#app'), wrap: $('#scene-wrap'), hud: $('#hud'), coins: $('#hud-coins'), coinsVal: $('#hud-coins-val'),
      combo: $('#hud-combo'), time: $('#hud-time'), timeVal: $('#hud-time-val'), station: $('#station'),
      cups: $('#cups'), ings: $('#ingredients'), trash: $('#btn-trash'), overlay: $('#overlay'), panel: $('#panel'),
      modal: $('#modal'), card: $('#modal-card'), toasts: $('#toasts'), banner: $('#banner'), hint: $('#hint'),
    });
    document.documentElement.style.setProperty('--coin', `url("${iconDataUrl('coin')}")`);
    el.trash.innerHTML = iconSvg('trash') + '<span class="key">⌫</span>';
    $('#hud-time .clock').innerHTML = iconSvg('clock');
    el.trash.addEventListener('pointerdown', (e) => { e.preventDefault(); Shift.trash(); });
    $('#btn-pause').addEventListener('click', () => pause());
    el.panel.addEventListener('click', onAction);
    el.card.addEventListener('click', onAction);
    el.cups.addEventListener('pointerdown', (e) => {
      const b = e.target.closest('[data-cup]');
      if (b) { e.preventDefault(); Shift.selectCup(+b.dataset.cup); }
    });
    el.ings.addEventListener('pointerdown', (e) => {
      const b = e.target.closest('[data-ing]');
      if (b) { e.preventDefault(); Shift.addIngredient(b.dataset.ing); }
    });
  }

  function setMode(mode) {
    el.app.classList.toggle('in-shift', mode === 'shift');
    el.hud.classList.toggle('hidden', mode !== 'shift');
    el.station.classList.toggle('hidden', mode !== 'shift');
  }

  // ---------- станция ----------
  function buildStation() {
    el.cups.innerHTML = Shift.cups.map((_, i) => `
      <button class="cup-slot" data-cup="${i}" aria-label="Чашка ${i + 1}">
        <div class="cup"><div class="cup-handle"></div><div class="cup-body"><div class="fill"></div></div></div>
        <div class="cup-label"></div>${Shift.cups.length > 1 ? `<span class="key">${CUP_KEYS[i]}</span>` : ''}
      </button>`).join('');
    el.ings.innerHTML = availableIngredients().map((id, k) => {
      const ing = INGREDIENTS[id];
      const slots = ing.machine === 'espresso' ? Stats.groups() : ing.machine === 'frother' ? Stats.pitchers() : 0;
      const dots = slots ? `<span class="slots">${'<i class="dot"></i>'.repeat(slots)}</span>` : '';
      return `<button class="ing" data-ing="${id}">${iconSvg(id)}<span class="ing-name">${ing.name}</span><span class="key">${ING_KEYS[k] || ''}</span>${dots}</button>`;
    }).join('');
    renderCups();
  }

  function renderCups() { Shift.cups.forEach((_, i) => renderCup(i)); }

  function renderCup(i) {
    const slot = el.cups.children[i];
    if (!slot) return;
    const cup = Shift.cups[i];
    slot.classList.toggle('selected', i === Shift.sel && Shift.cups.length > 1);
    slot.querySelector('.fill').innerHTML = cup.layers.map((l) => {
      const ing = INGREDIENTS[l.ing];
      const h = (ing.h / 52) * 100;
      const p = l.job ? clamp(l.job.t / l.job.dur, 0, 1) : 1;
      return `<div class="layer k-${ing.kind || 'liquid'}${l.job ? ' pending' : ''}" data-h="${h}" style="height:${h * p}%;--c:${ing.color}"></div>`;
    }).join('');
    const label = slot.querySelector('.cup-label');
    const items = Shift.cupItems(cup);
    const rec = recipeFor(items);
    label.classList.remove('match');
    if (!cup.layers.length) label.textContent = Shift.cups.length > 1 && i === Shift.sel ? 'выбрана' : '';
    else if (!Shift.cupReady(cup)) label.textContent = 'готовится…';
    else if (rec && S.recipes.includes(rec.id)) { label.textContent = rec.name + ' ✓'; label.classList.add('match'); }
    else label.textContent = 'что-то своё';
  }

  function tick() {
    if (!Shift.active) return;
    // кольца загрузки оборудования
    for (const key of ['espresso', 'frother']) {
      const jobs = Shift.jobs[key];
      const slots = key === 'espresso' ? Stats.groups() : Stats.pitchers();
      el.ings.querySelectorAll(`.ing`).forEach((b) => {
        const ing = INGREDIENTS[b.dataset.ing];
        if (ing.machine !== key) return;
        b.querySelectorAll('.dot').forEach((d, k) => d.style.setProperty('--p', jobs[k] ? clamp(jobs[k].t / jobs[k].dur, 0, 1) : 0));
        b.classList.toggle('busy', jobs.length >= slots);
      });
    }
    // растущие слои в чашках
    Shift.cups.forEach((cup, i) => {
      const fill = el.cups.children[i] && el.cups.children[i].querySelector('.fill');
      if (!fill) return;
      cup.layers.forEach((l, k) => {
        if (!l.job) return;
        const d = fill.children[k];
        if (d) d.style.height = (+d.dataset.h * clamp(l.job.t / l.job.dur, 0, 1)) + '%';
      });
    });
    const left = Math.max(0, Math.ceil(Shift.len - Shift.t));
    el.timeVal.textContent = Shift.closing ? 'закрыто' : `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    el.time.classList.toggle('warn', !Shift.closing && left <= 20);
  }

  function updateHUD() {
    el.coinsVal.textContent = fmt(Shift.earned);
    const m = comboMult(Shift.combo);
    el.combo.innerHTML = `<span class="flame">🔥</span><b>×${m}</b><small>${Shift.combo}</small>`;
    el.combo.classList.toggle('hot', m > 1);
    el.combo.classList.toggle('blaze', m >= 3);
  }

  function restartAnim(node, cls) {
    node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls);
  }
  function bumpCoins() { restartAnim(el.coins, 'bump'); }
  function pressIng(id) { const b = el.ings.querySelector(`[data-ing="${id}"]`); if (b) restartAnim(b, 'press'); }
  function shakeIng(id) { const b = el.ings.querySelector(`[data-ing="${id}"]`); if (b) restartAnim(b, 'shake'); }

  function coinTarget() {
    const r = el.coins.getBoundingClientRect(), w = el.wrap.getBoundingClientRect();
    return { x: r.left - w.left + 16, y: r.top - w.top + r.height / 2 };
  }

  // ---------- подсказки, тосты, баннер ----------
  function hint(text, sel = null, autoHide = 0) {
    if (text === hintState.text && sel === hintState.sel) return;
    if (hintState.sel) document.querySelectorAll('.pulse').forEach((n) => n.classList.remove('pulse'));
    clearTimeout(hintState.timer);
    hintState = { text, sel, timer: null };
    if (!text) { el.hint.classList.add('hidden'); return; }
    el.hint.textContent = text;
    el.hint.classList.remove('hidden');
    restartAnim(el.hint, 'pop');
    if (sel) { const t = $(sel); if (t) t.classList.add('pulse'); }
    if (autoHide) hintState.timer = setTimeout(() => hint(null), autoHide);
  }

  function toast(html, kind = '') {
    for (const t of el.toasts.children) if (t.dataset.msg === html) return;
    while (el.toasts.children.length >= 3) el.toasts.firstChild.remove();
    const t = document.createElement('div');
    t.className = 'toast ' + kind;
    t.dataset.msg = html;
    t.innerHTML = html;
    el.toasts.appendChild(t);
    setTimeout(() => t.classList.add('out'), kind === 'long' ? 4200 : 2400);
    setTimeout(() => t.remove(), kind === 'long' ? 4600 : 2800);
  }

  function banner(text, kind = '') {
    el.banner.textContent = text;
    el.banner.className = kind;
    restartAnim(el.banner, 'show');
  }

  // ---------- панели ----------
  function openPanel(html, cls = '', animate = true) {
    el.overlay.classList.remove('hidden');
    el.panel.className = cls;
    el.panel.innerHTML = html;
    el.panel.scrollTop = 0;
    if (animate) restartAnim(el.panel, 'enter');
  }
  function closePanel() { el.overlay.classList.add('hidden'); el.panel.innerHTML = ''; }

  const coin = (n) => `<span class="coin"></span>${fmt(n)}`;

  function nextGoal() {
    const opts = [];
    for (const r of RECIPES) if (!S.recipes.includes(r.id)) opts.push({ name: r.name, cost: r.cost });
    for (const u of UPGRADES) if (!upMaxed(u.id)) opts.push({ name: u.name, cost: upCost(u.id) });
    opts.sort((a, b) => a.cost - b.cost);
    return opts[0] || null;
  }

  function showMenu() {
    setMode('menu');
    const unclaimed = Progress.unclaimed();
    const goal = nextGoal();
    const goalHtml = goal
      ? (S.coins >= goal.cost
        ? `<div class="teaser ready">Можно купить: <b>${goal.name}</b> 🎉</div>`
        : `<div class="teaser">Скоро: <b>${goal.name}</b> — ещё ${coin(goal.cost - S.coins)}</div>`)
      : '';
    openPanel(`
      <div class="menu">
        <div class="brand"><div class="brand-logo">${iconSvg('logo')}</div><div><h1>Пенка</h1><p>уютная кофейня</p></div></div>
        <div class="chips">
          <span class="chip">День ${S.day}</span>
          <span class="chip">${coin(S.coins)}</span>
          <span class="chip">🔥 ${S.streak.count}</span>
        </div>
        <div class="goal">Цель дня: ${coin(dayTarget(S.day))} — и три звезды твои</div>
        <button class="btn primary big" data-act="start">Открыть смену</button>
        ${goalHtml}
        <div class="tiles">
          <button class="btn tile" data-act="shop"><span class="tile-ico">🛠️</span>Улучшения${canAffordSomething() ? '<i class="badge">!</i>' : ''}</button>
          <button class="btn tile" data-act="guests"><span class="tile-ico">💌</span>Гости</button>
          <button class="btn tile" data-act="quests"><span class="tile-ico">📋</span>Задания${unclaimed ? `<i class="badge">${unclaimed}</i>` : ''}</button>
        </div>
        <div class="menu-foot">
          <button class="icon-btn ${S.settings.music ? '' : 'off'}" data-act="music" aria-label="Музыка">🎵</button>
          <button class="icon-btn ${S.settings.sfx ? '' : 'off'}" data-act="sfx" aria-label="Звуки">🔊</button>
          <span class="muted">${Stats.helperRate() ? `🦔 Ёжик Пых: ${Stats.helperRate()} в час` : 'Лучший результат: ' + coin(S.stats.bestShift)}</span>
        </div>
      </div>`, 'sheet menu-sheet');
  }

  function sheetHead(title) {
    return `<div class="sheet-head"><button class="btn small" data-act="menu">← Назад</button><h2>${title}</h2><span class="chip">${coin(S.coins)}</span></div>`;
  }

  function showShop(keepScroll) {
    const scroll = el.panel.scrollTop;
    let cards = '';
    if (shopTab === 'up') {
      cards = UPGRADES.map((u) => {
        const lvl = upLevel(u.id), max = u.costs.length, maxed = lvl >= max;
        const cur = u.values[lvl];
        const afford = !maxed && S.coins >= u.costs[lvl];
        const pips = Array.from({ length: max }, (_, i) => `<i class="${i < lvl ? 'on' : ''}"></i>`).join('');
        return `<div class="card${afford ? ' can' : ''}">
          <div class="card-ico">${u.icon}</div>
          <div class="card-body"><b>${u.name}</b><div class="pips">${pips}</div>
            <small>${maxed ? u.desc(cur) : `${u.desc(cur)}<br><span class="next">→ ${u.desc(u.values[lvl + 1])}</span>`}</small></div>
          ${maxed ? '<span class="maxed">МАКС</span>' : `<button class="btn buy${afford ? ' green' : ''}" data-act="buy-up" data-id="${u.id}" ${afford ? '' : 'disabled'}>${coin(u.costs[lvl])}</button>`}
        </div>`;
      }).join('');
    } else {
      cards = RECIPES.map((r) => {
        const owned = S.recipes.includes(r.id);
        const afford = !owned && S.coins >= r.cost;
        const fan = REGULARS.find((g) => g.fav === r.id);
        return `<div class="card${afford ? ' can' : ''}${owned ? ' owned' : ''}">
          <div class="card-ico recipe-ico">${r.ings.map((i) => iconSvg(i)).join('')}</div>
          <div class="card-body"><b>${r.name}</b>
            <small>${r.ings.map((i) => INGREDIENTS[i].name.toLowerCase()).join(' + ')}<br>Цена: ${coin(Math.round(r.price * Stats.priceMult()))}${fan ? ` · любит ${fan.name}` : ''}</small></div>
          ${owned ? '<span class="maxed">В меню</span>' : `<button class="btn buy${afford ? ' green' : ''}" data-act="buy-rec" data-id="${r.id}" ${afford ? '' : 'disabled'}>${coin(r.cost)}</button>`}
        </div>`;
      }).join('');
    }
    openPanel(`${sheetHead('Улучшения')}
      <div class="tabs">
        <button class="tab ${shopTab === 'up' ? 'on' : ''}" data-act="tab" data-tab="up">Оборудование</button>
        <button class="tab ${shopTab === 'rec' ? 'on' : ''}" data-act="tab" data-tab="rec">Рецепты</button>
      </div>
      <div class="cards">${cards}</div>`, 'sheet tall', !keepScroll);
    if (keepScroll) el.panel.scrollTop = scroll;
  }

  function showGuests() {
    const cards = REGULARS.map((g) => {
      const st = regState(g.id);
      const eligible = regularEligible(g);
      const met = st.visits > 0;
      let sub;
      if (S.day < g.minDay) sub = `Заглянет с ${g.minDay}-го дня`;
      else if (!S.recipes.includes(g.fav)) sub = `Придёт, когда в меню появится «${RECIPE[g.fav].name}»`;
      else if (!met) sub = 'Скоро заглянет!';
      else sub = `Любит: <b>${RECIPE[g.fav].name}</b>`;
      const hearts = Array.from({ length: MAX_HEARTS }, (_, i) => `<i class="${i < st.hearts ? 'on' : ''}">♥</i>`).join('');
      let stories = '';
      if (met) {
        let teaser = false;
        g.story.forEach((text, i) => {
          if (st.hearts >= STORY_HEARTS[i]) stories += `<p class="story">«${text}»</p>`;
          else if (!teaser) { teaser = true; stories += `<p class="story locked">🔒 Следующая история при ♥${STORY_HEARTS[i]}</p>`; }
        });
      }
      return `<div class="guest${met ? '' : ' locked'}">
        <canvas class="portrait" data-guest="${g.id}"></canvas>
        <div class="guest-body">
          <b>${met || eligible ? g.name : '???'}</b>
          <div class="hearts">${hearts}</div>
          <small>${sub}</small>
          ${stories}
          <div class="perk${st.hearts >= MAX_HEARTS ? ' on' : ''}">🎁 Подарок дружбы: ${st.hearts >= MAX_HEARTS ? g.perk.text : 'откроется на ♥' + MAX_HEARTS}</div>
        </div>
      </div>`;
    }).join('');
    openPanel(`${sheetHead('Гости')}
      <p class="muted center">Постоянные гости рассказывают истории и дарят подарки. Запоминай их заказы — за это чаевые ×2 и двойная дружба.</p>
      <div class="cards">${cards}</div>`, 'sheet tall');
    el.panel.querySelectorAll('canvas[data-guest]').forEach((c) => {
      const g = REGULAR[c.dataset.guest];
      Art.drawPortrait(c, g.look, regState(g.id).visits === 0);
    });
  }

  function showQuests() {
    const list = Progress.quests();
    const ms = Progress.msToReset();
    const h = Math.floor(ms / 3.6e6), m = Math.floor((ms % 3.6e6) / 6e4);
    const n = S.streak.count;
    const week = Array.from({ length: 7 }, (_, i) => `<i class="${i < ((n - 1) % 7) + 1 ? 'on' : ''}">☕</i>`).join('');
    const qcards = list.map((q, i) => `
      <div class="quest${q.claimed ? ' claimed' : ''}">
        <div class="quest-body"><b>${Progress.questText(q)}</b>
          <div class="bar"><div style="width:${(q.progress / q.target) * 100}%"></div></div>
          <small>${q.type === 'earn' ? fmt(q.progress) + ' / ' + fmt(q.target) : q.progress + ' / ' + q.target}</small></div>
        ${q.claimed ? '<span class="maxed">✓</span>' : `<button class="btn buy${q.done ? ' green' : ''}" data-act="claim" data-i="${i}" ${q.done ? '' : 'disabled'}>${coin(q.reward)}</button>`}
      </div>`).join('');
    const allClaimed = list.every((q) => q.claimed);
    const bonus = `<div class="quest bonus${S.quests.bonusClaimed ? ' claimed' : ''}">
      <div class="quest-body"><b>🎁 Все три задания</b><small>Сундучок за выполненный день</small></div>
      ${S.quests.bonusClaimed ? '<span class="maxed">✓</span>' : `<button class="btn buy${allClaimed ? ' green' : ''}" data-act="bonus" ${allClaimed ? '' : 'disabled'}>${coin(Progress.allBonus())}</button>`}
    </div>`;
    const got = ACHIEVEMENTS.filter((a) => S.ach[a.id]).length;
    const ach = ACHIEVEMENTS.map((a) => `<div class="ach${S.ach[a.id] ? ' on' : ''}"><span>${S.ach[a.id] ? '🏆' : '🔒'}</span><b>${a.name}</b><small>${a.desc}</small><small class="rw">${coin(a.reward)}</small></div>`).join('');
    openPanel(`${sheetHead('Задания')}
      <div class="streak"><div><b>🔥 Серия: ${n} ${plural(n, 'день', 'дня', 'дней')}</b><small>Заходи каждый день — награда растёт</small></div><div class="week">${week}</div></div>
      <div class="section-title"><h3>Сегодня</h3><small>новые через ${h} ч ${m} мин</small></div>
      <div class="cards">${qcards}${bonus}</div>
      <div class="section-title"><h3>Достижения</h3><small>${got} из ${ACHIEVEMENTS.length}</small></div>
      <div class="ach-grid">${ach}</div>`, 'sheet tall');
  }

  function showSummary(r) {
    setMode('menu');
    const stories = r.stories.map((s) => {
      const g = REGULAR[s.id];
      return `<div class="story-card"><canvas class="portrait" data-guest="${g.id}"></canvas><div><b>${g.name}</b><p>«${g.story[s.idx]}»</p></div></div>`;
    }).join('');
    openPanel(`
      <div class="summary">
        <p class="muted">День ${r.day}</p>
        <h2>Смена окончена!</h2>
        <div class="stars">${[0, 1, 2].map((i) => `<span class="star" data-star="${i}">★</span>`).join('')}</div>
        <div class="earn">${'<span class="coin"></span>'}<span id="earn-num">0</span></div>
        <div class="target"><div class="tbar"><div class="tfill" id="tfill"></div><i style="left:40%"></i><i style="left:70%"></i></div><small>Цель дня: ${fmt(r.target)}</small></div>
        ${r.record ? '<div class="record">Новый рекорд!</div>' : ''}
        <div class="stat-grid">
          <div><b>${r.served}</b><span>${plural(r.served, 'гость', 'гостя', 'гостей')}</span></div>
          <div><b>${r.maxCombo}</b><span>лучшее комбо</span></div>
          <div><b>${r.missed}</b><span>ушли без кофе</span></div>
        </div>
        ${r.bonus ? `<div class="bonus-line">Бонус за звёзды: +${coin(r.bonus)}</div>` : ''}
        ${stories ? `<h3>Новые истории</h3>${stories}` : ''}
        <button class="btn primary big" data-act="menu">Дальше</button>
      </div>`, `sheet summary-sheet${stories ? ' tall' : ''}`);
    el.panel.querySelectorAll('canvas[data-guest]').forEach((c) => Art.drawPortrait(c, REGULAR[c.dataset.guest].look));
    // анимация подсчёта
    const num = $('#earn-num'), fill = $('#tfill');
    const ratio = r.earned / r.target;
    const t0 = performance.now(), dur = 1400;
    let lit = 0;
    const step = (now) => {
      if (!document.body.contains(num)) return;
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      num.textContent = fmt(r.earned * e);
      const fr = Math.min(1, ratio * e);
      fill.style.width = fr * 100 + '%';
      const thresholds = [0.4, 0.7, 1];
      while (lit < r.stars && fr >= thresholds[lit] - 1e-6) {
        const s = el.panel.querySelector(`[data-star="${lit}"]`);
        s.classList.add('on');
        Sound.play('star', lit);
        lit++;
      }
      if (k < 1) requestAnimationFrame(step);
      else if (r.stars === 3) Art.burst(Art.W / 2, Art.H * 0.3, 'confetti', 40);
    };
    requestAnimationFrame(step);
  }

  // ---------- модальные окна ----------
  function openModal(html) {
    el.modal.classList.remove('hidden');
    el.card.innerHTML = html;
    restartAnim(el.card, 'pop');
    modalOpen = true;
  }
  function closeModal() {
    el.modal.classList.add('hidden');
    el.card.innerHTML = '';
    modalOpen = false;
    if (popupQueue.length) setTimeout(nextPopup, 150);
  }

  function queuePopups(list) {
    popupQueue.push(...list);
    if (!modalOpen) nextPopup();
  }
  function nextPopup() {
    const p = popupQueue.shift();
    if (!p) return;
    const week = p.streak ? `<div class="week big">${Array.from({ length: 7 }, (_, i) => `<i class="${i < ((p.streak - 1) % 7) + 1 ? 'on' : ''}">☕</i>`).join('')}</div>` : '';
    openModal(`
      <div class="pop-ico">${p.icon}</div>
      <h2>${p.title}</h2>
      <p>${p.body}</p>
      ${week}
      ${p.coins ? `<div class="pop-coins">+${coin(p.coins)}</div>` : ''}
      ${p.note ? `<small class="muted">${p.note}</small>` : ''}
      <button class="btn primary big" data-act="popup-ok">${p.coins ? 'Забрать!' : 'Начнём!'}</button>`);
  }

  function pause() {
    if (!Shift.active || Shift.paused) return;
    Shift.paused = true;
    openModal(`
      <div class="pop-ico">☕</div><h2>Пауза</h2>
      <p>Гости терпеливо ждут.</p>
      <div class="row">
        <button class="icon-btn ${S.settings.music ? '' : 'off'}" data-act="music">🎵</button>
        <button class="icon-btn ${S.settings.sfx ? '' : 'off'}" data-act="sfx">🔊</button>
      </div>
      <button class="btn primary big" data-act="resume">Продолжить</button>
      <button class="btn small ghost" data-act="quit">Закончить смену</button>`);
  }

  // ---------- действия ----------
  function startShift() {
    Sound.init();
    closePanel();
    Shift.start();
    buildStation();
    setMode('shift');
    updateHUD();
    tick();
    banner(`День ${S.day} · Открыто!`);
    Sound.play('open');
  }

  function onAction(e) {
    const b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    Sound.init();
    const act = b.dataset.act;
    switch (act) {
      case 'start': startShift(); return;
      case 'menu': Sound.play('ui'); showMenu(); return;
      case 'shop': Sound.play('ui'); showShop(); return;
      case 'guests': Sound.play('ui'); showGuests(); return;
      case 'quests': Sound.play('ui'); showQuests(); return;
      case 'tab': shopTab = b.dataset.tab; Sound.play('tap'); showShop(); return;
      case 'buy-up': {
        const id = b.dataset.id;
        if (upMaxed(id) || S.coins < upCost(id)) return;
        S.coins -= upCost(id);
        S.upgrades[id] = upLevel(id) + 1;
        afterBuy(`${UPGRADE[id].icon} ${UPGRADE[id].name} — уровень ${upLevel(id)}`);
        return;
      }
      case 'buy-rec': {
        const r = RECIPE[b.dataset.id];
        if (S.recipes.includes(r.id) || S.coins < r.cost) return;
        S.coins -= r.cost;
        S.recipes.push(r.id);
        const newIngs = r.ings.filter((i) => !RECIPES.some((x) => x.id !== r.id && S.recipes.includes(x.id) && x.ings.includes(i)));
        afterBuy(`Новый рецепт: ${r.name}!${newIngs.length ? ' Новый ингредиент: ' + newIngs.map((i) => INGREDIENTS[i].name.toLowerCase()).join(', ') : ''}`);
        return;
      }
      case 'claim': {
        const got = Progress.claim(+b.dataset.i);
        if (got) { Sound.play('coin'); Sound.play('buy'); toast(`+${coin(got)}`, 'gold'); }
        showQuests(); return;
      }
      case 'bonus': {
        const got = Progress.claimBonus();
        if (got) { Sound.play('buy'); toast(`🎁 +${coin(got)}`, 'gold'); Art.burst(Art.W / 2, Art.H * 0.3, 'confetti', 30); }
        showQuests(); return;
      }
      case 'music':
        S.settings.music = !S.settings.music; Sound.setMusic(S.settings.music); persist();
        b.classList.toggle('off', !S.settings.music); return;
      case 'sfx':
        S.settings.sfx = !S.settings.sfx; Sound.setSfx(S.settings.sfx); persist();
        b.classList.toggle('off', !S.settings.sfx); Sound.play('tap'); return;
      case 'popup-ok': Sound.play('coin'); closeModal(); if (!el.overlay.classList.contains('hidden')) refreshMenu(); return;
      case 'resume': Shift.paused = false; Sound.play('ui'); closeModal(); return;
      case 'quit': closeModal(); Shift.quit(); return;
    }
  }

  function refreshMenu() {
    if (el.panel.classList.contains('menu-sheet')) showMenu();
  }

  function afterBuy(msg) {
    Progress.check();
    persist();
    Art.invalidate();
    Sound.play('buy');
    vibrate(20);
    Art.burst(Art.W / 2, Art.H * 0.3, 'confetti', 24);
    toast(msg, 'gold');
    showShop(true);
  }

  return {
    init, setMode, buildStation, renderCup, renderCups, tick, updateHUD, bumpCoins, pressIng, shakeIng, coinTarget,
    hint, toast, banner, showMenu, showShop, showGuests, showQuests, showSummary, queuePopups, pause, startShift,
    get modalOpen() { return modalOpen; },
    get overlayOpen() { return !el.overlay.classList.contains('hidden'); },
    closeModal,
  };
})();
