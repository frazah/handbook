'use strict';
// JAVASCRIPT HANDBOOK 01.3 — Funzioni, parametri, callback, arrow
// Fonte: https://javascript.info/function-basics
(() => {

  // 1. Dichiarazione: disponibile anche PRIMA della riga in cui appare
  console.log(sum(2, 3));
  function sum(a, b) { return a + b; }
  // return termina la funzione; senza return il risultato e' undefined.

  // 2. Espressione: una funzione e' un VALORE assegnabile/passabile
  const double = function (n) { return n * 2; };
  console.log(double(4));

  // 3. Arrow: sintassi breve; NON crea un proprio this/arguments;
  // non e' costruttore e non puo' essere chiamata con new.
  const triple = n => n * 3;
  const describe = (name, role) => ({ name, role }); // oggetto tra ()
  console.log(triple(3), describe('Ada', 'developer'));
  const multiLine = (x) => {
    const result = x * x;
    return result; // se ci sono {}, serve return esplicito
  };
  console.log(multiLine(5));

  // 4. Default parameters: attivi solo con undefined, NON null.
  function greet(name = 'ospite') { return `Ciao ${name}`; }
  console.log(greet(), greet(null)); // 'Ciao ospite', 'Ciao null'

  // 5. Callback: una funzione passata come argomento a un'altra.
  // Non vuol dire automaticamente 'asincrona'.
  function calculate(a, b, operation) { return operation(a, b); }
  console.log(calculate(3, 4, (a, b) => a * b));
  [1, 2, 3].forEach(n => console.log('item:', n));

  // 6. Scope: let/const vivono nel blocco; la funzione cattura l'esterno.
  const prefix = 'ID-';
  function makeId(id) { return prefix + id; }
  console.log(makeId(42));
  // NOTA: closures, rest/spread, call/apply/bind, recursion sono approfonditi
  // nella cartella 04-funzioni-avanzate.
})();
