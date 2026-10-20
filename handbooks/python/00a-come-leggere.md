<!-- level: Fondamenti -->
<!-- summary: Come leggere Python: indentazione, annotazioni, unpacking, comprehension, decorator e async -->
# Prima di Python: guida alla sintassi

Questa pagina è un dizionario di lettura, non una prova di memoria.
Parti dalla versione esplicita e riconosci le abbreviazioni solo dopo.

## 1. Blocchi e indentazione

Python non usa `{}` per delimitare i blocchi: usa i **due punti** e l'**indentazione**.

```python
is_paid = True

if is_paid:
    # Le quattro spaziature indicano l'interno dell'if.
    print("Ordine pagato")
else:
    print("Ordine in attesa")
```

## 2. Tipi: `: str`, `-> float`, `str | None`

Sono **annotazioni** per documentare il codice e aiutare editor/type checker.
Python non le trasforma automaticamente in validazione a runtime.

```python
# name è una stringa; il risultato atteso è una stringa.
def greet(name: str) -> str:
    return f"Ciao {name}"

# Il risultato può essere una stringa oppure None.
def find_coupon(code: str) -> str | None:
    if code == "WELCOME":
        return "10%"
    return None
```

## 3. `*`, `**` e parametri dopo `*`

```python
def total(*prices: float) -> float:
    # *prices raccoglie più argomenti in una tuple.
    return sum(prices)

print(total(10, 20, 5))

options = {"encoding": "utf-8"}
# **options espande il dizionario in argomenti per nome.
# Esempio: funzione(encoding="utf-8")
print("Configurazione:", options)
```

Una firma `def f(a, *, verbose=False)` richiede che `verbose` sia passato per nome: `f(1, verbose=True)`.

## 4. Comprehension e generatori

```python
prices = [5, 12, 20]

# Versione estesa: filtra e costruisce una nuova lista.
expensive = []
for price in prices:
    if price > 10:
        expensive.append(price)

# Versione abbreviata equivalente: comprehension.
expensive = [price for price in prices if price > 10]

# yield produce valori progressivamente, senza creare la lista in anticipo.
def paid_ids():
    # yield sospende l’esecuzione e restituisce un valore al chiamante.
    yield "O-1"
    yield "O-3"
```

## 5. Decoratori e asincronia

`@decorator` applica una trasformazione a una funzione o classe; per esempio `@dataclass` genera alcuni metodi utili.
`async def` dichiara una coroutine: `await` attende operazioni asincrone in una funzione `async`.

```python
import asyncio

async def load_order():
    # Simula una I/O non bloccante, NON un calcolo parallelo.
    await asyncio.sleep(0.01)
    return {"id": "O-1"}

# asyncio.run avvia il ciclo eventi in uno script; evita cicli già attivi.
print(asyncio.run(load_order()))
```

**Da ricordare:** negli esempi successivi le sintassi vengono riutilizzate senza doverle imparare tutte contemporaneamente.
