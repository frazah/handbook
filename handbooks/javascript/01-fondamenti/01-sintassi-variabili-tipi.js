'use strict';
// JAVASCRIPT HANDBOOK 01.1 — Sintassi, variabili, tipi e conversioni
// Fonte: https://javascript.info/first-steps
// COME USARLO: node 01-sintassi-variabili-tipi.js (oppure Console del browser)
// Ogni file e' indipendente: variabili locali e nessun prompt invasivo.

// => introduce una arrow function; qui la usiamo come valore o callback.
// GUIDA ALLA LETTURA — prima di eseguire gli esempi:
// - let può essere riassegnata, const no; const non rende immutabili gli oggetti.
// - typeof null restituisce "object" per un’anomalia storica, non perché null sia un oggetto.

(() => {

  // 1. SINTASSI — istruzioni, blocchi, commenti
  // // commento su una riga   /* commento su piu' righe */
  // ';' separa le istruzioni; JavaScript talvolta lo inserisce automaticamente
  // (ASI), ma ci sono casi ambigui: usa ';' con coerenza.
  // 'use strict' abilita regole piu' rigorose nei vecchi script;
  // i moduli ES e i corpi delle classi sono strict per impostazione predefinita.

  // 2. VARIABILI
  let city = 'Roma';     // binding riassegnabile, visibile nel blocco {}
  city = 'Bologna';
  const country = 'Italia'; // binding NON riassegnabile
  // const non significa oggetto immutabile:
  const profile = { name: 'Ada' };
  profile.name = 'Grace'; // le proprieta' si possono modificare!
  // Evita 'var': scope di funzione e hoisting meno intuitivo.
  // Nomi: camelCase; mai iniziare con cifra; sono case-sensitive.
  const MAX_ATTEMPTS = 3; // maiuscolo per costanti realmente fisse

  // 3. TIPI PRIMITIVI (passati/confrontati per valore)
  const price = 19.9;             // number: anche Infinity, -Infinity, NaN
  const huge = 9007199254740993n; // bigint (non mescolarlo con number in +)
  const greeting = `Ciao, ${profile.name}!`; // template literal
  const enabled = true;           // boolean
  const empty = null;             // assenza intenzionale di valore
  let missing;                    // undefined: non assegnato
  const token = Symbol('token');  // identificatore unico
  const object = { key: 'value' }; // non primitivo: riferimento a oggetto
  // I 7 tipi primitivi sono: string, number, bigint, boolean,
  // undefined, symbol, null. Oggetti/funzioni sono valori di riferimento.
  console.log(typeof price, typeof huge, typeof token, typeof object);
  console.log(typeof null); // 'object' — anomalia storica, NON e' un oggetto!
  console.log(typeof (() => 1)); // 'function' (tipo speciale di object)

  // 4. CONVERSIONI (esplicite quando possibile)
  console.log(String(42));           // '42'
  console.log(Number('12.5'));      // 12.5
  console.log(Number('ciao'));      // NaN: controlla con Number.isNaN(...)
  console.log(Number(''));          // 0 (attenzione!)
  console.log(Boolean('false'));    // true: stringa NON vuota
  // Falsy: false, 0, -0, 0n, '', null, undefined, NaN.
  // TUTTI gli oggetti, [] e {} inclusi, sono truthy.
  console.log(Boolean([]), Boolean(0), Boolean(''));
  // Alcuni operatori fanno coercizioni implicite:
  console.log('5' + 1); // '51' (+ concatena con stringhe)
  console.log('5' - 1); // 4 (- converte a number)

  // 5. AMBIENTE: console (Node/browser); alert/prompt/confirm SOLO browser.
  // Browser: const name = prompt('Nome?', ''); // string | null
  // Browser: const ok = confirm('Continuare?'); // boolean
  // Browser: alert(greeting);
  console.log({ city, country, profile, MAX_ATTEMPTS, greeting,
    enabled, empty, missing, object });
})();
