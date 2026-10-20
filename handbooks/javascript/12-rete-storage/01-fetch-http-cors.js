'use strict';
// JAVASCRIPT HANDBOOK 12.1 — fetch, HTTP, JSON, URL, upload, CORS
// Fonte: https://javascript.info/network
// GUIDA ALLA LETTURA — prima di eseguire gli esempi:
// - fetch restituisce una Promise<Response> anche per risposte HTTP 404/500.
// - CORS è un controllo del browser, non un sostituto dei permessi lato server.

(async () => {
  // fetch(url, options) -> Promise<Response> (API disponibile anche in Node 18+).
  // Scegli metodo, body, header Content-Type secondo il formato del server.
  const url = new URL('https://example.com/search');
  url.searchParams.set('q', 'JavaScript tutorial');
  console.log(url.searchParams.get('q')); // codifica URL gestita automaticamente
  // FUNZIONE RIUTILIZZABILE — eseguila con un endpoint vero:
  async function fetchJSON(endpoint, { signal } = {}) {

    // await sospende la funzione in attesa HTTP; controlla anche response.ok.
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' }, signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json(); // Promise: il corpo viene consumato una volta
  }
  console.log(typeof fetchJSON);

  // Esempio (non eseguito offline):
  // const users = await fetchJSON('/api/users');
  // await fetch('/api/users', {
  //   method:'POST', headers:{'Content-Type':'application/json'},
  //   body: JSON.stringify({ name:'Ada' })
  // });
  // FormData: invialo come body SENZA impostare manualmente Content-Type
  // (il browser aggiunge il boundary multipart corretto).

  // Download progress: Response.body.getReader() legge chunk Uint8Array;
  // per percentuale servirebbe Content-Length (non sempre disponibile).
  const controller = new AbortController();
  controller.abort(); // la richiesta seguente sarebbe annullata
  console.log(controller.signal.aborted); // true
  // CORS: il SERVER autorizza l'origine con header Access-Control-...;
  // non e' una limitazione aggirabile dal client, 'no-cors' non risolve.
  // Sicurezza: non inserire segreti/API key private nel codice frontend.
})();
