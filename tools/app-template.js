// Generated data is embedded by AGGIORNA-HUB.py: this viewer works offline.
const BOOKS = __BOOKS__;
const LESSONS = __LESSONS__;
const AREAS = __AREAS__;
const RECIPES = __RECIPES__;

const $ = (selector, root = document) => root.querySelector(selector);
const main = $('.main');
const content = $('#content');
const listing = $('#sidebar-list');
const input = $('#search');
const storage = {
  read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
  }
};
const learned = new Set(storage.read('handbook.learned', []));
const favorites = new Set(storage.read('handbook.favorites', []));
let recent = storage.read('handbook.recent', []);
let view = 'home';
let book = null;
let selected = -1;
let sideMode = 'chapters';
let query = '';

const escapeHtml = value => String(value).replace(/[&<>"']/g,
  character => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[character]));
const norm = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const color = id => BOOKS[id]?.color || '#91baff';
const getBookLessons = id => LESSONS.map((item, i) => ({...item, i})).filter(item => item.book === id);
const allItems = [
  ...LESSONS.map((item, i) => ({...item, kind: 'lesson', i})),
  ...RECIPES.map((item, i) => ({...item, kind: 'recipe', i}))
];
const itemAtPath = path => allItems.find(item => item.path === path);
const matchesQuery = item => norm([
  item.title, item.summary ?? item.description, item.book || 'recipes', item.path, item.search,
  ...(item.tags || []), ...(item.related || [])
].join(' ')).includes(norm(query));
const completedLessons = () => LESSONS.filter(item => learned.has(item.path)).length;
const completedRecipes = () => RECIPES.filter(item => learned.has(item.path)).length;
const areaEntries = () => AREAS.map(area => ({...area, ids: Object.keys(BOOKS).filter(id => BOOKS[id].area === area.id)})).filter(area => area.ids.length);

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast._id);
  toast._id = setTimeout(() => el.classList.remove('show'), 1900);
}
function setHash(value) {
  try { history.replaceState(null, '', '#' + encodeURIComponent(value)); }
  catch { location.hash = encodeURIComponent(value); }
}
function clearSearch() { query = ''; input.value = ''; sideMode = 'chapters'; }
function recordRecent(path) {
  recent = [path, ...recent.filter(p => p !== path)].slice(0, 16);
  storage.write('handbook.recent', recent);
}
function openHome() { view = 'home'; book = null; selected = -1; clearSearch(); setHash('home'); render(); }
function openBook(id) {
  if (!BOOKS[id]) return;
  view = 'book'; book = id; selected = -1; clearSearch(); setHash('book/' + id); render();
}
function openLesson(i) {
  if (i < 0 || i >= LESSONS.length) return;
  view = 'lesson'; selected = i; book = LESSONS[i].book; clearSearch();
  recordRecent(LESSONS[i].path); setHash('lesson/' + LESSONS[i].path); render();
}
function openRecipes() { view = 'recipes'; book = null; selected = -1; clearSearch(); setHash('recipes'); render(); }
function openRecipe(i) {
  if (i < 0 || i >= RECIPES.length) return;
  view = 'recipe'; book = null; selected = i; clearSearch();
  recordRecent(RECIPES[i].path); setHash('recipe/' + RECIPES[i].id); render();
}
function openItem(item) {
  if (!item) return;
  if (item.kind === 'recipe') openRecipe(item.i);
  else openLesson(item.i);
}
function itemLabel(item) { return item.kind === 'recipe' ? 'Recipe · ' + item.title : BOOKS[item.book].name + ' · ' + item.title; }
function itemColor(item) { return item.kind === 'recipe' ? '#f2c47b' : color(item.book); }
function iconBook(id) { return `<span class="course-icon" style="--cc:${color(id)}">${escapeHtml(BOOKS[id].icon)}</span>`; }

function renderSide() {
  listing.replaceChildren();
  const heading = name => {
    const el = document.createElement('div'); el.className = 'side-label'; el.textContent = name; listing.append(el);
  };
  const navButton = (label, callback, {active = false, dot = '', marker = ''} = {}) => {
    const el = document.createElement('button');
    el.type = 'button'; el.className = 'side-item' + (active ? ' active' : '');
    if (dot) { const d = document.createElement('span'); d.className = 'side-dot'; d.style.background = dot; el.append(d); }
    const text = document.createElement('span'); text.className = 'side-name'; text.textContent = label; el.append(text);
    if (marker) { const m = document.createElement('span'); m.className = 'side-marker'; m.textContent = marker; el.append(m); }
    el.onclick = callback; listing.append(el);
  };
  const active = item => item.kind === view && item.i === selected;
  if (query) {
    const results = allItems.filter(matchesQuery);
    heading(`RISULTATI · ${results.length}`);
    results.slice(0, 150).forEach(item => navButton(itemLabel(item), () => openItem(item), {
      active: active(item), dot: itemColor(item), marker: learned.has(item.path) ? '✓' : ''
    }));
    if (results.length > 150) heading('Affina la ricerca');
    if (!results.length) heading('Nessun risultato');
    return;
  }
  if (sideMode === 'favorites') {
    heading('SEGNALIBRI');
    const matches = allItems.filter(item => favorites.has(item.path));
    if (!matches.length) { const p = document.createElement('p'); p.className = 'side-empty'; p.textContent = 'Nessun preferito. Salva una scheda con ☆.'; listing.append(p); }
    matches.forEach(item => navButton(itemLabel(item), () => openItem(item), {active: active(item), dot: itemColor(item), marker: '★'}));
    return;
  }
  if (book && (view === 'book' || view === 'lesson')) {
    let previousLevel = '';
    for (const item of getBookLessons(book)) {
      if (item.level !== previousLevel) { heading(item.level); previousLevel = item.level; }
      navButton(item.title, () => openLesson(item.i), {
        active: view === 'lesson' && selected === item.i,
        marker: learned.has(item.path) ? '✓' : favorites.has(item.path) ? '☆' : ''
      });
    }
    return;
  }
  if (view === 'recipes' || view === 'recipe') {
    heading('RECIPES · PROGETTI PRATICI');
    RECIPES.forEach((item, i) => navButton(item.title, () => openRecipe(i), {
      active: view === 'recipe' && selected === i, dot: '#f2c47b', marker: learned.has(item.path) ? '✓' : ''
    }));
    heading('ESPLORA');
    navButton('Tutti gli handbook', openHome);
    return;
  }
  for (const area of areaEntries()) {
    heading(area.name);
    area.ids.forEach(id => navButton(BOOKS[id].name, () => openBook(id), {dot: color(id), marker: String(getBookLessons(id).length)}));
  }
  heading('PROGETTI PRATICI');
  navButton('Recipes', openRecipes, {dot: '#f2c47b', marker: String(RECIPES.length)});
  if (recent.length) {
    heading('RECENTI');
    recent.slice(0, 5).map(itemAtPath).filter(Boolean).forEach(item => navButton(item.title, () => openItem(item), {
      dot: itemColor(item), marker: learned.has(item.path) ? '✓' : ''
    }));
  }
}

function updateBar() {
  const crumb = $('#crumb'); crumb.replaceChildren();
  const appendButton = (name, callback) => {
    const button = document.createElement('button'); button.textContent = name; button.onclick = callback; crumb.append(button);
  };
  const appendSep = () => { const sep = document.createElement('span'); sep.textContent = '›'; crumb.append(sep); };
  appendButton('Hub', openHome);
  if (book) { appendSep(); appendButton(BOOKS[book].name, () => openBook(book)); }
  if (view === 'recipes' || view === 'recipe') { appendSep(); appendButton('Recipes', openRecipes); }
  if (view === 'lesson' || view === 'recipe') {
    appendSep(); const label = document.createElement('span');
    label.textContent = view === 'lesson' ? LESSONS[selected].title : RECIPES[selected].title; crumb.append(label);
  }
  $('#counter').textContent = `${completedLessons()}/${LESSONS.length} capitoli · ${completedRecipes()}/${RECIPES.length} recipes`;
  document.querySelectorAll('.nav-pill').forEach(button => button.classList.toggle('active', button.dataset.action === sideMode));
}
function bindCards() {
  content.querySelectorAll('[data-book]').forEach(el => el.onclick = () => openBook(el.dataset.book));
  content.querySelectorAll('[data-lesson]').forEach(el => el.onclick = () => openLesson(Number(el.dataset.lesson)));
  content.querySelectorAll('[data-recipe]').forEach(el => el.onclick = () => openRecipe(Number(el.dataset.recipe)));
  content.querySelectorAll('[data-go="recipes"]').forEach(el => el.onclick = openRecipes);
}
function cardHtml(id) {
  const item = BOOKS[id];
  const total = getBookLessons(id).length;
  const done = getBookLessons(id).filter(lesson => learned.has(lesson.path)).length;
  return `<button class="course-card" data-book="${id}" style="--cc:${color(id)}">${iconBook(id)}
    <span class="course-name">${escapeHtml(item.name)}</span>
    <span class="course-desc">${escapeHtml(item.desc)}</span>
    <span class="course-bottom">${done}/${total} capitoli completati &nbsp;↗</span></button>`;
}
function recipeCard(item, i) {
  return `<button class="recipe-card" data-recipe="${i}"><span class="recipe-kicker">RECIPE · ${escapeHtml(item.difficulty)}</span>
    <strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.description)}</span>
    <span class="recipe-tags">${item.tags.map(tag => `<small>${escapeHtml(tag)}</small>`).join('')}</span>
    <span class="recipe-bottom">${learned.has(item.path) ? '✓ Completata' : 'Apri la ricetta →'}</span></button>`;
}
function home() {
  const areasHtml = areaEntries().map(area => `
    <section class="area-section"><div class="section-head"><div><div class="area-eyebrow">${escapeHtml(area.icon)} &nbsp; AREA</div>
    <h2>${escapeHtml(area.name)}</h2><p class="area-desc">${escapeHtml(area.description)}</p></div><span class="area-count">${area.ids.length} handbook</span></div>
    <div class="course-grid">${area.ids.map(cardHtml).join('')}</div></section>`).join('');
  content.innerHTML = `<section class="hero"><div class="eyebrow">PERSONAL REFERENCE · OFFLINE FIRST</div>
    <h1>Il tuo <em>Dev Handbook.</em><br>Una biblioteca che cresce con te.</h1>
    <p class="lead">Otto handbook organizzati per area, ricerca globale, esempi evidenziati e recipes trasversali.
    Ogni contenuto resta modificabile in VS Code e pubblicabile con GitHub Pages.</p>
    <div class="stats"><div class="stat"><b>${Object.keys(BOOKS).length}</b><span>handbook</span></div>
    <div class="stat"><b>${LESSONS.length}</b><span>capitoli e schede</span></div>
    <div class="stat"><b>${RECIPES.length}</b><span>recipes pratiche</span></div></div></section>
    ${areasHtml}
    <section class="area-section recipes-section"><div class="section-head"><div><div class="area-eyebrow">✧ &nbsp; WORKFLOWS</div>
    <h2>Recipes · dal concetto al progetto</h2><p class="area-desc">Piccole guide pratiche che collegano più tecnologie, senza duplicare i manuali.</p></div>
    <button class="section-link" data-go="recipes">Vedi tutte le recipes →</button></div>
    <div class="recipe-grid">${RECIPES.slice(0, 3).map((item, i) => recipeCard(item, i)).join('')}</div></section>
    <div class="callout home-note"><b>Come usarlo:</b> studia per area, usa la ricerca <b>/</b> o <b>Ctrl/Cmd + K</b> per trovare un argomento,
    salva i preferiti e segna gli argomenti completati. Il sito è una vista generata: la fonte resta nei file.</div>`;
  bindCards();
}
function bookHome() {
  const item = BOOKS[book];
  const lessons = getBookLessons(book);
  const done = lessons.filter(lesson => learned.has(lesson.path)).length;
  content.innerHTML = `<section class="hero"><div class="eyebrow" style="color:${color(book)}">${escapeHtml(item.icon)} · HANDBOOK</div>
    <h1>${escapeHtml(item.name)}<span style="color:${color(book)}">.</span></h1>
    <p class="lead">${escapeHtml(item.desc)}. Lezioni, esempi e promemoria pronti da consultare.</p>
    <div class="stats"><div class="stat"><b>${lessons.length}</b><span>capitoli</span></div>
    <div class="stat"><b>${done}</b><span>completati</span></div>
    <div class="stat"><b>${lessons.length ? Math.round(100*done/lessons.length) : 0}%</b><span>avanzamento</span></div></div></section>
    <div class="section-head"><h2>Capitoli</h2><span class="section-note">Apri per studiare o ripassare</span></div>
    <div class="search-results">${lessons.map(lesson => `<button class="result-card" data-lesson="${lesson.i}">
      <strong>${learned.has(lesson.path) ? '✓ ' : ''}${escapeHtml(lesson.title)}</strong>
      <small>${escapeHtml(lesson.level)} · ${escapeHtml(lesson.summary)}</small></button>`).join('')}</div>
    <div class="section-head"><h2>Laboratori</h2></div>
    <div class="callout">Gli esempi dedicati si trovano in <b>esempi/${escapeHtml(book)}/</b>.
    <a href="esempi/${encodeURIComponent(book)}/LEGGIMI.md" target="_blank" rel="noopener">Apri le istruzioni ↗</a></div>`;
  bindCards();
}
function recipesHome() {
  content.innerHTML = `<section class="hero"><div class="eyebrow" style="color:#f2c47b">RECIPES · WORKFLOWS PRATICI</div>
    <h1>Impara <em>costruendo.</em></h1>
    <p class="lead">Esempi reali e circoscritti che combinano due o più tecnologie. Le ricette linkano i manuali di riferimento:
    scegli solo quelle che ti servono, senza aggiungere interi corsi.</p>
    <div class="stats"><div class="stat"><b>${RECIPES.length}</b><span>recipes disponibili</span></div>
    <div class="stat"><b>${completedRecipes()}</b><span>completate</span></div></div></section>
    <div class="recipe-grid">${RECIPES.map(recipeCard).join('')}</div>
    <div class="callout home-note"><b>Vuoi aggiungerne una?</b> Crea <code>recipes/&lt;slug&gt;/recipe.json</code> e
    <code>README.md</code>, poi esegui <code>python AGGIORNA-HUB.py</code>. La recipe appare automaticamente nell'indice.</div>`;
  bindCards();
}

function detail() {
  const isRecipe = view === 'recipe';
  const item = isRecipe ? RECIPES[selected] : LESSONS[selected];
  const siblings = isRecipe ? RECIPES.map((x, i) => ({...x, i})) : getBookLessons(book);
  const position = siblings.findIndex(x => x.i === selected);
  const done = learned.has(item.path);
  const fav = favorites.has(item.path);
  const label = isRecipe ? 'Recipe pratica' : BOOKS[book].name;
  const tint = isRecipe ? '#f2c47b' : color(book);
  const details = isRecipe ? `${escapeHtml(item.difficulty)} · ${item.tags.map(escapeHtml).join(' · ')}` : `${escapeHtml(item.level)} · ${position+1} di ${siblings.length}`;
  const description = isRecipe ? item.description : item.summary;
  const related = isRecipe ? `<aside class="related-books"><strong>Handbook collegati</strong><div>${item.related.map(id => `<button data-book="${id}">${escapeHtml(BOOKS[id].name)} →</button>`).join('')}</div></aside>` : '';
  content.innerHTML = `<header class="lesson-head"><div class="meta"><span class="tag" style="border-color:${tint}60;color:${tint}">${escapeHtml(label)}</span>
    <span>${details}</span></div><h1>${escapeHtml(item.title)}</h1><p>${escapeHtml(description)}</p>
    <div class="lesson-actions"><button id="mark-learned" class="${done ? 'success' : ''}">${done ? '✓ Completato' : '✓ Segna come completato'}</button>
    <button id="favorite">${fav ? '★ Nei preferiti' : '☆ Salva'}</button>
    <a href="${encodeURI(item.path)}" target="_blank" rel="noopener">↗ Apri file sorgente</a></div></header>
    <div class="lesson-grid"><div>${related}<article class="article" id="article">${item.body}</article>
    <div class="lesson-foot"><button id="previous" ${position === 0 ? 'disabled' : ''}>← Precedente</button>
    <span class="keynote">${isRecipe ? 'Altre recipes nella barra laterale' : 'Capitoli nella barra laterale'}</span>
    <button id="following" ${position === siblings.length-1 ? 'disabled' : ''}>Successivo →</button></div></div>
    <nav class="toc" id="toc"><strong>In questa pagina</strong></nav></div>`;
  $('#mark-learned').onclick = () => {
    if (learned.has(item.path)) learned.delete(item.path); else learned.add(item.path);
    storage.write('handbook.learned', [...learned]); render();
  };
  $('#favorite').onclick = () => {
    if (favorites.has(item.path)) favorites.delete(item.path); else favorites.add(item.path);
    storage.write('handbook.favorites', [...favorites]); render();
  };
  $('#previous').onclick = () => navigateSibling(siblings[position-1], isRecipe);
  $('#following').onclick = () => navigateSibling(siblings[position+1], isRecipe);
  let count = 0;
  $('#article').querySelectorAll('h2,h3').forEach(heading => {
    heading.id = 'section-' + count++;
    const anchor = document.createElement('a'); anchor.href = '#' + heading.id; anchor.textContent = heading.textContent;
    if (heading.tagName === 'H3') anchor.className = 'small';
    anchor.onclick = event => { event.preventDefault(); heading.scrollIntoView({behavior: 'smooth', block: 'start'}); };
    $('#toc').append(anchor);
  });
  if (!count) $('#toc').innerHTML = '<strong>Appunti commentati</strong>';
  content.querySelectorAll('.copy-snippet').forEach(button => button.onclick = () =>
    copyText(button.closest('.code-block').querySelector('code').textContent));
  bindCards();
}
function navigateSibling(item, isRecipe) {
  if (!item) return;
  if (isRecipe) openRecipe(item.i); else openLesson(item.i);
}
async function copyText(value) {
  try { await navigator.clipboard.writeText(value); toast('Codice copiato'); }
  catch {
    try {
      const temp = document.createElement('textarea'); temp.value = value; document.body.append(temp);
      temp.select(); document.execCommand('copy'); temp.remove(); toast('Codice copiato');
    } catch { toast('Seleziona il codice per copiarlo'); }
  }
}
function renderSearch() {
  const hits = allItems.filter(matchesQuery);
  content.innerHTML = `<div class="search-results"><div class="eyebrow">RICERCA GLOBALE · CAPITOLI E RECIPES</div>
    <h2>${hits.length} risultati per “${escapeHtml(query)}”</h2>
    <p>Cerca in titoli, descrizioni, tag e codice delle lezioni e delle recipes.</p>
    ${hits.slice(0, 150).map(item => `<button class="result-card" data-${item.kind}="${item.i}">
      <strong>${escapeHtml(itemLabel(item))}</strong><small>${escapeHtml(item.summary ?? item.description)}</small></button>`).join('') ||
      '<div class="empty-page">Nessun risultato: prova un termine più corto (es. fetch, pandas, API).</div>'}</div>`;
  bindCards();
}
function render() {
  updateBar(); renderSide();
  if (query) renderSearch();
  else if (view === 'lesson' || view === 'recipe') detail();
  else if (view === 'book') bookHome();
  else if (view === 'recipes') recipesHome();
  else home();
  main.scrollTop = 0;
}
function syncFromHash() {
  const hash = decodeURIComponent(location.hash.slice(1));
  if (hash.startsWith('lesson/')) {
    const item = itemAtPath(hash.slice(7));
    if (item?.kind === 'lesson' && !(view === 'lesson' && selected === item.i)) openLesson(item.i);
  } else if (hash.startsWith('recipe/')) {
    const i = RECIPES.findIndex(item => item.id === hash.slice(7));
    if (i >= 0 && !(view === 'recipe' && selected === i)) openRecipe(i);
  } else if (hash.startsWith('book/')) {
    const id = hash.slice(5);
    if (BOOKS[id] && !(view === 'book' && book === id)) openBook(id);
  } else if (hash === 'recipes') {
    if (view !== 'recipes') openRecipes();
  } else if (view !== 'home') openHome();
  else render();
}
input.addEventListener('input', () => { query = input.value.trim(); render(); });
$('.nav-pill[data-action="chapters"]').onclick = () => { sideMode = 'chapters'; query = ''; input.value = ''; render(); };
$('.nav-pill[data-action="favorites"]').onclick = () => { sideMode = 'favorites'; query = ''; input.value = ''; render(); };
$('#home-button').onclick = openHome;
document.addEventListener('keydown', event => {
  if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) ||
      (event.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName))) {
    event.preventDefault(); input.focus(); input.select();
  }
  if (event.key === 'Escape') {
    input.blur(); if (query) { query = ''; input.value = ''; render(); }
  }
});
window.addEventListener('hashchange', syncFromHash);
syncFromHash();
