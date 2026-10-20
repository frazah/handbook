-- Report per cliente, inclusi quelli senza ordini pagati
SELECT c.name, COUNT(o.id) AS paid_orders, COALESCE(SUM(o.total_cents),0) AS total_cents
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status='paid'
GROUP BY c.id, c.name
ORDER BY total_cents DESC;

-- Classifica degli ordini per cliente
SELECT id, customer_id, total_cents,
       ROW_NUMBER() OVER(PARTITION BY customer_id ORDER BY total_cents DESC) AS rank
FROM orders;

-- Controlla piano di esecuzione
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id=1 AND status='paid';
