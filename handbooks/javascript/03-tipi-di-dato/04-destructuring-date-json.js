'use strict';
// JAVASCRIPT HANDBOOK 03.4 — Destructuring, Date, JSON
// Fonte: https://javascript.info/destructuring-assignment
// GUIDA ALLA LETTURA — prima di eseguire gli esempi:
// - Destructuring estrae proprietà; rest e spread usano ... in posizioni diverse.
// - JSON.stringify serializza, JSON.parse interpreta testo JSON; JSON non conserva tutte le strutture JS.

(() => {

  // 1. DESTRUCTURING: estrai/assegna valori in una sola istruzione.
  const [first, , third = 0, ...rest] = [10, 20, 30, 40];
  console.log(first, third, rest); // 10,30,[40]
  const profile = { name: 'Ada', address: { city: 'Roma' } };
  const { name: displayName, role = 'guest', address: { city } } = profile;
  console.log(displayName, role, city);
  // Il default vale quando il dato e' undefined, non null.
  const copy = { ...profile, active: true }; // shallow copy
  console.log(copy);

  // 2. DATE: timestamp millisecondi dal 1970-01-01 UTC.
  const date = new Date('2025-06-01T12:00:00Z'); // ISO: fuso esplicito
  console.log(date.getTime());
  console.log(date.getUTCFullYear(), date.getUTCMonth()); // mese 0..11!
  // Getter locali: getFullYear(), getMonth() (0..11), getDate() (1..31),
  // getDay() (0 domenica..6 sabato), getHours(), getMinutes(),
  // getSeconds(), getMilliseconds(). Varianti UTC: getUTC...().
  console.log(date.toISOString()); // sempre UTC
  console.log(date.toLocaleDateString('it-IT')); // dipende da fuso locale
  console.log(date.toDateString(), date.toTimeString());
  console.log(date.toLocaleTimeString('it-IT'));
  console.log(date.toJSON() === date.toISOString()); // Date usa toJSON
  console.log(new Date('2025-06-02T12:00:00Z') - date); // 86400000 ms
  // Per date locali reali attenzione a DST: un giorno NON e' sempre 24h.
  // === tra due Date confronta riferimenti; usa getTime() per gli istanti.
  const sameInstant = new Date(date.getTime());
  console.log(sameInstant === date, +sameInstant === +date); // false,true

  // 3. JSON: formato testuale per trasporto/persistenza dati.
  const data = { name: 'Ada', active: true, skills: ['JS'] };
  const json = JSON.stringify(data);
  console.log(json); // keys tra doppi apici; no commenti, no funzioni.
  const parsed = JSON.parse(json);
  console.log(parsed.skills[0]);
  // 'replacer' permette di filtrare/trasformare i campi.
  console.log(JSON.stringify({ a: 1, password: 'x' }, ['a']));
  // 'reviver' trasforma valori durante il parse.
  console.log(JSON.parse('{"score":"10"}', (key, val) =>
    key === 'score' ? Number(val) : val));
  // La serializzazione non preserva tutti i tipi (Map, undefined, cicli...).
})();
