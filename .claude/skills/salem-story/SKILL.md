---
name: salem-story
description: Voice guide and script format for the Bella Notte Café story (Eli, Nonna Rosa, Sofia, the regulars). Use before writing or editing any story chapter, dialogue line, choice or diary entry in js/story/ or docs/story-bible.md.
---

# Writing Bella Notte Café story chapters

The canon, the cast and the mystery live in `docs/story-bible.md`. Read it first. This file covers how lines should sound and how a chapter is written down in code.

## Voices

| Who | Sounds like | Never |
|---|---|---|
| **Eli** (aloud) | Short, polite, a little awkward. Says less than he thinks. | Speeches, cool one-liners out loud |
| **Eli** (thought) | Dry self-irony, sharp small observations, compares things to Maple Falls ("In Maple Falls coffee came in one kind: coffee.") | Explaining the plot, self-pity |
| **Nonna Rosa** | Short imperatives, Italian words (*ragazzo, cara, allora, basta, madonna*), praise only sideways ("You didn't poison me. That's something.") | Soft openly, long sentences |
| **Sofia** | Questions, notices details, jokes about her own writing, warm but guarded | Flirting head-on, clichés of romance |
| **Tony** | Loud, generous, food metaphors, talks about his son Nico | Quiet |
| **Gina** | Gossip, hair and salon metaphors, "honey", dramatic pauses | Keeping a secret |
| **Prof. Sal** | Precise, dry, space facts, formal "you" | Slang |
| **Marco** | Fast, bike and street talk, hype man | Slowness |
| **Leo** | Slow, cool, music words, few lines | Hurry |
| **Junie** (texts) | Eli's sister, 15. Lowercase or ALL CAPS, emoji-free, teasing | Being serious for long |

The test for every line: if it could be given to another character unchanged, rewrite it.

## Line rules

- 90 characters max per line (it must fit the box on a phone). Split long thoughts into several lines.
- One beat per line. Dialogue first, stage directions second.
- No exposition dumps. Reveal the past through objects (the photo, the dombra), habits and slips of the tongue.
- Humor comes from character, not from jokes for their own sake. Warmth beats cleverness.
- RU and EN are two originals. Translate meaning and rhythm, not words. A pun that dies in one language gets replaced there.
- RU: «ёлочки» for quotes, an em dash (—) for pauses. EN: curly quotes “ ” and the same em dash.
- The café is Italian-American: menu, slang and music all come from there. The mystery is Enzo and the song «Bella Notte».

## Scene shape

Every guest scene goes: **hook → order → brew → reaction (right / wrong drink are different branches) → one choice → closing line**.

- Give each choice 2–3 options. Each option should reveal Eli differently (polite, joking, honest about home), not be "nice vs rude".
- Mark what a choice changes with `set` (flags) and `aff` (hidden affection). The player sees only a hint such as "Rosa will remember that", never numbers.
- A wrong drink is never a game over. It is a different, often funnier, conversation.

## Script format (`js/story/*.js`)

A chapter is a list of nodes run top to bottom. Each node is one of these:

```js
{ nar: { en, ru } }                       // stage direction, small and centered
{ who: 'rosa', en, ru }                   // spoken line; who = a cast id or 'eli'; off: true = speaks off-screen
{ who: 'think', en, ru }                  // Eli's thought, italic, no name plate
{ phone: 'junie', en, ru }                // text message on the phone
{ note: { en, ru } }                      // a paper note or sign, shown as a card
{ cg: 'outside' } / { cg: null }          // full-scene illustration on/off (img/cg-*.png)
{ photo: 'opening', caption: { en, ru } } // the framed old photo card (img/cg-photo-*.png)
{ enter: 'rosa' } / { leave: true }       // who stands at the counter
{ sfx: 'door' }                           // any Sound.play id
{ choice: [{ en, ru, set: 'flag', aff: { rosa: 1 }, then: [/* nodes */] }, …] }
{ brew: { by: 'rosa', want: 'espresso', order: { en, ru } }, ok: [/* nodes */], wrong: [/* nodes */], also: { cappuccino: [/* nodes */] } }
{ set: 'flag' }                           // raise a flag without a choice
{ if: 'flag', then: [/* nodes */], else: [/* nodes */] }   // '!flag' means "not set"
{ diary: [{ en, ru }, { if: 'flag', en, ru }] }            // closing diary page; ends the chapter
```

Drinks for `want` come from `STORY_DRINKS` in `js/story.js`: three steps, base + top-up + extra. In wrong-drink lines `{drink}` becomes the name of what Eli actually served.

A new chapter is a new file `js/story/<id>.js` (`STORY_CH.<id> = { num, title, next, nodes }`), added to `STORY_ORDER` in `js/story.js`, to `index.html` after `js/story.js`, and to `FILES` in `sw.js`. New illustrations follow the art pipeline in memory (`cg-*.png`, wide + tall versions for full-scene ones).

After writing, check every line's length with:

```bash
node scripts/story-lint.js
```
