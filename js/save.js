// Сохранение прогресса и вычисление итоговых характеристик кофейни.
// Хранилище спрятано за Storage, чтобы в приложении для App Store легко заменить его на нативное.

const SAVE_KEY = 'penka-save-v1';

const Storage = {
  get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
  set(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* хранилище недоступно */ } },
};

function defaultSave() {
  return {
    v: 1,
    coins: 0,
    day: 1,
    upgrades: {},
    recipes: ['espresso', 'americano', 'latte'],
    regulars: {},
    quests: null,
    streak: { last: null, count: 0 },
    ach: {},
    stats: { served: 0, drinks: {}, bestCombo: 0, bestShift: 0, threeStars: 0, catPets: 0, memory: 0, regularServes: 0, shifts: 0, stars: 0 },
    lastSeen: Date.now(),
    settings: { music: true, sfx: true, lang: null },
    tips: {},
  };
}

function deepMerge(base, over) {
  for (const k of Object.keys(over)) {
    const b = base[k], o = over[k];
    if (b && o && typeof b === 'object' && typeof o === 'object' && !Array.isArray(b) && !Array.isArray(o)) deepMerge(b, o);
    else base[k] = o;
  }
  return base;
}

let S = defaultSave();

function loadSave() {
  let data = null;
  try { data = JSON.parse(Storage.get(SAVE_KEY)); } catch (e) { data = null; }
  S = deepMerge(defaultSave(), data || {});
}

function persist() {
  S.lastSeen = Date.now();
  Storage.set(SAVE_KEY, JSON.stringify(S));
}

function resetSave() {
  S = defaultSave();
  persist();
}

// ---------- улучшения ----------
const upLevel = (id) => S.upgrades[id] || 0;
const upValue = (id) => UPGRADE[id].values[upLevel(id)];
const upMaxed = (id) => upLevel(id) >= UPGRADE[id].costs.length;
const upCost = (id) => UPGRADE[id].costs[upLevel(id)];

function regState(id) {
  if (!S.regulars[id]) S.regulars[id] = { hearts: 0, visits: 0 };
  return S.regulars[id];
}

// Подарки дружбы от постоянных гостей
function perk(key) {
  let sum = 0;
  for (const r of REGULARS) if (r.perk.key === key && regState(r.id).hearts >= MAX_HEARTS) sum += r.perk.v;
  return sum;
}

const Stats = {
  brewTime: () => upValue('espresso_speed') * (1 - perk('espresso')),
  groups: () => upValue('espresso_groups'),
  frothTime: () => upValue('frother_speed') * (1 - perk('frother')),
  pitchers: () => upValue('frother_slots'),
  filterTime: () => upValue('filter_speed'),
  // Сколько одновременных заказов тянет оборудование и сколько длится приготовление
  slots: (machine) => (machine === 'espresso' ? Stats.groups() : machine === 'frother' ? Stats.pitchers() : 1),
  duration: (ing) => {
    const m = INGREDIENTS[ing];
    if (m.machine === 'espresso') return Stats.brewTime() * (m.brew || 1);
    if (m.machine === 'frother') return Stats.frothTime();
    return Stats.filterTime();
  },
  cups: () => upValue('cups'),
  capacity: () => upValue('counter'),
  patienceMult: () => 1 + upValue('patience') + perk('patience'),
  tipMult: () => upValue('tipjar') * (1 + perk('tips')),
  priceMult: () => 1 + upValue('pastry') + perk('price'),
  spawnMult: () => 1 + upValue('sign') + perk('spawn'),
  shiftLen: () => SHIFT_BASE + perk('shift'),
  helperRate: () => upValue('helper'),
};

// Ингредиенты, которые нужны открытым рецептам
function availableIngredients() {
  const set = new Set();
  for (const id of S.recipes) for (const ing of RECIPE[id].ings) set.add(ing);
  return INGREDIENT_ORDER.filter((i) => set.has(i));
}

// Инструменты с доступными на них действиями
function availableTools() {
  const ings = new Set(availableIngredients());
  return TOOLS.map((tl) => ({ ...tl, ings: tl.ings.filter((i) => ings.has(i)) })).filter((tl) => tl.ings.length);
}

function regularEligible(r) {
  return S.day >= r.minDay && S.recipes.includes(r.fav);
}

function canAffordSomething() {
  for (const u of UPGRADES) if (!upMaxed(u.id) && S.coins >= upCost(u.id)) return true;
  for (const r of RECIPES) if (!S.recipes.includes(r.id) && S.coins >= r.cost) return true;
  return false;
}
