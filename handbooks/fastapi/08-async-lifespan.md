# async def, background e lifespan

**Idea.** Scegli `async def` quando chiami librerie **asincrone** che supportano `await`; con librerie bloccanti tradizionali usa endpoint `def` o adatta il lavoro. `async def` non rende non-bloccanti le chiamate sync.

**Prima di leggere il codice — simboli e termini:**

- **`@app.get(...)` / `@app.post(...)`**: decoratori che collegano una funzione a una rotta HTTP.
- **`yield` nelle dipendenze**: mette a disposizione la risorsa e ne permette la pulizia al termine della richiesta.

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI, BackgroundTasks

@asynccontextmanager
async def lifespan(app: FastAPI):
    print('Avvio risorse')
    # yield produce un valore e conserva lo stato del generatore.
    yield
    print('Chiusura risorse')

app = FastAPI(lifespan=lifespan)

def log_event(task_id: int):
    print('Task creata:', task_id)

@app.post('/tasks/notify')
def notify(background_tasks: BackgroundTasks):
    background_tasks.add_task(log_event, 42)
    return {'accepted': True}
```

**Attenzione:** `BackgroundTasks` non è una coda durabile.  
Per job lunghi, critici o pesanti usa worker/queue esterni.  
Non usare `time.sleep()` dentro `async def`: blocca l'event loop; usa `await asyncio.sleep(...)` per attese simulate.
