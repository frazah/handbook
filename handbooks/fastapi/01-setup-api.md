# Prima API e documentazione OpenAPI

**Idea.** FastAPI è un framework web Python per costruire API HTTP.
Usa le annotazioni dei tipi per parsing, validazione e documentazione automatica.

**Prima di leggere il codice — simboli e termini:**

- **`@app.get(...)` / `@app.post(...)`**: decoratori che collegano una funzione a una rotta HTTP.

## Prima del codice: cosa riconoscere

`app = FastAPI()` crea l’applicazione. `@app.get("/health")` registra un endpoint: la funzione sotto verrà chiamata quando arriva una richiesta GET, non al momento della dichiarazione.

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install 'fastapi[standard]'
fastapi dev main.py
# Apri http://127.0.0.1:8000/docs
```

```python
# main.py
from fastapi import FastAPI
app = FastAPI(title="Tasks API")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/hello/{name}")
def hello(name: str):
    return {"message": f"Ciao {name}"}
```

**HTTP:** `GET` legge, `POST` crea/esegue, `PUT` sostituisce, `PATCH` modifica in parte, `DELETE` elimina.  
L'interfaccia `/docs` documenta e consente di provare gli endpoint; non esporla indiscriminatamente in sistemi sensibili.

**Errore comune:** pensare che una API HTTP sia solo una funzione Python: status code, schema, idempotenza, sicurezza ed errori fanno parte del contratto.
