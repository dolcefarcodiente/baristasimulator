// Запуск игры: игровой цикл, ввод, клавиатура, сохранение при сворачивании.

(function () {
  loadSave();
  if (!S.settings.langChosen) S.settings.lang = 'en';
  setLang(S.settings.lang);
  Sound.setMusic(S.settings.music);
  Sound.setSfx(S.settings.sfx);
  UI.init();

  const wrap = document.getElementById('scene-wrap');
  const canvas = document.getElementById('scene');
  Art.resize();
  if (window.ResizeObserver) new ResizeObserver(() => Art.resize()).observe(wrap);
  else window.addEventListener('resize', () => Art.resize());

  // Небо в меню — по реальному времени суток
  function menuSky() {
    const d = new Date();
    const h = d.getHours() + d.getMinutes() / 60;
    if (h < 6 || h >= 22) return 1;
    return clamp((h - 7) / 14, 0, 1);
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
      busy: inShift ? { espresso: Shift.jobs.espresso.length, frother: Shift.jobs.frother.length } : {},
    });
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

  // Офлайн-режим и установка на телефон
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
