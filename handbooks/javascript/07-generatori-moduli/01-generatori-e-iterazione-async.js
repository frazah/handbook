'use strict';
// JAVASCRIPT HANDBOOK 07.1 — Generator, yield, iterator, for await
// Fonte: https://javascript.info/generators
(async () => {
  // Generator: function* e yield producono una sequenza 'on demand'.
  function* range(from, to) {
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
