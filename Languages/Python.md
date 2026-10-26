# Python — Cheatsheet

> **Quando serve:** scripting, backend, automazione, analisi dati e AI. Punta su leggibilità, ambienti isolati e tipi quando aiutano a capire i contratti.

Python usa **indentazione** per delimitare i blocchi. Liste/dizionari sono mutabili; tuple/stringhe sono immutabili. I type hint aiutano editor e type checker ma **non vengono applicati automaticamente a runtime**.

## Sintassi al volo

| Ti serve | Sintassi |
|---|---|
| Condizioni | `if x > 0: ... elif x == 0: ... else: ...` |
| Ciclo | `for item in items:` |
| Indice + valore | `for i, item in enumerate(items):` |
| Comprensione | `[n * 2 for n in nums if n > 0]` |
| Dizionario | `user.get('name', 'Ospite')` |
| Eccezione | `try: ... except ValueError: ...` |
| Risorsa | `with open(path) as f:` |
| Argomenti variabili | `*args` (posizionali), `**kwargs` (keyword) |
| Unione tipi | `str | None` (Python moderno) |
| Import | `from pathlib import Path` |

```python
orders = [
    {'id': 1, 'amount': 30, 'paid': True},
    {'id': 2, 'amount': 15, 'paid': False},
]

# Comprehension: nuova lista composta solo da ordini pagati.
paid_amounts = [order['amount'] for order in orders if order['paid']]
revenue = sum(paid_amounts)

# Usa .get per un campo facoltativo proveniente da dati esterni.
customer = {'id': 7, 'name': 'Ada'}
customer_name = customer.get('name', 'Ospite')
```

## Concetti applicati

### Funzioni, parametri e return

```python
from decimal import Decimal, ROUND_HALF_UP

# Calcolo in un sistema di fatturazione: Decimal evita i tipici
# errori binari dei float con importi monetari.
def gross_price(net: Decimal, vat_rate: Decimal) -> Decimal:
    amount = net * (Decimal('1') + vat_rate)
    return amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

print(gross_price(Decimal('19.90'), Decimal('0.22')))

# Un parametro di default mutabile verrebbe condiviso tra chiamate.
# `None` permette invece di costruire una lista nuova ogni volta.
def append_tag(tag: str, tags: list[str] | None = None) -> list[str]:
    result = [] if tags is None else tags.copy()
    result.append(tag)
    return result
```

### Iteratori, generatori e decoratori

```python
# Elaborazione lazy: leggi il CSV riga per riga, senza creare una
# lista gigante in memoria. Usa orders.csv della Recipe pandas + SQL.
import csv
from collections.abc import Iterator
from pathlib import Path

def paid_orders(path: Path) -> Iterator[dict[str, str]]:
    with path.open(newline='', encoding='utf-8') as file:
        for order in csv.DictReader(file):
            if order['status'] == 'paid':
                yield order  # Il ciclo riprende da qui alla prossima iterazione.

for order in paid_orders(Path('orders.csv')):
    print(order['order_id'], order['amount'])

from functools import wraps

# Un decoratore avvolge una funzione (es. per registrare chiamate).
# Non registrare password o dati sensibili nei log reali.
def log_calls(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        print(f'Calling {fn.__name__}')
        return fn(*args, **kwargs)
    return wrapper
```

### Classi e dataclass

```python
from dataclasses import dataclass

@dataclass
class Product:
    id: int
    name: str
    price: float

product = Product(id=1, name='Libro', price=12.0)
```

---

```python
from pathlib import Path
import csv
import json

# Pathlib evita di costruire path con concatenazioni fragili.
path = Path('orders.json')
path.write_text(json.dumps(orders, indent=2), encoding='utf-8')
loaded = json.loads(path.read_text(encoding='utf-8'))

with Path('orders.csv').open('w', newline='', encoding='utf-8') as file:
    writer = csv.DictWriter(file, fieldnames=['id', 'amount', 'paid'])
    writer.writeheader()
    writer.writerows(orders)
```

Setup rapido, da terminale:

```bash
python3 -m venv .venv
source .venv/bin/activate      # macOS/Linux
python -m pip install pytest
python -m pytest
```

**Attenzione:** `is` confronta l'identità, `==` il valore; usa `is None` per `None`. `async def` non rende automaticamente parallelo il codice CPU-bound.

### Eccezioni, moduli e resource management

```python
import json
from pathlib import Path

class InvalidOrderError(ValueError):
    """L'ordine non contiene i campi necessari al report."""


def load_order(path: Path) -> dict:
    try:
        # `with` chiude il file anche se il parsing solleva un'eccezione.
        with path.open(encoding='utf-8') as handle:
            order = json.load(handle)
    except (OSError, json.JSONDecodeError) as exc:
        raise InvalidOrderError(f'Cannot read order: {path}') from exc

    if 'total_cents' not in order:
        raise InvalidOrderError('Missing total_cents')
    return order
```

`raise ... from exc` conserva la causa originale. Un package distribuito tramite `pyproject.toml` raccoglie moduli importabili: separa logica riutilizzabile, entrypoint e test, anziché mettere tutto in un notebook o in un unico script.

### Classi e test di business logic

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class OrderItem:
    sku: str
    price_cents: int
    quantity: int

    def subtotal_cents(self) -> int:
        if self.quantity <= 0 or self.price_cents < 0:
            raise ValueError('Invalid item')
        return self.price_cents * self.quantity


def test_order_item_subtotal():
    # pytest scopre funzioni test_* nel file test_orders.py.
    item = OrderItem(sku='BOOK-1', price_cents=1299, quantity=2)
    assert item.subtotal_cents() == 2598
```

`@dataclass(frozen=True)` evita riassegnazioni normali agli attributi ma non rende profondamente immutabile ogni oggetto annidato. `@property`, ereditarietà e protocolli sono utili se hai davvero un contratto da modellare, non per ogni dizionario.

### Async, thread e processi: che cosa cambia

```python
import asyncio

async def load_many_products(client, ids: list[int]) -> list[dict]:
    # `client` è un httpx.AsyncClient fornito dal chiamante.
    async def load_one(product_id: int) -> dict:
        response = await client.get(f'/products/{product_id}')
        response.raise_for_status()
        return response.json()

    # I/O concorrente, non elaborazione CPU in parallelo.
    return await asyncio.gather(*(load_one(pid) for pid in ids))
```

**Memoria e concorrenza in breve:** `yield` sospende il generatore conservando solo il suo stato, invece di materializzare subito tutti gli elementi. `asyncio` alterna task mentre attendono I/O; i thread condividono la memoria del processo; i processi separati hanno spazi di memoria distinti. Nelle build CPython tradizionali il **GIL** limita l'esecuzione parallela di bytecode Python nei thread (sono disponibili anche build free-threaded): per CPU-bound valuta processi o librerie native. Approfondisci su [asyncio](https://docs.python.org/3/library/asyncio.html) e [threading / GIL](https://docs.python.org/3/library/threading.html).

## Domande da colloquio

**Lista vs tupla?** Lista mutabile; tupla immutabile e utilizzabile anche per raggruppare valori strutturati.

**`*args` e `**kwargs`?** Raccolgono rispettivamente argomenti posizionali e nominati.

**Iterable vs iterator?** Un iterable fornisce iteratori; un iterator produce gli elementi progressivamente con `next()`.

**Generator?** Iteratore costruito con `yield`, utile per elaborazioni lazy.

**Shallow vs deep copy?** Copia superficiale mantiene riferimenti interni; deep copy prova a copiare ricorsivamente.

**Approfondisci quando serve:** [Python — funzioni](https://docs.python.org/3/tutorial/controlflow.html#defining-functions), [data model](https://docs.python.org/3/reference/datamodel.html) e [itertools/generatori](https://docs.python.org/3/library/itertools.html). Per costi e memoria di iteratori vs liste, inizia dal fatto che `yield` produce elementi su richiesta.
