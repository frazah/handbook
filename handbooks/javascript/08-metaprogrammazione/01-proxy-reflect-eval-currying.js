'use strict';
// JAVASCRIPT HANDBOOK 08.1 — Proxy, Reflect, currying, eval e reference
// Fonte: https://javascript.info/proxy
// GUIDA ALLA LETTURA — prima di eseguire gli esempi:
// - Proxy intercetta operazioni su un target tramite trap; Reflect offre comportamenti standard.
// - eval esegue stringhe come codice: evita input non affidabili.

(() => {
  // PROXY: intercetta operazioni (get/set/has/ownKeys...).
  const target = { age: 28 };
  // Proxy intercetta alcune operazioni su un oggetto tramite un handler.
  const validated = new Proxy(target, {
    set(object, key, value, receiver) {
      if (key === 'age' && (!Number.isInteger(value) || value < 0)) {
        throw new RangeError('age non valido');
      }
      return Reflect.set(object, key, value, receiver); // boolean
    },
    get(object, key, receiver) {
      return Reflect.get(object, key, receiver);
    }
  });
  validated.age = 29;
  console.log(validated.age);
  // I trap devono rispettare le invarianti JS (es. proprieta' non configurabili).
  // Reflect offre metodi corrispondenti all'operazione base.

  // CURRYING: trasformare f(a,b) in f(a)(b).
  const add = a => b => a + b;
  const add10 = add(10);
  console.log(add10(5)); // 15
  // Partial application (bind) precompila parametri senza necessariamente curry.

  // REFERENCE: obj.method() conserva un ricevente per 'this'; estrarre
  // il metodo lo perde (vedi 02-this-costruzione-simboli).
  const person = { name: 'Ada', nameOf() { return this.name; } };
  console.log(person.nameOf());
  const method = person.nameOf;
  console.log(method.call(person));

  // EVAL: esegue testo come codice; rischi di injection e ottimizzazione.
  // Evitalo: NON interpretare mai input di utenti come codice JS.
})();
