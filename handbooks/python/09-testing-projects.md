# Test, progetti e automazione

**Idea.** Separa funzioni pure da input/output: diventano facili da testare senza file, rete o DB.

**Prima di leggere il codice — simboli e termini:**

- **`def`**: dichiara una funzione, cioè un blocco riutilizzabile di operazioni.
- **`->`**: annotazione di tipo del risultato: Python non la impone a runtime.
- **`with`**: gestisce apertura/chiusura sicura di una risorsa tramite un context manager.

```python
# pricing.py
def apply_discount(total: float, percent: float) -> float:
    if not 0 <= percent <= 100:
        raise ValueError("Sconto non valido")
    return round(total * (1 - percent / 100), 2)

# test_pricing.py (con pytest installato)
from pricing import apply_discount
import pytest

def test_discount():
    assert apply_discount(100, 20) == 80

def test_invalid_discount():
    with pytest.raises(ValueError):
        apply_discount(100, 120)
```

```bash
python -m pip install pytest
python -m pytest -q
```

**Organizzazione consigliata:** `src/<package>/`, `tests/`, `pyproject.toml`, `README.md`, `.gitignore`.  
Per script piccoli sono sufficienti `main.py` e test.

**Errore comune:** scrivere codice con side effect all'import.
Metti l'avvio dietro `if __name__ == '__main__': main()`.
