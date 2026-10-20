<!-- level: Basi -->
<!-- summary: Series, DataFrame, read_csv, filtri, loc/iloc e pulizia dei tipi -->
# Pandas: DataFrame, lettura e selezione

**Obiettivo:** passare da un file CSV a un sottoinsieme di righe, spiegando `Series`, `DataFrame`, `.loc` e maschere booleane.

## 1. Carica e osserva prima di analizzare

```python
import pandas as pd

# Il CSV dev'essere presente nella directory corrente.
# parse_dates prova a convertire la colonna date in date reali.
orders = pd.read_csv("orders.csv", parse_dates=["date"])

# head mostra solo le prime tre righe, senza cambiare il dataset.
print(orders.head(3))

# dtypes aiuta a verificare tipi numerici e date.
print(orders.dtypes)
```

Un `DataFrame` è una tabella; `orders["price"]` è una `Series`, cioè una colonna indicizzata.
**Nota:** `orders.csv` è un file esterno non incluso nel singolo frammento. Puoi usare il CSV del laboratorio Data Science o un dataset con colonne coerenti.

## 2. Filtra usando una maschera booleana

```python
# Ogni confronto produce una Series di valori True/False.
is_paid = orders["status"] == "paid"
is_high_price = orders["price"] > 20

# & combina elemento per elemento due maschere.
# Le parentesi intorno ai confronti sono importanti in forma inline.
mask = is_paid & is_high_price

# .loc[righe, colonne] seleziona gli ordini che soddisfano la maschera.
high_value = orders.loc[
    mask,
    ["date", "category", "quantity", "price"],
].copy()

print(high_value.head())
```

`&` non è lo stesso di `and`: qui viene applicato **elemento per elemento** a una serie di booleani.
`.copy()` rende indipendente il sottoinsieme che potresti modificare.

## 3. Seleziona per posizione con `.iloc`

```python
# Prime 5 righe e prime 3 colonne per posizione (stop escluso).
first_rows = orders.iloc[:5, :3]
```

Con `.iloc` usi indici numerici: con `.loc` usi etichette o maschere.

## 4. Nuovi campi e conversioni

```python
# Operazione vettoriale: prodotto riga per riga tra due colonne.
orders["amount"] = orders["quantity"] * orders["price"]

# I valori non convertibili diventano NaN / NaT e vanno controllati.
orders["price"] = pd.to_numeric(orders["price"], errors="coerce")
orders["date"] = pd.to_datetime(orders["date"], errors="coerce")

print(orders[["price", "date"]].isna().sum())
```

**Attenzione:** `errors="coerce"` non «ripara» dati sbagliati: trasforma gli errori in valori mancanti.
Controlla il numero e la distribuzione delle conversioni fallite prima dell'analisi.
