'use strict';
// JAVASCRIPT HANDBOOK 01.4 — Codice leggibile, debugging, test
// Fonte: https://javascript.info/code-quality
// GUIDA ALLA LETTURA — prima di eseguire gli esempi:
// - Una funzione pura è testabile: restituisce un risultato prevedibile senza modificare il mondo esterno.
// - Un’asserzione nei test confronta il risultato reale con il risultato atteso.

(() => {
  // STILE: nomi significativi, una responsabilita' per funzione,
  // const di default, let quando serve, indentazione coerente e ===.
  // Commenti per spiegare PERCHE', non per ripetere una riga ovvia.
  // Tieni separate logica e UI: una funzione pura e' facile da testare.
  const priceAfterDiscount = (price, percentage) => {
    if (price < 0 || percentage < 0 || percentage > 100) {
      throw new RangeError('Prezzo o sconto non valido');
    }
    return price * (1 - percentage / 100);
  };
  // Assert semplice: se l'ipotesi e' falsa, fermati (test).
  function assertEqual(actual, expected, description) {
    if (!Object.is(actual, expected)) {
      throw new Error(`${description}: atteso ${expected}, ottenuto ${actual}`);
    }
  }
  assertEqual(priceAfterDiscount(100, 20), 80, 'sconto 20%');
  assertEqual(priceAfterDiscount(0, 0), 0, 'zero');
  console.log('Test OK');

  // DEBUG browser: F12 -> Console, Sources/Debugger -> breakpoint,
  // step over/into/out; in VS Code puoi usare debugger e pannello Variables.
  // console.log(data), console.table(array), console.time/console.timeEnd.
  // debugger; // sospende SOLO se c'e' un debugger collegato
  // JSDoc di supporto, soprattutto senza TypeScript:
  /** @param {number} n @returns {boolean} */
  function isEven(n) {
    return n % 2 === 0;
  }
  console.log(isEven(10));

  // Linee guida: evita input prompt durante test, effetti collaterali inattesi,
  // nomi globali ripetuti tra file, copia-incolla di esempi fuori contesto.
  // Tool comuni: formatter Prettier, lint ESLint, test runner node:test/Vitest.
})();
