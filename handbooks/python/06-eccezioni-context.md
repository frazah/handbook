# Eccezioni, logging e context manager

**Idea.** Un'eccezione interrompe il flusso normale.
Cattura solo errori prevedibili e specifici; usa `finally` per rilascio risorse o `with` per contesti gestiti.

**Prima di leggere il codice — simboli e termini:**

- **`def`**: dichiara una funzione, cioè un blocco riutilizzabile di operazioni.
- **`->`**: annotazione di tipo del risultato: Python non la impone a runtime.

```python
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)

def load_settings(path: Path) -> dict:
    try:
        import json
        # Converte un testo JSON in oggetti Python.
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        logging.warning("Configurazione assente: uso default")
        return {}
    except ValueError as exc:
        raise ValueError(f"JSON non valido in {path}") from exc
```

## Creare eccezioni del dominio

```python
# Questo esempio mostra come trasformare i dati in un risultato utilizzabile.
class OutOfStockError(Exception):
    pass

def reserve(stock: int, quantity: int) -> int:
    if quantity > stock:
        raise OutOfStockError("Quantità non disponibile")
    return stock - quantity
```

**Errore comune:** `except Exception: pass` nasconde bug e problemi di produzione.  
Per errori inattesi logga e lascia propagare o gestisci a un confine chiaro.
