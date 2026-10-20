<!-- level: Fondamenti -->
<!-- summary: Prima di FastAPI: HTTP, request/response, path/query/body, modelli e Depends spiegati -->
# Prima di FastAPI: leggere gli endpoint Python

**Prerequisito:** saper leggere funzioni Python, dizionari e classi semplici.
FastAPI collega funzioni Python a richieste HTTP e converte/valida i dati in ingresso.

## La rotta e il decoratore

```python
from fastapi import FastAPI

app = FastAPI()

# Il decoratore registra la funzione sulla rotta GET /health.
# Non esegue la funzione mentre viene dichiarata.
@app.get("/health")
def read_health():
    # Il dizionario viene serializzato come risposta JSON.
    return {"status": "ok"}
```

Il client chiama `GET /health`; il server richiama `read_health()` e invia JSON.

## Tre origini dei dati, tre significati

- **Path**: `/products/42` → `product_id` indica una risorsa specifica.
- **Query**: `/products?limit=10` → `limit` modifica filtro/paginazione.
- **Body JSON**: `{ "title": "Libro" }` → i dati che il client sta inviando.

```python
from pydantic import BaseModel

# Descrive e valida i dati attesi nel JSON.
class ProductIn(BaseModel):
    title: str

@app.post("/products", status_code=201)
def create_product(product: ProductIn):
    # product è un oggetto Python già validato da Pydantic.
    return {"id": 42, "title": product.title}
```

## Come decifrare `Annotated[..., Depends(...)]`

```python
from typing import Annotated
from fastapi import Depends

# Dipendenza: è una normale funzione Python.
def get_current_role() -> str:
    return "reader"

# Annotated[T, ...]: valore di tipo T con metadati per FastAPI.
# Depends(get_current_role): FastAPI chiama la dipendenza per la richiesta.
# Depends dichiara a FastAPI una dipendenza da risolvere per richiesta.
Role = Annotated[str, Depends(get_current_role)]

@app.get("/private")
def read_private(role: Role):
    return {"role": role}
```

**Attenzione:** `get_current_role()` è un segnaposto didattico, non è autenticazione.
Una vera applicazione deve verificare credenziali e autorizzazioni.

## `def` oppure `async def`?

Usa `async def` se attendi librerie davvero asincrone con `await`.
Se usi librerie sincrone/bloccanti, non basta aggiungere `async` per renderle non bloccanti.
