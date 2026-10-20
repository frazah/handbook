'use strict';
// JAVASCRIPT HANDBOOK 11.1 — caricamento, event loop, MutationObserver
// Fonte: https://javascript.info/onload-ondomcontentloaded
// GUIDA ALLA LETTURA — prima di eseguire gli esempi:
// - DOMContentLoaded segnala che l’HTML è stato letto; load aspetta anche altre risorse.
// - MutationObserver osserva cambiamenti al DOM ed esegue callback asincrone.

(() => {
  if (typeof document === 'undefined') return;
  // DOMContentLoaded: DOM analizzato e script defer/module iniziali eseguiti.
  // load: anche risorse che ritardano il load (es. immagini normali).
  // <script defer src="app.js">: parsing non bloccato, ordine rispettato.
  // <script async src="analytics.js">: indipendente, ordine NON garantito.
  // <script type="module">: deferred per default.

  // Il listener reagisce a un evento senza eseguire subito la callback.
  document.addEventListener('DOMContentLoaded', () => console.log('DOM ready'));
  // window rappresenta la finestra/contesto del browser.
  window.addEventListener('load', () => console.log('resources ready'));
  // Se questo script viene caricato dopo l'evento, il listener non scatta!
  if (document.readyState !== 'loading') console.log('DOM gia disponibile');

  // Macro-task: script/eventi/timer; microtask: Promise.then,
  // queueMicrotask; microtask si svuotano prima del prossimo task.
  console.log('sync');
  queueMicrotask(() => console.log('microtask'));
  setTimeout(() => console.log('timer'), 0);

  // MutationObserver osserva modifiche DOM asincrone (in microtask checkpoint).

  // querySelector cerca il primo elemento che corrisponde al selettore CSS.
  const container = document.querySelector('[data-handbook-output]');
  if (!container) return;
  // MutationObserver osserva modifiche al DOM, non intercetta HTTP.
  const observer = new MutationObserver((records) => {
    console.log('modifiche:', records.length);
    observer.disconnect(); // demo: un solo batch di notifiche
  });
  observer.observe(container, { childList: true, subtree: true });
  container.append(document.createElement('span')); // attiva observer
  // Range/Selection: document.createRange(), window.getSelection();
  // servono per selezioni di testo/editor, non per normali form.
})();
