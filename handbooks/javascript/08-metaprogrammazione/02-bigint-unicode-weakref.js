'use strict';
// JAVASCRIPT HANDBOOK 08.2 — BigInt, Unicode, WeakRef (argomenti extra)
// Fonte: https://javascript.info/bigint
(() => {
  const value = 999999999999999999999n;
  console.log(value + 1n, value ** 2n);
  console.log(5n / 2n); // 2n (troncamento)
  // JSON.stringify({ value }) fallisce con BigInt: serializza come stringa.
  console.log(JSON.stringify({ value: String(value) }));
  // Number(veryBigInt) puo' perdere precisione.

  // Unicode: JS usa UTF-16 internamente; code point vs code unit.
  const emoji = '😀';
  console.log(emoji.length, emoji.codePointAt(0)); // 2, 128512
  console.log(String.fromCodePoint(128512));
  console.log([...emoji]); // un code point, ma non sempre un grapheme
  console.log('é'.normalize('NFC') === 'e\u0301'.normalize('NFC'));

  // WeakRef NON e' un meccanismo per la logica applicativa essenziale:
  // il GC e' non deterministico e il referente puo' sparire in seguito.
  const obj = { id: 1 };
  const weak = new WeakRef(obj);
  console.log(weak.deref()?.id); // 1 finche' l'oggetto e' raggiungibile
  // FinalizationRegistry: notifiche di finalizzazione NON garantite/ne' puntuali.
})();
