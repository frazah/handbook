'use strict';
// JAVASCRIPT HANDBOOK 07.1 — Generator, yield, iterator, for await
// Fonte: https://javascript.info/generators
// GUIDA ALLA LETTURA — prima di eseguire gli esempi:
// - function* dichiara un generatore; yield consegna un valore e sospende.
// - for await...of consuma un iterabile asincrono; non è uguale al normale for...of.

(async () => {
  // Generator: function* e yield producono una sequenza 'on demand'.
  function* range(from, to) {
    // yield consegna un valore senza terminare il generatore.
    for (let i = from; i <= to; i++) yield i;
  }
  const iter = range(1, 3);
  console.log(iter.next()); // {value: 1, done: false}
  console.log([...iter]);   // [2,3] — iterator consuma lo stato
  for (const n of range(1, 3)) console.log('gen:', n);

  // Oggetto iterabile custom: restituisce un iteratore in [Symbol.iterator].
  const countUp = {
    *[Symbol.iterator]() { yield 1; yield 2; }
  };
  console.log([...countUp]);

  // Async generator: attende attivita' asincrone a ogni passo.
  async function* asyncNumbers() {
    yield await Promise.resolve(1);
    yield await Promise.resolve(2);
  }
  for await (const n of asyncNumbers()) console.log('async gen:', n);
  // for await funziona con async iterable e anche iterable sync.
})();
