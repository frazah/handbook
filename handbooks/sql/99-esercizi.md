# SQL — Esercizi

1. Da `customers` e `orders` trova i 5 clienti per fatturato sugli ordini `paid`.
2. Mostra anche chi non ha ordini (LEFT JOIN + COALESCE).
3. Seleziona i clienti con almeno un ordine sopra 100 € usando EXISTS.
4. Classifica gli ordini per cliente con `ROW_NUMBER() OVER (...)`.
5. Crea un indice su `orders(customer_id, status)`, misura con `EXPLAIN QUERY PLAN`.

**Autovalutazione:** nessuna doppia aggregazione dovuta a JOIN; `UPDATE`/`DELETE` sempre col filtro adeguato.
