// Sälem — данные игры: ингредиенты, инструменты, рецепты, улучшения, постоянные гости, достижения.
// Тексты хранятся парами { ru, en } и читаются через T() из i18n.js.

// ---------- утилиты ----------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fmt = (n) => Math.round(n).toLocaleString(LANG === 'en' ? 'en-US' : 'ru-RU');
function plural(n, one, few, many) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}
const pct = (v) => Math.round(v * 100) + '%';

// ---------- ингредиенты ----------
// machine — на каком оборудовании готовится (со временем), brew — множитель времени,
// h — высота слоя в чашке, kind — особый вид отрисовки.
const INGREDIENTS = {
  ristretto:   { name: { ru: 'Ристретто', en: 'Ristretto' }, machine: 'espresso', brew: 0.7, color: '#3e2216', h: 8 },
  espresso:    { name: { ru: 'Эспрессо', en: 'Espresso' },   machine: 'espresso', brew: 1, color: '#5a3422', h: 12 },
  lungo:       { name: { ru: 'Лунго', en: 'Lungo' },         machine: 'espresso', brew: 1.6, color: '#7a4a30', h: 20 },
  milk:        { name: { ru: 'Молоко', en: 'Milk' },         machine: 'frother', color: '#f7efe1', h: 16 },
  foam:        { name: { ru: 'Пена', en: 'Foam' },           machine: 'frother', color: '#fffdf8', h: 11, kind: 'foam' },
  water:       { name: { ru: 'Кипяток', en: 'Hot water' },   color: '#cbe7f4', h: 16, sfx: 'pour' },
  filter:      { name: { ru: 'Пуровер', en: 'Pour-over' },   machine: 'filter', color: '#8a5634', h: 30 },
  ice:         { name: { ru: 'Лёд', en: 'Ice' },             color: '#dff4fc', h: 12, kind: 'ice', sfx: 'ice' },
  cream:       { name: { ru: 'Сливки', en: 'Cream' },        color: '#fff1d6', h: 12 },
  matcha:      { name: { ru: 'Матча', en: 'Matcha' },        color: '#97c062', h: 12 },
  chocolate:   { name: { ru: 'Шоколад', en: 'Chocolate' },   color: '#6e3d24', h: 9 },
  caramel:     { name: { ru: 'Карамель', en: 'Caramel' },    color: '#e29a3c', h: 6 },
  vanilla:     { name: { ru: 'Ваниль', en: 'Vanilla' },      color: '#f2df9e', h: 6 },
  pumpkin:     { name: { ru: 'Тыква', en: 'Pumpkin' },       color: '#ee9145', h: 8 },
  cinnamon:    { name: { ru: 'Корица', en: 'Cinnamon' },     color: '#9b5a2e', h: 4, kind: 'sprinkle' },
  marshmallow: { name: { ru: 'Зефир', en: 'Marshmallow' },   color: '#ffd6e0', h: 6, kind: 'marsh' },
};

// Рабочее место бариста: настоящее оборудование и что на нём делается
const TOOLS = [
  { id: 'machine', name: { ru: 'Эспрессо-машина', en: 'Espresso machine' }, icon: 'tool_machine', machine: 'espresso', ings: ['ristretto', 'espresso', 'lungo'] },
  { id: 'steam',   name: { ru: 'Паровой питчер', en: 'Steam pitcher' },     icon: 'tool_steam',   machine: 'frother',  ings: ['milk', 'foam'] },
  { id: 'kettle',  name: { ru: 'Чайник-гусак', en: 'Gooseneck kettle' },    icon: 'water',        ings: ['water'] },
  { id: 'v60',     name: { ru: 'Воронка V60', en: 'V60 dripper' },          icon: 'filter',       machine: 'filter',   ings: ['filter'] },
  { id: 'bar',     name: { ru: 'Барная полка', en: 'Bar shelf' },           icon: 'tool_shelf',   ings: ['ice', 'cream', 'matcha', 'chocolate', 'caramel', 'vanilla', 'pumpkin', 'cinnamon', 'marshmallow'] },
];
const INGREDIENT_ORDER = TOOLS.flatMap((tl) => tl.ings);

const CUP_CAPACITY = 5;

// ---------- рецепты ----------
// Порядок ингредиентов не важен — важен набор.
const RECIPES = [
  { id: 'espresso',   name: { ru: 'Эспрессо', en: 'Espresso' },               ings: ['espresso'],                               price: 8,  cost: 0 },
  { id: 'americano',  name: { ru: 'Американо', en: 'Americano' },             ings: ['espresso', 'water'],                      price: 10, cost: 0 },
  { id: 'latte',      name: { ru: 'Латте', en: 'Latte' },                     ings: ['espresso', 'milk'],                       price: 13, cost: 0 },
  { id: 'doppio',     name: { ru: 'Доппио', en: 'Doppio' },                   ings: ['espresso', 'espresso'],                   price: 12, cost: 40 },
  { id: 'ristretto',  name: { ru: 'Ристретто', en: 'Ristretto' },             ings: ['ristretto'],                              price: 9,  cost: 60 },
  { id: 'cappuccino', name: { ru: 'Капучино', en: 'Cappuccino' },             ings: ['espresso', 'milk', 'foam'],               price: 16, cost: 80 },
  { id: 'macchiato',  name: { ru: 'Макиато', en: 'Macchiato' },               ings: ['espresso', 'foam'],                       price: 12, cost: 110 },
  { id: 'lungo',      name: { ru: 'Лунго', en: 'Lungo' },                     ings: ['lungo'],                                  price: 11, cost: 140 },
  { id: 'cocoa',      name: { ru: 'Какао', en: 'Hot chocolate' },             ings: ['milk', 'chocolate', 'marshmallow'],       price: 14, cost: 170 },
  { id: 'filter',     name: { ru: 'Фильтр-кофе', en: 'Filter coffee' },       ings: ['filter'],                                 price: 13, cost: 220 },
  { id: 'flatwhite',  name: { ru: 'Флэт уайт', en: 'Flat white' },            ings: ['ristretto', 'ristretto', 'milk'],         price: 18, cost: 280 },
  { id: 'mocha',      name: { ru: 'Мокко', en: 'Mocha' },                     ings: ['espresso', 'milk', 'chocolate'],          price: 19, cost: 350 },
  { id: 'caramel',    name: { ru: 'Карамельный латте', en: 'Caramel latte' }, ings: ['espresso', 'milk', 'caramel'],            price: 20, cost: 420 },
  { id: 'raf',        name: { ru: 'Раф', en: 'Raf' },                         ings: ['espresso', 'cream', 'vanilla'],           price: 22, cost: 520 },
  { id: 'icelatte',   name: { ru: 'Айс латте', en: 'Iced latte' },            ings: ['ice', 'espresso', 'milk'],                price: 21, cost: 650 },
  { id: 'matcha',     name: { ru: 'Матча латте', en: 'Matcha latte' },        ings: ['matcha', 'milk'],                         price: 24, cost: 800 },
  { id: 'pumpkin',    name: { ru: 'Тыквенный латте', en: 'Pumpkin spice latte' }, ings: ['espresso', 'milk', 'pumpkin', 'cinnamon'], price: 28, cost: 1000 },
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
const sec = (v) => (LANG === 'en' ? `${v} s` : `${v} сек`);
const UPGRADES = [
  { id: 'espresso_speed', icon: 'tool_machine', costs: [100, 250, 600, 1400], values: [3.0, 2.4, 1.9, 1.5, 1.2],
    name: { ru: 'Кофемашина «Турбо»', en: 'Turbo espresso machine' },
    desc: (v) => (LANG === 'en' ? `Espresso shot in ${sec(v)}` : `Эспрессо за ${sec(v)}`) },
  { id: 'espresso_groups', icon: 'up_groups', costs: [300, 1000], values: [1, 2, 3],
    name: { ru: 'Ещё одна группа', en: 'Extra group head' },
    desc: (v) => (LANG === 'en' ? `${v} ${pl(v, '', '', '', 'shot', 'shots')} at once` : `${v} ${pl(v, 'шот', 'шота', 'шотов')} одновременно`) },
  { id: 'frother_speed', icon: 'tool_steam', costs: [80, 220, 550, 1200], values: [2.6, 2.1, 1.7, 1.3, 1.0],
    name: { ru: 'Мощный паровик', en: 'Power steam wand' },
    desc: (v) => (LANG === 'en' ? `Milk and foam in ${sec(v)}` : `Молоко и пена за ${sec(v)}`) },
  { id: 'frother_slots', icon: 'milk', costs: [450], values: [1, 2],
    name: { ru: 'Второй питчер', en: 'Second pitcher' },
    desc: (v) => (LANG === 'en' ? `${v} ${pl(v, '', '', '', 'pitcher', 'pitchers')} at once` : `${v} ${pl(v, 'питчер', 'питчера', 'питчеров')} сразу`) },
  { id: 'filter_speed', icon: 'up_scale', costs: [200, 500, 1100], values: [6, 4.8, 3.6, 2.6],
    name: { ru: 'Весы с таймером', en: 'Brew scale' },
    desc: (v) => (LANG === 'en' ? `Pour-over in ${sec(v)}` : `Пуровер за ${sec(v)}`) },
  { id: 'cups', icon: 'espresso', costs: [150, 700], values: [1, 2, 3],
    name: { ru: 'Ещё одна чашка', en: 'Extra cup' },
    desc: (v) => (LANG === 'en' ? `${v} ${pl(v, '', '', '', 'cup', 'cups')} at once` : `${v} ${pl(v, 'чашка', 'чашки', 'чашек')} одновременно`) },
  { id: 'counter', icon: 'up_counter', costs: [800], values: [3, 4],
    name: { ru: 'Длинная стойка', en: 'Longer counter' },
    desc: (v) => (LANG === 'en' ? `Up to ${v} guests at the counter` : `До ${v} гостей у стойки`) },
  { id: 'patience', icon: 'up_chair', costs: [180, 450, 1000], values: [0, 0.15, 0.3, 0.45],
    name: { ru: 'Мягкие кресла', en: 'Comfy armchairs' },
    desc: (v) => (v ? (LANG === 'en' ? `Guests wait ${pct(v)} longer` : `Гости ждут на ${pct(v)} дольше`) : (LANG === 'en' ? 'Guests wait as usual' : 'Гости ждут как обычно')) },
  { id: 'tipjar', icon: 'up_jar', costs: [120, 400, 900], values: [1, 1.25, 1.5, 1.8],
    name: { ru: 'Банка для чаевых', en: 'Tip jar' },
    desc: (v) => (LANG === 'en' ? `Tips ×${v}` : `Чаевые ×${v}`) },
  { id: 'pastry', icon: 'up_pastry', costs: [250, 700, 1600], values: [0, 0.1, 0.2, 0.3],
    name: { ru: 'Витрина с выпечкой', en: 'Pastry case' },
    desc: (v) => (v ? (LANG === 'en' ? `+${pct(v)} per order` : `+${pct(v)} к цене заказа`) : (LANG === 'en' ? 'No pastries yet' : 'Пока без выпечки')) },
  { id: 'sign', icon: 'up_sign', costs: [350, 900, 2000], values: [0, 0.12, 0.24, 0.36],
    name: { ru: 'Неоновая вывеска', en: 'Neon sign' },
    desc: (v) => (v ? (LANG === 'en' ? `${pct(v)} more guests` : `Гостей на ${pct(v)} больше`) : (LANG === 'en' ? 'No sign yet' : 'Вывески ещё нет')) },
  { id: 'helper', icon: 'up_hedgehog', costs: [400, 1200, 3000], values: [0, 25, 60, 120],
    name: { ru: 'Ёжик Пых', en: 'Puff the hedgehog' },
    desc: (v) => (v ? (LANG === 'en' ? `${v} coins/hour while you're away` : `${v} монет в час, пока тебя нет`) : (LANG === 'en' ? 'Works while you are away' : 'Помогает, пока тебя нет в игре')) },
];
const UPGRADE = Object.fromEntries(UPGRADES.map((u) => [u.id, u]));

// ---------- постоянные гости ----------
// Истории открываются на этих уровнях дружбы (сердечках).
const STORY_HEARTS = [1, 3, 5, 7, 10];
const MAX_HEARTS = 10;

const REGULARS = [
  { id: 'timur', name: { ru: 'Тимур', en: 'Timur' }, fav: 'americano', minDay: 2,
    look: { skin: '#e8b892', hair: '#2b1d16', style: 'spiky', shirt: '#4f6d8f', shirt2: '#e9edf2', outfit: 'hoodie', eye: '#4a3020', acc: ['headphones'] },
    perk: { text: { ru: 'Кофемашина на 5% быстрее', en: 'Espresso machine 5% faster' }, key: 'espresso', v: 0.05 },
    story: {
      ru: [
        'Привет! Я Тимур, пишу код по ночам. Без американо мой компилятор не запускается.',
        'Сдал курсовую! Твой кофе — официальный спонсор этой победы.',
        'Я делаю свою игру. Про… кофейню. Только никому не говори.',
        'Меня взяли стажёром в игровую студию! Офис через дорогу — буду заходить чаще.',
        'Добавил тебя в титры: «Особая благодарность — лучшему баристе города». Это за все чашки.',
      ],
      en: [
        "Hi! I'm Timur, I code at night. Without an americano my compiler won't even start.",
        'Passed my term project! Your coffee is the official sponsor of this victory.',
        "I'm making my own game. About… a coffee shop. Don't tell anyone.",
        "I got an internship at a game studio! The office is across the street — I'll be here more often.",
        "I put you in the credits: “Special thanks to the best barista in town.” That's for all the cups.",
      ] } },
  { id: 'vera', name: { ru: 'Бабушка Вера', en: 'Granny Vera' }, fav: 'cocoa', minDay: 2,
    look: { skin: '#f1c9a5', hair: '#dcd6d0', style: 'bun', shirt: '#b5556a', shirt2: '#f6e3c8', outfit: 'cardigan', eye: '#5b7a99', acc: ['glasses', 'scarf'] },
    perk: { text: { ru: '+5% к чаевым', en: '+5% tips' }, key: 'tips', v: 0.05 },
    story: {
      ru: [
        'Здравствуй, милый. Я Вера Павловна. В моём возрасте можно какао с зефирками, правда?',
        'Внук опять не звонит. Зато ты всегда улыбаешься — уже хорошо.',
        'Вяжу шарф. Цвет выбрала как у твоего какао.',
        'Внук приезжал! Пьёт какой-то «смузи». Ничего, приведу сюда — перевоспитаем.',
        'Это тебе — тот самый шарф. Носи и не мёрзни, а то кто мне какао сварит?',
      ],
      en: [
        "Hello, dear. I'm Vera. At my age a hot chocolate with marshmallows is allowed, isn't it?",
        "My grandson hasn't called again. But you always smile — that's something.",
        "I'm knitting a scarf. Picked the color of your hot chocolate.",
        "My grandson visited! He drinks some “smoothie”. Never mind, I'll bring him here and we'll fix that.",
        'This is for you — that very scarf. Wear it and stay warm, who else will make my hot chocolate?',
      ] } },
  { id: 'alisa', name: { ru: 'Алиса', en: 'Alisa' }, fav: 'cappuccino', minDay: 3,
    look: { skin: '#f6d5bd', hair: '#c8553d', style: 'long', shirt: '#2a9d8f', shirt2: '#f4f1de', outfit: 'sweater', eye: '#4f8a4c', freckles: true, acc: ['beret'] },
    perk: { text: { ru: 'Гости ждут на 5% дольше', en: 'Guests wait 5% longer' }, key: 'patience', v: 0.05 },
    story: {
      ru: [
        'Я Алиса, рисую акварелью. У тебя тут такой свет — мечта художника.',
        'Нарисовала твою кофейню. Вышло так уютно, что мне не верят, будто такое место есть.',
        'Сегодня пейзаж не получается. Капучино спасёт ситуацию.',
        'Мою картину взяли на выставку! Ту самую, с твоей стойкой.',
        'Подарок: картина для твоей стены. Пусть гости смотрят и никуда не спешат.',
      ],
      en: [
        "I'm Alisa, I paint watercolors. The light in here is an artist's dream.",
        "I painted your café. It came out so cozy nobody believes such a place exists.",
        "Today's landscape just won't work. A cappuccino will save the day.",
        'My painting got into an exhibition! The one with your counter.',
        'A gift: a painting for your wall. Let the guests look at it and slow down.',
      ] } },
  { id: 'lev', name: { ru: 'Профессор Лев', en: 'Professor Lev' }, fav: 'ristretto', minDay: 3,
    look: { skin: '#e3b48f', hair: '#9a9a9a', style: 'bald', shirt: '#6b4f3a', shirt2: '#f2f2f2', outfit: 'collar', eye: '#3b2a22', acc: ['beard', 'glasses'] },
    perk: { text: { ru: 'Смена длится на 10 секунд дольше', en: 'Shifts last 10 seconds longer' }, key: 'shift', v: 10 },
    story: {
      ru: [
        'Лев Аркадьевич, кафедра астрономии. Ристретто. Без глупостей.',
        'Кофе пьют даже на орбите. Но там он хуже вашего — это я вам как учёный говорю.',
        'Студенты считают меня строгим. Не говорите им, что я тут улыбаюсь.',
        'Сегодня открыли новую комету. Хотел назвать её «Ристретто», коллеги против.',
        'Назвал астероид в честь вашей кофейни. Официально. Теперь «Sälem» летает в космосе.',
      ],
      en: [
        'Lev Arkadievich, Department of Astronomy. A ristretto. No nonsense.',
        "They drink coffee even in orbit. But it's worse than yours — I say that as a scientist.",
        "My students think I'm strict. Don't tell them I smile in here.",
        "We discovered a new comet today. I wanted to name it “Ristretto”, my colleagues objected.",
        'I named an asteroid after your café. Officially. Sälem is now flying through space.',
      ] } },
  { id: 'mark', name: { ru: 'Марк', en: 'Mark' }, fav: 'flatwhite', minDay: 4,
    look: { skin: '#8d5a3b', hair: '#1b1b1b', style: 'curly', shirt: '#f2a541', shirt2: '#3d405b', outfit: 'tee', eye: '#2b1d16', acc: ['helmet'] },
    perk: { text: { ru: 'Гости приходят на 5% чаще', en: 'Guests arrive 5% more often' }, key: 'spawn', v: 0.05 },
    story: {
      ru: [
        'Марк, курьер на велике! Флэт уайт — и я снова в седле.',
        'Проехал сегодня сорок километров. Половину — думая о твоём кофе.',
        'Рассказываю про тебя всем клиентам. Бесплатная реклама, не благодари.',
        'Выиграл городскую велогонку! На финише представлял, что еду сюда.',
        'Теперь на моём рюкзаке наклейка «Sälem». Полгорода спрашивает, где это.',
      ],
      en: [
        "Mark, bike courier! A flat white and I'm back in the saddle.",
        'Rode forty kilometers today. Half of them thinking about your coffee.',
        "I tell all my customers about you. Free advertising, don't mention it.",
        'I won the city bike race! At the finish line I pictured riding here.',
        "There's a Sälem sticker on my backpack now. Half the city asks where it is.",
      ] } },
  { id: 'sonya', name: { ru: 'Соня', en: 'Sonya' }, fav: 'raf', minDay: 5,
    look: { skin: '#f3cfb3', hair: '#3d2b56', style: 'bob', shirt: '#e9c46a', shirt2: '#fff', outfit: 'turtleneck', eye: '#5b3a6e', lash: true, acc: ['pencil'] },
    perk: { text: { ru: '+5% к цене напитков', en: '+5% drink prices' }, key: 'price', v: 0.05 },
    story: {
      ru: [
        'Я Соня, пишу роман. Нужен раф и тихий уголок.',
        'Героиня моего романа работает в кофейне. Совпадение? Не думаю.',
        'Застряла на двенадцатой главе. Сделай раф послаще, пожалуйста.',
        'Издательство ответило! Им понравилось. Особенно сцены в кофейне.',
        'Книга вышла! На первой странице: «Баристе, который знал мой заказ».',
      ],
      en: [
        "I'm Sonya, I'm writing a novel. I need a raf and a quiet corner.",
        "My heroine works in a coffee shop. Coincidence? I don't think so.",
        "I'm stuck on chapter twelve. Make the raf a little sweeter, please.",
        'The publisher replied! They loved it. Especially the coffee shop scenes.',
        "The book is out! The first page says: “To the barista who knew my order.”",
      ] } },
  { id: 'maya', name: { ru: 'Майя', en: 'Maya' }, fav: 'matcha', minDay: 6,
    look: { skin: '#d9a07a', hair: '#151515', style: 'ponytail', shirt: '#a3c4bc', shirt2: '#fff', outfit: 'tee', eye: '#3b2a22', lash: true, earring: true, acc: ['headband'] },
    perk: { text: { ru: 'Паровик на 5% быстрее', en: 'Steam wand 5% faster' }, key: 'frother', v: 0.05 },
    story: {
      ru: [
        'Привет! Я Майя, веду йогу в парке. Матча — мой утренний ритуал.',
        'Глубокий вдох… Тут даже воздух пахнет спокойствием.',
        'Привела на занятие двадцать человек. Потом все пошли к тебе за матчей.',
        'Открываю свою студию. Прямо напротив! Будем соседями.',
        'Мои ученики называют твою матчу «дзен в стакане». Это высшая оценка.',
      ],
      en: [
        "Hi! I'm Maya, I teach yoga in the park. Matcha is my morning ritual.",
        'Deep breath… Even the air in here smells calm.',
        'Twenty people came to my class. Then they all came to you for matcha.',
        "I'm opening my own studio. Right across the street! We'll be neighbors.",
        'My students call your matcha “zen in a cup”. That is the highest praise.',
      ] } },
];
const REGULAR = Object.fromEntries(REGULARS.map((r) => [r.id, r]));

// ---------- внешность случайных гостей ----------
const SKINS = ['#f6d5bd', '#f1c9a5', '#e8b892', '#d9a07a', '#b97a52', '#8d5a3b', '#6b4128'];
const HAIRS = ['#2b1d16', '#4a3020', '#7a4a2a', '#c8553d', '#e3b866', '#1b1b1b', '#8d8d8d', '#5b3a6e', '#d98aa0', '#a0522d'];
const SHIRTS = ['#e07a5f', '#81b29a', '#f2cc8f', '#3d405b', '#6d9dc5', '#c08497', '#f4a259', '#8e7dbe', '#5fa8a0', '#d6604d', '#9c6644', '#264653'];
const SHIRTS2 = ['#fff8ee', '#f4f1de', '#3d405b', '#e9c46a', '#f2cc8f', '#ffffff'];
const EYES = ['#3b2a22', '#4a3020', '#5b7a99', '#4f8a4c', '#6b4f3a', '#2b1d16'];
const STYLES = ['short', 'long', 'bun', 'curly', 'bob', 'ponytail', 'spiky', 'cap', 'beanie', 'short', 'long', 'wavy', 'buzz'];
const OUTFITS = ['tee', 'hoodie', 'sweater', 'collar', 'cardigan', 'turtleneck'];

function randomLook() {
  const acc = [];
  if (Math.random() < 0.2) acc.push('glasses');
  if (Math.random() < 0.08) acc.push('beard');
  return {
    skin: pick(SKINS), hair: pick(HAIRS), style: pick(STYLES), shirt: pick(SHIRTS), shirt2: pick(SHIRTS2), hat: pick(SHIRTS),
    outfit: pick(OUTFITS), eye: pick(EYES), freckles: Math.random() < 0.15, lash: Math.random() < 0.4, earring: Math.random() < 0.2, acc,
  };
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
  { id: 'first',      name: { ru: 'Первая чашка', en: 'First cup' },               desc: { ru: 'Обслужи первого гостя', en: 'Serve your first guest' },                 reward: 20,   check: (s) => s.stats.served >= 1 },
  { id: 'served100',  name: { ru: 'Своя публика', en: 'Regular crowd' },            desc: { ru: 'Обслужи 100 гостей', en: 'Serve 100 guests' },                          reward: 150,  check: (s) => s.stats.served >= 100 },
  { id: 'served500',  name: { ru: 'Любимое место района', en: 'Neighborhood favorite' }, desc: { ru: 'Обслужи 500 гостей', en: 'Serve 500 guests' },                     reward: 500,  check: (s) => s.stats.served >= 500 },
  { id: 'served2000', name: { ru: 'Легенда города', en: 'City legend' },            desc: { ru: 'Обслужи 2000 гостей', en: 'Serve 2000 guests' },                        reward: 1500, check: (s) => s.stats.served >= 2000 },
  { id: 'combo10',    name: { ru: 'В потоке', en: 'In the flow' },                  desc: { ru: 'Комбо из 10 заказов', en: 'A 10-order combo' },                          reward: 100,  check: (s) => s.stats.bestCombo >= 10 },
  { id: 'combo25',    name: { ru: 'Бариста-машина', en: 'Barista machine' },        desc: { ru: 'Комбо из 25 заказов', en: 'A 25-order combo' },                          reward: 400,  check: (s) => s.stats.bestCombo >= 25 },
  { id: 'shift500',   name: { ru: 'Удачный день', en: 'Good day' },                 desc: { ru: 'Заработай 500 за одну смену', en: 'Earn 500 in one shift' },            reward: 200,  check: (s) => s.stats.bestShift >= 500 },
  { id: 'shift1500',  name: { ru: 'Золотая смена', en: 'Golden shift' },            desc: { ru: 'Заработай 1500 за одну смену', en: 'Earn 1500 in one shift' },          reward: 600,  check: (s) => s.stats.bestShift >= 1500 },
  { id: 'stars3',     name: { ru: 'Три звезды', en: 'Three stars' },                desc: { ru: 'Получи 3 звезды за смену', en: 'Get 3 stars in a shift' },              reward: 50,   check: (s) => s.stats.threeStars >= 1 },
  { id: 'stars10',    name: { ru: 'Звёздная кофейня', en: 'Star café' },            desc: { ru: 'Получи 3 звезды 10 раз', en: 'Get 3 stars 10 times' },                  reward: 300,  check: (s) => s.stats.threeStars >= 10 },
  { id: 'menu',       name: { ru: 'Полное меню', en: 'Full menu' },                 desc: { ru: 'Открой все рецепты', en: 'Unlock every recipe' },                       reward: 500,  check: (s) => s.recipes.length >= RECIPES.length },
  { id: 'memory10',   name: { ru: 'Как обычно', en: 'The usual' },                  desc: { ru: 'Запомни 10 заказов постоянных гостей', en: "Remember 10 regulars' orders" }, reward: 150, check: (s) => s.stats.memory >= 10 },
  { id: 'friend',     name: { ru: 'Почти семья', en: 'Almost family' },             desc: { ru: 'Подружись с гостем на все сердечки', en: 'Max out a friendship' },      reward: 300,  check: (s) => Object.values(s.regulars).some((r) => r.hearts >= MAX_HEARTS) },
  { id: 'cat',        name: { ru: 'Кошатник', en: 'Cat person' },                   desc: { ru: 'Погладь кота 10 раз', en: 'Pet the cat 10 times' },                     reward: 100,  check: (s) => s.stats.catPets >= 10 },
  { id: 'streak7',    name: { ru: 'Неделя уюта', en: 'Cozy week' },                 desc: { ru: 'Заходи 7 дней подряд', en: 'Play 7 days in a row' },                    reward: 300,  check: (s) => s.streak.count >= 7 },
];
