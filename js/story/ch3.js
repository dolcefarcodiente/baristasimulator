// Глава 3 «Пятница»: диван у Кайла кончился, Роза учит ристретто, профессор Сал вспоминает пятничную музыку,
// а после закрытия Илай поднимается в комнату наверху — с бледным следом на обоях.

STORY_CH.ch3 = {
  num: { en: 'Chapter 3', ru: 'Глава 3' },
  title: { en: 'Friday', ru: 'Пятница' },
  bar: { recipes: ['espresso', 'americano', 'latte', 'cappuccino', 'vanillalatte', 'ristretto'], day: 3, teach: 'ristretto' },

  road: [
    { cg: 'outside' },
    { nar: { en: 'Friday.', ru: 'Пятница.' } },
    { phone: 'kyle', en: 'so… tonight is the last night. sorry man. landlord', ru: 'короче… сегодня последняя ночь. прости. хозяин квартиры' },
    { phone: 'mom', en: 'Junie says you have a JOB? Call me when you can. Are you eating?', ru: 'Джуни говорит, у тебя РАБОТА? Позвони, как сможешь. Ты ешь?' },
    { phone: 'eli', en: 'tomorrow. promise', ru: 'завтра. обещаю' },
    { who: 'think', en: 'I’ve told Mom “tomorrow” eleven times since August.', ru: 'С августа я сказал маме «завтра» одиннадцать раз.' },
    { nar: { en: 'Everything he owns is in the backpack. It’s lighter than it should be.', ru: 'Всё, что у него есть, — в рюкзаке. Он легче, чем должен быть.' } },
    { sfx: 'door' },
    { cg: null },
    { enter: 'rosa' },
    { nar: { en: 'Rosa looks at the backpack. Then at him. Then at the backpack again.', ru: 'Роза смотрит на рюкзак. Потом на него. Потом снова на рюкзак.' } },
    { who: 'rosa', en: 'You’re moving in, or running away?', ru: 'Ты переезжаешь или сбегаешь?' },
    { choice: [
      { en: 'Just carrying my stuff.', ru: 'Просто ношу свои вещи.', then: [
        { who: 'rosa', en: 'Hm. It looks lighter than your face.', ru: 'Хм. Он выглядит легче, чем твоё лицо.' },
      ] },
      { en: 'My friend’s couch expires tonight.', ru: 'Сегодня у друга кончается диван.', set: 'toldCouch', aff: { rosa: 1 }, then: [
        { who: 'rosa', en: 'Couches don’t expire, ragazzo. Friends do.', ru: 'Диваны не кончаются, ragazzo. Кончаются друзья.' },
      ] },
      { en: 'Both?', ru: 'И то, и другое?', then: [
        { who: 'rosa', en: 'Pick one by closing.', ru: 'К закрытию выбери что-то одно.' },
      ] },
    ] },
    { who: 'rosa', en: 'Today — ristretto. Less water, the same coffee.', ru: 'Сегодня — ристретто. Меньше воды, тот же кофе.' },
    { who: 'rosa', en: 'A short sentence that says everything. Giuseppe talked like that.', ru: 'Короткая фраза, в которой всё сказано. Джузеппе так говорил.' },
    { who: 'rosa', en: 'The professor will come. Don’t talk to him.', ru: 'Придёт профессор. Не заговаривай с ним.' },
    { who: 'rosa', en: 'If you deserve it, he will talk to you.', ru: 'Если заслужишь, он заговорит с тобой сам.' },
    { leave: true },
  ],

  beat: {
    by: 'sal', want: 'ristretto', at: 0.35,
    intro: [
      { nar: { en: 'A tall old man folds his umbrella with surgical precision.', ru: 'Высокий старик складывает зонт с хирургической точностью.' } },
      { who: 'sal', en: 'Ristretto. No sugar. And, ideally, no conversation.', ru: 'Ристретто. Без сахара. И, в идеале, без разговоров.' },
      { who: 'think', en: 'Message received.', ru: 'Понял. Принял.' },
    ],
    ok: [
      { nar: { en: 'He drinks it in one small, exact sip.', ru: 'Он выпивает его одним маленьким точным глотком.' } },
      { who: 'sal', en: 'Acceptable. In Giuseppe’s day it was shorter. Two seconds shorter.', ru: 'Приемлемо. При Джузеппе было короче. На две секунды.' },
      { who: 'think', en: 'He timed Giuseppe’s ristretto. For forty years.', ru: 'Он засекал ристретто Джузеппе. Сорок лет.' },
      { who: 'sal', en: 'Fridays used to be different here.', ru: 'По пятницам здесь раньше было иначе.' },
      { who: 'sal', en: 'Music. A young man by the window, with a mandolin.', ru: 'Музыка. Молодой человек у окна, с мандолиной.' },
      { who: 'sal', en: 'The same song every week. Nobody minded.', ru: 'Каждую неделю одна и та же песня. Никто не возражал.' },
      { choice: [
        { en: 'Who was he?', ru: 'Кто он был?', set: 'heardEnzo', then: [
          { who: 'sal', en: 'Giuseppe’s friend. Enzo, I believe.', ru: 'Друг Джузеппе. Энцо, кажется.' },
          { who: 'sal', en: 'I am an astronomer, not a historian. I remember orbits, not names.', ru: 'Я астроном, а не историк. Я помню орбиты, а не имена.' },
          { who: 'think', en: 'He remembered that one.', ru: 'Это имя он почему-то запомнил.' },
        ] },
        { en: 'What song?', ru: 'Какую песню?', set: 'heardSong', aff: { sal: 1 }, then: [
          { who: 'sal', en: 'The only song I have ever hummed. In sixty years.', ru: 'Единственную песню, которую я когда-либо напевал. За шестьдесят лет.' },
          { who: 'sal', en: 'Ask Rosa. Or better — don’t.', ru: 'Спросите Розу. А лучше — не спрашивайте.' },
        ] },
        { en: 'Say nothing. Ristretto and silence.', ru: 'Промолчать. Ристретто и тишина.', set: 'heardEnzo', aff: { sal: 2 }, then: [
          { nar: { en: 'Sal looks at him over his glasses. Something like approval.', ru: 'Сал смотрит на него поверх очков. Что-то вроде одобрения.' } },
          { who: 'sal', en: 'You do learn. Good.', ru: 'Вы учитесь. Хорошо.' },
          { who: 'sal', en: 'His name was Enzo. Since you didn’t ask.', ru: 'Его звали Энцо. Раз уж вы не спросили.' },
        ] },
      ] },
      { who: 'sal', en: 'There is a comet tonight. Behind the clouds. Like most things here.', ru: 'Сегодня видна комета. За облаками. Как и почти всё здесь.' },
    ],
    wrong: [
      { who: 'sal', en: 'This is {drink}.', ru: 'Это {drink}.' },
      { who: 'sal', en: 'A ristretto is a short sentence. This is a novel.', ru: 'Ристретто — короткая фраза. А это — роман.' },
      { who: 'think', en: 'Sofia would steal that line.', ru: 'София украла бы эту фразу.' },
      { who: 'sal', en: 'Do it correctly next time. I will be here. I am always here.', ru: 'В следующий раз сделайте как следует. Я буду здесь. Я всегда здесь.' },
    ],
  },

  close: {
    before: [
      { enter: 'rosa' },
    ],
    good: [
      { who: 'rosa', en: 'The professor said “acceptable”. Twice. I wrote down the date.', ru: 'Профессор сказал «приемлемо». Дважды. Я записала дату.' },
    ],
    ok: [
      { who: 'rosa', en: 'Friday. Busy. You didn’t drown. That counts.', ru: 'Пятница. Людно. Ты не утонул. Засчитывается.' },
    ],
    bad: [
      { who: 'rosa', en: 'Allora. Friday ate you alive.', ru: 'Allora. Пятница тебя съела.' },
      { who: 'rosa', en: 'It ate Giuseppe too, the first year. He came back for more.', ru: 'Джузеппе она тоже съедала, в первый год. Он возвращался за добавкой.' },
    ],
    after: [
      { who: 'rosa', en: 'That backpack has been staring at me all night.', ru: 'Этот рюкзак смотрит на меня весь вечер.' },
      { if: 'toldCouch', then: [
        { who: 'rosa', en: 'The couch man. Tonight was the last night, yes?', ru: 'Человек с диваном. Сегодня последняя ночь, да?' },
      ], else: [
        { who: 'eli', en: 'My friend’s couch. Tonight was the last night.', ru: 'Диван у друга. Сегодня была последняя ночь.' },
      ] },
      { who: 'eli', en: 'There’s a hostel on Atlantic. I’ll be fine.', ru: 'На Атлантик-авеню есть хостел. Я справлюсь.' },
      { who: 'rosa', en: 'A hostel.', ru: 'Хостел.' },
      { who: 'think', en: 'She says it the way other people swear.', ru: 'Она произносит это так, как другие ругаются.' },
      { who: 'rosa', en: 'Upstairs. Second door. The bed is old, the window sticks.', ru: 'Наверх. Вторая дверь. Кровать старая, окно заедает.' },
      { who: 'rosa', en: 'The radiator sings at night. Don’t sing back.', ru: 'Батарея ночью поёт. Не подпевай.' },
      { choice: [
        { en: 'I can pay rent.', ru: 'Я могу платить.', then: [
          { who: 'rosa', en: 'You will. In foam, and in milk carried up the stairs.', ru: 'Будешь. Пеной. И молоком, которое ты будешь носить наверх.' },
        ] },
        { en: 'Why are you doing this?', ru: 'Зачем вы это делаете?', aff: { rosa: 1 }, then: [
          { who: 'rosa', en: 'Because the room is empty. And empty rooms get ideas.', ru: 'Потому что комната пустая. А пустым комнатам лезут в голову мысли.' },
        ] },
        { en: 'Thank you.', ru: 'Спасибо.', aff: { rosa: 1 }, then: [
          { who: 'rosa', en: 'Don’t thank me. Thank my knees. Someone has to carry the milk.', ru: 'Не меня благодари. Мои колени. Кто-то должен носить молоко.' },
        ] },
      ] },
      { who: 'rosa', en: 'And touch nothing on the walls.', ru: 'И ничего не трогай на стенах.' },
      { leave: true },
      { nar: { en: 'Five to two. The bell. He doesn’t even look up anymore.', ru: 'Без пяти два. Колокольчик. Он уже даже не поднимает глаз.' } },
      { sfx: 'door' },
      { enter: 'sofia' },
      { who: 'sofia', en: 'Witness, I— you have a backpack.', ru: 'Свидетель, я… у тебя рюкзак.' },
      { who: 'sofia', en: 'Are you… leaving?', ru: 'Ты… уезжаешь?' },
      { if: 'leanStay', then: [
        { who: 'sofia', en: 'Yesterday you told me my barista stays.', ru: 'Вчера ты сказал, что мой бариста остаётся.' },
      ] },
      { if: 'leanHome', then: [
        { who: 'sofia', en: 'So he goes home after all.', ru: 'Значит, он всё-таки едет домой.' },
      ] },
      { choice: [
        { en: 'I’m moving. Upstairs.', ru: 'Переезжаю. Наверх.', then: [
          { nar: { en: 'Sofia laughs, surprised at herself.', ru: 'София смеётся — сама от себя не ожидала.' } },
          { who: 'sofia', en: 'Upstairs. The shortest commute in Brooklyn.', ru: 'Наверх. Самая короткая дорога на работу в Бруклине.' },
        ] },
        { en: 'Would it matter?', ru: 'А это было бы важно?', set: 'askedMatter', aff: { sofia: 1 }, then: [
          { nar: { en: 'She opens her mouth. Closes it. Holds the notebook a little tighter.', ru: 'Она открывает рот. Закрывает. Чуть сильнее сжимает блокнот.' } },
          { who: 'sofia', en: 'Chapter twelve would have a very bad night.', ru: 'У двенадцатой главы была бы очень плохая ночь.' },
        ] },
        { en: 'The backpack is for emotional support.', ru: 'Рюкзак — для моральной поддержки.', then: [
          { who: 'sofia', en: 'Mine is a notebook. Same thing, fewer straps.', ru: 'У меня блокнот. То же самое, только без лямок.' },
        ] },
      ] },
      { who: 'rosa', off: true, en: 'He is not leaving! He lives upstairs now!', ru: 'Он никуда не едет! Он теперь живёт наверху!' },
      { who: 'rosa', off: true, en: 'Go home, cara. It’s two in the morning.', ru: 'Иди домой, cara. Два часа ночи.' },
      { who: 'sofia', en: 'Goodnight, Rosa!', ru: 'Спокойной ночи, Роза!' },
      { who: 'sofia', en: 'Goodnight… upstairs.', ru: 'Спокойной ночи… сосед сверху.' },
      { leave: true },
      { nar: { en: 'The stairs creak in fourteen different notes.', ru: 'Лестница скрипит на четырнадцать разных нот.' } },
      { nar: { en: 'The room smells of dust and oranges. A narrow bed. A window over the street.', ru: 'В комнате пахнет пылью и апельсинами. Узкая кровать. Окно на улицу.' } },
      { nar: { en: 'Above the bed, a pale shape on the wallpaper, where something hung for years.', ru: 'Над кроватью на обоях бледный след — там что-то висело много лет.' } },
      { who: 'think', en: 'Round at one end, long at the other. Too round for a guitar.', ru: 'С одного конца круглое, с другого длинное. Для гитары слишком круглое.' },
      { if: 'heardEnzo', then: [
        { who: 'think', en: 'Enzo. The mandolin. He lived here.', ru: 'Энцо. Мандолина. Он жил здесь.' },
      ], else: [
        { who: 'think', en: 'The guy from the photo. The mandolin. He lived here.', ru: 'Парень с фото. Мандолина. Он жил здесь.' },
      ] },
      { nar: { en: 'Across the street, above the laundromat, one window is lit. Someone is typing.', ru: 'Через дорогу, над прачечной, горит одно окно. Кто-то печатает.' } },
      { who: 'think', en: 'Of course. Of course she can see this window.', ru: 'Конечно. Конечно, ей видно это окно.' },
    ],
  },

  diary: [
    { en: 'Night 3. Friday.', ru: 'Ночь 3. Пятница.' },
    { en: 'Kyle’s couch is officially history. I live above a café now.', ru: 'Диван Кайла официально в прошлом. Я теперь живу над кафе.' },
    { en: 'Learned ristretto. A short sentence that says everything.', ru: 'Научился ристретто. Короткая фраза, в которой всё сказано.' },
    { if: 'heardEnzo', en: 'The mandolin guy has a name. Enzo. He played here on Fridays.', ru: 'У парня с мандолиной есть имя. Энцо. По пятницам он играл здесь.' },
    { if: 'heardSong', en: 'Sal hums one song in sixty years. The Friday one.', ru: 'Сал за шестьдесят лет напевал одну песню. Ту, пятничную.' },
    { if: 'askedMatter', en: 'I asked Sofia if it would matter if I left. She didn’t say no.', ru: 'Спросил Софию, было бы ей важно, если бы я уехал. Она не сказала «нет».' },
    { en: 'There is a pale mark on my wall, the shape of a mandolin.', ru: 'На стене у меня бледный след в форме мандолины.' },
    { en: 'I didn’t touch it. Rosa said not to. I wanted to.', ru: 'Я не трогал. Роза не велела. А хотелось.' },
    { en: 'Called Mom. Finally.', ru: 'Позвонил маме. Наконец-то.' },
  ],
};
