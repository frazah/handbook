'use strict';
// JAVASCRIPT HANDBOOK 09.1 — Browser, DOM, selettori e manipolazione
// Fonte: https://javascript.info/document
// Solo browser: includi <script defer src="...file.js"></script>.
(() => {
  if (typeof document === 'undefined') return; // Node non ha document
  // window = API finestra, document = DOM HTML, navigator = browser/platform.
  // DOM e' un ALBERO: Node, Element, Text, Document, ecc.
  console.log(document.documentElement.tagName); // 'HTML'
  console.log(document.body?.tagName);           // 'BODY'

  // Selettori: primo elemento o tutti gli elementi corrispondenti.

  // querySelector cerca il primo elemento che corrisponde al selettore CSS.
  const firstButton = document.querySelector('button'); // Element|null
  const buttons = document.querySelectorAll('button');  // NodeList statico
  console.log(buttons.length);
  // getElementsByClassName/tagName -> HTMLCollection spesso LIVE;
  // querySelectorAll -> NodeList statico (foto del momento).
  console.log(firstButton?.closest('section'));
  console.log(firstButton?.matches('button'));
  // Navigazione: parentElement, children, firstElementChild,
  // nextElementSibling; childNodes include anche nodi di testo.

  // Creare elementi: evita stringhe HTML per dati non affidabili.
  const message = document.createElement('p');
  message.textContent = '<script>non viene eseguito</script>'; // sicuro
  message.classList.add('handbook-message');
  message.dataset.source = 'handbook';
  message.setAttribute('aria-live', 'polite');
  // message.innerHTML = userInput; // PERICOLO XSS se input non fidato.
  const sandbox = document.querySelector('[data-handbook-output]');
  if (sandbox) sandbox.append(message); // demo opt-in
  // Element.remove(), prepend(), before(), after(), replaceWith().
  // outerHTML/innerHTML interpretano markup: preferisci textContent.

  // Attributi HTML vs proprieta' JS: possono non coincidere esattamente.
  // input.getAttribute('value') = valore iniziale nell'HTML;
  // input.value = valore corrente del controllo.
  console.log(message.getAttribute('aria-live'), message.dataset.source);
})();
