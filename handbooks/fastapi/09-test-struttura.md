# TestClient, architettura e deploy

**Idea.** Verifica status, corpo e permessi, non solo che la funzione Python ritorni un dict.
TestClient invia richieste ASGI senza avviare il server in una porta reale.

## Prima del codice: cosa riconoscere

`TestClient(app)` permette di inviare richieste HTTP in test senza aprire una porta di rete. Nei test usa servizi/dati isolati e verifica anche errori, permessi e status, non solo il caso felice.

```python
# test_main.py — installare: pip install pytest httpx
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    # get legge una chiave e può usare un default se manca.
    res = client.get('/health')
    assert res.status_code == 200
    assert res.json() == {'status': 'ok'}

# pytest -q
```

**Struttura suggerita:** `app/main.py`, `app/routers/`, `app/schemas/`, `app/models/`, `app/services/`, `app/db/`, `tests/`, `pyproject.toml`.  
Introduci cartelle solo quando il progetto cresce.

**Checklist deploy:** DB esterno, migrazioni, segreti fuori repo, HTTPS, osservabilità, test, healthcheck, backup, timeout, limiti e log.  
Il demo in memoria non è adatto alla produzione.

**Errore comune:** testare su un DB reale condiviso: preferisci DB di test con fixture e rollback/isolamento.
