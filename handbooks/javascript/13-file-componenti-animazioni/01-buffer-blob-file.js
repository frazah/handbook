'use strict';
// JAVASCRIPT HANDBOOK 13.1 — ArrayBuffer, TypedArray, TextEncoder, Blob, File
// Fonte: https://javascript.info/binary
// GUIDA ALLA LETTURA — prima di eseguire gli esempi:
// - ArrayBuffer è memoria binaria grezza; TypedArray fornisce una vista interpretata.
// - Blob e File rappresentano contenuti, non aprono automaticamente file locali.

(() => {
  // ArrayBuffer = memoria binaria grezza; TypedArray e DataView la leggono.
  const buffer = new ArrayBuffer(4);
  const bytes = new Uint8Array(buffer); // 4 byte condivisi col buffer
  bytes[0] = 255;
  const view = new DataView(buffer);
  view.setUint16(1, 500, true); // little endian
  console.log(bytes, view.getUint16(1, true)); // 500

  // Testo <-> UTF-8:
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const encoded = encoder.encode('Città');
  console.log(encoded, decoder.decode(encoded));

  // Blob: bytes + MIME type; File estende Blob con nome/metadati.
  const blob = new Blob(['ciao JS'], { type: 'text/plain' });
  console.log(blob.size, blob.type);
  // Browser: const url = URL.createObjectURL(blob);
  // poi <a download href=url>; URL.revokeObjectURL(url) quando non serve.
  // Browser file input: input.files[0] e' un File;
  // await file.text(), await file.arrayBuffer(); FileReader per legacy/eventi.
})();
