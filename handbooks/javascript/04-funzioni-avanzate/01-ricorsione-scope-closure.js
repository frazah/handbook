'use strict';
// JAVASCRIPT HANDBOOK 04.1 — Ricorsione, stack, scope, closure, var
// Da QUI inizia il programma che non avevi ancora studiato.
// Fonte: https://javascript.info/advanced-functions
(() => {
  // RICORSIONE: una funzione richiama se stessa; serve un CASO BASE.
  function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
  }
  console.log(factorial(5)); // 120
  // Ogni chiamata crea un frame nello stack. Ricorsioni troppo profonde
  // provocano RangeError: Maximum call stack size exceeded.

  // REST raccoglie argomenti in un ARRAY; SPREAD espande un iterabile.
  function sum(...numbers) { return numbers.reduce((a, b) => a + b, 0); }
  const nums = [10, 20, 30];
  console.log(sum(...nums)); // 60
  // ... in letterali: [...array] o {...object} produce copie SUPERFICIALI.
  console.log(Math.max(...nums));
  // 'arguments' esiste nelle funzioni normali, ma non nelle arrow; preferisci rest.

  // SCOPE LESSICALE: la visibilita' dipende da DOVE e' scritto il codice.
  const outer = 'esterno';
  {
    const inner = 'interno';
    console.log(outer, inner);
  }
  // console.log(inner); // ReferenceError: non esiste fuori dal blocco

  // CLOSURE: una funzione conserva accesso alle variabili del suo ambiente,
  // anche DOPO che la funzione esterna ha terminato.
  function counterFactory(initial = 0) {
    let value = initial; // stato privato: ogni chiamata crea un ambiente nuovo
    return {
      increment() { value++; return value; },
      read() { return value; }
    };
  }
  const counterA = counterFactory(5);
  const counterB = counterFactory();
  console.log(counterA.increment(), counterA.read(), counterB.read()); // 6,6,0

  // ERRORE TIPICO: var e' function-scoped, let e' block-scoped.
  const withLet = [];
  for (let i = 0; i < 3; i++) withLet.push(() => i);

  // map restituisce un nuovo array: non modifica quello originale.
  console.log(withLet.map(fn => fn())); // [0,1,2]
  const withVar = [];
  for (var j = 0; j < 3; j++) withVar.push(() => j);

  // map restituisce un nuovo array: non modifica quello originale.
  console.log(withVar.map(fn => fn())); // [3,3,3]
  // Hoisting: 'var' e' leggibile come undefined prima dell'assegnazione,
  // let/const esistono nel blocco ma sono in TDZ prima della dichiarazione.
  // Consiglio: preferisci const; let solo per riassegnazioni; evita var.
})();
