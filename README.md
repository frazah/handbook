# Dev Cheatsheets

**11 tecnologie, 11 schede Markdown e 2 Recipes.** Appunti da aprire mentre programmi o prepari colloqui: sintassi fondamentale, concetti distintivi, codice vicino a casi reali e note sui meccanismi interni. Niente piattaforma, generatore, server o indice con centinaia di capitoli.

## Regole editoriali

- **Essenziale, ma completo:** includere le caratteristiche che servono davvero nei progetti e nei colloqui, senza trasformare ogni scheda in un manuale.
- **Codice realistico:** preferire casi applicativi plausibili; indicare quando uno snippet è illustrativo o richiede un progetto, dati o servizi esterni.
- **Leggibilità prima della brevità:** formattare su più righe il codice complesso e commentare soltanto sintassi nuova o scelte non ovvie.
- **Spiegazioni al momento giusto:** introdurre i termini prima di usarli; chiarire subito limiti ed errori comuni, accanto all'esempio.
- **Niente ripetizioni:** usare pochi titoli distintivi e rimandare a documentazione autorevole per approfondimenti particolarmente tecnici.

## Scegli una tecnologia

| Languages | Web & Backend | Data & AI |
|---|---|---|
| [JavaScript](Languages/JavaScript.md) | [React + TypeScript](Web%20%26%20Backend/React.md) | [Data Science](Data%20%26%20AI/Data%20Science.md) |
| [TypeScript](Languages/TypeScript.md) | [Vue 3 + TypeScript](Web%20%26%20Backend/Vue.md) | [AI Agents](Data%20%26%20AI/AI%20Agents.md) |
| [Python](Languages/Python.md) | [FastAPI](Web%20%26%20Backend/FastAPI.md) | [Bioinformatica](Data%20%26%20AI/Bioinformatics.md) |
| [SQL](Languages/SQL.md) | | |
| [Elixir](Languages/Elixir.md) | | |

**Da aprire per un progetto:** [React + FastAPI — Task manager](Recipes/React%20%2B%20FastAPI.md) · [pandas + SQLite — report vendite](Recipes/pandas%20%2B%20SQL.md).

## Novità di questa revisione

- **Vue 3:** SFC, `script setup`, `ref`, `computed`, `watch`, `v-model`, props, emits, eventi, API, Vue Router e Pinia.
- **SQL:** ottimizzazione query con uno stesso schema ordini, `EXPLAIN QUERY PLAN`, indici compositi, filtri per range e keyset pagination; differenze pratiche SQLite/PostgreSQL.
- **JavaScript / TypeScript:** event loop, error handling, prototipi, `Map`/`Set`, discriminated unions ed esaustività.
- **Python / Elixir:** risorse, test, async e concorrenza; control flow, pin operator, typespec, messaggi e OTP.
- **React / FastAPI:** hook non introdotti prima, ciclo di rendering, router, protezione API interna e CORS.
- **Data Science / AI Agents / Bioinformatica:** NumPy, cross-validation, tool calling con API reale (opzionale), controlli di sicurezza, valutazione agenti e basi per pipeline riproducibili.

Le **due Recipes** restano pratiche e separate dalle schede. Ogni scheda ha pochi macro-argomenti; le spiegazioni approfondite sono inserite soltanto dove servono.

## Come usarle

- **VS Code:** apri la cartella e usa `Cmd+Shift+F` per cercare parole o sintassi. I file `.md` sono direttamente modificabili e versionabili con Git.
- **Notion:** importa la cartella Markdown oppure le pagine singole; verifica i link relativi dopo l'importazione. Notion e Git non si sincronizzano automaticamente.
- **Progetti:** parti dal codice, leggi i commenti sulle righe non banali e adatta i nomi al tuo dominio. **Non incollare tutti gli snippet consecutivamente nello stesso file**: molte sezioni sono esempi indipendenti, alcuni hanno import o variabili omonime.
- **Interview:** ripassa le domande in fondo e prova a spiegare un'alternativa, un errore frequente e un trade-off.

Un *esempio realistico* **non** equivale a un servizio pronto per la produzione: ambienti reali richiedono dati, dipendenze, autorizzazioni, logging appropriato, test, gestione dei segreti e talvolta persistenza/migrazioni. Gli utenti `.test`, i piccoli dataset e le sequenze biologiche sono fixture sintetiche.

## Verifiche e limiti

| Parte | Verifica eseguita |
|---|---|
| File Markdown | 14 file presenti, blocchi di codice e collegamenti relativi controllati |
| JavaScript | Blocchi JS analizzati da Node.js (`--check`) |
| TypeScript | 8 blocchi compilati insieme con `tsc --strict`; TS/TSX e script TS del Vue analizzati sintatticamente |
| Python, pandas, scikit-learn, AI Agents, Biopython | Esempi locali eseguiti con fixture; pipeline ML e CV eseguite. **La chiamata API remota opzionale non è stata eseguita** |
| SQL | Tutti i blocchi SQL eseguiti in sequenza su SQLite; inclusi indici e query plan |
| FastAPI, Recipes | Endpoint GET/POST e validazione verificati tramite `TestClient`, database SQLite temporaneo |
| React e Vue | Sintassi TS/TSX/script Vue verificata; **UI/template non testati in un browser o build Vue/Vite** |
| Elixir | Esempi confrontati con documentazione ufficiale; **non eseguiti** perché qui non è disponibile Elixir/BEAM |

I check di sintassi non dimostrano da soli che un progetto integri ogni componente. Per gli esempi con browser, servizi esterni o concorrenza occorrono ulteriori test in un ambiente applicativo.

