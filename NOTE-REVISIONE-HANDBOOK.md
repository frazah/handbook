# Aggiornamento editoriale dei 9 handbook — ottobre 2026

Contenuti inclusi: soltanto `handbooks/` (non sostituisce interfaccia, recipes, configurazione o generatore).

## Cambiamenti

- Cheatsheet più ricche di sintassi, tabelle e mini esempi indipendenti.
- TypeScript: revisione dedicata di `<T>`, `keyof`, `T[K]`, `Record`, `Partial`, `Pick`, `Omit`, Union, `unknown`, React e import.
- Teoria di supporto **prima** del codice quando introduce simboli che potrebbero essere nuovi.
- Più commenti esplicativi **dentro** gli esempi.
- Più spazio fra sezioni e frasi, con note e avvertimenti vicini ai relativi blocchi.
- Non vengono aggiunti nuovi handbook o recipes: sono sempre 9 handbook e 2 recipes (se li avevi già).
- La cartella bioinformatics-ai è inclusa integralmente per sicurezza, nel caso non fosse ancora stata aggiunta al repository.

## Come applicare (copia file)

1. Nella cartella del repository, controlla `git status` e fai commit delle tue modifiche locali se presenti.
2. Estrai lo ZIP **nella radice del repository**: contiene una cartella `handbooks/` con le sottocartelle necessarie.
3. In VS Code, confronta i file in Source Control prima del commit: ciò che è stato cambiato nella stessa sezione localmente può essere sovrascritto.
4. Esegui `python3 AGGIORNA-HUB.py` (oppure `python`, se così è configurato il tuo ambiente) (richiede `markdown-it-py` e `pygments`), quindi apri `APRI-HANDBOOK.html`.
5. Esegui `git diff --stat`, leggi le modifiche, poi `git add handbooks && git commit -m "Improve handbook readability" && git push`.

## Alternativa Git (per non sovrascrivere in silenzio)

Usa invece `dev-hub-revisione-handbook.patch` dalla radice del repo:

```bash
git apply --check dev-hub-revisione-handbook.patch
git apply --whitespace=nowarn dev-hub-revisione-handbook.patch
python3 AGGIORNA-HUB.py
```

Il patch può rifiutarsi di applicarsi se nel frattempo hai modificato le stesse righe: è preferibile a sovrascrivere le tue aggiunte senza avviso.

## Verifiche effettuate

- 9 file `book.json` verificati.
- Sintassi di 67 esempi Python Markdown verificata, 5 test bioinformatics-ai superati.
- Sintassi dei `.js` e `.mjs` JavaScript verificata con Node.js.
- Compilazione TypeScript dei principali esempi (incluse utility types e moduli multi-file) verificata con `tsc --strict --noEmit`.
- Indice HTML offline rigenerato: 163 schede, 9 handbook, 2 recipes.

**Limiti:** i frammenti illustrativi e i laboratori che richiedono React, FastAPI, scikit-learn, cloud e SDK esterni non sono stati tutti eseguiti in runtime con le relative dipendenze; sono stati controllati sintatticamente ove possibile. I blocchi etichettati pseudocodice non sono eseguibili.
