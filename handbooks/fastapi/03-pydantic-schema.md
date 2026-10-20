# Pydantic: request e response model

**Idea.** I modelli Pydantic v2 descrivono payload JSON, eseguono validazione runtime e contribuiscono a OpenAPI.
**Distingui modello input e output** per non restituire campi privati.

**Prima di leggere il codice — simboli e termini:**

- **`@app.get(...)` / `@app.post(...)`**: decoratori che collegano una funzione a una rotta HTTP.
- **`BaseModel`**: modello Pydantic che valida dati e definisce uno schema di input/output.
- **`response_model`**: schema con cui FastAPI valida/serializza la risposta.

## Prima del codice: cosa riconoscere

Un modello Pydantic (`BaseModel`) descrive i dati, li valida in ingresso e li converte in oggetti Python. `model_dump()` crea un dizionario; un modello di risposta separato evita di esporre accidentalmente campi sensibili.

```python
from fastapi import FastAPI, status
from pydantic import BaseModel, Field
app = FastAPI()

# Pydantic definisce e valida la forma dei dati.
class TaskCreate(BaseModel):
    # Field aggiunge vincoli di validazione a un campo del modello.
    title: str = Field(min_length=2, max_length=120)
    priority: int = Field(default=1, ge=1, le=5)

class TaskOut(TaskCreate):
    id: int
    done: bool = False

@app.post("/tasks", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(data: TaskCreate):
    return {"id": 42, "title": data.title,
            "priority": data.priority, "done": False}
```

**Comandi utili:** `model.model_dump()` produce un dizionario, `model.model_dump(exclude_unset=True)` è utile per PATCH; `model.model_validate(data)` valida dati Python.

**Errore comune:** usare tutorial Pydantic v1 con `.dict()` e vecchi validator senza leggere le differenze di versione.
Per Pydantic v2 preferisci `.model_dump()`.
