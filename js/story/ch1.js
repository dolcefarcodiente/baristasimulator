// Глава 1 «Первая смена» — черновой каркас для проверки движка: дорога, Тони посреди смены, закрытие.
// Полная версия с Софией пишется на этапе 2 (docs/one-mode-plan.md).

STORY_CH.ch1 = {
  num: { en: 'Chapter 1', ru: 'Глава 1' },
  title: { en: 'First Shift', ru: 'Первая смена' },
  road: [
    { cg: 'outside' },
    { nar: { en: 'Day one. Six o’clock sharp. Well — six-oh-two.', ru: 'День первый. Ровно шесть. Ну, почти — шесть ноль две.' } },
    { phone: 'junie', en: 'good luck!! dont spill anything on anyone', ru: 'удачи!! не облей никого' },
    { who: 'think', en: 'That was never the plan, Junie.', ru: 'Это никогда не входило в мои планы, Джуни.' },
    { sfx: 'door' },
    { cg: null },
    { enter: 'rosa' },
    { who: 'rosa', en: 'Two minutes late. I counted.', ru: 'Две минуты опоздания. Я считала.' },
    { who: 'rosa', en: 'Apron on. We open in one minute.', ru: 'Фартук. Открываемся через минуту.' },
    { who: 'rosa', en: 'Smile. Not too much — people get nervous.', ru: 'Улыбайся. Но не слишком — люди нервничают.' },
    { leave: true },
  ],
  beat: {
    by: 'tony', want: 'doppio', at: 0.3,
    intro: [
      { who: 'tony', en: 'So you’re the guy from the farm.', ru: 'Значит, ты и есть парень с фермы.' },
      { who: 'eli', en: 'Maple Falls. It’s a town.', ru: 'Мейпл-Фоллс. Это город.' },
      { who: 'tony', en: 'Town, farm. Doppio. Two shots, one cup. Show me.', ru: 'Город, ферма. Доппио. Два шота в одну чашку. Покажи.' },
    ],
    ok: [
      { nar: { en: 'Tony drinks it standing up, like a man with an oven waiting.', ru: 'Тони пьёт стоя, как человек, которого ждёт печь.' } },
      { who: 'tony', en: 'Huh.', ru: 'Хм.' },
      { who: 'tony', en: 'My Nico wanted this job, you know.', ru: 'Мой Нико хотел эту работу, знаешь.' },
      { choice: [
        { en: 'Then send him over. I could use the help.', ru: 'Пусть приходит. Мне помощь не помешает.', set: 'nicoInvite', aff: { tony: 1 }, then: [
          { who: 'tony', en: 'With you? Ha! …I’ll tell him.', ru: 'К тебе? Ха! …Я ему передам.' },
        ] },
        { en: 'I need it more. Sorry.', ru: 'Мне она нужнее. Простите.', set: 'honestTony', then: [
          { who: 'tony', en: 'Honest. Annoying, but honest.', ru: 'Честно. Бесит, но честно.' },
        ] },
        { en: 'Is he any good?', ru: 'А он хорош?', aff: { tony: 1 }, then: [
          { who: 'tony', en: 'He’s sixteen. He’s great at sleeping.', ru: 'Ему шестнадцать. Спит он отлично.' },
        ] },
      ] },
    ],
    wrong: [
      { nar: { en: 'Tony looks into the cup for a long time.', ru: 'Тони долго смотрит в чашку.' } },
      { who: 'tony', en: 'This is {drink}. I asked for a doppio.', ru: 'Это {drink}. Я просил доппио.' },
      { who: 'tony', en: 'Rosa! Your farm boy—', ru: 'Роза! Твой деревенский…' },
      { who: 'rosa', off: true, en: 'I heard, Tony. Drink it, it’s on the house.', ru: 'Я слышала, Тони. Пей, за счёт заведения.' },
    ],
  },
  close: {
    good: [
      { enter: 'rosa' },
      { who: 'rosa', en: 'Not bad. For a farm boy.', ru: 'Неплохо. Для деревенского.' },
      { who: 'think', en: 'Coming from her, that’s a parade.', ru: 'От неё это всё равно что парад.' },
    ],
    ok: [
      { enter: 'rosa' },
      { who: 'rosa', en: 'You survived. The cups too. Mostly.', ru: 'Ты выжил. Чашки тоже. Почти все.' },
    ],
    bad: [
      { enter: 'rosa' },
      { who: 'rosa', en: 'Allora. People left without coffee tonight.', ru: 'Allora. Сегодня люди уходили без кофе.' },
      { who: 'rosa', en: 'Tomorrow, faster. Or I find a faster farm boy.', ru: 'Завтра быстрее. Или найду деревенского побыстрее.' },
    ],
  },
  diary: [
    { en: 'Night 1.', ru: 'Ночь 1.' },
    { en: 'Tony calls me “the farm boy”. Rosa picked it up in an hour.', ru: 'Тони зовёт меня «деревенским». Роза подхватила за час.' },
    { if: 'nicoInvite', en: 'I may have just invited his son to take my job.', ru: 'Кажется, я сам позвал его сына на своё место.' },
    { if: '!beatOk', en: 'His doppio was not a doppio. He’ll remember.', ru: 'Его доппио было не доппио. Он запомнит.' },
  ],
};
