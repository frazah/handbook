# Handbook

Un manuale personale da tenere aperto **mentre programmi** (esercizi di coding, progetti) e da **ripassare prima di un colloquio**. Ogni scheda deve permetterti di:

1. **trovare in pochi secondi** la sintassi o il pattern che ti serve mentre scrivi codice;
2. **capire come funziona davvero** la tecnologia, abbastanza da spiegarla a voce a un intervistatore;
3. **vedere codice realistico**, commentato e introdotto, che puoi adattare al tuo problema.

## Indice

| Fundamentals | Languages | Web & Backend | Data & AI |
|---|---|---|---|
| [Big-O e strutture dati](Fundamentals/Big-O%20e%20strutture%20dati.md) | [Python](Languages/Python.md) | [FastAPI](Web%20%26%20Backend/FastAPI.md) | [Data Science](Data%20%26%20AI/Data%20Science.md) |
| [Pattern algoritmici](Fundamentals/Pattern%20algoritmici.md) | [JavaScript](Languages/JavaScript.md) | [React + TypeScript](Web%20%26%20Backend/React.md) | [AI Agents](Data%20%26%20AI/AI%20Agents.md) |
| [Web e HTTP](Fundamentals/Web%20e%20HTTP.md) | [TypeScript](Languages/TypeScript.md) | [Vue 3 + TypeScript](Web%20%26%20Backend/Vue.md) | [Bioinformatica](Data%20%26%20AI/Bioinformatics.md) |
| | [SQL](Languages/SQL.md) | | |
| | [Elixir](Languages/Elixir.md) | | |

**Recipes** (progetti completi): [Dashboard ordini — React + FastAPI](Recipes/React%20%2B%20FastAPI.md) · [Report vendite — pandas + SQL](Recipes/pandas%20%2B%20SQL.md)

## Regole editoriali

### Sintesi prima di tutto

- **Una scheda si scorre in pochi minuti.** Obiettivo 250–400 righe per scheda: è una reference, non un libro. Se un argomento richiede di più, tieni l'essenziale e metti un link in *Approfondisci*.
- **Codice corto.** Un blocco mostra *una* idea: idealmente ≤ 15 righe, mai oltre 25. Niente boilerplate (setup ripetuti, import ovvi, gestione errori non pertinente al punto).
- **Prosa asciutta.** Introduzioni di 1–2 frasi, spiegazioni in elenchi brevi o tabelle. Se una frase non aggiunge informazione, va tolta.

### Contenuto

- **Prima il perché, poi il codice.** Ogni sezione si apre con 1–3 frasi che spiegano il problema che risolve e quando ti serve. Un termine nuovo viene definito la prima volta che compare.
- **Modello mentale esplicito.** Ogni scheda spiega i meccanismi interni che un colloquio dà per scontati (event loop, GIL, reconciliation, BEAM, query planner…), in prosa, con le parole che useresti a voce.
- **Copertura da colloquio.** Se un argomento compare spesso nei colloqui su quella tecnologia, deve esserci. Se serve solo in casi di nicchia, basta un link in *Approfondisci*.
- **Errori comuni accanto al concetto.** Le trappole (mutabilità, `this`, closure nei loop, `LEFT JOIN` filtrato nel `WHERE`, leakage…) stanno nella sezione in cui nascono, non in un elenco separato.
- **Trade-off, non dogmi.** Quando esistono più soluzioni (thread vs async, `useEffect` vs data library, indice vs no), indica quando sceglieresti l'una o l'altra.

### Codice

- **Realistico.** Gli esempi risolvono problemi plausibili, preferibilmente nel *dominio comune* (sotto). Niente `foo`/`bar`, niente esempi da manuale scollegati da un uso reale.
- **Autonomo.** Ogni blocco contiene i propri import e dati, e si può copiare ed eseguire da solo. Se dipende dal blocco precedente lo dice nella prima riga (`# continua dall'esempio precedente`). Se richiede risorse esterne (API key, browser, servizio) lo dichiara: `// illustrativo: richiede …`.
- **Commentato con criterio.** I commenti spiegano il *perché* e le righe non ovvie, non parafrasano il codice. Dove aiuta, mostra l'output atteso con `# -> valore`.
- **Leggibile prima che breve.** Nomi espliciti, codice complesso su più righe, nessun one-liner "furbo" se esiste una forma più chiara.
- **Versioni moderne.** Python ≥ 3.10, JavaScript ES2022, TypeScript `strict`, React 18+ con function component, Vue 3 con `<script setup>`, FastAPI con Pydantic v2, Elixir ≥ 1.15, SQL standard verificato su SQLite con note PostgreSQL.

### Forma

- Prosa in italiano; identificatori del codice in inglese, commenti in italiano.
- Tabelle per il lookup rapido, prosa per i concetti, elenchi solo per sequenze o confronti brevi.
- Nessuna ripetizione tra schede: rimanda all'altra scheda con un link relativo.
- Link a documentazione autorevole (ufficiale quando possibile) per ciò che va oltre la scheda.

## Struttura di una scheda

Tutte le schede seguono lo stesso scheletro, così sai sempre dove cercare:

| Sezione | Contenuto |
|---|---|
| **Intestazione** | Una riga: cos'è e quando la usi. Prerequisiti e schede collegate. |
| **Modello mentale** | Come funziona dentro, in 5–10 punti. È la base delle risposte da colloquio. |
| **Sintassi al volo** | Tabelle di lookup per quando stai scrivendo codice. |
| **Argomenti** (H2 / H3) | Per ogni argomento: introduzione → codice commentato → errori comuni. Dal più usato al più avanzato. |
| **Per gli esercizi di coding** | *(linguaggi)* idiomi e strutture della libreria standard che servono negli esercizi algoritmici. |
| **Domande da colloquio** | 8–15 domande raggruppate per livello. Risposte di 1–3 frasi, con il trade-off chiave. |
| **Approfondisci** | Link a documentazione ufficiale e risorse autorevoli. |

Le **Recipes** sono progetti piccoli ma completi che combinano più schede: obiettivo, struttura dei file, codice integrale, come eseguirlo, come estenderlo e cosa raccontarne a un colloquio.

## Dominio comune

Per rendere gli esempi coesi, quando possibile usano lo stesso dominio: un **negozio online**.

| Entità | Campi tipici |
|---|---|
| `customers` | `id`, `email`, `name`, `created_at` |
| `products` | `id`, `sku`, `name`, `price_cents`, `stock` |
| `orders` | `id`, `customer_id`, `status` (`pending` / `paid` / `shipped` / `cancelled`), `total_cents`, `created_at` |
| `order_items` | `order_id`, `product_id`, `quantity`, `unit_price_cents` |

Gli importi sono **interi in centesimi** (mai float per il denaro). Email `@example.test`, date ISO 8601 in UTC. Le schede su temi diversi (algoritmi, bioinformatica) usano il dominio comune quando ha senso e dati sintetici altrimenti.

Un esempio realistico **non** è un servizio pronto per la produzione: in un ambiente reale servono anche autenticazione, logging, test, gestione dei segreti, migrazioni e monitoraggio. Le schede lo segnalano dove la differenza conta.

## Come usarlo

- **Mentre programmi:** apri la cartella in VS Code e cerca con `Cmd+Shift+F` (sintassi, nome di una funzione, nome di un pattern). La sezione *Sintassi al volo* è pensata per questo.
- **Esercizi di coding:** parti da [Pattern algoritmici](Fundamentals/Pattern%20algoritmici.md) per riconoscere il tipo di problema, poi usa la sezione *Per gli esercizi di coding* del linguaggio che stai usando.
- **Prima di un colloquio:** leggi *Modello mentale*, poi prova a rispondere alle *Domande da colloquio* a voce prima di leggere la risposta. Per ogni risposta prova a citare un'alternativa, un errore frequente e un trade-off.

## Verifiche

Ambiente di verifica: Python 3.9 (sola libreria standard) e SQLite 3.51. I blocchi marcati `illustrativo` richiedono dipendenze o servizi esterni e non sono stati eseguiti.

| Parte | Verifica |
|---|---|
| Big-O, Pattern algoritmici, Web e HTTP | Tutti i blocchi Python eseguiti, con `assert` |
| Python, AI Agents (agente locale e retrieval), Bioinformatica | Tutti i blocchi non illustrativi eseguiti |
| SQL, Recipe pandas + SQL | Tutte le query eseguite in sequenza su SQLite; risultati nei commenti confrontati con l'output reale |
| Data Science | Statistica (stdlib) eseguita; codice pandas, NumPy e scikit-learn **solo riletto** |
| FastAPI, Recipe React + FastAPI | Logica SQLite del backend eseguita; codice FastAPI, Pydantic e test **solo riletto** |
| JavaScript, TypeScript, React, Vue | **Solo riletto**: Node e `tsc` non disponibili |
| Elixir | **Solo riletto**: Elixir/BEAM non disponibile |
| Link | Tutti i link relativi e le ancore controllati automaticamente |

Prima di usare un blocco solo riletto in un progetto, eseguilo nel suo ambiente: la rilettura riduce gli errori ma non li esclude.
