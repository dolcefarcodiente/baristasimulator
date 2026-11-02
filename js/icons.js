// SVG-иконки ингредиентов и монетки. Используются и в интерфейсе, и на canvas.

const INK = '#3b2a22';
const SW = 'stroke="#3b2a22" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"';

function bottleSvg(fill, cap, label) {
  return `<rect x="20" y="5" width="8" height="6" rx="1.5" fill="${cap}" ${SW}/>
    <path d="M19 11h10v5l4 5v19a3 3 0 0 1-3 3H18a3 3 0 0 1-3-3V21l4-5z" fill="${fill}" ${SW}/>
    <rect x="17.5" y="25" width="13" height="10" rx="2" fill="${label}" ${SW}/>
    <path d="M20 15v4" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/>`;
}

const ICON_BODIES = {
  espresso: `<path d="M17 6c-2 3 2 4 0 7M24 4c-2 3 2 4 0 7M31 6c-2 3 2 4 0 7" stroke="#bfa894" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M37 22h2.5a4.5 4.5 0 0 1 0 9H36" fill="none" ${SW}/>
    <path d="M9 18h28v7a12 12 0 0 1-12 12h-4A12 12 0 0 1 9 25z" fill="#fff" ${SW}/>
    <ellipse cx="23" cy="19.5" rx="12.5" ry="2.6" fill="#5a3422"/>
    <path d="M6 42h34" ${SW}/>`,
  water: `<path d="M24 5C24 5 11 20 11 29a13 13 0 0 0 26 0C37 20 24 5 24 5z" fill="#8fd3f4" ${SW}/>
    <path d="M17 29a7 7 0 0 0 5 7" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`,
  milk: `<path d="M15 16l4-9h10l4 9z" fill="#6aaed6" ${SW}/>
    <rect x="15" y="16" width="18" height="27" rx="2" fill="#fff" ${SW}/>
    <path d="M15 24h18v9H15z" fill="#bfe0f5"/>
    <path d="M24 26c-2 3-3 4-3 5.5a3 3 0 0 0 6 0c0-1.5-1-2.5-3-5.5z" fill="#6aaed6"/>
    <rect x="15" y="16" width="18" height="27" rx="2" fill="none" ${SW}/>`,
  foam: `<path d="M12 34a6 6 0 0 1 0-12 8 8 0 0 1 12-7 7 7 0 0 1 12 5 6 6 0 0 1 0 14z" fill="#fffdf8" ${SW}/>
    <circle cx="19" cy="26" r="2" fill="#e8dccb"/><circle cx="28" cy="23" r="1.6" fill="#e8dccb"/><circle cx="31" cy="29" r="1.3" fill="#e8dccb"/>`,
  chocolate: `<g transform="rotate(-12 24 24)"><rect x="12" y="8" width="24" height="32" rx="3" fill="#6e3d24" ${SW}/>
    <path d="M12 26h24v11a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3z" fill="#e07a5f" ${SW}/>
    <path d="M24 9v16M13 17h22" stroke="#4a2716" stroke-width="2"/>
    <path d="M15 11h6M27 11h6" stroke="#9a5d3c" stroke-width="2" stroke-linecap="round"/></g>`,
  caramel: bottleSvg('#e29a3c', '#7a4a1f', '#fff3dd'),
  vanilla: bottleSvg('#f2df9e', '#c9a227', '#fff') + `<circle cx="24" cy="30" r="2.2" fill="#c9a227"/>`,
  cream: `<path d="M13 15h20l-1 24a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3z" fill="#fff8ec" ${SW}/>
    <path d="M13 15l-4-4h8" fill="none" ${SW}/>
    <path d="M33 20h2a4 4 0 0 1 0 8h-2.5" fill="none" ${SW}/>
    <path d="M14.5 22h18" stroke="#f1dcb8" stroke-width="3"/>`,
  ice: `<rect x="7" y="18" width="18" height="18" rx="4" fill="#dff4fc" ${SW} transform="rotate(-10 16 27)"/>
    <rect x="22" y="12" width="18" height="18" rx="4" fill="#c8ecfa" ${SW} transform="rotate(12 31 21)"/>
    <path d="M11 23l3-1M26 16l3 1" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`,
  matcha: `<path d="M27 6c6 0 10 4 10 9-6 0-10-3-10-9z" fill="#7aa64a" ${SW}/>
    <path d="M7 22h34a17 17 0 0 1-34 0z" fill="#efe3cf" ${SW}/>
    <ellipse cx="24" cy="22" rx="17" ry="3.5" fill="#97c062" ${SW}/>`,
  pumpkin: `<path d="M24 12c0-4 2-6 5-7" fill="none" stroke="#5f8a3a" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="16" cy="28" rx="9" ry="12" fill="#ee9145" ${SW}/>
    <ellipse cx="32" cy="28" rx="9" ry="12" fill="#ee9145" ${SW}/>
    <ellipse cx="24" cy="28" rx="8" ry="13" fill="#f4a259" ${SW}/>`,
  cinnamon: `<g transform="rotate(-25 24 24)"><rect x="9" y="14" width="30" height="8" rx="4" fill="#a8643a" ${SW}/>
    <rect x="9" y="26" width="30" height="8" rx="4" fill="#9b5a2e" ${SW}/>
    <path d="M12 16.5a2 2 0 1 0 2 2M12 28.5a2 2 0 1 0 2 2" stroke="#5e3218" stroke-width="1.6" fill="none"/></g>`,
  marshmallow: `<rect x="8" y="20" width="15" height="18" rx="5" fill="#ffd6e0" ${SW}/>
    <rect x="25" y="16" width="15" height="18" rx="5" fill="#fff" ${SW}/>
    <rect x="17" y="8" width="14" height="14" rx="5" fill="#ffe9ef" ${SW}/>`,
  coin: `<circle cx="24" cy="24" r="19" fill="#f4c542" ${SW}/>
    <circle cx="24" cy="24" r="13.5" fill="#ffd966" stroke="#c99a16" stroke-width="2"/>
    <ellipse cx="24" cy="24" rx="6" ry="8.5" fill="#7a4a1f" transform="rotate(25 24 24)"/>
    <path d="M22 16c4 4-2 12 3 16" stroke="#ffd966" stroke-width="1.8" fill="none" transform="rotate(25 24 24)"/>`,
  trash: `<path d="M12 15h24l-2 25a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3z" fill="#cfd8dc" ${SW}/>
    <path d="M9 14h30M19 14V9h10v5" fill="none" ${SW}/>
    <path d="M20 21v15M28 21v15" ${SW}/>`,
  clock: `<circle cx="24" cy="24" r="18" fill="#fff" ${SW}/><path d="M24 13v11l7 5" fill="none" ${SW}/>`,
  heart: `<path d="M24 41S7 30 7 18a9 9 0 0 1 17-4 9 9 0 0 1 17 4c0 12-17 23-17 23z" fill="#f17c8f" ${SW}/>`,
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
