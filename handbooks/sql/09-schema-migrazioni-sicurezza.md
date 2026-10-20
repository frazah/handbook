# Vincoli, migrazioni e SQL sicuro

**Idea.** Le regole essenziali appartengono anche al database: `NOT NULL`, `UNIQUE`, `FOREIGN KEY`, `CHECK`, transazioni.
Una migrazione descrive una modifica ripetibile allo schema.

**Prima di leggere il codice — simboli e termini:**

- **`SELECT`**: sceglie le colonne da leggere nella query.
- **`WITH` (CTE)**: assegna un nome a una query intermedia usata dalla query principale.

## Prima del codice: cosa riconoscere

`UNIQUE`, `NOT NULL` e `FOREIGN KEY` sono vincoli del database, non semplici commenti. Una migrazione modifica lo schema in modo versionato; usa **query parametrizzate** per input esterni.

```sql
-- La query elabora i dati senza ricorrere a cicli nel codice applicativo.
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0)
);
```

```python
# Python sqlite3: parametri sicuri, non concatenare input utente
import sqlite3
with sqlite3.connect('store.sqlite') as conn:
    rows = conn.execute(
        'SELECT * FROM customers WHERE email = ?',
        ('marta@example.test',)
    ).fetchall()
```

**Migrazioni:** SQLite può avere limitazioni su alcune ALTER; PostgreSQL supporta più tipi/funzionalità (IDENTITY, JSONB, constraint avanzati).  
In progetti reali usa un tool come Alembic (Python) o il sistema del tuo framework, versionato nel repository.

**Errore comune:** mettere dati sensibili in query string/log o costruire SQL con `f"...{user_input}..."`.
I parametri sono la difesa principale contro SQL injection.
