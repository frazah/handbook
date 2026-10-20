# Dev Handbook Hub

**9 handbook in un unico sito offline, pronto per Git.** JavaScript, TypeScript, React, Python, FastAPI, SQL, Data Science & Analysis, AI Agents e Bioinformatica/AI & Biosecurity. Ogni lezione è un file Markdown o JavaScript: l'HTML è **generato automaticamente**.

## Uso immediato

Apri `APRI-HANDBOOK.html` nel browser (anche offline) o la cartella in VS Code. Ricerca globale (`/` o `Ctrl/Cmd+K`), codice colorato, schede, preferiti, progressi.

## Come si modifica (workflow consigliato)

1. Modifica un `.md` sotto `handbooks/<nome>/` in VS Code, anche con AI Copilot / strumenti simili.
2. Per aggiornare **il lettore locale**: `python3 -m pip install -r requirements-hub.txt` (prima volta), poi `python3 AGGIORNA-HUB.py`.
3. `git add . && git commit -m "Aggiornato handbook" && git push`.
4. Se abiliti GitHub Pages con origine **GitHub Actions**, il workflow `.github/workflows/pages.yml` ricostruirà il sito automaticamente a ogni push su `main`, anche se non hai rigenerato l'HTML localmente.

## Aggiungere una tecnologia

```bash
python tools/nuovo_handbook.py docker Docker
# modifica handbooks/docker/book.json e i capitoli .md
python3 AGGIORNA-HUB.py
```

Oppure **copia solo una nuova cartella** in `handbooks/`: deve contenere `book.json` e i `.md`. Non serve editare a mano `manifest.json` o il codice del sito. Approfondisci in [CONTRIBUIRE.md](CONTRIBUIRE.md).

## Installare e provare i laboratori

`esempi/` contiene laboratori per le tecnologie principali; l’handbook Bioinformatica include anche `handbooks/bioinformatics-ai/lab/`. Per `data-science`, `python3 -m pip install -r esempi/data-science/requirements.txt` e poi esegui il suo `analyze_orders.py`. Per `ai-agents`, il laboratorio offline non usa chiavi API; lo SDK reale è opzionale.

## Contenuti e fonti

Le guide sono sintesi pratiche e originali, da affiancare ai riferimenti ufficiali linkati in `book.json` per ogni tecnologia. Vedi anche `00-LEGGIMI.md`. Il progetto non è un sostituto completo della documentazione dei framework.

## Aree e Recipes (aggiornamento)

I **nove handbook esistenti** sono ora raggruppati nella homepage per area. Le categorie sono definite in `areas.json`; ogni `handbooks/<slug>/book.json` indica la propria `area` (ad es. `languages`, `web`, `data`). Le aree vuote non si vedono finché non aggiungi contenuti. Se una cartella nuova omette il campo `area`, appare in **Altri argomenti**.

Una **recipe** è un mini-percorso pratico che unisce più handbook e vive in `recipes/<slug>/` con `recipe.json` e `README.md`. Non si confonde con i capitoli, ma compare nella ricerca globale, nei preferiti e nei progressi. Sono incluse due recipes iniziali: React + FastAPI e CSV → pandas → SQL.

```bash
python tools/nuova_recipe.py react-sql-dashboard "Dashboard React + SQL"
# modifica recipes/react-sql-dashboard/recipe.json e README.md
python3 AGGIORNA-HUB.py
```

**Non serve sostituire lo ZIP:** lavora nel repository locale con VS Code e Git; `git add`, `commit` e `push` aggiornano i sorgenti. Il workflow Pages include anche `recipes/`. La pagina HTML locale resta una build statica: ricostruiscila per vedere le modifiche offline.
