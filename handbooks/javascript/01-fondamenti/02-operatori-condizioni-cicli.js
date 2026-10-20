'use strict';
// JAVASCRIPT HANDBOOK 01.2 — Operatori, confronto, condizioni e cicli
// Fonte: https://javascript.info/first-steps
// GUIDA ALLA LETTURA — prima di eseguire gli esempi:
// - === confronta senza conversioni implicite; == può convertirne gli operandi.
// - ?? applica un default solo a null/undefined; || usa tutti i valori falsy.

(() => {

  // 1. OPERATORI
  console.log(7 / 2);  // 3.5
  console.log(7 % 2);  // 1 resto
  console.log(2 ** 3); // 8 potenza
  let count = 1;
  count += 2;          // count = count + 2
  count++;             // aumenta dopo aver restituito il vecchio valore
  ++count;             // aumenta prima di restituire il nuovo valore
  console.log(count); // 5

  // 2. CONFRONTI: preferisci SEMPRE === e !== (niente coercizione).
  console.log('2' === 2);      // false
  console.log('2' == 2);       // true — quasi sempre da evitare
  console.log(null == undefined); // true — eccezione particolare
  console.log(null === undefined); // false
  console.log(Number.NaN === Number.NaN); // false: Number.isNaN(x)
  // < > <= >= possono convertire tipi; tra stringhe confronto lessicografico.

  // 3. LOGICI — && e || NON restituiscono per forza un booleano!
  const username = '';
  console.log(username || 'Anonimo'); // fallback per qualunque falsy
  console.log(0 ?? 100);              // 0: ?? ripiega solo su null/undefined
  console.log(null ?? 100);           // 100
  console.log('ciao' && 42);          // 42 (ultimo operando se tutti truthy)
  console.log(!'ciao');               // false
  // Non combinare ?? con ||/&& senza parentesi: (a ?? b) || c.
  let total = 0;
  total ||= 10;  // assegna se falsy
  total ??= 20;  // assegna se nullish
  console.log(total); // 10

  // 4. if, ternario, switch
  const age = 18;
  if (age >= 18) console.log('Maggiorenne');
  else console.log('Minorenne');
  const label = age >= 18 ? 'adulto' : 'minore';
  console.log(label);
  const fruit = 'apple';
  switch (fruit) {
    case 'apple': console.log('Mela'); break; // break evita il fallthrough
    case 'pear': console.log('Pera'); break;
    default: console.log('Altro');
  }

  // 5. CICLI E CONTROLLO DEL FLUSSO
  for (let i = 0; i < 3; i++) console.log('for', i);
  let i = 0;
  while (i < 2) { console.log('while', i); i++; }
  do { i--; } while (i > 0); // almeno un'esecuzione
  for (const value of [10, 20]) console.log('for...of', value);
  // for...of: valori di ITERABILI (array, stringhe, Map, Set...)
  for (const key in { a: 1, b: 2 }) console.log('for...in', key);
  // for...in: chiavi enumerabili di un oggetto, incluse quelle ereditate.
  // Per gli oggetti normali spesso meglio Object.keys/entries.
  for (let k = 0; k < 5; k++) {
    if (k === 1) continue; // salta questa iterazione
    if (k === 3) break;    // esce dal ciclo
    console.log('k:', k);
  }
})();
