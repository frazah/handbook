# Python — Cheatsheet rapida

```python
items = [1, 2, 3]
squares = [n*n for n in items if n > 1]
user = {'name': 'Ada', 'age': 28}
name = user.get('name', 'ospite')

def total(prices: list[float]) -> float:
    return round(sum(prices), 2)

try:
    number = int('42')
except ValueError:
    number = 0

from pathlib import Path
text = Path('data.txt').read_text(encoding='utf-8')
```

| Strumento | Uso |
|---|---|
| `enumerate` | indice + valore |
| `zip` | accoppia iterabili |
| `sorted` | nuova lista ordinata |
| `dict.get` | default senza `KeyError` |
| `dataclass` | modello dati |
| `with` | gestione risorse |
| `yield` | generatore lazy |
| `pytest` | test |

**Comandi:** `python3 -m venv .venv`, `source .venv/bin/activate`, `python -m pip install ...`, `python -m pytest -q`.

**Docs:** https://docs.python.org/3/tutorial/

---

## Fondamenti: controllo di flusso, funzioni, sintassi

| Caso | Sintassi |
|---|---|
| Variabile | `price = 19.9` |
| Condizione | `if ready: ...` / `elif ...:` / `else:` |
| Ciclo | `for item in items:` |
| Ciclo condizionale | `while condition:` |
| Indice e valore | `for i, value in enumerate(items):` |
| Due liste | `for a, b in zip(xs, ys):` |
| Funzione | `def total(items: list[float]) -> float:` |
| Default parametro | `def greet(name='ospite'):` |
| Varargs | `def f(*args, **kwargs):` |
| Comprehension | `[x * 2 for x in items if x > 0]` |
| Dict comprehension | `{x['id']: x for x in rows}` |
| String formattata | `f'{name}: {price:.2f}'` |
| Slicing | `items[1:4]`, `items[::-1]` |
| Default | `value = mapping.get('key', 0)` |
| Verifica nullo | `if value is None:` |
| Controllo tipo | `isinstance(value, int)` |
| Esce con errore | `raise ValueError('messaggio')` |

```python
# Elabora un ordine e crea un riepilogo leggibile.
orders = [{'total': 12.5, 'paid': True}, {'total': 5, 'paid': False}]
paid = [order['total'] for order in orders if order['paid']]
print(f'Totale pagato: {sum(paid):.2f} €')
```

## File, errori, classi, generatori

```python
from pathlib import Path
import json
from dataclasses import dataclass

@dataclass
class Task:
    title: str
    done: bool = False

# with gestisce automaticamente la chiusura del file.
path = Path('tasks.json')
path.write_text(json.dumps([{'title': 'Studiare', 'done': False}]), encoding='utf-8')

try:
    tasks = json.loads(path.read_text(encoding='utf-8'))
except (OSError, json.JSONDecodeError) as exc:
    print(f'Errore lettura: {exc}')
    tasks = []
```

| Concetto | Sintassi essenziale |
|---|---|
| Set | `{1, 2}` (senza duplicati) |
| Tuple | `(x, y)` (immutabile) |
| Generatore | `def ids(): yield 1` |
| Decoratore | `@dataclass` oppure `@property` |
| Context manager | `with open(path) as file:` |
| Import | `from pathlib import Path` |
| Test pytest | `def test_total(): assert total([1,2]) == 3` |
| Asincronia | `async def main(): await operation()` |
| Esegue come script | `if __name__ == '__main__':` |

**Tipi Python:** `list[str]`, `dict[str, int]`, `str | None` sono annotazioni: utili per IDE e type checker, ma non validano automaticamente gli input.
