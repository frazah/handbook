# CRUD, status code e gestione degli errori

**Idea.** Nella pratica scegli comportamenti coerenti: create → 201, read → 200, missing → 404, body non valido → 422, conflitto → 409, delete senza body → 204.

**Prima di leggere il codice — simboli e termini:**

- **`@app.get(...)` / `@app.post(...)`**: decoratori che collegano una funzione a una rotta HTTP.
- **`BaseModel`**: modello Pydantic che valida dati e definisce uno schema di input/output.
- **`HTTPException`**: eccezione che genera una risposta HTTP di errore controllata.

```python
from fastapi import FastAPI, HTTPException, Response, status
from pydantic import BaseModel
app = FastAPI()

# Pydantic definisce e valida la forma dei dati.
class ItemIn(BaseModel):
    name: str

items: dict[int, ItemIn] = {}

@app.put('/items/{item_id}', response_model=ItemIn)
def put_item(item_id: int, payload: ItemIn):
    # Restituisce al client un errore HTTP esplicito.
    if item_id <= 0: raise HTTPException(400, 'ID non valido')
    items[item_id] = payload
    return payload

@app.delete('/items/{item_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int):
    if item_id not in items: raise HTTPException(404, 'Non trovato')
    del items[item_id]
    return Response(status_code=204)
```

**Nota:** questo store in memoria è **solo dimostrativo**: non persiste e non è condiviso fra worker/processi.  
In produzione serve un DB.

**Errore comune:** restituire strutture di errore con status 200; usa `HTTPException` o handler coerenti.
