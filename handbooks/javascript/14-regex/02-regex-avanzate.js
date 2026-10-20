'use strict';
// JAVASCRIPT HANDBOOK 14.2 — Gruppi, backreference, lookaround, replace
// Fonte: https://javascript.info/regexp-groups
// GUIDA ALLA LETTURA — prima di eseguire gli esempi:
// - I gruppi catturanti memorizzano sotto-stringhe; quelli non catturanti raggruppano senza salvarle.
// - Le lookaround verificano condizioni senza includerle nella parte corrispondente.

(() => {
  const date = '2026-10-19';
  const match = date.match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/);
  console.log(match.groups); // {year:'2026', month:'10', day:'19'}
  // replace può usare una regex per sostituire corrispondenze.
  console.log(date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1'));
  // (?:...) gruppo NON catturante; (a|b) alternanza.
  console.log(/^(?:cat|dog)$/.test('dog'));
  // Backreference: \1 primo gruppo; \k<name> gruppo nominato.
  console.log(/\b(\w+)\s+\1\b/i.test('ciao ciao'));

  // Lookahead (?=...), negativo (?!...), lookbehind (?<=...), (?<!...).
  console.log('EUR 42'.match(/(?<=EUR )\d+/)?.[0]); // '42'
  // Unicode property escape: usa /u oppure /v per caratteri internazionali.
  console.log('caffè'.match(/\p{L}+/gu)); // ['caffè']

  // matchAll per ottenere ogni match e i gruppi senza mutare lastIndex.
  for (const entry of 'a1 b2'.matchAll(/([a-z])(\d)/g)) {
    console.log(entry[1], entry[2], entry.index);
  }

  // Attenzione /g o /y + .test: lastIndex cambia, risultati dipendono stato.
  const global = /a/g;
  console.log(global.test('a'), global.test('a')); // true, false
  // REGEX DoS: evita nested quantifiers su input non fidato, es. (a+)+$.
})();
