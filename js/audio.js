// Звуки и музыка — всё синтезируется через Web Audio, без внешних файлов.

const Sound = (() => {
  let ac = null, master, sfxBus, musicBus, noiseBuf, crackle = null, rain = null;
  let musicOn = true, sfxOn = true;
  let schedTimer = null, nextTime = 0, step = 0;

  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
    sfxBus = ac.createGain(); sfxBus.gain.value = sfxOn ? 0.7 : 0; sfxBus.connect(master);
    musicBus = ac.createGain(); musicBus.gain.value = 0; musicBus.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    if (musicOn) startMusic();
  }

  function tone(freq, dur, o = {}) {
    if (!ac) return;
    const t = ac.currentTime + (o.when || 0);
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
    const vol = o.vol ?? 0.25, att = o.attack ?? 0.005;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + att);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = osc;
    if (o.lp) {
      const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp;
      osc.connect(f); node = f;
    }
    node.connect(g); g.connect(o.dest || sfxBus);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  function noise(dur, o = {}) {
    if (!ac) return;
    const t = ac.currentTime + (o.when || 0);
    const src = ac.createBufferSource(); src.buffer = noiseBuf;
    src.playbackRate.value = o.rate || 1;
    const f = ac.createBiquadFilter(); f.type = o.filter || 'lowpass';
    f.frequency.setValueAtTime(o.freq || 1200, t);
    if (o.slide) f.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
    f.Q.value = o.q || 1;
    const g = ac.createGain();
    const vol = o.vol ?? 0.15;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + (o.attack ?? 0.02));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(o.dest || sfxBus);
    src.start(t, Math.random()); src.stop(t + dur + 0.05);
  }

  const sfx = {
    tap() { tone(720, 0.06, { type: 'triangle', vol: 0.12 }); },
    ui() { tone(520, 0.08, { type: 'triangle', vol: 0.12, slide: 820 }); },
    grind() { noise(0.4, { filter: 'bandpass', freq: 700, q: 3, vol: 0.12 }); tone(110, 0.35, { type: 'sawtooth', vol: 0.03, lp: 400 }); },
    brewDone() { noise(0.35, { freq: 500, slide: 1500, vol: 0.18 }); tone(320, 0.12, { vol: 0.12, slide: 180, when: 0.2 }); },
    steam() { noise(0.65, { filter: 'bandpass', freq: 4200, q: 1.2, vol: 0.09, attack: 0.08 }); },
    steamDone() { tone(660, 0.1, { type: 'triangle', vol: 0.08 }); },
    drip() { [0, 0.18, 0.4, 0.55].forEach((w) => tone(rand(700, 950), 0.09, { vol: 0.08, slide: 400, when: w })); noise(0.8, { freq: 600, vol: 0.05, attack: 0.1 }); },
    pour() { noise(0.22, { freq: 900, slide: 1800, vol: 0.14 }); tone(480, 0.1, { vol: 0.08, slide: 340, when: 0.08 }); },
    ice() { tone(2400, 0.07, { type: 'triangle', vol: 0.08 }); tone(3100, 0.06, { type: 'triangle', vol: 0.06, when: 0.06 }); },
    plop() { tone(380, 0.12, { vol: 0.15, slide: 200 }); },
    busy() { tone(170, 0.09, { type: 'square', vol: 0.06, lp: 900 }); tone(150, 0.09, { type: 'square', vol: 0.06, lp: 900, when: 0.1 }); },
    trash() { noise(0.25, { freq: 400, slide: 150, vol: 0.18 }); },
    ding() {
      tone(1568, 0.6, { vol: 0.18 }); tone(2093, 0.7, { vol: 0.12, when: 0.07 });
      tone(1200, 0.07, { type: 'square', vol: 0.03, slide: 1800, when: 0.02 });
    },
    coin() { tone(1320, 0.08, { type: 'square', vol: 0.025 }); tone(1760, 0.12, { type: 'square', vol: 0.025, when: 0.06 }); },
    wrong() { tone(240, 0.16, { type: 'square', vol: 0.07, lp: 1200 }); tone(180, 0.24, { type: 'square', vol: 0.07, lp: 1200, when: 0.15 }); },
    leave() { tone(420, 0.4, { type: 'sawtooth', vol: 0.05, slide: 200, lp: 1000 }); },
    door() { tone(1318, 0.5, { type: 'triangle', vol: 0.08 }); tone(1046, 0.6, { type: 'triangle', vol: 0.08, when: 0.14 }); },
    combo(level) {
      const base = 72 + level * 2;
      [0, 4, 7, 12].forEach((n, i) => tone(midi(base + n), 0.22, { type: 'triangle', vol: 0.12, when: i * 0.06 }));
    },
    buy() { [0, 4, 7, 12, 16].forEach((n, i) => tone(midi(67 + n), 0.25, { type: 'triangle', vol: 0.1, when: i * 0.05 })); },
    star(i) { tone(midi(76 + i * 4), 0.5, { vol: 0.16 }); tone(midi(88 + i * 4), 0.4, { vol: 0.06, when: 0.03 }); },
    meow() { tone(700, 0.35, { type: 'triangle', vol: 0.09, slide: 1050, lp: 2500 }); tone(1000, 0.25, { type: 'triangle', vol: 0.07, slide: 600, when: 0.25, lp: 2500 }); },
    story() { [0, 7, 12].forEach((n, i) => tone(midi(79 + n), 0.6, { vol: 0.08, when: i * 0.12 })); },
    open() { [0, 4, 7].forEach((n, i) => tone(midi(72 + n), 0.5, { type: 'triangle', vol: 0.09, when: i * 0.09 })); sfx.door(); },
    perfect() { [0, 7, 12, 19].forEach((n, i) => tone(midi(76 + n), 0.18, { type: 'triangle', vol: 0.09, when: i * 0.04 })); },
    // «голос» печатающегося текста в диалоге — тихий короткий щелчок
    blip() { tone(midi(rand(72, 76) | 0), 0.04, { type: 'square', vol: 0.025, lp: 2200 }); },
    // далёкий раскат грома: низкий шум, медленно гаснущий
    thunder() { noise(2.8, { freq: 420, slide: 70, vol: 0.32, attack: 0.15, rate: 0.5 }); noise(1.6, { freq: 900, slide: 120, vol: 0.12, attack: 0.03, when: 0.05 }); },
    close() { [7, 4, 0].forEach((n, i) => tone(midi(72 + n), 0.5, { type: 'triangle', vol: 0.09, when: i * 0.12 })); },
  };

  function play(name, arg) {
    if (!ac || !sfxOn) return;
    try { sfx[name] && sfx[name](arg); } catch (e) { /* звук не обязателен */ }
  }

  // ---------- lo-fi музыка ----------
  const BPM = 72, BEAT = 60 / BPM;
  // Fmaj7 – Em7 – Dm7 – Cmaj7
  const CHORDS = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]];
  const BASS = [41, 40, 38, 36];

  function ep(m, t, dur, vol) {
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1300;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(vol * 0.5, t + 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    f.connect(g); g.connect(musicBus);
    [['triangle', 1, 0], ['sine', 2, -6]].forEach(([type, mul, det]) => {
      const o = ac.createOscillator(); o.type = type;
      o.frequency.value = midi(m) * mul; o.detune.value = det + rand(-4, 4);
      o.connect(f); o.start(t); o.stop(t + dur + 0.05);
    });
  }

  function drum(kind, t) {
    if (kind === 'kick') {
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
      g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      o.connect(g); g.connect(musicBus); o.start(t); o.stop(t + 0.32);
    } else {
      const src = ac.createBufferSource(); src.buffer = noiseBuf;
      const f = ac.createBiquadFilter();
      const g = ac.createGain();
      const snare = kind === 'snare';
      f.type = snare ? 'bandpass' : 'highpass'; f.frequency.value = snare ? 1800 : 7000; f.Q.value = snare ? 0.8 : 0.5;
      const vol = snare ? 0.12 : 0.035, len = snare ? 0.18 : 0.05;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      src.connect(f); f.connect(g); g.connect(musicBus);
      src.start(t, Math.random()); src.stop(t + len + 0.02);
    }
  }

  function scheduleStep(s, t) {
    const bar = Math.floor(s / 8) % 4, sub = s % 8;
    const chord = CHORDS[bar];
    if (sub === 0) chord.forEach((m, i) => ep(m, t + i * 0.025, BEAT * 3.8, 0.045));
    if (sub === 0 || sub === 5) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = midi(BASS[bar]);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + BEAT * 1.6);
      o.connect(g); g.connect(musicBus); o.start(t); o.stop(t + BEAT * 1.7);
    }
    if (sub === 0 || sub === 5) drum('kick', t);
    if (sub === 2 || sub === 6) drum('snare', t);
    const swing = sub % 2 ? BEAT * 0.08 : 0;
    drum('hat', t + swing);
    if (Math.random() < 0.22 && sub % 2 === 0) {
      const m = pick(chord) + 24;
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = midi(m);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.035, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      o.connect(g); g.connect(musicBus); o.start(t); o.stop(t + 1.5);
    }
  }

  function startCrackle() {
    if (crackle) return;
    const len = ac.sampleRate * 3;
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * 0.015;
      if (Math.random() < 0.0004) d[i] = (Math.random() * 2 - 1) * 0.6;
    }
    const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 3500;
    const g = ac.createGain(); g.gain.value = 0.5;
    src.connect(f); f.connect(g); g.connect(musicBus); src.start();
    crackle = src;
  }

  // Дождь за окном: шум, приглушённый стеклом, и редкие капли по подоконнику
  function startRain() {
    if (rain) return;
    const len = ac.sampleRate * 4;
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    let b = 0;
    for (let i = 0; i < len; i++) {
      b = b * 0.97 + (Math.random() * 2 - 1) * 0.03; // мягкий «розовый» шум
      d[i] = b * 2.2 + (Math.random() * 2 - 1) * 0.05;
      if (Math.random() < 0.00025) for (let k = 0; k < 220 && i + k < len; k++) d[i + k] += Math.sin(k * 0.9) * Math.exp(-k / 40) * 0.35;
    }
    const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2400;
    const g = ac.createGain(); g.gain.value = 0.2;
    src.connect(f); f.connect(g); g.connect(musicBus); src.start();
    rain = src;
  }

  function startMusic() {
    if (!ac) return;
    musicBus.gain.cancelScheduledValues(ac.currentTime);
    musicBus.gain.setTargetAtTime(0.55, ac.currentTime, 0.8);
    startCrackle();
    startRain();
    if (schedTimer) return;
    nextTime = ac.currentTime + 0.1;
    schedTimer = setInterval(() => {
      while (nextTime < ac.currentTime + 0.3) {
        scheduleStep(step, nextTime);
        nextTime += BEAT / 2; step++;
      }
    }, 60);
  }

  function stopMusic() {
    if (!ac) return;
    musicBus.gain.setTargetAtTime(0, ac.currentTime, 0.3);
    setTimeout(() => {
      if (musicOn) return;
      clearInterval(schedTimer); schedTimer = null;
      if (crackle) { crackle.stop(); crackle = null; }
      if (rain) { rain.stop(); rain = null; }
    }, 1200);
  }

  return {
    init, play,
    setMusic(on) { musicOn = on; if (!ac) return; on ? startMusic() : stopMusic(); },
    setSfx(on) { sfxOn = on; if (sfxBus) sfxBus.gain.value = on ? 0.7 : 0; },
    suspend() { if (ac && ac.state === 'running') ac.suspend(); },
    resume() { if (ac && ac.state === 'suspended') ac.resume(); },
  };
})();

// В приложении (Capacitor) вибрация идёт через Haptics, в браузере — через navigator.vibrate
function vibrate(ms) {
  try {
    const H = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics;
    if (H) {
      const strong = Array.isArray(ms) || ms >= 20;
      H.impact({ style: strong ? 'MEDIUM' : 'LIGHT' });
    } else if (navigator.vibrate) navigator.vibrate(ms);
  } catch (e) { /* нет вибрации */ }
}
