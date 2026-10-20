# Tabelle, righe, chiavi e relazioni

**Idea.** SQL descrive *quali dati* vuoi, lasciando al database la scelta di come recuperarli.
Una tabella rappresenta entità, una riga una istanza e una foreign key una relazione.

```sql
-- Esempi compatibili con SQLite, che useremo nel laboratorio
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  status TEXT NOT NULL DEFAULT 'pending'
);
```

**Perché importi in centesimi?** Per evitare errori di arrotondamento con floating point; in PostgreSQL puoi usare `NUMERIC(p,s)` per importi decimali.

**Normalizzazione:** non copiare nome/email cliente su ogni ordine: conserva `customer_id`, collegandolo alla tabella `customers`.

**Attenzione:** le differenze tra PostgreSQL, MySQL e SQLite contano (tipi, ID automatici, ALTER, date, clausole).
Qui i laboratori eseguibili usano SQLite; dove utile trovi note PostgreSQL.
