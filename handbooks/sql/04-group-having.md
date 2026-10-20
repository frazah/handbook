# GROUP BY, funzioni aggregate e HAVING

**Idea.** `WHERE` filtra **prima** dell'aggregazione, `HAVING` filtra i gruppi **dopo**. `COUNT(*)` conta righe; `COUNT(column)` ignora valori NULL.

**Prima di leggere il codice — simboli e termini:**

- **`SELECT`**: sceglie le colonne da leggere nella query.
- **`JOIN`**: combina righe da più tabelle secondo una condizione di relazione.
- **`GROUP BY`**: raggruppa righe per calcolare aggregati come `COUNT` e `SUM`.

## Prima del codice: cosa riconoscere

`GROUP BY` raggruppa righe prima delle aggregazioni. `WHERE` filtra righe **prima**, `HAVING` filtra gruppi **dopo** la loro costruzione.

```sql
-- Seleziona le colonne richieste, senza modificare i dati.
SELECT c.name,
       COUNT(o.id) AS orders_count,
       COALESCE(SUM(o.total_cents), 0) AS revenue_cents
FROM customers AS c
-- Conserva tutte le righe della tabella a sinistra, anche senza corrispondenze.
LEFT JOIN orders AS o
  ON o.customer_id = c.id AND o.status = 'paid'
-- GROUP BY produce gruppi su cui calcolare gli aggregati.
GROUP BY c.id, c.name
-- HAVING filtra i gruppi dopo la fase di aggregazione.
HAVING COUNT(o.id) >= 1
ORDER BY revenue_cents DESC;
```

**Errore comune:** inserire `SUM(total_cents) > 10000` in `WHERE`; una condizione su aggregati richiede `HAVING` o una subquery.

```sql
-- Seleziona le colonne richieste, senza modificare i dati.
SELECT status, COUNT(*) AS n, ROUND(AVG(total_cents) / 100.0, 2) AS avg_eur
FROM orders
-- Crea un gruppo per ciascuna combinazione di valori indicata.
GROUP BY status;
```

**Attenzione:** aggregare dopo una JOIN 1:N o N:M può duplicare importi; valuta la cardinalità prima di usare `SUM`.

