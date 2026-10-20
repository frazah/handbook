'use strict';
// JAVASCRIPT HANDBOOK 06.2 — Promise, chaining, combinatori, microtask
// Fonte: https://javascript.info/async
(() => {
  // Una Promise rappresenta un risultato FUTURO: pending -> fulfilled/rejected.
  // Un valore e' 'thenable' se espone un metodo then compatibile.
  const valueLater = new Promise(resolve => resolve(10));
  const chain = valueLater
    .then(n => n * 2)       // produce una NUOVA Promise
    .then(n => { console.log('then:', n); return n + 1; })
    .catch(err => { console.error(err); return 0; })
    .finally(() => console.log('catena conclusa'));
  chain.then(n => console.log('risultato:', n)); // 21

  // Promises API:
  Promise.all([Promise.resolve(1), Promise.resolve(2)])
    .then(values => console.log('all:', values));
  // all: fallisce al primo rifiuto; allSettled: raccoglie tutti gli esiti.
  Promise.allSettled([Promise.resolve('ok'), Promise.reject('no')])

    // map restituisce un nuovo array: non modifica quello originale.
    .then(results => console.log('allSettled:', results.map(r => r.status)));
  Promise.any([Promise.reject('x'), Promise.resolve('ok')])
    .then(console.log); // prima fulfillment; se tutte reject: AggregateError
  Promise.race([Promise.resolve('first'), Promise.resolve('second')])
    .then(console.log); // prima settled (anche un reject)

  // Event loop: script sincrono -> microtask (then/queueMicrotask)
  // -> macrotask (setTimeout ecc.).
  console.log('A sync');
  queueMicrotask(() => console.log('C microtask'));
  setTimeout(() => console.log('D timer'), 0);
  console.log('B sync');
  // Output relativo di queste 4 righe: A, B, C, D.

  // PROMISIFICATION: converte un'API callback-based in Promise.
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  delay(1).then(() => console.log('ritardo terminato'));
  // Evita Promise non gestite (unhandled rejection) e .then non restituiti.
})();
