# Generatori, decorator e async

**Idea.** Un generatore produce valori uno alla volta (`yield`), utile quando i dati sono molti; `async` consente di attendere IO senza bloccare il loop, non accelera automaticamente il calcolo CPU.

**Prima di leggere il codice — simboli e termini:**

- **`def`**: dichiara una funzione, cioè un blocco riutilizzabile di operazioni.
- **`->`**: annotazione di tipo del risultato: Python non la impone a runtime.
- **`@decorator`**: sintassi che applica una funzione/classe decoratrice a una definizione.

```python
def invoice_ids(records: list[dict]):
    for row in records:
        if row["paid"]:
            # yield produce un valore e conserva lo stato del generatore.
            yield row["id"]

print(list(invoice_ids([{"id": 1, "paid": True}])))
```

## Decorator semplice

```python
# Questo esempio mostra come trasformare i dati in un risultato utilizzabile.
from functools import wraps

def traced(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print("Chiamata:", func.__name__)
        return func(*args, **kwargs)
    return wrapper

@traced
def greet(name: str) -> str:
    return f"Ciao {name}"
```

## Async IO

```python
import asyncio

async def fetch_simulated():
    # await sospende questa funzione async mentre aspetta un risultato.
    await asyncio.sleep(0.1)  # esempio di attesa non bloccante
    return {"ok": True}

print(asyncio.run(fetch_simulated()))
```

**Errore comune:** chiamare una funzione `async` senza `await`: ottieni una coroutine, non il risultato.  
In notebook o server con event loop attivo non usare `asyncio.run()` annidato.
