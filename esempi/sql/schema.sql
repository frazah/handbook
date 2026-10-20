PRAGMA foreign_keys = ON;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customers;
CREATE TABLE customers (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  total_cents INTEGER NOT NULL CHECK(total_cents >= 0),
  status TEXT NOT NULL CHECK (status IN ('pending','paid','shipped'))
);
INSERT INTO customers VALUES (1,'Ada','ada@example.test'),(2,'Mario','mario@example.test'),(3,'Marta','marta@example.test');
INSERT INTO orders VALUES
  (10,1,12000,'paid'),(11,1,3500,'paid'),
  (12,2,5500,'pending'),(13,2,3200,'paid');
CREATE INDEX idx_orders_customer_status ON orders(customer_id,status);
