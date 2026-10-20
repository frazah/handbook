# Depends e APIRouter

**Obiettivo:** separare una regola comune dalla funzione che gestisce la richiesta.
I frammenti seguenti fanno parte **dello stesso esempio** e vanno copiati nello stesso modulo.

## 1. Partiamo da una dipendenza normale

```python
from fastapi import FastAPI, Depends, HTTPException

app = FastAPI()

# È una normale funzione Python.
# Questo token dimostrativo NON è una soluzione di autenticazione reale.
def require_api_key(api_key: str) -> str:
    if api_key != "demo-key":
        raise HTTPException(status_code=401, detail="Non autorizzato")
    return api_key
```

L'eccezione `HTTPException` comunica a FastAPI lo status HTTP da restituire.
Nella realtà la chiave deve provenire da una richiesta (per esempio da un header), non da un valore hardcoded.

## 2. Leggere `Header` e `Annotated`

```python
from typing import Annotated
from fastapi import Header

# Header() dice a FastAPI da dove leggere x_api_key.
# str | None indica che il valore può mancare.
# = None lo rende opzionale.
def require_header(
    x_api_key: Annotated[str | None, Header()] = None,
) -> str:
    if x_api_key != "demo-key":
        raise HTTPException(status_code=401, detail="Non autorizzato")

    return x_api_key
```

`Annotated[Tipo, Metadati]` conserva un tipo Python (`str | None`) e aggiunge indicazioni utilizzabili da FastAPI (`Header()`).
La dipendenza legge normalmente l'header HTTP `x-api-key` (FastAPI converte l'underscore nel trattino).

## 3. Passare la dipendenza a una rotta

```python
# Creiamo un alias per la firma, così non dobbiamo ripetere Annotated.
ApiKey = Annotated[str, Depends(require_header)]

@app.get("/stats")
def read_stats(api_key: ApiKey):
    # FastAPI ha già chiamato require_header prima di eseguire la rotta.
    return {"orders": 18}
```

In `Depends(require_header)` passi la **funzione**, senza parentesi.
`Depends(require_header())` la eseguirebbe immediatamente e non è il comportamento voluto.
Il parametro `api_key` è disponibile alla rotta anche se nell'esempio non viene usato ulteriormente.

## 4. Suddividere in router

```python
from fastapi import APIRouter

# Un router raccoglie rotte appartenenti allo stesso dominio.
router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/status")
def admin_status(api_key: ApiKey):
    return {"status": "ok"}

# Devi includere il router nell'applicazione principale.
app.include_router(router)
```

L'endpoint risultante è `GET /admin/status`.
L'endpoint `/stats` sopra è stato registrato direttamente su `app`.

**Attenzione — sicurezza:** `demo-key` è solo un valore illustrativo. In una API reale imposta credenziali tramite segreti protetti, verifica identità e permessi sulla singola risorsa e aggiungi test per richieste non autorizzate.
