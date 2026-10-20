'use strict';
// JAVASCRIPT HANDBOOK 13.2 — Animazioni CSS, rAF e Web Animations API
// Fonte: https://javascript.info/animation
(() => {
  if (typeof document === 'undefined') return;

  // querySelector cerca il primo elemento che corrisponde al selettore CSS.
  const box = document.querySelector('[data-handbook-box]');
  if (!box) return;
  // Transitions: CSS transition: transform 250ms ease;
  // CSS @keyframes: motion gestita dal browser; eventi transitionend,
  // animationend segnalano la fine (non sempre in caso di cancellazione).
  // Animare transform/opacity in genere e' meno costoso di top/left/width.

  // requestAnimationFrame(callback): disegnare in sincronia col refresh.
  // QUI solo un frame per non far partire animazioni non richieste.
  const requestId = requestAnimationFrame((timestamp) => {
    console.log('frame at ms:', Math.round(timestamp));
  });
  // cancelAnimationFrame(requestId) annullerebbe il frame.
  console.log(typeof requestId);

  // Web Animations API: box.animate(keyframes, options) restituisce Animation.
  // const animation = box.animate(
  //   [{opacity:0}, {opacity:1}], {duration:300, fill:'forwards'});
  // await animation.finished; // Promise
  // Accessibilita': rispetta prefers-reduced-motion per animazioni intense.
  console.log(matchMedia('(prefers-reduced-motion: reduce)').matches);
})();
