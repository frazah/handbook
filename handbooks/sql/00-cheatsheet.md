# SQL — Cheatsheet rapida

```sql
SELECT name FROM customers WHERE id = 1;
SELECT c.name, COUNT(o.id) AS n
FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name HAVING COUNT(o.id) > 0;

INSERT INTO customers (id, name, email) VALUES (3, 'Ada', 'ada@example.test');
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
GROUP BY customer_id
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
