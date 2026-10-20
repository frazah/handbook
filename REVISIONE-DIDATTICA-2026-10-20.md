# Revisione didattica — 20 ottobre 2026

## Principi

- Formato spiegato prima delle abbreviazioni.
- Esempi multilinea e commenti contestuali sui costrutti complessi.
- Argomenti distinti in sezioni riconoscibili.
- Note di cautela vicino ai relativi esempi.
- Schede rapide con sintassi realistica, non soltanto definizioni.

## Materiale integrato

- 9 handbook, 172 schede, 2 Recipes, lettore HTML offline e build GitHub Pages.
- Lezioni introduttive sulla lettura della sintassi in tutti e nove i percorsi.
- React e TypeScript: incluse le revisioni già concordate (props, callback, generics, JSX).
- JavaScript: guida alla sintassi, cheatsheet ampliata, commenti di orientamento nei file eseguibili.
- Python, FastAPI, SQL, Data Science, AI Agents e Bioinformatica: capitoli con indicazioni mirate, nuove sintesi e cheatsheet ampliate.
- Riscritti in profondità esempi impegnativi su parametri Python, FastAPI Depends, JOIN SQL, pandas `.loc` e tool calling.

## Esito dei controlli

- Lettore generato con `python3 AGGIORNA-HUB.py`: 172 schede / 9 handbook / 2 Recipes.
- Controllo sintattico su 40 file JavaScript (`node --check`): superato.
- Parsing di 97 blocchi Python in Markdown: superato.
- Suite di test locali dei laboratori (Python, FastAPI, Data Science, AI Agents): 10 test superati.

## Limiti

I controlli di sintassi non dimostrano che ogni snippet sia autonomo o eseguibile senza dipendenze.
Alcuni esempi richiedono dataset, pacchetti, browser, DB o chiavi API come indicato nelle rispettive sezioni.
Non sono stati eseguiti tutti gli esempi end-to-end e non va considerata una revisione scientifica/clinica certificata della parte bioinformatica.
