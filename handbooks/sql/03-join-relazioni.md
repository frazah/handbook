# JOIN e relazioni tra tabelle

**Idea.** Le JOIN combinano righe usando condizioni su chiavi. `INNER JOIN` conserva le corrispondenze; `LEFT JOIN` mantiene tutte le righe della tabella sinistra (anche se non ci sono corrispondenze).

**Prima di leggere il codice — simboli e termini:**

- **`SELECT`**: sceglie le colonne da leggere nella query.
- **`JOIN`**: combina righe da più tabelle secondo una condizione di relazione.
- **`GROUP BY`**: raggruppa righe per calcolare aggregati come `COUNT` e `SUM`.

```sql
-- Ordini con il cliente associato
SELECT o.id, c.name AS customer, o.total_cents
FROM orders AS o
JOIN customers AS c ON c.id = o.customer_id;

-- Anche i clienti senza ordini
SELECT c.id, c.name, COUNT(o.id) AS order_count
FROM customers AS c
-- Conserva tutte le righe della tabella a sinistra, anche senza corrispondenze.
LEFT JOIN orders AS o ON o.customer_id = c.id
-- Crea un gruppo per ciascuna combinazione di valori indicata.
GROUP BY c.id, c.name;
```

**Cardinalità:** una relazione 1:N moltiplica le righe della tabella "uno".  
Se un cliente ha 3 ordini, la JOIN produce 3 righe per quel cliente.

**Errore comune:** filtro della tabella destra in `WHERE` dopo una `LEFT JOIN` (`WHERE o.status = 'paid'`) può eliminare i clienti senza ordini.
Se vuoi conservarli, sposta il filtro nella clausola `ON`.
