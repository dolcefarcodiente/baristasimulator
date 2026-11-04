// События ночи: сезонный напиток по календарю, ливень и особые гости — критик, туристы, полуночник.
// Что случится, решается в начале смены; Shift спрашивает отсюда множители и время появления гостей.

// Сезонные напитки: собираются из обычных ингредиентов, доступны только в свой сезон
const SEASONS = [
  { id: 'autumn', from: 1001, to: 1130, title: { ru: 'Осенний сезон', en: 'Autumn season' },
    drink: { id: 'pumpkinlatte', name: { ru: 'Тыквенный латте', en: 'Pumpkin spice latte' }, ings: ['espresso', 'milk', 'caramel', 'cinnamon'], price: 24 } },
  { id: 'winter', from: 1201, to: 106, title: { ru: 'Праздники', en: 'Holiday season' },
    drink: { id: 'gingerlatte', name: { ru: 'Имбирный латте', en: 'Gingerbread latte' }, ings: ['espresso', 'milk', 'cinnamon', 'cream'], price: 24 } },
  { id: 'valentine', from: 201, to: 214, title: { ru: 'Неделя влюблённых', en: "Valentine's week" },
    drink: { id: 'amore', name: { ru: 'Чоколата аморе', en: 'Cioccolata amore' }, ings: ['milk', 'chocolate', 'cream', 'vanilla'], price: 22 } },
  { id: 'summer', from: 601, to: 831, title: { ru: 'Лето', en: 'Summer' },
    drink: { id: 'shakerato', name: { ru: 'Кофе шакерато', en: 'Caffè shakerato' }, ings: ['espresso', 'espresso', 'ice', 'vanilla'], price: 20 } },
];
// сезонные напитки живут в общем справочнике рецептов, но не в меню магазина
SEASONS.forEach((s, i) => { RECIPE[s.drink.id] = { ...s.drink, cost: 0, seasonal: true, index: RECIPES.length + i }; });

// Особые гости
const SPECIAL = {
  critic: { sprite: 'critic', name: { ru: 'Критик Беллини', en: 'Critic Bellini' }, pay: 3, patience: 0.8 },
  tourists: { sprite: 'tourists', name: { ru: 'Туристы', en: 'Tourists' }, pay: 1.3, patience: 1.7 },
  owl: { name: { ru: 'Полуночник', en: 'Night owl' }, pay: 2, patience: 1.2 },
};

const Events = (() => {
  let night = null;

  function seasonNow() {
    const d = new Date(), md = (d.getMonth() + 1) * 100 + d.getDate();
    return SEASONS.find((s) => (s.from <= s.to ? md >= s.from && md <= s.to : md >= s.from || md <= s.to)) || null;
  }

  // Бросаем кубики на ночь
  function roll(len) {
    const season = S.day >= 3 ? seasonNow() : null;
    const downpour = S.day >= 2 && Art.rainK() > 0.8;
    night = {
      season,
      downpour,
      buzz: !!S.buzz,
      critic: S.day >= 3 && Math.random() < 0.35 ? { time: rand(0.3, 0.7) * len, done: false } : null,
      tourists: S.day >= 5 && Math.random() < 0.5 ? { time: rand(0.2, 0.75) * len, done: false } : null,
      owl: S.day >= 2 && Math.random() < 0.5 ? { done: false } : null,
      log: [],
    };
    S.buzz = 0;
    return night;
  }

  // Что сказать в начале смены
  function intro() {
    if (!night) return '';
    const parts = [];
    if (night.season) parts.push(t('evSeason', T(night.season.title), T(night.season.drink.name)));
    if (night.downpour) parts.push(t('evDownpour'));
    if (night.buzz) parts.push(t('evBuzz'));
    return parts.join(' · ');
  }

  return {
    roll, intro,
    get night() { return night; },
    clear() { night = null; },
    drinkId: () => (night && night.season ? night.season.drink.id : null),
    extraIngs: () => (night && night.season ? night.season.drink.ings : []),
    spawnMult: () => (night ? (night.downpour ? 1.3 : 1) * (night.buzz ? 1.2 : 1) : 1),
    patienceMult: () => (night && night.downpour ? 0.85 : 1),
    log: (line) => night && night.log.push(line),
  };
})();
