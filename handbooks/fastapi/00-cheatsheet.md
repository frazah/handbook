# FastAPI — Cheatsheet rapida

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
app = FastAPI()

class ItemIn(BaseModel):
    # Field aggiunge vincoli di validazione a un campo del modello.
    title: str = Field(min_length=2)

@app.post('/items', status_code=201)
def create_item(data: ItemIn):
    # model_dump trasforma un modello Pydantic in un normale dizionario.
    return {'id': 1, **data.model_dump()}

@app.get('/items/{id}')
def get_item(id: int):
    # Un errore previsto diventa una risposta HTTP con codice esplicito.
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
    # Field aggiunge vincoli di validazione a un campo del modello.
    title: str = Field(min_length=2, max_length=120)

@app.get('/tasks/{task_id}')
# Annotated combina un tipo Python e metadati interpretati dal framework.
def read_task(task_id: Annotated[int, Path(gt=0)],
              q: Annotated[str | None, Query(max_length=50)] = None):
    # task_id arriva dal path, q dalla query string.
    return {'id': task_id, 'search': q}

@app.post('/tasks', status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskIn):
    # Il modello Pydantic valida automaticamente il JSON ricevuto.
    # model_dump trasforma un modello Pydantic in un normale dizionario.
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

---

## Ricette rapide: endpoint leggibili

### Un modello per l'input e uno per l'output

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI()

# Il JSON richiesto deve contenere una stringa non vuota.
class ProductCreate(BaseModel):
    name: str = Field(min_length=1)
    price: float = Field(gt=0)

# Separare il modello di output evita di esporre campi imprevisti.
class ProductRead(BaseModel):
    id: int
    name: str
    price: float

@app.post("/products", response_model=ProductRead, status_code=201)
def create_product(payload: ProductCreate):
    # Esempio illustrativo: in produzione salveresti nel database.
    return ProductRead(id=1, name=payload.name, price=payload.price)
```

### Leggere `Annotated` e `Depends` a piccoli passi

```python
from typing import Annotated
from fastapi import Depends

# Una normale funzione Python usata dal framework come dipendenza.
def get_page_size() -> int:
    return 20

# Annotated[Tipo, Metadati]: tipo int, valore fornito da Depends.
PageSize = Annotated[int, Depends(get_page_size)]

@app.get("/page")
def list_page(page_size: PageSize):
    return {"page_size": page_size}
```

### Request/response: la tabella da consultare

| Richiesta | Parametro Python | Esempio |
|---|---|---|
| `/products/42` | `product_id: int` nella rotta `/{product_id}` | identificatore |
| `/products?limit=10` | `limit: int = 10` | filtro/paginazione |
| body JSON | `payload: ProductCreate` | creazione/aggiornamento |
| errore previsto | `raise HTTPException(status_code=404)` | risorsa assente |
| risultato controllato | `response_model=ProductRead` | campo esposti |

**Importante:** ogni rotta che legge/modifica risorse private deve verificare **identità e autorizzazione**, non solo che l'ID esista.

### Comandi Mac/terminal

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install "fastapi[standard]" pytest
fastapi dev main.py
python3 -m pytest -q
```

`fastapi dev` dipende dalla CLI installata; in alternativa puoi usare `python3 -m uvicorn main:app --reload` con Uvicorn installato.
