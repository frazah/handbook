'use strict';
// JAVASCRIPT HANDBOOK 12.2 — WebSocket, SSE, long polling, XHR
// Fonte: https://javascript.info/websocket
(() => {
  if (typeof window === 'undefined') return;
  // WebSocket: connessione bidirezionale persistente, ws:// o wss://.
  function openSocket(url) {
    const ws = new WebSocket(url);

    // Il listener reagisce a un evento senza eseguire subito la callback.
    ws.addEventListener('open', () => ws.send(JSON.stringify({ type: 'hello' })));
    ws.addEventListener('message', event => console.log(event.data));
    ws.addEventListener('error', () => console.error('errore WebSocket'));
    ws.addEventListener('close', () => console.log('WebSocket chiuso'));
    return ws;
  }
  // const ws = openSocket('wss://example.com/ws'); // demo, non chiamare
  console.log(typeof openSocket);

  // Server-Sent Events (EventSource): flusso SERVER -> CLIENT su HTTP,
  // riconnessione automatica e formato text/event-stream.
  // const events = new EventSource('/updates');
  // events.onmessage = e => console.log(e.data); events.close();

  // Long polling: GET che resta aperta finche' ci sono aggiornamenti,
  // poi richiedi di nuovo; gestisci stop, timeout, backoff e errori.

  // XMLHttpRequest: API piu' vecchia; fetch spesso preferibile.
  // XHR puo' servire per progresso UPLOAD (xhr.upload.onprogress).
  // Upload riprendibile: protocollo sul server (chunk, offset, ID);
  // non basta dividere i File lato client.
})();
