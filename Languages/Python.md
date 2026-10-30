# Python

> Linguaggio per scripting, backend, dati e AI. Leggibile, "batteries included", tipizzazione dinamica con type hint opzionali.
> Collegate: [Pattern algoritmici](../Fundamentals/Pattern%20algoritmici.md) · [FastAPI](../Web%20%26%20Backend/FastAPI.md) · [Data Science](../Data%20%26%20AI/Data%20Science.md)

## Modello mentale

- **Tutto è un oggetto** e le variabili sono **nomi che puntano a oggetti**, non scatole. `b = a` non copia nulla: entrambi i nomi puntano allo stesso oggetto.
- **Mutabili** (`list`, `dict`, `set`, oggetti custom) vs **immutabili** (`int`, `str`, `tuple`, `frozenset`). Modificare un oggetto mutabile si vede da tutti i nomi che lo referenziano.
- Gli argomenti sono passati **per riferimento all'oggetto**: una funzione può mutare una lista ricevuta, ma riassegnare il parametro non tocca il chiamante.
- Lo scope si risolve con la regola **LEGB**: Local → Enclosing → Global → Built-in.
- I **type hint non sono controllati a runtime**: servono a editor e type checker (mypy, pyright).
- **CPython** gestisce la memoria con reference counting più un garbage collector per i cicli. Il **GIL** permette a un solo thread alla volta di eseguire bytecode Python (le build free-threaded da 3.13 lo rimuovono, in via sperimentale).
- Filosofia **EAFP** ("chiedi perdono, non permesso"): prova l'operazione e gestisci l'eccezione, invece di controllare tutto prima.

## Sintassi al volo

| Ti serve | Sintassi |
|---|---|
| Indice + valore | `for i, item in enumerate(items):` |
| Due liste in parallelo | `for sku, qty in zip(skus, quantities):` |
| Comprehension | `[o.total for o in orders if o.paid]` · `{o.id: o for o in orders}` |
| Default sul dict | `d.get("k", 0)` · `d.setdefault("k", [])` |
| Unpacking | `first, *rest = items` · `a, b = b, a` |
| f-string | `f"{total_cents / 100:.2f} €"` · `f"{value=}"` (debug) |
| Ternario | `label = "paid" if paid else "pending"` |
| Walrus | `if (n := len(items)) > 10:` |
| Slicing | `a[::-1]` (inversa) · `a[-3:]` (ultimi 3) |
| Tipi | `list[int]`, `dict[str, int]`, `str \| None` |
| Pattern matching (3.10+) | `match event: case {"type": "paid", "id": oid}: ...` |

## Strutture dati built-in

Il costo delle operazioni è spiegato in [Big-O e strutture dati](../Fundamentals/Big-O%20e%20strutture%20dati.md).

### Lista (`list`): sequenza ordinata e mutabile

| Operazione | Sintassi | Costo |
|---|---|---|
| Dichiarare | `skus = []` · `skus = ["MUG", "PEN"]` · `list(range(5))` · `[0] * n` | |
| Leggere / scrivere | `skus[0]` · `skus[-1]` (ultimo) · `skus[1] = "BAG"` | `O(1)` |
| Aggiungere in coda | `skus.append("BAG")` · `skus.extend(["CAP", "HAT"])` · `skus += [...]` | `O(1)`* |
| Inserire in posizione | `skus.insert(0, "NEW")` | `O(n)` |
| Rimuovere | `skus.pop()` (ultimo, `O(1)`) · `skus.pop(i)` · `skus.remove("PEN")` (prima occorrenza) · `del skus[i]` | `O(n)` |
| Cercare | `"MUG" in skus` · `skus.index("MUG")` · `skus.count("MUG")` | `O(n)` |
| Slicing (copia) | `skus[1:3]` · `skus[:2]` · `skus[::-1]` · `skus[:]` | `O(k)` |
| Ordinare | `skus.sort()` (in place) · `sorted(skus)` (nuova lista) · `key=len, reverse=True` | `O(n log n)` |
| Altro | `len(skus)` · `skus.reverse()` · `skus.clear()` · `min/max/sum(nums)` | |

\* ammortizzato

### Dizionario (`dict`): hash map chiave → valore

Mantiene l'ordine di inserimento (da Python 3.7). Le chiavi devono essere hashable (`str`, `int`, `tuple`, non `list`).

| Operazione | Sintassi | Costo |
|---|---|---|
| Dichiarare | `stock = {}` · `stock = {"MUG": 10, "PEN": 0}` · `dict(MUG=10)` · `dict(zip(keys, values))` | |
| Leggere | `stock["MUG"]` (`KeyError` se manca) · `stock.get("CAP")` (`None`) · `stock.get("CAP", 0)` | `O(1)` |
| Scrivere | `stock["CAP"] = 5` · `stock.update({"MUG": 9, "HAT": 2})` · `stock \|= other` | `O(1)` |
| Default se manca | `stock.setdefault("BAG", 0)` | `O(1)` |
| Più valori per chiave | `groups.setdefault(k, []).append(v)` · `defaultdict(list)` (sotto) | `O(1)` |
| Rimuovere | `del stock["PEN"]` · `stock.pop("PEN")` · `stock.pop("PEN", None)` (senza errore) | `O(1)` |
| Esiste la chiave? | `"MUG" in stock` (controlla le chiavi, non i valori) | `O(1)` |
| Iterare | `for sku in stock` · `stock.keys()` · `stock.values()` · `for sku, qty in stock.items()` | `O(n)` |
| Unire (nuovo dict) | `{**a, **b}` · `a \| b` (a parità di chiave vince `b`) | `O(n)` |
| Ordinare per valore | `sorted(stock.items(), key=lambda kv: kv[1], reverse=True)` | `O(n log n)` |

#### Varianti in `collections`

Sono sottoclassi di `dict`: stessa sintassi, più un comportamento extra.

| Tipo | Cosa aggiunge | Quando |
|---|---|---|
| `defaultdict(factory)` | una chiave mancante viene creata con `factory()` (`list`, `set`, `int`) | raggruppare, contare senza `if k in d` |
| `Counter(iterable)` | conta gli elementi; chiave mancante → `0`; `most_common(n)`, `+`/`-` tra counter | frequenze, anagrammi, top-k |
| `OrderedDict` | `move_to_end(k)` e `popitem(last=False)` (toglie il più vecchio) | cache LRU |

```python
from collections import Counter, OrderedDict, defaultdict

orders = [("ada", "MUG"), ("lin", "PEN"), ("ada", "BAG"), ("ada", "MUG")]

skus_by_customer = defaultdict(list)       # chiave mancante -> []
for name, sku in orders:
    skus_by_customer[name].append(sku)     # niente setdefault né if
assert skus_by_customer["ada"] == ["MUG", "BAG", "MUG"]

sold = Counter(sku for _, sku in orders)   # {"MUG": 2, "PEN": 1, "BAG": 1}
assert sold["CAP"] == 0                    # chiave mancante -> 0, non KeyError
assert sold.most_common(1) == [("MUG", 2)]
assert Counter("listen") == Counter("silent")   # anagrammi

recent = OrderedDict(a=1, b=2, c=3)
recent.move_to_end("a")                    # "a" diventa il più recente
assert recent.popitem(last=False) == ("b", 2)   # esce il meno recente
```

Attenzione: con `defaultdict` anche una lettura (`d["zoe"]`) inserisce la chiave; per controllare usa `"zoe" in d`.

### Set: elementi unici, non ordinati

| Operazione | Sintassi | Costo |
|---|---|---|
| Dichiarare | `seen = set()` (**non** `{}`, che è un dict vuoto) · `{"MUG", "PEN"}` · `set(skus)` | |
| Aggiungere / rimuovere | `seen.add("MUG")` · `seen.update(skus)` · `seen.remove("X")` (`KeyError`) · `seen.discard("X")` | `O(1)` |
| Appartenenza | `"MUG" in seen` | `O(1)` |
| Unione / intersezione | `a \| b` · `a & b` | `O(len(a) + len(b))` |
| Differenza / simmetrica | `a - b` · `a ^ b` (in uno solo dei due) | |
| Sottoinsieme | `a <= b` · `a.issubset(b)` · `a.isdisjoint(b)` | |

`frozenset` è la versione immutabile e hashable, utilizzabile come chiave di un dict o elemento di un set.

### Tupla (`tuple`): sequenza immutabile

| Operazione | Sintassi |
|---|---|
| Dichiarare | `point = (3, 4)` · `single = (5,)` (la virgola è obbligatoria) · `tuple(skus)` |
| Spacchettare | `x, y = point` · `sku, *rest = ("MUG", 2, 1299)` |
| Record con nomi | `from typing import NamedTuple` → `class Item(NamedTuple): sku: str; qty: int` |

Si usa per valori a dimensione fissa (coordinate, chiavi composte come `(customer_id, month)`) e per restituire più valori da una funzione.

### Deque e heap

| Struttura | Dichiarare | Operazioni (`O(1)` / `O(log n)`) |
|---|---|---|
| `deque` (coda a due estremi) | `from collections import deque` → `q = deque([1, 2])` · `deque(maxlen=3)` | `append`, `appendleft`, `pop`, `popleft`, `q[0]` |
| Heap (min-heap su una lista) | `import heapq` → `h = []` · `heapq.heapify(nums)` | `heappush(h, x)`, `heappop(h)`, `h[0]` (minimo) |

### Comprehension e trasformazioni

```python
orders = [("ada", "MUG", 2), ("lin", "PEN", 5), ("ada", "BAG", 1)]

customers = [name for name, _, _ in orders]                 # lista: ['ada', 'lin', 'ada']
unique_customers = {name for name, _, _ in orders}          # set: {'ada', 'lin'}
qty_by_sku = {sku: qty for _, sku, qty in orders}           # dict: {'MUG': 2, 'PEN': 5, 'BAG': 1}
big = [sku for _, sku, qty in orders if qty >= 2]           # con filtro: ['MUG', 'PEN']
labels = ["bulk" if q >= 5 else "std" for _, _, q in orders]  # con ternario

matrix = [[0] * 3 for _ in range(2)]                        # lista 2D (righe indipendenti)
flat = [x for row in matrix for x in row]                   # appiattire: cicli nell'ordine dei for
inverted = {qty: sku for sku, qty in qty_by_sku.items()}    # invertire un dict

assert unique_customers == {"ada", "lin"} and big == ["MUG", "PEN"]
assert inverted[5] == "PEN" and len(flat) == 6
```

## Riferimenti e mutabilità

```python
cart = ["MUG-2"]
alias = cart          # stesso oggetto, nessuna copia
alias.append("PEN-3")
assert cart == ["MUG-2", "PEN-3"]

grid = [[0] * 3] * 2  # ERRORE classico: due riferimenti alla stessa riga
grid[0][0] = 1
assert grid == [[1, 0, 0], [1, 0, 0]]
grid = [[0] * 3 for _ in range(2)]  # corretto: righe indipendenti
```

- `==` confronta il **valore**, `is` l'**identità**. Usa `is` solo con `None`: `if x is None`.
- Copie: `list(a)` e `a.copy()` sono **superficiali**; `copy.deepcopy(a)` copia anche gli oggetti annidati.
- Falsy: `None`, `0`, `""`, `[]`, `{}`, `set()`. Attenzione: `if not total:` è vero anche quando `total == 0`.

## Funzioni

```python
def apply_discount(total_cents: int, *, percent: int = 10) -> int:
    """`*` rende `percent` keyword-only: apply_discount(5000, percent=20)."""
    return total_cents * (100 - percent) // 100

def add_tag(tag: str, tags: list[str] | None = None) -> list[str]:
    # Mai `tags=[]`: il default è valutato UNA volta e condiviso tra le chiamate.
    tags = [] if tags is None else tags
    tags.append(tag)
    return tags

assert apply_discount(5000, percent=20) == 4000
```

- `*args` raccoglie gli argomenti posizionali in una tupla, `**kwargs` quelli nominati in un dict.
- Le funzioni sono oggetti: si passano come argomento (`sorted(orders, key=total)`) e si restituiscono.

### Closure e scope

```python
def make_counter():
    count = 0
    def increment() -> int:
        nonlocal count  # senza, `count += 1` creerebbe una variabile locale -> UnboundLocalError
        count += 1
        return count
    return increment

next_id = make_counter()
assert (next_id(), next_id()) == (1, 2)
```

## Iteratori e generatori

Un **iterable** sa produrre un iteratore (`iter(x)`); un **iteratore** restituisce un elemento alla volta (`next(it)`) e si esaurisce. Un **generatore** è una funzione con `yield`: calcola i valori *pigramente*, uno alla volta, usando memoria costante.

```python
from collections.abc import Iterator

def paid_totals(rows: list[dict]) -> Iterator[int]:
    for row in rows:
        if row["status"] == "paid":
            yield row["total_cents"]  # sospende qui fino al prossimo next()

rows = [{"status": "paid", "total_cents": 2599}, {"status": "pending", "total_cents": 990}]
assert sum(paid_totals(rows)) == 2599
assert sum(r["total_cents"] for r in rows) == 3589  # generator expression: niente lista intermedia
```

## Decoratori

Un decoratore è una funzione che riceve una funzione e ne restituisce un'altra che la avvolge. `@deco` sopra `def f` equivale a `f = deco(f)`.

```python
import functools, time

def timed(fn):
    @functools.wraps(fn)  # conserva __name__ e docstring dell'originale
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            return fn(*args, **kwargs)
        finally:
            print(f"{fn.__name__}: {time.perf_counter() - start:.3f}s")
    return wrapper

@timed
def build_report(n: int) -> int:
    return sum(range(n))

build_report(1_000)  # stampa "build_report: 0.000s"
```

## Context manager

`with` garantisce la pulizia (chiudere file, connessioni, lock) anche in caso di eccezione: chiama `__enter__` all'inizio e `__exit__` alla fine.

```python
import sqlite3
from contextlib import closing

with closing(sqlite3.connect(":memory:")) as conn:   # chiude la connessione all'uscita
    with conn:                                       # transazione: commit o rollback automatico
        conn.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY, total_cents INTEGER)")
        conn.execute("INSERT INTO orders (total_cents) VALUES (?)", (2599,))
    assert conn.execute("SELECT SUM(total_cents) FROM orders").fetchone() == (2599,)
```

Per scriverne uno al volo: `@contextlib.contextmanager` con un `yield` dentro un `try/finally`.

## Classi e dataclass

```python
from dataclasses import dataclass, field

@dataclass(frozen=True)  # immutabile e hashable: utilizzabile come chiave di un dict
class OrderItem:
    sku: str
    unit_price_cents: int
    quantity: int = 1

@dataclass
class Order:
    id: int
    items: list[OrderItem] = field(default_factory=list)  # mai `= []`

    @property
    def total_cents(self) -> int:  # calcolato, si legge come un attributo
        return sum(i.unit_price_cents * i.quantity for i in self.items)

order = Order(101, [OrderItem("MUG-2", 1299, 2)])
assert order.total_cents == 2598
```

- **Dunder method** (metodi "magici") collegano la classe alla sintassi: `__repr__`, `__eq__`, `__hash__`, `__len__`, `__iter__`, `__lt__` (per `sorted`). `@dataclass` genera `__init__`, `__repr__` e `__eq__`.
- `@classmethod` riceve la classe (costruttori alternativi: `Order.from_dict(...)`); `@staticmethod` non riceve nulla.
- Ereditarietà multipla: l'ordine di risoluzione è l'**MRO** (`Cls.__mro__`), e `super()` segue l'MRO.
- Preferisci la composizione all'ereditarietà; per contratti senza ereditarietà usa `typing.Protocol` (duck typing verificato dal type checker).

## Eccezioni

```python
class OutOfStockError(Exception):
    """Errore di dominio: il chiamante può gestirlo in modo specifico."""

def reserve(stock: dict[str, int], sku: str, qty: int) -> None:
    try:
        available = stock[sku]
    except KeyError as exc:
        raise ValueError(f"SKU sconosciuto: {sku}") from exc  # `from` conserva la causa
    if available < qty:
        raise OutOfStockError(f"{sku}: disponibili {available}")
    stock[sku] = available - qty
```

- `try / except / else` (eseguito se non ci sono eccezioni) `/ finally` (sempre).
- Cattura eccezioni **specifiche**: un `except Exception:` generico nasconde i bug.

## Concorrenza: asyncio, thread, processi

| | Quando | Nota |
|---|---|---|
| `asyncio` | tanto I/O concorrente (HTTP, DB) | un solo thread; i task cedono il controllo a ogni `await` |
| `threading` / `ThreadPoolExecutor` | I/O con librerie bloccanti | il GIL blocca il parallelismo CPU, non l'I/O |
| `multiprocessing` / `ProcessPoolExecutor` | lavoro CPU-bound | processi separati, ognuno con il proprio GIL; dati serializzati |

```python
import asyncio

async def fetch_stock(sku: str) -> int:
    await asyncio.sleep(0.1)  # simula una chiamata di rete
    return len(sku)

async def main() -> list[int]:
    # gather esegue le coroutine in concorrenza: ~0.1s totali, non 0.3s
    return await asyncio.gather(*(fetch_stock(s) for s in ["MUG", "PEN", "BAG-4"]))

assert asyncio.run(main()) == [3, 3, 5]
```

Una chiamata bloccante (`time.sleep`, `requests.get`) dentro una `async def` blocca **tutto** l'event loop.

## Progetti e test

```bash
python3 -m venv .venv && source .venv/bin/activate   # ambiente isolato per progetto
python -m pip install pytest
python -m pytest -q
```

Dipendenze e metadati vanno in `pyproject.toml`. Con pytest i test sono funzioni `test_*` con semplici `assert`:

```python
# illustrativo: file test_pricing.py, eseguito da pytest
import pytest
from pricing import apply_discount

@pytest.mark.parametrize("total, percent, expected", [(5000, 10, 4500), (999, 0, 999)])
def test_apply_discount(total, percent, expected):
    assert apply_discount(total, percent=percent) == expected

@pytest.fixture
def stock() -> dict[str, int]:  # ogni test riceve un dict nuovo
    return {"MUG-2": 1}
```

## Per gli esercizi di coding

| Strumento | Uso tipico |
|---|---|
| `Counter(xs)` | frequenze; `.most_common(k)`; `c1 == c2` per gli anagrammi |
| `defaultdict(list)` | raggruppare senza controllare se la chiave esiste |
| `deque` | coda BFS: `append`, `popleft` in `O(1)` |
| `heapq` | min-heap: `heappush`, `heappop`, `nlargest`; max-heap con `-x` |
| `bisect_left(a, x)` | posizione di inserimento in una lista ordinata, `O(log n)` |
| `sorted(xs, key=..., reverse=True)` | ordinamento **stabile**; chiavi multiple con tuple |
| `itertools` | `accumulate` (prefix sum), `combinations`, `permutations`, `product`, `pairwise`, `groupby` |
| `functools.cache` | memoization per la DP top-down |
| `math.inf`, `float("inf")` | valore iniziale per i minimi |

```python
import heapq
from bisect import bisect_left
from collections import Counter, defaultdict
from itertools import accumulate

orders = [("ada", 2599), ("lin", 1200), ("ada", 990)]

by_customer = defaultdict(list)
for name, cents in orders:
    by_customer[name].append(cents)                # raggruppa
assert by_customer["ada"] == [2599, 990]

ranked = sorted(orders, key=lambda o: (-o[1], o[0]))  # totale decrescente, poi nome
assert ranked[0] == ("ada", 2599)

assert list(accumulate([1, 2, 3])) == [1, 3, 6]     # prefix sum
assert bisect_left([10, 20, 30], 25) == 2
assert Counter("listen") == Counter("silent")       # anagrammi

heap = []
for cents in (2599, 1200, 990):
    heapq.heappush(heap, -cents)                    # max-heap con valori negati
assert -heap[0] == 2599
```

**Trappole frequenti:**
- La ricorsione profonda supera il limite (~1000): `sys.setrecursionlimit(10**6)` oppure riscrivi in modo iterativo.
- Costruire stringhe con `+=` in un ciclo: usa `"".join(parts)`.
- `list.pop(0)` e `x in list` costano `O(n)`: usa `deque` e `set`.
- Gli interi hanno precisione arbitraria (niente overflow); la divisione intera è `//`, e `-7 // 2 == -4` (arrotonda verso -∞).

## Domande da colloquio

**Base**
- **Lista vs tupla?** La lista è mutabile; la tupla è immutabile, quindi hashable se lo sono i suoi elementi (usabile come chiave) e adatta a record a dimensione fissa.
- **`==` vs `is`?** `==` confronta i valori tramite `__eq__`, `is` l'identità dell'oggetto. Si usa `is` per `None`.
- **Perché i default mutabili sono un problema?** Sono valutati una sola volta, alla definizione della funzione, e quindi condivisi tra le chiamate. Si usa `None` come sentinella.
- **Cosa sono `*args` e `**kwargs`?** Raccolgono gli argomenti posizionali (tupla) e nominati (dict) extra; servono anche a inoltrare argomenti nei decoratori.
- **Python è interpretato o compilato?** CPython compila il sorgente in bytecode (i file `.pyc`) e lo esegue su una macchina virtuale: è entrambe le cose, e il bytecode non è codice nativo.
- **A cosa servono `__init__` e `self`?** `__init__` inizializza un'istanza già creata (la crea `__new__`); `self` è il riferimento esplicito all'istanza, passato automaticamente quando chiami un metodo.

**Intermedio**
- **Generatore vs lista?** Il generatore produce valori su richiesta con memoria `O(1)` e può essere infinito; la lista materializza tutto ma è riutilizzabile e indicizzabile.
- **Come funziona un decoratore?** È una funzione di ordine superiore: `@d` su `f` equivale a `f = d(f)`. `functools.wraps` conserva i metadati della funzione originale.
- **Shallow vs deep copy?** La copia superficiale crea un nuovo contenitore con gli stessi oggetti interni; la `deepcopy` duplica ricorsivamente anche questi.
- **Cosa fa `with`?** Chiama `__enter__` e garantisce `__exit__` anche in caso di eccezione: è il modo idiomatico di gestire le risorse.
- **Cos'è l'MRO?** L'ordine in cui Python cerca metodi e attributi nelle gerarchie con ereditarietà multipla (linearizzazione C3); `super()` lo segue.
- **`@staticmethod` vs `@classmethod`?** Il classmethod riceve la classe (`cls`) ed è adatto a costruttori alternativi che funzionano anche con le sottoclassi; lo staticmethod non riceve nulla ed è una funzione raggruppata nella classe.
- **Come implementi una cache LRU?** Con `functools.lru_cache(maxsize=…)` se basta memoizzare una funzione; a mano con un `OrderedDict`: `move_to_end` a ogni accesso e `popitem(last=False)` quando superi la capacità, tutto in `O(1)`.

**Avanzato**
- **Cos'è il GIL e che impatto ha?** Un lock che permette a un solo thread di eseguire bytecode Python. Il lavoro CPU-bound non scala con i thread (si usano processi o librerie native); l'I/O sì, perché il GIL viene rilasciato durante l'attesa.
- **asyncio vs thread?** asyncio usa un solo thread con multitasking cooperativo: è leggero e scala a migliaia di connessioni, ma richiede librerie async e non tollera chiamate bloccanti. I thread funzionano con codice bloccante ma costano di più.
- **Come gestisce la memoria CPython?** Con il reference counting (un oggetto viene liberato quando i riferimenti arrivano a zero) più un GC generazionale che raccoglie i cicli di riferimenti.
- **Perché i type hint non bastano per validare input esterni?** Non vengono controllati a runtime: per i dati in ingresso serve una validazione esplicita (es. Pydantic in [FastAPI](../Web%20%26%20Backend/FastAPI.md)).

## Approfondisci

- [Python Tutorial](https://docs.python.org/3/tutorial/) · [Data model](https://docs.python.org/3/reference/datamodel.html)
- [`collections`](https://docs.python.org/3/library/collections.html) · [`itertools`](https://docs.python.org/3/library/itertools.html) · [`asyncio`](https://docs.python.org/3/library/asyncio.html)
- [pytest](https://docs.pytest.org/) · [Packaging (pyproject.toml)](https://packaging.python.org/en/latest/guides/writing-pyproject-toml/)
