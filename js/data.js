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
  ristretto: { name: { ru: 'Ристретто', en: 'Ristretto' }, machine: 'espresso', brew: 0.7, color: '#3e2216', h: 8 },
  espresso:  { name: { ru: 'Эспрессо', en: 'Espresso' },   machine: 'espresso', brew: 1, color: '#5a3422', h: 12 },
  lungo:     { name: { ru: 'Лунго', en: 'Lungo' },         machine: 'espresso', brew: 1.6, color: '#7a4a30', h: 20 },
  milk:      { name: { ru: 'Молоко', en: 'Milk' },         machine: 'frother', color: '#f7efe1', h: 16 },
  foam:      { name: { ru: 'Пена', en: 'Foam' },           machine: 'frother', color: '#fffdf8', h: 11, kind: 'foam' },
  water:     { name: { ru: 'Кипяток', en: 'Hot water' },   color: '#cbe7f4', h: 16, sfx: 'pour' },
  filter:    { name: { ru: 'Фильтр', en: 'Drip coffee' },  machine: 'filter', color: '#8a5634', h: 30 },
  ice:       { name: { ru: 'Лёд', en: 'Ice' },             color: '#dff4fc', h: 12, kind: 'ice', sfx: 'ice' },
  cream:     { name: { ru: 'Сливки', en: 'Whipped cream' }, color: '#fff6e6', h: 12, kind: 'cream', sfx: 'steam' },
  chocolate: { name: { ru: 'Шоколад', en: 'Chocolate' },   color: '#6e3d24', h: 9 },
  caramel:   { name: { ru: 'Карамель', en: 'Caramel' },    color: '#e29a3c', h: 6 },
  vanilla:   { name: { ru: 'Ваниль', en: 'Vanilla' },      color: '#f2df9e', h: 6 },
  gelato:    { name: { ru: 'Джелато', en: 'Gelato' },      color: '#fff3d6', h: 14, kind: 'gelato' },
  cinnamon:  { name: { ru: 'Корица', en: 'Cinnamon' },     color: '#9b5a2e', h: 4, kind: 'sprinkle' },
};

// Рабочее место бариста: настоящее оборудование и что на нём делается
const TOOLS = [
  { id: 'machine', name: { ru: 'Эспрессо-машина', en: 'Espresso machine' }, icon: 'tool_machine', machine: 'espresso', ings: ['ristretto', 'espresso', 'lungo'] },
  { id: 'steam',   name: { ru: 'Паровой питчер', en: 'Steam pitcher' },     icon: 'tool_steam',   machine: 'frother',  ings: ['milk', 'foam'] },
  { id: 'kettle',  name: { ru: 'Чайник', en: 'Kettle' },                    icon: 'water',        ings: ['water'] },
  { id: 'drip',    name: { ru: 'Капельная кофеварка', en: 'Drip brewer' },  icon: 'filter',       machine: 'filter',   ings: ['filter'] },
  { id: 'bar',     name: { ru: 'Барная полка', en: 'Bar shelf' },           icon: 'tool_shelf',   ings: ['ice', 'cream', 'chocolate', 'caramel', 'vanilla', 'gelato', 'cinnamon'] },
];
const INGREDIENT_ORDER = TOOLS.flatMap((tl) => tl.ings);

const CUP_CAPACITY = 5;

// ---------- рецепты ----------
// Итальяно-американская классика. Порядок ингредиентов не важен — важен набор.
const RECIPES = [
  { id: 'espresso',        name: { ru: 'Эспрессо', en: 'Espresso' },                     ings: ['espresso'],                                 price: 8,  cost: 0 },
  { id: 'americano',       name: { ru: 'Американо', en: 'Americano' },                   ings: ['espresso', 'water'],                        price: 10, cost: 0 },
  { id: 'latte',           name: { ru: 'Латте', en: 'Latte' },                           ings: ['espresso', 'milk'],                         price: 13, cost: 0 },
  { id: 'doppio',          name: { ru: 'Доппио', en: 'Doppio' },                         ings: ['espresso', 'espresso'],                     price: 12, cost: 40 },
  { id: 'ristretto',       name: { ru: 'Ристретто', en: 'Ristretto' },                   ings: ['ristretto'],                                price: 9,  cost: 60 },
  { id: 'cappuccino',      name: { ru: 'Капучино', en: 'Cappuccino' },                   ings: ['espresso', 'milk', 'foam'],                 price: 16, cost: 80 },
  { id: 'macchiato',       name: { ru: 'Макиато', en: 'Macchiato' },                     ings: ['espresso', 'foam'],                         price: 12, cost: 110 },
  { id: 'lungo',           name: { ru: 'Лунго', en: 'Lungo' },                           ings: ['lungo'],                                    price: 11, cost: 140 },
  { id: 'cioccolata',      name: { ru: 'Чоколата кальда', en: 'Cioccolata calda' },      ings: ['milk', 'chocolate', 'cream'],               price: 15, cost: 170 },
  { id: 'drip',            name: { ru: 'Фильтр-кофе', en: 'Drip coffee' },               ings: ['filter'],                                   price: 11, cost: 220 },
  { id: 'flatwhite',       name: { ru: 'Флэт уайт', en: 'Flat white' },                  ings: ['ristretto', 'ristretto', 'milk'],           price: 18, cost: 280 },
  { id: 'conpanna',        name: { ru: 'Эспрессо кон панна', en: 'Espresso con panna' }, ings: ['espresso', 'cream'],                        price: 13, cost: 330 },
  { id: 'mocha',           name: { ru: 'Мокко', en: 'Mocha' },                           ings: ['espresso', 'milk', 'chocolate'],            price: 19, cost: 400 },
  { id: 'vanillalatte',    name: { ru: 'Ванильный латте', en: 'Vanilla latte' },         ings: ['espresso', 'milk', 'vanilla'],              price: 20, cost: 480 },
  { id: 'caramelmacchiato', name: { ru: 'Карамельный макиато', en: 'Caramel macchiato' }, ings: ['espresso', 'milk', 'foam', 'caramel'],     price: 22, cost: 580 },
  { id: 'icedlatte',       name: { ru: 'Айс латте', en: 'Iced latte' },                  ings: ['ice', 'espresso', 'milk'],                  price: 21, cost: 680 },
  { id: 'affogato',        name: { ru: 'Аффогато', en: 'Affogato' },                     ings: ['gelato', 'espresso'],                       price: 24, cost: 800 },
  { id: 'marocchino',      name: { ru: 'Марокино', en: 'Marocchino' },                   ings: ['espresso', 'foam', 'chocolate', 'cinnamon'], price: 23, cost: 950 },
];
const RECIPE = Object.fromEntries(RECIPES.map((r, i) => [r.id, { ...r, index: i }]));

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const x = [...a].sort(), y = [...b].sort();
  return x.every((v, i) => v === y[i]);
}
function recipeFor(items) {
  const season = typeof Events !== 'undefined' && Events.drinkId();
  if (season && sameSet(RECIPE[season].ings, items)) return RECIPE[season];
  return RECIPES.find((r) => sameSet(r.ings, items)) || null;
}

// ---------- улучшения ----------
const sec = (v) => (LANG === 'en' ? `${v} s` : `${v} сек`);
// Уют: предметы на подоконнике и в окне. Видны в сцене и дают небольшой бонус.
// key — какой бонус (как у постоянных гостей), v — его размер
const DECOR = [
  { id: 'succulents', cost: 350, key: 'tips', v: 0.05,
    name: { ru: 'Кактусы на подоконник', en: 'Windowsill cacti' }, desc: { ru: '+5% к чаевым', en: '+5% tips' } },
  { id: 'hangplant', cost: 550, key: 'patience', v: 0.05,
    name: { ru: 'Подвесной плющ', en: 'Hanging pothos' }, desc: { ru: 'Гости ждут на 5% дольше', en: 'Guests wait 5% longer' } },
  { id: 'catbed', cost: 800, key: 'cat', v: 1,
    name: { ru: 'Корзинка для кота', en: 'Cat basket' }, desc: { ru: 'Кот приходит каждую ночь и мурчит щедрее', en: 'The cat comes every night and purrs twice as much' } },
  { id: 'neon', cost: 1000, key: 'spawn', v: 0.08,
    name: { ru: 'Неоновая вывеска', en: 'Neon cup sign' }, desc: { ru: 'Видно с улицы: гостей на 8% больше', en: 'Seen from the street: 8% more guests' } },
  { id: 'books', cost: 1300, key: 'price', v: 0.05,
    name: { ru: 'Книги и лампа', en: 'Books and a lamp' }, desc: { ru: 'Уютнее — цены +5%', en: 'Cozier, so prices +5%' } },
  { id: 'gramophone', cost: 1800, key: 'patience', v: 0.08,
    name: { ru: 'Граммофон', en: 'Gramophone' }, desc: { ru: 'Под музыку гости ждут на 8% дольше', en: 'With music, guests wait 8% longer' } },
];
const DECOR_BY_ID = Object.fromEntries(DECOR.map((d) => [d.id, d]));

// Где работаем этой ночью: свой угол или открытые филиалы. need — сколько шагов развития нужно пройти.
// Постоянные гости, кот и уют — только дома, на углу.
const LOCATIONS = [
  { id: 'home', bg: 'bg', need: 0, mods: {},
    name: { ru: 'Угол', en: 'The corner' }, desc: { ru: 'Свой угол: постоянные гости, кот и уют', en: 'Home: regulars, the cat and your decor' } },
  { id: 'brooklyn', bg: 'bk', need: 3, mods: { spawn: 1.25, tips: 1.2 },
    name: { ru: 'Бруклин', en: 'Brooklyn' }, desc: { ru: 'Людно и щедро: гостей +25%, чаевые +20%', en: 'Busy and generous: 25% more guests, tips +20%' } },
  { id: 'fifth', bg: 'fa', need: 5, mods: { price: 1.35, patience: 0.8 },
    name: { ru: 'Пятая авеню', en: 'Fifth Avenue' }, desc: { ru: 'Цены +35%, но гости нетерпеливы', en: 'Prices +35%, but impatient guests' } },
];
const LOCATION = Object.fromEntries(LOCATIONS.map((l) => [l.id, l]));

// Развитие кофейни: шаги по порядку, каждый приносит доход за ночь и открывает кусочек истории
const BUSINESS = [
  { id: 'barista', cost: 1500, income: 60, price: 0,
    name: { ru: 'Нанять баристу', en: 'Hire a barista' },
    desc: { ru: 'Нико помогает за стойкой: варит простые напитки сам. И дневные смены: +60 за ночь', en: 'Nico helps at the bar, brewing simple drinks on his own. Plus day shifts: +60 a night' },
    story: { ru: 'Нико, сын Тони, завязывает фартук. «Учись у Sälem», — сказал ему отец. Теперь кофейня работает и днём.', en: "Nico, Tony's son, ties on the apron. «Learn from Sälem», his father said. Now the café is open by day, too." } },
  { id: 'cart', cost: 4000, income: 150, price: 0,
    name: { ru: 'Тележка в парке', en: 'Coffee cart in the park' },
    desc: { ru: 'Марко возит кофе бегунам: +150 за ночь', en: 'Marco serves the morning joggers: +150 a night' },
    story: { ru: 'Марко прикрутил к велосипеду тележку с кофемашиной. Утром в парке очередь — все спрашивают, где сам Sälem.', en: 'Marco bolted an espresso cart to his bike. By morning there is a line in the park — everyone asks where the real Sälem is.' } },
  { id: 'brooklyn', cost: 10000, income: 400, price: 0.1,
    name: { ru: 'Второй Sälem в Бруклине', en: 'Second Sälem in Brooklyn' },
    desc: { ru: '+400 за ночь, цены +10%', en: '+400 a night, prices +10%' },
    story: { ru: 'Старая пекарня у моста, кирпич и большие окна. Джина привела весь салон на открытие. На вывеске — тот же Sälem.', en: 'An old bakery by the bridge, brick walls and tall windows. Gina brought the whole salon to the opening. Same Sälem on the sign.' } },
  { id: 'roastery', cost: 25000, income: 900, price: 0.1,
    name: { ru: 'Своя обжарка', en: 'Our own roastery' },
    desc: { ru: '+900 за ночь, цены ещё +10%', en: '+900 a night, prices another +10%' },
    story: { ru: 'Профессор Сал рассчитал профиль обжарки «как орбиту». Зерно пахнет шоколадом и дождём. Нонна Роза одобрила.', en: 'Professor Sal plotted the roast curve «like an orbit». The beans smell of chocolate and rain. Nonna Rosa approves.' } },
  { id: 'manhattan', cost: 60000, income: 2000, price: 0,
    name: { ru: 'Sälem на Пятой авеню', en: 'Sälem on Fifth Avenue' },
    desc: { ru: 'Флагман в центре: +2000 за ночь', en: 'The flagship downtown: +2000 a night' },
    story: { ru: 'Лео играет на открытии ту самую медленную мелодию, София читает первую главу. А ты всё равно возвращаешься на свой угол — сюда, к дождю за окном.', en: 'Leo plays that slow tune at the opening, Sofia reads the first chapter. And you still come back to your corner — here, to the rain on the glass.' } },
];

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
  { id: 'tony', name: { ru: 'Тони', en: 'Tony' }, fav: 'doppio', minDay: 2,
    look: { skin: '#e8b892', hair: '#1b1b1b', style: 'slick', head: 'square', build: 1.15, nose: 'long', mustache: true, shirt: '#c8372d', shirt2: '#fff6ec', outfit: 'apron', eye: '#3b2a22', acc: [] },
    perk: { text: { ru: 'Кофемашина на 5% быстрее', en: 'Espresso machine 5% faster' }, key: 'espresso', v: 0.05 },
    story: {
      ru: [
        'Тони, пиццерия за углом. Доппио — и обратно к печи.',
        'Соус кипит с шести утра. Твой кофе — единственное, что держит меня на ногах.',
        'Сын хочет стать баристой. Я сказал: учись у Sälem.',
        'Теперь мы соседи по-настоящему: снял помещение рядом с тобой. Будет хлебная печь!',
        'Первая буханка — твоя. От пекарни на углу — кофейне на углу.',
      ],
      en: [
        'Tony, from the pizzeria around the corner. A doppio, then back to the oven.',
        "The sauce has been simmering since six. Your coffee's the only thing keeping me upright.",
        'My son wants to be a barista. I told him: learn from Sälem.',
        "We're real neighbors now: I took the space next door. A bread oven is coming!",
        'The first loaf is yours. From the bakery on the corner to the café on the corner.',
      ] } },
  { id: 'rosa', name: { ru: 'Нонна Роза', en: 'Nonna Rosa' }, fav: 'cioccolata', minDay: 2,
    look: { skin: '#f1c9a5', hair: '#d9d4cc', style: 'bun', head: 'round', build: 1.0, nose: 'button', age: 'old', shirt: '#5b3a6e', shirt2: '#f6e3c8', outfit: 'cardigan', pattern: 'dots', eye: '#5b7a99', acc: ['glasses', 'scarf'] },
    perk: { text: { ru: '+5% к чаевым', en: '+5% tips' }, key: 'tips', v: 0.05 },
    story: {
      ru: [
        'Я Роза. Горячий шоколад со сливками, cara. В моём возрасте можно всё.',
        'Мой Джузеппе сорок лет пил здесь эспрессо. Теперь я хожу за двоих.',
        'Вяжу шаль. Цвет — как у твоего шоколада.',
        'Внук приехал из колледжа. Пьёт что-то с тыквой. Ничего, перевоспитаем.',
        'Это тебе — та самая шаль. Носи. И не смей закрываться по воскресеньям.',
      ],
      en: [
        "I'm Rosa. Hot chocolate with cream, cara. At my age, everything is allowed.",
        'My Giuseppe drank espresso here for forty years. Now I come for both of us.',
        "I'm knitting a shawl. The color of your hot chocolate.",
        "My grandson's back from college. Drinks something with pumpkin in it. We'll fix that.",
        "This is for you — that very shawl. Wear it. And don't you dare close on Sundays.",
      ] } },
  { id: 'gina', name: { ru: 'Джина', en: 'Gina' }, fav: 'cappuccino', minDay: 3,
    look: { skin: '#d9a07a', hair: '#2b1d16', style: 'big', head: 'oval', build: 0.95, nose: 'small', shirt: '#e07a5f', shirt2: '#fff6ec', outfit: 'collar', pattern: 'stripes', eye: '#4a3020', lash: true, earring: true, acc: [] },
    perk: { text: { ru: 'Гости ждут на 5% дольше', en: 'Guests wait 5% longer' }, key: 'patience', v: 0.05 },
    story: {
      ru: [
        'Джина, салон напротив. Капучино — и у меня три клиентки подряд.',
        'Я слышу все сплетни района. Про тебя говорят только хорошее. Пока.',
        'Твоя пена сегодня лучше моей укладки. Это комплимент.',
        'Привела всех девочек из салона. Теперь они заходят сюда перед сменой.',
        'Стрижка за мой счёт. Пожизненно. Бариста должен выглядеть на миллион.',
      ],
      en: [
        'Gina, from the salon across the street. Cappuccino, then three clients back to back.',
        'I hear every bit of gossip on the block. About you, only good things. So far.',
        "Your foam today is better than my blowout. That's a compliment.",
        'I brought all the girls from the salon. Now they stop by before their shifts.',
        "Haircuts on me. For life. A barista's got to look like a million bucks.",
      ] } },
  { id: 'sal', name: { ru: 'Профессор Сал', en: 'Professor Sal' }, fav: 'ristretto', minDay: 3,
    look: { skin: '#e3b48f', hair: '#9a9a9a', style: 'bald', head: 'long', build: 1.0, nose: 'hook', age: 'old', mustache: true, shirt: '#6b4f3a', shirt2: '#f2f2f2', outfit: 'vest', eye: '#3b2a22', acc: ['glasses', 'bowtie'] },
    perk: { text: { ru: 'Смена длится на 10 секунд дольше', en: 'Shifts last 10 seconds longer' }, key: 'shift', v: 10 },
    story: {
      ru: [
        'Сальваторе. Для студентов — профессор. Ристретто. Без сахара, без разговоров.',
        'Кофе пьют даже на орбите. Но хуже вашего — говорю как учёный.',
        'Студенты считают меня строгим. Не говорите им, что здесь я улыбаюсь.',
        'Открыли новую комету. Хотел назвать «Ристретто». Комитет против.',
        'Назвал астероид в честь вашей кофейни. Официально. Sälem теперь летает в космосе.',
      ],
      en: [
        'Salvatore. Professor, to my students. Ristretto. No sugar, no small talk.',
        'They drink coffee even in orbit. Worse than yours, I say as a scientist.',
        "My students think I'm strict. Don't tell them I smile in here.",
        'We found a new comet. I wanted to call it “Ristretto”. The committee said no.',
        'I named an asteroid after your café. Officially. Sälem is now flying through space.',
      ] } },
  { id: 'marco', name: { ru: 'Марко', en: 'Marco' }, fav: 'flatwhite', minDay: 4,
    look: { skin: '#8d5a3b', hair: '#1b1b1b', style: 'curly', head: 'round', build: 1.05, nose: 'button', shirt: '#f2a541', shirt2: '#3d405b', outfit: 'tee', eye: '#2b1d16', acc: ['helmet'] },
    perk: { text: { ru: 'Гости приходят на 5% чаще', en: 'Guests arrive 5% more often' }, key: 'spawn', v: 0.05 },
    story: {
      ru: [
        'Марко, курьер на велике. Флэт уайт — и я снова в седле.',
        'Сорок километров сегодня. Половину — думая о твоём кофе.',
        'Рассказываю о тебе каждому клиенту. Бесплатная реклама, не благодари.',
        'Выиграл гонку по Бруклину! На финише представлял, что еду сюда.',
        'На рюкзаке теперь наклейка Sälem. Полгорода спрашивает, где это.',
      ],
      en: [
        "Marco, bike courier. Flat white and I'm back in the saddle.",
        'Forty kilometers today. Half of them thinking about your coffee.',
        "I tell every customer about you. Free advertising, don't mention it.",
        'I won the Brooklyn race! At the finish line I pictured riding here.',
        "There's a Sälem sticker on my backpack now. Half the city asks where it is.",
      ] } },
  { id: 'sofia', name: { ru: 'София', en: 'Sofia' }, fav: 'vanillalatte', minDay: 5,
    look: { skin: '#f3cfb3', hair: '#3d2b56', style: 'bob', head: 'oval', build: 0.9, nose: 'small', shirt: '#264653', shirt2: '#fff', outfit: 'turtleneck', eye: '#5b3a6e', lash: true, acc: ['pencil'] },
    perk: { text: { ru: '+5% к цене напитков', en: '+5% drink prices' }, key: 'price', v: 0.05 },
    story: {
      ru: [
        'Я София, пишу роман. Ванильный латте и тихий угол.',
        'Героиня моего романа работает в кофейне. Совпадение? Не думаю.',
        'Застряла на двенадцатой главе. Сегодня послаще, пожалуйста.',
        'Издательство ответило! Им понравилось. Особенно сцены в кофейне.',
        'Книга вышла. На первой странице: «Баристе, который знал мой заказ».',
      ],
      en: [
        "I'm Sofia, I'm writing a novel. Vanilla latte and a quiet corner.",
        "My heroine works in a coffee shop. Coincidence? I don't think so.",
        'Stuck on chapter twelve. A little sweeter today, please.',
        'The publisher wrote back! They loved it. Especially the café scenes.',
        'The book is out. First page: “To the barista who knew my order.”',
      ] } },
  { id: 'leo', name: { ru: 'Лео', en: 'Leo' }, fav: 'affogato', minDay: 6,
    look: { skin: '#6b4128', hair: '#1b1b1b', style: 'short', head: 'long', build: 1.0, nose: 'long', shirt: '#3d405b', shirt2: '#fff', outfit: 'collar', eye: '#1b1b1b', acc: ['flatcap', 'tie'] },
    perk: { text: { ru: 'Паровик на 5% быстрее', en: 'Steam wand 5% faster' }, key: 'frother', v: 0.05 },
    story: {
      ru: [
        'Лео. Играю на саксе в клубе за углом. Аффогато — мой десерт перед выступлением.',
        'Ночью джаз, утром кофе. Между ними ничего интересного.',
        'Написал мелодию про твою кофейню. Медленную. Как пенка на капучино.',
        'Нас позвали на фестиваль! Ту самую мелодию сыграем первой.',
        'Пластинка вышла. Третий трек называется «Sälem». Слушать с аффогато.',
      ],
      en: [
        "Leo. I play sax at the club around the corner. Affogato's my pre-show dessert.",
        'Jazz at night, coffee in the morning. Nothing much in between.',
        'I wrote a tune about your café. Slow. Like foam on a cappuccino.',
        "We got booked for the festival! We're opening with that tune.",
        "The record's out. Track three is called “Sälem”. Best with an affogato.",
      ] } },
];
const REGULAR = Object.fromEntries(REGULARS.map((r) => [r.id, r]));

// ---------- внешность случайных гостей ----------
const SKINS = ['#f6d5bd', '#f1c9a5', '#e8b892', '#d9a07a', '#b97a52', '#8d5a3b', '#6b4128'];
const HAIRS = ['#2b1d16', '#4a3020', '#7a4a2a', '#c8553d', '#e3b866', '#1b1b1b', '#8d8d8d', '#d9d4cc', '#a0522d'];
const SHIRTS = ['#c8372d', '#2f6b4f', '#f2cc8f', '#3d405b', '#6d9dc5', '#c08497', '#f4a259', '#8e7dbe', '#5fa8a0', '#d6604d', '#9c6644', '#264653'];
const SHIRTS2 = ['#fff8ee', '#f4f1de', '#3d405b', '#e9c46a', '#f2cc8f', '#ffffff'];
const EYES = ['#3b2a22', '#4a3020', '#5b7a99', '#4f8a4c', '#6b4f3a', '#2b1d16'];
const STYLES = ['short', 'long', 'bun', 'curly', 'bob', 'ponytail', 'slick', 'cap', 'beanie', 'short', 'big', 'wavy', 'buzz'];
const OUTFITS = ['tee', 'hoodie', 'sweater', 'collar', 'cardigan', 'turtleneck', 'apron', 'vest'];
const HEADS = ['round', 'round', 'oval', 'square', 'long'];
const NOSES = ['button', 'small', 'long', 'hook'];
const PATTERNS = ['none', 'none', 'none', 'stripes', 'dots', 'check'];

function randomLook() {
  const acc = [];
  if (Math.random() < 0.2) acc.push('glasses');
  if (Math.random() < 0.08) acc.push('beard');
  if (Math.random() < 0.1) acc.push('flatcap');
  const age = Math.random() < 0.15 ? 'old' : 'adult';
  return {
    skin: pick(SKINS), hair: age === 'old' ? pick(['#d9d4cc', '#8d8d8d', '#bfb8ad']) : pick(HAIRS), style: pick(STYLES), shirt: pick(SHIRTS), shirt2: pick(SHIRTS2), hat: pick(SHIRTS),
    sprite: pick(Sprites.GUESTS),
    outfit: pick(OUTFITS), pattern: pick(PATTERNS), head: pick(HEADS), build: rand(0.88, 1.15), nose: pick(NOSES), age,
    mustache: Math.random() < 0.12, eye: pick(EYES), freckles: Math.random() < 0.12, lash: Math.random() < 0.4, earring: Math.random() < 0.2, acc,
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
