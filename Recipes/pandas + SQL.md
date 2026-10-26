# Recipe — CSV → pandas → SQLite: ricavi per città

**Problema:** leggere ordini da CSV, pulire dati semplici, registrare gli ordini validi su SQLite e ottenere un report. Esempio locale senza server.

**Prerequisiti:** [Python](../Languages/Python.md), [SQL](../Languages/SQL.md), [Data Science](../Data%20%26%20AI/Data%20Science.md).

## 1. CSV `orders.csv`

```csv
order_id,city,amount,status
1,Roma,20,paid
2,Milano,15,pending
3,Roma,40,paid
4,Bologna,10,paid
```

## 2. Script `report.py`

```python
import sqlite3
import pandas as pd

# Leggi i dati come tabella.
orders = pd.read_csv('orders.csv')

# Forza tipo numerico per gli importi: valori non validi diventano NaN.
orders['amount'] = pd.to_numeric(orders['amount'], errors='coerce')

# Considera solo ordini pagati con importo non negativo.
paid = orders.loc[
    (orders['status'] == 'paid') &
    (orders['amount'].notna()) &
    (orders['amount'] >= 0)
].copy()

# Crea DB locale; context manager gestisce commit/rollback.
from contextlib import closing

# closing chiude davvero il collegamento, anche se fallisce il report.
with closing(sqlite3.connect('orders.db')) as connection, connection:
    paid.to_sql('paid_orders', connection, if_exists='replace', index=False)

    # Le aggregazioni SQL producono una riga per città.
    report = pd.read_sql_query(
        '''
        SELECT city, COUNT(*) AS orders, SUM(amount) AS revenue
        FROM paid_orders
        GROUP BY city
        ORDER BY revenue DESC
        ''',
        connection,
    )

print(report)
```

Installa pandas: `python3 -m pip install pandas` (meglio dentro un ambiente virtuale).

Output atteso, ordine indicativo:

```text
      city  orders  revenue
0     Roma       2     60.0
1  Bologna       1     10.0
```

## Perché funziona

- `read_csv` importa dati tabellari; non presumere che tipi e valori siano corretti.
- La maschera `.loc[...]` filtra le righe rilevanti; `.copy()` crea un nuovo DataFrame.
- `to_sql` salva il risultato in SQLite. `if_exists='replace'` **sostituisce** la tabella: usalo solo in un esempio controllato.
- `GROUP BY` produce totali per categoria, `SUM(amount)` aggrega i valori.

**Limite:** quattro righe sono un fixture minimo per mostrare il workflow, non un dataset realistico di business. Lo stesso codice può leggere CSV reali con controlli più completi. Non gestisce valuta, timezone, ordini duplicati o transazioni di rimborso; su dati reali definisci regole di qualità e modellazione prima di calcolare KPI.

**Approfondisci:** [pandas to_sql](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.to_sql.html), [sqlite3 transaction control](https://docs.python.org/3/library/sqlite3.html#transaction-control).
