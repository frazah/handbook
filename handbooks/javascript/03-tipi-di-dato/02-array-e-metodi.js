'use strict';
// JAVASCRIPT HANDBOOK 03.2 — Array: accesso, modifica, trasformazione
// Fonte: https://javascript.info/array-methods
// GUIDA ALLA LETTURA — prima di eseguire gli esempi:
// - map, filter e slice restituiscono array nuovi; sort e splice modificano l’array originale.
// - La funzione passata a map/filter è una callback richiamata per ogni elemento.

(() => {
  const items = [3, 1, 2];
  console.log(items.length, items[0], items.at(-1));
  items.push(4);      // aggiunge in fondo; muta array
  items.pop();        // rimuove dall'ultimo
  items.unshift(0);  // aggiunge all'inizio; muta array
  items.shift();      // rimuove primo
  console.log(items); // [3,1,2]

  // slice NON muta; splice muta (rimuove/inserisce elementi).
  console.log(items.slice(1, 3)); // [1,2]
  const copied = [...items];
  copied.splice(1, 1, 9); // elimina 1 valore da indice 1, inserisce 9
  console.log(items, copied); // originale intatto, [3,9,2]
  console.log(items.concat([5, 6]));

  // CALLBACK — map/filter creano nuovi array; forEach no (ritorna undefined).

  // map restituisce un nuovo array: non modifica quello originale.
  console.log(items.map(n => n * 2));         // [6,2,4]

  // filter conserva gli elementi che soddisfano la condizione.
  console.log(items.filter(n => n > 1));      // [3,2]
  console.log(items.find(n => n > 1));        // primo trovato
  console.log(items.findIndex(n => n > 1));   // indice del primo, o -1
  console.log(items.some(n => n > 2));        // almeno uno
  console.log(items.every(n => n > 0));       // tutti
  console.log(items.reduce((sum, n) => sum + n, 0)); // 6
  // In reduce indica quasi sempre un valore iniziale, evita errori con [].
  items.forEach((value, index) => console.log(index, value));

  console.log(items.includes(2), items.indexOf(2));
  console.log([1, [2, [3]]].flat(2));         // [1,2,3]
  console.log(['a,b', 'c'].flatMap(s => s.split(','))); // ['a','b','c']

  // ATTENZIONE: sort() senza comparatore ordina STRINGHE!
  console.log([10, 2, 1].sort());              // [1,10,2]
  console.log([10, 2, 1].sort((a, b) => a - b)); // [1,2,10]
  // sort()/reverse() MUTANO: toSorted()/toReversed() creano nuovi array.
  console.log([3, 1, 2].toSorted((a, b) => a - b));
  console.log(Array.isArray(items), Array.from('ciao'), Array.of(5));
  console.log([1, 2, 3].join('-')); // '1-2-3'
  console.log([1, 2, 3].toReversed()); // [3,2,1] senza mutare
  // Array sono oggetti: === confronta l'identita', non gli elementi.
  console.log([1] === [1]); // false
})();
