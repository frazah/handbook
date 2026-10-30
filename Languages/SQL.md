# SQL

> Il linguaggio dei database relazionali: dichiari *cosa* vuoi, il motore decide *come* ottenerlo. Esempi su SQLite, con note per PostgreSQL.
> Collegate: [FastAPI](../Web%20%26%20Backend/FastAPI.md) · [Recipe pandas + SQL](../Recipes/pandas%20%2B%20SQL.md) · [Data Science](../Data%20%26%20AI/Data%20Science.md)

## Modello mentale

- I dati stanno in **tabelle** (relazioni) di righe con colonne tipizzate; le relazioni tra tabelle si esprimono con **chiavi**: primaria (identifica la riga) ed esterna (punta a un'altra tabella).
- SQL è **dichiarativo**: il *query planner* sceglie indici e algoritmi di join. Per capire le prestazioni leggi il piano (`EXPLAIN`).
- Una query viene valutata in quest'**ordine logico**, diverso da quello in cui la scrivi: `FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT`. Per questo un alias del `SELECT` non è utilizzabile nel `WHERE`.
- `NULL` significa "sconosciuto": qualsiasi confronto con `NULL` dà `NULL` (logica a tre valori), quindi si usa `IS NULL`.
- Una **transazione** raggruppa operazioni che riescono o falliscono insieme (ACID).
- Un **indice** è una struttura ordinata (B-tree) che accelera le letture e rallenta le scritture.

## Schema di riferimento

Tutti gli esempi successivi girano su questo schema, nell'ordine in cui compaiono.

```sql
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  stock INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
  total_cents INTEGER NOT NULL,
  created_at TEXT NOT NULL  -- ISO 8601; in PostgreSQL: TIMESTAMPTZ
);
CREATE TABLE order_items (
  order_id INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL,  -- prezzo al momento dell'acquisto, non quello attuale
  PRIMARY KEY (order_id, product_id)
);

INSERT INTO customers VALUES (1, 'ada@example.test', 'Ada'), (2, 'lin@example.test', 'Lin'),
                             (3, 'grace@example.test', 'Grace');
INSERT INTO products VALUES (1, 'MUG-2', 1299, 10), (2, 'PEN-3', 250, 100), (3, 'BAG-4', 4500, 3);
INSERT INTO orders VALUES
  (101, 1, 'paid',      2598, '2026-09-10T10:00:00Z'),
  (102, 1, 'pending',    250, '2026-10-02T09:00:00Z'),
  (103, 2, 'paid',      4500, '2026-10-05T15:30:00Z'),
  (104, 2, 'shipped',   1549, '2026-10-20T11:00:00Z'),
  (105, 1, 'cancelled', 1299, '2026-10-21T08:00:00Z');
INSERT INTO order_items VALUES (101, 1, 2, 1299), (102, 2, 1, 250), (103, 3, 1, 4500),
                               (104, 1, 1, 1299), (104, 2, 1, 250), (105, 1, 1, 1299);
```

**Normalizzazione** in breve: ogni fatto sta in un solo posto (1NF: valori atomici; 2NF/3NF: nessuna colonna che dipenda da una parte della chiave o da un'altra colonna non chiave). `unit_price_cents` è una **denormalizzazione voluta**: è un dato storico, non deve cambiare se cambia il prezzo del prodotto.

## Sintassi al volo

| Ti serve | Sintassi |
|---|---|
| Filtrare | `WHERE status IN ('paid', 'shipped') AND total_cents > 1000` |
| Pattern | `WHERE email LIKE '%@example.test'` |
| Valori mancanti | `IS NULL` · `COALESCE(x, 0)` (primo non NULL) |
| Ordinare e paginare | `ORDER BY created_at DESC LIMIT 20` |
| Aggregare | `COUNT(*)`, `COUNT(col)` (ignora i NULL), `SUM`, `AVG`, `MIN`, `MAX` |
| Filtro sui gruppi | `GROUP BY customer_id HAVING COUNT(*) > 1` |
| Condizioni | `CASE WHEN total_cents > 3000 THEN 'big' ELSE 'small' END` |
| Date (SQLite) | `strftime('%Y-%m', created_at)` · PostgreSQL: `date_trunc('month', created_at)` |
| Unire risultati | `UNION` (rimuove i duplicati, più lento) · `UNION ALL` |

## JOIN

| Tipo | Restituisce |
|---|---|
| `INNER JOIN` | solo le righe con corrispondenza in entrambe le tabelle |
| `LEFT JOIN` | tutte le righe di sinistra, con `NULL` dove manca la corrispondenza |
| `RIGHT` / `FULL OUTER JOIN` | speculare / entrambe (SQLite ≥ 3.39) |
| `CROSS JOIN` | prodotto cartesiano |
| Self join | una tabella con sé stessa (es. dipendente → manager) |

```sql
-- Fatturato per cliente, inclusi i clienti senza ordini validi.
SELECT c.name,
       COUNT(o.id) AS orders,                    -- COUNT(o.id), non COUNT(*): ignora la riga NULL
       COALESCE(SUM(o.total_cents), 0) AS revenue_cents
FROM customers AS c
LEFT JOIN orders AS o
  ON o.customer_id = c.id
 AND o.status IN ('paid', 'shipped')             -- filtro nella ON: Grace resta nel risultato
GROUP BY c.id, c.name
ORDER BY revenue_cents DESC;
-- -> Lin 2 6049 · Ada 1 2598 · Grace 0 0
```

**Errore classico:** spostare il filtro su `o.status` nel `WHERE` elimina le righe con `o.status` NULL, cioè trasforma il `LEFT JOIN` in un `INNER JOIN`, e Grace sparisce.

**Anti-join** ("righe senza corrispondenza"): `NOT EXISTS` è chiaro e sicuro con i NULL; `NOT IN (subquery)` restituisce zero righe se la subquery contiene anche un solo NULL.

```sql
SELECT name FROM customers AS c
WHERE NOT EXISTS (SELECT 1 FROM orders AS o WHERE o.customer_id = c.id);
-- -> Grace
```

## Subquery e CTE

Una **CTE** (`WITH`) dà un nome a un risultato intermedio: rende leggibili le query a più passaggi. Una subquery **correlata** viene rivalutata per ogni riga esterna.

```sql
WITH monthly AS (
  SELECT strftime('%Y-%m', created_at) AS month, SUM(total_cents) AS revenue_cents
  FROM orders
  WHERE status IN ('paid', 'shipped')
  GROUP BY month
)
SELECT month, revenue_cents FROM monthly ORDER BY month;
-- -> 2026-09 2598 · 2026-10 6049
```

Una **CTE ricorsiva** attraversa gerarchie (albero di categorie, organigramma):

```sql
WITH RECURSIVE days(day) AS (
  SELECT '2026-10-01'
  UNION ALL
  SELECT date(day, '+1 day') FROM days WHERE day < '2026-10-05'
)
SELECT day FROM days;  -- calendario continuo, utile per riempire i giorni senza ordini
```

## Window function

Calcolano un valore su un gruppo di righe correlate (la *finestra*) **senza fonderle** come fa `GROUP BY`. `PARTITION BY` definisce i gruppi, `ORDER BY` l'ordine nella finestra.

```sql
SELECT customer_id, id, total_cents,
       ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at) AS nth_order,
       SUM(total_cents) OVER (PARTITION BY customer_id ORDER BY created_at) AS running_cents,
       LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at) AS previous_order_at
FROM orders
WHERE status <> 'cancelled';
```

| Funzione | Su valori pari (es. 100, 100, 90) |
|---|---|
| `ROW_NUMBER()` | 1, 2, 3 — sempre distinti |
| `RANK()` | 1, 1, 3 — salta |
| `DENSE_RANK()` | 1, 1, 2 — non salta |
| `LAG` / `LEAD` | valore della riga precedente / successiva |

## Modificare dati

```sql
-- Upsert: inserisce o aggiorna se lo SKU esiste già (SQLite ≥ 3.24, PostgreSQL).
INSERT INTO products (sku, price_cents, stock) VALUES ('MUG-2', 1399, 5)
ON CONFLICT (sku) DO UPDATE SET price_cents = excluded.price_cents,
                                stock = stock + excluded.stock;

-- RETURNING restituisce le righe toccate senza un secondo SELECT (SQLite ≥ 3.35).
UPDATE orders SET status = 'paid' WHERE id = 102 AND status = 'pending' RETURNING id, status;
```

Il `WHERE status = 'pending'` nell'`UPDATE` è una forma di **concorrenza ottimistica**: se un'altra richiesta ha già cambiato lo stato, l'update tocca 0 righe e l'applicazione lo sa.

## Transazioni e isolamento

**ACID:** *Atomicity* (tutto o niente), *Consistency* (i vincoli restano validi), *Isolation* (le transazioni concorrenti non si vedono a metà), *Durability* (dopo il commit, i dati sopravvivono a un crash).

```sql
BEGIN;
UPDATE products SET stock = stock - 1 WHERE id = 3 AND stock >= 1;  -- decremento atomico, mai sotto zero
INSERT INTO orders VALUES (106, 3, 'pending', 4500, '2026-10-25T10:00:00Z');
INSERT INTO order_items VALUES (106, 3, 1, 4500);
COMMIT;  -- con un errore in mezzo: ROLLBACK, e nessuna delle tre modifiche resta
```

| Livello | Dirty read | Non-repeatable read | Phantom |
|---|---|---|---|
| Read Uncommitted | possibile | possibile | possibile |
| Read Committed (default PostgreSQL) | — | possibile | possibile |
| Repeatable Read | — | — | possibile (non in PostgreSQL) |
| Serializable (SQLite di fatto) | — | — | — |

- **Dirty read:** leggi dati non ancora committati. **Non-repeatable read:** rileggi una riga e la trovi cambiata. **Phantom:** rifai la stessa query e compaiono righe nuove.
- **Lost update:** due transazioni leggono `stock = 3` e scrivono entrambe `2`. Si evita con update atomici (`stock = stock - 1`), con `SELECT ... FOR UPDATE` (PostgreSQL) o con una colonna `version`.

## Indici e prestazioni

```sql
CREATE INDEX idx_orders_customer_created ON orders (customer_id, created_at);

EXPLAIN QUERY PLAN
SELECT id, created_at FROM orders WHERE customer_id = 1 ORDER BY created_at DESC;
-- -> SEARCH orders USING COVERING INDEX idx_orders_customer_created (customer_id=?)
--    "covering": id è il rowid, quindi l'indice contiene già tutte le colonne richieste
```

- **Indice composito:** vale la regola del **prefisso più a sinistra**. `(customer_id, created_at)` serve per `WHERE customer_id = ?` (con o senza ordinamento per data), non per `WHERE created_at > ?` da solo.
- **Covering index:** se contiene tutte le colonne richieste, il motore non legge la tabella.
- Gli indici funzionano male su colonne poco **selettive** (es. un booleano) e su funzioni della colonna (`WHERE lower(email) = ?` richiede un indice su espressione).
- Ogni indice rallenta `INSERT`/`UPDATE` e occupa spazio: indicizza in base alle query reali.
- **N+1:** una query per la lista più una per ogni elemento (tipico degli ORM). Si risolve con un `JOIN` o con `WHERE id IN (...)`.

### Paginazione keyset

`OFFSET 10000` legge e scarta 10 000 righe. La paginazione **keyset** riparte dall'ultima chiave vista: è veloce e stabile anche se arrivano nuove righe.

```sql
SELECT id, created_at FROM orders
WHERE (created_at, id) < ('2026-10-20T11:00:00Z', 104)  -- ultimo elemento della pagina precedente
ORDER BY created_at DESC, id DESC
LIMIT 2;
-- -> 103 · 102
```

## SQL injection e query parametrizzate

Mai concatenare input nella query: i **parametri** vengono passati separatamente e trattati come dati, mai come codice.

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE customers (id INTEGER PRIMARY KEY, email TEXT)")
conn.execute("INSERT INTO customers (email) VALUES ('ada@example.test')")

email = "x' OR '1'='1"  # input malevolo
# SBAGLIATO: f"SELECT * FROM customers WHERE email = '{email}'" -> restituisce tutti i clienti
rows = conn.execute("SELECT * FROM customers WHERE email = ?", (email,)).fetchall()
assert rows == []  # il parametro è trattato come semplice testo
```

## Per gli esercizi di coding

I classici dei colloqui SQL, tutti sullo schema sopra.

```sql
-- 1. Secondo ordine più alto (DISTINCT gestisce i pareggi; LIMIT/OFFSET dopo l'ordinamento).
SELECT DISTINCT total_cents FROM orders ORDER BY total_cents DESC LIMIT 1 OFFSET 1;
-- -> 2598

-- 2. Top-N per gruppo: l'ordine più recente di ogni cliente.
SELECT customer_id, id FROM (
  SELECT customer_id, id,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) AS rn
  FROM orders
) WHERE rn = 1;
-- -> 1 105 · 2 104 · 3 106

-- 3. Duplicati: email presenti più volte (qui nessuna, grazie al vincolo UNIQUE).
SELECT email, COUNT(*) FROM customers GROUP BY email HAVING COUNT(*) > 1;

-- 4. Crescita mese su mese.
WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, SUM(total_cents) AS revenue
  FROM orders WHERE status IN ('paid', 'shipped') GROUP BY month
)
SELECT month, revenue,
       ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
             / LAG(revenue) OVER (ORDER BY month), 1) AS growth_pct
FROM m;
-- -> 2026-09 2598 NULL · 2026-10 6299 142.5   (l'ordine 102 ora è paid)

-- 5. Prodotti più venduti per quantità.
SELECT p.sku, SUM(oi.quantity) AS units
FROM order_items AS oi JOIN products AS p ON p.id = oi.product_id
GROUP BY p.sku ORDER BY units DESC;
-- -> MUG-2 4 · PEN-3 2 · BAG-4 2
```

Altri da conoscere: *gaps and islands* (giorni consecutivi con ordini: `date - ROW_NUMBER()` è costante dentro un'isola), retention per coorte, mediana con le window function.

## Domande da colloquio

**Base**
- **`WHERE` vs `HAVING`?** `WHERE` filtra le righe prima del raggruppamento; `HAVING` filtra i gruppi dopo, e può usare gli aggregati.
- **`INNER` vs `LEFT JOIN`?** L'`INNER` tiene solo le righe con corrispondenza; il `LEFT` tiene tutte le righe di sinistra, riempiendo con `NULL`.
- **`UNION` vs `UNION ALL`?** `UNION` elimina i duplicati (costa un ordinamento o un hash); `UNION ALL` li tiene ed è più veloce.
- **Primary key vs foreign key?** La PK identifica univocamente una riga; la FK garantisce che un valore esista nella tabella referenziata.
- **`DELETE` vs `TRUNCATE` vs `DROP`?** `DELETE` rimuove righe (anche con `WHERE`), una per una e in transazione; `TRUNCATE` svuota la tabella velocemente senza `WHERE` (in SQLite non esiste: si usa `DELETE` senza filtro); `DROP` elimina la tabella stessa.

**Intermedio**
- **Come viene eseguita logicamente una query?** `FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT`. Spiega perché gli alias del `SELECT` non sono visibili nel `WHERE`.
- **Window function vs `GROUP BY`?** `GROUP BY` collassa le righe in una per gruppo; le window function aggiungono un valore calcolato a ogni riga.
- **Perché `NOT IN` con i NULL è pericoloso?** `x NOT IN (1, NULL)` vale `NULL`, mai `TRUE`: la query restituisce zero righe. Si usa `NOT EXISTS`.
- **Come scegli un indice composito?** Prima le colonne in uguaglianza, poi quelle di range o di ordinamento, seguendo le query reali. Si verifica con `EXPLAIN`.
- **Cos'è il problema N+1?** Una query per la lista e una per ogni elemento; si risolve con join, `IN` o eager loading dell'ORM.
- **Subquery correlata vs non correlata?** La non correlata si valuta una sola volta; la correlata dipende dalla riga esterna e viene valutata per ogni riga, ma spesso il planner la riscrive come join.
- **Terzo valore più alto senza window function?** `SELECT DISTINCT total_cents FROM orders ORDER BY total_cents DESC LIMIT 1 OFFSET 2`, oppure una subquery: il valore per cui esistono esattamente due valori distinti maggiori.

**Avanzato**
- **Livelli di isolamento e anomalie?** Ogni livello elimina un'anomalia in più (dirty, non-repeatable, phantom) a costo di più lock o di più conflitti. PostgreSQL usa MVCC: chi legge non blocca chi scrive.
- **Come eviti un lost update?** Con update atomici (`SET stock = stock - 1 WHERE stock >= 1`), con lock pessimistico (`FOR UPDATE`) o con lock ottimistico (colonna `version` controllata nel `WHERE`).
- **Quando denormalizzare?** Quando le letture dominano e i join costano troppo, o per conservare dati storici (il prezzo al momento dell'ordine). Il prezzo da pagare è mantenere coerenti le copie.
- **Perché la paginazione con `OFFSET` rallenta?** Il database deve comunque leggere e scartare le righe saltate; la paginazione keyset usa l'indice per ripartire direttamente dall'ultima chiave.
- **Indice clustered vs non clustered?** Nel clustered la tabella stessa è ordinata per la chiave (InnoDB, le tabelle rowid di SQLite); un indice non clustered è una struttura separata che punta alle righe. PostgreSQL usa tabelle heap con soli indici secondari.

## Approfondisci

- [SQLite — Query Language](https://www.sqlite.org/lang.html) · [Window functions](https://www.sqlite.org/windowfunctions.html)
- [PostgreSQL — Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [Use The Index, Luke](https://use-the-index-luke.com/) — indici spiegati per sviluppatori
