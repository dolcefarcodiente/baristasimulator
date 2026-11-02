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

const Talk = (() => {
  const el = document.getElementById('talk');
  const who = el.querySelector('.who');
  const say = el.querySelector('.say');
  let cur = null, queue = [];
  const lines = (set) => set[LANG] || set.en;

  function push(name, text, regular) {
    if (Shift.tutorial) return;
    // реплики не копятся: максимум одна в очереди, свежая вытесняет старую
    queue = [{ name, text, regular }];
    if (!cur) next();
  }
  function next() {
    cur = queue.shift() || null;
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
    if (cur.hold > 2.4 + cur.text.length * 0.025 || (queue.length && cur.hold > 0.9)) next();
  }
  function nameOf(cu) { return cu.reg ? T(REGULAR[cu.reg].name) : t('guestName'); }

  return {
    update,
    // гость подошёл к стойке
    greet(cu) {
      let pool;
      if (cu.reg) pool = lines(TALK.greet[cu.reg]);
      else if (Math.random() < 0.5 && TALK.sprite[cu.look && cu.look.sprite]) pool = lines(TALK.sprite[cu.look.sprite]);
      else pool = lines(TALK.night);
      if (cu.reg || Math.random() < 0.6) push(nameOf(cu), pick(pool), !!cu.reg);
    },
    thanks(cu) { if (cu.reg || Math.random() < 0.35) push(nameOf(cu), pick(lines(TALK.thanks)), !!cu.reg); },
    upset(cu) { push(nameOf(cu), pick(lines(TALK.upset)), !!cu.reg); },
    clear() { queue = []; cur = null; el.classList.add('hidden'); },
  };
})();
