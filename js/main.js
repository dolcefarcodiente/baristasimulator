// Запуск игры: игровой цикл, ввод, клавиатура, сохранение при сворачивании.

(function () {
  loadSave();
  if (!S.settings.langChosen) S.settings.lang = 'en';
  setLang(S.settings.lang);
  Sound.setMusic(S.settings.music);
  Sound.setSfx(S.settings.sfx);
  UI.init();
  // Нарисованные фон и гости: когда фон загрузился и стёкла измерены — пересчитываем раскладку
  Sprites.load((n) => { if (Sprites.isBg(n)) Art.resize(); });

  const wrap = document.getElementById('scene-wrap');
  const canvas = document.getElementById('scene');
  Art.resize();
  // Пиксельный шрифт для холста: как только загрузится — перерисовываем меню на доске
  if (document.fonts && document.fonts.load) {
    Promise.all(['500 16px "Pixelify Sans"', '700 16px "Pixelify Sans"'].map((f) => document.fonts.load(f, 'Sälem АБВ'))).then(() => Art.invalidate()).catch(() => {});
  }
  // Насколько сцену нужно опустить под статус-бар: меряем env(safe-area-inset-top) через пробный элемент.
  // В приложении отступ становится известен не сразу, поэтому меряем ещё раз чуть позже и при повороте.
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:env(safe-area-inset-top, 0px);visibility:hidden;pointer-events:none';
  document.body.appendChild(probe);
  let safeTop = -1;
  const measureSafeTop = () => {
    const v = probe.getBoundingClientRect().height;
    if (v !== safeTop) { safeTop = v; Art.setSafeTop(v); }
  };
  measureSafeTop();
  setTimeout(measureSafeTop, 300); setTimeout(measureSafeTop, 1200);
  window.addEventListener('resize', measureSafeTop);
  if (window.ResizeObserver) {
    new ResizeObserver(() => Art.resize()).observe(wrap);
    new ResizeObserver(() => Bar.resize()).observe(document.getElementById('cups'));
  } else window.addEventListener('resize', () => { Art.resize(); Bar.resize(); });

  // Небо в меню — кофейня открыта с 18:00 до 02:00; днём за окном вечные сумерки перед открытием
  function menuSky() {
    const d = new Date();
    const h = d.getHours() + d.getMinutes() / 60;
    if (h >= 18) return (h - 18) / 8;
    if (h < 2) return (h + 6) / 8;
    return 0.12;
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    Shift.update(dt);
    Art.updateFx(dt);
    const inShift = Shift.active;
    Art.render({
      sky: inShift ? Shift.t / Shift.len : menuSky(),
      customers: inShift ? Shift.customers : [],
      cap: Stats.capacity(),
      cat: inShift ? Shift.cat : null,
      pointer: inShift ? Shift.pointer : null,
      shift: inShift,
      busy: inShift ? { espresso: Shift.jobs.espresso.length, frother: Shift.jobs.frother.length } : {},
    });
    if (inShift) Bar.render(dt);
    if (inShift && !Shift.paused) Talk.update(dt);
    UI.tick();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Касания сцены
  canvas.addEventListener('pointerdown', (e) => {
    Sound.init();
    const r = canvas.getBoundingClientRect();
    Shift.tap(e.clientX - r.left, e.clientY - r.top);
  });
  document.addEventListener('pointerdown', () => Sound.init(), { once: true });

  // Клавиатура (по физическим клавишам — работает и в русской раскладке)
  const ING_CODES = ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH'];
  const CUP_CODES = ['KeyZ', 'KeyX', 'KeyC'];
  document.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    Sound.init();
    if (Shift.active && !Shift.paused && !UI.modalOpen) {
      const ii = ING_CODES.indexOf(e.code);
      if (ii >= 0) {
        const ings = availableIngredients();
        if (ings[ii]) Shift.addIngredient(ings[ii]);
        return;
      }
      const ci = CUP_CODES.indexOf(e.code);
      if (ci >= 0) { Shift.selectCup(ci); return; }
      const d = /^Digit([1-4])$/.exec(e.code);
      if (d) { Shift.serveSlot(+d[1] - 1); return; }
      if (e.code === 'Backspace' || e.code === 'Delete') { e.preventDefault(); Shift.trash(); return; }
      if (e.code === 'Escape' || e.code === 'KeyP') { UI.pause(); return; }
    }
    if (e.code === 'Enter' || e.code === 'Space') {
      const primary = document.querySelector('#modal:not(.hidden) .btn.primary') || document.querySelector('#overlay:not(.hidden) .btn.primary');
      if (primary) { e.preventDefault(); primary.click(); }
    }
  });

  // Пауза и сохранение при сворачивании
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (Shift.active) UI.pause();
      persist();
      Sound.suspend();
    } else {
      Sound.resume();
    }
  });
  window.addEventListener('pagehide', persist);
  setInterval(() => { if (!Shift.active) persist(); }, 30000);

  // Старт
  const popups = Progress.boot();
  UI.showMenu();
  UI.queuePopups(popups);

  // В приложении: статус-бар поверх игры, светлые значки на ночной стене
  try {
    const SB = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.StatusBar;
    if (SB) { SB.setOverlaysWebView({ overlay: true }); SB.setStyle({ style: 'DARK' }); }
  } catch (e) { /* не в приложении */ }

  // Офлайн-режим и установка на телефон
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
