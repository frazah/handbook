'use strict';
// JAVASCRIPT HANDBOOK 05.2 — Prototype chain, F.prototype, Object.create
// Fonte: https://javascript.info/prototypes
(() => {
  // Ogni oggetto ha (normalmente) un prototype interno [[Prototype]].
  // Lettura proprieta': se assente sull'oggetto, cerca lungo la catena.
  const animal = { eats: true, walk() { return 'cammino'; } };
  const rabbit = Object.create(animal);
  rabbit.jumps = true;
  console.log(rabbit.eats, rabbit.walk()); // ereditate
  console.log(Object.hasOwn(rabbit, 'eats')); // false: proprieta' ereditata
  console.log(Object.getPrototypeOf(rabbit) === animal); // true
  // Evita __proto__ in nuovo codice; preferisci Object.create/get/setPrototypeOf.
  // Non cambiare prototipi a runtime su oggetti hot: può essere inefficiente.

  // COSTRUTTORI: funzione.prototype diventa prototipo dei nuovi oggetti.
  function User(name) { this.name = name; }
  User.prototype.sayHi = function () { return `Ciao ${this.name}`; };
  const user = new User('Ada');
  console.log(user.sayHi(), user instanceof User); // true
  console.log(Object.getPrototypeOf(user) === User.prototype); // true
  // Il prototype di una funzione costruttrice NON coincide con il suo
  // [[Prototype]] interno; sono due concetti diversi!

  // Prototype nativi: [].map e' trovato lungo Array.prototype.
  console.log(Object.getPrototypeOf([]) === Array.prototype);
  // Non estendere i prototipi built-in salvo polyfill accurati.

  // Object.create(null): oggetto senza prototype, adatto a dizionari puri.
  const dict = Object.create(null);
  dict['toString'] = 'valore'; // nessun metodo toString ereditato
  console.log(dict.toString);
})();
