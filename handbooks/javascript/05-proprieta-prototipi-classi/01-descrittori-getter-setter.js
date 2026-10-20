'use strict';
// JAVASCRIPT HANDBOOK 05.1 — Descriptor, flags, getter/setter
// Fonte: https://javascript.info/property-descriptors
(() => {
  // Una proprieta' dati ha value + flag writable/enumerable/configurable.
  const book = {};
  Object.defineProperty(book, 'isbn', {
    value: '123', writable: false, enumerable: true, configurable: false
  });
  console.log(Object.getOwnPropertyDescriptor(book, 'isbn'));
  try { book.isbn = '456'; } catch (e) { console.log(e.name); }
  // writable:false -> assegnazione errore in strict mode; configurable:false
  // non puo' essere cancellata o riconfigurata (con alcune eccezioni).

  const person = {
    first: 'Ada', last: 'Lovelace',
    get fullName() { return `${this.first} ${this.last}`; },
    set fullName(value) { [this.first, this.last] = value.split(' '); }
  };
  console.log(person.fullName); // getter si legge senza ()
  person.fullName = 'Grace Hopper'; // setter si usa come assegnazione
  console.log(person.first);
  // Accessor property = get/set, non 'value'/'writable'.

  // Object.freeze: rende shallow le proprieta' non scrivibili/non configurabili;
  // Object.seal impedisce aggiunta/rimozione, ma non sempre modifica valori.
  const settings = Object.freeze({ theme: 'dark', nested: { n: 1 } });
  settings.nested.n = 2; // freeze NON e' profondo
  console.log(settings.nested.n);
})();
