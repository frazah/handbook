'use strict';
// JAVASCRIPT HANDBOOK 10.2 — Mouse, Pointer, tastiera, drag, scroll
// Fonte: https://javascript.info/event-details
(() => {
  if (typeof document === 'undefined') return;

  // querySelector cerca il primo elemento che corrisponde al selettore CSS.
  const box = document.querySelector('[data-handbook-box]');
  if (!box) return;

  // Il listener reagisce a un evento senza eseguire subito la callback.
  box.addEventListener('pointerdown', (e) => {
    console.log(e.pointerType, e.clientX, e.clientY);
    // pointerdown copre mouse, penna, touch; gestisci eventuale pressione.
  });
  box.addEventListener('pointerenter', () => console.log('entrato'));
  box.addEventListener('pointerleave', () => console.log('uscito'));
  // mouseover/mouseout fanno bubble; mouseenter/mouseleave no.
  // Pointer Events sono preferibili a doppie implementazioni mouse/touch.

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') console.log('ESC');
    // e.key -> carattere/intento; e.code -> posizione fisica (KeyA).
    // e.repeat true per auto-repeat della tastiera.
  });

  // DRAG custom: pointerdown -> pointermove -> pointerup, spesso
  // setPointerCapture per continuare il drag fuori dall'elemento;
  // oppure HTML Drag and Drop per trasferimento tra elementi.
  // SCROLL ad alta frequenza: usa listener {passive:true}; throttling
  // o requestAnimationFrame; preferisci IntersectionObserver per visibilita'.
  window.addEventListener('scroll', () => {}, { passive: true });
})();
