# SQL — Cheatsheet rapida

```sql
SELECT name FROM customers WHERE id = 1;
SELECT c.name, COUNT(o.id) AS n
FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
-- GROUP BY produce gruppi su cui calcolare gli aggregati.
GROUP BY c.id, c.name HAVING COUNT(o.id) > 0;

INSERT INTO customers (id, name, email) VALUES (3, 'Ada', 'ada@example.test');
-- Verifica il WHERE prima di modificare o cancellare record.
UPDATE orders SET status = 'paid' WHERE id = 10;
DELETE FROM orders WHERE id = 10;
```

| Clausola | Ruolo |
|---|---|
| `WHERE` | filtra le righe |
| `JOIN ... ON` | relazioni |
| `GROUP BY` | crea gruppi |
| `HAVING` | filtra gruppi |
| `ORDER BY` | ordina |
| `LIMIT` | restringe righe |
| `IS NULL` | controlla valori NULL |
| `EXISTS` | almeno una corrispondenza |
| `WITH` | CTE |
| `OVER (...)` | funzioni finestra |

**Da ricordare:** parametrizza input, transazioni per modifiche correlate, indici solo se misurati; tra DBMS esistono differenze.

**Docs:** https://www.postgresql.org/docs/current/tutorial-sql.html

---

## SELECT, filtri e aggregazioni: mini ricettario

```sql
-- Ordini pagati, dal più recente al meno recente.
SELECT id, customer_id, total_cents
FROM orders
WHERE status = 'paid' AND total_cents >= 1000
ORDER BY created_at DESC
LIMIT 20;

-- Numero di ordini e incasso per cliente.
SELECT customer_id, COUNT(*) AS n_orders, SUM(total_cents) AS revenue
FROM orders
WHERE status = 'paid'  -- filtra prima di aggregare
-- GROUP BY produce gruppi su cui calcolare gli aggregati.
GROUP BY customer_id
-- HAVING filtra i gruppi dopo la fase di aggregazione.
HAVING COUNT(*) >= 2   -- filtra i gruppi aggregati
ORDER BY revenue DESC;
```

| Concetto | Sintassi / uso |
|---|---|
| Distinti | `SELECT DISTINCT status FROM orders` |
| Intervallo | `BETWEEN 10 AND 20` (inclusivo) |
| Lista | `status IN ('paid', 'sent')` |
| Test NULL | `email IS NULL` (mai `= NULL`) |
| Pattern | `name LIKE 'A%'` (case sensitivity dipende da DBMS) |
| Condizioni | `AND`, `OR`, `NOT` (usa parentesi) |
| Aggregati | `COUNT(*)`, `SUM(x)`, `AVG(x)`, `MIN(x)`, `MAX(x)` |
| Joins | `JOIN ... ON`, `LEFT JOIN ... ON` |
| Sottoquery | `WHERE id IN (SELECT ...)` |
| Esistenza | `WHERE EXISTS (SELECT 1 FROM ...)` |
| CTE | `WITH recent AS (SELECT ...) SELECT ... FROM recent` |
| Window | `ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)` |
| Espressione condizionale | `CASE WHEN condition THEN a ELSE b END` |
| Default di NULL | `COALESCE(nickname, name)` |

## Scrittura, schema e transazioni

```sql
-- Inserisce una nuova riga.
INSERT INTO products (id, name, price_cents)
VALUES (1, 'Mouse', 2500);

-- Aggiorna SOLO il prodotto desiderato: attenzione alla WHERE.
UPDATE products SET price_cents = 2200 WHERE id = 1;

-- Eliminazione con condizione esplicita.
DELETE FROM products WHERE id = 1;
```

| Concetto | Esempio |
|---|---|
| Definire tabella | `CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL)` |
| Unicità | `UNIQUE (email)` |
| Chiave esterna | `FOREIGN KEY (customer_id) REFERENCES customers(id)` |
| Indice | `CREATE INDEX idx_orders_customer ON orders(customer_id)` |
| Piano di esecuzione | `EXPLAIN SELECT ...` (dialetto dipendente) |
| Transazione | `BEGIN; ... COMMIT;` oppure `ROLLBACK;` |

**Sicurezza:** per input esterno usa **query parametrizzate** (`?` in sqlite3, segnaposti specifici del driver), non interpolazione di stringhe. `JOIN` può moltiplicare righe; `NULL` segue logica a tre valori.  
Gli esempi sono SQL generico con piccole differenze tra database.

---

## Ricette SQL: le query che userai spesso

Le query seguenti suppongono `orders(id, customer_id, amount, status, created_at)` e `customers(id, name)`.

### Filtrare, ordinare, limitare

```sql
-- Cinque ordini pagati più recenti.
SELECT id, customer_id, amount
FROM orders
WHERE status = 'paid'
ORDER BY created_at DESC
LIMIT 5;
```

### INNER vs LEFT JOIN

```sql
-- INNER: solo clienti con ordini.
SELECT c.name, o.id AS order_id
FROM customers AS c
JOIN orders AS o
    ON o.customer_id = c.id;
```

```sql
-- LEFT: anche i clienti senza ordini (order_id sarà NULL).
SELECT c.name, o.id AS order_id
FROM customers AS c
LEFT JOIN orders AS o
    ON o.customer_id = c.id;
```

### Raggruppare, filtrare aggregati

```sql
-- Revenue per cliente, considerando gli ordini pagati.
SELECT customer_id, SUM(amount) AS revenue
FROM orders
WHERE status = 'paid'
GROUP BY customer_id
HAVING SUM(amount) > 100
ORDER BY revenue DESC;
```

### CTE e funzione finestra

```sql
-- WITH crea un risultato nominato, usabile nella query successiva.
WITH paid AS (
    SELECT customer_id, amount
    FROM orders
    WHERE status = 'paid'
)
SELECT customer_id, SUM(amount) AS revenue
FROM paid
GROUP BY customer_id;
```

```sql
-- OVER calcola una posizione PER cliente senza comprimere le righe.
SELECT id, customer_id, amount,
       ROW_NUMBER() OVER (
           PARTITION BY customer_id
           ORDER BY amount DESC
       ) AS rank_in_customer
FROM orders;
```

### Parametrizzare: esempio Python con SQLite

```python
import sqlite3

connection = sqlite3.connect("shop.db")
try:
    # Il valore viene passato separatamente: NON concatenare stringhe SQL.
    rows = connection.execute(
        "SELECT id, amount FROM orders WHERE customer_id = ?",
        (42,),
    ).fetchall()
finally:
    connection.close()
```

| Parola | Si applica a | Avvertenza |
|---|---|---|
| `WHERE` | righe prima dell'aggregazione | `NULL` richiede `IS NULL` |
| `HAVING` | gruppi dopo l'aggregazione | spesso insieme a `GROUP BY` |
| `ON` | criteri della JOIN | cambia il risultato di `LEFT JOIN` |
| `DISTINCT` | righe duplicate nel risultato | non risolve JOIN mal progettate |
| `ORDER BY` | ordinamento | senza non c'è ordine garantito |
| `BEGIN/COMMIT` | transazione | rollback se una fase fallisce |
