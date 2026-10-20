# Funzioni, parametri e scope

**Idea.** Una funzione incapsula comportamento.
Python supporta argomenti posizionali, keyword e tipizzazione opzionale.

**Prima di leggere il codice — simboli e termini:**

- **`def`**: dichiara una funzione, cioè un blocco riutilizzabile di operazioni.
- **`->`**: annotazione di tipo del risultato: Python non la impone a runtime.

```python
# Questo esempio mostra come trasformare i dati in un risultato utilizzabile.
def subtotal(prices: list[float], *, discount: float = 0.0) -> float:
    return round(sum(prices) * (1 - discount), 2)

print(subtotal([12.50, 7.50], discount=0.10))

def shipping_cost(*weights: float) -> float:
    return sum(weights) * 1.8

settings = {"discount": 0.15}
print(subtotal([20], **settings))
```

## Evita valori di default mutabili

```python
# SBAGLIATO: la stessa lista sopravvive tra chiamate
# def add_tag(tag, tags=[]): ...

def add_tag(tag: str, tags: list[str] | None = None) -> list[str]:
    if tags is None:
        tags = []
    return [*tags, tag]
```

**Scope LEGB:** local → enclosing → global → builtins.  
Usa `return` per passare risultati; minimizza `global`.

**Errore comune:** chiamare `items.sort()` e assegnarne il risultato: modifica in place e restituisce `None`; `sorted(items)` produce una nuova lista.
