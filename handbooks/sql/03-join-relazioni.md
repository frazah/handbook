# JOIN e relazioni tra tabelle

**Obiettivo:** collegare clienti e ordini senza confondere `INNER JOIN`, `LEFT JOIN` e aggregazioni.

Supponiamo due tabelle: `customers(id, name)` e `orders(id, customer_id, total_cents)`.
Una riga di `customers` può corrispondere a più righe di `orders`: è una relazione **uno-a-molti (1:N)**.

## 1. INNER JOIN: mostra solo le corrispondenze

```sql
-- Alias: c indica customers, o indica orders.
SELECT
    o.id,
    c.name AS customer,
    o.total_cents
FROM orders AS o
JOIN customers AS c
    -- ON indica quali righe delle due tabelle sono collegate.
    ON c.id = o.customer_id;
```

Se un cliente ha tre ordini, compare in tre righe.
Se un cliente non ha ordini, **non appare** in questo risultato.

## 2. LEFT JOIN: conserva anche i clienti senza ordini

```sql
SELECT
    c.id,
    c.name,
    o.id AS order_id
FROM customers AS c
LEFT JOIN orders AS o
    ON o.customer_id = c.id;
```

La tabella **sinistra** è `customers`: tutti i suoi clienti compaiono.
Se non esiste un ordine associato, `order_id` sarà `NULL`.

## 3. Conta gli ordini per cliente

```sql
SELECT
    c.id,
    c.name,
    -- COUNT(o.id) ignora NULL: zero per chi non ha ordini.
    COUNT(o.id) AS order_count
FROM customers AS c
LEFT JOIN orders AS o
    ON o.customer_id = c.id
-- Una riga riassuntiva per ciascun cliente.
GROUP BY c.id, c.name;
```

`GROUP BY` raccoglie più righe unite in un gruppo e `COUNT` le riassume.
`COUNT(*)`, invece, conterebbe anche la riga del cliente senza ordini creata dalla LEFT JOIN e non è adatto qui.

**Attenzione — dove mettere il filtro:** una condizione `WHERE o.status = 'paid'` dopo la `LEFT JOIN` elimina i clienti senza ordini corrispondenti.
Se vuoi mantenere tutti i clienti, metti la condizione di stato nella clausola `ON`, non nel `WHERE`.
