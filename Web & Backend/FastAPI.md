# FastAPI

> Framework Python per API HTTP: definisci gli endpoint con funzioni tipizzate e ottieni validazione, serializzazione e documentazione OpenAPI automatiche.
> Prerequisiti: [Python](../Languages/Python.md) · [Web e HTTP](../Fundamentals/Web%20e%20HTTP.md) · Collegate: [SQL](../Languages/SQL.md) · [Recipe React + FastAPI](../Recipes/React%20%2B%20FastAPI.md)

## Modello mentale

- FastAPI = **Starlette** (routing, richieste, risposte, middleware) + **Pydantic** (validazione e serializzazione) sopra lo standard **ASGI** (interfaccia asincrona tra server e app). Il server è **uvicorn**.
- I **type hint sono il contratto**: dalla firma della funzione FastAPI capisce da dove leggere ogni parametro (path, query, body), lo valida, lo converte e genera la documentazione su `/docs`.
- Input non valido → **422** automatico con il dettaglio dell'errore, senza scrivere codice di validazione.
- La **dependency injection** (`Depends`) fornisce a ogni richiesta le risorse condivise (connessione DB, utente autenticato, configurazione) ed è il punto in cui i test le sostituiscono.
- `async def` gira nell'**event loop**; `def` viene eseguita in un **threadpool**. Un'operazione bloccante dentro `async def` blocca tutte le richieste.
- `response_model` filtra l'output: è la tua garanzia di non esporre campi interni.

## Sintassi al volo

| Ti serve | Sintassi |
|---|---|
| Endpoint | `@app.get("/orders/{order_id}")` · `@app.post("/orders", status_code=201)` |
| Parametro di path | `def get(order_id: int)` (convertito e validato) |
| Query | `status: str \| None = None` · `limit: int = Query(20, le=100)` |
| Body | `def create(payload: OrderCreate)` (modello Pydantic) |
| Output filtrato | `response_model=OrderRead` o tipo di ritorno `-> OrderRead` |
| Errore | `raise HTTPException(status_code=404, detail="Order not found")` |
| Dipendenza | `db: sqlite3.Connection = Depends(get_db)` · `Annotated[..., Depends(...)]` |
| Header / cookie | `x_request_id: str = Header()` · `session: str = Cookie()` |
| Router | `router = APIRouter(prefix="/orders", tags=["orders"])` |
| Avvio | `uvicorn app.main:app --reload` · docs su `/docs` e `/redoc` |

## Modelli Pydantic

Separa i modelli per **direzione**: cosa accetti in input (`Create`, `Update`) e cosa restituisci (`Read`). Così il client non può impostare campi come `id` o `status`, e tu non esponi campi interni.

```python
# illustrativo: richiede pydantic (+ email-validator per EmailStr)
from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field

Status = Literal["pending", "paid", "shipped", "cancelled"]

class OrderItemIn(BaseModel):
    product_id: int
    quantity: int = Field(gt=0, le=100)  # vincoli: 422 se violati

class OrderCreate(BaseModel):
    customer_email: EmailStr               # richiede il pacchetto email-validator
    items: list[OrderItemIn] = Field(min_length=1)

class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # costruibile da oggetti ORM/righe
    id: int
    status: Status
    total_cents: int

class OrderStatusUpdate(BaseModel):
    status: Status
```

API Pydantic v2: `model.model_dump()`, `Model.model_validate(data)`, `model_config`, `@field_validator`. In v1 erano `.dict()`, `parse_obj`, `class Config`.

## Endpoint e dipendenze

```python
# illustrativo: richiede fastapi; continua dai modelli sopra
import sqlite3
from collections.abc import Iterator
from typing import Annotated
from fastapi import Depends, FastAPI, HTTPException, Query

app = FastAPI(title="Shop API")

def get_db() -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect("shop.db", check_same_thread=False)  # def -> eseguita nel threadpool
    conn.row_factory = sqlite3.Row
    try:
        yield conn       # il codice dopo yield gira a risposta completata: chiusura garantita
    finally:
        conn.close()

Db = Annotated[sqlite3.Connection, Depends(get_db)]

@app.get("/orders", response_model=list[OrderRead])
def list_orders(db: Db, status: Status | None = None, limit: int = Query(20, ge=1, le=100)):
    sql, params = "SELECT id, status, total_cents FROM orders", []
    if status:
        sql += " WHERE status = ?"
        params.append(status)
    rows = db.execute(sql + " ORDER BY id DESC LIMIT ?", [*params, limit]).fetchall()
    return [dict(r) for r in rows]

@app.patch("/orders/{order_id}/status", response_model=OrderRead)
def update_status(order_id: int, payload: OrderStatusUpdate, db: Db):
    with db:  # transazione: commit o rollback
        row = db.execute("UPDATE orders SET status = ? WHERE id = ? RETURNING id, status, total_cents",
                         (payload.status, order_id)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return dict(row)
```

- Le dipendenze possono dipendere da altre (`get_current_user` dipende da `get_token`, che dipende da `get_settings`); FastAPI le risolve una volta per richiesta e ne mette in cache il risultato.
- Il parametro `status` qui è sia un filtro opzionale sia un `Literal`: un valore non ammesso produce un 422 automatico.

## `async def` vs `def`

| Scrivi | Quando | Attenzione |
|---|---|---|
| `async def` | usi librerie async (`httpx.AsyncClient`, `asyncpg`, SQLAlchemy async) | **niente** chiamate bloccanti (`requests`, `time.sleep`, `sqlite3`) |
| `def` | usi librerie sincrone (sqlite3, `requests`, SQLAlchemy sync) | gira nel threadpool: concorrenza limitata dalla dimensione del pool |

Nel dubbio usa `def`: è sicuro. Un `async def` con codice bloccante è il bug di prestazioni più comune in FastAPI.

## Errori

```python
# illustrativo: richiede fastapi
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

class OutOfStockError(Exception):
    def __init__(self, sku: str) -> None:
        self.sku = sku

@app.exception_handler(OutOfStockError)  # traduce un errore di dominio in una risposta HTTP
async def out_of_stock_handler(request: Request, exc: OutOfStockError) -> JSONResponse:
    return JSONResponse(status_code=409, content={"title": "Prodotto esaurito", "sku": exc.sku})
```

Così la logica di dominio non conosce HTTP, e il formato degli errori resta coerente (vedi [Problem Details](../Fundamentals/Web%20e%20HTTP.md#design-di-api-rest)).

## Organizzazione del progetto

```text
app/
├── main.py          # crea l'app, include i router, middleware, lifespan
├── config.py        # Settings (pydantic-settings)
├── db.py            # connessione/sessione, get_db
├── models.py        # tabelle ORM (se usi SQLAlchemy)
├── schemas.py       # modelli Pydantic
├── routers/orders.py
└── services/orders.py  # logica di dominio, testabile senza HTTP
tests/
```

```python
# illustrativo: app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings
from app.routers import orders

class Settings(BaseSettings):        # legge le variabili d'ambiente (e .env)
    database_url: str = "sqlite:///shop.db"
    allowed_origins: list[str] = ["http://localhost:5173"]

settings = Settings()

@asynccontextmanager
async def lifespan(app: FastAPI):    # sostituisce i deprecati @app.on_event
    # avvio: pool di connessioni, client HTTP, modelli ML...
    yield
    # spegnimento: chiudi le risorse

app = FastAPI(lifespan=lifespan)
app.include_router(orders.router)
app.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins,
                   allow_methods=["*"], allow_headers=["*"])
```

Per il database in un progetto reale: **SQLAlchemy 2.0** (ORM o Core) con migrazioni **Alembic**, oppure SQLModel. Le tabelle non si creano all'avvio dell'app in produzione.

## Autenticazione

Schema tipico: login con username e password → il server verifica l'hash (argon2/bcrypt) → emette un **JWT** a scadenza breve → il client lo invia in `Authorization: Bearer`. Concetti e trade-off in [Web e HTTP](../Fundamentals/Web%20e%20HTTP.md#cookie-sessioni-e-token).

```python
# illustrativo: richiede fastapi + PyJWT
from typing import Annotated
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")  # legge l'header Bearer
SECRET_KEY = "da-variabile-d-ambiente"  # mai nel codice in produzione

def get_current_user_id(token: Annotated[str, Depends(oauth2_scheme)]) -> int:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])  # verifica firma e scadenza
    except jwt.InvalidTokenError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token",
                            headers={"WWW-Authenticate": "Bearer"})
    return int(payload["sub"])

# Uso: def my_orders(user_id: Annotated[int, Depends(get_current_user_id)], db: Db): ...
# Autorizzazione: filtra SEMPRE per user_id (WHERE customer_id = ?), non fidarti dell'id nell'URL.
```

## Background task

Per lavoro leggero *dopo* la risposta (email di conferma). Per lavoro pesante o che deve sopravvivere a un riavvio usa una coda vera (Celery, RQ, arq).

```python
# illustrativo: richiede fastapi
from fastapi import BackgroundTasks

@app.post("/orders", status_code=201)
def create_order(payload: OrderCreate, background: BackgroundTasks, db: Db):
    order_id = save_order(db, payload)
    background.add_task(send_confirmation_email, payload.customer_email, order_id)
    return {"id": order_id}
```

## Test

`TestClient` esegue l'app in memoria, senza server. `app.dependency_overrides` sostituisce le dipendenze (database di test, utente finto).

```python
# illustrativo: tests/test_orders.py, richiede fastapi + httpx + pytest
import sqlite3
from fastapi.testclient import TestClient
from app.main import app
from app.db import get_db

def override_db():
    conn = sqlite3.connect(":memory:", check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY, status TEXT, total_cents INT)")
    conn.execute("INSERT INTO orders VALUES (101, 'paid', 2598)")
    yield conn

app.dependency_overrides[get_db] = override_db
client = TestClient(app)

def test_list_paid_orders():
    response = client.get("/orders", params={"status": "paid"})
    assert response.status_code == 200
    assert response.json() == [{"id": 101, "status": "paid", "total_cents": 2598}]

def test_invalid_status_is_422():
    assert client.get("/orders", params={"status": "lost"}).status_code == 422
```

## Deploy

- `uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4` (oppure gunicorn con worker uvicorn). Ogni worker è un processo: lo stato in memoria **non** è condiviso tra worker.
- Dietro un reverse proxy (nginx, load balancer) che gestisce TLS; configura `--proxy-headers`.
- Segreti da variabili d'ambiente, healthcheck (`GET /health`), log strutturati, migrazioni eseguite prima del deploy.

## Domande da colloquio

**Base**
- **Perché FastAPI?** Validazione e documentazione automatiche dai type hint, supporto async nativo, ottime prestazioni (Starlette) e codice conciso.
- **Path, query o body?** I parametri presenti nel path del decoratore vengono dal path; i tipi semplici sono query; i modelli Pydantic sono il body.
- **Cosa succede se il body non è valido?** Pydantic solleva un errore di validazione e FastAPI risponde 422 con il dettaglio dei campi, prima che il tuo codice venga eseguito.
- **FastAPI vs Flask vs Django?** Django è full-stack (ORM, admin, auth inclusi); Flask è minimale e sincrono; FastAPI è focalizzato sulle API, con validazione dai type hint, async nativo e OpenAPI automatico.
- **Da dove vengono `/docs` e `/redoc`?** FastAPI genera uno schema OpenAPI da percorsi, parametri e modelli Pydantic; Swagger UI e ReDoc lo visualizzano.

**Intermedio**
- **`async def` o `def`?** `async def` solo se tutto ciò che chiami è non bloccante; altrimenti `def`, che FastAPI esegue nel threadpool. Codice bloccante in `async def` congela tutte le richieste.
- **Come funziona `Depends`?** FastAPI risolve l'albero delle dipendenze per ogni richiesta, mette in cache i risultati condivisi e, per le dipendenze con `yield`, esegue la pulizia alla fine. Nei test si sostituiscono con `dependency_overrides`.
- **Perché modelli separati Create/Read?** Per controllare cosa il client può impostare (niente `id` o `status` in input) e cosa vede (niente hash della password in output).
- **Come gestisci le configurazioni?** Con `pydantic-settings`: variabili d'ambiente validate e tipizzate, un oggetto Settings fornito tramite dipendenza.
- **Middleware vs dipendenza?** Il middleware avvolge ogni richiesta e risposta (logging, CORS, request id, tempi); la dipendenza si applica a endpoint o router specifici e può restituire valori (utente, sessione DB).

**Avanzato**
- **Come implementi autenticazione e autorizzazione?** `OAuth2PasswordBearer` estrae il token, una dipendenza lo verifica e restituisce l'utente; l'autorizzazione si applica filtrando per utente in ogni query o con dipendenze di ruolo.
- **Background task vs coda di messaggi?** I background task girano nello stesso processo dopo la risposta: semplici, ma si perdono a un crash. Una coda (Celery, RQ) offre persistenza, retry e worker separati.
- **Perché `lifespan` invece di `on_event`?** È un unico context manager per avvio e spegnimento: le risorse create prima dello `yield` sono chiuse dopo, nello stesso scope. `on_event` è deprecato.
- **Come scali un'app FastAPI?** Più worker per sfruttare i core, più istanze dietro un load balancer, stato esterno (DB, Redis), connection pooling e operazioni lente spostate in code asincrone.

## Approfondisci

- [FastAPI — Tutorial](https://fastapi.tiangolo.com/tutorial/) · [Dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/) · [Bigger applications](https://fastapi.tiangolo.com/tutorial/bigger-applications/)
- [Pydantic v2](https://docs.pydantic.dev/latest/) · [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- [SQLAlchemy 2.0 Unified Tutorial](https://docs.sqlalchemy.org/en/20/tutorial/)
