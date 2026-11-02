// SVG-иконки: ингредиенты, настоящее оборудование бариста, монетка. Используются и в интерфейсе, и на canvas.

const INK = '#3b2a22';
const SW = 'stroke="#3b2a22" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"';
const STEEL = '#d5dee3';

const steam = (xs, y = 4) => `<path d="${xs.map((x) => `M${x} ${y + 7}c-2-2.5 2-4 0-7`).join('')}" stroke="#bfa894" stroke-width="2.3" fill="none" stroke-linecap="round"/>`;

// Бутылка сиропа с дозатором-помпой, как на настоящей барной полке
function pumpSvg(fill, label, mark = '') {
  return `<path d="M24 4v7" ${SW}/>
    <path d="M24 5h8v3" fill="none" ${SW}/>
    <rect x="19" y="10" width="10" height="5" rx="1.5" fill="#3b2a22"/>
    <path d="M17 15h14l2 4v20a4 4 0 0 1-4 4H19a4 4 0 0 1-4-4V19z" fill="${fill}" ${SW}/>
    <rect x="17.5" y="24" width="13" height="11" rx="2" fill="${label}" ${SW}/>
    <path d="M18.5 19v3" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/>${mark}`;
}

// Чашки разного объёма: ристретто, эспрессо, лунго
function cupSvg(top, h, coffee, w = 22) {
  const x = 24 - w / 2 - 2;
  return `<path d="M${x + w} ${top + 3}h2.5a4.5 4.5 0 0 1 0 9H${x + w - 1}" fill="none" ${SW}/>
    <path d="M${x} ${top}h${w}v${h}a${w / 2} ${w / 2} 0 0 1-${w / 2} ${w / 2}h0a${w / 2} ${w / 2} 0 0 1-${w / 2}-${w / 2}z" fill="#fff" ${SW}/>
    <ellipse cx="${x + w / 2}" cy="${top + 1.6}" rx="${w / 2 - 1}" ry="2.4" fill="${coffee}"/>
    <path d="M7 44h34" ${SW}/>`;
}

function pitcherSvg(extra = '') {
  return `<path d="M33 20h3a4 4 0 0 1 0 8h-3.5" fill="none" ${SW}/>
    <path d="M13 16L7 12.5 14.5 13.5" fill="${STEEL}" ${SW}/>
    <path d="M13 15h20l-2 24a3 3 0 0 1-3 3H18a3 3 0 0 1-3-3z" fill="${STEEL}" ${SW}/>
    <path d="M18 22v15" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>${extra}`;
}

const ICON_BODIES = {
  ristretto: steam([22, 27], 8) + cupSvg(24, 6, '#3e2216', 18),
  espresso: steam([19, 25, 31]) + cupSvg(20, 8, '#5a3422', 24),
  lungo: steam([20, 28], 0) + cupSvg(12, 16, '#7a4a30', 22),
  milk: steam([20, 27], 1) + pitcherSvg('<path d="M14 18h18" stroke="#fffdf8" stroke-width="3"/>'),
  foam: pitcherSvg(`<path d="M12.5 16a11.5 8 0 0 1 21 0z" fill="#fffdf8" ${SW}/><circle cx="20" cy="12.5" r="1.4" fill="#e8dccb"/><circle cx="26" cy="11" r="1.1" fill="#e8dccb"/>`),
  water: `<path d="M12 35C5 33 4 24 6 16l3-2" fill="none" stroke="#3b2a22" stroke-width="6" stroke-linecap="round"/>
    <path d="M12 35C5 33 4 24 6 16l3-2" fill="none" stroke="#5c6370" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M35 22c5 0 6 4 4 9l-3 3" fill="none" stroke="#3b2a22" stroke-width="6.5" stroke-linecap="round"/>
    <path d="M35 22c5 0 6 4 4 9l-3 3" fill="none" stroke="#c08a5a" stroke-width="3" stroke-linecap="round"/>
    <path d="M14 21h20l2 17a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3z" fill="#5c6370" ${SW}/>
    <path d="M16.5 21a7.5 4.5 0 0 1 15 0" fill="#5c6370" ${SW}/>
    <circle cx="24" cy="15" r="2.2" fill="#c08a5a" ${SW}/>
    <path d="M17 26v10" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".45"/>
    <path d="M5 19c-1 2-1.5 3-1.5 4a1.5 1.5 0 0 0 3 0c0-1-.5-2-1.5-4z" fill="#8fd3f4"/>`,
  filter: `<path d="M14 30h20v8a6 6 0 0 1-6 6h-8a6 6 0 0 1-6-6z" fill="#e3f2f8" ${SW}/>
    <path d="M15.3 36h17.4v2a4.7 4.7 0 0 1-4.7 4.7h-8a4.7 4.7 0 0 1-4.7-4.7z" fill="#8a5634"/>
    <path d="M9 9h30l-10 17h-10z" fill="#f4f1de" ${SW}/>
    <path d="M17 13l3 9M24 12v10M31 13l-3 9" stroke="#d8cfb6" stroke-width="1.8" stroke-linecap="round"/>
    <rect x="15" y="25.5" width="18" height="4.5" rx="1.5" fill="#f4f1de" ${SW}/>
    <path d="M7 9h34" ${SW}/>`,
  ice: `<rect x="7" y="18" width="18" height="18" rx="4" fill="#dff4fc" ${SW} transform="rotate(-10 16 27)"/>
    <rect x="22" y="12" width="18" height="18" rx="4" fill="#c8ecfa" ${SW} transform="rotate(12 31 21)"/>
    <path d="M11 23l3-1M26 16l3 1" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`,
  cream: `<path d="M13 15h20l-1 24a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3z" fill="#fff8ec" ${SW}/>
    <path d="M13 15l-4-4h8" fill="none" ${SW}/>
    <path d="M33 20h2a4 4 0 0 1 0 8h-2.5" fill="none" ${SW}/>
    <path d="M14.5 22h18" stroke="#f1dcb8" stroke-width="3"/>`,
  matcha: `<path d="M30 4l-6 14" stroke="#c9a96e" stroke-width="3" stroke-linecap="round"/>
    <path d="M20 16l4 3 4-3" fill="none" stroke="#c9a96e" stroke-width="2" stroke-linecap="round"/>
    <path d="M7 22h34a17 17 0 0 1-34 0z" fill="#efe3cf" ${SW}/>
    <ellipse cx="24" cy="22" rx="17" ry="3.5" fill="#97c062" ${SW}/>`,
  chocolate: pumpSvg('#6e3d24', '#f4e1c8', '<rect x="21" y="27" width="6" height="5" rx="1" fill="#6e3d24"/>'),
  caramel: pumpSvg('#e29a3c', '#fff3dd', '<circle cx="24" cy="29.5" r="2.6" fill="#e29a3c"/>'),
  vanilla: pumpSvg('#f2df9e', '#fff', '<circle cx="24" cy="29.5" r="2.4" fill="#c9a227"/>'),
  pumpkin: pumpSvg('#ee9145', '#fff3dd', '<ellipse cx="24" cy="30" rx="3.4" ry="2.8" fill="#ee9145"/><path d="M24 27v-2" stroke="#5f8a3a" stroke-width="1.5"/>'),
  cinnamon: `<path d="M14 16h20v-5a3 3 0 0 0-3-3H17a3 3 0 0 0-3 3z" fill="${STEEL}" ${SW}/>
    <circle cx="20" cy="12" r="1.2" fill="#3b2a22"/><circle cx="24" cy="11" r="1.2" fill="#3b2a22"/><circle cx="28" cy="12" r="1.2" fill="#3b2a22"/>
    <rect x="15" y="16" width="18" height="26" rx="4" fill="#fff8ec" ${SW}/>
    <rect x="16.5" y="26" width="15" height="14.5" rx="3" fill="#9b5a2e"/>
    <path d="M19 20v4" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`,
  marshmallow: `<rect x="12" y="8" width="24" height="6" rx="2" fill="#f19aa8" ${SW}/>
    <path d="M13 14h22v24a5 5 0 0 1-5 5H18a5 5 0 0 1-5-5z" fill="#f4fbfe" ${SW}/>
    <rect x="16" y="28" width="7" height="9" rx="2.5" fill="#ffd6e0" stroke="#3b2a22" stroke-width="1.6"/>
    <rect x="24" y="30" width="7" height="9" rx="2.5" fill="#fff" stroke="#3b2a22" stroke-width="1.6"/>
    <rect x="20" y="19" width="7" height="9" rx="2.5" fill="#fff" stroke="#3b2a22" stroke-width="1.6"/>`,
  tool_machine: `<rect x="6" y="5" width="36" height="5" rx="2" fill="${STEEL}" ${SW}/>
    <rect x="6" y="9" width="36" height="27" rx="4" fill="#e07a5f" ${SW}/>
    <circle cx="15" cy="17" r="4" fill="#fff" ${SW}/><path d="M15 17l2-1.6" stroke="#3b2a22" stroke-width="1.6"/>
    <circle cx="33" cy="17" r="4" fill="#fff" ${SW}/><path d="M33 17l-1.6-2" stroke="#3b2a22" stroke-width="1.6"/>
    <rect x="18" y="24" width="12" height="4" rx="1.5" fill="${STEEL}" ${SW}/>
    <path d="M19 28h10l-1.5 3h-7z" fill="#3b2a22"/>
    <path d="M29 29.5h8" stroke="#3b2a22" stroke-width="3.5" stroke-linecap="round"/>
    <rect x="4" y="38" width="40" height="5" rx="2" fill="${STEEL}" ${SW}/>
    <path d="M20 32h8v3.5a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3z" fill="#fff" ${SW}/>`,
  tool_steam: steam([21, 28], 1) + pitcherSvg('<path d="M14 18h18" stroke="#fffdf8" stroke-width="3"/>'),
  tool_shelf: `<g transform="translate(-9 3) scale(.75)">${pumpSvg('#e29a3c', '#fff3dd')}</g>
    <g transform="translate(6 3) scale(.75)">${pumpSvg('#6e3d24', '#f4e1c8')}</g>
    <g transform="translate(21 3) scale(.75)">${pumpSvg('#f2df9e', '#fff')}</g>`,
  // ----- иконки интерфейса и улучшений (вместо эмодзи) -----
  ui_shop: `<path d="M12 14h24l3 28H9z" fill="#c48b5f" ${SW}/>
    <path d="M12 14l3-6h18l3 6" fill="#e0b48a" ${SW}/>
    <g transform="rotate(20 24 29)"><ellipse cx="24" cy="29" rx="5.5" ry="7.5" fill="#5a3422"/>
    <path d="M22.5 22.5c3 3-1 9 2 13" stroke="#c48b5f" stroke-width="1.8" fill="none"/></g>`,
  ui_regulars: `<path d="M24 17s-7-4.5-7-9a3.8 3.8 0 0 1 7-2 3.8 3.8 0 0 1 7 2c0 4.5-7 9-7 9z" fill="#f17c8f" ${SW}/>
    <path d="M37 26h2.5a4.5 4.5 0 0 1 0 9H36" fill="none" ${SW}/>
    <path d="M10 22h28v7a12 12 0 0 1-12 12h-4a12 12 0 0 1-12-12z" fill="#fff8ee" ${SW}/>
    <path d="M6 44h36" ${SW}/>`,
  ui_todo: `<rect x="10" y="7" width="28" height="36" rx="4" fill="#fff8ee" ${SW}/>
    <rect x="18" y="4" width="12" height="6" rx="2" fill="#e07a5f" ${SW}/>
    <path d="M15 18l3 3 6-6" stroke="#5f927a" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M28 18h5M15 28h18M15 36h12" ${SW}/>`,
  ui_music: `<path d="M18 34V12l20-5v22" fill="none" ${SW}/><circle cx="14" cy="34" r="5" fill="#3b2a22"/><circle cx="34" cy="30" r="5" fill="#3b2a22"/>`,
  ui_sound: `<path d="M8 19h8l10-8v26l-10-8H8z" fill="#3b2a22" ${SW}/><path d="M32 17a9 9 0 0 1 0 14M37 12a16 16 0 0 1 0 24" fill="none" ${SW}/>`,
  ui_flame: `<path d="M24 4c2 8 13 12 13 25a13 13 0 0 1-26 0c0-6 3-10 5-12 1 4 3 6 5 6-2-6 0-13 3-19z" fill="#f4a259" ${SW}/>
    <path d="M24 24c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-5 3-7 1 2 2 3 3 3z" fill="#ffd966"/>`,
  up_groups: `<path d="M30 25l12 7" stroke="#3b2a22" stroke-width="7" stroke-linecap="round"/>
    <path d="M30 25l12 7" stroke="#3d405b" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M7 18h24v6a8 8 0 0 1-8 8h-8a8 8 0 0 1-8-8z" fill="${STEEL}" ${SW}/>
    <ellipse cx="19" cy="18" rx="12" ry="3.2" fill="#5a3422" ${SW}/>
    <path d="M15 33v5M23 33v5" stroke="#5a3422" stroke-width="2.5" stroke-linecap="round"/>`,
  up_scale: `<path d="M16 9h16l-3 13H19z" fill="#f4f1de" ${SW}/>
    <rect x="9" y="22" width="30" height="5" rx="2" fill="${STEEL}" ${SW}/>
    <rect x="6" y="27" width="36" height="13" rx="3" fill="#3d405b" ${SW}/>
    <rect x="12" y="31" width="14" height="5" rx="1" fill="#8fe3b0"/><circle cx="34" cy="33.5" r="2.5" fill="#e07a5f"/>`,
  up_counter: `<ellipse cx="24" cy="13" rx="13" ry="4.5" fill="#c48b5f" ${SW}/>
    <path d="M14 16l-4 26M34 16l4 26M24 18v24M12 32h24" ${SW}/>`,
  up_chair: `<rect x="10" y="9" width="28" height="21" rx="7" fill="#81b29a" ${SW}/>
    <rect x="13" y="25" width="22" height="11" rx="3" fill="#a3cdb6" ${SW}/>
    <rect x="5" y="20" width="10" height="17" rx="5" fill="#81b29a" ${SW}/>
    <rect x="33" y="20" width="10" height="17" rx="5" fill="#81b29a" ${SW}/>
    <path d="M10 37v5M38 37v5" ${SW}/>`,
  up_jar: `<path d="M13 14h22v23a6 6 0 0 1-6 6H19a6 6 0 0 1-6-6z" fill="#eaf6fb" ${SW}/>
    <path d="M15.5 29h17v8a3.5 3.5 0 0 1-3.5 3.5H19a3.5 3.5 0 0 1-3.5-3.5z" fill="#f4c542"/>
    <circle cx="20" cy="26" r="3.2" fill="#ffd966" stroke="#c99a16" stroke-width="1.6"/>
    <circle cx="28" cy="25" r="3.2" fill="#ffd966" stroke="#c99a16" stroke-width="1.6"/>
    <rect x="12" y="8" width="24" height="6" rx="2" fill="#c48b5f" ${SW}/>
    <path d="M17 18v5" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`,
  up_pastry: `<path d="M5 31c2-11 10-17 19-17s17 6 19 17c-4-2-7-2-9 1-2-4-6-6-10-6s-8 2-10 6c-2-3-5-3-9-1z" fill="#e8a64a" ${SW}/>
    <path d="M17 18l3 9M31 18l-3 9M24 15v11" stroke="#b5702a" stroke-width="2.2" stroke-linecap="round"/>`,
  up_sign: `<path d="M16 12l4-6M32 12l-4-6" ${SW}/>
    <rect x="5" y="12" width="38" height="24" rx="7" fill="#3d405b" ${SW}/>
    <path d="M11 28c2-9 5-9 6 0s4 0 5-7 4-3 5 2 3 4 5-2 4-2 5 3" stroke="#ff9cc2" stroke-width="2.8" fill="none" stroke-linecap="round"/>`,
  up_hedgehog: `<path d="M6 37l2-8-4-4 6-2-1-7 6 1 1-6 5 3 3-6 3 6 5-3v6l5 1-1 6 4 3-5 10z" fill="#8a5634" ${SW}/>
    <path d="M27 25c6-3 14 1 16 8-2 4-10 6-16 4z" fill="#f2d3b0" ${SW}/>
    <circle cx="34" cy="29" r="1.7" fill="#3b2a22"/><circle cx="43.5" cy="33" r="2.2" fill="#3b2a22"/>
    <ellipse cx="33" cy="34" rx="2" ry="1.2" fill="#f19aa8"/>
    <path d="M14 37v4M24 37v4" ${SW}/>`,
  coin: `<circle cx="24" cy="24" r="19" fill="#f4c542" ${SW}/>
    <circle cx="24" cy="24" r="13.5" fill="#ffd966" stroke="#c99a16" stroke-width="2"/>
    <ellipse cx="24" cy="24" rx="6" ry="8.5" fill="#7a4a1f" transform="rotate(25 24 24)"/>
    <path d="M22 16c4 4-2 12 3 16" stroke="#ffd966" stroke-width="1.8" fill="none" transform="rotate(25 24 24)"/>`,
  trash: `<path d="M12 15h24l-2 25a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3z" fill="#cfd8dc" ${SW}/>
    <path d="M9 14h30M19 14V9h10v5" fill="none" ${SW}/>
    <path d="M20 21v15M28 21v15" ${SW}/>`,
  clock: `<circle cx="24" cy="24" r="18" fill="#fff" ${SW}/><path d="M24 13v11l7 5" fill="none" ${SW}/>`,
  logo: `<path d="M17 8c-2 3 2 4 0 7M24 6c-2 3 2 4 0 7M31 8c-2 3 2 4 0 7" stroke="#fff6e9" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M37 23h2.5a4.5 4.5 0 0 1 0 9H36" fill="none" ${SW}/>
    <path d="M9 19h28v7a12 12 0 0 1-12 12h-4A12 12 0 0 1 9 26z" fill="#e07a5f" ${SW}/>
    <path d="M17 26c2-2 4 2 6 0s4 2 6 0" stroke="#fff6e9" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M6 42h34" ${SW}/>`,
};

function iconSvg(id, cls = '') {
  return `<svg class="${cls}" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${ICON_BODIES[id] || ''}</svg>`;
}

function iconDataUrl(id) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(iconSvg(id));
}

// Картинки для отрисовки на canvas
const ICON_IMG = {};
for (const id of Object.keys(ICON_BODIES)) {
  const img = new Image();
  img.src = iconDataUrl(id);
  ICON_IMG[id] = img;
}
