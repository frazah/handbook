'use strict';
// JAVASCRIPT HANDBOOK 03.3 — Iterabili, Map, Set, WeakMap/WeakSet
// Fonte: https://javascript.info/map-set
// GUIDA ALLA LETTURA — prima di eseguire gli esempi:
// - Map usa chiavi di qualunque tipo; Set conserva valori unici.
// - for...of funziona su valori iterabili; for...in enumera chiavi e ha semantica diversa.

(() => {
  // Iterable: espone Symbol.iterator; si usa in for...of / spread.
  for (const letter of 'abc') console.log(letter);
  // Array-like (es. NodeList, arguments) NON implica sempre che sia Array.
  const asArray = Array.from('abc');
  console.log(asArray);

  // MAP: chiavi di QUALSIASI tipo; ordine di inserimento; size.
  const key = { id: 1 };
  const map = new Map();
  map.set(key, 'profilo');
  map.set('lang', 'JS');
  console.log(map.get(key), map.has('lang'), map.size);
  for (const [k, v] of map) console.log(k, v);
  map.delete('lang');
  // Map <-> Object: Object.fromEntries(map), Object.entries(obj).
  console.log(Object.fromEntries([['x', 10], ['y', 20]]));

  // SET: valori unici, preserva l'ordine di inserimento.
  const unique = new Set([1, 2, 2, 3]);
  unique.add(4);
  console.log([...unique], unique.has(2)); // [1,2,3,4], true
  unique.delete(1);
  // Deduplica un array di primitivi: [...new Set(array)].

  // WEAKMAP: chiavi oggetto (e Symbol non registrati), weak reference;
  // non iterabile, niente .size/.clear(). Utile per metadati privati.
  const cache = new WeakMap();
  const target = { id: 42 };
  cache.set(target, { hits: 1 });
  console.log(cache.get(target));
  // WEAKSET: elementi oggetto (e Symbol non registrati); membership debole.
  const seen = new WeakSet();
  seen.add(target);
  console.log(seen.has(target));
  // Garbage collection: 'debole' non significa rimozione immediata.
})();
