'use strict';
// JAVASCRIPT HANDBOOK 02.1 — Oggetti, proprieta', riferimenti e copie
// Fonte: https://javascript.info/object
// GUIDA ALLA LETTURA — prima di eseguire gli esempi:
// - Due variabili possono riferirsi allo stesso oggetto: una mutazione è visibile da entrambi i riferimenti.
// - Le copie con spread / Object.assign sono superficiali e non duplicano oggetti annidati.

(() => {

  // 1. Dizionario di proprieta': chiavi stringa o Symbol.
  const user = { name: 'Ada', age: 30, 'likes cats': true };
  console.log(user.name, user['likes cats']);
  const field = 'age';
  console.log(user[field]); // accesso dinamico; user.field cercherebbe 'field'
  user.active = true;
  delete user.active;
  console.log('age' in user, Object.hasOwn(user, 'age')); // true, true
  // 'in' consulta anche la catena dei prototipi; Object.hasOwn no.

  // 2. Shorthand, proprietà calcolate, enumerazione
  const name = 'Grace';
  const person = { name, [field]: 27 }; // come name: name e age: 27
  console.log(Object.keys(person));
  for (const [key, value] of Object.entries(person)) {
    console.log(key, value);
  }

  // 3. Oggetti confrontati per RIFERIMENTO, non per contenuto.
  const a = { n: 1 };
  const b = a;
  const c = { n: 1 };
  b.n = 2;
  console.log(a.n, a === b, a === c); // 2, true, false

  // 4. Copia superficiale (shallow): spread e Object.assign.
  const original = { name: 'Ada', address: { city: 'Roma' } };
  const shallow = { ...original };
  shallow.address.city = 'Milano';
  console.log(original.address.city); // 'Milano' — nested reference condivisa
  // Object.assign copia proprietà superficiali: gli oggetti annidati restano condivisi.
  const merged = Object.assign({}, original, { active: true });
  console.log(merged.active);

  // 5. Copia profonda. structuredClone gestisce anche molti tipi complessi
  // (Date, Map, Set, cicli), NON funzioni, DOM node o ogni oggetto speciale.
  const deep = structuredClone(original);
  deep.address.city = 'Napoli';
  console.log(original.address.city); // 'Milano' — ora indipendente
  // JSON.parse(JSON.stringify(...)) NON e' un clone universale:
  // perde undefined, funzioni, Symbol; Date->stringa, Map->{}; fallisce con cicli.

  // 6. Garbage collection: un oggetto diventa candidabile se non e' piu'
  // raggiungibile da alcuna radice. Non puoi prevedere QUANDO sara' liberato.
})();
