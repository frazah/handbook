'use strict';
// JAVASCRIPT HANDBOOK 04.3 — call, apply, bind, decorator, arrow e this
// Fonte: https://javascript.info/bind
// GUIDA ALLA LETTURA — prima di eseguire gli esempi:
// - call/apply invocano scegliendo this; bind restituisce una nuova funzione con this associato.
// - Le arrow non hanno il proprio this: usano quello dell’ambiente esterno.

(() => {
  const user = { name: 'Ada' };
  function introduce(greeting, punctuation) {
    return `${greeting} ${this.name}${punctuation}`;
  }
  // call(thisArg, arg1, ...); apply(thisArg, [args])
  console.log(introduce.call(user, 'Ciao', '!'));
  console.log(introduce.apply(user, ['Salve', '.']));
  // bind(thisArg, ...presetArgs) CREA una funzione legata, non la esegue.
  const helloAda = introduce.bind(user, 'Ciao');
  console.log(helloAda('?'));

  // DECORATOR: wrapper che modifica comportamento di una funzione,
  // preservando (quando necessario) il this e gli argomenti.
  function memoizeUnary(fn) {
    const cache = new Map();
    return function (...args) {
      const key = args[0]; // versione DIDATTICA: per funzioni a 1 argomento
      if (cache.has(key)) return cache.get(key);
      const result = fn.apply(this, args); // forward di this/arguments
      cache.set(key, result);
      return result;
    };
  }
  const expensive = memoizeUnary(n => n * n);
  console.log(expensive(9), expensive(9));
  // Cache in produzione: progetta bene chiavi e invalidazione.

  // ARROW: this/arguments NON propri. Utile in callback di un metodo.
  const timer = {
    seconds: 5,
    printSoon() {
      setTimeout(() => console.log('seconds:', this.seconds), 0);
    }
  };
  timer.printSoon(); // la arrow conserva il this di printSoon
  // Non usare arrow come metodo se vuoi this dinamico; non con new.
  // Bind di una arrow non puo' sostituire il this lessicale.
})();
