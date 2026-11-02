// Ежедневные задания, серия дней, достижения и доход ёжика-помощника.

const Progress = (() => {
  function dateStr(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function yesterdayStr() { const d = new Date(); d.setDate(d.getDate() - 1); return dateStr(d); }

  // ---------- задания ----------
  function questText(q) {
    switch (q.type) {
      case 'serve': return `Обслужи ${q.target} ${plural(q.target, 'гостя', 'гостей', 'гостей')}`;
      case 'drink': return `Приготовь ${RECIPE[q.drink].name.toLowerCase()} × ${q.target}`;
      case 'combo': return `Набери комбо из ${q.target} заказов`;
      case 'earn': return `Заработай ${fmt(q.target)} за одну смену`;
      case 'regular': return `Угости постоянных гостей ${q.target} ${plural(q.target, 'раз', 'раза', 'раз')}`;
      case 'memory': return `Вспомни заказ постоянного гостя ${q.target} ${plural(q.target, 'раз', 'раза', 'раз')}`;
      case 'perfect': return 'Смена, в которой никто не ушёл без кофе';
      case 'stars': return 'Получи 3 звезды за смену';
    }
    return '';
  }

  function makeQuests() {
    const day = S.day;
    const k = 1 + Math.min(day, 20) * 0.12;
    const pool = [
      { type: 'serve', target: Math.min(40, 12 + day * 2), reward: 60 },
      { type: 'drink', drink: pick(S.recipes.filter((r) => r !== 'espresso').concat(['latte'])), target: randi(5, 9), reward: 70 },
      { type: 'combo', target: Math.min(20, 5 + Math.floor(day * 0.8)), reward: 80 },
      { type: 'earn', target: Math.round(dayTarget(day) * 0.8 / 10) * 10, reward: 80 },
      { type: 'perfect', target: 1, reward: 90 },
      { type: 'stars', target: 1, reward: 90 },
    ];
    if (REGULARS.some(regularEligible)) pool.push({ type: 'regular', target: randi(2, 3), reward: 90 });
    if (REGULARS.some((r) => regularEligible(r) && regState(r.id).visits > 0)) pool.push({ type: 'memory', target: 2, reward: 100 });
    const list = [];
    while (list.length < 3 && pool.length) {
      const q = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      list.push({ ...q, reward: Math.round(q.reward * k / 5) * 5, progress: 0, done: false, claimed: false });
    }
    S.quests = { date: dateStr(), list, bonusClaimed: false };
  }

  function bump(q, value, mode = 'add') {
    if (q.done) return;
    q.progress = mode === 'max' ? Math.max(q.progress, value) : q.progress + value;
    if (q.progress >= q.target) {
      q.progress = q.target;
      q.done = true;
      UI.toast(`✅ Задание выполнено: ${questText(q)}`);
      Sound.play('buy');
    }
  }

  function quests() {
    if (!S.quests || S.quests.date !== dateStr()) makeQuests();
    return S.quests.list;
  }

  function onServe(e) {
    for (const q of quests()) {
      if (q.type === 'serve' && e.guestDone) bump(q, 1);
      if (q.type === 'drink' && q.drink === e.recipe) bump(q, 1);
      if (q.type === 'combo') bump(q, e.combo, 'max');
      if (q.type === 'earn') bump(q, e.earned, 'max');
      if (q.type === 'regular' && e.regular) bump(q, 1);
      if (q.type === 'memory' && e.memory) bump(q, 1);
    }
    check();
  }

  function onShiftEnd(e) {
    for (const q of quests()) {
      if (q.type === 'perfect' && e.missed === 0 && e.served >= 5) bump(q, 1);
      if (q.type === 'stars' && e.stars === 3) bump(q, 1);
    }
    check();
  }

  function claim(i) {
    const q = quests()[i];
    if (!q || !q.done || q.claimed) return 0;
    q.claimed = true;
    S.coins += q.reward;
    persist();
    return q.reward;
  }

  const allBonus = () => Math.round((100 + S.day * 15) / 10) * 10;
  function claimBonus() {
    const list = quests();
    if (S.quests.bonusClaimed || !list.every((q) => q.claimed)) return 0;
    S.quests.bonusClaimed = true;
    const b = allBonus();
    S.coins += b;
    persist();
    return b;
  }

  function unclaimed() {
    const list = quests();
    let n = list.filter((q) => q.done && !q.claimed).length;
    if (!S.quests.bonusClaimed && list.every((q) => q.claimed)) n++;
    return n;
  }

  function msToReset() {
    const d = new Date(); d.setHours(24, 0, 0, 0);
    return d - Date.now();
  }

  // ---------- достижения ----------
  function check() {
    for (const a of ACHIEVEMENTS) {
      if (S.ach[a.id] || !a.check(S)) continue;
      S.ach[a.id] = Date.now();
      S.coins += a.reward;
      UI.toast(`🏆 ${a.name} · +${a.reward}`, 'gold');
      Sound.play('buy');
    }
  }

  // ---------- при запуске: ёжик и серия ----------
  function boot() {
    const popups = [];
    const rate = Stats.helperRate();
    if (rate > 0) {
      const hrs = Math.min(8, (Date.now() - (S.lastSeen || Date.now())) / 3.6e6);
      const coins = Math.floor(rate * hrs);
      if (coins >= 1) {
        S.coins += coins;
        popups.push({
          icon: '🦔', title: 'Пока тебя не было…',
          body: `Ёжик Пых варил кофе ${hrs >= 1 ? Math.floor(hrs) + ' ' + plural(Math.floor(hrs), 'час', 'часа', 'часов') : 'немного'} и заработал`,
          coins, note: hrs >= 8 ? 'Ёжик устаёт через 8 часов — заходи почаще!' : '',
        });
      }
    }
    const today = dateStr();
    if (S.streak.last === null) {
      S.streak = { last: today, count: 1 };
      popups.push({ icon: '☕', title: 'Добро пожаловать в «Пенку»!', coins: 0,
        body: 'Это твоя маленькая кофейня. Готовь напитки, знакомься с гостями и заходи каждый день — будут подарки.', note: '' });
    } else if (S.streak.last !== today) {
      S.streak.count = S.streak.last === yesterdayStr() ? S.streak.count + 1 : 1;
      S.streak.last = today;
      const n = S.streak.count;
      const reward = Math.round((20 + 15 * Math.min(n, 7)) * (1 + Math.min(S.day, 30) / 15) / 5) * 5;
      S.coins += reward;
      popups.push({ icon: '🔥', title: n > 1 ? `Серия: ${n} ${plural(n, 'день', 'дня', 'дней')} подряд!` : 'С возвращением!', streak: n, coins: reward,
        body: n > 1 ? 'Ты заходишь каждый день — награда растёт' : 'Заходи завтра — награда будет больше', note: '' });
    }
    quests();
    check();
    persist();
    return popups;
  }

  return { quests, questText, onServe, onShiftEnd, claim, claimBonus, allBonus, unclaimed, msToReset, check, boot };
})();
