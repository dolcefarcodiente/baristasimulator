// Пенка — данные игры: ингредиенты, рецепты, улучшения, постоянные гости, достижения.

// ---------- утилиты ----------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fmt = (n) => Math.round(n).toLocaleString('ru-RU');
function plural(n, one, few, many) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}
const pct = (v) => Math.round(v * 100) + '%';

// ---------- ингредиенты ----------
// machine: 'espresso' | 'frother' — готовится со временем на оборудовании, иначе добавляется сразу.
// h — высота слоя в чашке (условные единицы), kind — особый вид отрисовки.
const INGREDIENT_ORDER = ['espresso', 'water', 'milk', 'foam', 'chocolate', 'caramel', 'vanilla', 'cream', 'ice', 'matcha', 'pumpkin', 'cinnamon', 'marshmallow'];

const INGREDIENTS = {
  espresso:    { name: 'Эспрессо', machine: 'espresso', color: '#5a3422', h: 12 },
  water:       { name: 'Вода',     color: '#cbe7f4', h: 16, sfx: 'pour' },
  milk:        { name: 'Молоко',   machine: 'frother', color: '#f7efe1', h: 16 },
  foam:        { name: 'Пена',     machine: 'frother', color: '#fffdf8', h: 11, kind: 'foam' },
  chocolate:   { name: 'Шоколад',  color: '#6e3d24', h: 9 },
  caramel:     { name: 'Карамель', color: '#e29a3c', h: 6 },
  vanilla:     { name: 'Ваниль',   color: '#f2df9e', h: 6 },
  cream:       { name: 'Сливки',   color: '#fff1d6', h: 12 },
  ice:         { name: 'Лёд',      color: '#dff4fc', h: 12, kind: 'ice', sfx: 'ice' },
  matcha:      { name: 'Матча',    color: '#97c062', h: 12 },
  pumpkin:     { name: 'Тыква',    color: '#ee9145', h: 8 },
  cinnamon:    { name: 'Корица',   color: '#9b5a2e', h: 4, kind: 'sprinkle' },
  marshmallow: { name: 'Зефир',    color: '#ffd6e0', h: 6, kind: 'marsh' },
};

const CUP_CAPACITY = 5;

// ---------- рецепты ----------
// Порядок ингредиентов не важен — важен набор.
const RECIPES = [
  { id: 'espresso',   name: 'Эспрессо',          ings: ['espresso'],                               price: 8,  cost: 0 },
  { id: 'americano',  name: 'Американо',         ings: ['espresso', 'water'],                      price: 10, cost: 0 },
  { id: 'latte',      name: 'Латте',             ings: ['espresso', 'milk'],                       price: 13, cost: 0 },
  { id: 'cappuccino', name: 'Капучино',          ings: ['espresso', 'milk', 'foam'],               price: 16, cost: 60 },
  { id: 'cocoa',      name: 'Какао',             ings: ['milk', 'chocolate', 'marshmallow'],       price: 14, cost: 120 },
  { id: 'flatwhite',  name: 'Флэт уайт',         ings: ['espresso', 'espresso', 'milk'],           price: 18, cost: 200 },
  { id: 'mocha',      name: 'Мокко',             ings: ['espresso', 'milk', 'chocolate'],          price: 19, cost: 320 },
  { id: 'caramel',    name: 'Карамельный латте', ings: ['espresso', 'milk', 'caramel'],            price: 20, cost: 380 },
  { id: 'raf',        name: 'Раф',               ings: ['espresso', 'cream', 'vanilla'],           price: 22, cost: 500 },
  { id: 'icelatte',   name: 'Айс латте',         ings: ['ice', 'espresso', 'milk'],                price: 21, cost: 650 },
  { id: 'matcha',     name: 'Матча латте',       ings: ['matcha', 'milk'],                         price: 24, cost: 800 },
  { id: 'pumpkin',    name: 'Тыквенный латте',   ings: ['espresso', 'milk', 'pumpkin', 'cinnamon'], price: 28, cost: 1000 },
];
const RECIPE = Object.fromEntries(RECIPES.map((r, i) => [r.id, { ...r, index: i }]));

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const x = [...a].sort(), y = [...b].sort();
  return x.every((v, i) => v === y[i]);
}
function recipeFor(items) {
  return RECIPES.find((r) => sameSet(r.ings, items)) || null;
}

// ---------- улучшения ----------
const UPGRADES = [
  { id: 'espresso_speed', name: 'Кофемашина Pro', icon: '☕', costs: [100, 250, 600, 1400], values: [3.0, 2.4, 1.9, 1.5, 1.2],
    desc: (v) => `Эспрессо за ${v} сек` },
  { id: 'espresso_groups', name: 'Ещё одна группа', icon: '⚙️', costs: [300, 1000], values: [1, 2, 3],
    desc: (v) => `${v} эспрессо одновременно` },
  { id: 'frother_speed', name: 'Паровой вспениватель', icon: '💨', costs: [80, 220, 550, 1200], values: [2.6, 2.1, 1.7, 1.3, 1.0],
    desc: (v) => `Молоко и пена за ${v} сек` },
  { id: 'frother_slots', name: 'Второй питчер', icon: '🥛', costs: [450], values: [1, 2],
    desc: (v) => `${v} ${plural(v, 'питчер', 'питчера', 'питчеров')} молока сразу` },
  { id: 'cups', name: 'Рабочее место', icon: '🍵', costs: [150, 700], values: [1, 2, 3],
    desc: (v) => `${v} ${plural(v, 'чашка', 'чашки', 'чашек')} одновременно` },
  { id: 'counter', name: 'Длинная стойка', icon: '🪑', costs: [800], values: [3, 4],
    desc: (v) => `До ${v} гостей у стойки` },
  { id: 'patience', name: 'Мягкие кресла', icon: '🛋️', costs: [180, 450, 1000], values: [0, 0.15, 0.3, 0.45],
    desc: (v) => (v ? `Гости ждут на ${pct(v)} дольше` : 'Гости ждут как обычно') },
  { id: 'tipjar', name: 'Банка для чаевых', icon: '🍯', costs: [120, 400, 900], values: [1, 1.25, 1.5, 1.8],
    desc: (v) => `Чаевые ×${v}` },
  { id: 'pastry', name: 'Витрина с выпечкой', icon: '🥐', costs: [250, 700, 1600], values: [0, 0.1, 0.2, 0.3],
    desc: (v) => (v ? `+${pct(v)} к цене заказа` : 'Пока без выпечки') },
  { id: 'sign', name: 'Неоновая вывеска', icon: '💡', costs: [350, 900, 2000], values: [0, 0.12, 0.24, 0.36],
    desc: (v) => (v ? `Гостей на ${pct(v)} больше` : 'Вывески ещё нет') },
  { id: 'helper', name: 'Ёжик-помощник', icon: '🦔', costs: [400, 1200, 3000], values: [0, 25, 60, 120],
    desc: (v) => (v ? `${v} монет в час, пока тебя нет` : 'Помогает, пока тебя нет в игре') },
];
const UPGRADE = Object.fromEntries(UPGRADES.map((u) => [u.id, u]));

// ---------- постоянные гости ----------
// Истории открываются на этих уровнях дружбы (сердечках).
const STORY_HEARTS = [1, 3, 5, 7, 10];
const MAX_HEARTS = 10;

const REGULARS = [
  { id: 'timur', name: 'Тимур', fav: 'americano', minDay: 2,
    look: { skin: '#e8b892', hair: '#2b1d16', style: 'spiky', shirt: '#4f6d8f', acc: ['headphones'] },
    perk: { text: 'Кофемашина на 5% быстрее', key: 'espresso', v: 0.05 },
    story: [
      'Привет! Я Тимур, пишу код по ночам. Без американо мой компилятор не запускается.',
      'Сдал курсовую! Твой кофе — официальный спонсор этой победы.',
      'Я делаю свою игру. Про… кофейню. Только никому не говори.',
      'Меня взяли стажёром в игровую студию! Офис через дорогу — буду заходить чаще.',
      'Добавил тебя в титры: «Особая благодарность — лучшему баристе города». Это за все чашки.',
    ] },
  { id: 'vera', name: 'Бабушка Вера', fav: 'cocoa', minDay: 2,
    look: { skin: '#f1c9a5', hair: '#dcd6d0', style: 'bun', shirt: '#b5556a', acc: ['glasses', 'scarf'] },
    perk: { text: '+5% к чаевым', key: 'tips', v: 0.05 },
    story: [
      'Здравствуй, милый. Я Вера Павловна. В моём возрасте можно какао с зефирками, правда?',
      'Внук опять не звонит. Зато ты всегда улыбаешься — уже хорошо.',
      'Вяжу шарф. Цвет выбрала как у твоего какао.',
      'Внук приезжал! Пьёт какой-то «смузи». Ничего, приведу сюда — перевоспитаем.',
      'Это тебе — тот самый шарф. Носи и не мёрзни, а то кто мне какао сварит?',
    ] },
  { id: 'alisa', name: 'Алиса', fav: 'cappuccino', minDay: 3,
    look: { skin: '#f6d5bd', hair: '#c8553d', style: 'long', shirt: '#2a9d8f', acc: ['beret'] },
    perk: { text: 'Гости ждут на 5% дольше', key: 'patience', v: 0.05 },
    story: [
      'Я Алиса, рисую акварелью. У тебя тут такой свет — мечта художника.',
      'Нарисовала твою кофейню. Вышло так уютно, что мне не верят, будто такое место есть.',
      'Сегодня пейзаж не получается. Капучино спасёт ситуацию.',
      'Мою картину взяли на выставку! Ту самую, с твоей стойкой.',
      'Подарок: картина для твоей стены. Пусть гости смотрят и никуда не спешат.',
    ] },
  { id: 'lev', name: 'Профессор Лев', fav: 'espresso', minDay: 3,
    look: { skin: '#e3b48f', hair: '#9a9a9a', style: 'bald', shirt: '#6b4f3a', acc: ['beard', 'glasses'] },
    perk: { text: 'Смена длится на 10 секунд дольше', key: 'shift', v: 10 },
    story: [
      'Лев Аркадьевич, кафедра астрономии. Эспрессо. Без глупостей.',
      'Кофе пьют даже на орбите. Но там он хуже вашего — это я вам как учёный говорю.',
      'Студенты считают меня строгим. Не говорите им, что я тут улыбаюсь.',
      'Сегодня открыли новую комету. Хотел назвать её «Эспрессо», коллеги против.',
      'Назвал астероид в честь вашей кофейни. Официально. Теперь «Пенка» летает в космосе.',
    ] },
  { id: 'mark', name: 'Марк', fav: 'flatwhite', minDay: 4,
    look: { skin: '#8d5a3b', hair: '#1b1b1b', style: 'curly', shirt: '#f2a541', acc: ['helmet'] },
    perk: { text: 'Гости приходят на 5% чаще', key: 'spawn', v: 0.05 },
    story: [
      'Марк, курьер на велике! Флэт уайт — и я снова в седле.',
      'Проехал сегодня сорок километров. Половину — думая о твоём кофе.',
      'Рассказываю про тебя всем клиентам. Бесплатная реклама, не благодари.',
      'Выиграл городскую велогонку! На финише представлял, что еду сюда.',
      'Теперь на моём рюкзаке наклейка «Пенка». Полгорода спрашивает, где это.',
    ] },
  { id: 'sonya', name: 'Соня', fav: 'raf', minDay: 5,
    look: { skin: '#f3cfb3', hair: '#3d2b56', style: 'bob', shirt: '#e9c46a', acc: ['pencil'] },
    perk: { text: '+5% к цене напитков', key: 'price', v: 0.05 },
    story: [
      'Я Соня, пишу роман. Нужен раф и тихий уголок.',
      'Героиня моего романа работает в кофейне. Совпадение? Не думаю.',
      'Застряла на двенадцатой главе. Сделай раф послаще, пожалуйста.',
      'Издательство ответило! Им понравилось. Особенно сцены в кофейне.',
      'Книга вышла! На первой странице: «Баристе, который знал мой заказ».',
    ] },
  { id: 'maya', name: 'Майя', fav: 'matcha', minDay: 6,
    look: { skin: '#d9a07a', hair: '#151515', style: 'ponytail', shirt: '#a3c4bc', acc: ['headband'] },
    perk: { text: 'Вспениватель на 5% быстрее', key: 'frother', v: 0.05 },
    story: [
      'Привет! Я Майя, веду йогу в парке. Матча — мой утренний ритуал.',
      'Глубокий вдох… Тут даже воздух пахнет спокойствием.',
      'Привела на занятие двадцать человек. Потом все пошли к тебе за матчей.',
      'Открываю свою студию. Прямо напротив! Будем соседями.',
      'Мои ученики называют твою матчу «дзен в стакане». Это высшая оценка.',
    ] },
];
const REGULAR = Object.fromEntries(REGULARS.map((r) => [r.id, r]));

// ---------- внешность случайных гостей ----------
const SKINS = ['#f6d5bd', '#f1c9a5', '#e8b892', '#d9a07a', '#b97a52', '#8d5a3b', '#6b4128'];
const HAIRS = ['#2b1d16', '#4a3020', '#7a4a2a', '#c8553d', '#e3b866', '#1b1b1b', '#8d8d8d', '#5b3a6e', '#d98aa0'];
const SHIRTS = ['#e07a5f', '#81b29a', '#f2cc8f', '#3d405b', '#6d9dc5', '#c08497', '#f4a259', '#8e7dbe', '#5fa8a0', '#d6604d'];
const STYLES = ['short', 'long', 'bun', 'curly', 'bob', 'ponytail', 'spiky', 'cap', 'beanie', 'short', 'long'];

function randomLook() {
  const acc = [];
  if (Math.random() < 0.2) acc.push('glasses');
  if (Math.random() < 0.08) acc.push('beard');
  return { skin: pick(SKINS), hair: pick(HAIRS), style: pick(STYLES), shirt: pick(SHIRTS), hat: pick(SHIRTS), acc };
}

// ---------- баланс по дням ----------
const SHIFT_BASE = 150; // секунд
const dayTarget = (day) => Math.round((150 + (day - 1) * 70) / 10) * 10;
const basePatience = (day) => Math.max(20, 38 - (day - 1) * 1.4);
const baseSpawn = (day) => Math.max(3.0, 8 - (day - 1) * 0.4);
const multiDrinkChance = (day) => (day < 4 ? 0 : Math.min(0.35, (day - 3) * 0.05));

function comboMult(c) {
  if (c >= 20) return 5;
  if (c >= 15) return 4;
  if (c >= 10) return 3;
  if (c >= 6) return 2;
  if (c >= 3) return 1.5;
  return 1;
}
const COMBO_STEPS = [3, 6, 10, 15, 20];

// ---------- достижения ----------
const ACHIEVEMENTS = [
  { id: 'first',      name: 'Первая чашка',         desc: 'Обслужи первого гостя',              reward: 20,   check: (s) => s.stats.served >= 1 },
  { id: 'served100',  name: 'Своя публика',          desc: 'Обслужи 100 гостей',                 reward: 150,  check: (s) => s.stats.served >= 100 },
  { id: 'served500',  name: 'Любимое место района',  desc: 'Обслужи 500 гостей',                 reward: 500,  check: (s) => s.stats.served >= 500 },
  { id: 'served2000', name: 'Легенда города',        desc: 'Обслужи 2000 гостей',                reward: 1500, check: (s) => s.stats.served >= 2000 },
  { id: 'combo10',    name: 'В потоке',              desc: 'Комбо из 10 заказов',                reward: 100,  check: (s) => s.stats.bestCombo >= 10 },
  { id: 'combo25',    name: 'Бариста-машина',        desc: 'Комбо из 25 заказов',                reward: 400,  check: (s) => s.stats.bestCombo >= 25 },
  { id: 'shift500',   name: 'Удачный день',          desc: 'Заработай 500 за одну смену',        reward: 200,  check: (s) => s.stats.bestShift >= 500 },
  { id: 'shift1500',  name: 'Золотая смена',         desc: 'Заработай 1500 за одну смену',       reward: 600,  check: (s) => s.stats.bestShift >= 1500 },
  { id: 'stars3',     name: 'Три звезды',            desc: 'Получи 3 звезды за смену',           reward: 50,   check: (s) => s.stats.threeStars >= 1 },
  { id: 'stars10',    name: 'Звёздная кофейня',      desc: 'Получи 3 звезды 10 раз',             reward: 300,  check: (s) => s.stats.threeStars >= 10 },
  { id: 'menu',       name: 'Полное меню',           desc: 'Открой все рецепты',                 reward: 500,  check: (s) => s.recipes.length >= RECIPES.length },
  { id: 'memory10',   name: 'Как обычно',            desc: 'Запомни 10 заказов постоянных гостей', reward: 150, check: (s) => s.stats.memory >= 10 },
  { id: 'friend',     name: 'Почти семья',           desc: 'Подружись с гостем на все сердечки', reward: 300,  check: (s) => Object.values(s.regulars).some((r) => r.hearts >= MAX_HEARTS) },
  { id: 'cat',        name: 'Кошатник',              desc: 'Погладь кота 10 раз',                reward: 100,  check: (s) => s.stats.catPets >= 10 },
  { id: 'streak7',    name: 'Неделя уюта',           desc: 'Заходи 7 дней подряд',               reward: 300,  check: (s) => s.streak.count >= 7 },
];
