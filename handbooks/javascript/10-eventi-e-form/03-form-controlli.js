'use strict';
// JAVASCRIPT HANDBOOK 10.3 — Form, input/change, focus/blur, FormData
// Fonte: https://javascript.info/forms-controls
(() => {
  if (typeof document === 'undefined') return;

  // querySelector cerca il primo elemento che corrisponde al selettore CSS.
  const form = document.querySelector('[data-handbook-form]');
  if (!form) return;
  const nameInput = form.elements.namedItem('username');
  // input: ad ogni cambiamento; change: al 'commit' (dipende dal controllo).

  // Il listener reagisce a un evento senza eseguire subito la callback.
  nameInput.addEventListener('input', () => {
    console.log('live:', nameInput.value);
  });
  nameInput.addEventListener('change', () => {
    console.log('confermato:', nameInput.value);
  });
  nameInput.addEventListener('focus', () => console.log('focus'));
  nameInput.addEventListener('blur', () => console.log('blur'));
  // focus/blur non bubble; focusin/focusout sì.
  // Con paste/copy/cut: eventi clipboard; non leggere dati sensibili.

  form.addEventListener('submit', e => {
    e.preventDefault(); // impedisce navigazione/invio HTML predefinito
    if (!form.reportValidity()) return; // validazione nativa
    const data = new FormData(form);
    console.log(Object.fromEntries(data)); // semplice solo per campi unici
    // Un campo checkbox non selezionato NON compare in FormData.
    // File input -> File object (non stringa) nell'istanza di FormData.
  });
  // button type="submit" invia; type="button" no.
  // form.requestSubmit() attiva convalida ed evento submit;
  // form.submit() li salta: non confondere.
})();
