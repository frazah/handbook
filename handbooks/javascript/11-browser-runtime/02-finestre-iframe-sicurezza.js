'use strict';
// JAVASCRIPT HANDBOOK 11.2 — Window, iframe, postMessage, sicurezza
// Fonte: https://javascript.info/cross-window-communication
// GUIDA ALLA LETTURA — prima di eseguire gli esempi:
// - postMessage è usato per comunicazioni tra finestre/iframe di origini diverse.
// - Verifica sempre event.origin e il destinatario: * non è adatto a dati sensibili.

(() => {
  if (typeof window === 'undefined') return;
  // window.open(url, '_blank', 'noopener,noreferrer') puo' essere bloccato
  // se non avviene in risposta a un'interazione esplicita dell'utente.
  // window.close() e' limitato nelle normali schede non aperte da script.
  // window.location.href = '/path'; // naviga
  // history.pushState(state, '', '/path'); // cambia URL senza refresh
  // popstate segnala la navigazione nella storia della sessione.

  // Same-Origin Policy: schema + host + porta devono coincidere per leggere
  // il DOM di un'altra finestra; CORS riguarda richieste HTTP cross-origin.

  // Il listener reagisce a un evento senza eseguire subito la callback.
  window.addEventListener('message', (event) => {
    // In PRODUZIONE verifica sempre event.origin e idealmente event.source.
    if (event.origin !== window.location.origin) return;
    if (event.data?.type !== 'handbook:ping') return;
    console.log('messaggio verificato:', event.data);
  });
  // iframe.contentWindow.postMessage({type:'handbook:ping'}, 'https://example.com');
  // Usa targetOrigin specifico; '*' solo per casi attentamente valutati.
  // Difesa clickjacking: CSP frame-ancestors; dove necessario X-Frame-Options.
  // Per iframe non fidati: attributo sandbox + permessi minimi.
})();
