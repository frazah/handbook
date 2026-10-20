# INSERT, UPDATE, DELETE e transazioni

**Idea.** Le modifiche possono essere raggruppate in una transazione: o tutte, o nessuna (`COMMIT`/`ROLLBACK`).

**Prima di leggere il codice — simboli e termini:**

- ***Transazione***: gruppo di operazioni eseguite come unità logica, con commit o rollback.

## Prima del codice: cosa riconoscere

`UPDATE` e `DELETE` senza `WHERE` possono toccare tutte le righe. `BEGIN`, `COMMIT` e `ROLLBACK` controllano una transazione: prova prima la condizione con una `SELECT`.

```sql
-- La query elabora i dati senza ricorrere a cicli nel codice applicativo.
BEGIN TRANSACTION;

INSERT INTO customers(id, email, name)
VALUES (3, 'marta@example.test', 'Marta');

INSERT INTO orders(id, customer_id, total_cents, status)
VALUES (15, 3, 2599, 'paid');
COMMIT;

-- Verifica il WHERE prima di modificare o cancellare record.
UPDATE orders SET status = 'shipped'
WHERE id = 15 AND status = 'paid';

DELETE FROM orders WHERE id = 15;
```

**ACID:** atomicità, consistenza, isolamento, durabilità.  
L'effettiva concorrenza e i livelli d'isolamento dipendono dal DBMS.

**Sicurezza:** prima di `UPDATE` o `DELETE`, verifica la clausola `WHERE`; valuta i soft-delete quando hai requisiti di audit e retention.

**Errore comune:** `UPDATE orders SET status='shipped'` senza `WHERE` modifica *tutti* gli ordini.
