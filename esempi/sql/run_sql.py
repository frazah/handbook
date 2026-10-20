"""Esegue schema e query usando solo sqlite3 di Python."""
from pathlib import Path
import sqlite3

root = Path(__file__).resolve().parent
with sqlite3.connect(':memory:') as conn:
    conn.executescript((root / 'schema.sql').read_text(encoding='utf-8'))
    # Ogni SELECT produce un proprio risultato per esplorazione.
    for sql in (root / 'queries.sql').read_text(encoding='utf-8').split(';'):
        if not sql.strip():
            continue
        cursor = conn.execute(sql)
        print('\n', cursor.description and [x[0] for x in cursor.description])
        print(*cursor.fetchall(), sep='\n')
