// Глава 5 «Двенадцатая глава» — начало второго акта. История Марко: третий год он приезжает четвёртым,
// потому что перед мостом оглядывается. После закрытия София оставляет Илаю свои страницы.

STORY_CH.ch5 = {
  num: { en: 'Chapter 5', ru: 'Глава 5' },
  title: { en: 'Chapter Twelve', ru: 'Двенадцатая глава' },
  bar: { recipes: ['espresso', 'americano', 'latte', 'cappuccino', 'vanillalatte', 'ristretto', 'doppio', 'flatwhite'], day: 5, teach: 'flatwhite' },

  road: [
    { nar: { en: 'Day nine. Rain, then not rain, then rain again.', ru: 'День девятый. Дождь, потом не дождь, потом снова дождь.' } },
    { who: 'think', en: 'I can make a cappuccino with my eyes closed now. Rosa says I shouldn’t.', ru: 'Капучино я теперь могу сделать с закрытыми глазами. Роза говорит, что не стоит.' },
    { phone: 'junie', en: 'is the writer your girlfriend yet', ru: 'писательница уже твоя девушка' },
    { phone: 'eli', en: 'she’s a customer', ru: 'она гостья' },
    { phone: 'junie', en: 'thats what they all say in movies', ru: 'так все говорят в кино' },
    { enter: 'rosa' },
    { who: 'rosa', en: 'Flat white today. Two short shots, milk like silk.', ru: 'Сегодня флэт уайт. Два коротких шота, молоко как шёлк.' },
    { who: 'rosa', en: 'No hat this time. Just a skin, thin as paper.', ru: 'На этот раз без шляпы. Только тонкая плёнка, как бумага.' },
    { who: 'rosa', en: 'The courier drinks it. He’ll come in soaking wet. He always does.', ru: 'Его пьёт курьер. Придёт мокрый насквозь. Он всегда мокрый.' },
    { who: 'rosa', en: 'And your writer. She comes every night now.', ru: 'И твоя писательница. Она теперь приходит каждую ночь.' },
    { choice: [
      { en: 'She’s writing a book here.', ru: 'Она здесь пишет книгу.', set: 'rosaHint', then: [
        { who: 'rosa', en: 'Hm. Giuseppe said that once. About a girl who came every night.', ru: 'Хм. Джузеппе однажды так говорил. Про девушку, которая приходила каждую ночь.' },
        { who: 'think', en: 'Was that girl Rosa?', ru: 'Этой девушкой была Роза?' },
      ] },
      { en: 'She likes the vanilla.', ru: 'Ей нравится ваниль.', aff: { rosa: 1 }, then: [
        { who: 'rosa', en: 'Nobody walks through the rain for vanilla, ragazzo.', ru: 'Ради ванили под дождём не ходят, ragazzo.' },
      ] },
      { en: 'Is that a problem?', ru: 'Это проблема?', then: [
        { who: 'rosa', en: 'Problems start when they stop coming.', ru: 'Проблемы начинаются, когда перестают приходить.' },
      ] },
    ] },
    { leave: true },
  ],

  beat: {
    by: 'marco', want: 'flatwhite', at: 0.3,
    intro: [
      { nar: { en: 'The door bangs open. A courier in a dripping helmet, grinning anyway.', ru: 'Дверь распахивается. Курьер в мокром шлеме — и всё равно улыбается.' } },
      { who: 'marco', en: 'You’re the new guy! Marco. Bikes, deliveries, chaos.', ru: 'Ты новенький! Марко. Велик, доставки, хаос.' },
      { who: 'marco', en: 'Flat white, man. Fast. I race on Sunday and I’m already late for it.', ru: 'Флэт уайт, брат. Быстро. В воскресенье гонка, а я уже на неё опаздываю.' },
    ],
    ok: [
      { who: 'marco', en: 'Oh, that’s good. That’s illegal-good.', ru: 'О-о, это хорошо. Противозаконно хорошо.' },
      { who: 'marco', en: 'Sunday is the Brooklyn Classic. Prospect Park to the bridge.', ru: 'В воскресенье — Бруклинская классика. От Проспект-парка до моста.' },
      { who: 'marco', en: 'Third year in a row. Third year I’ll come in fourth.', ru: 'Третий год подряд. Третий год приеду четвёртым.' },
      { who: 'think', en: 'He says it like a joke. It isn’t one.', ru: 'Он говорит это как шутку. Это не шутка.' },
      { choice: [
        { en: 'Why fourth?', ru: 'Почему четвёртым?', set: 'marcoAdvice', aff: { marco: 1 }, then: [
          { who: 'marco', en: 'I look back. Every time, right before the bridge.', ru: 'Оглядываюсь. Каждый раз, прямо перед мостом.' },
          { who: 'marco', en: 'Courier thing. You always check who’s behind you.', ru: 'Курьерская привычка. Всегда проверяешь, кто сзади.' },
          { who: 'eli', en: 'Then don’t look back this time.', ru: 'Тогда в этот раз не оглядывайся.' },
          { who: 'marco', en: '…Easy for you to say, farm boy.', ru: '…Легко тебе говорить, деревенский.' },
        ] },
        { en: 'I’ll come watch.', ru: 'Я приду посмотреть.', set: 'marcoWatch', aff: { marco: 1 }, then: [
          { who: 'marco', en: 'For real? Nobody comes to watch couriers.', ru: 'Серьёзно? На курьеров никто не ходит смотреть.' },
          { who: 'marco', en: 'Bring the writer. Everybody’s talking about you two.', ru: 'Бери с собой писательницу. Про вас двоих все говорят.' },
          { who: 'think', en: 'Everybody? Who is everybody? Gina. Everybody is Gina.', ru: 'Все? Кто эти все? Джина. Все — это Джина.' },
        ] },
        { en: 'Fourth is still top five.', ru: 'Четвёртое — это всё равно пятёрка лучших.', then: [
          { nar: { en: 'Marco laughs so hard he has to put the cup down.', ru: 'Марко смеётся так, что приходится поставить чашку.' } },
          { who: 'marco', en: 'Ha! I like you. You’re a terrible coach.', ru: 'Ха! Ты мне нравишься. Тренер из тебя ужасный.' },
        ] },
      ] },
      { who: 'marco', en: 'Okay. Back out there. The rain won’t ride itself.', ru: 'Ладно. Обратно. Дождь сам себя не объедет.' },
    ],
    wrong: [
      { who: 'marco', en: 'This is {drink}. Doesn’t matter, man. Liquid is liquid.', ru: 'Это {drink}. Без разницы, брат. Жидкость есть жидкость.' },
      { who: 'marco', en: 'Don’t tell Rosa I said that. She’ll ban me for life.', ru: 'Только Розе не говори, что я так сказал. Пожизненно забанит.' },
      { who: 'marco', en: 'Sunday I race. Third year. Third year I’ll come fourth.', ru: 'В воскресенье гонка. Третий год. Третий год приеду четвёртым.' },
      { who: 'think', en: 'He says it like a joke. It isn’t one.', ru: 'Он говорит это как шутку. Это не шутка.' },
    ],
  },

  close: {
    before: [
      { enter: 'rosa' },
    ],
    good: [
      { who: 'rosa', en: 'The courier left a tip. Couriers never tip. What did you do to him?', ru: 'Курьер оставил чаевые. Курьеры не оставляют чаевых. Что ты с ним сделал?' },
    ],
    ok: [
      { who: 'rosa', en: 'Fine. Giuseppe hated the word fine. Tomorrow, better than fine.', ru: 'Нормально. Джузеппе ненавидел слово «нормально». Завтра — лучше, чем нормально.' },
    ],
    bad: [
      { who: 'rosa', en: 'Allora. Tonight, the rain won.', ru: 'Allora. Сегодня победил дождь.' },
    ],
    after: [
      { who: 'rosa', en: 'She’s late tonight. Your writer.', ru: 'Она сегодня опаздывает. Твоя писательница.' },
      { who: 'eli', en: 'She’s not my—', ru: 'Она не моя…' },
      { who: 'rosa', en: 'Mm-hm.', ru: 'Угу.' },
      { leave: true },
      { nar: { en: 'Five past two. The bell, finally.', ru: 'Пять минут третьего. Наконец-то колокольчик.' } },
      { sfx: 'door' },
      { enter: 'sofia' },
      { who: 'sofia', en: 'Sorry. I’m late. I was… finishing something.', ru: 'Прости. Опоздала. Я… кое-что дописывала.' },
      { nar: { en: 'She puts a thin stack of printed pages on the counter.', ru: 'Она кладёт на стойку тонкую стопку распечатанных листов.' } },
      { nar: { en: 'Then takes her hand away, very slowly, like they might fly off.', ru: 'И очень медленно убирает руку, будто они могут улететь.' } },
      { who: 'sofia', en: 'Chapter twelve. It moves now. Because of you, a little.', ru: 'Двенадцатая глава. Теперь она движется. Немного благодаря тебе.' },
      { who: 'sofia', en: 'I want you to read it. Not now! Later. Upstairs. Alone.', ru: 'Я хочу, чтобы ты прочитал. Не сейчас! Потом. Наверху. Один.' },
      { who: 'think', en: 'She knows I live upstairs. Of course she does. Gina.', ru: 'Она знает, что я живу наверху. Ну конечно. Джина.' },
      { choice: [
        { en: 'I’d love to.', ru: 'С удовольствием.', set: 'readPromise', aff: { sofia: 1 }, then: [
          { who: 'sofia', en: 'Don’t love it yet. It might be terrible.', ru: 'Не радуйся раньше времени. Может, это ужасно.' },
        ] },
        { en: 'Are you sure?', ru: 'Ты уверена?', then: [
          { who: 'sofia', en: 'No. That’s why I’m doing it fast.', ru: 'Нет. Поэтому и делаю это быстро.' },
        ] },
        { en: 'Am I in it?', ru: 'Я там есть?', aff: { sofia: 1 }, then: [
          { nar: { en: 'She looks at the pages instead of at him.', ru: 'Она смотрит на листы, а не на него.' } },
          { who: 'sofia', en: '…Read it and find out.', ru: '…Прочитай — и узнаешь.' },
        ] },
      ] },
      { who: 'sofia', en: 'And make me the usual. My hands are shaking, and it’s not the cold.', ru: 'И сделай мне как обычно. У меня дрожат руки, и это не от холода.' },

      { brew: { by: 'sofia', want: 'vanillalatte' },
        ok: [
          { who: 'sofia', en: 'There. Now I can be brave for one more minute.', ru: 'Вот. Теперь я могу побыть смелой ещё минуту.' },
        ],
        wrong: [
          { who: 'sofia', en: 'This is {drink}. Perfect, actually. I can’t taste anything right now.', ru: 'Это {drink}. Вообще-то идеально. Я сейчас всё равно ничего не чувствую.' },
        ] },

      { who: 'sofia', en: 'Goodnight, witness. Don’t read it in the bath.', ru: 'Спокойной ночи, свидетель. Только не читай в ванной.' },
      { leave: true },
      { nar: { en: 'Upstairs. The radiator sings. The pages smell like her printer.', ru: 'Наверху. Батарея поёт. Листы пахнут её принтером.' } },
      { note: { en: 'The barista had the kind of hands\nthat apologized for everything.\nHe held the pitcher like it might bite\nand smiled at the rain\nas if it had followed him from home.', ru: 'У бариста были руки,\nкоторые за всё извинялись.\nОн держал питчер, будто тот кусается,\nи улыбался дождю —\nбудто дождь приехал за ним из дома.' } },
      { who: 'think', en: 'That’s me. The pitcher. That’s me.', ru: 'Это я. Питчер. Это же я.' },
      { who: 'think', en: 'I read it four times. Then once more with the light off, which makes no sense.', ru: 'Прочитал четыре раза. Потом ещё раз — с выключенным светом, что вообще бессмысленно.' },
    ],
  },

  diary: [
    { en: 'Night 9.', ru: 'Ночь 9.' },
    { en: 'Marco races on Sunday. He always looks back right before the bridge.', ru: 'В воскресенье у Марко гонка. Перед мостом он всегда оглядывается.' },
    { if: 'marcoWatch', en: 'I promised to come and watch. With Sofia, apparently. According to everybody.', ru: 'Обещал прийти посмотреть. С Софией, судя по всему. По мнению всех.' },
    { if: 'rosaHint', en: 'Giuseppe once talked about a girl who came every night. I think it was Rosa.', ru: 'Джузеппе когда-то говорил про девушку, приходившую каждую ночь. Кажется, это была Роза.' },
    { en: 'Sofia gave me chapter twelve.', ru: 'София отдала мне двенадцатую главу.' },
    { en: 'There’s a barista in it who holds the pitcher like it might bite.', ru: 'Там есть бариста, который держит питчер, будто тот кусается.' },
    { en: 'I didn’t sleep much. The radiator sang the whole time.', ru: 'Спал мало. Батарея пела всю ночь.' },
  ],
};
