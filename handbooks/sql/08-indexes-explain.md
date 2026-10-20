# Indici, query plan e performance

**Idea.** Un indice accelera molte letture selettive ma rallenta scritture e occupa spazio.
È utile per filtri, JOIN, talvolta ordinamenti; non è una cura universale.

**Prima di leggere il codice — simboli e termini:**

- **`SELECT`**: sceglie le colonne da leggere nella query.
- ***Indice***: struttura che può accelerare una ricerca, con costo di spazio e scritture.

## Prima del codice: cosa riconoscere

Un **indice** è una struttura di ricerca che accelera alcune letture ma richiede spazio e lavoro durante le scritture. `EXPLAIN` mostra il piano previsto: non significa che ogni indice verrà usato.

```sql
CREATE INDEX idx_orders_customer_status
ON orders(customer_id, status);

-- SQLite: spiega come eseguirebbe la query
EXPLAIN QUERY PLAN
-- Seleziona le colonne richieste, senza modificare i dati.
SELECT * FROM orders WHERE customer_id = 3 AND status = 'paid';
```

**Come analizzare:** (1) misurare una query lenta, (2) guardare `EXPLAIN`, (3) controllare filtro/ordine/cardinalità, (4) creare un indice mirato, (5) rimisurare.

**PostgreSQL:** `EXPLAIN (ANALYZE, BUFFERS) SELECT ...` esegue davvero la query e raccoglie tempi; attenzione con statement che modificano dati.

**Errore comune:** aggiungere indici su ogni colonna senza misurare.
Un indice composito `(a,b)` non equivale sempre a `(b,a)`.
