'use strict';
// JAVASCRIPT HANDBOOK 10.1 — Eventi, capturing/bubbling, delega, CustomEvent
// Fonte: https://javascript.info/events
(() => {
  if (typeof document === 'undefined') return;

  // querySelector cerca il primo elemento che corrisponde al selettore CSS.
  const list = document.querySelector('[data-handbook-list]');
  if (!list) return;

  // addEventListener(event, handler, options): non sovrascrive altri handler.
  // Flusso: CAPTURING (dall'alto) -> TARGET -> BUBBLING (verso l'alto).
  const onListClick = (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button || !list.contains(button)) return;
    // Delegation: un solo handler sul contenitore gestisce bottoni futuri.
    console.log('action:', button.dataset.action);
    button.classList.toggle('selected');
  };
  list.addEventListener('click', onListClick);
  // list.removeEventListener('click', onListClick); // stessa funzione/flags

  list.addEventListener('click', () => console.log('una sola volta'),
    { once: true });
  // { capture: true } ascolta in capturing; { passive:true } promette
  // di non chiamare preventDefault, utile per scroll/wheel.
  // event.target e' la sorgente originale, event.currentTarget il listener.
  // stopPropagation interrompe propagazione, non default del browser.
  // preventDefault annulla azione default se event.cancelable e non passive.

  const event = new CustomEvent('handbook:ready', {
    bubbles: true, detail: { chapter: 'events' }
  });
  list.addEventListener('handbook:ready', e => console.log(e.detail));
  list.dispatchEvent(event); // dispatchEvent e' sincrono
})();
