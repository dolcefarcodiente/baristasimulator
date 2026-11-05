// Глава 7 «Чужой финал». История Джины: главная сплетница квартала месяц прячет свою тайну — свадьбы не будет.
// Чтобы сменить тему, она выдаёт чужую: Розе каждое Рождество приходит открытка из Генуи без подписи.
// Мама зовёт домой на День благодарения. Последняя глава романа Софии: бариста уезжает, и его никто не останавливает.

STORY_CH.ch7 = {
  num: { en: 'Chapter 7', ru: 'Глава 7' },
  title: { en: 'Someone Else’s Ending', ru: 'Чужой финал' },
  bar: { recipes: ['espresso', 'americano', 'latte', 'cappuccino', 'vanillalatte', 'ristretto', 'doppio', 'flatwhite', 'affogato', 'macchiato'], day: 7, teach: 'macchiato' },

  road: [
    { if: 'dateNo', then: [
      { nar: { en: 'Saturday. Eli stays upstairs. Across the street her light goes off at four.', ru: 'Суббота. Илай остаётся наверху. Через дорогу её свет гаснет в четыре.' } },
      { who: 'think', en: 'Then on again. Then off. I watched the whole thing like a movie.', ru: 'Потом загорается снова. Потом гаснет. Я смотрел это, как кино.' },
    ], else: [
      { nar: { en: 'Saturday. The Blue Door. Smoke, low lamps, a room that smells like old wood.', ru: 'Суббота. «Синяя дверь». Дым, низкие лампы, комната пахнет старым деревом.' } },
      { nar: { en: 'Leo plays the tune. Eight slow notes. The stop.', ru: 'Лео играет мелодию. Восемь медленных нот. Обрыв.' } },
      { if: 'leoNotes', then: [
        { nar: { en: 'Then two more bars, going up. He looks straight at Eli when he plays them.', ru: 'Потом ещё два такта — вверх. Играя их, он смотрит прямо на Илая.' } },
      ] },
      { if: 'dateGroup', then: [
        { who: 'think', en: 'Gina cried at the stop. Gina said it was the smoke.', ru: 'На обрыве Джина заплакала. Сказала, что это от дыма.' },
      ] },
      { who: 'think', en: 'Sofia held her breath at the stop. So did I. We noticed each other doing it.', ru: 'На обрыве София задержала дыхание. Я тоже. Мы заметили это друг за другом.' },
      { who: 'think', en: 'On the way out she said: “I finished it. The last chapter.”', ru: 'На выходе она сказала: «Я дописала. Последнюю главу».' },
      { who: 'think', en: 'Then she said goodnight very fast and crossed the street.', ru: 'Потом очень быстро пожелала спокойной ночи и перешла дорогу.' },
    ] },
    { nar: { en: 'Day thirteen. Monday.', ru: 'День тринадцатый. Понедельник.' } },
    { phone: 'mom', en: 'Eli honey. Thanksgiving is in two weeks.', ru: 'Илай, солнышко. До Дня благодарения две недели.' },
    { phone: 'mom', en: 'Dot is closing early. Junie made a sign. It has glitter.', ru: 'Дот закрывается пораньше. Джуни сделала плакат. С блёстками.' },
    { phone: 'mom', en: 'Also Dot needs a cook. Full time. Just saying.', ru: 'И ещё Дот нужен повар. На полный день. Просто к слову.' },
    { who: 'think', en: 'Just saying. Mom has never just said anything.', ru: 'Просто к слову. Мама ни разу в жизни не говорила ничего просто к слову.' },
    { choice: [
      { en: 'I’ll come for Thanksgiving.', ru: 'Приеду на День благодарения.', set: 'homeVisit', aff: { mom: 1 }, then: [
        { phone: 'eli', en: 'I’ll come for Thanksgiving. Just for Thanksgiving', ru: 'приеду на день благодарения. только на него' },
        { phone: 'mom', en: 'Of course! Just for Thanksgiving. I’ll air out your room', ru: 'Конечно! Только на него. Проветрю твою комнату' },
      ] },
      { en: 'I can’t leave Rosa alone.', ru: 'Не могу оставить Розу одну.', set: 'homeNo', aff: { rosa: 1 }, then: [
        { phone: 'eli', en: 'I can’t, mom. Rosa’s knees. The café. I’m sorry', ru: 'не могу, мам. колени Розы. кафе. прости' },
        { phone: 'mom', en: 'Okay. That sounds like somebody who has a job. I’m proud', ru: 'Хорошо. Звучит как человек, у которого есть работа. Я горжусь' },
        { phone: 'mom', en: 'Still airing out your room. Just in case', ru: 'Комнату всё равно проветрю. На всякий случай' },
      ] },
      { en: 'Let me think about it.', ru: 'Дай мне подумать.', set: 'homeMaybe', then: [
        { phone: 'eli', en: 'let me think, mom', ru: 'дай подумать, мам' },
        { phone: 'mom', en: 'Think. But think with a coat on. It’s cold there', ru: 'Думай. Но думай в куртке. Там холодно' },
      ] },
    ] },
    { enter: 'rosa' },
    { who: 'rosa', en: 'Macchiato. Espresso, one spoon of foam. Stained, it means.', ru: 'Макиато. Эспрессо, одна ложка пены. Значит «запятнанный».' },
    { who: 'rosa', en: 'Not a cappuccino. A cappuccino is a coat. A macchiato is a scarf.', ru: 'Не капучино. Капучино — это пальто. А макиато — шарф.' },
    { who: 'rosa', en: 'And watch Gina tonight. She’s too cheerful. That’s never good.', ru: 'И присмотри сегодня за Джиной. Она слишком весёлая. Это не к добру.' },
    { leave: true },
  ],

  beat: {
    by: 'gina', want: 'cappuccino', at: 0.3,
    intro: [
      { nar: { en: 'Gina sweeps in, scarf flying, talking before the door closes.', ru: 'Джина влетает, шарф развевается, говорит раньше, чем закрывается дверь.' } },
      { who: 'gina', en: 'Honey! Cappuccino, big foam. I need foam like I need air.', ru: 'Солнышко! Капучино, пены побольше. Мне пена нужна, как воздух.' },
      { who: 'gina', en: 'June wedding, did I tell you? Vinnie wants a band. I want a harp.', ru: 'Свадьба в июне, я говорила? Винни хочет оркестр. А я хочу арфу.' },
      { who: 'think', en: 'She’s not wearing the ring. Every day for two weeks — tonight, no ring.', ru: 'На ней нет кольца. Две недели каждый день было — а сегодня нет.' },
    ],
    ok: [
      { who: 'gina', en: 'Look at that foam. You could set a wig on that foam.', ru: 'Ты глянь на эту пену. На неё можно парик положить.' },
      { who: 'gina', en: 'Anyway, the harp. Vinnie says harps are for funerals.', ru: 'Так вот, арфа. Винни говорит, арфа — для похорон.' },
      { who: 'think', en: 'She keeps touching her finger where the ring was.', ru: 'Она всё трогает палец, где было кольцо.' },
      { choice: [
        { en: 'Gina. Where’s the ring?', ru: 'Джина. А где кольцо?', set: 'ginaRing', aff: { gina: 1 }, then: [
          { nar: { en: 'The dramatic pause. For once, it isn’t on purpose.', ru: 'Драматическая пауза. В первый раз — не нарочно.' } },
          { who: 'gina', en: 'A month ago. He called it off. Over the phone, honey. The phone.', ru: 'Месяц назад. Он всё отменил. По телефону, солнышко. По телефону.' },
          { who: 'gina', en: 'I know everybody’s secrets on this block. Nobody knows mine.', ru: 'Я знаю все секреты квартала. А мой не знает никто.' },
          { who: 'gina', en: 'I wanted to keep one. Just one. Is that crazy?', ru: 'Хотелось сохранить хоть один. Всего один. Это безумие?' },
        ] },
        { en: 'How’s Vinnie doing?', ru: 'Как там Винни?', set: 'ginaVinnie', then: [
          { who: 'gina', en: 'Vinnie is… in Staten Island. With a dental hygienist.', ru: 'Винни… на Статен-Айленде. С гигиенисткой из стоматологии.' },
          { who: 'gina', en: 'Her name is Brittany. Of course it is.', ru: 'Её зовут Бриттани. Ну конечно.' },
          { who: 'gina', en: 'You’re the first one I told. You have that face.', ru: 'Ты первый, кому я сказала. У тебя такое лицо.' },
        ] },
        { en: 'Say nothing. Let her talk.', ru: 'Промолчать. Пусть говорит.', set: 'ginaTalk', aff: { gina: 2 }, then: [
          { nar: { en: 'She talks about the harp. The cake. The cousins. Then she stops.', ru: 'Она рассказывает про арфу. Про торт. Про кузенов. Потом замолкает.' } },
          { who: 'gina', en: 'You saw. About the ring. And you didn’t ask.', ru: 'Ты заметил. Про кольцо. И не спросил.' },
          { who: 'gina', en: 'First time anybody on this block didn’t ask me something.', ru: 'Впервые в этом квартале меня кто-то не стал расспрашивать.' },
        ] },
      ] },
      { who: 'gina', en: 'Okay. Okay! Enough. You want a real secret? A trade.', ru: 'Так. Так! Хватит. Хочешь настоящий секрет? Меняемся.' },
      { who: 'gina', en: 'Every Christmas Rosa gets a postcard. From Genoa. No signature.', ru: 'Каждое Рождество Розе приходит открытка. Из Генуи. Без подписи.' },
      { who: 'gina', en: 'Forty years, honey. I sort her mail when her knees are bad.', ru: 'Сорок лет, солнышко. Я разбираю ей почту, когда у неё колени.' },
      { who: 'gina', en: 'She keeps them all. In the tin with the sugar cubes.', ru: 'Она их все хранит. В жестянке с кусковым сахаром.' },
      { set: 'postcard' },
    ],
    wrong: [
      { who: 'gina', en: 'This is {drink}. Honey. Vinnie would have noticed.', ru: 'Это {drink}. Солнышко. Винни бы заметил.' },
      { who: 'gina', en: '…No, he wouldn’t. Vinnie never noticed anything.', ru: '…Нет, не заметил бы. Винни никогда ничего не замечал.' },
      { nar: { en: 'She looks at her bare finger. Then at Eli. Then decides something.', ru: 'Она смотрит на голый палец. Потом на Илая. Потом что-то решает.' } },
      { who: 'gina', en: 'Forget it. You want a real secret? Rosa gets a postcard every Christmas.', ru: 'Забудь. Хочешь настоящий секрет? Розе каждое Рождество приходит открытка.' },
      { who: 'gina', en: 'From Genoa. No signature. Forty years. She keeps them in the sugar tin.', ru: 'Из Генуи. Без подписи. Сорок лет. Хранит в жестянке из-под сахара.' },
      { set: 'postcard' },
    ],
  },

  close: {
    before: [
      { enter: 'rosa' },
    ],
    good: [
      { who: 'rosa', en: 'Gina left smiling. A real smile, not a salon one. What did you say?', ru: 'Джина ушла с улыбкой. С настоящей, не салонной. Что ты ей сказал?' },
    ],
    ok: [
      { who: 'rosa', en: 'Fine night. The macchiatos looked like macchiatos. Almost.', ru: 'Нормальная ночь. Макиато были похожи на макиато. Почти.' },
    ],
    bad: [
      { who: 'rosa', en: 'Monday. Mondays are long. Everybody forgives a Monday.', ru: 'Понедельник. Понедельники длинные. Понедельнику все прощают.' },
    ],
    after: [
      { nar: { en: 'Rosa takes a fat envelope from her apron and sets it on the counter.', ru: 'Роза достаёт из фартука толстый конверт и кладёт на стойку.' } },
      { who: 'rosa', en: 'Your writer left this at noon. She looked like she hadn’t slept.', ru: 'Твоя писательница оставила в полдень. Выглядела так, будто не спала.' },
      { who: 'rosa', en: 'She said: “The last one. Tell him not tonight. Read it tomorrow.”', ru: 'Сказала: «Последняя. Передайте ему — не сегодня. Пусть прочтёт завтра».' },
      { who: 'think', en: 'It’s two a.m. Technically, it is tomorrow.', ru: 'Сейчас два часа ночи. Формально — это уже завтра.' },
      { if: 'postcard', then: [
        { who: 'think', en: 'Behind her, on the shelf, the sugar tin. I try not to look at it.', ru: 'За её спиной на полке — жестянка с сахаром. Стараюсь на неё не смотреть.' },
      ] },
      { who: 'rosa', en: 'Lock up. And read slowly, ragazzo. Writers can tell.', ru: 'Закрой. И читай медленно, ragazzo. Писатели это чувствуют.' },
      { leave: true },
      { nar: { en: 'Two a.m. Two ten. Two thirty. The bell doesn’t ring.', ru: 'Два часа. Два десять. Два тридцать. Колокольчик молчит.' } },
      { who: 'think', en: 'She always comes. Two weeks, every night. Tonight the corner is empty.', ru: 'Она приходит всегда. Две недели, каждую ночь. Сегодня угол пустой.' },
      { nar: { en: 'Upstairs. The radiator, the eight notes. The last page.', ru: 'Наверху. Батарея, восемь нот. Последняя страница.' } },
      { note: { en: 'He took the first bus, before the café opened.\nNobody tried to stop him.\nThat was the kindest thing\nthey ever did for him.', ru: 'Он уехал первым автобусом, до открытия кафе.\nНикто не пытался его остановить.\nЭто было самое доброе,\nчто они для него сделали.' } },
      { who: 'think', en: 'Oh.', ru: 'А.' },
      { who: 'think', en: 'So that’s how she sees me. Somebody who leaves.', ru: 'Вот как она меня видит. Человеком, который уезжает.' },
      { if: 'leanHome', then: [
        { who: 'think', en: 'I told her that myself, didn’t I. “He goes home.” Week one.', ru: 'Я сам ей это сказал, да? «Он едет домой». Первая неделя.' },
      ] },
      { if: 'homeVisit', then: [
        { who: 'think', en: 'And I just told Mom I’m coming home. Just for Thanksgiving. Sure.', ru: 'А я только что сказал маме, что приеду. Только на День благодарения. Ну да.' },
      ] },
      { nar: { en: 'Across the street, above the laundromat, her window is dark.', ru: 'Через дорогу, над прачечной, её окно тёмное.' } },
      { choice: [
        { en: 'Go knock on her door.', ru: 'Пойти постучать к ней.', set: 'almostKnock', then: [
          { nar: { en: 'Eli gets as far as the laundromat. The dryers are still turning.', ru: 'Илай доходит до прачечной. Сушилки ещё крутятся.' } },
          { who: 'think', en: 'Three a.m. is not a time for questions. It’s a time for dryers.', ru: 'Три часа ночи — не время для вопросов. Это время сушилок.' },
          { nar: { en: 'He walks back. Fourteen creaking steps.', ru: 'Он возвращается. Четырнадцать скрипучих ступенек.' } },
        ] },
        { en: 'Write her a note.', ru: 'Написать ей записку.', set: 'wroteNote', aff: { sofia: 1 }, then: [
          { note: { en: 'I read the ending.\nI’m not on that bus.\n— E.', ru: 'Я прочитал финал.\nМеня нет в том автобусе.\n— И.' } },
          { nar: { en: 'He slides it under the laundromat door, marked “for upstairs”.', ru: 'Он просовывает её под дверь прачечной с пометкой «наверх».' } },
          { who: 'think', en: 'Gina will deliver it. Gina delivers everything.', ru: 'Джина доставит. Джина доставляет всё.' },
        ] },
        { en: 'Look at the backpack.', ru: 'Посмотреть на рюкзак.', set: 'backpack', then: [
          { nar: { en: 'The backpack sits in the corner, still half packed from week one.', ru: 'Рюкзак стоит в углу — до сих пор наполовину собранный с первой недели.' } },
          { who: 'think', en: 'Maybe she’s right. Maybe I never really unpacked.', ru: 'Может, она права. Может, я так и не распаковался.' },
          { nar: { en: 'He takes everything out. Every shirt, every sock. It takes an hour.', ru: 'Он вынимает всё. Каждую футболку, каждый носок. Это занимает час.' } },
        ] },
      ] },
    ],
  },

  diary: [
    { en: 'Night 13.', ru: 'Ночь 13.' },
    { if: '!dateNo', en: 'At the Blue Door, Sofia and I held our breath at the same note.', ru: 'В «Синей двери» мы с Софией задержали дыхание на одной ноте.' },
    { en: 'Gina’s wedding is off. She kept one secret. Now two people know it.', ru: 'Свадьбы у Джины не будет. Она хранила один секрет. Теперь его знают двое.' },
    { en: 'Rosa gets a postcard from Genoa every Christmas. No signature. The sugar tin.', ru: 'Розе каждое Рождество приходит открытка из Генуи. Без подписи. Жестянка с сахаром.' },
    { if: 'homeVisit', en: 'Told Mom I’ll come for Thanksgiving. Dot needs a cook. Just saying.', ru: 'Сказал маме, что приеду на День благодарения. Дот нужен повар. Просто к слову.' },
    { if: 'homeNo', en: 'Told Mom I can’t come. She’s proud. She’s airing out my room anyway.', ru: 'Сказал маме, что не приеду. Она гордится. Комнату всё равно проветривает.' },
    { en: 'In Sofia’s book the barista takes the first bus. Nobody stops him.', ru: 'В книге Софии бариста уезжает первым автобусом. Никто его не останавливает.' },
    { en: 'She didn’t come tonight.', ru: 'Сегодня она не пришла.' },
    { if: 'wroteNote', en: 'I wrote: “I’m not on that bus.” I hope that was the right thing.', ru: 'Я написал: «Меня нет в том автобусе». Надеюсь, это было правильно.' },
    { if: 'backpack', en: 'I unpacked the backpack. All of it. Took an hour. Should have taken a minute.', ru: 'Распаковал рюкзак. Весь. Ушёл час. Должна была уйти минута.' },
  ],
};
