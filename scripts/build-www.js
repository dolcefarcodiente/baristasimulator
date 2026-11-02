// Собирает веб-часть игры в dist/ — отсюда Capacitor берёт файлы для iOS-приложения.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const out = path.join(root, 'dist');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out);
for (const item of ['index.html', 'manifest.webmanifest', 'sw.js', 'css', 'js', 'icons', 'img']) {
  fs.cpSync(path.join(root, item), path.join(out, item), { recursive: true });
}
console.log('dist/ собран');
