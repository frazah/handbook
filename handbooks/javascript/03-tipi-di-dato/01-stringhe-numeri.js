'use strict';
// JAVASCRIPT HANDBOOK 03.1 — Metodi primitivi, numeri, stringhe
// Fonte: https://javascript.info/data-types
// GUIDA ALLA LETTURA — prima di eseguire gli esempi:
// - Le stringhe sono immutabili: i metodi restituiscono nuove stringhe.
// - I number usano virgola mobile: evita === su risultati decimali non esatti.

(() => {
  // PRIMITIVI: normalmente non sono oggetti; JS fornisce metodi tramite
  // wrapper temporanei (es. 'abc'.toUpperCase()). null/undefined no.
  // NUMBER: IEEE 754 (doppia precisione); arrotondamenti non sempre esatti.
  console.log(0.1 + 0.2 === 0.3); // false
  console.log((0.1 + 0.2).toFixed(2)); // '0.30' — restituisce STRINGA
  console.log(Number.isFinite(10), Number.isNaN(NaN));
  console.log(Number.parseInt('42px', 10)); // 42 (legge prefisso numerico)
  console.log(Number.parseFloat('3.14rem')); // 3.14
  console.log(Number('42px')); // NaN: converte tutta la stringa
  console.log(Math.floor(3.8), Math.ceil(3.2), Math.round(3.5));
  console.log(Math.trunc(-3.8), Math.max(4, 8), Math.random());
  // Number.MIN_VALUE e' il piu' piccolo POSITIVO >0, non il piu' negativo.
  // Number.MAX_SAFE_INTEGER e' il massimo intero rappresentabile esattamente.
  console.log(Number.MAX_SAFE_INTEGER, Number.EPSILON);
  console.log(Number.MAX_VALUE, Number.MIN_VALUE); // MIN = minimo positivo
  console.log((123.456).toExponential(2)); // '1.23e+2'
  console.log((123.456).toPrecision(4)); // '123.5'

  // BIGINT: interi grandi, letterale con n; divisione tronca i decimali.
  console.log(10n / 3n); // 3n
  // 1n + 1 -> TypeError; usa conversioni esplicite, con cautela sui limiti.

  // STRINGHE: immutabili; metodi restituiscono nuove stringhe.
  const text = '  JavaScript è potente  ';
  console.log(text.trim());
  console.log(text.toUpperCase(), text.toLowerCase());
  console.log(text.includes('Script'), text.startsWith('  Java'));
  console.log(text.indexOf('Script')); // 6 oppure -1 se assente
  console.log(text.slice(2, 12));     // [inizio, fine esclusa)
  console.log(text.slice(-9));        // ultimi 9 code units
  console.log(text.replace('potente', 'flessibile'));
  console.log('a-b-c'.split('-'));    // ['a','b','c']
  console.log(['a', 'b'].join(', '));  // 'a, b'
  console.log('ciao'.repeat(2));      // 'ciaociao'
  console.log('file.js'.endsWith('.js'));
  console.log('ciao'.at(-1));         // 'o'
  console.log('a'.localeCompare('b')); // negativo, non necessariamente -1
  console.log('JavaScript'.charAt(0));         // 'J'
  console.log('JavaScript'.charCodeAt(0));     // 74 (unita' UTF-16)
  console.log('banana'.lastIndexOf('a'));      // 5
  console.log('JavaScript'.substring(0, 4));  // 'Java' (senza indici negativi)
  console.log('Java'.concat('Script'));       // 'JavaScript' (spesso usa +)
  console.log('ab12'.search(/\d/));          // 2 (regex)
  console.log('ab12'.match(/\d+/));          // primo match + metadati
  // length e gli indici misurano unita' UTF-16, non sempre caratteri visivi.
  console.log('😀'.length, [...'😀'].length); // 2, 1 code point
  // Escape: '\n' nuova linea, '\t' tab, '\\' backslash.
})();
