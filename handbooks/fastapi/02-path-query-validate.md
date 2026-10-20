# Path, query e validazione

**Idea.** FastAPI capisce dalla firma se un parametro appartiene al *path* oppure alla *query*.
Con `Query`/`Path` aggiungi vincoli.

**Prima di leggere il codice — simboli e termini:**

- **`@app.get(...)` / `@app.post(...)`**: decoratori che collegano una funzione a una rotta HTTP.
- **`Annotated[T, ...]`**: mantiene il tipo `T` e aggiunge metadati usati da FastAPI.
- **`HTTPException`**: eccezione che genera una risposta HTTP di errore controllata.

```python
from typing import Annotated
from fastapi import FastAPI, HTTPException, Path, Query
app = FastAPI()

TASKS = {1: {"id": 1, "title": "Spedire ordine", "done": False}}

@app.get("/tasks/{task_id}")
def get_task(task_id: Annotated[int, Path(gt=0)]):
    task = TASKS.get(task_id)
    if task is None:
        # Restituisce al client un errore HTTP esplicito.
        raise HTTPException(status_code=404, detail="Task non trovata")
    return task

@app.get("/tasks")
def list_tasks(done: bool | None = None,
               limit: Annotated[int, Query(ge=1, le=100)] = 20):
    rows = list(TASKS.values())
    if done is not None:
        rows = [t for t in rows if t["done"] == done]
    return rows[:limit]
```

**Pratica:** `GET /tasks?done=false&limit=10`.  
Un parametro `bool` viene convertito dal framework; input errati ricevono un errore di validazione.

**Errore comune:** restituire `None` a un id inesistente e ottenere una risposta 200: usa 404.
