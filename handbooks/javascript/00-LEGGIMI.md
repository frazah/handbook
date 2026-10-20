# JavaScript Handbook — guida rapida per studiare e ripassare

**Lingua:** teoria/commenti in italiano, nomi delle API e codice in JavaScript.
**Livello:** dalle basi ai concetti avanzati, fino a DOM, rete, storage e regex.
**Ispirazione e ordine del programma:** [javascript.info](https://javascript.info/) (riscrittura originale e sintetica, **non** copia del corso).

## Parti da qui

1. **Apri `CONSULTA-HANDBOOK.html`** con Firefox/Chrome per cercare un argomento per parola chiave, anche offline.
2. **Apri `00-CHEATSHEET.md`** per un ripasso in 2 minuti di sintassi/API e differenze.
3. **Apri questa cartella in VS Code**: i file `.js` sono appunti eseguibili e indipendenti.
4. **Segui i capitoli nell'ordine numerico**. Il **primo argomento NUOVO** dopo i tuoi appunti è `04-funzioni-avanzate/01-ricorsione-scope-closure.js`.
5. **Prova gli esercizi** in `esercizi/ESERCIZI.md` e controlla le soluzioni solo dopo.

## Organizzazione

| Cartella | Argomento | Stato rispetto ai tuoi appunti |
|---|---|---|
| `01-fondamenti/` | sintassi, tipi, condizioni, funzioni, qualità | **revisionato** dai tuoi `1-basics.js` |
| `02-oggetti/` | proprietà, riferimenti, `this`, costruttori | **revisionato** dai tuoi `2-objects.js` |
| `03-tipi-di-dato/` | stringhe, number, array, Map/Set, Date, JSON | **revisionato** dai tuoi `3-data.js` |
| `04-funzioni-avanzate/` | recursion, closure, rest/spread, `bind`, timer | **NUOVO** — riparti da qui |
| `05-proprieta-prototipi-classi/` | descriptors, getters, prototypes, classi | nuovo |
| `06-errori-asincronia/` | `try/catch`, Promise, async/await | nuovo |
| `07-generatori-moduli/` | generator, async iterator, ES modules | nuovo |
| `08-metaprogrammazione/` | Proxy, Reflect, currying, eval, BigInt | nuovo |
| `09-dom/` | DOM, selettori, modifica pagina, dimensioni | nuovo — browser |
| `10-eventi-e-form/` | event delegation, pointer/tastiera, form | nuovo — browser |
| `11-browser-runtime/` | caricamento, event loop, frame e window | nuovo — browser |
| `12-rete-storage/` | Fetch, WebSocket, SSE, localStorage, IndexedDB | nuovo — browser/API |
| `13-file-componenti-animazioni/` | binari, File/Blob, animazioni, Web Components | nuovo — approfondimenti |
| `14-regex/` | regular expressions base e avanzate | nuovo — approfondimenti |
| `esempi-browser/` | mini pagina HTML interattiva | laboratorio |
| `esercizi/` | pratica guidata con soluzioni | laboratorio |

## Come eseguire i file

**Nel terminale VS Code** (Node.js installato):

```bash
node 01-fondamenti/01-sintassi-variabili-tipi.js
node 03-tipi-di-dato/02-array-e-metodi.js
node 04-funzioni-avanzate/01-ricorsione-scope-closure.js
node 07-generatori-moduli/02-moduli-ESM.mjs
```

I file sul DOM funzionano **nel browser** perché Node di norma non offre `window`/`document`.  
Apri `esempi-browser/demo.html`: include e attiva alcuni capitoli browser come piccoli laboratori.  
Gli altri esempi DOM sono progettati per essere caricati con `defer` o come moduli all'interno di una pagina.

**Per i moduli nel browser:** apri la cartella con un server locale (ad es. `python3 -m http.server 8000`) e poi vai su `http://localhost:8000/`.  
Il semplice `file://` non permette sempre import tra file.  
Il lettore offline `CONSULTA-HANDBOOK.html` invece si apre direttamente, senza server.

## Come leggere un capitolo

- **Idea/teoria:** i commenti chiariscono i concetti e il motivo del loro utilizzo.
- **Esempio:** codice funzionante e output atteso commentato, quando utile.
- **Attenzione:** segnala coercioni, mutazioni, riferimenti, asincronia e limiti browser.
- **Approfondimento:** link alla sezione corrispondente di javascript.info nell'intestazione di ogni file.

## Correzioni principali ai tuoi appunti originali

- Eliminata la duplicazione di blocchi sulle funzioni, sulle stringhe e sui numeri.
- Risolta la ridichiarazione `let str2` presente in `3-data.js` e isolate le variabili tra file.
- Rimosso `prompt()` eseguito automaticamente, che bloccava il file.
- `&&` e `||` restituiscono **operandi**, non necessariamente booleani.
- `this` su funzione sganciata, in strict mode, vale `undefined` e puo' causare `TypeError`.
- `Object.assign` e spread clonano superficialmente; JSON **non** e' un clone profondo affidabile.
- `sort()` predefinito e' lessicografico; con numeri usa `(a, b) => a - b`.
- `Date.getMonth()` va da **0 a 11**; `toFixed()` restituisce una stringa.
- Introdotti i moduli come alternativa allo scope globale e separate le API browser dal linguaggio JS.

## Perimetro e limiti

Questa e' una **guida sintetica per consultazione**: copre le sezioni principali delle tre parti di javascript.info, ma non sostituisce ogni articolo/esercizio dettagliato del sito.  
Gli approfondimenti specialistici (come upload riprendibili, Shadow DOM complesso, protocolli e attacchi di sicurezza) sono introdotti con esempi essenziali, non implementazioni production-ready.  
Le API dipendono dalla versione del browser/Node e possono richiedere HTTPS o permessi.

## Fonti utili

- [javascript.info — indice](https://javascript.info/)
- [MDN JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)
- [ECMAScript specification](https://tc39.es/ecma262/)

Ultima revisione del programma: ottobre 2026.
