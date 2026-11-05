// Глава 6 «Медленная мелодия». История Лео: третью неделю его мелодия обрывается на одном такте —
// он подхватил её мальчишкой у старика за этой стойкой. Ноты из-под стойки знают продолжение. Илай зовёт Софию в клуб.

STORY_CH.ch6 = {
  num: { en: 'Chapter 6', ru: 'Глава 6' },
  title: { en: 'A Slow Tune', ru: 'Медленная мелодия' },
  bar: { recipes: ['espresso', 'americano', 'latte', 'cappuccino', 'vanillalatte', 'ristretto', 'doppio', 'flatwhite', 'affogato'], day: 6, teach: 'affogato' },

  road: [
    { nar: { en: 'Day eleven. Thursday. The rain took the night off.', ru: 'День одиннадцатый. Четверг. Дождь взял выходной.' } },
    { if: 'marcoAdvice', then: [
      { phone: 'marco', en: 'SECOND PLACE', ru: 'ВТОРОЕ МЕСТО' },
      { phone: 'marco', en: 'didnt look back. not once', ru: 'не оглядывался. ни разу' },
      { phone: 'marco', en: 'ok once. AFTER the finish. doesnt count', ru: 'ну один раз. ПОСЛЕ финиша. не считается' },
    ], else: [
      { phone: 'marco', en: 'fourth', ru: 'четвёртый' },
      { phone: 'marco', en: 'FOURTH. again. its a tradition now', ru: 'ЧЕТВЁРТЫЙ. опять. это уже традиция' },
      { phone: 'marco', en: 'next year farm boy. next year', ru: 'в следующем году, деревенский. в следующем' },
    ] },
    { if: 'marcoWatch', then: [
      { who: 'think', en: 'I was at the bridge with a paper cup, yelling his name.', ru: 'Я стоял у моста с бумажным стаканом и орал его имя.' },
      { who: 'think', en: 'He heard. He waved. He nearly hit a cop.', ru: 'Он услышал. Помахал. Чуть не сбил полицейского.' },
    ] },
    { enter: 'rosa' },
    { who: 'rosa', en: 'Affogato. Gelato in the cup, espresso on top. Hot over cold.', ru: 'Аффогато. Джелато в чашку, сверху эспрессо. Горячее на холодное.' },
    { who: 'rosa', en: 'It means “drowned”. The gelato drowns. Happily.', ru: 'Значит «утопленный». Джелато тонет. Счастливо.' },
    { who: 'rosa', en: 'The sax player eats it before his show. Leo. He eats it like church.', ru: 'Саксофонист ест его перед выступлением. Лео. Ест, как в церкви.' },
    { who: 'think', en: 'The paper under the counter is right there. Six inches from her knee.', ru: 'Лист под стойкой — вот он. В пятнадцати сантиметрах от её колена.' },
    { choice: [
      { en: 'Did Giuseppe sing?', ru: 'Джузеппе пел?', set: 'heardHum', aff: { rosa: 1 }, then: [
        { who: 'rosa', en: 'Sing? No. He hummed. Badly. One song, forty years.', ru: 'Пел? Нет. Мурлыкал. Фальшиво. Одну песню, сорок лет.' },
        { who: 'rosa', en: 'It drove me crazy. Now the kitchen is too quiet.', ru: 'Меня это бесило. А теперь на кухне слишком тихо.' },
      ] },
      { en: 'Rosa… who was E.?', ru: 'Роза… а кто такой E.?', set: 'askedE', then: [
        { nar: { en: 'The spoon in Rosa’s hand stops.', ru: 'Ложка в руке Розы замирает.' } },
        { who: 'rosa', en: 'Where did you read that letter, ragazzo?', ru: 'Где ты прочитал эту букву, ragazzo?' },
        { who: 'eli', en: '…Somewhere.', ru: '…Где-то.' },
        { who: 'rosa', en: 'Then put it back somewhere.', ru: 'Вот и положи её обратно. Где-то.' },
      ] },
      { en: 'What flavor is the gelato?', ru: 'А джелато какое?', then: [
        { who: 'rosa', en: 'Fior di latte. Milk flower. Giuseppe said vanilla is for cowards.', ru: 'Фьор ди латте. Молочный цветок. Джузеппе говорил, ваниль — для трусов.' },
        { who: 'think', en: 'I am not telling Sofia that.', ru: 'Софии я этого не скажу.' },
      ] },
    ] },
    { leave: true },
  ],

  beat: {
    by: 'leo', want: 'affogato', at: 0.3,
    intro: [
      { nar: { en: 'A man in a flat cap sets a saxophone case on the next stool, like a date.', ru: 'Мужчина в кепке ставит футляр саксофона на соседний табурет, как спутницу.' } },
      { who: 'leo', en: 'Evening, new guy. Affogato. Tonight I need hot on cold.', ru: 'Вечер, новенький. Аффогато. Сегодня мне нужно горячее на холодном.' },
      { who: 'leo', en: 'Three weeks I’m stuck on a tune. It stops at the same bar.', ru: 'Третью неделю застрял на мелодии. Обрывается на одном и том же такте.' },
      { who: 'leo', en: 'Like a dog at a door. Won’t go in. Won’t go home.', ru: 'Как пёс у двери. Внутрь не идёт. Домой тоже.' },
    ],
    ok: [
      { who: 'leo', en: 'Mm. Bitter, then sweet. That’s the right order of things.', ru: 'М-м. Сначала горько, потом сладко. Правильный порядок вещей.' },
      { nar: { en: 'He hums. Eight slow notes, then a stop — like a held breath.', ru: 'Он напевает. Восемь медленных нот — и обрыв, как задержанное дыхание.' } },
      { who: 'leo', en: 'Funny thing. It’s not even mine.', ru: 'Смешно. Она даже не моя.' },
      { who: 'leo', en: 'I swept floors at Tony’s as a kid. An old man hummed it at this counter.', ru: 'Пацаном я подметал у Тони. Старик напевал её за этой стойкой.' },
      { who: 'leo', en: 'Every night. Never past the stop. I never heard the end.', ru: 'Каждый вечер. Ни разу дальше обрыва. Конца я так и не слышал.' },
      { if: 'heardHum', then: [
        { who: 'think', en: 'One song, forty years. Badly. Giuseppe.', ru: 'Одна песня, сорок лет. Фальшиво. Джузеппе.' },
      ], else: [
        { who: 'think', en: 'An old man at this counter. Giuseppe.', ru: 'Старик за этой стойкой. Джузеппе.' },
      ] },
      { choice: [
        { en: 'I think I know where the end is.', ru: 'Кажется, я знаю, где конец.', set: 'leoNotes', aff: { leo: 1 }, then: [
          { nar: { en: 'Eli kneels. The yellow paper is still there, taped under the counter.', ru: 'Илай встаёт на колени. Жёлтый лист всё там же, приклеен под стойкой.' } },
          { nar: { en: 'Leo crouches beside him and reads it by the light of his phone.', ru: 'Лео присаживается рядом и читает при свете телефона.' } },
          { who: 'leo', en: 'Eight bars and a stop. And then it goes up.', ru: 'Восемь тактов и обрыв. А потом — вверх.' },
          { who: 'leo', en: 'Of course it goes up. Man, of course.', ru: 'Ну конечно, вверх. Конечно же.' },
          { who: 'leo', en: 'Leave it there. It’s not mine to take. I saw it. That’s enough.', ru: 'Оставь его. Не мне его брать. Я видел. Этого хватит.' },
        ] },
        { en: 'Maybe it’s supposed to stop.', ru: 'Может, ей и положено обрываться.', set: 'leoStop', then: [
          { who: 'leo', en: 'Hm. A song that waits for somebody.', ru: 'Хм. Песня, которая кого-то ждёт.' },
          { who: 'leo', en: 'That’s either very deep or very lazy. I’ll take it.', ru: 'Это либо очень глубоко, либо очень лениво. Беру.' },
        ] },
        { en: 'Hum it again?', ru: 'Напоёшь ещё раз?', set: 'leoHum', aff: { leo: 1 }, then: [
          { nar: { en: 'Leo hums. On the sixth note, Eli is humming too. He doesn’t know how.', ru: 'Лео напевает. На шестой ноте Илай подпевает. Сам не знает как.' } },
          { who: 'leo', en: 'Where’d a farm boy learn this?', ru: 'Где деревенский такое выучил?' },
          { who: 'eli', en: 'I didn’t. I think the walls know it.', ru: 'Нигде. По-моему, её знают стены.' },
        ] },
      ] },
      { who: 'leo', en: 'Saturday. The Blue Door, eleven. I’ll try it out loud.', ru: 'В субботу. «Синяя дверь», в одиннадцать. Попробую вслух.' },
      { who: 'leo', en: 'Bring somebody. Music needs witnesses.', ru: 'Приведи кого-нибудь. Музыке нужны свидетели.' },
      { who: 'think', en: 'Witnesses. That’s Sofia’s word.', ru: 'Свидетели. Это же слово Софии.' },
    ],
    wrong: [
      { who: 'leo', en: 'This is {drink}. Hm. No contrast. All one temperature.', ru: 'Это {drink}. Хм. Никакого контраста. Всё одной температуры.' },
      { who: 'leo', en: 'Same problem as my tune. Everything stuck in the middle.', ru: 'Та же беда, что у моей мелодии. Всё застряло посередине.' },
      { nar: { en: 'He hums anyway. Eight slow notes, then a stop.', ru: 'Он всё равно напевает. Восемь медленных нот — и обрыв.' } },
      { who: 'leo', en: 'An old man used to hum that here. Never past the stop.', ru: 'Старик когда-то напевал её здесь. Ни разу дальше обрыва.' },
      { who: 'leo', en: 'Saturday, the Blue Door. Bring somebody. Music needs witnesses.', ru: 'В субботу, «Синяя дверь». Приведи кого-нибудь. Музыке нужны свидетели.' },
      { who: 'think', en: 'Witnesses. That’s Sofia’s word.', ru: 'Свидетели. Это же слово Софии.' },
    ],
  },

  close: {
    before: [
      { enter: 'rosa' },
    ],
    good: [
      { who: 'rosa', en: 'Leo left a whole dollar under the saucer. Musicians never have dollars.', ru: 'Лео оставил под блюдцем целый доллар. У музыкантов не бывает долларов.' },
    ],
    ok: [
      { who: 'rosa', en: 'Not bad. The gelato survived you. Mostly.', ru: 'Неплохо. Джелато тебя пережило. В основном.' },
    ],
    bad: [
      { who: 'rosa', en: 'Allora. Thursday is a hard night. Even Giuseppe hated Thursdays.', ru: 'Allora. Четверг — тяжёлая ночь. Даже Джузеппе ненавидел четверги.' },
    ],
    after: [
      { who: 'rosa', en: 'The sax player was humming in my café. Everybody hums in my café lately.', ru: 'Саксофонист мурлыкал у меня в кафе. Все у меня теперь мурлыкают.' },
      { if: 'leoNotes', then: [
        { who: 'think', en: 'She doesn’t know I showed him. My knees are sweating. Can knees sweat?', ru: 'Она не знает, что я ему показал. У меня потеют колени. Колени умеют потеть?' },
      ] },
      { who: 'rosa', en: 'Lock up. And don’t hum. One of you is enough.', ru: 'Закрой. И не мурлыкай. Одного хватило.' },
      { leave: true },
      { nar: { en: 'Two a.m. The bell, right on time.', ru: 'Два часа ночи. Колокольчик, минута в минуту.' } },
      { sfx: 'door' },
      { enter: 'sofia' },
      { who: 'sofia', en: 'Witness. Don’t say anything. Did you read it?', ru: 'Свидетель. Молчи. Ты прочитал?' },
      { choice: [
        { en: 'The pitcher thing. That’s me.', ru: 'Про питчер. Это же я.', aff: { sofia: 1 }, then: [
          { who: 'sofia', en: 'It’s a barista. Any barista.', ru: 'Это бариста. Любой бариста.' },
          { who: 'sofia', en: '…Any barista who holds the pitcher like it bites.', ru: '…Любой бариста, который держит питчер, будто тот кусается.' },
        ] },
        { en: 'Five times. Once with the light off.', ru: 'Пять раз. Один раз — с выключенным светом.', set: 'readFive', aff: { sofia: 1 }, then: [
          { who: 'sofia', en: 'With the light off? How?', ru: 'С выключенным светом? Как?' },
          { who: 'eli', en: 'I don’t know. It made sense at three a.m.', ru: 'Не знаю. В три часа ночи это казалось логичным.' },
          { who: 'sofia', en: 'That’s the nicest review I’ve ever had.', ru: 'Это лучшая рецензия, которая у меня была.' },
        ] },
        { en: 'Why does he smile at the rain?', ru: 'Почему он улыбается дождю?', then: [
          { who: 'sofia', en: 'Because it followed him from home. And he doesn’t mind.', ru: 'Потому что дождь приехал за ним из дома. И он не против.' },
          { who: 'sofia', en: '…Do you mind?', ru: '…А ты против?' },
          { who: 'eli', en: 'Less every day.', ru: 'С каждым днём всё меньше.' },
        ] },
      ] },
      { who: 'sofia', en: 'The usual. I’m on chapter thirteen and it’s all fog.', ru: 'Как обычно. Я на тринадцатой главе, а там сплошной туман.' },

      { brew: { by: 'sofia', want: 'vanillalatte' },
        ok: [
          { who: 'sofia', en: 'Thank you. The fog lifts a little.', ru: 'Спасибо. Туман чуть-чуть рассеивается.' },
        ],
        wrong: [
          { who: 'sofia', en: 'This is {drink}. New. Chapter thirteen likes new.', ru: 'Это {drink}. Что-то новое. Тринадцатая глава любит новое.' },
        ] },

      { who: 'think', en: 'Say it. Just say it. It’s a club. It’s a saxophone. It’s fine.', ru: 'Скажи. Просто скажи. Это клуб. Это саксофон. Всё нормально.' },
      { choice: [
        { en: 'Leo plays Saturday. Come with me?', ru: 'Лео играет в субботу. Пойдёшь со мной?', set: 'dateYes', aff: { sofia: 2 }, then: [
          { nar: { en: 'Sofia puts the cup down very carefully.', ru: 'София очень осторожно ставит чашку.' } },
          { who: 'sofia', en: 'Witness. Are you asking me out?', ru: 'Свидетель. Ты меня приглашаешь?' },
          { who: 'eli', en: 'I’m asking you to… witness.', ru: 'Я приглашаю тебя… засвидетельствовать.' },
          { who: 'sofia', en: 'Then I’ll bring a pen.', ru: 'Тогда я возьму ручку.' },
        ] },
        { en: 'Leo plays Saturday. Gina’s coming too.', ru: 'Лео играет в субботу. Джина тоже идёт.', set: 'dateGroup', aff: { sofia: 1 }, then: [
          { who: 'sofia', en: 'Gina? Then the whole block will know what I wore.', ru: 'Джина? Тогда весь квартал узнает, в чём я была.' },
          { who: 'sofia', en: '…I’ll come.', ru: '…Я приду.' },
          { who: 'think', en: 'Gina doesn’t know she’s coming yet. Gina will be thrilled.', ru: 'Джина пока не знает, что идёт. Джина будет в восторге.' },
        ] },
        { en: 'Say nothing. Not tonight.', ru: 'Промолчать. Не сегодня.', set: 'dateNo', then: [
          { who: 'think', en: 'Tomorrow. Tomorrow is a great day for courage.', ru: 'Завтра. Завтра — отличный день для смелости.' },
          { who: 'think', en: 'Tomorrow is not Saturday. I know. I know.', ru: 'Завтра — не суббота. Я знаю. Знаю.' },
        ] },
      ] },
      { who: 'sofia', en: 'Goodnight, witness.', ru: 'Спокойной ночи, свидетель.' },
      { leave: true },
      { nar: { en: 'Upstairs, the radiator plays eight notes and stops.', ru: 'Наверху батарея играет восемь нот и замолкает.' } },
      { who: 'think', en: 'Now I’m hearing it everywhere. Great.', ru: 'Теперь я слышу её везде. Отлично.' },
    ],
  },

  diary: [
    { en: 'Night 11.', ru: 'Ночь 11.' },
    { if: 'marcoAdvice', en: 'Marco came second. He didn’t look back. Well, once. After.', ru: 'Марко пришёл вторым. Не оглядывался. Ну, один раз. После.' },
    { if: '!marcoAdvice', en: 'Marco came fourth again. He calls it a tradition. It isn’t.', ru: 'Марко опять четвёртый. Говорит, это традиция. Это не традиция.' },
    { en: 'Leo is stuck on a tune an old man used to hum at our counter.', ru: 'Лео застрял на мелодии, которую старик напевал за нашей стойкой.' },
    { if: 'leoNotes', en: 'I showed him the paper. It goes up after the stop. Rosa doesn’t know.', ru: 'Я показал ему лист. После обрыва она идёт вверх. Роза не знает.' },
    { if: 'askedE', en: 'I asked Rosa who E. was. Her spoon stopped.', ru: 'Спросил Розу, кто такой E. У неё замерла ложка.' },
    { if: 'dateYes', en: 'I asked Sofia to the Blue Door. She’s bringing a pen.', ru: 'Позвал Софию в «Синюю дверь». Она возьмёт ручку.' },
    { if: 'dateGroup', en: 'Sofia is coming Saturday. So is Gina, who doesn’t know it yet.', ru: 'София придёт в субботу. И Джина, которая пока об этом не знает.' },
    { if: 'dateNo', en: 'I didn’t ask her. Tomorrow. Probably.', ru: 'Не позвал её. Завтра. Наверное.' },
  ],
};
