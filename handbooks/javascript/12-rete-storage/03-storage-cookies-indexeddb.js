'use strict';
// JAVASCRIPT HANDBOOK 12.3 — localStorage, sessionStorage, cookie, IndexedDB
// Fonte: https://javascript.info/data-storage
// GUIDA ALLA LETTURA — prima di eseguire gli esempi:
// - localStorage e sessionStorage conservano stringhe; IndexedDB archivia dati strutturati.
// - Non conservare credenziali sensibili nel browser confidando nel solo storage.

(() => {
  if (typeof window === 'undefined') return;
  // Web Storage e' sincrono, memorizza solo STRINGHE.
  try {
    // localStorage conserva stringhe nel browser; non è un vault per segreti.
    localStorage.setItem('handbook:theme', 'dark');
    console.log(localStorage.getItem('handbook:theme'));
    localStorage.removeItem('handbook:theme');
    sessionStorage.setItem('handbook:tab', '1');
    sessionStorage.removeItem('handbook:tab');
  } catch (error) {
    console.log('Storage non disponibile:', error.name); // privacy/file://
  }
  // JSON: JSON.stringify prima di salvare, JSON.parse in lettura.
  // localStorage persiste (a meno di policy/rimozione), sessionStorage
  // e' legato alla sessione della tab. Non salvare segreti in JS accessibile!
  // Event 'storage': generalmente arriva nelle ALTRE tab della stessa origin.

  // COOKIE: document.cookie permette lettura/scrittura dei NON HttpOnly.
  // document.cookie = 'lang=it; Path=/; SameSite=Lax; Secure'; // HTTPS
  // Cookie HttpOnly e' impostato dal server; inaccessibile da JS.
  // Per autenticazione: considerare HttpOnly, Secure, SameSite, CSRF.

  // IndexedDB: DB transazionale asincrono, adatto a molti dati strutturati.
  // Piccola apertura demo SOLO se indicata la chiave UI specifica:

  // querySelector cerca il primo elemento che corrisponde al selettore CSS.
  if (!document.querySelector('[data-handbook-db-demo]')) return;
  const request = indexedDB.open('handbook-demo', 1);
  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains('notes')) {
      db.createObjectStore('notes', { keyPath: 'id' });
    }
  };
  request.onsuccess = () => {
    const db = request.result;
    const tx = db.transaction('notes', 'readwrite');
    tx.objectStore('notes').put({ id: 1, title: 'Studiare JS' });
    tx.oncomplete = () => db.close();
  };
  request.onerror = () => console.error(request.error);
})();
