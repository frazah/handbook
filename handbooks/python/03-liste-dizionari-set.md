# Liste, tuple, dizionari e set

**Idea.** `list` mantiene ordine e può cambiare; `tuple` è immutabile; `dict` mappa chiavi a valori; `set` mantiene elementi unici.

**Prima di leggere il codice — simboli e termini:**

- ***Comprehension***: sintassi compatta per costruire liste, dizionari o set da iterabili.

```python
# Questo esempio mostra come trasformare i dati in un risultato utilizzabile.
orders = [
    {"id": 1, "total": 40.0, "paid": True},
    {"id": 2, "total": 15.0, "paid": False},
    {"id": 3, "total": 60.0, "paid": True},
]
paid_totals = [o["total"] for o in orders if o["paid"]]
amount = sum(paid_totals)
by_id = {o["id"]: o for o in orders}
unique_statuses = {o["paid"] for o in orders}
first_two = orders[:2]        # slicing
print(amount, by_id[2], unique_statuses)
```

## Iterare correttamente

```python
stock = {"pen": 12, "book": 7}
for name, count in stock.items():
    print(f"{name}: {count}")
# get legge una chiave e può usare un default se manca.
missing = stock.get("laptop", 0)  # senza KeyError
```

**Attenzione:** `a = b` non copia una lista; entrambi i nomi puntano allo stesso oggetto. `b.copy()` è una copia superficiale.  
Per mutazioni annidate valuta `copy.deepcopy` o modelli immutabili.
