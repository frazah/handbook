# FastAPI — Cheatsheet

> **Quando serve:** costruire API HTTP in Python con validazione, documentazione automatica e dependency injection. Richiede familiarità con [Python](../Languages/Python.md).

Una API espone **endpoint** (metodo HTTP + percorso). FastAPI usa i type hint per convertire e validare gli input insieme a Pydantic. I modelli separano **dati in ingresso** e **dati in uscita**.

## Sintassi al volo

| Funzione | Sintassi |
|---|---|
| GET | `@app.get('/products')` |
| POST | `@app.post('/products', status_code=201)` |
| Path param | `@app.get('/products/{product_id}')` |
| Query param | `limit: int = 10` |
| Request JSON | `def create_product(data: ProductIn):` |
| Errori HTTP | `raise HTTPException(status_code=404, detail='Not found')` |
| Modelli | `class ProductIn(BaseModel): ...` |
| Documentazione | `/docs` (Swagger UI) |
| Router | `APIRouter(prefix='/products')` |
| Dipendenze | `Depends(get_db)` |

## Concetti applicati

### Endpoint e request/response models

```python
import sqlite3
from contextlib import asynccontextmanager, closing
from pathlib import Path
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import BaseModel, Field

DATABASE = Path('products.sqlite3')

# Crea lo schema all'avvio. In produzione usa migrazioni versionate.
@asynccontextmanager
async def lifespan(app: FastAPI):
    with closing(sqlite3.connect(DATABASE)) as connection, connection:
        connection.execute('''
            CREATE TABLE IF NOT EXISTS products (
              id INTEGER PRIMARY KEY,
              name TEXT NOT NULL,
              price_cents INTEGER NOT NULL CHECK (price_cents > 0)
            )
        ''')
    yield

app = FastAPI(lifespan=lifespan)

class ProductIn(BaseModel):
    name: str = Field(min_length=2)
    price_cents: int = Field(gt=0)

class ProductOut(ProductIn):
    id: int

# Una connessione per richiesta, chiusa anche in caso di errore.
def get_db():
    connection = sqlite3.connect(DATABASE, check_same_thread=False)
    connection.row_factory = sqlite3.Row
    try:
        yield connection
    finally:
        connection.close()

Db = Annotated[sqlite3.Connection, Depends(get_db)]

@app.post('/products', response_model=ProductOut,
          status_code=status.HTTP_201_CREATED)
def create_product(data: ProductIn, db: Db):
    cursor = db.execute(
        'INSERT INTO products(name, price_cents) VALUES (?, ?)',
        (data.name, data.price_cents),  # Parametri, non SQL concatenato.
    )
    db.commit()
    return ProductOut(id=cursor.lastrowid, **data.model_dump())

@app.get('/products/{product_id}', response_model=ProductOut)
def read_product(product_id: int, db: Db):
    row = db.execute(
        'SELECT id, name, price_cents FROM products WHERE id = ?',
        (product_id,),
    ).fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail='Product not found')
    return ProductOut(**dict(row))
```

**Leggi la sintassi:** `@app.get(...)` è un **decoratore** che registra la funzione come handler HTTP. `ProductIn` indica a FastAPI di leggere/validare il body JSON. `response_model` documenta, valida e filtra l'output.

### Query, path e dependency injection

```python
from typing import Annotated
from fastapi import Depends, Query

# La dipendenza centralizza una regola riutilizzabile.
def get_limit(
    limit: Annotated[int, Query(ge=1, le=100)] = 20
) -> int:
    return limit

@app.get('/products', response_model=list[ProductOut])
def list_products(
    limit: Annotated[int, Depends(get_limit)],
    db: Db,
):
    rows = db.execute(
        'SELECT id, name, price_cents FROM products ORDER BY id DESC LIMIT ?',
        (limit,),
    ).fetchall()
    return [ProductOut(**dict(row)) for row in rows]
```

`Annotated[T, metadata]` abbina un tipo (`T`) a informazioni usate da FastAPI. `Depends(get_limit)` dice di **risolvere la dipendenza** e passare il risultato alla funzione. Non confonderlo con chiamare direttamente `get_limit()`.

### async vs def

```python
# Healthcheck: utile per monitoraggio; non serve async se non c'è await.
@app.get('/health')
def health():
    return {'status': 'ok'}
```

Usa `async def` quando devi davvero chiamare librerie asincrone con `await`, come un client HTTP async. La funzione `health` è sincronizzata perché non aspetta I/O. `async def` **non** rende veloce una funzione CPU-bound. Non mettere operazioni bloccanti lunghe dentro un handler async; scegli librerie async compatibili o separa il lavoro.

---

### Test senza server reale

```python
from fastapi.testclient import TestClient

with TestClient(app) as client:  # Avvia anche il lifespan di FastAPI.
    response = client.post('/products', json={'name': 'Libro', 'price_cents': 1200})
    assert response.status_code == 201

    created_id = response.json()['id']
    loaded = client.get(f'/products/{created_id}')
    assert loaded.json()['name'] == 'Libro'
```

Setup essenziale:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install fastapi uvicorn httpx pytest
uvicorn main:app --reload  # con codice in main.py; solo sviluppo
```

**Attenzione:** qui SQLite è persistente ma pensato per un piccolo servizio locale; con molte scritture concorrenti passa a un DB server e a gestione professionale di sessioni/migrazioni. Aggiungi autenticazione/autorizzazione, secrets, CORS mirato e test. Il test sopra usa `with TestClient(app)` per attivare il lifespan.

### Organizzazione in router e accesso protetto

In app reali separa endpoint in `APIRouter`, modelli Pydantic e accesso DB in moduli distinti. Per una API interna *service-to-service* puoi usare una **API key** letta da variabile d'ambiente; per utenti veri serve un flusso di autenticazione (OIDC/OAuth2), autorizzazione per risorsa e gestione delle scadenze.

```python
# file: api/admin.py (pattern separato dal demo precedente)
import hmac
import os

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import APIKeyHeader

router = APIRouter(prefix='/admin', tags=['admin'])
api_key_header = APIKeyHeader(name='X-API-Key')


def require_service_key(provided: str = Depends(api_key_header)) -> None:
    expected = os.environ.get('INTERNAL_API_KEY')
    # Se la chiave non è configurata, l'endpoint rimane inaccessibile.
    if not expected or not hmac.compare_digest(provided, expected):
        raise HTTPException(status_code=403, detail='Access denied')


@router.get('/version', dependencies=[Depends(require_service_key)])
def read_internal_version():
    # Versione fornita dalla pipeline di rilascio o dall'ambiente.
    return {'version': os.environ.get('APP_VERSION', 'development')}

# In main.py:
# from api.admin import router as admin_router
# app.include_router(admin_router)
```

Nella pratica: mantieni le chiavi fuori dal repository, usa HTTPS, rotation, rate limiting e controlli che non si basino solo su «utente autenticato». **CORS non è autenticazione**: controlla le origini consentite ai browser, non chi può chiamare l'API in generale.

```python
from fastapi.middleware.cors import CORSMiddleware

# Configura middleware prima di avviare l'app.
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],
    allow_credentials=True,
    allow_methods=['GET', 'POST'],
    allow_headers=['Content-Type', 'Authorization'],
)
```

### Aggiornamenti, error handling e test

Un `PATCH /products/{id}` normalmente accetta un modello con campi opzionali e usa `model_dump(exclude_unset=True)` per distinguere *campo assente* da *campo esplicitamente impostato a `None`*. Esegui l'UPDATE parametrizzato in transazione, restituisci 404 se non trovi la risorsa, e verifica la proprietà dell'oggetto dell'utente nel database prima di modificarlo. Gli `HTTPException` attesi sono diversi dagli errori server imprevisti: non nascondere eccezioni di programmazione restituendo sempre HTTP 200.

**Test:** usa `app.dependency_overrides` per fornire un DB temporaneo o un utente di test; ripristina gli override dopo ogni test. Per app reali verifica 201, 404, 422, 401/403 e casi limite. Convalida dimensione dei payload e gestisci timeout verso API esterne. [Guida FastAPI: security](https://fastapi.tiangolo.com/tutorial/security/), [Bigger applications](https://fastapi.tiangolo.com/tutorial/bigger-applications/), [Handling errors](https://fastapi.tiangolo.com/tutorial/handling-errors/).

## Domande da colloquio

**Path vs query vs body?** Path identifica risorse, query filtra/configura, body trasporta dati strutturati (spesso JSON).

**Pydantic?** Analizza, converte e valida input/output secondo modelli e vincoli.

**Dependency injection?** Fornisce dipendenze riutilizzabili (DB, autenticazione, configurazione) senza crearle manualmente in ogni handler.

**`def` vs `async def`?** Dipende dal carattere bloccante o asincrono delle operazioni interne, non è una scelta stilistica.

**401 vs 403?** 401: autenticazione necessaria/non valida; 403: accesso negato pur essendo nota la richiesta/identità.

**Approfondisci quando serve:** [FastAPI — SQL Databases](https://fastapi.tiangolo.com/tutorial/sql-databases/), [Dependencies with yield](https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-with-yield/) e [Lifespan Events](https://fastapi.tiangolo.com/advanced/events/). Il codice SQL qui usa `sqlite3` per evidenziare i principi; per applicazioni grandi usa un livello di accesso ai dati dedicato.
