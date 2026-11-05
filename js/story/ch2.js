// Глава 2 «Воображаемая ваниль»: Роза учит капучино, Джина рассказывает «диснеевскую» версию названия,
// а после закрытия София возвращается — и на полке уже стоит настоящая ваниль.

STORY_CH.ch2 = {
  num: { en: 'Chapter 2', ru: 'Глава 2' },
  title: { en: 'Imaginary Vanilla', ru: 'Воображаемая ваниль' },
  // вторая ночь: добавился капучино, а к закрытию — ваниль на полке
  bar: { recipes: ['espresso', 'americano', 'latte', 'cappuccino', 'vanillalatte'], day: 2, teach: 'cappuccino' },

  road: [
    { cg: 'outside' },
    { nar: { en: 'Day two. Five fifty-eight. A personal record.', ru: 'День второй. Без двух шесть. Личный рекорд.' } },
    { phone: 'kyle', en: 'hey man. just checking. friday is still friday', ru: 'привет. просто уточняю. пятница всё ещё пятница' },
    { phone: 'eli', en: 'it is. i know', ru: 'да. я помню' },
    { who: 'think', en: 'Friday is tomorrow. One day to find a place. In New York. On a barista’s cash.', ru: 'Пятница — завтра. Один день, чтобы найти жильё. В Нью-Йорке. На деньги баристы.' },
    { who: 'think', en: 'Kyle would call that “a challenge”. Kyle has parents in Connecticut.', ru: 'Кайл назвал бы это «вызовом». У Кайла родители в Коннектикуте.' },
    { sfx: 'door' },
    { cg: null },
    { enter: 'rosa' },
    { who: 'rosa', en: 'On time. Don’t get used to my approval.', ru: 'Вовремя. Не привыкай к моей похвале.' },
    { who: 'rosa', en: 'Today — cappuccino. Espresso, steamed milk, and foam on top.', ru: 'Сегодня — капучино. Эспрессо, молоко и пена сверху.' },
    { who: 'rosa', en: 'The foam is a hat, ragazzo. Not a pillow.', ru: 'Пена — это шляпа, ragazzo. А не подушка.' },
    { choice: [
      { en: 'A hat. Got it.', ru: 'Шляпа. Понял.', then: [
        { who: 'rosa', en: 'You say “got it” like Tony says “I’m on a diet”.', ru: 'Ты говоришь «понял», как Тони говорит «я на диете».' },
      ] },
      { en: 'What’s the difference, exactly?', ru: 'А в чём разница, если честно?', aff: { rosa: 1 }, then: [
        { who: 'rosa', en: 'A hat sits. A pillow sinks. Giuseppe’s foam could hold a sugar cube.', ru: 'Шляпа сидит. Подушка проваливается. На пене Джузеппе держался кусок сахара.' },
        { who: 'think', en: 'Everything in this café is measured against Giuseppe.', ru: 'Всё в этом кафе меряется Джузеппе.' },
      ] },
    ] },
    { who: 'rosa', en: 'And Gina will come. Smile at her hair. Never at her husband.', ru: 'И придёт Джина. Улыбайся её причёске. Никогда — её мужу.' },
    { who: 'eli', en: 'Her husband comes too?', ru: 'Её муж тоже приходит?' },
    { who: 'rosa', en: 'No. That’s why.', ru: 'Нет. Поэтому.' },
    { leave: true },
  ],

  beat: {
    by: 'gina', want: 'cappuccino', at: 0.35,
    intro: [
      { nar: { en: 'A wave of hairspray arrives a second before the woman does.', ru: 'Волна лака для волос приходит на секунду раньше хозяйки.' } },
      { who: 'gina', en: 'So YOU’RE the farm boy. Turn around. Slowly.', ru: 'Так вот ты какой, деревенский. Повернись. Медленно.' },
      { who: 'gina', en: 'Mm. Good bones. Terrible haircut. We can work with that.', ru: 'М-м. Хорошая основа. Ужасная стрижка. С этим можно работать.' },
      { who: 'gina', en: 'Cappuccino, honey. And don’t drown it. I can always tell.', ru: 'Капучино, милый. И не топи его. Я всегда вижу.' },
    ],
    ok: [
      { nar: { en: 'Gina studies the foam the way she studies a client’s split ends.', ru: 'Джина изучает пену так, как изучает секущиеся кончики клиентки.' } },
      { who: 'gina', en: 'Okay. Okay! That’s a hat, not a pillow.', ru: 'Так. Так! Это шляпа, а не подушка.' },
      { who: 'think', en: 'Do they all have the same coffee teacher?', ru: 'У них у всех один учитель по кофе?' },
      { who: 'gina', en: 'You know why this place is called Bella Notte?', ru: 'Знаешь, почему кафе называется Bella Notte?' },
      { who: 'gina', en: 'The movie. The dogs, the spaghetti, one noodle, two mouths.', ru: 'Из-за мультика. Собаки, спагетти, одна макаронина на двоих.' },
      { who: 'gina', en: 'Rosa and Giuseppe saw it on their first date. Hence. Bella Notte.', ru: 'Роза и Джузеппе смотрели его на первом свидании. Отсюда. Bella Notte.' },
      { choice: [
        { en: 'Did Rosa tell you that?', ru: 'Это вам Роза рассказала?', set: 'ginaDoubt', aff: { gina: 1 }, then: [
          { who: 'gina', en: 'Not… in so many words.', ru: 'Ну… не прямо этими словами.' },
          { who: 'gina', en: 'Not in any words, if we’re being precise. But it’s obvious.', ru: 'Вообще никакими, если честно. Но это же очевидно.' },
        ] },
        { en: 'That’s a sweet story.', ru: 'Красивая история.', then: [
          { who: 'gina', en: 'Everything is sweet when you’re twenty-three, honey.', ru: 'В двадцать три всё красивое, милый.' },
        ] },
        { en: 'There’s a third guy in the photo by the door.', ru: 'На фото у двери есть ещё и третий.', set: 'ginaEnzo', then: [
          { nar: { en: 'For the first time, Gina has nothing to say. It lasts two seconds.', ru: 'Впервые Джине нечего сказать. Это длится две секунды.' } },
          { who: 'gina', en: 'The mandolin boy. Nobody talks about the mandolin boy.', ru: 'Мальчик с мандолиной. Про мальчика с мандолиной не говорят.' },
          { who: 'gina', en: 'And neither do I. Which, for me, is a medical event.', ru: 'И я не говорю. Что для меня, между прочим, медицинский случай.' },
        ] },
      ] },
      { who: 'gina', en: 'Also. I saw who left here at two in the morning.', ru: 'И ещё. Я видела, кто вышел отсюда в два ночи.' },
      { who: 'gina', en: 'The writer from above the laundromat. Careful. She writes everyone down.', ru: 'Писательница из-над прачечной. Осторожно. Она всех записывает.' },
    ],
    wrong: [
      { who: 'gina', en: 'Honey. This is {drink}.', ru: 'Милый. Это {drink}.' },
      { who: 'gina', en: 'My hair can survive humidity. It cannot survive this betrayal.', ru: 'Моя укладка переживёт сырость. Но не такое предательство.' },
      { who: 'think', en: 'In Maple Falls, people just drink what you give them. And then tell your mom.', ru: 'В Мейпл-Фоллс пьют, что дали. А потом рассказывают твоей маме.' },
      { who: 'gina', en: 'I’ll drink it. Out of pity. And for the gossip.', ru: 'Выпью. Из жалости. И ради сплетен.' },
      { who: 'gina', en: 'Rosa’s new boy made me {drink}. This will sell for a week.', ru: 'Новенький у Розы налил мне {drink}. Этого хватит на неделю.' },
    ],
  },

  close: {
    before: [
      { enter: 'rosa' },
    ],
    good: [
      { who: 'rosa', en: 'Gina says your foam is “a hat”. She has never said that about anyone alive.', ru: 'Джина говорит, у тебя пена — «шляпа». Она так ни о ком живом не говорила.' },
    ],
    ok: [
      { who: 'rosa', en: 'Not bad. Not good. A Tuesday.', ru: 'Не плохо. Не хорошо. Вторник.' },
    ],
    bad: [
      { who: 'rosa', en: 'Allora. Two people left angry. One of them was me.', ru: 'Allora. Двое ушли злыми. Одна из них — я.' },
    ],
    after: [
      { nar: { en: 'She puts a small brown bottle on the shelf. Vanilla.', ru: 'Она ставит на полку маленький коричневый флакон. Ваниль.' } },
      { who: 'rosa', en: 'Somebody needs vanilla, I hear.', ru: 'Говорят, кому-то нужна ваниль.' },
      { who: 'eli', en: 'Who told you?', ru: 'Кто вам сказал?' },
      { who: 'rosa', en: 'This is Brooklyn, ragazzo. The walls have ears, and the ears have Gina.', ru: 'Это Бруклин, ragazzo. У стен есть уши, а у ушей есть Джина.' },
      { who: 'rosa', en: 'Lock up. Don’t give it all to one customer.', ru: 'Закрой сам. И не трать всё на одну гостью.' },
      { leave: true },
      { nar: { en: 'Five to two. The bell again. Of course.', ru: 'Без пяти два. Снова колокольчик. Конечно.' } },
      { sfx: 'door' },
      { enter: 'sofia' },
      { who: 'sofia', en: 'Witness. I’m back. Chapter twelve is still stuck.', ru: 'Свидетель. Я вернулась. Двенадцатая глава всё ещё стоит.' },
      { if: 'noted', then: [
        { who: 'sofia', en: 'Imaginary vanilla, please. It’s become a tradition.', ru: 'Воображаемую ваниль, пожалуйста. Это уже традиция.' },
      ], else: [
        { who: 'sofia', en: 'Vanilla latte. I know, I know. I can dream.', ru: 'Ванильный латте. Знаю, знаю. Мечтать не вредно.' },
      ] },
      { who: 'think', en: 'Not tonight. Tonight I have the real thing.', ru: 'Не сегодня. Сегодня у меня настоящая.' },

      { brew: { by: 'sofia', want: 'vanillalatte' },
        ok: [
          { set: 'realVanilla' },
          { nar: { en: 'She sips. Stops. Sips again.', ru: 'Она делает глоток. Замирает. Ещё глоток.' } },
          { who: 'sofia', en: 'That’s… real vanilla.', ru: 'Это… настоящая ваниль.' },
          { who: 'eli', en: 'Rosa bought it.', ru: 'Роза купила.' },
          { who: 'sofia', en: 'Rosa bought it because somebody told her. You don’t have to blush.', ru: 'Роза купила, потому что ей кто-то сказал. Можешь не краснеть.' },
          { who: 'think', en: 'I am not blushing. It’s the steam wand. It’s very hot in here.', ru: 'Я не краснею. Это паровик. Тут очень жарко.' },
        ],
        wrong: [
          { who: 'sofia', en: 'This is {drink}. With imaginary everything.', ru: 'Это {drink}. С воображаемым всем.' },
          { who: 'sofia', en: 'It’s fine. Honestly. You’re consistent, and consistency is rare.', ru: 'Ничего. Правда. Ты последователен, а это редкость.' },
        ] },

      { who: 'sofia', en: 'Can I tell you my problem? You don’t have to fix it.', ru: 'Можно расскажу свою проблему? Чинить не обязательно.' },
      { who: 'sofia', en: 'My barista gets a letter from home. His mother is sick. Not badly.', ru: 'Мой бариста получает письмо из дома. Мама болеет. Не сильно.' },
      { who: 'sofia', en: 'Just enough that he has to choose. Stay in the city. Or go back.', ru: 'Ровно настолько, чтобы пришлось выбирать. Остаться в городе. Или вернуться.' },
      { who: 'sofia', en: 'And I don’t know what he does. I’ve written it both ways. Both are lies.', ru: 'А я не знаю, что он сделает. Писала и так, и так. И то, и то — враньё.' },
      { who: 'think', en: 'Mom texts me every day. Asks if I eat. Never asks when I’m coming home.', ru: 'Мама пишет каждый день. Спрашивает, ем ли я. Ни разу — когда вернусь.' },
      { who: 'think', en: 'That’s how I know she wants to.', ru: 'Так я и понимаю, что хочет спросить.' },
      { choice: [
        { en: 'He stays. Even if it’s hard.', ru: 'Он остаётся. Даже если тяжело.', set: 'leanStay', then: [
          { who: 'sofia', en: 'Why?', ru: 'Почему?' },
          { who: 'eli', en: 'Because if he goes back now, he’ll never know if he could have.', ru: 'Потому что если вернётся сейчас, никогда не узнает, смог бы он или нет.' },
          { nar: { en: 'Sofia looks at him a beat too long. Then down at her notebook.', ru: 'София смотрит на него чуть дольше, чем нужно. Потом — в блокнот.' } },
        ] },
        { en: 'He goes home. Home is where they know your name.', ru: 'Он едет домой. Дома знают, как тебя зовут.', set: 'leanHome', then: [
          { who: 'sofia', en: 'People here know his name too. Some of them.', ru: 'Здесь тоже знают, как его зовут. Некоторые.' },
          { who: 'eli', en: 'Not the way home does.', ru: 'Не так, как дома.' },
          { nar: { en: 'She writes it down. She doesn’t look happy about it.', ru: 'Она записывает. Вид у неё не очень довольный.' } },
        ] },
        { en: 'Depends who’s sitting at his counter.', ru: 'Зависит от того, кто сидит у него за стойкой.', set: 'flirt', aff: { sofia: 1 }, then: [
          { nar: { en: 'Silence. The rain fills it in.', ru: 'Тишина. Дождь её заполняет.' } },
          { who: 'sofia', en: 'That’s… not helpful at all.', ru: 'Это… совсем не помогает.' },
          { who: 'sofia', en: 'I’m writing it down anyway.', ru: 'Но я всё равно запишу.' },
        ] },
      ] },
      { who: 'sofia', en: 'Thank you, witness. Same time tomorrow?', ru: 'Спасибо, свидетель. Завтра в то же время?' },
      { who: 'think', en: 'Tomorrow I won’t have a couch. But I’ll have a counter.', ru: 'Завтра у меня не будет дивана. Но будет стойка.' },
      { leave: true },
    ],
  },

  diary: [
    { en: 'Night 2.', ru: 'Ночь 2.' },
    { en: 'Learned cappuccino. The foam is a hat. Everyone in this neighborhood agrees.', ru: 'Научился капучино. Пена — шляпа. С этим согласен весь квартал.' },
    { en: 'Gina says the café is named after a cartoon. Gina is sure of everything.', ru: 'Джина уверена, что кафе назвали в честь мультика. Джина во всём уверена.' },
    { if: 'ginaEnzo', en: 'She went quiet about the third guy. “The mandolin boy.”', ru: 'Про третьего с фото она замолчала. «Мальчик с мандолиной».' },
    { if: 'realVanilla', en: 'Rosa bought vanilla. For the shelf, she says. Not for me.', ru: 'Роза купила ваниль. Для полки, говорит. Не для меня.' },
    { if: 'leanStay', en: 'Told Sofia her barista stays. Said it like I knew.', ru: 'Сказал Софии, что её бариста остаётся. Сказал так, будто знаю.' },
    { if: 'leanHome', en: 'Told Sofia her barista goes home. She didn’t like it. Neither did I.', ru: 'Сказал Софии, что её бариста едет домой. Ей не понравилось. Мне тоже.' },
    { if: 'flirt', en: 'I said something about her sitting at the counter. Out loud. Why.', ru: 'Сказал что-то про неё за стойкой. Вслух. Зачем.' },
    { en: 'Tomorrow is Friday. Kyle has started saying it with feeling.', ru: 'Завтра пятница. Кайл начал произносить это с выражением.' },
  ],
};
