<!-- level: Preparazione dati -->
<!-- summary: groupby, agg, merge, pivot e controlli sulle cardinalità -->
# Raggruppare, unire e confrontare tabelle

**Prima di leggere il codice — simboli e termini:**

- **`DataFrame` / `df`**: tabella in pandas; `df` è solo un nome di variabile convenzionale.
- **`groupby`**: raggruppa righe per calcolare conteggi, somme e statistiche.

```python
import pandas as pd
# Carica i dati del file CSV in una tabella pandas.
paid = pd.read_csv("orders.csv").query("status == 'paid'").copy()
paid["amount"] = paid["price"] * paid["quantity"]
# Raggruppa le righe per calcolare aggregazioni per categoria.
summary = paid.groupby("category", as_index=False).agg(
    revenue=("amount", "sum"),
    orders=("order_id", "nunique"),
    average_ticket=("amount", "mean")
)
print(summary.sort_values("revenue", ascending=False))
```

## Join fra tabelle

```python
catalog = pd.DataFrame({"category": ["Books", "Tech", "Home"],
                        "manager": ["Anna", "Luca", "Marta"]})
# Unisce due tabelle mediante una o più chiavi condivise.
report = summary.merge(catalog, on="category", how="left", validate="m:1")
```

`how="inner"` tiene solo corrispondenze; `left` mantiene tutte le righe della tabella sinistra. `validate="m:1"` verifica che il catalogo abbia una sola riga per categoria: evita moltiplicazioni silenziose di fatturato.

## Tabelle pivot e date

```python
paid["date"] = pd.to_datetime(paid["date"])
# Raggruppa le righe per calcolare aggregazioni per categoria.
monthly = paid.groupby([pd.Grouper(key="date", freq="MS"), "category"])["amount"].sum().unstack(fill_value=0)
print(monthly)
```

**Attenzione:** `count()` conta valori non nulli, `size()` conta righe, `nunique()` conta valori distinti.
