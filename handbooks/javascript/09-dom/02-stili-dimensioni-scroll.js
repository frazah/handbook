'use strict';
// JAVASCRIPT HANDBOOK 09.2 — Stili, classi, box model, coordinate, scroll
// Fonte: https://javascript.info/styles-and-classes
// GUIDA ALLA LETTURA — prima di eseguire gli esempi:
// - classList gestisce classi CSS senza riscrivere l’intero attributo class.
// - getBoundingClientRect restituisce posizioni rispetto alla viewport, non alla pagina.

(() => {
  if (typeof document === 'undefined') return;

  // querySelector cerca il primo elemento che corrisponde al selettore CSS.
  const el = document.querySelector('[data-handbook-box]');
  if (!el) return; // serve l'elemento della demo; esempi di API in commento
  // Classi: privilegia CSS esterno e classList rispetto a style inline.
  el.classList.add('active');
  el.classList.toggle('highlight');
  console.log(el.classList.contains('active'));
  el.style.borderRadius = '8px'; // property camelCase per CSS inline
  console.log(getComputedStyle(el).display); // stile risultante

  // Dimensioni: clientWidth (interno+padding), offsetWidth (bordo incluso),
  // scrollWidth (anche parte non visibile), scrollTop (quanto scrollato).
  console.log(el.clientWidth, el.offsetWidth, el.scrollWidth);
  console.log(el.scrollTop);
  // getBoundingClientRect: coordinate relative alla VIEWPORT (anche dopo scroll).
  const rect = el.getBoundingClientRect();
  console.log(rect.left, rect.top, rect.width, rect.height);
  // Coordinate document: rect.top + window.scrollY.
  // window.innerWidth / innerHeight: viewport CSS pixels.
  // window.scrollTo({ top: 0, behavior: 'smooth' });
  // el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  // Le letture di layout dopo tante modifiche possono forzare un reflow:
  // raggruppa letture e scritture per evitare layout thrashing.
})();
