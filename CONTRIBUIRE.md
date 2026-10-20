# Come ampliare Dev Handbook Hub senza scambiarsi ZIP completi

## La struttura

```text
dev-handbook-hub/
├── handbooks/
│   ├── javascript/         # vecchi appunti .js + cheat sheet
│   ├── data-science/       # esempio di modulo standalone
│   │   ├── book.json       # nome, colore, icona, ordinamento
│   │   ├── 00-cheatsheet.md
│   │   └── 01-flusso-di-lavoro.md
│   └── ai-agents/
├── esempi/                 # laboratori e test
├── tools/                  # sorgenti dell'interfaccia e scaffolder
├── AGGIORNA-HUB.py         # script di build
├── APRI-HANDBOOK.html      # risultato consultabile anche offline
├── manifest.json          # indice generato: non è la fonte dei contenuti
├── .github/workflows/pages.yml
└── index.html              # avvio automatico su GitHub Pages
```

## La prima volta: crea un repository su GitHub

Crea un repository vuoto (senza README iniziale), apri questa cartella da VS Code e da un terminale al suo interno:

```bash
git init -b main
git add .
git commit -m "Initial Dev Handbook Hub"
git remote add origin https://github.com/TUO-USERNAME/dev-handbook-hub.git
git push -u origin main
```

Sostituisci URL con quello del tuo repository e autentica GitHub. Se la cartella è già un repo Git, NON ripetere `git init` e `git remote add`.

## Modificare capitoli, anche con IA nell'IDE

Lavora direttamente in `.md` (VS Code ha Markdown Preview con `Ctrl/Cmd+Shift+V`), usando un assistente per scrivere e rivedere gli esempi. Prima del commit, controlla il `git diff`, verifica sintassi e output degli esempi, poi:

```bash
python AGGIORNA-HUB.py     # necessario solo per aggiornare la copia HTML locale

git status
git add .
git commit -m "Espansa sezione pandas: merge e groupby"
git push
```

Puoi fare commit/push anche usando i pulsanti di VS Code → Source Control. Per un progetto personale il branch principale è sufficiente; per modifiche grandi valuta un branch e una Pull Request.

## Un nuovo handbook = una cartella

Opzione 1: `python tools/nuovo_handbook.py nome-slug "Nome della tecnologia"` crea `book.json` e due bozze. Opzione 2: copia in `handbooks/` una cartella preparata da terzi, purché abbia lo stesso formato.

Esempio di `handbooks/docker/book.json`:

```json
{
  "id": "docker",
  "order": 90,
  "name": "Docker",
  "icon": "DK",
  "desc": "Container, immagini, volumi e compose",
  "docs": "https://docs.docker.com/",
  "color": "#83baff"
}
```

Esempio di `handbooks/docker/01-container.md`:

````markdown
<!-- level: Basi -->
<!-- summary: Immagini, container e il ciclo build/run -->
# Immagini e container

## Che cosa sono

Spiegazione breve con esempi utili.

```bash
docker ps
```

## Errori comuni

...
````

Titoli e livelli vengono recuperati dai file. Metti i capitoli in ordine con `00-`, `01-`, `02-`, ... `99-`. Una nuova cartella è riconosciuta automaticamente al build: **non devi modificare `manifest.json`**.

## Pubblicazione automatica su GitHub Pages

1. Repository GitHub → **Settings → Pages**.
2. In **Build and deployment**, scegli **GitHub Actions**.
3. Effettua push su `main`: il workflow installa dipendenze Python, rigenera `APRI-HANDBOOK.html` e pubblica solo `index.html`, il lettore, `handbooks/` e `esempi/`.
4. Il sito sarà raggiungibile all'URL di Pages assegnato al repo (vedi Settings/Pages o l'output dell'Action).

Il sito è statico: **non puoi editare i file del repository dal sito pubblico**. Per aggiornarli usi VS Code, GitHub web editor o un assistente nell'IDE, poi commit/push.

### GitHub Pages vs lettore locale

- **Online:** la Action rigenera a ogni push: basta committare i contenuti e la configurazione. Non è obbligatorio includere la nuova HTML nel commit.
- **Offline:** dopo ogni modifica fai `python AGGIORNA-HUB.py` e riapri la pagina locale; se lo dimentichi, vedi la vecchia copia finché non la rigeneri.

## Per ricevere nuove sezioni da ChatGPT

Puoi chiedere: «Crea **solo** `handbooks/docker/` e `esempi/docker/` nel formato del mio Dev Handbook Hub, con `book.json`, lezioni e test». Ti basta copiare le cartelle, aprire VS Code, verificare, eseguire la build e pushare. Non sostituisci più l'intero progetto.

## Manutenzione e segreti

- Non committare `.env`, chiavi, credenziali, token o dataset riservati.
- La cartella `.venv/` è ignorata da Git.
- Controlla il diff prima di approvare modifiche generate dall'IA.
- Testa gli esempi nuovi e verifica i link alle fonti ufficiali.
- Il sito statico pubblicato su GitHub Pages è accessibile a chi possiede l'URL, secondo visibilità e impostazioni del repository: non inserirvi dati personali o proprietari.

## Organizzare per area (senza spostare le cartelle)

`areas.json` elenca le categorie visibili nella home. Scegli il campo `area` in ogni `handbooks/<slug>/book.json`:

| Area ID | Contenuto |
|---|---|
| `languages` | Linguaggi & Fondamenti |
| `web` | Web & Mobile Development |
| `engineering` | Developer Tools & Engineering |
| `data` | Data & Artificial Intelligence |
| `design` | Design & Specializations |

Un'area vuota non viene mostrata. L'area `other` è il fallback automatico per le nuove cartelle, quindi puoi decidere dove inserirle in un secondo momento. **Non spostare i capitoli:** il loro path rimane invariato e i segnalibri del browser restano validi.

## Recipes: una cartella, un workflow

Per aggiungere una guida pratica trasversale senza scrivere un altro corso:

```bash
python tools/nuova_recipe.py fastapi-postgres "FastAPI + PostgreSQL"
```

Modifica `recipes/fastapi-postgres/recipe.json` (titolo, descrizione, tag e `related`, ovvero gli ID degli handbook esistenti) e `README.md` con passi, snippet, output verificato ed errori comuni. Il lettore riconosce automaticamente le nuove cartelle dopo `python AGGIORNA-HUB.py` e la GitHub Action pubblica le recipe a ogni push.

Le recipes sono **esempi circoscritti**, non sostituiscono l'approfondimento nei relativi handbook. Puoi usare link come `[React](#book/react)` per rimandare alle schede e ridurre le duplicazioni.
