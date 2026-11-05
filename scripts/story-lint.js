// Проверка сценария истории: реплики не длиннее 90 символов, у каждой есть RU и EN.
// node scripts/story-lint.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dir = path.join(__dirname, '..', 'js', 'story');
const ctx = { STORY_CH: {} };
vm.createContext(ctx);
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.js'))) vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f });

const MAX = 90;
let bad = 0;
function check(where, o) {
  for (const lang of ['en', 'ru']) {
    const s = o && o[lang];
    if (!s) { console.log(`✗ ${where}: нет ${lang}`); bad++; continue; }
    if (s.length > MAX && !s.includes('\n')) { console.log(`✗ ${where} [${lang}] ${s.length} символов: ${s}`); bad++; }
  }
}
function walk(id, list, trail) {
  list.forEach((n, i) => {
    const at = `${id}${trail}#${i}`;
    if (n.who || n.phone) check(at, n);
    if (n.nar) check(at, n.nar);
    if (n.note) check(at, n.note);
    if (n.choice) n.choice.forEach((o, k) => { check(`${at}/выбор ${k + 1}`, o); walk(id, o.then || [], `${trail}#${i}.${k}`); });
    if (n.brew) check(`${at}/заказ`, n.brew.order);
    for (const key of ['ok', 'wrong', 'then', 'else']) if (Array.isArray(n[key])) walk(id, n[key], `${trail}#${i}.${key}`);
    if (n.also) for (const [k, l] of Object.entries(n.also)) walk(id, l, `${trail}#${i}.${k}`);
    if (n.diary) n.diary.forEach((l, k) => check(`${at}/дневник ${k + 1}`, l));
  });
}
for (const [id, ch] of Object.entries(ctx.STORY_CH)) {
  check(`${id}/название`, ch.title);
  if (ch.nodes) walk(id, ch.nodes, '');
  if (ch.road) walk(id, ch.road, '/дорога');
  const b = ch.beat || {};
  for (const k of ['intro', 'ok', 'wrong']) if (b[k]) walk(id, b[k], `/гость.${k}`);
  for (const [k, l] of Object.entries(b.also || {})) walk(id, l, `/гость.${k}`);
  for (const [k, l] of Object.entries(ch.close || {})) walk(id, l, `/закрытие.${k}`);
  if (ch.diary) walk(id, [{ diary: ch.diary }], '');
}
console.log(bad ? `\n${bad} замечаний` : 'Сценарий в порядке');
process.exit(bad ? 1 : 0);
