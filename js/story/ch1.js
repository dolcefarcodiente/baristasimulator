// Глава 1 «Первая смена»: правила Розы, Тони проверяет «деревенского», а после закрытия заходит София.

STORY_CH.ch1 = {
  num: { en: 'Chapter 1', ru: 'Глава 1' },
  title: { en: 'First Shift', ru: 'Первая смена' },
  // первая смена: три простых напитка, мало гостей и места у стойки (как в первую ночь свободной игры)
  bar: { recipes: ['espresso', 'americano', 'latte'], day: 1 },

  road: [
    { cg: 'outside' },
    { nar: { en: 'Day one. Six o’clock sharp. Well — six-oh-two.', ru: 'День первый. Ровно шесть. Ну, почти — шесть ноль две.' } },
    { who: 'think', en: 'Kyle’s couch has a spring that knows my name.', ru: 'В диване Кайла есть пружина, которая знает моё имя.' },
    { phone: 'junie', en: 'good luck!! dont spill anything on anyone', ru: 'удачи!! не облей никого' },
    { phone: 'junie', en: 'also mom says wear the blue shirt', ru: 'и мама говорит надень синюю рубашку' },
    { who: 'think', en: 'I am wearing the blue shirt. I own two shirts.', ru: 'Я в синей рубашке. У меня их две.' },
    { sfx: 'door' },
    { cg: null },
    { enter: 'rosa' },
    { who: 'rosa', en: 'Two minutes late. I counted.', ru: 'Две минуты опоздания. Я считала.' },
    { choice: [
      { en: 'The bus was late.', ru: 'Автобус опоздал.', then: [
        { who: 'rosa', en: 'The bus is always late. Leave earlier.', ru: 'Автобус всегда опаздывает. Выходи раньше.' },
      ] },
      { en: 'Sorry. It won’t happen again.', ru: 'Простите. Больше не повторится.', aff: { rosa: 1 }, then: [
        { who: 'rosa', en: 'We’ll see. Everyone is sorry on day one.', ru: 'Посмотрим. В первый день все извиняются.' },
      ] },
      { en: 'I was reading the menu in the window. Twice.', ru: 'Читал меню в окне. Дважды.', set: 'menuGiuseppe', then: [
        { who: 'rosa', en: 'And?', ru: 'И?' },
        { who: 'eli', en: '“Macchiato” is spelled two different ways.', ru: '«Макиато» там написано двумя способами.' },
        { nar: { en: 'Rosa glances at the window. Something in her face goes still.', ru: 'Роза смотрит на окно. Что-то в её лице замирает.' } },
        { who: 'rosa', en: 'Giuseppe’s handwriting. Leave it.', ru: 'Почерк Джузеппе. Не трогай.' },
      ] },
    ] },
    { who: 'rosa', en: 'Rules. One: the customer is not always right.', ru: 'Правила. Первое: гость не всегда прав.' },
    { who: 'rosa', en: 'But the customer always pays.', ru: 'Но гость всегда платит.' },
    { who: 'rosa', en: 'Two: Tony will come. Tony will be rude. Tony is family.', ru: 'Второе: придёт Тони. Тони будет хамить. Тони — семья.' },
    { who: 'rosa', en: 'Three: smile. Not too much — people get nervous.', ru: 'Третье: улыбайся. Но не слишком — люди нервничают.' },
    { who: 'think', en: 'I practiced a smile on the bus. Apparently, too much.', ru: 'Я тренировал улыбку в автобусе. Видимо, слишком.' },
    { who: 'rosa', en: 'I’ll be upstairs. My knees have a date with the sofa.', ru: 'Я наверху. У моих коленей свидание с диваном.' },
    { who: 'rosa', en: 'Open the doors, ragazzo.', ru: 'Открывай двери, ragazzo.' },
    { leave: true },
  ],

  beat: {
    by: 'tony', want: 'doppio', at: 0.3,
    intro: [
      { nar: { en: 'A big man in a flour-dusted apron fills the doorway.', ru: 'Дверной проём заполняет здоровяк в фартуке, присыпанном мукой.' } },
      { who: 'tony', en: 'So you’re the guy from the farm.', ru: 'Значит, ты и есть парень с фермы.' },
      { who: 'eli', en: 'Maple Falls. It’s a town.', ru: 'Мейпл-Фоллс. Это город.' },
      { who: 'tony', en: 'It’s got a stoplight?', ru: 'Светофор есть?' },
      { who: 'eli', en: 'One.', ru: 'Один.' },
      { who: 'tony', en: 'Farm. Doppio — two shots, one cup. Let’s see what Rosa found.', ru: 'Ферма. Доппио — два шота в одну чашку. Посмотрим, кого Роза нашла.' },
    ],
    ok: [
      { nar: { en: 'Tony drinks it standing up, like a man with an oven waiting.', ru: 'Тони пьёт стоя, как человек, которого ждёт печь.' } },
      { who: 'tony', en: 'Huh.', ru: 'Хм.' },
      { who: 'tony', en: 'That’s… okay. That’s coffee.', ru: 'Это… нормально. Это кофе.' },
      { who: 'tony', en: 'My Nico wanted this job, you know.', ru: 'Мой Нико хотел эту работу, знаешь.' },
      { who: 'tony', en: 'He’s sixteen. Practices on the machine at my pizzeria.', ru: 'Ему шестнадцать. Тренируется на машине у меня в пиццерии.' },
      { choice: [
        { en: 'Then send him over. I could use the help.', ru: 'Пусть приходит. Мне помощь не помешает.', set: 'nicoInvite', aff: { tony: 1 }, then: [
          { who: 'tony', en: 'With you? Ha!', ru: 'К тебе? Ха!' },
          { who: 'tony', en: '…I’ll tell him. He’ll grumble. He’ll come.', ru: '…Я ему передам. Он поворчит. И придёт.' },
        ] },
        { en: 'I need it more. Sorry.', ru: 'Мне она нужнее. Простите.', set: 'honestTony', then: [
          { who: 'tony', en: 'Honest. Annoying, but honest.', ru: 'Честно. Бесит, но честно.' },
          { who: 'tony', en: 'Rosa likes honest. I’m still deciding.', ru: 'Роза любит честных. Я пока думаю.' },
        ] },
        { en: 'Is he any good?', ru: 'А он хорош?', aff: { tony: 1 }, then: [
          { who: 'tony', en: 'He’s sixteen. He’s great at sleeping.', ru: 'Ему шестнадцать. Спит он отлично.' },
          { who: 'tony', en: 'But coffee — yeah. He’s good. Don’t tell him I said that.', ru: 'Но кофе — да. Хорош. Только ему не говори.' },
        ] },
      ] },
      { who: 'tony', en: 'Back to the oven. Rain is bad for pizza.', ru: 'Обратно к печи. Дождь — плохо для пиццы.' },
    ],
    wrong: [
      { nar: { en: 'Tony looks into the cup for a long time.', ru: 'Тони долго смотрит в чашку.' } },
      { who: 'tony', en: 'This is {drink}. I asked for a doppio.', ru: 'Это {drink}. Я просил доппио.' },
      { who: 'think', en: 'In my defense, I panicked.', ru: 'В свою защиту: я запаниковал.' },
      { who: 'tony', en: 'Rosa! Your farm boy—', ru: 'Роза! Твой деревенский…' },
      { who: 'rosa', off: true, en: 'I heard, Tony. Drink it. It’s on the house.', ru: 'Я слышала, Тони. Пей. За счёт заведения.' },
      { who: 'tony', en: '…It’s not bad, though. Don’t tell her.', ru: '…Хотя неплохо. Ей не говори.' },
    ],
  },

  close: {
    before: [
      { enter: 'rosa' },
      { nar: { en: 'Rosa comes down in her slippers, counting the till with her eyes.', ru: 'Роза спускается в тапочках и пересчитывает кассу взглядом.' } },
    ],
    good: [
      { who: 'rosa', en: 'Not bad. For a farm boy.', ru: 'Неплохо. Для деревенского.' },
      { who: 'think', en: 'Coming from her, that’s a parade.', ru: 'От неё это всё равно что парад.' },
    ],
    ok: [
      { who: 'rosa', en: 'You survived. The cups too. Mostly.', ru: 'Ты выжил. Чашки тоже. Почти все.' },
    ],
    bad: [
      { who: 'rosa', en: 'Allora. People left without coffee tonight.', ru: 'Allora. Сегодня люди уходили без кофе.' },
      { who: 'rosa', en: 'Tomorrow, faster. Or I find a faster farm boy.', ru: 'Завтра быстрее. Или найду деревенского побыстрее.' },
    ],
    after: [
      { who: 'rosa', en: 'Lock up when the last one leaves. I’m going to bed.', ru: 'Закроешь, когда уйдёт последний. Я спать.' },
      { who: 'eli', en: 'The last one?', ru: 'Последний?' },
      { who: 'rosa', en: 'There is always a last one.', ru: 'Последний есть всегда.' },
      { leave: true },
      { nar: { en: 'Five to two. The chairs are up. The bell rings anyway.', ru: 'Без пяти два. Стулья уже на столах. Колокольчик всё равно звенит.' } },
      { sfx: 'door' },
      { enter: 'sofia' },
      { nar: { en: 'A woman shakes out an umbrella that clearly lost a fight.', ru: 'Девушка стряхивает зонт, который явно проиграл в драке.' } },
      { who: 'sofia', en: 'Please tell me you’re still open. Lie if you have to.', ru: 'Скажи, что вы ещё открыты. Можно соврать.' },
      { choice: [
        { en: 'We’re open.', ru: 'Открыты.', then: [
          { who: 'sofia', en: 'Bless you. Bless this whole corner.', ru: 'Спасибо. Спасибо всему этому углу.' },
        ] },
        { en: 'Technically, five more minutes.', ru: 'Формально — ещё пять минут.', then: [
          { who: 'sofia', en: 'Then I’ll drink fast.', ru: 'Тогда я быстро выпью.' },
          { who: 'sofia', en: 'I won’t.', ru: 'Не выпью.' },
        ] },
        { en: 'Rosa said there’s always a last one.', ru: 'Роза сказала, последний есть всегда.', set: 'rosaLast', aff: { sofia: 1 }, then: [
          { who: 'sofia', en: 'Rosa is never wrong. It’s exhausting.', ru: 'Роза никогда не ошибается. Это утомляет.' },
        ] },
      ] },
      { who: 'sofia', en: 'Vanilla latte. Please.', ru: 'Ванильный латте. Пожалуйста.' },
      { who: 'think', en: 'We don’t have vanilla. I checked. Twice.', ru: 'Ванили у нас нет. Я проверял. Дважды.' },
      { choice: [
        { en: 'No vanilla, sorry. A plain latte?', ru: 'Ванили нет, простите. Просто латте?', then: [
          { who: 'sofia', en: 'A plain latte. I’ll pretend.', ru: 'Просто латте. Буду представлять.' },
        ] },
        { en: 'A latte. With… imaginary vanilla.', ru: 'Латте. С… воображаемой ванилью.', set: 'noted', aff: { sofia: 1 }, then: [
          { who: 'sofia', en: 'Imaginary vanilla. I’m stealing that.', ru: 'Воображаемая ваниль. Я это украду.' },
          { nar: { en: 'She pulls out a small notebook and writes something down.', ru: 'Она достаёт маленький блокнот и что-то записывает.' } },
        ] },
      ] },

      { brew: { by: 'sofia', want: 'latte' },
        ok: [
          { set: 'sofiaOk' },
          { nar: { en: 'She wraps both hands around the glass like it’s a campfire.', ru: 'Она обнимает стакан обеими руками, как костёр.' } },
          { who: 'sofia', en: 'Okay. You’re new.', ru: 'Так. Ты новенький.' },
          { who: 'eli', en: 'Is it the latte?', ru: 'Это по латте видно?' },
          { who: 'sofia', en: 'It’s how you hold the pitcher. Like it might bite.', ru: 'По тому, как ты держишь питчер. Будто он кусается.' },
        ],
        wrong: [
          { who: 'sofia', en: 'This is {drink}.', ru: 'Это {drink}.' },
          { who: 'sofia', en: 'No, it’s fine. Two a.m., the wrong drink. Very literary.', ru: 'Нет, ничего. Два часа ночи, не тот напиток. Очень литературно.' },
          { who: 'sofia', en: 'You’re new, aren’t you?', ru: 'Ты новенький, да?' },
          { who: 'eli', en: 'That obvious?', ru: 'Так заметно?' },
        ] },

      { who: 'sofia', en: 'And the boots. Nobody here owns boots that honest.', ru: 'И ботинки. Здесь ни у кого нет таких честных ботинок.' },
      { who: 'sofia', en: 'I’m Sofia. I live above the laundromat. I write.', ru: 'Я София. Живу над прачечной. Пишу.' },
      { who: 'eli', en: 'Eli. I live on a couch. I make lattes, apparently.', ru: 'Илай. Живу на диване. Варю латте, как выяснилось.' },
      { who: 'sofia', en: 'Eli from where?', ru: 'Илай откуда?' },
      { choice: [
        { en: 'Maple Falls, Pennsylvania. One stoplight.', ru: 'Мейпл-Фоллс, Пенсильвания. Один светофор.', set: 'toldSofia', aff: { sofia: 1 }, then: [
          { who: 'sofia', en: 'One stoplight. Is it red or green more often?', ru: 'Один светофор. Он чаще красный или зелёный?' },
          { who: 'eli', en: 'Mostly it blinks yellow. Nobody knows what it wants.', ru: 'Обычно мигает жёлтым. Никто не знает, чего он хочет.' },
          { nar: { en: 'She laughs. Then she writes it down.', ru: 'Она смеётся. Потом записывает.' } },
          { set: 'noted' },
        ] },
        { en: 'Nowhere you’ve heard of.', ru: 'Из места, о котором ты не слышала.', then: [
          { who: 'sofia', en: 'Those are the best places. In books, anyway.', ru: 'Лучшие места — такие. По крайней мере, в книгах.' },
        ] },
      ] },
      { who: 'sofia', en: 'Can I ask you something weird?', ru: 'Можно странный вопрос?' },
      { who: 'eli', en: 'It’s two a.m. Everything is weird.', ru: 'Два часа ночи. Тут всё странное.' },
      { who: 'sofia', en: 'I’m writing a novel. It happens in a café, at night.', ru: 'Я пишу роман. Действие — в кафе, ночью.' },
      { who: 'sofia', en: 'My barista is flat. Cardboard. “Here’s your coffee,” and that’s it.', ru: 'Мой бариста плоский. Картонный. «Ваш кофе» — и всё.' },
      { who: 'sofia', en: 'Could I… borrow a little of you? For him?', ru: 'Можно я… позаимствую немного тебя? Для него?' },
      { who: 'think', en: 'Nobody has ever wanted to borrow a little of me. Not even Kyle.', ru: 'Никто никогда не хотел позаимствовать немного меня. Даже Кайл.' },
      { choice: [
        { en: 'Sure. Just make him taller.', ru: 'Конечно. Только сделай его повыше.', set: 'bookYes', aff: { sofia: 1 }, then: [
          { who: 'sofia', en: 'Taller. Noted.', ru: 'Повыше. Записала.' },
          { nar: { en: 'She actually writes it down.', ru: 'Она правда это записывает.' } },
          { set: 'noted' },
        ] },
        { en: 'Only if he gets a better couch.', ru: 'Только если у него будет диван получше.', set: 'bookYes', aff: { sofia: 1 }, then: [
          { who: 'sofia', en: 'I’ll give him a whole apartment. Writers are generous.', ru: 'Дам ему целую квартиру. Писатели щедрые.' },
        ] },
        { en: 'I’d rather not. Sorry.', ru: 'Лучше не надо. Прости.', set: 'bookNo', then: [
          { who: 'sofia', en: 'No, that’s fair. A stranger, at two a.m.', ru: 'Нет, это честно. Незнакомка, два часа ночи.' },
          { who: 'sofia', en: 'Forget I asked.', ru: 'Забудь, что я спросила.' },
          { who: 'think', en: 'I won’t.', ru: 'Не забуду.' },
        ] },
      ] },
      { who: 'sofia', en: 'Same time tomorrow? I’m stuck on chapter twelve.', ru: 'Завтра в то же время? Я застряла на двенадцатой главе.' },
      { who: 'sofia', en: 'I need a witness.', ru: 'Мне нужен свидетель.' },
      { leave: true },
      { nar: { en: 'The bell. The rain. An empty glass with a lipstick mark.', ru: 'Колокольчик. Дождь. Пустой стакан со следом помады.' } },
      { who: 'think', en: 'There is always a last one.', ru: 'Последний есть всегда.' },
    ],
  },

  diary: [
    { en: 'Night 1.', ru: 'Ночь 1.' },
    { en: 'Tony calls me “the farm boy”. Rosa picked it up in an hour.', ru: 'Тони зовёт меня «деревенским». Роза подхватила за час.' },
    { if: 'nicoInvite', en: 'I may have just invited his son to take my job.', ru: 'Кажется, я сам позвал его сына на своё место.' },
    { if: '!beatOk', en: 'His doppio was not a doppio. He’ll remember.', ru: 'Его доппио было не доппио. Он запомнит.' },
    { en: 'The last guest was Sofia. She lives above the laundromat and writes.', ru: 'Последней была София. Живёт над прачечной и пишет.' },
    { if: 'bookYes', en: 'I’m going to be in a book. Hopefully taller.', ru: 'Я попаду в книгу. Надеюсь, повыше.' },
    { if: 'bookNo', en: 'She wanted to put me in her book. I said no. Not sure why.', ru: 'Она хотела взять меня в книгу. Я отказался. Не знаю почему.' },
    { if: 'noted', en: 'She wrote something down about me. I want to know what.', ru: 'Она что-то записала обо мне. Хочу знать что.' },
    { if: 'menuGiuseppe', en: '“Macchiato”, two spellings. Rosa won’t let me fix it.', ru: '«Макиато» — два написания. Роза не даёт исправить.' },
  ],
};
