# Funzioni finestra

**Idea.** A differenza di `GROUP BY`, una *window function* restituisce valori calcolati mantenendo le singole righe.

**Prima di leggere il codice — simboli e termini:**

- **`SELECT`**: sceglie le colonne da leggere nella query.
- **`OVER (...)`**: definisce la finestra di righe considerata da una funzione analitica.

```sql
-- Ordini di ogni cliente dal più caro al meno caro
SELECT id, customer_id, total_cents,
       ROW_NUMBER() OVER (
         PARTITION BY customer_id
         ORDER BY total_cents DESC, id
       ) AS position
FROM orders;
```

```sql
-- Totale cumulativo per cliente
SELECT id, customer_id, total_cents,
       SUM(total_cents) OVER (
         PARTITION BY customer_id
         ORDER BY id
         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS running_total
FROM orders;
```

**Quando usarle:** dashboard, top N per categoria, report temporali, streak e classifiche. `ROW_NUMBER` assegna posizioni uniche; `RANK` può saltare posizioni in presenza di pari merito.

**Errore comune:** confondere `PARTITION BY` con creare nuove tabelle: partiziona *logicamente* le righe per il calcolo.
