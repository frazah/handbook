# Funzioni, parametri e scope

**Obiettivo:** passare dati a una funzione, ricevere un risultato e capire la differenza tra argomenti posizionali e argomenti per nome.

## 1. Prima la funzione più semplice

```python
# prices è una lista di numeri, -> float descrive il risultato atteso.
def subtotal(prices: list[float]) -> float:
    total = sum(prices)
    return round(total, 2)

print(subtotal([12.50, 7.50]))  # 20.0
```

L'annotazione `list[float]` descrive la forma dell'argomento; `-> float` descrive il risultato.
Non sono controlli automatici sui valori ricevuti: se servono verifiche runtime, devi aggiungerle.

## 2. Parametro solo per nome: che cosa significa `*`?

```python
# Gli argomenti dopo * sono keyword-only: non puoi passarli per posizione.
def subtotal_with_discount(
    prices: list[float],
    *,
    discount: float = 0.0,
) -> float:
    total = sum(prices)
    discounted_total = total * (1 - discount)
    return round(discounted_total, 2)

# Devi scrivere esplicitamente discount=...
print(subtotal_with_discount([12.50, 7.50], discount=0.10))  # 18.0
```

Qui `*` è **diverso** da `*prices` nel prossimo esempio: non raccoglie valori, ma separa i parametri solo per nome.

## 3. `*args` e `**kwargs`: raccolta ed espansione

```python
# *weights raccoglie più argomenti posizionali nella tuple weights.
def shipping_cost(*weights: float) -> float:
    total_weight = sum(weights)
    return total_weight * 1.8

print(shipping_cost(1.0, 2.0))  # 5.4
```

Ora un secondo caso, indipendente dal precedente:

```python
settings = {"discount": 0.15}

# **settings espande il dizionario in argomenti per nome.
# Equivale a subtotal_with_discount([20], discount=0.15).
print(subtotal_with_discount([20], **settings))
```

**Nota:** questo secondo blocco usa `subtotal_with_discount`, dichiarata nella sezione 2. Copialo insieme a quella funzione.

## 4. Default mutabili: un errore insidioso

```python
# Evita: def add_tag(tag, tags=[]).
# La stessa lista verrebbe riutilizzata fra chiamate successive.

def add_tag(
    tag: str,
    tags: list[str] | None = None,
) -> list[str]:
    if tags is None:
        # Crea una lista nuova per questa chiamata.
        tags = []

    # [*tags, tag] crea una lista nuova senza modificare tags.
    return [*tags, tag]
```

`str | None` significa «stringa oppure `None`»; in questo esempio `tags` è una lista oppure `None`.
Lo *spread* `[*tags, tag]` espande gli elementi della lista in una nuova lista.

## 5. Scope: chi vede cosa?

```python
prefix = "O-"  # Variabile definita fuori dalla funzione.

def make_order_id(number: int) -> str:
    # La funzione può leggere prefix nel modulo esterno.
    result = f"{prefix}{number}"
    return result

print(make_order_id(42))  # O-42
```

**LEGB** significa Local → Enclosing → Global → Builtins: Python cerca i nomi in quest'ordine.
Preferisci passare dati tramite parametri e `return`, invece di modificare `global`.

**Errore frequente:** `items.sort()` modifica una lista e restituisce `None`; `sorted(items)` ne produce una nuova.
