'use strict';
// JAVASCRIPT HANDBOOK 04.2 — Oggetto Function, NFE, globalThis, timer
// Fonte: https://javascript.info/advanced-functions
(() => {

  // 1. Le funzioni sono OGGETTI: hanno name, length e proprieta' custom.
  function multiply(a, b) { return a * b; }
  console.log(multiply.name, multiply.length); // 'multiply', 2 (parametri formali)
  multiply.description = 'Moltiplica due valori';
  console.log(multiply.description);

  // 2. Named Function Expression (NFE): nome interno per la ricorsione.
  const countdown = function step(n) {
    if (n <= 0) return 'via!';
    return step(n - 1);
  };
  console.log(countdown(3));
  // 'step' non esiste all'esterno dell'espressione.

  // 3. globalThis e' il riferimento al global object in piu' ambienti.
  console.log(typeof globalThis.console); // 'object'
  // Non depositare tutto su globalThis: namespace condiviso = collisioni.

  // 4. new Function('a','b','return a+b'): genera codice dinamico,
  // vede scope GLOBALE, non closure locali; comporta rischi di sicurezza.
  // NON usarlo per eseguire dati non affidabili; preferisci funzioni normali.

  // 5. TIMER (asincroni): restituiscono un identificatore da cancellare.
  const delayed = setTimeout(() => console.log('Timeout: eseguito'), 10);
  const repeating = setInterval(() => console.log('Interval: tick'), 1000);
  clearInterval(repeating); // impedisce le esecuzioni future
  // clearTimeout(delayed) annullerebbe il timeout (qui lo lasciamo partire).
  // I timer non garantiscono precisione assoluta: sono gestiti dall'event loop.
  console.log(typeof delayed); // browser: number, Node: object
})();
