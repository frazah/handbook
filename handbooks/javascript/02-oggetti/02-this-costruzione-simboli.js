'use strict';
// JAVASCRIPT HANDBOOK 02.2 — Metodi, this, new, optional chaining, Symbol
// Fonte: https://javascript.info/object-methods
(() => {

  // 1. this nelle funzioni normali dipende dalla CHIAMATA (non da dove
  // e' stata definita). In strict mode: chiamata senza ricevente => undefined.
  const user = {
    name: 'Ada',
    sayHi() { return `Ciao ${this.name}`; }
  };
  console.log(user.sayHi()); // 'Ciao Ada'
  const detached = user.sayHi;
  try { detached(); } catch (error) {
    console.log(error.name); // TypeError (this e' undefined)
  }
  console.log(detached.call(user)); // call stabilisce this esplicitamente
  const bound = user.sayHi.bind(user);
  console.log(bound());
  // Un'arrow NON definisce un proprio this: eredita quello lessicale.

  // 2. Funzione costruttrice + new: crea oggetto, lega this, restituisce
  // l'oggetto (salvo return esplicito di un altro oggetto).
  function User(name) { this.name = name; }
  const instance = new User('Grace');
  console.log(instance.name, instance instanceof User);
  // Per codice nuovo, le classi sono spesso piu' leggibili (vedi 05).

  // 3. Optional chaining: evita crash se il pezzo a sinistra e' nullish.
  const profile = { address: null };
  console.log(profile.address?.city); // undefined
  console.log(profile.onSave?.());    // undefined, nessuna chiamata
  console.log(profile.address?.city ?? 'Non specificata');
  // ?. NON protegge da una variabile totalmente non dichiarata.

  // 4. Symbol: chiave unica, non appare in Object.keys o JSON.stringify.
  const id = Symbol('id');
  const account = { [id]: 123, name: 'Ada' };
  console.log(account[id], Object.getOwnPropertySymbols(account));

  // 5. Da oggetto a primitivo: Symbol.toPrimitive / valueOf / toString.
  const money = {
    amount: 25,
    [Symbol.toPrimitive](hint) {
      return hint === 'string' ? `EUR ${this.amount}` : this.amount;
    }
  };
  console.log(String(money), money + 5); // 'EUR 25', 30
})();
