// Глава 8 «Комета» — конец второго акта. История Сала: в 1982-м он нашёл комету, но её назвали в честь другого.
// Сегодня она возвращается. На крыше София объясняет: бариста, который уезжает, — это она сама.
// Роза роняет фразу про 1985-й: «Кто-то всегда пытается остановить. Иногда в этом и беда».

STORY_CH.ch8 = {
  num: { en: 'Chapter 8', ru: 'Глава 8' },
  title: { en: 'The Comet', ru: 'Комета' },
  bar: { recipes: ['espresso', 'americano', 'latte', 'cappuccino', 'vanillalatte', 'ristretto', 'doppio', 'flatwhite', 'affogato', 'macchiato', 'cioccolata'], day: 8, teach: 'cioccolata' },

  road: [
    { nar: { en: 'Day fifteen. Wednesday. For the first time in a month, the sky is clear.', ru: 'День пятнадцатый. Среда. Впервые за месяц небо чистое.' } },
    { who: 'think', en: 'Sofia hasn’t come in two nights. The corner table looks offended.', ru: 'София не приходит вторую ночь. Угловой столик выглядит обиженным.' },
    { if: 'wroteNote', then: [
      { who: 'think', en: 'My note is gone from under the laundromat door. Gina. Or a raccoon.', ru: 'Записки под дверью прачечной больше нет. Джина. Или енот.' },
    ] },
    { if: 'homeVisit', then: [
      { phone: 'junie', en: 'mom says ur coming for thanksgiving', ru: 'мама говорит ты приедешь на день благодарения' },
      { phone: 'junie', en: 'she already bought the big turkey. the BIG one', ru: 'она уже купила индейку. БОЛЬШУЮ' },
    ] },
    { if: 'homeNo', then: [
      { phone: 'junie', en: 'mom says ur not coming for thanksgiving', ru: 'мама говорит ты не приедешь на день благодарения' },
      { phone: 'junie', en: 'traitor. i made a sign. WITH GLITTER', ru: 'предатель. я делала плакат. С БЛЁСТКАМИ' },
    ] },
    { if: 'homeMaybe', then: [
      { phone: 'junie', en: 'mom says ur “thinking”', ru: 'мама говорит ты «думаешь»' },
      { phone: 'junie', en: 'thats mom for no. or yes. nobody knows', ru: 'на мамином это значит нет. или да. никто не знает' },
    ] },
    { enter: 'rosa' },
    { who: 'rosa', en: 'The professor called. On the telephone. Sal doesn’t call. Sal appears.', ru: 'Звонил профессор. По телефону. Сал не звонит. Сал появляется.' },
    { who: 'rosa', en: 'A comet, tonight, after close. He wants the roof.', ru: 'Комета, сегодня, после закрытия. Ему нужна крыша.' },
    { who: 'rosa', en: 'Cioccolata calda. Milk, chocolate, cream. Roofs are cold.', ru: 'Чоколата кальда. Молоко, шоколад, сливки. На крышах холодно.' },
    { choice: [
      { en: 'You’re coming up? Your knees…', ru: 'Вы полезете наверх? Колени же…', set: 'rosaRoof', aff: { rosa: 1 }, then: [
        { who: 'rosa', en: 'My knees climbed that roof in 1979. They can do it once more.', ru: 'Мои колени лазили на эту крышу в семьдесят девятом. Залезут ещё раз.' },
      ] },
      { en: 'What’s up on the roof?', ru: 'А что там, на крыше?', then: [
        { who: 'rosa', en: 'Tar. Pigeons. Forty years of my life.', ru: 'Смола. Голуби. Сорок лет моей жизни.' },
      ] },
      { en: 'Is Sofia coming?', ru: 'А София придёт?', then: [
        { who: 'rosa', en: 'Ask her yourself. Oh, wait. You don’t.', ru: 'Спроси её сам. Ах да. Ты же не спрашиваешь.' },
        { who: 'rosa', en: 'The professor invited the whole block. Even writers who hide.', ru: 'Профессор позвал весь квартал. Даже писательниц, которые прячутся.' },
      ] },
    ] },
    { leave: true },
  ],

  beat: {
    by: 'sal', want: 'doppio', at: 0.3,
    intro: [
      { nar: { en: 'Sal comes in with a long leather tube under his arm, like a rolled-up map.', ru: 'Сал входит с длинным кожаным тубусом под мышкой, как со свёрнутой картой.' } },
      { who: 'sal', en: 'A doppio, please. Tonight I must stay awake until 2:47.', ru: 'Доппио, пожалуйста. Сегодня мне нужно не спать до 2:47.' },
      { who: 'sal', en: 'Not 2:46. Not 2:48. The universe is punctual. Unlike the subway.', ru: 'Не до 2:46. Не до 2:48. Вселенная пунктуальна. В отличие от метро.' },
    ],
    ok: [
      { who: 'sal', en: 'Good. Exactly enough bitterness for a night of waiting.', ru: 'Хорошо. Ровно столько горечи, сколько нужно для ночи ожидания.' },
      { who: 'sal', en: 'In 1982 I found a comet. I was twenty-six, with a borrowed telescope.', ru: 'В 1982 году я нашёл комету. Мне было двадцать шесть, телескоп был чужой.' },
      { who: 'sal', en: 'A man in Arizona reported it four hours earlier. It carries his name.', ru: 'Один человек в Аризоне сообщил о ней на четыре часа раньше. Она носит его имя.' },
      { who: 'sal', en: 'It returns every forty-four years. I computed it. At this counter.', ru: 'Она возвращается раз в сорок четыре года. Я это рассчитал. За этой стойкой.' },
      { who: 'think', en: 'On a napkin, probably. Giuseppe probably charged him for the napkin.', ru: 'Наверняка на салфетке. И Джузеппе наверняка взял с него за салфетку.' },
      { choice: [
        { en: 'What would you have named it?', ru: 'А как бы вы её назвали?', set: 'salName', aff: { sal: 1 }, then: [
          { who: 'sal', en: 'Bella Notte. Giuseppe raised a glass. Enzo wrote it a verse.', ru: 'Bella Notte. Джузеппе поднял бокал. Энцо сочинил для неё куплет.' },
          { who: 'sal', en: 'That was 1982. Enzo was still here then.', ru: 'Это был восемьдесят второй. Энцо тогда ещё был здесь.' },
          { who: 'think', en: 'Still here. Then not.', ru: 'Ещё был здесь. А потом — нет.' },
        ] },
        { en: 'Does the name still bother you?', ru: 'Вас до сих пор задевает чужое имя?', then: [
          { who: 'sal', en: 'Professionally, for forty-four years.', ru: 'Профессионально — сорок четыре года.' },
          { who: 'sal', en: 'Personally — I saw it. He only reported it. There is a difference.', ru: 'Лично — я её видел. А он только сообщил. Это разные вещи.' },
        ] },
        { en: 'Who watched it with you last time?', ru: 'А с кем вы смотрели её в прошлый раз?', set: 'salFriends', aff: { sal: 1 }, then: [
          { who: 'sal', en: 'Three friends. On your roof. One left. One died. One still makes coffee.', ru: 'Трое друзей. На вашей крыше. Один уехал. Один умер. Одна до сих пор варит кофе.' },
          { who: 'sal', en: 'Tonight I was hoping for a barista. You will do.', ru: 'Сегодня я рассчитывал на баристу. Вы подойдёте.' },
        ] },
      ] },
      { who: 'sal', en: '2:47. The roof. Bring cups.', ru: '2:47. Крыша. Захватите чашки.' },
    ],
    wrong: [
      { who: 'sal', en: 'This is {drink}. I ordered a doppio. Precision matters tonight.', ru: 'Это {drink}. Я заказывал доппио. Сегодня точность важна.' },
      { who: 'sal', en: 'In 1982 I found a comet. A man in Arizona reported it four hours earlier.', ru: 'В 1982 году я нашёл комету. Человек в Аризоне сообщил о ней на четыре часа раньше.' },
      { who: 'sal', en: 'It returns tonight. 2:47. The roof. Bring cups — the right ones.', ru: 'Сегодня она возвращается. 2:47. Крыша. Захватите чашки — правильные.' },
    ],
  },

  close: {
    before: [
      { enter: 'rosa' },
    ],
    good: [
      { who: 'rosa', en: 'Good night. Even the comet will be jealous.', ru: 'Хорошая ночь. Даже комета позавидует.' },
    ],
    ok: [
      { who: 'rosa', en: 'Fine. Not a comet. But fine.', ru: 'Нормально. Не комета. Но нормально.' },
    ],
    bad: [
      { who: 'rosa', en: 'Allora. A bad night down here. Let’s see if the sky does better.', ru: 'Allora. Внизу ночь не задалась. Посмотрим, как справится небо.' },
    ],
    after: [
      { who: 'rosa', en: 'Cioccolata. Four cups. No — five. Gina is coming. Gina is always coming.', ru: 'Чоколата. Четыре чашки. Нет — пять. Джина придёт. Джина всегда приходит.' },

      { brew: { by: 'rosa', want: 'cioccolata' },
        ok: [
          { who: 'rosa', en: 'Thick. Like Giuseppe made it. Good. Pour the rest.', ru: 'Густая. Как у Джузеппе. Хорошо. Разливай остальное.' },
        ],
        wrong: [
          { who: 'rosa', en: 'This is {drink}. On a roof, at three a.m., nobody will check. Pour.', ru: 'Это {drink}. На крыше в три часа ночи никто проверять не станет. Разливай.' },
        ] },

      { who: 'rosa', en: 'Allora. Up.', ru: 'Allora. Наверх.' },
      { leave: true },
      { cg: 'roof' },
      { nar: { en: '2:41. The roof. Bulbs, folding chairs, the city humming below.', ru: '2:41. Крыша. Лампочки, складные стулья, внизу гудит город.' } },
      { nar: { en: 'Sal’s telescope points at a patch of sky that looks like every other patch.', ru: 'Телескоп Сала смотрит на кусок неба, похожий на любой другой.' } },
      { who: 'gina', en: 'Honey, I brought blankets. And gossip. Mostly blankets.', ru: 'Солнышко, я принесла пледы. И сплетни. В основном пледы.' },
      { nar: { en: 'Rosa takes the last steps one at a time and refuses every hand.', ru: 'Роза одолевает последние ступеньки по одной и отказывается от любой руки.' } },
      { who: 'rosa', en: 'Basta. I climbed this roof before your parents met.', ru: 'Basta. Я лазила на эту крышу, когда ваши родители ещё не познакомились.' },
      { who: 'sal', en: '2:46.', ru: '2:46.' },
      { who: 'sal', en: '2:47.', ru: '2:47.' },
      { nar: { en: 'Over the water towers, a smudge of light. Then a tail.', ru: 'Над водонапорными башнями — светлое пятнышко. Потом хвост.' } },
      { who: 'think', en: 'It isn’t fast. It isn’t dramatic. It just arrives, like it said it would.', ru: 'Она не быстрая. Не эффектная. Она просто приходит, как и обещала.' },
      { who: 'sal', en: 'Forty-four years. Right on time. Unlike everyone I know.', ru: 'Сорок четыре года. Минута в минуту. В отличие от всех моих знакомых.' },
      { if: 'salName', then: [
        { who: 'sal', en: 'Bella Notte. Up here, that is its name.', ru: 'Bella Notte. Здесь, наверху, её зовут так.' },
      ] },
      { nar: { en: 'The fire escape clangs. Someone is climbing it, slowly, in socks.', ru: 'Пожарная лестница лязгает. Кто-то лезет по ней — медленно, в носках.' } },
      { who: 'sofia', en: 'Don’t say anything. The door was locked. Gina gave me the idea.', ru: 'Молчи. Дверь была заперта. Это Джина подсказала.' },
      { who: 'gina', en: 'I give everybody ideas, honey.', ru: 'Я всем подсказываю, солнышко.' },
      { if: 'wroteNote', then: [
        { nar: { en: 'In her hand, folded small, his note.', ru: 'В её руке — его записка, сложенная в маленький квадрат.' } },
        { who: 'sofia', en: '“I’m not on that bus.” You wrote it like a line from a book.', ru: '«Меня нет в том автобусе». Ты написал это, как строчку из книги.' },
      ] },
      { who: 'sofia', en: 'Eli. Can we… over there? By the bulbs.', ru: 'Илай. Можно… вон туда? К лампочкам.' },
      { who: 'think', en: 'Eli. Not “witness”. That’s new.', ru: 'Илай. Не «свидетель». Это что-то новое.' },
      { who: 'sofia', en: 'You read the ending. And you thought the barista was you.', ru: 'Ты прочитал финал. И решил, что бариста — это ты.' },
      { who: 'think', en: 'I nod. I am very good at nodding.', ru: 'Я киваю. Кивать я умею отлично.' },
      { who: 'sofia', en: 'Eli. The barista who leaves is me.', ru: 'Илай. Бариста, который уезжает, — это я.' },
      { who: 'sofia', en: 'My lease ends in December. My savings end before that.', ru: 'Аренда кончается в декабре. Сбережения — ещё раньше.' },
      { who: 'sofia', en: 'I was going back to Ohio. To write the rest in my old bedroom.', ru: 'Я собиралась вернуться в Огайо. Дописывать в своей старой комнате.' },
      { who: 'sofia', en: 'I write the thing I’m scared of. Then it’s on paper and not in me.', ru: 'Я пишу то, чего боюсь. Тогда оно на бумаге, а не во мне.' },
      { who: 'sofia', en: '“Nobody tried to stop him.” I wrote it so somebody would argue.', ru: '«Никто не пытался его остановить». Я написала это, чтобы кто-нибудь поспорил.' },
      { choice: [
        { en: 'Then I’m arguing. Stay.', ru: 'Тогда я спорю. Останься.', set: 'askStay', aff: { sofia: 2 }, then: [
          { who: 'sofia', en: 'That’s… not a very good argument.', ru: 'Это… не очень сильный аргумент.' },
          { who: 'eli', en: 'It’s the only one I have.', ru: 'Другого у меня нет.' },
          { who: 'sofia', en: '…It’s a pretty good one, actually.', ru: '…Вообще-то, довольно сильный.' },
        ] },
        { en: 'Rewrite it. Let somebody stop him.', ru: 'Перепиши. Пусть кто-нибудь его остановит.', set: 'rewrite', aff: { sofia: 1 }, then: [
          { who: 'sofia', en: 'Writers don’t take notes from their characters.', ru: 'Писатели не слушают советов своих персонажей.' },
          { who: 'sofia', en: '…I’ll take this one.', ru: '…Этот я послушаю.' },
        ] },
        { en: 'If you go, I’ll visit Ohio.', ru: 'Если уедешь — я приеду в Огайо.', set: 'visitOhio', aff: { sofia: 1 }, then: [
          { who: 'sofia', en: 'Ohio has terrible coffee.', ru: 'В Огайо ужасный кофе.' },
          { who: 'eli', en: 'Then I’ll bring some. In a thermos. On a bus.', ru: 'Тогда я привезу свой. В термосе. На автобусе.' },
          { nar: { en: 'She laughs, and it fogs in the cold.', ru: 'Она смеётся, и смех паром повисает на холоде.' } },
          { who: 'sofia', en: 'On a bus. Of course on a bus.', ru: 'На автобусе. Ну конечно, на автобусе.' },
        ] },
      ] },
      { nar: { en: 'Behind them, Rosa is watching the comet. Not them. Very deliberately.', ru: 'Позади Роза смотрит на комету. Не на них. Очень старательно.' } },
      { who: 'rosa', en: 'Cara. Listen to an old woman.', ru: 'Cara. Послушай старуху.' },
      { who: 'rosa', en: 'Don’t write that nobody stopped him.', ru: 'Не пиши, что никто его не остановил.' },
      { who: 'rosa', en: 'Somebody always tries. Sometimes that is the problem.', ru: 'Кто-нибудь всегда пытается. Иногда в этом-то и беда.' },
      { nar: { en: 'Sal takes off his glasses and cleans them for a long, long time.', ru: 'Сал снимает очки и долго-долго их протирает.' } },
      { who: 'think', en: 'She isn’t talking about the book.', ru: 'Она говорит не про книгу.' },
      { if: 'postcard', then: [
        { who: 'think', en: 'A postcard from Genoa every Christmas. Forty years. No signature.', ru: 'Открытка из Генуи каждое Рождество. Сорок лет. Без подписи.' },
      ] },
      { choice: [
        { en: 'Take her hand.', ru: 'Взять её за руку.', set: 'holdHand', aff: { sofia: 1 }, then: [
          { nar: { en: 'Her hand is cold. It doesn’t stay cold.', ru: 'Её рука холодная. Недолго.' } },
        ] },
        { en: 'Point at the comet.', ru: 'Показать на комету.', then: [
          { who: 'sofia', en: 'I know where the comet is, Eli.', ru: 'Я знаю, где комета, Илай.' },
          { nar: { en: 'She leans her shoulder against his anyway.', ru: 'Но всё равно прислоняется к его плечу.' } },
          { who: 'sofia', en: '…Keep pointing.', ru: '…Показывай дальше.' },
        ] },
        { en: 'One more chapter. Stay for one more.', ru: 'Ещё одна глава. Останься хотя бы на одну.', set: 'oneMore', aff: { sofia: 1 }, then: [
          { who: 'sofia', en: 'One more chapter. Then we’ll see.', ru: 'Ещё одна глава. А там посмотрим.' },
          { who: 'think', en: 'That’s how she started this book, I bet. One more chapter.', ru: 'Спорим, так она и начала эту книгу. Ещё одна глава.' },
        ] },
      ] },
      { who: 'sal', en: 'It returns in 2070. I intend to be late.', ru: 'Она вернётся в 2070-м. Я намерен опоздать.' },
      { nar: { en: 'They stay until the tail fades into the morning.', ru: 'Они сидят, пока хвост не растворяется в утре.' } },
    ],
  },

  diary: [
    { en: 'Night 15.', ru: 'Ночь 15.' },
    { en: 'Sal’s comet came back at 2:47, after forty-four years. Exactly on time.', ru: 'Комета Сала вернулась в 2:47, через сорок четыре года. Минута в минуту.' },
    { if: 'salName', en: 'Up there its name is Bella Notte. Enzo once wrote it a verse.', ru: 'Наверху её зовут Bella Notte. Когда-то Энцо сочинил для неё куплет.' },
    { if: 'salFriends', en: 'Last time, three friends watched it from our roof. One left. One died.', ru: 'В прошлый раз её смотрели с нашей крыши трое друзей. Один уехал. Один умер.' },
    { en: 'The barista who leaves isn’t me. It’s Sofia.', ru: 'Бариста, который уезжает, — не я. Это София.' },
    { if: 'askStay', en: 'I told her to stay. Not a good argument. The only one I had.', ru: 'Я сказал ей: останься. Аргумент так себе. Другого не было.' },
    { if: 'rewrite', en: 'She’s going to rewrite the ending. Somebody will stop him.', ru: 'Она перепишет финал. Кто-нибудь его остановит.' },
    { if: 'visitOhio', en: 'I promised to visit Ohio. With a thermos. On a bus.', ru: 'Пообещал приехать в Огайо. С термосом. На автобусе.' },
    { if: 'holdHand', en: 'I held her hand. It didn’t stay cold.', ru: 'Я держал её за руку. Она недолго была холодной.' },
    { en: 'Rosa: “Somebody always tries to stop him. Sometimes that’s the problem.”', ru: 'Роза: «Кто-нибудь всегда пытается остановить. Иногда в этом и беда».' },
    { en: 'She wasn’t talking about the book.', ru: 'Она говорила не про книгу.' },
    { en: 'End of Act Two.', ru: 'Конец второго акта.' },
  ],
};
