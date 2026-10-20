# Subquery, EXISTS e CTE

**Idea.** Una CTE (`WITH`) assegna un nome temporaneo a una sottoquery. `EXISTS` controlla che esista almeno una riga correlata.

**Prima di leggere il codice — simboli e termini:**

- **`SELECT`**: sceglie le colonne da leggere nella query.
- **`JOIN`**: combina righe da più tabelle secondo una condizione di relazione.
- **`GROUP BY`**: raggruppa righe per calcolare aggregati come `COUNT` e `SUM`.

## Prima del codice: cosa riconoscere

Una **subquery** è una query dentro un’altra query. Una CTE (`WITH nome AS (...)`) assegna un nome temporaneo a un risultato; `EXISTS` controlla se esiste almeno una riga.

```sql
-- Clienti che hanno almeno un ordine pagato
SELECT c.id, c.name
FROM customers AS c
WHERE EXISTS (
  SELECT 1 FROM orders AS o
  WHERE o.customer_id = c.id AND o.status = 'paid'
);

-- WITH assegna un nome a un risultato temporaneo della query.
WITH totals AS (
  SELECT customer_id, SUM(total_cents) AS spent
  FROM orders WHERE status = 'paid'
  GROUP BY customer_id
)
-- Seleziona le colonne richieste, senza modificare i dati.
SELECT c.name, totals.spent
FROM customers AS c
-- JOIN conserva le corrispondenze definite da ON.
JOIN totals ON totals.customer_id = c.id
WHERE totals.spent >= 10000;
```

**Quando usarle:** query complesse, logiche di analytics, filtri per "almeno uno/nessuno".  
Evita di annidare senza necessità: la chiarezza vale più della brevità.

**Errore comune:** usare `NOT IN` su una subquery che può contenere `NULL`: `NOT EXISTS` è spesso più prevedibile.
