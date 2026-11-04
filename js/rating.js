// Рейтинг кофейни: каждый ушедший гость оставляет отзыв со звёздами. Рейтинг — среднее последних отзывов,
// от него зависит, сколько гостей приходит. Критик весит как пятеро.

// Тексты отзывов по числу звёзд; {d} — напиток
const REVIEWS = {
  5: { en: ['{d} was perfect. I’m coming back!', 'Best {d} in the city. Rain outside, warmth inside.', 'Cozy, quick, and the {d} — wow.', 'Five stars. The barista remembered my name.'],
       ru: ['{d} — идеально. Вернусь!', 'Лучший {d} в городе. Снаружи дождь, внутри тепло.', 'Уютно, быстро, а {d} — вау.', 'Пять звёзд. Бариста запомнил, как меня зовут.'] },
  4: { en: ['Great {d}, a little wait.', 'Lovely spot. The {d} was solid.', 'Nice music, nice {d}.'],
       ru: ['Отличный {d}, но чуть подождал.', 'Чудесное место. {d} — что надо.', 'Хорошая музыка, хороший {d}.'] },
  3: { en: ['The {d} was fine. Nothing special.', 'OK coffee, slow service.'],
       ru: ['{d} нормальный. Ничего особенного.', 'Кофе неплохой, обслуживают медленно.'] },
  2: { en: ['Waited too long for a simple {d}.', 'Cute place, but so slow.'],
       ru: ['Слишком долго ждал простой {d}.', 'Мило, но очень медленно.'] },
  1: { en: ['Left without my coffee.', 'Nobody served me. Never again.'],
       ru: ['Ушёл без кофе.', 'Меня так и не обслужили. Больше не приду.'] },
};
const GUEST_NAMES = ['Anna K.', 'Mike D.', 'Lena', 'Joe R.', 'Priya', 'Tom W.', 'Chloe', 'Sam', 'Nina P.', 'Diego', 'Kate M.', 'Omar'];

const Rating = (() => {
  const KEEP = 40;
  // начальные отзывы: новенькая кофейня — уверенные 4 звезды
  const prior = [{ s: 4, w: 3 }];

  function value() {
    const list = prior.concat(S.reviews || []);
    const sw = list.reduce((a, r) => a + r.w, 0);
    return list.reduce((a, r) => a + r.s * r.w, 0) / sw;
  }
  // 2.5★ — обычный поток гостей, 5★ — на 15% больше, 1★ — на 9% меньше
  const mult = () => 0.85 + 0.06 * value();

  // Отзыв гостя: быстро и идеально — 5, долго — меньше, ушёл без кофе — 1
  function add(cu, ok) {
    let s;
    if (!ok) s = cu.pat <= 0 ? 1 : 2;
    else {
      const f = clamp(cu.pat / cu.patMax, 0, 1);
      s = 3 + 2 * f + ({ perfect: 0.6, great: 0.3, good: 0 }[cu.q] || 0);
      s = clamp(Math.round(s), 2, 5);
    }
    const name = cu.reg ? T(REGULAR[cu.reg].name) : cu.kind ? T(SPECIAL[cu.kind].name) : pick(GUEST_NAMES);
    const drink = cu.firstOrder || 'latte';
    const review = { s, w: cu.kind === 'critic' ? 5 : 1, i: Math.floor(Math.random() * 4), d: drink, n: name, night: S.day };
    S.reviews = [...(S.reviews || []), review].slice(-KEEP);
  }

  function text(r) {
    const pool = REVIEWS[r.s][LANG] || REVIEWS[r.s].en;
    const tpl = pool[r.i % pool.length], d = T(RECIPE[r.d] ? RECIPE[r.d].name : 'coffee');
    return tpl.replace('{d}', tpl.startsWith('{d}') ? d : d.toLowerCase());
  }

  return { value, mult, add, text, fmt: () => value().toFixed(1) };
})();
