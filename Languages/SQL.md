# SQL — Cheatsheet (SQLite, note PostgreSQL)

> **Quando serve:** modellare database, leggere ordini, creare report e implementare API. Gli esempi usano un mini-schema e-commerce coerente: `customers` e `orders`. Gli importi sono **centesimi interi**: per denaro reale evita i floating point. In PostgreSQL puoi anche usare `NUMERIC(12,2)`.

## Sintassi al volo

| Esigenza | Comando | Nota |
|---|---|---|
| Selezione | `SELECT ... FROM ...` | righe/colonne |
| Filtro | `WHERE status = 'paid'` | prima del raggruppamento |
| Valori mancanti | `IS NULL` | `= NULL` non funziona |
| Ordinamento | `ORDER BY created_at DESC` | `ASC` crescente |
| Paginazione | `LIMIT 20 OFFSET 20` | per dataset grandi considera keyset pagination |
| Aggregazione | `COUNT(*)`, `SUM(total_cents)` | `COUNT(column)` ignora NULL |
| Join | `INNER JOIN`, `LEFT JOIN` | non eliminano automaticamente duplicati |
| Condizione su gruppi | `HAVING COUNT(*) > 1` | dopo `GROUP BY` |
| Valore di fallback | `COALESCE(value, 0)` | primo non NULL |
| Transazione | `BEGIN; ... COMMIT;` | `ROLLBACK` per annullare |

**Schema di riferimento — eseguilo prima delle query successive** (SQLite):

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TEXT NOT NULL  -- ISO 8601 in questa demo SQLite
);

INSERT OR IGNORE INTO customers (id, email) VALUES
  (1, 'ada@example.test'),
  (2, 'lin@example.test');

INSERT OR IGNORE INTO orders
  (id, customer_id, total_cents, status, created_at) VALUES
  (101, 1, 2599, 'paid', '2026-10-10T11:00:00Z'),
  (102, 1, 990, 'pending', '2026-10-11T12:00:00Z'),
  (103, 2, 1200, 'paid', '2026-10-12T09:30:00Z');
```

## Query che incontri nei progetti

### Ordini recenti e JOIN

```sql
-- Mostra gli ultimi ordini pagati, con email del cliente.
SELECT
  o.id,
  c.email,
  o.total_cents,
  o.created_at
FROM orders AS o
INNER JOIN customers AS c
  ON c.id = o.customer_id
WHERE o.status = 'paid'
ORDER BY o.created_at DESC
LIMIT 20;
```

`INNER JOIN` mantiene le righe con cliente corrispondente. `LEFT JOIN` è utile per un report **anche sui clienti senza ordini**:

```sql
SELECT
  c.id,
  c.email,
  COUNT(o.id) AS paid_orders,
  COALESCE(SUM(o.total_cents), 0) AS revenue_cents
FROM customers AS c
LEFT JOIN orders AS o
  ON o.customer_id = c.id
  AND o.status = 'paid' -- Sul JOIN: non esclude clienti senza ordini.
GROUP BY c.id, c.email
ORDER BY revenue_cents DESC;
```

**Attenzione:** spostare `o.status = 'paid'` da `ON` a `WHERE` farebbe sparire i clienti senza ordini pagati: un `LEFT JOIN` diventerebbe di fatto simile a un `INNER JOIN` per quel filtro. `COUNT(o.id)` evita di contare come ordine la riga prodotta dal LEFT JOIN quando non c'è corrispondenza.

### CTE e ranking

```sql
WITH customer_revenue AS (
  SELECT customer_id, SUM(total_cents) AS revenue_cents
  FROM orders
  WHERE status = 'paid'
  GROUP BY customer_id
)
SELECT
  customer_id,
  revenue_cents,
  ROW_NUMBER() OVER (ORDER BY revenue_cents DESC) AS revenue_rank
FROM customer_revenue;
```

La **CTE** (`WITH`) dà un nome a una query intermedia. `ROW_NUMBER()` è una *window function*: assegna un rango senza fondere tutte le righe del risultato finale. Per ranghi uguali guarda anche `RANK()` e `DENSE_RANK()`.

### Aggiornare dati in modo sicuro

```sql
-- Transazione: o si applicano tutte le operazioni, o si torna indietro.
BEGIN;

UPDATE orders
SET status = 'paid'
WHERE id = 102 AND status = 'pending';

-- Qui puoi controllare le righe interessate dalla tua applicazione.
COMMIT;

-- Indice utile per filtri frequenti per cliente + stato.
CREATE INDEX IF NOT EXISTS idx_orders_customer_status
ON orders(customer_id, status);
```

**Non concatenare input utente in SQL**: passa parametri tramite il driver (`?` con sqlite3 Python; placeholder specifici per altri driver). Un indice aiuta certe query ma aumenta costi di scrittura; verifica con `EXPLAIN QUERY PLAN` (SQLite) o `EXPLAIN ANALYZE` (PostgreSQL).

## Ottimizzazione query — leggere il piano, poi intervenire

**Scenario reale:** una pagina admin mostra gli ultimi ordini pagati. Ottimizzare non significa mettere indici dappertutto: prima misuri sul dataset e sui filtri realmente usati. Con le poche righe della demo un **table scan può essere la scelta migliore**; su dati grandi, selettività e distribuzione possono cambiare il piano.

```sql
-- Query esistente: filtro, ordinamento e limite sulla stessa tabella.
EXPLAIN QUERY PLAN
SELECT id, customer_id, total_cents, created_at
FROM orders
WHERE status = 'paid'
ORDER BY created_at DESC
LIMIT 20;

-- L'indice composito aiuta il DB a cercare lo status e a
-- percorrere in ordine created_at, evitando talvolta un sort separato.
CREATE INDEX IF NOT EXISTS idx_orders_status_date
ON orders(status, created_at DESC);

-- Rileggi il piano: cerca SEARCH USING INDEX contro SCAN,
-- e l'eventuale "USE TEMP B-TREE FOR ORDER BY".
EXPLAIN QUERY PLAN
SELECT id, customer_id, total_cents, created_at
FROM orders
WHERE status = 'paid'
ORDER BY created_at DESC
LIMIT 20;

-- Dopo grandi importazioni, aggiorna le statistiche del planner.
ANALYZE;
```

**Come ragiona il planner:** un indice B-tree permette ricerche e scansioni in ordine su specifiche colonne; un indice `(status, created_at)` è diverso da `(created_at, status)` perché conta l'**ordine del prefisso**. Gli indici occupano spazio e rallentano `INSERT`/`UPDATE`/`DELETE`; non crearli senza confrontare workload, spazio e piano.

```sql
-- Filtro poco favorevole a un normale indice su created_at:
-- applica una funzione alla colonna e ignora altri anni.
SELECT id
FROM orders
WHERE substr(created_at, 1, 10) = '2026-10-12';

-- Versione range: evita la funzione sulla colonna e si presta
-- a un indice su created_at (qui le date sono stringhe ISO UTC).
SELECT id
FROM orders
WHERE created_at >= '2026-10-12T00:00:00Z'
  AND created_at <  '2026-10-13T00:00:00Z';

-- Utile per questa seconda query e altre ricerche temporali.
CREATE INDEX IF NOT EXISTS idx_orders_created_at
ON orders(created_at);
```

**Pagination:** `OFFSET 20000` costringe spesso a scorrere molte righe da saltare. Se l'ordinamento è stabile, usa *keyset pagination* con `(created_at, id)` e l'ultima coppia letta, gestendo correttamente i pari timestamp. Qui l'ordine è discendente:

```sql
SELECT id, created_at, total_cents
FROM orders
WHERE status = 'paid'
  AND (created_at, id) < ('2026-10-12T09:30:00Z', 103)
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Indice coerente con filtro + ordinamento completo.
CREATE INDEX IF NOT EXISTS idx_orders_status_date_id
ON orders(status, created_at DESC, id DESC);

-- Se scegli questo indice più completo, il precedente può diventare ridondante:
-- verifica il workload, poi elimina quello sovrapposto.
DROP INDEX IF EXISTS idx_orders_status_date;
```

Il valore cursore qui è **esemplificativo**, ricavato dall'ultima riga della pagina precedente; in un'app si restituisce un token opaco e validato, non si concatena SQL dal client.

**Check pratico:** (1) individua la query lenta con metriche reali, (2) verifica se restituisce troppe righe/colonne o fa N+1 query, (3) leggi il piano, (4) confronta indici compositi, statistiche e filtri, (5) misura di nuovo con gli stessi dati. Preferisci parametri del driver a SQL concatenato.

**PostgreSQL:** `EXPLAIN (ANALYZE, BUFFERS) SELECT ...` mostra tempi e I/O **eseguendo davvero la SELECT**; non usarlo distrattamente su operazioni che modificano dati. Gli engine scelgono piani diversi; un indice non garantisce sempre un aumento di velocità. Approfondisci: [SQLite: EXPLAIN QUERY PLAN](https://sqlite.org/eqp.html), [SQLite: query planner](https://sqlite.org/queryplanner.html), [PostgreSQL: Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html).

### Schema e concorrenza da ricordare

**Normalizzazione:** separa entità distinte (`customers`, `orders`) per evitare duplicazioni e anomalie di aggiornamento; **denormalizza** solo quando hai motivi misurabili. Le foreign key mantengono l'integrità (in SQLite verifica `PRAGMA foreign_keys = ON` per ogni connessione). L'**isolamento** definisce quali modifiche di transazioni concorrenti possono essere osservate: conoscere *dirty read*, *non-repeatable read* e *phantom read* è utile ai colloqui; il comportamento effettivo varia per database/livello di isolamento. Un vincolo `UNIQUE` protegge dagli inserimenti concorrenti duplicati meglio di un semplice controllo applicativo.

## Da sapere nei colloqui

- **INNER vs LEFT JOIN:** solo corrispondenze vs tutte le righe a sinistra.
- **WHERE vs HAVING:** righe prima della GROUP BY vs gruppi già aggregati.
- **PK/FK/UNIQUE/CHECK:** integrità e relazioni a livello DB, non solo dell'app.
- **ACID e isolamento:** transazioni, anomalie di concorrenza e rollback.
- **N+1 query:** una query iniziale seguita da molte query correlate; spesso si risolve con JOIN, batching o eager loading.

**Approfondisci:** [PostgreSQL tutorial SQL](https://www.postgresql.org/docs/current/tutorial-sql.html), [SQLite foreign keys](https://www.sqlite.org/foreignkeys.html), [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html). Per uno script che unisce query e dati reali usa la [Recipe pandas + SQL](../Recipes/pandas%20%2B%20SQL.md).
