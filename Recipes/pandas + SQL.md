# Recipe: report vendite (CSV → pandas → SQLite → SQL)

> Una piccola pipeline ETL: pulisci un export di ordini sporco con pandas, caricalo in SQLite e produci il report con SQL.
> Concetti in: [Data Science](../Data%20%26%20AI/Data%20Science.md) · [SQL](../Languages/SQL.md) · [Python](../Languages/Python.md)

## Cosa impari

- Separare **extract → clean → load → report** in funzioni piccole e testabili.
- Pulizia difensiva: tipi, duplicati, testo incoerente, valori non validi, **senza** imputare alla cieca.
- Quando conviene pandas (pulizia, trasformazioni) e quando SQL (aggregazioni ripetibili e condivisibili).

## Struttura

```text
sales-report/
├── data/orders.csv
├── report.py
└── test_report.py
```

## Dati: `data/orders.csv`

Contiene apposta i problemi tipici di un export reale: duplicati, città scritte in modi diversi, importi non numerici o negativi, stati in maiuscolo.

```text
order_id,customer_email,city,amount,status,created_at
1001,ada@example.test,Milano,25.99,paid,2026-09-03
1002,lin@example.test, milano ,12.00,PAID,2026-09-15
1002,lin@example.test, milano ,12.00,PAID,2026-09-15
1003,grace@example.test,Roma,n/d,paid,2026-09-20
1004,ada@example.test,Torino,45.00,cancelled,2026-10-01
1005,alan@example.test,Roma,-5.00,paid,2026-10-02
1006,lin@example.test,Milano,30.50,paid,2026-10-10
1007,grace@example.test,roma,18.20,paid,2026-10-21
```

## Script: `report.py`

```python
# illustrativo: richiede pandas
import sqlite3
from contextlib import closing
from pathlib import Path

import pandas as pd

def extract(path: Path) -> pd.DataFrame:
    return pd.read_csv(path, dtype={"order_id": "int64"}, parse_dates=["created_at"])

def clean(raw: pd.DataFrame) -> pd.DataFrame:
    df = raw.drop_duplicates("order_id").assign(
        city=lambda d: d.city.str.strip().str.title(),       # " milano " -> "Milano"
        status=lambda d: d.status.str.strip().str.lower(),
        amount=lambda d: pd.to_numeric(d.amount, errors="coerce"),  # "n/d" -> NaN
    )
    invalid = df.amount.isna() | (df.amount < 0)
    if invalid.any():  # non imputiamo: segnaliamo e scartiamo
        print(f"Scartati {invalid.sum()} ordini con importo non valido: {df.order_id[invalid].tolist()}")
    return (
        df[~invalid]
        .assign(amount_cents=lambda d: (d.amount * 100).round().astype("int64"))  # denaro in centesimi
        .drop(columns="amount")
    )

def load(df: pd.DataFrame, conn: sqlite3.Connection) -> None:
    df.assign(created_at=df.created_at.dt.strftime("%Y-%m-%d")).to_sql(
        "orders", conn, if_exists="replace", index=False)
```

```python
# illustrativo: continua report.py
REPORT_SQL = """
SELECT strftime('%Y-%m', created_at) AS month,
       city,
       COUNT(*) AS orders,
       SUM(amount_cents) AS revenue_cents
FROM orders
WHERE status = 'paid'
GROUP BY month, city
ORDER BY month, revenue_cents DESC
"""

def report(conn: sqlite3.Connection) -> pd.DataFrame:
    return pd.read_sql(REPORT_SQL, conn)

def main() -> None:
    df = clean(extract(Path("data/orders.csv")))
    with closing(sqlite3.connect("sales.db")) as conn:
        with conn:  # transazione: il caricamento è tutto o niente
            load(df, conn)
        result = report(conn)
    print(result.to_string(index=False))
    result.to_csv("revenue_by_month_city.csv", index=False)

if __name__ == "__main__":
    main()
```

Output atteso:

```text
Scartati 2 ordini con importo non valido: [1003, 1005]
  month   city  orders  revenue_cents
2026-09 Milano       2           3799
2026-10 Milano       1           3050
2026-10   Roma       1           1820
```

## La query, verificabile da sola

Dopo la pulizia, la tabella `orders` contiene queste righe. Puoi eseguire il report direttamente in `sqlite3`:

```sql
CREATE TABLE orders (order_id INT, customer_email TEXT, city TEXT, status TEXT,
                     created_at TEXT, amount_cents INT);
INSERT INTO orders VALUES
  (1001, 'ada@example.test',   'Milano', 'paid',      '2026-09-03', 2599),
  (1002, 'lin@example.test',   'Milano', 'paid',      '2026-09-15', 1200),
  (1004, 'ada@example.test',   'Torino', 'cancelled', '2026-10-01', 4500),
  (1006, 'lin@example.test',   'Milano', 'paid',      '2026-10-10', 3050),
  (1007, 'grace@example.test', 'Roma',   'paid',      '2026-10-21', 1820);

-- Clienti che hanno ordinato in più di un mese (repeat customers).
SELECT customer_email, COUNT(DISTINCT strftime('%Y-%m', created_at)) AS active_months
FROM orders WHERE status = 'paid'
GROUP BY customer_email HAVING active_months > 1;
-- -> lin@example.test 2
```

## Test: `test_report.py`

La pulizia è la parte con più logica: è quella da testare.

```python
# illustrativo: richiede pandas e pytest
import pandas as pd
from report import clean

def test_clean_normalizes_and_drops_invalid_rows():
    raw = pd.DataFrame({
        "order_id": [1, 1, 2, 3],
        "city": [" milano ", " milano ", "ROMA", "Torino"],
        "status": ["PAID", "PAID", "paid", "paid"],
        "amount": ["12.00", "12.00", "n/d", "-1"],
        "created_at": pd.to_datetime(["2026-09-01"] * 4),
    })
    result = clean(raw)
    assert result.order_id.tolist() == [1]          # duplicato e importi non validi rimossi
    assert result.city.tolist() == ["Milano"]
    assert result.amount_cents.tolist() == [1200]   # euro -> centesimi interi
```

## Come eseguirlo

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install pandas pytest
python report.py
pytest -q
```

## Come estenderlo

- **Validazione dello schema** in ingresso (pandera, Great Expectations) invece di controlli sparsi.
- **Caricamento incrementale:** upsert per `order_id` (`ON CONFLICT`) invece di `replace`.
- **PostgreSQL** al posto di SQLite (SQLAlchemy engine per `to_sql`/`read_sql`), `date_trunc` al posto di `strftime`.
- **Schedulazione** con cron o un orchestratore (Airflow, Dagster) e log degli scarti.
- **Grafico** del fatturato mensile per città (linee) dal DataFrame del report.

## Cosa raccontare a un colloquio

- **Pulizia esplicita e tracciata:** le righe non valide vengono contate e riportate, non imputate in silenzio.
- **Centesimi interi** nel database per evitare errori di arrotondamento dei float.
- **pandas per trasformare, SQL per aggregare:** la query del report è leggibile, versionabile e riusabile da altri strumenti (BI, dashboard).
- **Idempotenza:** rieseguire la pipeline produce lo stesso risultato (`replace` + transazione); con il caricamento incrementale servirebbe un upsert.
- **Funzioni pure e piccole** → testabili senza file né database.
