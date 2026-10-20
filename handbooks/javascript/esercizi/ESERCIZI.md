# Esercizi progressivi (senza soluzioni in questa pagina)

Prova a risolverli con **funzioni pure**, senza copiare la risposta.  
Poi confronta il file `soluzioni.js`.

1. **Tipi**: `describeValue(value)` distingua `null`, array, `NaN` e gli altri tipi.
2. **Filtri**: `evenSquares(numbers)` restituisca i quadrati dei soli numeri pari, senza mutare l'array.
3. **Oggetti**: `fullName(user)` restituisca nome e cognome, usando valori di fallback se mancanti.
4. **Closure**: `makeCounter(initial)` restituisca `{ inc, dec, value }` con stato privato.
5. **Ricorsione**: `sumNested(array)` sommi numeri in array annidati di qualunque profondita' ragionevole.
6. **Map/Set**: `wordFrequency(words)` produca una Map parola -> frequenza.
7. **Date**: `sameInstant(a, b)` confronti Date tramite timestamp.
8. **Classi**: `BankAccount` abbia saldo privato, `deposit`, `withdraw`, e blocchi saldo negativo.
9. **Promise**: `wait(ms)` restituisca una Promise che si risolve dopo ms.
10.  
**Async**: `loadJSON(url)` verifichi `response.ok` e propaghi gli errori.
11.  
**Regex**: estrai tutte le parole precedute da `#` in una stringa.
12.  
**DOM**: nella demo browser, crea un pulsante che aggiunge un `<li>` alla lista e sfrutta event delegation.
13.  
**Form**: mostra in pagina il dato digitato, senza ricaricare.
14.  
**Moduli**: esporta una funzione da un file `.mjs` e importala in un altro.

**Test**: esegui `node esercizi/soluzioni.js`; gli assert finali controlleranno diverse funzioni (non gli esercizi DOM).  
Per esercizi DOM/moduli guarda anche `esempi-browser/demo.html` e `07-generatori-moduli/`.
