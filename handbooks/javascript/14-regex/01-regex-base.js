'use strict';
// JAVASCRIPT HANDBOOK 14.1 — Regex: pattern, classi, ancore, quantificatori
// Fonte: https://javascript.info/regular-expressions
(() => {
  // /pattern/flags oppure new RegExp(string, flags).
  const emailLike = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  console.log(emailLike.test('a@example.com')); // true
  // Una REGEX da sola non garantisce convalida email completa!

  // FLAG: i globale, m multiline (^/$ per riga), s '.' include newline,
  // u Unicode codepoints, y sticky, d indici, g globale.
  const text = 'JS 2025, Python 2026';
  console.log(text.match(/\d+/g)); // ['2025','2026']
  // Metacaratteri: . un carattere; \d cifra; \w lettera ASCII/cifra/_;
  // \s whitespace; [abc] classe; [^abc] negazione; \b confine di parola.
  console.log(/\bcat\b/.test('a cat!'));
  // Ancore: ^ inizio, $ fine; con m inizio/fine di ciascuna riga.
  console.log(/^abc$/.test('abc'));

  // Quantificatori: * 0+, + 1+, ? 0/1, {n}, {min,max}.
  console.log('aaa'.match(/a{2,3}/)); // 'aaa'
  // Greedy (avido) vs lazy (non avido): .* vs .*?
  console.log('<b>x</b><i>y</i>'.match(/<.*?>/g)); // ['<b>','</b>',...]
  // Caratteri speciali letterali vanno escaped: \. per un punto.
  // new RegExp('\\d+') richiede il doppio backslash nella stringa JS.
  const fromString = new RegExp('\\d+');
  console.log(fromString.test('x42'));
})();
