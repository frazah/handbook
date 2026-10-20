'use strict';
// JAVASCRIPT HANDBOOK 05.3 — Classi, extends, super, #private, static,
// instanceof, mixin
// Fonte: https://javascript.info/classes
(() => {
  class Animal {
    static kingdom = 'Animalia';
    #energy = 100; // campo PRIVATO: accessibile solo nella classe
    constructor(name) { this.name = name; }
    eat() { this.#energy += 10; }
    get energy() { return this.#energy; }
    speak() { return `${this.name} fa un verso`; }
    static describe() { return this.kingdom; } // metodo della CLASSE
  }
  class Dog extends Animal {
    constructor(name, breed) {
      super(name); // obbligatorio prima di this nel constructor derivato
      this.breed = breed;
    }
    speak() { return `${super.speak()}: bau!`; }
  }
  const rex = new Dog('Rex', 'misto');
  rex.eat();
  console.log(rex.speak(), rex.energy, rex instanceof Animal);
  console.log(Dog.describe(), Animal.kingdom);
  // 'protected' non e' keyword JS: convenzione _field oppure #private.
  // I metodi class sono condivisi via prototype; class e' sintassi su
  // meccanismi prototipali, con alcune regole proprie.

  // ESTENDERE built-in: possibile, con attenzione a compatibilita' e API.
  class Collection extends Array { get first() { return this[0]; } }
  console.log(new Collection(3, 4).first); // 3

  // MIXIN: riutilizzo di comportamento senza ereditarieta' multipla.
  const runnable = { run() { return `${this.name} corre`; } };
  Object.assign(Dog.prototype, runnable);
  console.log(rex.run());
  // instanceof controlla (normalmente) la catena dei prototipi, NON
  // la 'forma' dell'oggetto: per dati esterni preferisci controlli espliciti.
})();
