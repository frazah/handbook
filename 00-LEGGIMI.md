# Dev Handbook Hub — Start qui

Un **lettore centrale offline**, ora pronto per Git e GitHub Pages, con 9 tecnologie: JavaScript, TypeScript, React, Python, FastAPI, SQL, Data Science & Analysis, AI Agents e Bioinformatica/AI & Biosecurity.

## Apri e consulta

1. Apri `APRI-HANDBOOK.html` nel browser: funziona senza server, account o internet.
2. Scegli una tecnologia nella home. Usa `/` oppure `⌘K`/`Ctrl+K` per cercare nei **titoli e nel codice** di tutti i capitoli.
3. Premi **☆** sui concetti frequenti e **✓ Studiato** per tenere traccia del ripasso: la memorizzazione avviene nel browser locale, se disponibile.
4. Premi **Apri file sorgente** oppure apri l’intera cartella in VS Code. Le nuove lezioni sono `.md`: `Cmd+Shift+V` (macOS) o `Ctrl+Shift+V` (Windows/Linux) apre l’anteprima Markdown con codice evidenziato.
5. Prova gli esempi nella cartella `esempi/`: ogni laboratorio ha un `LEGGIMI.md`.

## Modifica gli appunti e aggiorna il lettore

Puoi modificare i `.md`, `.js` e `.mjs` direttamente in VS Code. Il lettore HTML incorpora **una fotografia** dei file: per vedere le modifiche anche nell'interfaccia centralizzata, rigeneralo così (serve Python e, **solo per la rigenerazione**, due pacchetti):

```bash
python3 -m venv .venv
source .venv/bin/activate  # macOS/Linux; su Windows usa .venv\Scripts\activate
python -m pip install markdown-it-py pygments
python AGGIORNA-HUB.py
```

Il programma ricostruisce `APRI-HANDBOOK.html` dai file correnti senza internet. Se crei una nuova lezione `.md` sotto `handbooks/<tecnologia>/`, viene inclusa automaticamente. Per aggiungere un nuovo handbook è sufficiente una cartella con `book.json` e i file `.md`. Per definire livello e sommario nel file, usa i commenti `<!-- level: Basi -->` e `<!-- summary: Spiegazione sintetica -->`. Consulta `CONTRIBUIRE.md`. **Il lettore già generato non richiede Python né queste dipendenze.**

## Come sono organizzati i contenuti

| Tecnologia | Materiali | Formato |
|---|---|---|
| JavaScript | 41 capitoli/schede | .js/.mjs + .md |
| TypeScript | 11 capitoli/schede | .md con blocchi di codice colorati |
| React | 11 capitoli/schede | .md con blocchi di codice colorati |
| Python | 12 capitoli/schede | .md con blocchi di codice colorati |
| FastAPI | 12 capitoli/schede | .md con blocchi di codice colorati |
| SQL | 12 capitoli/schede | .md con blocchi di codice colorati |
| Data Science & Analysis | 18 capitoli/schede | .md + laboratorio pandas |
| AI Agents | 19 capitoli/schede | .md + laboratorio offline/SDK opzionale |
| Bioinformatica, AI & Biosecurity | 36 capitoli/schede | .md + due mini laboratori Python |

## Percorso consigliato

**Frontend:** JavaScript → TypeScript → React. **Backend:** Python → SQL → FastAPI. **Data Science:** Python → SQL → Data Science & Analysis. **AI Agents:** Python → API/FastAPI → AI Agents. **Bioinformatica:** biologia da zero → dati biologici → analisi → prevenzione e biosicurezza. **Full stack:** React + TypeScript con FastAPI + DB SQL.

Le lezioni `00a-come-leggere` anticipano la sintassi nuova e le convenzioni didattiche sono in `CONVENZIONI-DIDATTICHE.md`. I contenuti mirano a spiegare **perché, quando e come** usare un concetto, con esempi brevi di ordini, task, form, report e CRUD.

## Attenzione sulla esecuzione

- Il lettore `APRI-HANDBOOK.html` si apre direttamente offline; **non esegue** codice React/TS/Python/SQL.
- Il codice negli articoli è didattico: alcuni blocchi sono porzioni di progetti, non programmi da eseguire da soli.
- Gli esempi nella cartella `esempi/` sono pensati per essere eseguibili; TypeScript/React e FastAPI richiedono tool o dipendenze indicate nei rispettivi README.
- Le query SQL usano SQLite per gli esercizi: PostgreSQL e altri DBMS hanno differenze sintattiche/importanti.
- Gli esempi che usano rete o DB devono essere configurati e validati per la produzione (autorizzazione, migrazioni, segreti, transazioni).

## Fonti di riferimento ufficiali

- [JavaScript](https://javascript.info/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [React](https://react.dev/learn)
- [Python](https://docs.python.org/3/tutorial/)
- [FastAPI](https://fastapi.tiangolo.com/tutorial/)
- [SQL](https://www.postgresql.org/docs/current/tutorial-sql.html)
- [Pandas](https://pandas.pydata.org/docs/getting_started/intro_tutorials/) / [NumPy](https://numpy.org/doc/stable/user/absolute_beginners.html) / [scikit-learn](https://scikit-learn.org/stable/getting_started.html)
- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/) / [MCP](https://modelcontextprotocol.io/introduction)
- [EMBL-EBI Bioinformatics Training](https://www.ebi.ac.uk/training/)

**Versione didattica completa:** 20 ottobre 2026 · 172 schede, 9 handbook, 2 Recipes. Le spiegazioni sono originali e sintetiche; non sostituiscono la documentazione ufficiale completa.

## Aggiornamenti Git senza ZIP

Leggi [README.md](README.md) e [CONTRIBUIRE.md](CONTRIBUIRE.md): ora ogni handbook è modulare e il sito può essere rigenerato da GitHub Actions a ogni push.

## Navigazione per aree + recipes

La home ora raggruppa automaticamente i nove handbook esistenti nelle aree **Linguaggi & Fondamenti**, **Web & Mobile Development** e **Data & Artificial Intelligence**. Le aree **Developer Tools & Engineering** e **Design & Specializations** appariranno solo se aggiungerai nuovi manuali: non ci sono capitoli fittizi.

La sezione **Recipes** contiene due guide trasversali: *React + FastAPI: lista task con API* e *CSV → pandas → SQL: report vendite*. Le recipes sono file Markdown normali dentro `recipes/`, consultabili anche con la ricerca, i preferiti e i progressi. Aggiungerne una è indipendente dall'aggiungere un handbook; guarda `recipes/README.md`.
