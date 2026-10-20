<!-- level: Basi -->
<!-- summary: Series/DataFrame, read_csv, selezione, filtri e nuovi campi -->
# Pandas: DataFrame, lettura e selezione

Una `Series` è una colonna indicizzata; un `DataFrame` è una tabella con colonne tipizzate.  
Le colonne numeriche permettono aggregazioni e operazioni vettoriali.

**Prima di leggere il codice — simboli e termini:**

- **`.loc` / `.iloc`**: accesso pandas rispettivamente per etichette o posizioni.

```python
import pandas as pd
# Carica i dati del file CSV in una tabella pandas.
orders = pd.read_csv("orders.csv", parse_dates=["date"])
print(orders.head(3))
print(orders.dtypes)
print(orders["category"].value_counts(dropna=False))
```

## Selezionare senza ambiguità

```python
# Questo esempio mostra come trasformare i dati in un risultato utilizzabile.
high_value = orders.loc[
    (orders["status"] == "paid") & (orders["price"] > 20),
    ["date", "category", "quantity", "price"]
].copy()

first_rows = orders.iloc[:5, :3]   # 5 righe, 3 colonne per posizione
orders["amount"] = orders["quantity"] * orders["price"]
```

Usa `&` e `|` fra condizioni **parentesizzate**, non `and` e `or` (che non lavorano elemento per elemento).  
Usa `.copy()` quando modifichi sottoinsiemi intenzionalmente indipendenti.

## Tipi e date

```python
orders["price"] = pd.to_numeric(orders["price"], errors="coerce")
orders["date"] = pd.to_datetime(orders["date"], errors="coerce")
```

Un valore non convertibile con `errors="coerce"` diventa mancante: **verifica quanti valori perdi** prima di proseguire.
