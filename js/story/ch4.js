// Глава 4 «Ключ» — конец первого акта. У Розы болят колени, и Илай впервые открывается один. Тони приводит Нико.
// Вердикт пробной недели — и под стойкой ноты: «Bella Notte — per Rosa. E., 1979».

STORY_CH.ch4 = {
  num: { en: 'Chapter 4', ru: 'Глава 4' },
  title: { en: 'A Key', ru: 'Ключ' },
  bar: { recipes: ['espresso', 'americano', 'latte', 'cappuccino', 'vanillalatte', 'ristretto', 'doppio'], day: 4 },

  road: [
    { nar: { en: 'Day seven. The trial week ends tonight.', ru: 'День седьмой. Сегодня кончается пробная неделя.' } },
    { who: 'think', en: 'My commute is now fourteen steps. Each one creaks a different note.', ru: 'Дорога на работу теперь — четырнадцать ступенек. Каждая скрипит на свою ноту.' },
    { who: 'think', en: 'I counted. It’s not quite a song. It’s close.', ru: 'Я сосчитал. Это ещё не песня. Но почти.' },
    { phone: 'junie', en: 'mom says you live ABOVE A CAFE now??', ru: 'мама говорит ты теперь живёшь НАД КАФЕ??' },
    { phone: 'junie', en: 'thats literally a movie', ru: 'это буквально кино' },
    { phone: 'eli', en: 'a very small movie. low budget', ru: 'очень маленькое кино. малобюджетное' },
    { who: 'rosa', off: true, en: 'Ragazzo! My knees say rain. I’m staying upstairs.', ru: 'Ragazzo! Колени говорят — дождь. Я остаюсь наверху.' },
    { who: 'eli', en: 'Then who’s going to run the—', ru: 'А кто тогда будет вести…' },
    { who: 'rosa', off: true, en: 'You. You were alone in Pennsylvania, no? Same thing. More people.', ru: 'Ты. В Пенсильвании ты был один, нет? То же самое. Людей больше.' },
    { who: 'think', en: 'That is not how any of that works.', ru: 'Всё совсем не так устроено.' },
    { who: 'think', en: 'Okay. Okay. Doors.', ru: 'Ладно. Ладно. Двери.' },
  ],

  beat: {
    by: 'tony', want: 'doppio', at: 0.35,
    intro: [
      { nar: { en: 'Tony fills the doorway. Behind him, a skinny teenager with Tony’s eyebrows.', ru: 'Тони заполняет дверной проём. За ним — худой подросток с бровями Тони.' } },
      { who: 'tony', en: 'Farm boy. This is Nico. Nico — the farm boy.', ru: 'Деревенский. Это Нико. Нико — деревенский.' },
      { who: 'nico', en: 'Hey.', ru: 'Привет.' },
      { if: 'nicoInvite', then: [
        { who: 'tony', en: 'You invited him. So he came. He’s been ready since four.', ru: 'Ты его позвал. Вот он и пришёл. С четырёх часов готов.' },
      ], else: [
        { who: 'tony', en: 'He wanted to see the guy who took his job.', ru: 'Хотел посмотреть на того, кто занял его место.' },
      ] },
      { who: 'nico', en: 'Dad.', ru: 'Пап.' },
      { who: 'tony', en: 'Doppio for me. And for him—', ru: 'Мне доппио. А ему…' },
      { who: 'nico', en: 'Doppio.', ru: 'Доппио.' },
      { who: 'tony', en: 'You don’t drink doppio.', ru: 'Ты не пьёшь доппио.' },
      { who: 'nico', en: 'I do now.', ru: 'Теперь пью.' },
      { who: 'think', en: 'One doppio for Tony. Nico just wants to watch me make it.', ru: 'Доппио — Тони. А Нико просто хочет посмотреть, как я его делаю.' },
    ],
    ok: [
      { nar: { en: 'Nico watches every move, like a scout at a ball game.', ru: 'Нико следит за каждым движением, как скаут на матче.' } },
      { who: 'nico', en: 'You pull a little long. Rosa’s machine likes it short.', ru: 'Ты чуть передерживаешь. Машина Розы любит покороче.' },
      { choice: [
        { en: 'Show me.', ru: 'Покажи.', set: 'nicoFriend', aff: { nico: 1 }, then: [
          { nar: { en: 'Nico steps behind the counter like he’s done it a hundred times. He has.', ru: 'Нико заходит за стойку, будто делал это сто раз. Делал.' } },
          { who: 'nico', en: 'Like this. See? Short. She hisses less.', ru: 'Вот так. Видишь? Коротко. Она меньше шипит.' },
          { who: 'think', en: 'He’s sixteen and better than me. Great. Wonderful.', ru: 'Ему шестнадцать, и он лучше меня. Отлично. Прекрасно.' },
        ] },
        { en: 'Rosa likes it this way.', ru: 'Розе нравится так.', set: 'nicoEnzo', then: [
          { who: 'nico', en: 'Rosa likes everything the way Giuseppe did.', ru: 'Розе нравится всё, как делал Джузеппе.' },
          { who: 'nico', en: 'Dad says Giuseppe and Enzo used to fight over it. Short or long.', ru: 'Папа говорит, Джузеппе и Энцо из-за этого ругались. Коротко или длинно.' },
          { who: 'tony', en: 'Nico.', ru: 'Нико.' },
          { who: 'think', en: 'Enzo. There it is again.', ru: 'Энцо. Опять.' },
        ] },
        { en: 'Want to work weekends?', ru: 'Хочешь работать по выходным?', set: 'nicoWeekends', aff: { tony: 1, nico: 1 }, then: [
          { who: 'tony', en: 'Rosa decides that.', ru: 'Это решает Роза.' },
          { who: 'nico', en: '…Yeah. I’d like that.', ru: '…Да. Я бы хотел.' },
          { who: 'tony', en: 'Don’t look at me like that. I have flour in my eyes.', ru: 'Не смотри на меня так. У меня мука в глазах.' },
        ] },
      ] },
      { who: 'tony', en: 'Not bad, farm boy. Not bad at all.', ru: 'Неплохо, деревенский. Совсем неплохо.' },
    ],
    wrong: [
      { nar: { en: 'Nico grins before Tony even looks.', ru: 'Нико ухмыляется раньше, чем Тони успевает посмотреть.' } },
      { who: 'nico', en: 'That’s not a doppio.', ru: 'Это не доппио.' },
      { who: 'tony', en: 'See? Farm.', ru: 'Видишь? Ферма.' },
      { who: 'nico', en: 'Dad, it’s fine. Everybody messes up in week one.', ru: 'Пап, нормально. Все ошибаются в первую неделю.' },
      { who: 'tony', en: 'You didn’t.', ru: 'Ты не ошибался.' },
      { who: 'nico', en: 'I’m not in week one.', ru: 'У меня не первая неделя.' },
      { set: 'nicoFriend' },
    ],
  },

  close: {
    before: [
      { nar: { en: 'Two a.m. The chairs are up. Footsteps on the stairs — slow ones.', ru: 'Два часа ночи. Стулья на столах. Шаги на лестнице — медленные.' } },
      { enter: 'rosa' },
      { who: 'rosa', en: 'Sit.', ru: 'Сядь.' },
      { who: 'think', en: 'I sit. On a stool, behind my own counter. It feels like a trial.', ru: 'Я сажусь. На табурет, за собственной стойкой. Похоже на суд.' },
      { who: 'think', en: 'Because it is.', ru: 'Потому что это он и есть.' },
    ],
    good: [
      { who: 'rosa', en: 'The till is fat. The cups are whole. Tony complained only twice.', ru: 'Касса толстая. Чашки целые. Тони пожаловался всего дважды.' },
    ],
    ok: [
      { who: 'rosa', en: 'Not perfect. Giuseppe wasn’t perfect either. Don’t tell anyone.', ru: 'Не идеально. Джузеппе тоже не был идеален. Только никому не говори.' },
    ],
    bad: [
      { who: 'rosa', en: 'People waited. People left.', ru: 'Люди ждали. Люди уходили.' },
      { who: 'rosa', en: 'Giuseppe’s first week, they left too. Then they came back.', ru: 'В первую неделю Джузеппе от него тоже уходили. Потом возвращались.' },
    ],
    after: [
      { who: 'rosa', en: 'One week. You were late once. You made at least one wrong drink.', ru: 'Неделя. Один раз опоздал. Как минимум один раз сварил не то.' },
      { who: 'rosa', en: 'And you talk to people like they are people. That I can’t teach.', ru: 'И ты говоришь с людьми как с людьми. Этому я не научу.' },
      { who: 'rosa', en: 'Stay.', ru: 'Оставайся.' },
      { who: 'think', en: 'She said it like a weather report. My eyes did something embarrassing.', ru: 'Она сказала это как прогноз погоды. Глаза у меня повели себя неловко.' },
      { nar: { en: 'She puts a key on the counter. Old brass, warm from her pocket.', ru: 'Она кладёт на стойку ключ. Старая латунь, тёплая из кармана.' } },
      { who: 'rosa', en: 'Not the keys, ragazzo. A key.', ru: 'Не ключи от кафе, ragazzo. Один ключ.' },
      { choice: [
        { en: 'Thank you, Rosa. Really.', ru: 'Спасибо, Роза. Правда.', aff: { rosa: 1 }, then: [
          { who: 'rosa', en: 'Don’t cry on the counter. I just wiped it.', ru: 'Не плачь на стойку. Я только что её протёрла.' },
        ] },
        { en: 'What’s the difference?', ru: 'А в чём разница?', then: [
          { who: 'rosa', en: 'The keys open everything. A key opens the door.', ru: 'Ключи открывают всё. Ключ открывает дверь.' },
          { who: 'rosa', en: 'The rest, you earn.', ru: 'Остальное заработаешь.' },
        ] },
        { en: 'Take the key. Say nothing.', ru: 'Взять ключ. Ничего не говорить.', aff: { rosa: 1 }, then: [
          { who: 'rosa', en: 'Good. You learn.', ru: 'Хорошо. Учишься.' },
        ] },
      ] },
      { who: 'rosa', en: 'Lock up. I’m old. Old women need sleep and a little gossip.', ru: 'Закрой. Я старая. Старым женщинам нужен сон и немного сплетен.' },
      { leave: true },
      { nar: { en: 'The last light. The last cup. It rolls under the counter, of course.', ru: 'Последний свет. Последняя чашка. Конечно же, она закатывается под стойку.' } },
      { nar: { en: 'Under the sugar jar, someone left a folded napkin.', ru: 'Под банкой с сахаром кто-то оставил сложенную салфетку.' } },
      { note: { en: 'Chapter twelve moves.\nThank you, witness.\n— S.', ru: 'Двенадцатая глава сдвинулась.\nСпасибо, свидетель.\n— С.' } },
      { who: 'think', en: 'When did she— Gina. Gina delivered it. Gina delivers everything.', ru: 'Когда она… Джина. Джина передала. Джина передаёт всё.' },
      { nar: { en: 'On his knees, reaching for the cup, he sees paper taped under the counter.', ru: 'Стоя на коленях за чашкой, он видит лист, приклеенный под стойкой.' } },
      { nar: { en: 'Yellow. Old. Lines and little black notes.', ru: 'Пожелтевший. Старый. Линейки и маленькие чёрные ноты.' } },
      { note: { en: 'BELLA NOTTE\nper Rosa\n— E., 1979', ru: 'BELLA NOTTE\nper Rosa\n— E., 1979' } },
      { who: 'think', en: '“Per Rosa.” For Rosa.', ru: '«Per Rosa». Для Розы.' },
      { who: 'think', en: 'E. The third guy. The mandolin. The Friday song.', ru: 'E. Третий с фото. Мандолина. Пятничная песня.' },
      { who: 'think', en: 'Everybody thinks it’s from the cartoon.', ru: 'Все думают, что это из мультика.' },
      { nar: { en: 'He tapes it back exactly the way he found it.', ru: 'Он приклеивает лист обратно — ровно так, как нашёл.' } },
    ],
  },

  diary: [
    { en: 'Night 7. The end of the trial week.', ru: 'Ночь 7. Конец пробной недели.' },
    { en: 'I have a job. And a key. Not the keys.', ru: 'У меня есть работа. И ключ. Не ключи.' },
    { if: 'nicoFriend', en: 'Nico showed me how Rosa’s machine likes it. He’s sixteen. I’ll live.', ru: 'Нико показал, как любит машина Розы. Ему шестнадцать. Переживу.' },
    { if: 'nicoEnzo', en: 'Nico says Giuseppe and Enzo used to fight about the coffee.', ru: 'Нико говорит, Джузеппе и Энцо спорили из-за кофе.' },
    { if: 'nicoWeekends', en: 'Asked Nico about weekends. Tony pretended there was flour in his eyes.', ru: 'Позвал Нико на выходные. Тони сделал вид, что у него мука в глазах.' },
    { en: 'Under the counter: “Bella Notte — per Rosa. E., 1979.”', ru: 'Под стойкой: «Bella Notte — per Rosa. E., 1979».' },
    { en: 'It’s not from a cartoon. It’s a song. Somebody wrote it for her.', ru: 'Это не из мультика. Это песня. Кто-то написал её для неё.' },
    { en: 'I put it back. I don’t know why. Maybe because she did.', ru: 'Я вернул его на место. Не знаю зачем. Может, потому что она так сделала.' },
    { en: 'End of Act One.', ru: 'Конец первого акта.' },
  ],
};
