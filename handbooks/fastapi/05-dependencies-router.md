# Depends e APIRouter

**Idea.** Le dipendenze rendono riutilizzabili accesso a DB, configurazione e regole; `APIRouter` divide endpoint per dominio.

**Prima di leggere il codice — simboli e termini:**

- **`Annotated[T, ...]`**: mantiene il tipo `T` e aggiunge metadati usati da FastAPI.
- **`Depends(...)`**: dichiara una dipendenza costruita o risolta per la richiesta.
- **`HTTPException`**: eccezione che genera una risposta HTTP di errore controllata.

```python
from typing import Annotated
from fastapi import APIRouter, Depends, Header, HTTPException

router = APIRouter(prefix='/admin', tags=['admin'])

def require_api_key(x_api_key: Annotated[str | None, Header()] = None) -> str:
    if x_api_key != 'demo-key':
        # Restituisce al client un errore HTTP esplicito.
        raise HTTPException(401, 'Non autorizzato')
    return x_api_key

@router.get('/stats')
def read_stats(_: Annotated[str, Depends(require_api_key)]):
    return {'orders': 18}

# in main.py: app.include_router(router)
```

**Attenzione:** la stringa hardcoded è solo didattica.  
Non conservare segreti nel sorgente; usa variabili d'ambiente o sistemi di gestione segreti e autentica/autoriza correttamente.

**Quando usarlo:** progetti con più route o dipendenze condivise.
Con le dipendenze puoi anche sostituire servizi nei test.
