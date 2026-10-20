# FastAPI — Cheatsheet rapida

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
app = FastAPI()

class ItemIn(BaseModel):
    title: str = Field(min_length=2)

@app.post('/items', status_code=201)
def create_item(data: ItemIn):
    return {'id': 1, **data.model_dump()}

@app.get('/items/{id}')
def get_item(id: int):
    if id != 1: raise HTTPException(404, 'Not found')
    return {'id': id}
```

| Concetto | Metodo |
|---|---|
| Avvia dev | `fastapi dev main.py` |
| API docs | `/docs` |
| Body JSON | modello `BaseModel` |
| Validazione | `Field`, `Query`, `Path` |
| Risposta | `response_model=ItemOut` |
| Errori | `raise HTTPException(404, ...)` |
| DI | `Depends(get_session)` |
| Test | `TestClient(app)` |

**Da ricordare:** secret fuori codice, `async def` solo con IO async, status code corretti, dati reali in DB e migrazioni.

**Docs:** https://fastapi.tiangolo.com/tutorial/

---

## Rotte HTTP e validazione

```python
from typing import Annotated
from fastapi import FastAPI, Query, Path, Depends, HTTPException, status
from pydantic import BaseModel, Field

app = FastAPI()

class TaskIn(BaseModel):
    # Vincolo di validazione sul contenuto della richiesta.
    title: str = Field(min_length=2, max_length=120)

@app.get('/tasks/{task_id}')
def read_task(task_id: Annotated[int, Path(gt=0)],
              q: Annotated[str | None, Query(max_length=50)] = None):
    # task_id arriva dal path, q dalla query string.
    return {'id': task_id, 'search': q}

@app.post('/tasks', status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskIn):
    # Il modello Pydantic valida automaticamente il JSON ricevuto.
    return {'id': 1, **payload.model_dump()}
```

| Sintassi | Significato |
|---|---|
| `@app.get('/x')` | Route GET |
| `@app.post('/x')` | Route POST |
| `@app.patch('/x/{id}')` | Aggiornamento parziale |
| `Path(gt=0)` | Vincolo sul path parameter |
| `Query(min_length=...)` | Vincolo sul parametro di query |
| `Field(min_length=...)` | Validazione campo body |
| `BaseModel` | Schema input/output Pydantic |
| `response_model=TaskOut` | Converte/valida l'output secondo schema |
| `HTTPException(status_code=404)` | Errore HTTP intenzionale |
| `Depends(get_user)` | Risoluzione dipendenza |
| `APIRouter(prefix='/api')` | Suddivisione rotte per moduli |
| `TestClient(app)` | Test HTTP senza server separato |

## Codici HTTP, async e dati

| Codice | Quando |
|---|---|
| 200 | GET/operazione riuscita |
| 201 | risorsa creata |
| 204 | successo senza body |
| 400 | richiesta non valida secondo regole app |
| 401 | autenticazione richiesta/non valida |
| 403 | identità nota ma accesso negato |
| 404 | risorsa non trovata |
| 422 | errore di validazione input (default FastAPI) |
| 500 | errore imprevisto server |

**Regola pratica:** `async def` con librerie async; `def` se il driver database o l'operazione è sincrona/bloccante.  
Niente segreti hardcoded, test di autorizzazione per singola risorsa e migrazioni per lo schema persistente.

**Comandi:** `pip install fastapi uvicorn`, `fastapi dev main.py` (se FastAPI CLI disponibile), `/docs`, `pytest -q`.
