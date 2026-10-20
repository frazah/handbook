'use strict';
// JAVASCRIPT HANDBOOK 06.1 — Error, try/catch/finally, custom errors
// Fonte: https://javascript.info/error-handling
(() => {
  function readAge(json) {
    // JSON.parse puo' lanciare SyntaxError.
    let result;
    try {
      result = JSON.parse(json);
      if (!Number.isInteger(result.age) || result.age < 0) {
        throw new RangeError('age deve essere un intero >= 0');
      }
      return result.age;
    } catch (error) {
      // Gestire SOLO gli errori che sappiamo trattare; altrimenti rilanciare.
      if (error instanceof SyntaxError) return null;
      throw error;
    } finally {
      // eseguito sia in successo sia in errore (anche con return)
      console.log('parse terminato');
    }
  }
  console.log(readAge('{"age":28}'), readAge('{json errato'));
  try { readAge('{"age":-1}'); } catch (e) {
    console.log(e.name, e.message);
  }

  class ValidationError extends Error {
    constructor(field, message) {
      super(message);
      this.name = 'ValidationError';
      this.field = field;
    }
  }
  try { throw new ValidationError('email', 'Email non valida'); }
  catch (e) { if (e instanceof ValidationError) console.log(e.field); }
  // Un catch SINCRONO non intercetta errori lanciati in callback timer:
  // gestirli dentro la callback; per promise usare .catch o try/await.
})();
