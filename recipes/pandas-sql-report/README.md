# CSV → pandas → SQL: report vendite

**Obiettivo:** leggere ordini da CSV, validare importi e quantità, caricarli in SQLite e interrogare i dati con SQL. È un workflow locale riproducibile, senza cloud né database esterno.

## 1. Prepara la cartella e il CSV

Crea `report/` con due file: `orders.csv` e `report.py`.

`orders.csv`:

```csv
order_id,product,quantity,unit_price
1,Notebook,2,15.00
2,Mouse,3,22.50
3,Notebook,1,15.00
4,Tastiera,2,45.00
```

Installa pandas in un virtual environment:

```bash
python -m venv .venv
# Attiva .venv con il comando adatto al tuo sistema
python -m pip install pandas
```

## 2. Trasforma i dati (`report.py`)

```python
from pathlib import Path
import sqlite3
import pandas as pd

root = Path(__file__).parent
df = pd.read_csv(root / "orders.csv")

# Non fidarti dei tipi letti dal CSV.
for field in ("quantity", "unit_price"):
    df[field] = pd.to_numeric(df[field], errors="raise")

if df[["order_id", "product", "quantity", "unit_price"]].isna().any().any():
    raise ValueError("Dati mancanti")
if (df["quantity"] <= 0).any() or (df["unit_price"] < 0).any():
    raise ValueError("Quantità/prezzi non validi")

df["total"] = (df["quantity"] * df["unit_price"]).round(2)

with sqlite3.connect(root / "sales.db") as connection:
    df.to_sql("orders", connection, if_exists="replace", index=False)
    report = pd.read_sql_query("""
        SELECT product,
               SUM(quantity) AS units,
               ROUND(SUM(total), 2) AS revenue
        FROM orders
        GROUP BY product
        ORDER BY revenue DESC
    """, connection)

print(report.to_string(index=False))
```

Esegui dalla stessa cartella:

```bash
python report.py
```

Risultato atteso:

```text
 product  units  revenue
 Tastiera      2     90.0
    Mouse      3     67.5
 Notebook      3     45.0
```

> Il formato numerico e gli spazi possono variare; i valori sono ordinati per `revenue DESC` (90, 67,50, 45).

## 3. Che cosa hai fatto

- `read_csv` carica dati tabellari in un `DataFrame`.
- `to_numeric(..., errors="raise")` evita che stringhe non valide passino inosservate.
- `to_sql` salva il risultato nel database SQLite locale.
- `GROUP BY`, `SUM` e `ORDER BY` aggregano le vendite senza Python loop manuali.
- `if_exists="replace"` **sovrascrive la tabella a ogni esecuzione**: è comodo per questa demo, non per un database di produzione.

## 4. Estensioni utili

- Aggiungi la colonna `date` e un filtro mensile.
- Esegui lo stesso report in pandas con `groupby("product")` e confronta i risultati.
- Aggiungi test per CSV vuoti, colonne mancanti, righe duplicate e decimali monetari (per denaro reale, valuta `Decimal` o centesimi interi).

**Per approfondire:** [Python](#book/python) · [SQL](#book/sql) · [Data Science](#book/data-science).
