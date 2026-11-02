// Интерфейс: рабочее место бариста, HUD, меню, магазин, гости, задания, итоги смены, всплывашки.

const UI = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const el = {};
  const ING_KEYS = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H'];
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
    applyLang();
  }

  function applyLang() {
    el.trash.setAttribute('aria-label', t('pourOut'));
  }

  function setMode(mode) {
    el.app.classList.toggle('in-shift', mode === 'shift');
    el.hud.classList.toggle('hidden', mode !== 'shift');
    el.station.classList.toggle('hidden', mode !== 'shift');
  }

  // ---------- рабочее место ----------
  function buildStation() {
    el.cups.innerHTML = Shift.cups.map((_, i) => `
      <button class="cup-slot" data-cup="${i}" aria-label="${t('cup', i + 1)}">
        <div class="cup"><div class="cup-handle"></div><div class="cup-body"><div class="fill"></div></div></div>
        <div class="cup-label"></div>${Shift.cups.length > 1 ? `<span class="key">${CUP_KEYS[i]}</span>` : ''}
      </button>`).join('');
    let k = 0;
    el.ings.innerHTML = availableTools().map((tl) => {
      const slots = tl.machine ? Stats.slots(tl.machine) : 0;
      const dots = slots ? `<span class="slots">${'<i class="dot"></i>'.repeat(slots)}</span>` : '';
      const btns = tl.ings.map((id) => `<button class="ing" data-ing="${id}">${iconSvg(id)}<span class="ing-name">${T(INGREDIENTS[id].name)}</span><span class="key">${ING_KEYS[k++] || ''}</span></button>`).join('');
      return `<div class="tool tool-${tl.id}"${tl.machine ? ` data-machine="${tl.machine}"` : ''}>
        <div class="tool-head">${iconSvg(tl.icon)}<span>${T(tl.name)}</span>${dots}</div>
        <div class="tool-btns">${btns}</div>
      </div>`;
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
    const rec = recipeFor(Shift.cupItems(cup));
    label.classList.remove('match');
    if (!cup.layers.length) label.textContent = Shift.cups.length > 1 && i === Shift.sel ? t('selected') : '';
    else if (!Shift.cupReady(cup)) label.textContent = t('brewing');
    else if (rec && S.recipes.includes(rec.id)) { label.textContent = T(rec.name) + ' ✓'; label.classList.add('match'); }
    else label.textContent = t('custom');
  }

  function tick() {
    if (!Shift.active) return;
    // индикаторы загрузки оборудования
    el.ings.querySelectorAll('.tool[data-machine]').forEach((tool) => {
      const key = tool.dataset.machine;
      const jobs = Shift.jobs[key];
      tool.querySelectorAll('.dot').forEach((d, k) => d.style.setProperty('--p', jobs[k] ? clamp(jobs[k].t / jobs[k].dur, 0, 1) : 0));
      tool.classList.toggle('busy', jobs.length >= Stats.slots(key));
      tool.classList.toggle('working', jobs.length > 0);
    });
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
    el.timeVal.textContent = Shift.closing ? t('closed') : `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    el.time.classList.toggle('warn', !Shift.closing && left <= 20);
  }

  function updateHUD() {
    el.coinsVal.textContent = fmt(Shift.earned);
    const m = comboMult(Shift.combo);
    el.combo.innerHTML = `${iconSvg('ui_flame', 'flame')}<b>×${m}</b><small>${Shift.combo}</small>`;
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
    if (sel) { const tg = $(sel); if (tg) tg.classList.add('pulse'); }
    if (autoHide) hintState.timer = setTimeout(() => hint(null), autoHide);
  }

  function toast(html, kind = '') {
    for (const tt of el.toasts.children) if (tt.dataset.msg === html) return;
    while (el.toasts.children.length >= 3) el.toasts.firstChild.remove();
    const d = document.createElement('div');
    d.className = 'toast ' + kind;
    d.dataset.msg = html;
    d.innerHTML = html;
    el.toasts.appendChild(d);
    setTimeout(() => d.classList.add('out'), kind === 'long' ? 4200 : 2400);
    setTimeout(() => d.remove(), kind === 'long' ? 4600 : 2800);
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
    for (const r of RECIPES) if (!S.recipes.includes(r.id)) opts.push({ name: T(r.name), cost: r.cost });
    for (const u of UPGRADES) if (!upMaxed(u.id)) opts.push({ name: T(u.name), cost: upCost(u.id) });
    opts.sort((a, b) => a.cost - b.cost);
    return opts[0] || null;
  }

  function settingsButtons() {
    return `<button class="icon-btn ${S.settings.music ? '' : 'off'}" data-act="music" aria-label="${t('music')}">${iconSvg('ui_music')}</button>
      <button class="icon-btn ${S.settings.sfx ? '' : 'off'}" data-act="sfx" aria-label="${t('sounds')}">${iconSvg('ui_sound')}</button>
      <button class="icon-btn lang" data-act="lang" aria-label="${t('language')}">${LANG === 'ru' ? 'RU' : 'EN'}</button>`;
  }

  function showMenu() {
    setMode('menu');
    const unclaimed = Progress.unclaimed();
    const goal = nextGoal();
    const goalHtml = goal
      ? (S.coins >= goal.cost
        ? `<div class="teaser ready">${t('canBuy', goal.name)}</div>`
        : `<div class="teaser">${t('soon', goal.name, coin(goal.cost - S.coins))}</div>`)
      : '';
    openPanel(`
      <div class="menu">
        <div class="brand">
          <span class="eyebrow">${t('dayEyebrow', S.day)}</span>
          <h1 class="logo">${t('brand')}</h1>
          <p class="tagline">${t('tagline')}</p>
        </div>
        <div class="stats">
          <div class="stat">${coin(S.coins)}</div>
          <div class="stat">${iconSvg('ui_flame', 'ico')}${t('streak', S.streak.count)}</div>
        </div>
        <button class="btn primary big" data-act="start">${t('open')}</button>
        <p class="note">${t('goal', coin(dayTarget(S.day)))}</p>
        ${goalHtml}
        <div class="tiles">
          <button class="btn tile" data-act="shop">${iconSvg('ui_shop', 'tile-ico')}${t('upgrades')}${canAffordSomething() ? '<i class="badge">!</i>' : ''}</button>
          <button class="btn tile" data-act="guests">${iconSvg('ui_regulars', 'tile-ico')}${t('guests')}</button>
          <button class="btn tile" data-act="quests">${iconSvg('ui_todo', 'tile-ico')}${t('quests')}${unclaimed ? `<i class="badge">${unclaimed}</i>` : ''}</button>
        </div>
        <div class="menu-foot">
          ${settingsButtons()}
          <span class="muted">${Stats.helperRate() ? t('hedgehog', Stats.helperRate()) : t('best', coin(S.stats.bestShift))}</span>
        </div>
      </div>`, 'sheet menu-sheet');
  }

  function sheetHead(title) {
    return `<div class="sheet-head"><button class="btn small" data-act="menu">${t('back')}</button><h2>${title}</h2><span class="chip">${coin(S.coins)}</span></div>`;
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
          <div class="card-ico">${iconSvg(u.icon)}</div>
          <div class="card-body"><b>${T(u.name)}</b><div class="pips">${pips}</div>
            <small>${maxed ? u.desc(cur) : `${u.desc(cur)}<br><span class="next">→ ${u.desc(u.values[lvl + 1])}</span>`}</small></div>
          ${maxed ? `<span class="maxed">${t('max')}</span>` : `<button class="btn buy${afford ? ' green' : ''}" data-act="buy-up" data-id="${u.id}" ${afford ? '' : 'disabled'}>${coin(u.costs[lvl])}</button>`}
        </div>`;
      }).join('');
    } else {
      cards = RECIPES.map((r) => {
        const owned = S.recipes.includes(r.id);
        const afford = !owned && S.coins >= r.cost;
        const fan = REGULARS.find((g) => g.fav === r.id);
        return `<div class="card${afford ? ' can' : ''}${owned ? ' owned' : ''}">
          <div class="card-ico recipe-ico">${r.ings.map((i) => iconSvg(i)).join('')}</div>
          <div class="card-body"><b>${T(r.name)}</b>
            <small>${r.ings.map((i) => T(INGREDIENTS[i].name).toLowerCase()).join(' + ')}<br>${t('price', coin(Math.round(r.price * Stats.priceMult())))}${fan ? ` · ${t('loves', T(fan.name))}` : ''}</small></div>
          ${owned ? `<span class="maxed">${t('onMenu')}</span>` : `<button class="btn buy${afford ? ' green' : ''}" data-act="buy-rec" data-id="${r.id}" ${afford ? '' : 'disabled'}>${coin(r.cost)}</button>`}
        </div>`;
      }).join('');
    }
    openPanel(`${sheetHead(t('upgrades'))}
      <div class="tabs">
        <button class="tab ${shopTab === 'up' ? 'on' : ''}" data-act="tab" data-tab="up">${t('equipment')}</button>
        <button class="tab ${shopTab === 'rec' ? 'on' : ''}" data-act="tab" data-tab="rec">${t('recipes')}</button>
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
      if (S.day < g.minDay) sub = t('arrivesDay', g.minDay);
      else if (!S.recipes.includes(g.fav)) sub = t('needsRecipe', T(RECIPE[g.fav].name));
      else if (!met) sub = t('comingSoon');
      else sub = t('favorite', T(RECIPE[g.fav].name));
      const hearts = Array.from({ length: MAX_HEARTS }, (_, i) => `<i class="${i < st.hearts ? 'on' : ''}">♥</i>`).join('');
      let stories = '';
      if (met) {
        let teaser = false;
        T(g.story).forEach((text, i) => {
          if (st.hearts >= STORY_HEARTS[i]) stories += `<p class="story">«${text}»</p>`;
          else if (!teaser) { teaser = true; stories += `<p class="story locked">${t('nextStory', STORY_HEARTS[i])}</p>`; }
        });
      }
      return `<div class="guest${met ? '' : ' locked'}">
        <canvas class="portrait" data-guest="${g.id}"></canvas>
        <div class="guest-body">
          <b>${met || eligible ? T(g.name) : '???'}</b>
          <div class="hearts">${hearts}</div>
          <small>${sub}</small>
          ${stories}
          <div class="perk${st.hearts >= MAX_HEARTS ? ' on' : ''}">${t('gift', st.hearts >= MAX_HEARTS ? T(g.perk.text) : t('giftAt', MAX_HEARTS))}</div>
        </div>
      </div>`;
    }).join('');
    openPanel(`${sheetHead(t('guests'))}
      <p class="muted center">${t('guestsIntro')}</p>
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
    const week = Array.from({ length: 7 }, (_, i) => `<i class="${i < ((n - 1) % 7) + 1 ? 'on' : ''}"></i>`).join('');
    const qcards = list.map((q, i) => `
      <div class="quest${q.claimed ? ' claimed' : ''}">
        <div class="quest-body"><b>${Progress.questText(q)}</b>
          <div class="bar"><div style="width:${(q.progress / q.target) * 100}%"></div></div>
          <small>${q.type === 'earn' ? fmt(q.progress) + ' / ' + fmt(q.target) : q.progress + ' / ' + q.target}</small></div>
        ${q.claimed ? '<span class="maxed">✓</span>' : `<button class="btn buy${q.done ? ' green' : ''}" data-act="claim" data-i="${i}" ${q.done ? '' : 'disabled'}>${coin(q.reward)}</button>`}
      </div>`).join('');
    const allClaimed = list.every((q) => q.claimed);
    const bonus = `<div class="quest bonus${S.quests.bonusClaimed ? ' claimed' : ''}">
      <div class="quest-body"><b>${t('allQuests')}</b><small>${t('allQuestsHint')}</small></div>
      ${S.quests.bonusClaimed ? '<span class="maxed">✓</span>' : `<button class="btn buy${allClaimed ? ' green' : ''}" data-act="bonus" ${allClaimed ? '' : 'disabled'}>${coin(Progress.allBonus())}</button>`}
    </div>`;
    const got = ACHIEVEMENTS.filter((a) => S.ach[a.id]).length;
    const ach = ACHIEVEMENTS.map((a) => `<div class="ach${S.ach[a.id] ? ' on' : ''}"><span class="pin"></span><b>${T(a.name)}</b><small>${T(a.desc)}</small><small class="rw">${coin(a.reward)}</small></div>`).join('');
    openPanel(`${sheetHead(t('quests'))}
      <div class="streak">${iconSvg('ui_flame', 'streak-ico')}<div><b>${t('streak', n)}</b><small>${t('streakHint')}</small></div><div class="week">${week}</div></div>
      <div class="section-title"><h3 class="eyebrow">${t('today')}</h3><small>${t('newIn', h, m)}</small></div>
      <div class="cards">${qcards}${bonus}</div>
      <div class="section-title"><h3 class="eyebrow">${t('achievements')}</h3><small>${t('ofTotal', got, ACHIEVEMENTS.length)}</small></div>
      <div class="ach-grid">${ach}</div>`, 'sheet tall');
  }

  function showSummary(r) {
    setMode('menu');
    const stories = r.stories.map((s) => {
      const g = REGULAR[s.id];
      return `<div class="story-card"><canvas class="portrait" data-guest="${g.id}"></canvas><div><b>${T(g.name)}</b><p>«${T(g.story)[s.idx]}»</p></div></div>`;
    }).join('');
    openPanel(`
      <div class="summary">
        <span class="eyebrow">${t('dayEyebrow', r.day)}</span>
        <h2 class="hand">${t('shiftOver')}</h2>
        <div class="stars">${[0, 1, 2].map((i) => `<span class="star" data-star="${i}">★</span>`).join('')}</div>
        <div class="earn"><span class="coin"></span><span id="earn-num">0</span></div>
        <div class="target"><div class="tbar"><div class="tfill" id="tfill"></div><i style="left:40%"></i><i style="left:70%"></i></div><small>${t('target', fmt(r.target))}</small></div>
        ${r.record ? `<div class="record">${t('record')}</div>` : ''}
        <div class="stat-grid">
          <div><b>${r.served}</b><span>${t('guestsN', r.served)}</span></div>
          <div><b>${r.maxCombo}</b><span>${t('bestCombo')}</span></div>
          <div><b>${r.missed}</b><span>${t('leftNoCoffee')}</span></div>
        </div>
        ${r.bonus ? `<div class="bonus-line">${t('starBonus', coin(r.bonus))}</div>` : ''}
        ${stories ? `<h3 class="eyebrow">${t('newStories')}</h3>${stories}` : ''}
        <button class="btn primary big" data-act="menu">${t('next')}</button>
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
        el.panel.querySelector(`[data-star="${lit}"]`).classList.add('on');
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
    const week = p.streak ? `<div class="week big">${Array.from({ length: 7 }, (_, i) => `<i class="${i < ((p.streak - 1) % 7) + 1 ? 'on' : ''}"></i>`).join('')}</div>` : '';
    openModal(`
      <div class="pop-ico">${iconSvg(p.icon)}</div>
      <h2>${p.title}</h2>
      <p>${p.body}</p>
      ${week}
      ${p.coins ? `<div class="pop-coins">+${coin(p.coins)}</div>` : ''}
      ${p.note ? `<small class="muted">${p.note}</small>` : ''}
      <button class="btn primary big" data-act="popup-ok">${p.coins ? t('collect') : t('letsGo')}</button>`);
  }

  function pause() {
    if (!Shift.active || Shift.paused) return;
    Shift.paused = true;
    openModal(`
      <div class="pop-ico">${iconSvg('logo')}</div><h2>${t('pause')}</h2>
      <p>${t('pauseHint')}</p>
      <div class="row">${settingsButtons()}</div>
      <button class="btn primary big" data-act="resume">${t('resume')}</button>
      <button class="btn small ghost" data-act="quit">${t('endShift')}</button>`);
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
    banner(t('opened', S.day));
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
        afterBuy(`${T(UPGRADE[id].name)} — ${t('level', upLevel(id))}`);
        return;
      }
      case 'buy-rec': {
        const r = RECIPE[b.dataset.id];
        if (S.recipes.includes(r.id) || S.coins < r.cost) return;
        S.coins -= r.cost;
        S.recipes.push(r.id);
        const newIngs = [...new Set(r.ings)].filter((i) => !RECIPES.some((x) => x.id !== r.id && S.recipes.includes(x.id) && x.ings.includes(i)));
        afterBuy(t('newRecipe', T(r.name)) + (newIngs.length ? t('newIng', newIngs.map((i) => T(INGREDIENTS[i].name).toLowerCase()).join(', ')) : ''));
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
      case 'lang':
        S.settings.lang = LANG === 'ru' ? 'en' : 'ru';
        setLang(S.settings.lang); persist(); applyLang(); Art.invalidate(); Sound.play('tap');
        if (Shift.active) { closeModal(); buildStation(); updateHUD(); Shift.paused = false; pause(); }
        else showMenu();
        return;
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
