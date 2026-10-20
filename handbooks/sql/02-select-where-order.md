# SELECT, WHERE, ORDER BY e LIMIT

**Idea.** Una query SQL recupera colonne/righe filtrate; `WHERE` valuta ogni riga, `ORDER BY` ordina il risultato.

**Prima di leggere il codice — simboli e termini:**

- **`SELECT`**: sceglie le colonne da leggere nella query.

## Prima del codice: cosa riconoscere

`WHERE` filtra **righe** e `ORDER BY` ordina il risultato. `LIMIT` limita il numero di righe restituite; senza `ORDER BY` non hai un ordine garantito.

```sql
-- Seleziona le colonne richieste, senza modificare i dati.
SELECT id, name, email
FROM customers
WHERE name LIKE 'M%'
ORDER BY name ASC
LIMIT 10 OFFSET 0;

SELECT id, total_cents
FROM orders
WHERE status IN ('paid', 'shipped') AND total_cents >= 3000
ORDER BY total_cents DESC, id ASC;
```

## NULL non equivale a stringa vuota

```sql
-- Seleziona le colonne richieste, senza modificare i dati.
SELECT * FROM orders WHERE status IS NULL;     -- corretto
-- WHERE status = NULL è sbagliato: usa IS NULL
```

**Nota:** per ordinamenti riproducibili usa un tie-breaker (es. `id`).  
Su dataset grandi, `OFFSET` alto può costare: la paginazione keyset (`WHERE id > ?  
ORDER BY id`) spesso scala meglio.

**Errore comune:** mettere input dell'utente dentro stringhe SQL concatenate: usa **parametri bind** `?` o placeholder del driver, mai interpolazione diretta.
