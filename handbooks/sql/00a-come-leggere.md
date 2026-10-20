<!-- level: Fondamenti -->
<!-- summary: Leggere SELECT nell'ordine giusto, JOIN, GROUP BY, CTE e finestre -->
# Prima di SQL: come leggere le query

SQL è **dichiarativo**: descrivi il risultato che vuoi, non un ciclo riga per riga.
Gli esempi usano tabelle immaginarie `customers(id, name)` e `orders(id, customer_id, total)`.

## `SELECT`, `FROM`, `WHERE`, `ORDER BY`

```sql
-- Scegli le colonne da restituire.
SELECT id, total
-- Indica la tabella sorgente.
FROM orders
-- Considera soltanto gli ordini superiori a 20.
WHERE total > 20
-- Ordina dal maggiore al minore.
ORDER BY total DESC;
```

**Come leggerla:** «dammi id e totale degli ordini sopra 20, dal maggiore al minore».
`WHERE` filtra le righe; non serve assegnare un risultato a una variabile.

## Alias e JOIN

```sql
SELECT c.name, o.total
FROM customers AS c
-- c e o sono abbreviazioni dei nomi delle due tabelle.
JOIN orders AS o
    ON o.customer_id = c.id;
```

`ON` descrive **come** collegare le tabelle.
Una relazione cliente → molti ordini può produrre più righe per cliente.
`LEFT JOIN` conserva anche i clienti senza ordini (colonne destra a `NULL`).

## Raggruppamento vs funzioni finestra

```sql
-- GROUP BY: una riga per cliente.
SELECT customer_id, COUNT(*) AS n_orders
FROM orders
-- GROUP BY produce gruppi su cui calcolare gli aggregati.
GROUP BY customer_id;

-- OVER: mantiene una riga per ordine.
SELECT id, customer_id,
       -- OVER calcola risultati su una finestra senza eliminare le singole righe.
       COUNT(*) OVER (PARTITION BY customer_id) AS n_orders
FROM orders;
```

`PARTITION BY` non crea nuove tabelle: forma gruppi logici per il calcolo.

## CTE: spezza una query in passaggi nominati

```sql
-- WITH definisce un risultato temporaneo usato dalla SELECT successiva.
WITH paid_orders AS (
    SELECT id, customer_id, total
    FROM orders
    WHERE total > 0
)
SELECT customer_id, SUM(total) AS revenue
FROM paid_orders
-- GROUP BY produce gruppi su cui calcolare gli aggregati.
GROUP BY customer_id;
```

**Attenzione:** gli esempi richiedono tabelle e colonne con quei nomi; non sono query autonome su un database vuoto.
Usa parametri per input esterni, non costruire SQL concatenando stringhe.
