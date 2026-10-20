# Riparti da qui — copia completa del Dev Handbook Hub

Questa versione è uno **snapshot integrale** dell'Hub, già unito e rigenerato: non servono patch, aggiornamenti ZIP separati o fusioni manuali.

Contiene **9 handbook, 163 schede e 2 Recipes**, con le ultime revisioni didattiche a cheatsheet, esempi, commenti e leggibilità.

## Se hai fatto confusione con le cartelle

1. **Non cancellare il vecchio progetto.** Rinominalo per esempio `dev-handbook-hub-backup` oppure conservalo come copia di sicurezza.
2. Estrai questo ZIP in una nuova cartella e apri `dev-handbook-hub/APRI-HANDBOOK.html` nel browser per verificare che tutto funzioni.
3. Apri `dev-handbook-hub/` in VS Code. Puoi modificarlo e usarlo anche completamente offline.
4. Se avevi appunti modificati personalmente, confrontali con quelli nuovi e trasferisci **solo** le tue aggiunte: non sovrascriverli alla cieca.

## Se avevi già un repository GitHub

La nuova cartella estratta **non include `.git/`**, quindi non è già collegata al vecchio repository.

- Metodo prudente: apri il vecchio repository con VS Code, esegui `git status` e salva le modifiche in un commit (o copia di backup).
- Poi copia **il contenuto** di questa cartella `dev-handbook-hub/` dentro la radice del repository, senza toccare la vecchia `.git/`.
- Controlla `git status` e `git diff` prima di procedere, soprattutto se nel vecchio progetto avevi personalizzazioni.
- Se hai eliminato delle cartelle dal progetto vecchio per sbaglio, valuta attentamente le differenze: copia/merge non equivale sempre a una sincronizzazione esatta.
- Quando sei soddisfatto, usa:

```bash
git add .
git commit -m "Restore complete and revised Handbook Hub"
git push
```

## Modifiche future

```bash
python -m pip install -r requirements-hub.txt   # solo la prima volta, meglio in un venv
python AGGIORNA-HUB.py                            # aggiorna il lettore offline
```

Per aggiungere un nuovo manuale copia la sua cartella in `handbooks/`, assicurandoti che contenga `book.json` e i `.md`. Per una recipe usa `recipes/`. Le istruzioni dettagliate sono in `CONTRIBUIRE.md`.

La build HTML pubblicata da GitHub Pages viene ricreata automaticamente dal workflow a ogni push su `main`, una volta configurate correttamente le Pages del repository.
