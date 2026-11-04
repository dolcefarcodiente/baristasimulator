// Короткие реплики гостей в рамке диалога: имя на табличке и текст, печатающийся по буквам.
// Постоянные говорят своими словами, случайные гости — по своему портрету или общими ночными фразами.

const TALK = {
  greet: {
    tony: {
      en: ["Oven's still hot, so I gotta be quick. You know the drill.", "Rain's bad for pizza. Good for coffee, though.", 'Late shift at the pizzeria. Keep me upright, friend.'],
      ru: ['Печь ещё горячая, так что я быстро. Ты знаешь, что мне.', 'Дождь — плохо для пиццы. А для кофе — самое то.', 'Ночная смена в пиццерии. Подкрепи меня, друг.'],
    },
    rosa: {
      en: ['Such weather! My knees warned me this morning.', "Cara, I can't sleep anyway. Better here than with the TV.", 'Giuseppe loved nights like this. Rain on the glass, a warm cup.'],
      ru: ['Ну и погодка! Колени ещё утром предупредили.', 'Cara, мне всё равно не спится. Лучше здесь, чем с телевизором.', 'Джузеппе любил такие ночи: дождь по стеклу и тёплая чашка.'],
    },
    gina: {
      en: ["My hair did NOT survive that rain. Don't look.", "Last client cancelled. I'm treating myself.", 'Okay, gossip time. But first — coffee.'],
      ru: ['Моя укладка этот дождь НЕ пережила. Не смотри.', 'Последняя клиентка отменилась. Балую себя.', 'Так, время сплетен. Но сначала — кофе.'],
    },
    sal: {
      en: ['Clouds all night. No stars to look at, so — coffee.', 'Did you know the smell of rain has a name? Petrichor.', 'The observatory closed early. You, thankfully, did not.'],
      ru: ['Всю ночь облака. Звёзд не видно — значит, кофе.', 'Знаешь, у запаха дождя есть имя — петрикор.', 'Обсерваторию закрыли пораньше. А ты, к счастью, нет.'],
    },
    marco: {
      en: ['Last delivery of the night. Soaked to the bone!', "The bike's chained outside. Five minutes, then back out there.", 'Wet streets are fast streets. Just not for me.'],
      ru: ['Последняя доставка за ночь. Промок до нитки!', 'Велик пристёгнут у двери. Пять минут — и обратно.', 'По мокрому асфальту все летят. Кроме меня.'],
    },
    sofia: {
      en: ['Rain is perfect for writing. And for something sweet.', "Chapter fourteen happens in a café at night. Guess which one.", "Can I take the corner table? I won't be loud. Just typing."],
      ru: ['Дождь — лучшая погода для текста. И для сладкого.', 'Четырнадцатая глава — в ночном кафе. Угадай, в каком.', 'Можно угловой столик? Я тихо. Только печатаю.'],
    },
    leo: {
      en: ['Between sets. The crowd loves a rainy night.', 'Played that slow tune again tonight. Thought of this place.', "Club's packed, my reed's cracked. Sweeten my night."],
      ru: ['Перерыв между сетами. Публика обожает дождливые ночи.', 'Сегодня снова играл ту медленную. Думал об этом месте.', 'Клуб битком, трость треснула. Подсласти мне вечер.'],
    },
  },
  // случайные гости: у каждого портрета свой характер
  sprite: {
    g1: { en: ['Hi! Is it always this cozy in here?', 'Forgot my umbrella. Again.'], ru: ['Привет! Тут всегда так уютно?', 'Забыла зонт. Опять.'] },
    g2: { en: ["Evening. Nothing fancy, son. Just good and hot.", "Back in my day this corner was a bakery."], ru: ['Добрый вечер. Без изысков, сынок. Просто горячо и вкусно.', 'В моё время на этом углу была пекарня.'] },
    g3: { en: ['Uh, hi. My friend said this place is cool.', "I'm just here till the rain stops. Probably."], ru: ['Э-э, привет. Друг сказал, тут классно.', 'Я только переждать дождь. Наверное.'] },
    g4: { en: ['Late lab night. I need fuel.', 'Ooh, it smells wonderful in here.'], ru: ['Засиделась в лаборатории. Нужно топливо.', 'Ох, как тут вкусно пахнет.'] },
    g5: { en: ["Ha! Made it before closing. What's good tonight?", 'Smells like home in here, you know that?'], ru: ['Ха! Успел до закрытия. Что сегодня вкусного?', 'Тут пахнет как дома, знаешь?'] },
    g6: { en: ["It's pouring out there! I love it.", 'First time here. Surprise me — no, wait, I know what I want.'], ru: ['Там льёт как из ведра! Обожаю.', 'Я тут впервые. Удиви меня — хотя нет, я знаю, что хочу.'] },
    g7: { en: ['Long day. Longer night. Please.', 'The office lights are still on across the street. Not mine anymore.'], ru: ['Длинный день. Ещё длиннее ночь. Пожалуйста.', 'В офисе напротив всё ещё горит свет. Уже не мой.'] },
    g8: { en: ['Good evening! The window lights looked so warm from outside.', 'Waiting for my sister. She is always late.'], ru: ['Добрый вечер! Окна снаружи светятся так тепло.', 'Жду сестру. Она вечно опаздывает.'] },
  },
  special: {
    critic: {
      en: ['Bellini. I write about coffee. Impress me.', 'I have tasted espresso in Naples. Let us see.'],
      ru: ['Беллини. Пишу о кофе. Удивите меня.', 'Я пил эспрессо в Неаполе. Посмотрим.'],
    },
    tourists: {
      en: ['Three of us! Our guidebook says you are the best on this street!', 'We got lost in the rain and found you!'],
      ru: ['Нас трое! В путеводителе сказано, что вы лучшие на улице!', 'Мы заблудились под дождём — и нашли вас!'],
    },
    owl: {
      en: ['Sorry, I know you are closing. Two to go, please?', 'Last train is in twenty minutes. Two coffees, please.'],
      ru: ['Простите, знаю, вы закрываетесь. Два с собой?', 'Последний поезд через двадцать минут. Два кофе, пожалуйста.'],
    },
  },
  nico: {
    en: (d) => [`${d}, coming right up!`, `I've got the ${d.toLowerCase()} — you handle the rest.`, `Dad says the ${d.toLowerCase()} is my best one.`],
    ru: (d) => [`${d}, уже несу!`, `${d} беру на себя — ты занимайся остальным.`, `Папа говорит, ${d.toLowerCase()} у меня лучше всего.`],
  },
  night: {
    en: ['Just in time. The rain picked up.', 'You open this late? Bless you.', 'One coffee and I can face the night.', "It's the only warm window on the block.", 'Mind if I drip on your floor a little?', 'The city sounds so quiet in the rain.'],
    ru: ['Как раз вовремя — дождь усилился.', 'Вы работаете так поздно? Спасибо вам.', 'Одна чашка — и я готов к ночи.', 'Единственное тёплое окно на всей улице.', 'Можно я немного накапаю на пол?', 'Как тихо звучит город под дождём.'],
  },
  thanks: {
    en: ['Perfect. Just perfect.', "Mm. That's the stuff.", "I'll be back. Count on it.", 'You made my night.', 'Grazie mille!', 'Exactly what I needed.'],
    ru: ['Идеально. Просто идеально.', 'М-м. Вот это да.', 'Я вернусь. Точно.', 'Ты спас мой вечер.', 'Grazie mille!', 'Именно то, что нужно.'],
  },
  upset: {
    en: ["Forget it. I'll find coffee elsewhere.", 'Too long. Too wet. Goodbye.', 'Maybe another night.'],
    ru: ['Ладно. Найду кофе в другом месте.', 'Слишком долго. И слишком мокро. Пока.', 'Может, в другой раз.'],
  },
};

// Вопросы постоянных: два ответа, good — тот, что им по душе (+1 сердечко, когда получат кофе)
const Q = (en, ru, a, r, good) => ({ q: { en, ru }, a, r, good });
const ASK = {
  tony: [
    Q('My son wants to quit school and make coffee. What do I tell him?', 'Сын хочет бросить учёбу и варить кофе. Что ему сказать?',
      [{ en: 'Let him try a summer at the bar', ru: 'Пусть попробует лето за стойкой' }, { en: 'School first, coffee later', ru: 'Сначала учёба, потом кофе' }],
      [{ en: 'A summer, eh? Fine. But he starts with the dishes!', ru: 'Лето, говоришь? Ладно. Но начнёт с посуды!' }, { en: 'Hm. Sensible. Boring, but sensible.', ru: 'Хм. Разумно. Скучно, но разумно.' }], 0),
    Q('Pineapple on pizza. Yes or no?', 'Ананас на пицце. Да или нет?',
      [{ en: 'Never. Not in this house', ru: 'Никогда. Не в этом доме' }, { en: "Why not, if it's tasty?", ru: 'А почему нет, если вкусно?' }],
      [{ en: 'Ha! Finally, someone with taste.', ru: 'Ха! Наконец-то человек со вкусом.' }, { en: "Tasty?! I'll pretend I didn't hear that.", ru: 'Вкусно?! Сделаю вид, что не слышал.' }], 0),
  ],
  rosa: [
    Q('Cara, you work so late. Is there someone special?', 'Cara, ты так поздно работаешь. Есть кто-то особенный?',
      [{ en: 'The café is my someone', ru: 'Моя любовь — кофейня' }, { en: 'Not yet, Nonna', ru: 'Пока нет, нонна' }],
      [{ en: "Pfft. A café can't hug you. Rest sometimes.", ru: 'Пфф. Кофейня не обнимет. Отдыхай иногда.' }, { en: '«Yet» — good. I will ask again next week.', ru: '«Пока» — это хорошо. Спрошу через неделю.' }], 1),
    Q('Giuseppe always said: the secret is patience. Agree?', 'Джузеппе говорил: весь секрет в терпении. Согласна?',
      [{ en: 'Patience — and good beans', ru: 'В терпении — и в хорошем зерне' }, { en: "I'm always in a hurry", ru: 'Я вечно тороплюсь' }],
      [{ en: "Ha! He'd have liked you.", ru: 'Ха! Ты бы ему понравилась.' }, { en: 'Then slow down, cara. The coffee will wait.', ru: 'Так притормози, cara. Кофе подождёт.' }], 0),
  ],
  gina: [
    Q('Be honest — bangs or no bangs?', 'Только честно — чёлку или не надо?',
      [{ en: 'Bangs. Be bold', ru: 'Чёлку. Смелее' }, { en: 'Keep it as it is', ru: 'Оставь как есть' }],
      [{ en: 'Yes! Tomorrow I cut them.', ru: 'Да! Завтра стригу.' }, { en: 'Safe choice. You sound like my mother.', ru: 'Осторожно. Ты прямо как моя мама.' }], 0),
    Q('Someone says your foam is too thick. Want to know who?', 'Кто-то говорит, что у тебя слишком густая пена. Сказать кто?',
      [{ en: 'No, let them talk', ru: 'Нет, пусть болтают' }, { en: 'Who?!', ru: 'Кто?!' }],
      [{ en: "Classy. That's why you're my favorite.", ru: 'Стильно. Поэтому ты мой любимчик.' }, { en: 'Ha, never. Gossip has rules.', ru: 'Ха, ни за что. У сплетен свои правила.' }], 0),
  ],
  sal: [
    Q('Do you think we are alone in the universe?', 'Как думаешь, мы одни во Вселенной?',
      [{ en: "Not tonight — you're here", ru: 'Не сегодня — вы же здесь' }, { en: 'Probably yes', ru: 'Наверное, да' }],
      [{ en: '…That was surprisingly kind.', ru: '…Неожиданно тепло сказано.' }, { en: 'Statistically unlikely. But fine.', ru: 'Статистически маловероятно. Но ладно.' }], 0),
    Q('My students fell asleep in my lecture. Was it me?', 'Студенты уснули на моей лекции. Это из-за меня?',
      [{ en: 'It was the lack of coffee', ru: 'Это им кофе не хватило' }, { en: 'Maybe a little you', ru: 'Может, немножко из-за вас' }],
      [{ en: "Yes. That's the official version now.", ru: 'Да. Это теперь официальная версия.' }, { en: 'Hm. Honesty. I respect it. Mostly.', ru: 'Хм. Честно. Уважаю. Почти.' }], 0),
  ],
  marco: [
    Q('Rain or sun — which is better for riding?', 'Дождь или солнце — в чём лучше кататься?',
      [{ en: 'Rain — you fly through puddles', ru: 'Дождь — летишь по лужам' }, { en: 'Sun, obviously', ru: 'Солнце, конечно' }],
      [{ en: 'Exactly! Nobody gets it but you.', ru: 'Вот! Никто, кроме тебя, не понимает.' }, { en: 'Pff, sun is for tourists.', ru: 'Пфф, солнце — для туристов.' }], 0),
    Q('Should I enter the Brooklyn race again?', 'Снова записаться на гонку в Бруклине?',
      [{ en: 'Go for the win', ru: 'Иди за победой' }, { en: 'Take a break this year', ru: 'Отдохни в этом году' }],
      [{ en: 'That is exactly what I needed to hear!', ru: 'Именно это мне и нужно было услышать!' }, { en: 'Maybe… my knees agree with you.', ru: 'Может быть… колени с тобой согласны.' }], 0),
  ],
  sofia: [
    Q('My heroine must choose: stay in the city or leave. What would you do?', 'Героиня должна выбрать: остаться в городе или уехать. А ты бы как?',
      [{ en: 'Stay — the city needs her', ru: 'Остаться — она нужна городу' }, { en: 'Leave, and come back changed', ru: 'Уехать и вернуться другой' }],
      [{ en: 'Hm, safe… but true.', ru: 'Хм, надёжно… но правда.' }, { en: "Oh. That's the ending. Thank you!", ru: 'Ох. Это и есть финал. Спасибо!' }], 1),
    Q('Do you ever read the stories in your customers?', 'Ты читаешь истории своих гостей?',
      [{ en: 'Every face is a story', ru: 'Каждое лицо — история' }, { en: 'I just read the orders', ru: 'Я читаю только заказы' }],
      [{ en: "I'm stealing that line.", ru: 'Эту фразу я украду.' }, { en: 'Ha! Fair enough, barista.', ru: 'Ха! Справедливо, бариста.' }], 0),
  ],
  leo: [
    Q('Should a song end loud or quiet?', 'Песня должна заканчиваться громко или тихо?',
      [{ en: 'Quiet, like the last cup', ru: 'Тихо, как последняя чашка' }, { en: 'Loud, with a big finish', ru: 'Громко, с большим финалом' }],
      [{ en: "…Yeah. That's the one.", ru: '…Да. Вот оно.' }, { en: 'Loud, huh? Maybe for the festival.', ru: 'Громко, значит? Может, для фестиваля.' }], 0),
    Q('Name my next tune. Go.', 'Придумай название моей новой мелодии. Ну?',
      [{ en: '«Rain on Fifth»', ru: '«Дождь на Пятой»' }, { en: '«Song No. 7»', ru: '«Песня № 7»' }],
      [{ en: "Oh, that's beautiful. It's yours now.", ru: 'Ох, как красиво. Теперь она твоя.' }, { en: 'Hm. Very… numbered.', ru: 'Хм. Очень… пронумеровано.' }], 0),
  ],
};

const Talk = (() => {
  const el = document.getElementById('talk');
  const who = el.querySelector('.who');
  const say = el.querySelector('.say');
  let cur = null, queue = [];
  const lines = (set) => set[LANG] || set.en;

  const choices = document.createElement('div');
  choices.className = 'choices';
  el.appendChild(choices);
  let asked = 0; // вопросов за смену

  function push(name, text, regular) {
    if (Shift.tutorial) return;
    // реплики не копятся: максимум одна в очереди, свежая вытесняет старую
    queue = [{ name, text, regular }];
    if (!cur) next();
    else if (cur.ask) return; // вопрос не перебиваем
  }
  function next(item) {
    cur = item || queue.shift() || null;
    choices.innerHTML = '';
    if (!cur) { el.classList.add('hidden'); return; }
    cur.shown = 0; cur.hold = 0;
    who.textContent = cur.name;
    who.className = 'who' + (cur.regular ? '' : ' guest');
    say.textContent = '';
    el.classList.remove('hidden', 'in'); void el.offsetWidth; el.classList.add('in');
  }
  function update(dt) {
    if (!cur) return;
    if (cur.shown < cur.text.length) {
      const before = Math.floor(cur.shown);
      cur.shown = Math.min(cur.text.length, cur.shown + dt * 38);
      const n = Math.floor(cur.shown);
      if (n !== before) {
        say.textContent = cur.text.slice(0, n);
        if (n % 3 === 0 && cur.text[n - 1] !== ' ') Sound.play('blip');
      }
      if (cur.shown >= cur.text.length) say.insertAdjacentHTML('beforeend', '<span class="caret"></span>');
      return;
    }
    cur.hold += dt;
    if (cur.ask) {
      // вопрос ждёт ответа: кнопки появляются, когда текст допечатан; молчание — тоже ответ
      if (!choices.firstChild) choices.innerHTML = cur.ask.qd.a.map((a, i) => `<button class="choice" data-choice="${i}">${L(a)}</button>`).join('');
      if (cur.hold > 9 || cur.ask.cu.state === 'leave') answer(-1);
      return;
    }
    if (cur.hold > 2.4 + cur.text.length * 0.025 || (queue.length && cur.hold > 0.9)) next();
  }
  const L = (o) => o[LANG] || o.en;

  function answer(i) {
    if (!cur || !cur.ask) return;
    const { cu, qd, idx } = cur.ask;
    const st = regState(cu.reg);
    if (i >= 0) st.asked = [...(st.asked || []), idx]; // без ответа вопрос прозвучит в другой раз
    const name = cur.name;
    if (i === qd.good) {
      cu.bonusHeart = 1; cu.joyT = 1.2;
      Art.burst(cu.dx, cu.hy - cu.r, 'heart', 3);
      Sound.play('story');
    } else Sound.play('tap');
    next(i >= 0 ? { name, text: L(qd.r[i]), regular: true } : null);
  }
  choices.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('[data-choice]');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    answer(+b.dataset.choice);
  });

  // Постоянный гость, с которым уже знакомы, иногда спрашивает что-то — до двух вопросов за смену
  function tryAsk(cu) {
    if (!cu.reg || !ASK[cu.reg] || S.day < 3 || asked >= 2 || regState(cu.reg).visits === 0 || Math.random() > 0.5) return false;
    if (cur && cur.ask) return false;
    const done = regState(cu.reg).asked || [];
    const idx = ASK[cu.reg].findIndex((_, k) => !done.includes(k));
    if (idx < 0) return false;
    asked++;
    queue = [];
    next({ name: nameOf(cu), text: L(ASK[cu.reg][idx].q), regular: true, ask: { cu, qd: ASK[cu.reg][idx], idx } });
    return true;
  }
  function nameOf(cu) { return cu.reg ? T(REGULAR[cu.reg].name) : cu.kind ? T(SPECIAL[cu.kind].name) : t('guestName'); }

  return {
    update,
    // гость подошёл к стойке
    greet(cu) {
      let pool;
      if (cu.kind) { push(nameOf(cu), pick(lines(TALK.special[cu.kind])), true); return; }
      if (tryAsk(cu)) return;
      if (cu.reg) pool = lines(TALK.greet[cu.reg]);
      else if (Math.random() < 0.5 && TALK.sprite[cu.look && cu.look.sprite]) pool = lines(TALK.sprite[cu.look.sprite]);
      else pool = lines(TALK.night);
      if (cu.reg || Math.random() < 0.6) push(nameOf(cu), pick(pool), !!cu.reg);
    },
    thanks(cu) { if (cu.kind === 'critic') return; if (cu.reg || cu.kind || Math.random() < 0.35) push(nameOf(cu), pick(lines(TALK.thanks)), !!cu.reg); },
    upset(cu) { push(nameOf(cu), pick(lines(TALK.upset)), !!cu.reg); },
    nico(drink) { push(t('nicoName'), pick((TALK.nico[LANG] || TALK.nico.en)(drink)), true); },
    clear() { queue = []; cur = null; asked = 0; choices.innerHTML = ''; el.classList.add('hidden'); },
  };
})();
