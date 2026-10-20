'use strict';
// JAVASCRIPT HANDBOOK 06.3 — async/await, errori, parallelismo, abort
// Fonte: https://javascript.info/async-await
(async () => {
  // async f() restituisce SEMPRE una Promise (anche se torna un numero).
  async function getAnswer() { return 42; }
  console.log(await getAnswer());

  // await sospende QUESTA funzione async, non blocca tutto JavaScript.

  // Promise rappresenta un risultato che arriverà più tardi.
  const delay = (ms, value) => new Promise(resolve =>
    setTimeout(() => resolve(value), ms));
  const a = delay(5, 'A');
  const b = delay(5, 'B'); // entrambi avviati prima di await -> concorrenti
  console.log(await Promise.all([a, b]));

  // Catch per operazioni asincrone:
  async function loadProfile() {
    try {
      const value = await Promise.resolve({ name: 'Ada' });
      return value.name;
    } catch (error) {
      console.error('Errore gestito:', error);
      throw error; // eventualmente rilancia
    }
  }
  console.log(await loadProfile());

  // fetch + HTTP: un 404 di norma NON rigetta fetch; controlla response.ok.
  // const response = await fetch('/api/users');
  // if (!response.ok) throw new Error(`HTTP ${response.status}`);
  // const users = await response.json();

  // AbortController consente cancellazione *cooperativa* con API compatibili.
  // const ctrl = new AbortController();
  // fetch('/api/slow', { signal: ctrl.signal }); ctrl.abort();
  // Sequenziale: await primo; await secondo.
  // Concorrente: const p1 = task1(); const p2 = task2(); await Promise.all([...]).
})().catch(console.error);
