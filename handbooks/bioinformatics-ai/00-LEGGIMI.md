# Installazione del modulo «Bioinformatica, AI & Biosecurity»

Questa **cartella autonoma** è progettata per il tuo Dev Handbook Hub (versione con aree e Recipes).
Non sostituisce alcun file già esistente.

## Come aggiungerla

1. Estrai `bioinformatics-ai.zip`.
2. Copia la cartella intera `bioinformatics-ai/` in `dev-handbook-hub/handbooks/`.
3. Il risultato deve avere `dev-handbook-hub/handbooks/bioinformatics-ai/book.json`.
4. Per aggiornare il lettore HTML **offline**, dalla root `dev-handbook-hub` esegui `python AGGIORNA-HUB.py` (se necessario installa `markdown-it-py` e `pygments`).
5. Apri `APRI-HANDBOOK.html`, area «Data & Artificial Intelligence».
6. Se usi GitHub Pages, basta `git add handbooks/bioinformatics-ai`, `git commit -m "Add bioinformatics AI and biosecurity handbook"`, `git push`; l'Action del progetto rigenera automaticamente l'Hub.

## Contenuti

- 35 capitoli / schede Markdown, a partire dalla biologia di base.
- Sequenze e formati bioinformatici, dati omics, AI/ML, epidemiologia, sorveglianza, One Health, prevenzione, biosafety, biosecurity, cyberbiosecurity, etica.
- Glossario, cheatsheet, quiz con soluzioni, fonti autorevoli.
- 2 mini laboratori Python standard library con dati sintetici e 5 test automatici.

## Eseguire i laboratori

Apri il terminale in `handbooks/bioinformatics-ai/lab/`:

```bash
python sequences.py
python surveillance_demo.py
python -m unittest discover -s . -p 'test_*.py'
```

I dataset e gli output sono **interamente inventati** e destinati solo allo studio, non alla diagnostica o alla sorveglianza reale.  
Non include procedure pratiche di laboratorio né di manipolazione di agenti biologici.

## Modificare o ampliare

I capitoli sono Markdown indipendenti (`01-*.md`, `02-*.md` ...), riconosciuti automaticamente dalla build.  
Modifica i file direttamente in VS Code.  
Per variare nome, colore, categoria, URL ufficiale cambia `book.json`.

**Nota sul contesto:** questo modulo copre i temi richiesti, ma per eventuali argomenti molto specifici di un'altra conversazione non recuperabile potrebbe servire in futuro un'integrazione puntuale.  
È pensato come base solida e autonoma.
