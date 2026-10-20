# Python e ambiente di lavoro

**Idea.** Python esegue codice tramite un interprete.
Un *virtual environment* isola le dipendenze del progetto e impedisce conflitti tra librerie.

**Prima di leggere il codice — simboli e termini:**

- **`venv`**: ambiente isolato in cui installare dipendenze per il progetto.

```bash
# Esegui i comandi dalla cartella del progetto.
python3 --version
mkdir report && cd report
python3 -m venv .venv
source .venv/bin/activate  # macOS/Linux; Windows: .venv\Scripts\activate
python -m pip install requests
python -m pip freeze > requirements.txt
python main.py
```

```python
# main.py
from datetime import date
client = "Acme"
print(f"Report di {client} — {date.today().isoformat()}")
```

**Linguaggio:** indentazione obbligatoria (convenzionalmente 4 spazi); `snake_case` per funzioni e variabili; classi `PascalCase`.  
Un file `.py` è un modulo; una cartella con moduli può formare un package.

**Errore comune:** usare `pip` di un Python e `python` di un altro: preferisci `python -m pip`.
Non inserire `.venv/`, credenziali o file `.env` nel repository.
